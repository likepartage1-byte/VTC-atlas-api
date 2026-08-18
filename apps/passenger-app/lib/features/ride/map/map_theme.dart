// lib/features/ride/map/map_theme.dart
// Yalla VTC — Map Visual Theme
//
// All marker colours and route styles live here.
// Rebrand Yalla VTC? Change this file only — no widget is touched.

import 'yalla_map_controller.dart';

class MapTheme {
  MapTheme._();

  // ── Brand colours ──────────────────────────────────────────────────────────

  static const String _yallaGold = '#E5B80B';
  static const String _pickupGreen = '#22C55E';
  static const String _destRed = '#EF4444';
  static const String _driverBlue = '#3B82F6';
  static const String _white = '#FFFFFF';

  // ── Marker styles ──────────────────────────────────────────────────────────

  /// A — Pickup point (green)
  static const YallaMarkerStyle pickup = YallaMarkerStyle(
    color: _pickupGreen,
    radius: 11,
    borderColor: _white,
    borderWidth: 2.5,
  );

  /// B — Destination (red)
  static const YallaMarkerStyle destination = YallaMarkerStyle(
    color: _destRed,
    radius: 11,
    borderColor: _white,
    borderWidth: 2.5,
  );

  /// Live driver position (blue)
  static const YallaMarkerStyle driver = YallaMarkerStyle(
    color: _driverBlue,
    radius: 11,
    borderColor: _white,
    borderWidth: 2.5,
  );

  /// Current user GPS position — glowing blue GPS dot (inner circle)
  /// The outer glow ring is drawn automatically by MapLibreControllerImpl.
  static const YallaMarkerStyle user = YallaMarkerStyle(
    color: '#2563EB',   // GPS blue — matches navigation app convention
    radius: 8,
    borderColor: _white,
    borderWidth: 2.5,
  );

  // ── Route styles ───────────────────────────────────────────────────────────

  /// Active A→B route line — Yalla Gold
  static const YallaRouteStyle activeRoute = YallaRouteStyle(
    color: _yallaGold,
    width: 6.0,
    opacity: 0.95,
  );
}
