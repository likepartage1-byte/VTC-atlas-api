// lib/features/ride/presentation/widgets/yalla_map_view.dart
// Yalla VTC — Map View Widget
//
// This widget owns the SEMANTIC layer:
//   "pickup marker" = green circle at A
//   "destination marker" = red circle at B
//   "driver marker" = blue circle
//
// The YallaMapController below knows NONE of this — it only adds/removes
// generic circles and lines. Business meaning lives here.
//
// Attribution: © OpenStreetMap contributors (ODbL mandatory)

import 'package:flutter/material.dart';
import 'package:maplibre_gl/maplibre_gl.dart';
import '../../../ride/map/map_config.dart';
import '../../../ride/map/map_health_monitor.dart';
import '../../../ride/map/map_provider.dart';
import '../../../ride/map/map_theme.dart';
import '../../../ride/map/yalla_map_controller.dart';
import '../../bloc/ride_state.dart';

class YallaMapView extends StatefulWidget {
  final YallaLatLng currentLocation;
  final YallaLatLng? pickupLocation;
  final YallaLatLng? destLocation;
  final RideState rideState;
  final String currentLang;

  /// Fired once the map style is loaded — provides a [YallaMapController].
  /// The caller (HomePage) stores this and uses it for camera control.
  /// It never sees any MapLibre type.
  final ValueChanged<YallaMapController> onControllerReady;

  const YallaMapView({
    super.key,
    required this.currentLocation,
    this.pickupLocation,
    this.destLocation,
    required this.rideState,
    required this.currentLang,
    required this.onControllerReady,
  });

  @override
  State<YallaMapView> createState() => _YallaMapViewState();
}

class _YallaMapViewState extends State<YallaMapView> {
  MapLibreMapController? _rawCtrl;
  YallaMapController? _yallaCtrl;

  @override
  void initState() {
    super.initState();
    MapHealthMonitor.instance.addListener(_onHealthStateChanged);
    MapHealthMonitor.instance.checkHealth();
  }

  void _onHealthStateChanged() {
    if (mounted) {
      setState(() {});
    }
  }

  // Convert YallaLatLng → MapLibre LatLng (only this file converts)
  LatLng _ll(YallaLatLng p) => LatLng(p.latitude, p.longitude);

  // ── Map lifecycle ─────────────────────────────────────────────────────────

  void _onMapCreated(MapLibreMapController ctrl) {
    _rawCtrl = ctrl;
    // Do NOT call any overlay method here — style not loaded yet
  }

  /// Safe point: style + tiles ready. Create controller and paint initial overlays.
  Future<void> _onStyleLoaded() async {
    final raw = _rawCtrl;
    if (raw == null) return;

    final ctrl = MapProvider.createController(raw);
    _yallaCtrl = ctrl;
    widget.onControllerReady(ctrl);

    await _paintOverlays(ctrl);
  }

  @override
  void didUpdateWidget(YallaMapView oldWidget) {
    super.didUpdateWidget(oldWidget);
    final ctrl = _yallaCtrl;
    if (ctrl == null) return;
    if (oldWidget.pickupLocation != widget.pickupLocation ||
        oldWidget.destLocation != widget.destLocation ||
        oldWidget.rideState != widget.rideState) {
      _paintOverlays(ctrl);
    }
  }

  @override
  void dispose() {
    MapHealthMonitor.instance.removeListener(_onHealthStateChanged);
    _yallaCtrl?.dispose();
    super.dispose();
  }

  // ── Semantic layer: business meaning lives HERE, not in the controller ─────

  Future<void> _paintOverlays(YallaMapController ctrl) async {
    await ctrl.clearOverlays();

    final activePickup = widget.pickupLocation ?? widget.currentLocation;

    // ── User GPS Glowing Dot ────────────────────────────────────────────────
    // Always placed at the real GPS position (widget.currentLocation).
    // Rendered as a professional two-layer glow indicator by
    // MapLibreControllerImpl._setGlowingUserMarker.
    await ctrl.setMarker(
      YallaMarkerId.user,
      widget.currentLocation.latitude,
      widget.currentLocation.longitude,
      MapTheme.user,
    );

    // A — Pickup point (shown only when user has explicitly set a pickup
    //     different from their current GPS position)
    final hasPickupOverride = widget.pickupLocation != null &&
        (widget.pickupLocation!.latitude != widget.currentLocation.latitude ||
         widget.pickupLocation!.longitude != widget.currentLocation.longitude);

    if (hasPickupOverride) {
      await ctrl.setMarker(
        YallaMarkerId.pickup,
        activePickup.latitude,
        activePickup.longitude,
        MapTheme.pickup,
      );
    }

    // B — Destination + route line (colours from MapTheme)
    if (widget.destLocation != null) {
      final d = widget.destLocation!;
      await ctrl.setMarker(
        YallaMarkerId.destination,
        d.latitude,
        d.longitude,
        MapTheme.destination,
      );

      List<YallaLatLng> points = [];
      final state = widget.rideState;
      if (state is RideDestinationSelected) {
        points = state.routePoints;
      } else if (state is RideSearchingDriver) {
        points = state.routePoints;
      }

      if (points.isEmpty) {
        points = [activePickup, d];
      }

      await ctrl.drawRoute(points, style: MapTheme.activeRoute);
    }

    // Driver (colour from MapTheme) — when ride is accepted or active
    final state = widget.rideState;
    if (state is RideDriverAccepted && state.driverLat != null) {
      await ctrl.setMarker(
        YallaMarkerId.driver,
        state.driverLat!, state.driverLng!,
        MapTheme.driver,
        bearing: state.driverBearing ?? 0,
      );
    } else if (state is RideActive && state.driverLat != null) {
      await ctrl.setMarker(
        YallaMarkerId.driver,
        state.driverLat!, state.driverLng!,
        MapTheme.driver,
        bearing: state.driverBearing ?? 0,
      );
    }
  }

  // ── Build ─────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // 1. MapLibre full-screen map — style from MapHealthMonitor
        MapLibreMap(
          styleString: MapHealthMonitor.instance.activeStyle,
          initialCameraPosition: CameraPosition(
            target: _ll(widget.currentLocation),
            zoom: MapConfig.defaultZoom,
          ),
          onMapCreated: _onMapCreated,
          onStyleLoadedCallback: _onStyleLoaded,
          // Disabled: we render our own GlowingUserLocation marker via
          // YallaMarkerId.user so we have full control over the visual style.
          myLocationEnabled: false,
          myLocationRenderMode: MyLocationRenderMode.normal,
          myLocationTrackingMode: MyLocationTrackingMode.none,
          compassEnabled: false,
          zoomGesturesEnabled: true,
          scrollGesturesEnabled: true,
          rotateGesturesEnabled: true,
          tiltGesturesEnabled: false,
        ),

        // 2. OSM Attribution — mandatory by ODbL licence
        Positioned(
          bottom: 6,
          right: 8,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.80),
              borderRadius: BorderRadius.circular(6),
            ),
            child: const Text(
              MapConfig.attribution,
              style: TextStyle(fontSize: 9, color: Colors.black54),
            ),
          ),
        ),
      ],
    );
  }
}
