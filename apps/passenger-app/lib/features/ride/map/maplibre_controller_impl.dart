// lib/features/ride/map/maplibre_controller_impl.dart
// Yalla VTC — MapLibre GL implementation of YallaMapController
//
// Responsibility: raw map operations ONLY.
//   ✅ move camera, add/remove circle, draw line, clear
//   ❌ does NOT know about pickup, destination, driver, ride
//
// All MapLibre SDK types are confined to this file.
// Business semantics live in YallaMapView._paintOverlays.

import 'package:maplibre_gl/maplibre_gl.dart';
import 'yalla_map_controller.dart';

/// Marker ID prefix for the glowing user location — two circles per marker.
const String _kGlowSuffix = '_glow';

class MapLibreControllerImpl implements YallaMapController {
  final MapLibreMapController _ctrl;

  // Circle registry — keyed by marker id for idempotent updates
  final Map<String, Circle> _circles = {};

  // Active route line
  Line? _routeLine;

  MapLibreControllerImpl(this._ctrl);

  // ── Camera ──────────────────────────────────────────────────────────────────

  @override
  Future<void> animateToLocation(double lat, double lng,
      {double zoom = 15.5}) async {
    await _ctrl.animateCamera(
      CameraUpdate.newCameraPosition(
        CameraPosition(target: LatLng(lat, lng), zoom: zoom),
      ),
    );
  }

  @override
  Future<void> fitBounds({
    required double originLat,
    required double originLng,
    required double destLat,
    required double destLng,
    double padding = 80.0,
    double bottomPadding = 320.0,
  }) async {
    final sw = LatLng(
      originLat < destLat ? originLat : destLat,
      originLng < destLng ? originLng : destLng,
    );
    final ne = LatLng(
      originLat > destLat ? originLat : destLat,
      originLng > destLng ? originLng : destLng,
    );
    await _ctrl.animateCamera(
      CameraUpdate.newLatLngBounds(
        LatLngBounds(southwest: sw, northeast: ne),
        left: padding, top: padding, right: padding, bottom: bottomPadding,
      ),
    );
  }

  // ── Markers ─────────────────────────────────────────────────────────────────

  @override
  Future<void> setMarker(
    String id,
    double lat,
    double lng,
    YallaMarkerStyle style, {
    double bearing = 0,
  }) async {
    // If this is the user marker, render as a professional glowing GPS indicator
    if (id == YallaMarkerId.user) {
      await _setGlowingUserMarker(id, lat, lng, style);
      return;
    }

    // Standard single-circle marker for all other ids
    final existing = _circles[id];
    if (existing != null) {
      await _ctrl.removeCircle(existing);
    }

    final circle = await _ctrl.addCircle(
      CircleOptions(
        geometry: LatLng(lat, lng),
        circleRadius: style.radius,
        circleColor: style.color,
        circleStrokeWidth: style.borderWidth,
        circleStrokeColor: style.borderColor,
      ),
    );
    _circles[id] = circle;
  }

  /// Renders a professional GPS location dot with a glow ring:
  ///
  ///   Layer 1 (glow)  — large semi-transparent circle, same colour as inner dot
  ///   Layer 2 (inner) — small solid circle with white border
  ///
  /// This gives the "pulsing" look without animations while remaining crisp.
  Future<void> _setGlowingUserMarker(
    String id,
    double lat,
    double lng,
    YallaMarkerStyle style,
  ) async {
    final glowId = id + _kGlowSuffix;

    // Remove old circles if they exist
    final existingGlow = _circles[glowId];
    if (existingGlow != null) await _ctrl.removeCircle(existingGlow);

    final existingInner = _circles[id];
    if (existingInner != null) await _ctrl.removeCircle(existingInner);

    final pos = LatLng(lat, lng);

    // Layer 1: outer glow ring — large, transparent, same hue as inner dot
    // Uses the pickup green colour for the glow (#22C55E at 25% opacity)
    final glowCircle = await _ctrl.addCircle(
      CircleOptions(
        geometry: pos,
        circleRadius: style.radius * 3.2,     // ~3× the inner dot size
        circleColor: style.color,
        circleOpacity: 0.18,                   // very transparent halo
        circleStrokeWidth: 1.6,
        circleStrokeColor: style.color,
        circleStrokeOpacity: 0.28,
      ),
    );
    _circles[glowId] = glowCircle;

    // Layer 2: inner solid dot — precise GPS point
    final innerCircle = await _ctrl.addCircle(
      CircleOptions(
        geometry: pos,
        circleRadius: style.radius,
        circleColor: style.color,
        circleOpacity: 1.0,
        circleStrokeWidth: style.borderWidth,
        circleStrokeColor: style.borderColor,
        circleStrokeOpacity: 1.0,
      ),
    );
    _circles[id] = innerCircle;
  }

  @override
  Future<void> removeMarker(String id) async {
    // Also remove the glow layer if it exists
    final glowId = id + _kGlowSuffix;
    final glowCircle = _circles.remove(glowId);
    if (glowCircle != null) await _ctrl.removeCircle(glowCircle);

    final circle = _circles.remove(id);
    if (circle != null) {
      await _ctrl.removeCircle(circle);
    }
  }

  @override
  Future<void> clearMarkers() async {
    for (final circle in _circles.values) {
      await _ctrl.removeCircle(circle);
    }
    _circles.clear();
  }

  // ── Route ────────────────────────────────────────────────────────────────────

  @override
  Future<void> drawRoute(
    List<YallaLatLng> points, {
    YallaRouteStyle style = const YallaRouteStyle(),
  }) async {
    await clearRoute();
    if (points.isEmpty) return;

    final latLngs = points.map((p) => LatLng(p.latitude, p.longitude)).toList();
    _routeLine = await _ctrl.addLine(
      LineOptions(
        geometry: latLngs,
        lineColor: style.color,
        lineWidth: style.width,
        lineOpacity: style.opacity,
      ),
    );
  }

  @override
  Future<void> clearRoute() async {
    if (_routeLine != null) {
      await _ctrl.removeLine(_routeLine!);
      _routeLine = null;
    }
  }

  // ── Composite ────────────────────────────────────────────────────────────────

  @override
  Future<void> clearOverlays() async {
    await clearMarkers();
    await clearRoute();
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────────

  @override
  void dispose() {
    // MapLibreMapController is managed by the Flutter widget tree.
    // No manual disposal needed — but hook is available for future cleanup.
    _circles.clear();
    _routeLine = null;
  }
}
