// lib/features/ride/map/yalla_map_controller.dart
// Yalla VTC — Abstract Map Controller
//
// This interface knows NOTHING about rides, pickups, destinations, or drivers.
// It is a pure map-manipulation contract.
// Business semantics (pickup = green, driver = blue) live in YallaMapView.
//
// HomePage imports only: YallaLatLng + YallaMapController
// No vendor SDK type ever crosses this boundary.

/// Vendor-agnostic coordinate pair.
/// Keeps every caller free of maplibre_gl / google_maps_flutter imports.
class YallaLatLng {
  final double latitude;
  final double longitude;
  const YallaLatLng(this.latitude, this.longitude);

  @override
  String toString() => 'YallaLatLng($latitude, $longitude)';
}

/// Marker visual style — vendor-agnostic.
class YallaMarkerStyle {
  final String color;      // CSS hex e.g. '#22C55E'
  final double radius;     // circle radius in screen points
  final String borderColor;
  final double borderWidth;

  const YallaMarkerStyle({
    required this.color,
    this.radius = 11.0,
    this.borderColor = '#FFFFFF',
    this.borderWidth = 2.5,
  });

  // Preset styles ─────────────────────────────────────────────────────────────
  static const pickup = YallaMarkerStyle(color: '#22C55E');       // Green
  static const destination = YallaMarkerStyle(color: '#EF4444');  // Red
  static const driver = YallaMarkerStyle(color: '#3B82F6');       // Blue
  static const user = YallaMarkerStyle(color: '#E5B80B');         // Gold
}

/// Route line style — vendor-agnostic.
class YallaRouteStyle {
  final String color;
  final double width;
  final double opacity;

  const YallaRouteStyle({
    this.color = '#E5B80B',   // Yalla Gold
    this.width = 4.5,
    this.opacity = 0.9,
  });

  static const yallaGold = YallaRouteStyle();
}

/// Pure map-manipulation contract.
/// Implementations: MapLibreControllerImpl, GoogleControllerImpl, etc.
abstract class YallaMapController {

  // ── Camera ─────────────────────────────────────────────────────────────────

  /// Animate camera to [lat]/[lng] at [zoom].
  Future<void> animateToLocation(double lat, double lng, {double zoom = 15.5});

  /// Animate camera to show both origin and destination with [padding].
  Future<void> fitBounds({
    required double originLat,
    required double originLng,
    required double destLat,
    required double destLng,
    double padding = 80.0,
    double bottomPadding = 320.0,
  });

  // ── Markers ─────────────────────────────────────────────────────────────────

  /// Add or update a marker identified by [id].
  Future<void> setMarker(
    String id,
    double lat,
    double lng,
    YallaMarkerStyle style, {
    double bearing = 0,
  });

  /// Remove the marker with [id] if it exists.
  Future<void> removeMarker(String id);

  /// Remove all markers from the map.
  Future<void> clearMarkers();

  // ── Routes ──────────────────────────────────────────────────────────────────

  /// Draw or replace the active route polyline with real road geometry points.
  Future<void> drawRoute(
    List<YallaLatLng> points, {
    YallaRouteStyle style = const YallaRouteStyle(),
  });

  /// Remove the active route polyline.
  Future<void> clearRoute();

  // ── Composite ───────────────────────────────────────────────────────────────

  /// Remove all markers AND the route in one call.
  Future<void> clearOverlays();

  // ── Lifecycle ───────────────────────────────────────────────────────────────

  /// Release any SDK resources. Called when the map widget is disposed.
  void dispose();
}

// ── Marker ID constants — used by YallaMapView ─────────────────────────────
class YallaMarkerId {
  YallaMarkerId._();
  static const String pickup = 'pickup_a';
  static const String destination = 'dest_b';
  static const String driver = 'driver';
  static const String user = 'user';
}
