// lib/features/ride/map/map_provider.dart
// Yalla VTC — Map Provider Factory
//
// To switch the entire map engine, change MapProvider.current only.
// No screen, no controller, no widget needs touching.
//
// Usage:
//   final ctrl = await MapProvider.current.createController(rawCtrl);

import 'yalla_map_controller.dart';
import 'maplibre_controller_impl.dart';
import 'package:maplibre_gl/maplibre_gl.dart' show MapLibreMapController;

/// Enum of supported map providers.
enum MapProviderType {
  mapLibre,
  // google,  // uncomment when Google Enterprise key is available
  // mapbox,
  // here,
}

/// Factory that creates the concrete [YallaMapController] for the active provider.
///
/// Swap [MapProvider.current] to change the entire map engine:
/// ```dart
/// MapProvider.current = MapProviderType.google;
/// ```
class MapProvider {
  MapProvider._();

  /// The currently active map provider. Change here to switch globally.
  static MapProviderType current = MapProviderType.mapLibre;

  /// Creates a [YallaMapController] for the [current] provider.
  /// [rawCtrl] is the SDK-specific controller passed from the map widget.
  static YallaMapController createController(dynamic rawCtrl) {
    switch (current) {
      case MapProviderType.mapLibre:
        assert(
          rawCtrl is MapLibreMapController,
          'Expected MapLibreMapController for mapLibre provider',
        );
        return MapLibreControllerImpl(rawCtrl as MapLibreMapController);
      // case MapProviderType.google:
      //   return GoogleControllerImpl(rawCtrl as GoogleMapController);
    }
  }
}
