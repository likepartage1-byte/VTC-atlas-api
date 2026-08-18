// lib/features/ride/routing/routing_provider.dart
// Yalla VTC — Abstract Routing Provider
//
// Interface for calculating road network routes.
// Implementations: OsrmRoutingProvider, GraphHopperRoutingProvider, ValhallaRoutingProvider, etc.

import '../map/yalla_map_controller.dart';
import 'routing_result.dart';

abstract class RoutingProvider {
  /// Calculate a driving route following the real road network between [origin] and [destination].
  Future<RoutingResult> getRoute({
    required YallaLatLng origin,
    required YallaLatLng destination,
  });
}
