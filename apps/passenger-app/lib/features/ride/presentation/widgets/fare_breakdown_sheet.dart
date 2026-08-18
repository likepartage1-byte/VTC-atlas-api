// lib/features/ride/presentation/widgets/fare_breakdown_sheet.dart
// Yalla VTC — Fare Breakdown Bottom Sheet
//
// Shows dynamic breakdown of how a service price is computed.
// Architecture:
//   • Reads directly from ServiceFareConfig & FareCalculator
//   • No hardcoded prices in UI — total sync with pricing system
//   • Displays: Minimum fare (≤ 2 km), Rate per km (> 2 km), Route Distance, and Total.

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../pricing/fare_config.dart';
import '../../pricing/fare_calculator.dart';
import '../../../../shared/l10n/app_translations.dart';

class FareBreakdownSheet extends StatelessWidget {
  final ServiceFareConfig config;
  final double? routeDistanceKm;
  final String currentLang;

  const FareBreakdownSheet({
    super.key,
    required this.config,
    required this.routeDistanceKm,
    required this.currentLang,
  });

  static const Color _primary = Color(0xFF683EE6);
  static const Color _primaryLight = Color(0xFFF3F0FF);
  static const Color _green = Color(0xFF22C55E);
  static const Color _textMain = Color(0xFF1A1A2E);
  static const Color _textSub = Color(0xFF6B7280);

  @override
  Widget build(BuildContext context) {
    final isRTL = currentLang == 'ar';
    final distKm = routeDistanceKm ?? 0.0;
    final totalFare = FareCalculator.calculate(
      serviceId: config.serviceId,
      distanceKm: distKm,
    );

    return Directionality(
      textDirection: isRTL ? TextDirection.rtl : TextDirection.ltr,
      child: Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
          boxShadow: [
            BoxShadow(
              color: Color(0x1A000000),
              blurRadius: 24,
              spreadRadius: 2,
              offset: Offset(0, -4),
            ),
          ],
        ),
        child: SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Handle
                Center(
                  child: Container(
                    width: 40,
                    height: 4,
                    margin: const EdgeInsets.only(top: 12, bottom: 20),
                    decoration: BoxDecoration(
                      color: Colors.grey[300],
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),

                // Title row
                Row(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: _primaryLight,
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: const Icon(Icons.receipt_long_rounded, color: _primary, size: 22),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            config.displayName,
                            style: GoogleFonts.outfit(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: _textMain,
                            ),
                          ),
                          Text(
                            tr('fare_breakdown_title', currentLang),
                            style: GoogleFonts.outfit(
                              fontSize: 12,
                              color: _textSub,
                            ),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      onPressed: () => Navigator.pop(context),
                      icon: const Icon(Icons.close_rounded, color: _textSub),
                    ),
                  ],
                ),

                const SizedBox(height: 20),

                // ── Dynamic Pricing Specs (from ServiceFareConfig) ─────────────────
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF7F8FA),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFE8E8F0)),
                  ),
                  child: Column(
                    children: [
                      // Minimum Fare spec
                      _FareDetailRow(
                        icon: Icons.speed_rounded,
                        label: tr('min_fare_label', currentLang),
                        value: '${config.minimumFare.toStringAsFixed(0)} DH',
                        subtext: '≤ ${config.minimumDistanceKm.toStringAsFixed(0)} km',
                      ),

                      const Divider(height: 20, thickness: 0.5),

                      // Rate per km spec
                      _FareDetailRow(
                        icon: Icons.add_road_rounded,
                        label: tr('rate_per_km_label', currentLang),
                        value: '${config.ratePerKm.toStringAsFixed(0)} DH / km',
                        subtext: '> ${config.minimumDistanceKm.toStringAsFixed(0)} km',
                      ),

                      if (distKm > 0) ...[
                        const Divider(height: 20, thickness: 0.5),
                        // OSRM Distance
                        _FareDetailRow(
                          icon: Icons.straighten_rounded,
                          label: tr('distance', currentLang),
                          value: '${distKm.toStringAsFixed(1)} km',
                          valueColor: _primary,
                        ),
                      ],
                    ],
                  ),
                ),

                const SizedBox(height: 16),

                // ── Total Fare Banner ────────────────────────────────────────────────
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 14),
                  decoration: BoxDecoration(
                    color: _primaryLight,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: _primary.withOpacity(0.25)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.payments_rounded, color: _green, size: 20),
                      const SizedBox(width: 10),
                      Text(
                        tr('total_estimated_fare', currentLang),
                        style: GoogleFonts.outfit(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: _textMain,
                        ),
                      ),
                      const Spacer(),
                      Text(
                        totalFare != null ? FareCalculator.format(totalFare) : '${config.minimumFare.toStringAsFixed(0)} DH',
                        style: GoogleFonts.outfit(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: _primary,
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 20),

                // Close CTA
                SizedBox(
                  height: 48,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: _primary,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                    ),
                    onPressed: () => Navigator.pop(context),
                    child: Text(
                      tr('ok', currentLang),
                      style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 15),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _FareDetailRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final String? subtext;
  final Color? valueColor;

  const _FareDetailRow({
    required this.icon,
    required this.label,
    required this.value,
    this.subtext,
    this.valueColor,
  });

  @override
  Widget build(BuildContext context) => Row(
        children: [
          Icon(icon, size: 18, color: const Color(0xFF6B7280)),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: GoogleFonts.outfit(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: const Color(0xFF1A1A2E),
                  ),
                ),
                if (subtext != null)
                  Text(
                    subtext!,
                    style: GoogleFonts.outfit(
                      fontSize: 11,
                      color: const Color(0xFF6B7280),
                    ),
                  ),
              ],
            ),
          ),
          Text(
            value,
            style: GoogleFonts.outfit(
              fontSize: 14,
              fontWeight: FontWeight.bold,
              color: valueColor ?? const Color(0xFF1A1A2E),
            ),
          ),
        ],
      );
}
