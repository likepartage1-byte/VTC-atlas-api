// lib/features/ride/pricing/fare_calculator.dart
// Yalla VTC — Fare Calculation Engine
//
// Pure business logic — zero Flutter/UI dependencies.
// All calculations derived from ServiceFareConfig values.
//
// Formula:
//   if distanceKm <= config.minimumDistanceKm:
//       fare = config.minimumFare
//   else:
//       fare = config.minimumFare
//              + (distanceKm − config.minimumDistanceKm) × config.ratePerKm
//
// Verification table (COURSE: rate=5, minFare=13, minDist=2):
//   1.0 km → 13 DH
//   1.5 km → 13 DH
//   2.0 km → 13 DH
//   3.0 km → 13 + (1 × 5) = 18 DH
//   4.7 km → 13 + (2.7 × 5) = 26.5 → rounds to 27 DH
//   7.0 km → 13 + (5 × 5) = 38 DH

import 'dart:math';
import 'fare_config.dart';

class FareCalculator {
  FareCalculator._(); // Static-only class — not instantiable.

  // ── Public API ──────────────────────────────────────────────────────────────

  /// Calculate fare for [serviceId] given [distanceKm].
  ///
  /// Returns null if serviceId is not found in FareConfig.all.
  ///
  /// The returned value is rounded to the nearest integer (e.g. 26.5 → 27).
  static double? calculate({
    required String serviceId,
    required double distanceKm,
  }) {
    final config = ServiceFareConfig.forId(serviceId);
    if (config == null) return null;
    return _computeFare(config, distanceKm);
  }

  /// Calculate fares for ALL services at once.
  ///
  /// Returns a map of serviceId → rounded fare (DH).
  /// Useful for rendering all service cards simultaneously.
  static Map<String, double> calculateAll(double distanceKm) {
    final Map<String, double> result = {};
    for (final config in ServiceFareConfig.all) {
      result[config.serviceId] = _computeFare(config, distanceKm);
    }
    return result;
  }

  /// Returns a human-readable fare string for display.
  /// Example: "27 DH"
  static String format(double fare) => '${fare.round()} DH';

  // ── Internal ────────────────────────────────────────────────────────────────

  static double _computeFare(ServiceFareConfig config, double distanceKm) {
    final distance = max(0.0, distanceKm);

    if (distance <= config.minimumDistanceKm) {
      return config.minimumFare;
    }

    final extraDistance = distance - config.minimumDistanceKm;
    final rawFare = config.minimumFare + extraDistance * config.ratePerKm;

    // Round to nearest integer for display clarity (no false precision).
    return rawFare.roundToDouble();
  }
}
