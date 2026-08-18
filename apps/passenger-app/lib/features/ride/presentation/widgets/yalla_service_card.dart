// lib/features/ride/presentation/widgets/yalla_service_card.dart
// Yalla VTC — Professional Vertical Service Card List
//
// Replaces the horizontal YallaServiceSelector scroll with a full-width
// vertical list of tappable service cards. Each card shows:
//   • Custom icon (Material Icons — no emoji)
//   • Service name + subtitle
//   • Rate per km
//   • Minimum fare for ≤ 2 km trips
//   • Calculated fare for the current route distance
//   • Selection highlight in Yalla primary color #683EE6

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../pricing/fare_config.dart';
import '../../pricing/fare_calculator.dart';
import 'fare_breakdown_sheet.dart';

/// One row in the service list.
class YallaServiceCard extends StatelessWidget {
  final ServiceFareConfig config;
  final bool isSelected;
  final double? routeDistanceKm; // null until route is calculated
  final VoidCallback onTap;
  final String currentLang;

  const YallaServiceCard({
    super.key,
    required this.config,
    required this.isSelected,
    required this.onTap,
    this.routeDistanceKm,
    this.currentLang = 'ar',
  });

  static const Color _yallaPrimary = Color(0xFF683EE6);
  static const Color _yallaLight  = Color(0xFFF3F0FF);

  @override
  Widget build(BuildContext context) {
    final fare = routeDistanceKm != null
        ? FareCalculator.calculate(
            serviceId: config.serviceId,
            distanceKm: routeDistanceKm!,
          )
        : null;

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: isSelected ? _yallaLight : Colors.white,
          borderRadius: BorderRadius.circular(18),
          border: Border.all(
            color: isSelected ? _yallaPrimary : const Color(0xFFE8E8E8),
            width: isSelected ? 2 : 1,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: _yallaPrimary.withOpacity(0.12),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ]
              : [
                  const BoxShadow(
                    color: Color(0x0A000000),
                    blurRadius: 6,
                    offset: Offset(0, 2),
                  ),
                ],
        ),
        child: Row(
          children: [
            // ── Icon container ───────────────────────────────────────────────
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: isSelected
                    ? _yallaPrimary.withOpacity(0.12)
                    : const Color(0xFFF5F5F5),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Icon(
                iconForId(config.serviceId),
                color: isSelected ? _yallaPrimary : const Color(0xFF666666),
                size: 26,
              ),
            ),

            const SizedBox(width: 14),

            // ── Labels ───────────────────────────────────────────────────────
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        config.displayName,
                        style: GoogleFonts.outfit(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                          color: isSelected ? _yallaPrimary : Colors.black87,
                        ),
                      ),
                      const SizedBox(width: 8),
                      GestureDetector(
                        onTap: () {
                          showModalBottomSheet(
                            context: context,
                            isScrollControlled: true,
                            backgroundColor: Colors.transparent,
                            builder: (_) => FareBreakdownSheet(
                              config: config,
                              routeDistanceKm: routeDistanceKm,
                              currentLang: currentLang,
                            ),
                          );
                        },
                        child: Icon(
                          Icons.info_outline_rounded,
                          size: 15,
                          color: isSelected ? _yallaPrimary : Colors.grey[400],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 3),
                  Row(
                    children: [
                      _CapacityBadge(serviceId: config.serviceId),
                      const SizedBox(width: 8),
                      Text(
                        '${config.ratePerKm.toStringAsFixed(0)} DH/km',
                        style: GoogleFonts.outfit(
                          fontSize: 11,
                          color: Colors.grey[600],
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(width: 12),

            // ── Fare badge + chevron ─────────────────────────────────────────
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                if (fare != null)
                  Text(
                    FareCalculator.format(fare),
                    style: GoogleFonts.outfit(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: isSelected ? _yallaPrimary : Colors.black87,
                    ),
                  )
                else
                  Text(
                    'ابتداءً من\n${config.minimumFare.toStringAsFixed(0)} DH',
                    textAlign: TextAlign.end,
                    style: GoogleFonts.outfit(
                      fontSize: 11,
                      color: Colors.grey[500],
                      fontWeight: FontWeight.w500,
                      height: 1.4,
                    ),
                  ),
                const SizedBox(height: 4),
                Icon(
                  Icons.chevron_right_rounded,
                  color: isSelected ? _yallaPrimary : Colors.grey[400],
                  size: 18,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  // ── Icon lookup — Material Icons, no emoji ────────────────────────────────

  /// Public so other widgets (e.g. quick service strip) can reuse the mapping.
  static IconData iconForId(String serviceId) {
    switch (serviceId) {
      case 'COURSE':
        return Icons.local_taxi_rounded;
      case 'CONFORT':
        return Icons.directions_car_filled_rounded;
      case 'YALLA_TAXI':
        return Icons.local_taxi_outlined;
      case 'MOTO':
        return Icons.two_wheeler_rounded;
      case 'COURSIER':
        return Icons.delivery_dining_rounded;
      default:
        return Icons.directions_car_rounded;
    }
  }
}

// ── Service list widget ───────────────────────────────────────────────────────

/// Full vertical list of service cards.
///
/// [selectedServiceId] controls which card is highlighted.
/// [routeDistanceKm] enables fare calculation; pass null when no route yet.
class YallaServiceList extends StatelessWidget {
  final String selectedServiceId;
  final ValueChanged<String> onSelectService;
  final double? routeDistanceKm;
  final String currentLang;

  const YallaServiceList({
    super.key,
    required this.selectedServiceId,
    required this.onSelectService,
    this.routeDistanceKm,
    this.currentLang = 'ar',
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: ServiceFareConfig.all
          .map(
            (config) => YallaServiceCard(
              config: config,
              isSelected: selectedServiceId == config.serviceId,
              routeDistanceKm: routeDistanceKm,
              currentLang: currentLang,
              onTap: () => onSelectService(config.serviceId),
            ),
          )
          .toList(),
    );
  }
}

class _CapacityBadge extends StatelessWidget {
  final String serviceId;
  const _CapacityBadge({required this.serviceId});

  @override
  Widget build(BuildContext context) {
    int passengers = 4;
    int bags = 2;

    if (serviceId == 'MOTO') {
      passengers = 1;
      bags = 1;
    } else if (serviceId == 'COURSIER') {
      passengers = 0;
      bags = 1;
    }

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        if (passengers > 0) ...[
          const Icon(Icons.person_outline_rounded, size: 13, color: Color(0xFF6B7280)),
          const SizedBox(width: 2),
          Text(
            '$passengers',
            style: GoogleFonts.outfit(fontSize: 11, color: const Color(0xFF6B7280), fontWeight: FontWeight.w600),
          ),
          const SizedBox(width: 6),
        ],
        const Icon(Icons.work_outline_rounded, size: 13, color: Color(0xFF6B7280)),
        const SizedBox(width: 2),
        Text(
          '$bags',
          style: GoogleFonts.outfit(fontSize: 11, color: const Color(0xFF6B7280), fontWeight: FontWeight.w600),
        ),
      ],
    );
  }
}
