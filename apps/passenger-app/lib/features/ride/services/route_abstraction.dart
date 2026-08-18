// lib/features/ride/services/route_abstraction.dart
// Yalla VTC — Route Calculation Abstraction Layer

import 'dart:math';

class RouteEstimateResult {
  final double distanceKm;
  final int durationMinutes;
  final bool isPreviewEstimate; // Explicitly designates fallback straight-line calculation

  const RouteEstimateResult({
    required this.distanceKm,
    required this.durationMinutes,
    this.isPreviewEstimate = true,
  });
}

abstract class RouteProvider {
  Future<RouteEstimateResult> calculateRoute({
    required double originLat,
    required double originLng,
    required double destLat,
    required double destLng,
  });
}

/// Fallback Route Calculator — Client-Side Estimate Preview ($0 Cost)
class FallbackRouteCalculator implements RouteProvider {
  @override
  Future<RouteEstimateResult> calculateRoute({
    required double originLat,
    required double originLng,
    required double destLat,
    required double destLng,
  }) async {
    final dLat = (destLat - originLat) * 111.0;
    final dLng = (destLng - originLng) * 111.0 * cos(originLat * pi / 180);
    final distanceKm = double.parse(sqrt(dLat * dLat + dLng * dLng).toStringAsFixed(1));
    final durationMinutes = max(3, (distanceKm * 3).round());

    return RouteEstimateResult(
      distanceKm: distanceKm,
      durationMinutes: durationMinutes,
      isPreviewEstimate: true,
    );
  }
}
