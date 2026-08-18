// lib/features/ride/routing/osrm_routing_provider.dart
// Yalla VTC — OSRM (Open Source Routing Machine) Implementation
//
// Fetches real driving routes over OpenStreetMap road networks.
// OSRM API: https://router.project-osrm.org/route/v1/driving/
//
// DIAGNOSTIC MODE: Each routing call emits a full structured log block:
//
//   ┌─ YALLA ROUTING DIAGNOSTIC ──────────────────────────────────────
//   │  A raw:      31.5869, -8.0223
//   │  A snapped:  31.5870, -8.0220    (delta: 0.0003°, ~33m)
//   │  B raw:      31.6015, -8.0265
//   │  B snapped:  31.6017, -8.0262    (delta: 0.0003°, ~30m)
//   │  OSRM url:   https://router.project-osrm.org/route/v1/driving/...
//   │  distance:   2441.3 m  →  2.4 km
//   │  duration:   494.0 s   →  8 min
//   │  geometry pts: 87
//   └─────────────────────────────────────────────────────────────────

import 'dart:convert';
import 'dart:developer' as developer;
import 'dart:math';
import 'package:http/http.dart' as http;
import '../map/yalla_map_controller.dart';
import 'routing_provider.dart';
import 'routing_result.dart';

class OsrmRoutingProvider implements RoutingProvider {
  final http.Client _client;
  final String _baseUrl;

  OsrmRoutingProvider({
    http.Client? client,
    String? baseUrl,
  })  : _client = client ?? http.Client(),
        _baseUrl = baseUrl ?? 'https://router.project-osrm.org';

  // ── OSRM /nearest — snap any coord to closest drivable road ─────────────────

  Future<_SnapResult> _snapToNearestRoad(YallaLatLng raw, String label) async {
    final url = Uri.parse(
      '$_baseUrl/nearest/v1/driving/${raw.longitude},${raw.latitude}?number=1',
    );
    try {
      final response = await _client.get(url).timeout(const Duration(seconds: 4));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final waypoints = data['waypoints'] as List?;
        if (waypoints != null && waypoints.isNotEmpty) {
          final location = waypoints[0]['location'] as List;
          final snappedLng = (location[0] as num).toDouble();
          final snappedLat = (location[1] as num).toDouble();
          final snapped = YallaLatLng(snappedLat, snappedLng);
          final deltaM = _haversineMeters(raw, snapped);
          developer.log(
            '[$label] raw: ${raw.latitude}, ${raw.longitude}  →  '
            'snapped: ${snapped.latitude}, ${snapped.longitude}  '
            '(Δ ${deltaM.toStringAsFixed(0)} m)',
            name: 'YallaRouting',
          );
          return _SnapResult(snapped: snapped, deltaMeters: deltaM);
        }
      }
    } catch (e) {
      developer.log('[$label] /nearest failed: $e — using raw coord', name: 'YallaRouting');
    }
    developer.log(
      '[$label] /nearest returned no result — using raw: ${raw.latitude}, ${raw.longitude}',
      name: 'YallaRouting',
    );
    return _SnapResult(snapped: raw, deltaMeters: 0);
  }

  // ── Main route calculation ────────────────────────────────────────────────────

  @override
  Future<RoutingResult> getRoute({
    required YallaLatLng origin,
    required YallaLatLng destination,
  }) async {
    developer.log(
      '╔═ YALLA ROUTING DIAGNOSTIC ═══════════════════════════════════════',
      name: 'YallaRouting',
    );
    developer.log(
      '║  A raw:  ${origin.latitude}, ${origin.longitude}',
      name: 'YallaRouting',
    );
    developer.log(
      '║  B raw:  ${destination.latitude}, ${destination.longitude}',
      name: 'YallaRouting',
    );

    // Snap both endpoints to nearest drivable roads
    final snapA = await _snapToNearestRoad(origin, 'A');
    final snapB = await _snapToNearestRoad(destination, 'B');

    final snappedOrigin = snapA.snapped;
    final snappedDest   = snapB.snapped;

    developer.log(
      '║  A snapped: ${snappedOrigin.latitude}, ${snappedOrigin.longitude}  '
      '(Δ ${snapA.deltaMeters.toStringAsFixed(0)} m from raw)',
      name: 'YallaRouting',
    );
    developer.log(
      '║  B snapped: ${snappedDest.latitude}, ${snappedDest.longitude}  '
      '(Δ ${snapB.deltaMeters.toStringAsFixed(0)} m from raw)',
      name: 'YallaRouting',
    );

    // Build OSRM /route URL with snapped coords
    final routeUrl = Uri.parse(
      '$_baseUrl/route/v1/driving/'
      '${snappedOrigin.longitude},${snappedOrigin.latitude};'
      '${snappedDest.longitude},${snappedDest.latitude}'
      '?overview=full&geometries=geojson',
    );

    developer.log('║  OSRM url: $routeUrl', name: 'YallaRouting');

    try {
      final response = await _client.get(routeUrl).timeout(const Duration(seconds: 8));

      developer.log('║  HTTP status: ${response.statusCode}', name: 'YallaRouting');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final routes = data['routes'] as List?;

        if (routes != null && routes.isNotEmpty) {
          final firstRoute = routes[0];
          final distanceMeters = (firstRoute['distance'] as num).toDouble();
          final durationSeconds = (firstRoute['duration'] as num).toDouble();

          final geometry = firstRoute['geometry'];
          final coordinates = geometry['coordinates'] as List;

          final points = coordinates.map<YallaLatLng>((coord) {
            final lng = (coord[0] as num).toDouble();
            final lat = (coord[1] as num).toDouble();
            return YallaLatLng(lat, lng);
          }).toList();

          developer.log(
            '║  distance:      ${distanceMeters.toStringAsFixed(1)} m  →  '
            '${(distanceMeters / 1000.0).toStringAsFixed(2)} km',
            name: 'YallaRouting',
          );
          developer.log(
            '║  duration:      ${durationSeconds.toStringAsFixed(1)} s  →  '
            '${(durationSeconds / 60.0).toStringAsFixed(1)} min  '
            '(${(durationSeconds / 60.0).round()} min rounded)',
            name: 'YallaRouting',
          );
          developer.log(
            '║  geometry pts:  ${points.length}',
            name: 'YallaRouting',
          );
          developer.log(
            '╚══════════════════════════════════════════════════════════════════',
            name: 'YallaRouting',
          );

          if (points.isNotEmpty) {
            return RoutingResult(
              points: points,
              distanceMeters: distanceMeters,
              durationSeconds: durationSeconds,
            );
          }
        } else {
          developer.log(
            '║  OSRM returned no routes in response body.',
            name: 'YallaRouting',
          );
        }
      } else {
        developer.log(
          '║  OSRM error response: ${response.body}',
          name: 'YallaRouting',
        );
      }
    } catch (e) {
      developer.log('║  OSRM network exception: $e', name: 'YallaRouting');
    }

    developer.log(
      '║  → Falling back to haversine interpolated route.',
      name: 'YallaRouting',
    );
    developer.log(
      '╚══════════════════════════════════════════════════════════════════',
      name: 'YallaRouting',
    );

    // Fallback: straight-line interpolation with road factor
    return _buildFallbackResult(snappedOrigin, snappedDest);
  }

  // ── Haversine helpers ─────────────────────────────────────────────────────────

  /// Returns great-circle distance in **metres** between two points.
  static double _haversineMeters(YallaLatLng a, YallaLatLng b) {
    const double R = 6371000.0; // Earth radius in metres
    final dLat = (b.latitude - a.latitude) * pi / 180.0;
    final dLng = (b.longitude - a.longitude) * pi / 180.0;
    final sinLat = sin(dLat / 2);
    final sinLng = sin(dLng / 2);
    final h = sinLat * sinLat +
        cos(a.latitude * pi / 180.0) *
            cos(b.latitude * pi / 180.0) *
            sinLng * sinLng;
    return 2 * R * atan2(sqrt(h), sqrt(1 - h));
  }

  RoutingResult _buildFallbackResult(YallaLatLng origin, YallaLatLng destination) {
    final straightMeters = _haversineMeters(origin, destination);
    // Road factor multiplier (~1.3× straight line) typical for urban Morocco
    final roadDistanceMeters = straightMeters * 1.3;
    // Assume 30 km/h avg urban speed
    final estimatedSeconds = (roadDistanceMeters / 1000.0) * 120.0;

    final points = <YallaLatLng>[];
    const int steps = 6;
    for (int i = 0; i <= steps; i++) {
      final fraction = i / steps;
      final lat = origin.latitude + (destination.latitude - origin.latitude) * fraction;
      final lng = origin.longitude + (destination.longitude - origin.longitude) * fraction;
      points.add(YallaLatLng(lat, lng));
    }

    developer.log(
      '[Fallback] straight: ${straightMeters.toStringAsFixed(0)} m  '
      '→ road est: ${roadDistanceMeters.toStringAsFixed(0)} m  '
      '/ ${(estimatedSeconds / 60).toStringAsFixed(1)} min',
      name: 'YallaRouting',
    );

    return RoutingResult(
      points: points,
      distanceMeters: roadDistanceMeters,
      durationSeconds: estimatedSeconds,
    );
  }
}

// ── Private helpers ───────────────────────────────────────────────────────────

class _SnapResult {
  final YallaLatLng snapped;
  final double deltaMeters;
  const _SnapResult({required this.snapped, required this.deltaMeters});
}
