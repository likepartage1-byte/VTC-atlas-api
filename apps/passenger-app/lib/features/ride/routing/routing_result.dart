// lib/features/ride/routing/routing_result.dart
// Yalla VTC — Routing Result Data Object

import '../map/yalla_map_controller.dart';

class RoutingResult {
  /// Ordered list of road coordinates following the real road network.
  final List<YallaLatLng> points;

  /// Driving distance along the road network in meters.
  final double distanceMeters;

  /// Estimated driving duration in seconds.
  final double durationSeconds;

  const RoutingResult({
    required this.points,
    required this.distanceMeters,
    required this.durationSeconds,
  });

  /// Distance in kilometres rounded to 1 decimal place.
  double get distanceKm =>
      double.parse((distanceMeters / 1000.0).toStringAsFixed(1));

  /// Duration in minutes rounded to nearest integer (minimum 1 min).
  int get durationMin {
    final mins = (durationSeconds / 60.0).round();
    return mins < 1 ? 1 : mins;
  }
}
