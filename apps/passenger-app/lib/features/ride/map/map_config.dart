// lib/features/ride/map/map_config.dart
// Yalla VTC — Centralised Map Configuration
//
// Style URL is loaded from .env at app startup via dotenv.
// Change MAP_STYLE_URL in .env to switch tile provider globally —
// zero code change, zero rebuild needed (in release you redeploy .env only).

import 'package:flutter_dotenv/flutter_dotenv.dart';

class MapConfig {
  MapConfig._();

  // ── Style / Tiles ──────────────────────────────────────────────────────────

  /// Reads MAP_STYLE_URL from .env.
  static String get styleUrl =>
      dotenv.env['MAP_STYLE_URL'] ??
      'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';

  /// Reads MAP_FALLBACK_STYLE_URL from .env.
  static String get fallbackStyleUrl =>
      dotenv.env['MAP_FALLBACK_STYLE_URL'] ??
      'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

  // ── Camera defaults ────────────────────────────────────────────────────────

  /// Default centre when GPS is unavailable — Marrakech city centre.
  static const double defaultLat = 31.6295;
  static const double defaultLng = -7.9811;
  static const double defaultZoom = 15.0;
  static const double rideZoom = 15.5;
  static const double fitBoundsPadding = 80.0;

  // ── Attribution ────────────────────────────────────────────────────────────

  /// Displayed on every map view (ODbL mandatory).
  static const String attribution = '© OpenStreetMap contributors';
}
