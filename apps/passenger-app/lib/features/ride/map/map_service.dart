// lib/features/ride/map/map_service.dart
// Yalla VTC — Map Service (Semantic Orchestration Layer)
//
// Sits between HomePage and YallaMapController.
// Translates high-level ride intents into generic map operations.
//
//   HomePage
//       │  speaks ride language: centerOnUser(), showDriver(), zoomToRide()
//       ▼
//   MapService
//       │  speaks map language: setMarker(), drawRoute(), animateToLocation()
//       ▼
//   YallaMapController  (abstract)
//       │
//       ▼
//   MapLibreControllerImpl  (concrete)
//
// HomePage never calls animateCamera, addCircle, or any map primitive directly.

import 'yalla_map_controller.dart';
import 'map_theme.dart';
import 'map_config.dart';

class MapService {
  YallaMapController? _ctrl;

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  /// Called by YallaMapView once the map style is loaded.
  void attachController(YallaMapController ctrl) {
    _ctrl = ctrl;
  }

  /// Called when the map widget is disposed.
  void detach() {
    _ctrl?.dispose();
    _ctrl = null;
  }

  bool get isReady => _ctrl != null;

  // ── Camera ────────────────────────────────────────────────────────────────

  /// Move camera to the user's current GPS position.
  Future<void> centerOnUser(double lat, double lng) async {
    await _ctrl?.animateToLocation(lat, lng, zoom: MapConfig.rideZoom);
  }

  /// Move camera to any arbitrary point.
  Future<void> centerOn(double lat, double lng, {double? zoom}) async {
    await _ctrl?.animateToLocation(
      lat, lng, zoom: zoom ?? MapConfig.defaultZoom,
    );
  }

  /// Fit camera to show both pickup A and destination B with bottom inset.
  Future<void> zoomToRide({
    required double pickupLat, required double pickupLng,
    required double destLat, required double destLng,
    double bottomInset = 320.0,
  }) async {
    await _ctrl?.fitBounds(
      originLat: pickupLat, originLng: pickupLng,
      destLat: destLat, destLng: destLng,
      padding: MapConfig.fitBoundsPadding,
      bottomPadding: bottomInset,
    );
  }

  // ── Pickup & Destination ──────────────────────────────────────────────────

  /// Place / update the pickup A marker and move camera to it.
  Future<void> setPickup(double lat, double lng) async {
    await _ctrl?.setMarker(
      YallaMarkerId.pickup, lat, lng, MapTheme.pickup,
    );
  }

  /// Place / update the destination B marker and draw A→B route.
  Future<void> setDestination({
    required double pickupLat, required double pickupLng,
    required double destLat, required double destLng,
    List<YallaLatLng> routePoints = const [],
  }) async {
    await _ctrl?.setMarker(
      YallaMarkerId.destination, destLat, destLng, MapTheme.destination,
    );
    if (routePoints.isNotEmpty) {
      await _ctrl?.drawRoute(routePoints, style: MapTheme.activeRoute);
    }
  }

  /// Draw polyline from road geometry points.
  Future<void> drawRoute(List<YallaLatLng> points) async {
    await _ctrl?.drawRoute(points, style: MapTheme.activeRoute);
  }

  // ── Driver ────────────────────────────────────────────────────────────────

  /// Place / update the live driver marker.
  Future<void> showDriver(double lat, double lng, {double bearing = 0}) async {
    await _ctrl?.setMarker(
      YallaMarkerId.driver, lat, lng, MapTheme.driver,
      bearing: bearing,
    );
  }

  /// Remove the driver marker (e.g. ride completed).
  Future<void> hideDriver() async {
    await _ctrl?.removeMarker(YallaMarkerId.driver);
  }

  // ── Route ─────────────────────────────────────────────────────────────────

  /// Remove the route polyline (e.g. when ride is cancelled).
  Future<void> clearRoute() async {
    await _ctrl?.clearRoute();
  }

  // ── Full reset ────────────────────────────────────────────────────────────

  /// Clear all markers and routes (e.g. on logout or ride reset).
  Future<void> clearAll() async {
    await _ctrl?.clearOverlays();
  }
}
