// lib/features/ride/pricing/fare_config.dart
// Yalla VTC — Centralised Fare Configuration
//
// ══════════════════════════════════════════════════════════════════════
//  EDIT PRICES HERE — one source of truth for all fare logic.
//  No fare values live in any UI widget or BLoC.
// ══════════════════════════════════════════════════════════════════════
//
//  Formula (see fare_calculator.dart):
//    if distanceKm <= minimumDistanceKm:
//        fare = minimumFare
//    else:
//        fare = minimumFare + (distanceKm − minimumDistanceKm) × ratePerKm
//
//  Constraints:
//    • ratePerKm can be raised without limit.
//    • ratePerKm must never drop below minimumAllowedRatePerKm.
//    • COURSIER rate is marked as editableByAdmin = true for future CMS.

class ServiceFareConfig {
  /// Unique service identifier — matches YallaServiceCategory.id
  final String serviceId;

  /// Display name of the service
  final String displayName;

  /// Default rate per kilometre in MAD.
  final double ratePerKm;

  /// Flat fare for trips ≤ minimumDistanceKm (inclusive).
  final double minimumFare;

  /// Distance threshold in km below which minimumFare applies.
  final double minimumDistanceKm;

  /// Hard floor: ratePerKm must never go below this value.
  /// Enforced both here and on the admin side.
  final double minimumAllowedRatePerKm;

  /// If true, the rate can be configured by admin (future CMS feature).
  final bool editableByAdmin;

  const ServiceFareConfig({
    required this.serviceId,
    required this.displayName,
    required this.ratePerKm,
    required this.minimumFare,
    required this.minimumDistanceKm,
    required this.minimumAllowedRatePerKm,
    this.editableByAdmin = false,
  })  : assert(ratePerKm > 0, 'ratePerKm must be > 0'),
        assert(minimumFare > 0, 'minimumFare must be > 0'),
        assert(minimumDistanceKm > 0, 'minimumDistanceKm must be > 0');

  // ── Catalogue ────────────────────────────────────────────────────────────────

  static const ServiceFareConfig course = ServiceFareConfig(
    serviceId: 'COURSE',
    displayName: 'Course',
    ratePerKm: 5.0,
    minimumFare: 13.0,
    minimumDistanceKm: 2.0,
    minimumAllowedRatePerKm: 4.0,
  );

  static const ServiceFareConfig confort = ServiceFareConfig(
    serviceId: 'CONFORT',
    displayName: 'Confort',
    ratePerKm: 7.0,
    minimumFare: 18.0,
    minimumDistanceKm: 2.0,
    minimumAllowedRatePerKm: 6.0,
  );

  static const ServiceFareConfig yallaTaxi = ServiceFareConfig(
    serviceId: 'YALLA_TAXI',
    displayName: 'Yalla Taxi',
    ratePerKm: 5.0,
    minimumFare: 12.0,
    minimumDistanceKm: 2.0,
    minimumAllowedRatePerKm: 2.0,
  );

  static const ServiceFareConfig moto = ServiceFareConfig(
    serviceId: 'MOTO',
    displayName: 'Moto',
    ratePerKm: 3.0,
    minimumFare: 9.0,
    minimumDistanceKm: 2.0,
    minimumAllowedRatePerKm: 2.0,
  );

  static const ServiceFareConfig coursier = ServiceFareConfig(
    serviceId: 'COURSIER',
    displayName: 'Coursier',
    ratePerKm: 3.0,
    minimumFare: 15.0,
    minimumDistanceKm: 2.0,
    minimumAllowedRatePerKm: 2.0,
    editableByAdmin: true,
  );

  /// All services in display order.
  static const List<ServiceFareConfig> all = [
    course,
    confort,
    yallaTaxi,
    moto,
    coursier,
  ];

  /// Look up a config by serviceId. Returns null if not found.
  static ServiceFareConfig? forId(String id) {
    for (final cfg in all) {
      if (cfg.serviceId == id) return cfg;
    }
    return null;
  }
}
