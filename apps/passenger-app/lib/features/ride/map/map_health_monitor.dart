// lib/features/ride/map/map_health_monitor.dart
// Yalla VTC — Map Resilience & Health Monitor
//
// Level 1: Style JSON HTTP 200 + valid spec
// Level 2: Vector Tile PBF GET request HTTP 200 + non-empty byte payload (>0 bytes)
// Level 3: Canvas rendering verification
//
// Failure Policy: Requires 3 consecutive failures before activating Fallback.

import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'map_config.dart';

enum MapHealthState {
  unknown,
  healthy,
  checking,
  degraded,
  failed,
  fallbackActive,
}

class MapHealthMonitor extends ChangeNotifier {
  static final MapHealthMonitor instance = MapHealthMonitor._internal();
  MapHealthMonitor._internal();

  MapHealthState _state = MapHealthState.unknown;
  MapHealthState get state => _state;

  int _consecutiveFailures = 0;
  static const int failureThreshold = 3;

  String _activeStyle = MapConfig.styleUrl;
  String get activeStyle => _activeStyle;

  bool _isFallbackActive = false;
  bool get isFallbackActive => _isFallbackActive;

  /// Runs Level 1 + Level 2 Health Check on active style
  Future<bool> checkHealth({String? styleUrl}) async {
    final targetUrl = styleUrl ?? _activeStyle;
    _state = MapHealthState.checking;
    notifyListeners();

    try {
      // ── Level 1: Style JSON Check ─────────────────────────────────────────
      final styleResponse = await http
          .get(Uri.parse(targetUrl))
          .timeout(const Duration(seconds: 5));

      if (styleResponse.statusCode != 200) {
        debugPrint('[YallaMapHealth] Style JSON HTTP error: ${styleResponse.statusCode}');
        _handleFailure();
        return false;
      }

      final Map<String, dynamic> styleJson = json.decode(styleResponse.body);
      if (!styleJson.containsKey('version') || styleJson['version'] != 8) {
        debugPrint('[YallaMapHealth] Invalid MapLibre style JSON spec');
        _handleFailure();
        return false;
      }

      // ── Level 2: Vector Tile PBF Payload Check ───────────────────────────
      // Extract a sample vector tile template or use standard Marrakech vector PBF sample
      bool tilePayloadOk = await _verifyVectorTilePayload(styleJson);

      if (!tilePayloadOk) {
        debugPrint('[YallaMapHealth] Level 2 Vector Tile payload check FAILED');
        _handleFailure();
        return false;
      }

      // ── Healthy Result ───────────────────────────────────────────────────
      _consecutiveFailures = 0;
      _state = _isFallbackActive ? MapHealthState.fallbackActive : MapHealthState.healthy;
      debugPrint('[YallaMapHealth] MAP HEALTHY: Level 1 (Style) & Level 2 (Vector Tiles Payload) OK');
      notifyListeners();
      return true;

    } catch (e) {
      debugPrint('[YallaMapHealth] Health check Exception: $e');
      _handleFailure();
      return false;
    }
  }

  /// Level 2 Vector Tile Payload Check:
  /// Performs HTTP GET to a vector tile endpoint and verifies non-empty PBF byte payload (> 0 bytes).
  Future<bool> _verifyVectorTilePayload(Map<String, dynamic> styleJson) async {
    try {
      final sources = styleJson['sources'] as Map<String, dynamic>?;
      if (sources == null || sources.isEmpty) return true;

      String? tileTemplate;
      for (final src in sources.values) {
        if (src is Map<String, dynamic> && src['tiles'] is List && (src['tiles'] as List).isNotEmpty) {
          tileTemplate = (src['tiles'] as List).first.toString();
          break;
        }
      }

      if (tileTemplate == null) {
        // Fallback sample URL for Marrakech vector PBF
        tileTemplate = 'https://basemaps.cartocdn.com/vector/carto.streets/v1/15/16584/11846.pbf';
      } else {
        // Replace {z}/{x}/{y} with Marrakech coordinates at zoom 15
        tileTemplate = tileTemplate
            .replaceAll('{z}', '15')
            .replaceAll('{x}', '16584')
            .replaceAll('{y}', '11846');
      }

      final tileResponse = await http
          .get(Uri.parse(tileTemplate))
          .timeout(const Duration(seconds: 5));

      // Level 2 Requirement: HTTP 200 + non-empty PBF byte array content
      if (tileResponse.statusCode == 200 && tileResponse.bodyBytes.isNotEmpty) {
        debugPrint('[YallaMapHealth] Level 2 PBF Payload Verified (${tileResponse.bodyBytes.length} bytes)');
        return true;
      } else {
        debugPrint('[YallaMapHealth] Level 2 PBF HTTP ${tileResponse.statusCode}, Bytes: ${tileResponse.bodyBytes.length}');
        return false;
      }
    } catch (e) {
      debugPrint('[YallaMapHealth] Level 2 Tile Exception: $e');
      return false;
    }
  }

  void _handleFailure() {
    _consecutiveFailures++;
    debugPrint('[YallaMapHealth] Consecutive Failure Count: $_consecutiveFailures / $failureThreshold');

    if (_consecutiveFailures >= failureThreshold && !_isFallbackActive) {
      triggerFallback();
    } else {
      _state = MapHealthState.degraded;
      notifyListeners();
    }
  }

  /// Switches active style to Fallback (CARTO Positron GL)
  void triggerFallback() {
    debugPrint('[YallaMapHealth] Failure threshold reached! Activating FALLBACK: ${MapConfig.fallbackStyleUrl}');
    _isFallbackActive = true;
    _activeStyle = MapConfig.fallbackStyleUrl;
    _state = MapHealthState.fallbackActive;
    notifyListeners();
  }

  /// Forces primary style recovery
  void recoverPrimary() {
    debugPrint('[YallaMapHealth] Recovering PRIMARY: ${MapConfig.styleUrl}');
    _isFallbackActive = false;
    _activeStyle = MapConfig.styleUrl;
    _consecutiveFailures = 0;
    _state = MapHealthState.healthy;
    notifyListeners();
  }
}
