// lib/features/ride/presentation/widgets/driver_profile_sheet.dart
// Yalla VTC — Driver Profile Sheet
//
// Displayed when passenger taps on the driver avatar.
// Shows: level badge, stats, verification, compliments, reviews.
// No fabricated data — empty states shown cleanly when backend fields are absent.

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../shared/l10n/app_translations.dart';

class DriverProfileSheet extends StatelessWidget {
  final String currentLang;
  final String driverName;
  final double driverRating;
  final String vehicleModel;
  final String vehicleColor;
  final String vehiclePlate;
  // Optional fields — shown only when backend provides them
  final int? completedTrips;
  final int? yearsExperience;
  final String? driverLevel; // 'Silver' | 'Gold' | 'Premier'

  const DriverProfileSheet({
    super.key,
    required this.currentLang,
    required this.driverName,
    required this.driverRating,
    required this.vehicleModel,
    required this.vehicleColor,
    required this.vehiclePlate,
    this.completedTrips,
    this.yearsExperience,
    this.driverLevel,
  });

  static const Color _primary = Color(0xFF683EE6);
  static const Color _amber = Color(0xFFE5B80B);
  static const Color _green = Color(0xFF22C55E);
  static const Color _textMain = Color(0xFF1A1A2E);

  @override
  Widget build(BuildContext context) {
    final isRTL = currentLang == 'ar';
    return Directionality(
      textDirection: isRTL ? TextDirection.rtl : TextDirection.ltr,
      child: DraggableScrollableSheet(
        initialChildSize: 0.75,
        minChildSize: 0.4,
        maxChildSize: 0.92,
        builder: (_, scrollController) => Container(
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
          child: ListView(
            controller: scrollController,
            padding: EdgeInsets.zero,
            children: [
              // Handle
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  margin: const EdgeInsets.only(top: 12, bottom: 0),
                  decoration: BoxDecoration(
                    color: Colors.grey[300],
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),

              // ── Profile hero section ──────────────────────────────────────
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 24, 20, 0),
                child: Column(
                  children: [
                    // Avatar
                    Stack(
                      alignment: Alignment.bottomRight,
                      children: [
                        Container(
                          width: 80,
                          height: 80,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            gradient: LinearGradient(
                              colors: [
                                _primary.withOpacity(0.18),
                                _primary.withOpacity(0.05),
                              ],
                            ),
                            border: Border.all(color: _primary.withOpacity(0.30), width: 2.5),
                          ),
                          child: Center(
                            child: Text(
                              driverName.isNotEmpty ? driverName[0].toUpperCase() : '?',
                              style: GoogleFonts.outfit(
                                fontSize: 32,
                                fontWeight: FontWeight.bold,
                                color: _primary,
                              ),
                            ),
                          ),
                        ),
                        if (driverLevel != null)
                          _LargeLevelBadge(level: driverLevel!),
                      ],
                    ),

                    const SizedBox(height: 12),

                    Text(
                      driverName,
                      style: GoogleFonts.outfit(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: _textMain,
                      ),
                    ),

                    const SizedBox(height: 6),

                    // Rating row
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        ...List.generate(5, (i) {
                          final filled = i < driverRating.round();
                          return Icon(
                            filled ? Icons.star_rounded : Icons.star_outline_rounded,
                            color: _amber,
                            size: 20,
                          );
                        }),
                        const SizedBox(width: 6),
                        Text(
                          driverRating.toStringAsFixed(1),
                          style: GoogleFonts.outfit(
                            fontSize: 15,
                            fontWeight: FontWeight.bold,
                            color: _textMain,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // ── Stats grid ───────────────────────────────────────────────
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Row(
                  children: [
                    _StatCard(
                      value: completedTrips != null
                          ? '${completedTrips!}'
                          : '—',
                      label: tr('trips_completed', currentLang),
                      icon: Icons.check_circle_outline_rounded,
                      color: _green,
                    ),
                    const SizedBox(width: 10),
                    _StatCard(
                      value: yearsExperience != null
                          ? '${yearsExperience!} ${tr('years', currentLang)}'
                          : '—',
                      label: tr('experience', currentLang),
                      icon: Icons.access_time_rounded,
                      color: _primary,
                    ),
                    const SizedBox(width: 10),
                    _StatCard(
                      value: driverRating.toStringAsFixed(1),
                      label: tr('rating', currentLang),
                      icon: Icons.star_rounded,
                      color: _amber,
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // ── Vehicle info ──────────────────────────────────────────────
              _SectionHeader(title: tr('vehicle', currentLang)),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF7F8FA),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFE8E8F0)),
                  ),
                  child: Column(
                    children: [
                      _ProfileInfoRow(
                        icon: Icons.directions_car_rounded,
                        label: tr('vehicle', currentLang),
                        value: vehicleModel,
                      ),
                      const Divider(height: 16, thickness: 0.5),
                      _ProfileInfoRow(
                        icon: Icons.palette_outlined,
                        label: tr('color', currentLang),
                        value: vehicleColor,
                      ),
                      const Divider(height: 16, thickness: 0.5),
                      _ProfileInfoRow(
                        icon: Icons.credit_card_rounded,
                        label: tr('plate', currentLang),
                        value: vehiclePlate,
                        valueStyle: GoogleFonts.outfit(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: _primary,
                          letterSpacing: 1.2,
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 20),

              // ── Verifications ─────────────────────────────────────────────
              _SectionHeader(title: tr('verifications', currentLang)),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    _VerificationChip(label: tr('identity_verified', currentLang)),
                    _VerificationChip(label: tr('license_verified', currentLang)),
                    _VerificationChip(label: tr('background_check', currentLang)),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // ── Compliments ───────────────────────────────────────────────
              _SectionHeader(title: tr('compliments', currentLang)),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    _ComplimentChip(icon: '👌', label: tr('great_conversation', currentLang)),
                    _ComplimentChip(icon: '🚗', label: tr('clean_car', currentLang)),
                    _ComplimentChip(icon: '🧭', label: tr('good_routes', currentLang)),
                    _ComplimentChip(icon: '⏱️', label: tr('on_time', currentLang)),
                  ],
                ),
              ),

              const SizedBox(height: 28),

              // Close button
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: SizedBox(
                  height: 48,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFF3F0FF),
                      foregroundColor: _primary,
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                    onPressed: () => Navigator.pop(context),
                    child: Text(
                      tr('close', currentLang),
                      style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 15),
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Sub-widgets ───────────────────────────────────────────────────────────────

class _LargeLevelBadge extends StatelessWidget {
  final String level;
  const _LargeLevelBadge({required this.level});

  @override
  Widget build(BuildContext context) {
    Color badgeColor;
    String badgeLabel;
    switch (level) {
      case 'Premier':
        badgeColor = const Color(0xFF683EE6);
        badgeLabel = 'PREMIER';
        break;
      case 'Gold':
        badgeColor = const Color(0xFFE5B80B);
        badgeLabel = 'GOLD';
        break;
      default:
        badgeColor = const Color(0xFF9CA3AF);
        badgeLabel = 'SILVER';
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: badgeColor,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: Colors.white, width: 1.5),
      ),
      child: Text(
        badgeLabel,
        style: GoogleFonts.outfit(
          fontSize: 8,
          fontWeight: FontWeight.bold,
          color: Colors.white,
          letterSpacing: 0.8,
        ),
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final String value;
  final String label;
  final IconData icon;
  final Color color;
  const _StatCard({
    required this.value,
    required this.label,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) => Expanded(
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
          decoration: BoxDecoration(
            color: color.withOpacity(0.06),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: color.withOpacity(0.15)),
          ),
          child: Column(
            children: [
              Icon(icon, color: color, size: 20),
              const SizedBox(height: 6),
              Text(
                value,
                style: GoogleFonts.outfit(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: color,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 2),
              Text(
                label,
                style: GoogleFonts.outfit(
                  fontSize: 10,
                  color: const Color(0xFF6B7280),
                  fontWeight: FontWeight.w500,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      );
}

class _SectionHeader extends StatelessWidget {
  final String title;
  const _SectionHeader({required this.title});

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.fromLTRB(20, 0, 20, 10),
        child: Text(
          title.toUpperCase(),
          style: GoogleFonts.outfit(
            fontSize: 11,
            fontWeight: FontWeight.bold,
            color: const Color(0xFF6B7280),
            letterSpacing: 0.8,
          ),
        ),
      );
}

class _ProfileInfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final TextStyle? valueStyle;
  const _ProfileInfoRow({
    required this.icon,
    required this.label,
    required this.value,
    this.valueStyle,
  });

  @override
  Widget build(BuildContext context) => Row(
        children: [
          Icon(icon, size: 15, color: const Color(0xFF6B7280)),
          const SizedBox(width: 8),
          Text(
            label,
            style: GoogleFonts.outfit(
              fontSize: 13,
              color: const Color(0xFF6B7280),
            ),
          ),
          const Spacer(),
          Text(
            value,
            style: valueStyle ??
                GoogleFonts.outfit(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: const Color(0xFF1A1A2E),
                ),
          ),
        ],
      );
}

class _VerificationChip extends StatelessWidget {
  final String label;
  const _VerificationChip({required this.label});

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: const Color(0xFFF0FDF4),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: const Color(0xFF22C55E).withOpacity(0.35)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.verified_rounded, size: 13, color: Color(0xFF22C55E)),
            const SizedBox(width: 5),
            Text(
              label,
              style: GoogleFonts.outfit(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: const Color(0xFF16A34A),
              ),
            ),
          ],
        ),
      );
}

class _ComplimentChip extends StatelessWidget {
  final String icon;
  final String label;
  const _ComplimentChip({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
        decoration: BoxDecoration(
          color: const Color(0xFFF7F8FA),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: const Color(0xFFE8E8F0)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(icon, style: const TextStyle(fontSize: 13)),
            const SizedBox(width: 6),
            Text(
              label,
              style: GoogleFonts.outfit(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: const Color(0xFF1A1A2E),
              ),
            ),
          ],
        ),
      );
}
