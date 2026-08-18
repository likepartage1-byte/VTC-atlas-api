// lib/features/ride/routing/routing_service.dart
// Yalla VTC — Routing Service
//
// High-level service for calculating real road driving routes.
// Decoupled from MapLibre and UI.

import '../map/yalla_map_controller.dart';
import 'routing_provider.dart';
import 'osrm_routing_provider.dart';
import 'routing_result.dart';

class RoutingService {
  final RoutingProvider _provider;

  RoutingService({RoutingProvider? provider})
      : _provider = provider ?? OsrmRoutingProvider();

  /// Calculate real road network route between [origin] and [destination].
  Future<RoutingResult> calculateRoute(YallaLatLng origin, YallaLatLng destination) {
    return _provider.getRoute(origin: origin, destination: destination);
  }
}
