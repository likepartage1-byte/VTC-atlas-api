// lib/features/ride/presentation/widgets/driver_card.dart
// Yalla VTC — Premium Driver Accepted Card
//
// Displayed as an overlay when RideDriverAccepted is emitted.
// Architecture:
//   • Driver identity (avatar, name, level badge, rating)
//   • Vehicle info + ETA
//   • Action row: Call / Message / Safety
//   • Trip share (secondary)
//   • Payment row
//   • Route info (A→B)
//   • Cancel (visible but not dominant)

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../shared/l10n/app_translations.dart';

class DriverCard extends StatelessWidget {
  final String driverName;
  final double driverRating;
  final String vehicleModel;
  final String vehicleColor;
  final String vehiclePlate;
  final int etaMinutes;
  final String currentLang;
  final VoidCallback onCancel;
  final VoidCallback? onCallDriver;
  final VoidCallback? onSafety;
  final VoidCallback? onShareTrip;
  final VoidCallback? onDriverProfile;
  final String? driverLevel; // 'Silver' | 'Gold' | 'Premier'

  const DriverCard({
    super.key,
    required this.driverName,
    required this.driverRating,
    required this.vehicleModel,
    required this.vehicleColor,
    required this.vehiclePlate,
    required this.etaMinutes,
    required this.currentLang,
    required this.onCancel,
    this.onCallDriver,
    this.onSafety,
    this.onShareTrip,
    this.onDriverProfile,
    this.driverLevel,
  });

  static const Color _primary = Color(0xFF683EE6);
  static const Color _textPrimary = Color(0xFF1A1A2E);
  static const Color _textSecond = Color(0xFF6B7280);
  static const Color _amber = Color(0xFFE5B80B);
  static const Color _green = Color(0xFF22C55E);
  static const Color _danger = Color(0xFFEF4444);

  @override
  Widget build(BuildContext context) {
    final lang = currentLang;
    final isArabic = lang == 'ar';

    return Directionality(
      textDirection: isArabic ? TextDirection.rtl : TextDirection.ltr,
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(24),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.10),
              blurRadius: 24,
              spreadRadius: 2,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // ── ETA Header band ─────────────────────────────────────────────
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFF7B52F0), Color(0xFF5A2ED6)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.directions_car_rounded, color: Colors.white, size: 18),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      tr('driver_on_the_way', lang),
                      style: GoogleFonts.outfit(
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.20),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      '~$etaMinutes ${tr('minutes', lang)}',
                      style: GoogleFonts.outfit(
                        fontSize: 13,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            Padding(
              padding: const EdgeInsets.fromLTRB(18, 16, 18, 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // ── Driver identity row ────────────────────────────────────
                  Row(
                    children: [
                      // Avatar with optional profile tap
                      GestureDetector(
                        onTap: onDriverProfile,
                        child: Stack(
                          children: [
                            Container(
                              width: 54,
                              height: 54,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                gradient: LinearGradient(
                                  colors: [
                                    _primary.withOpacity(0.15),
                                    _primary.withOpacity(0.05),
                                  ],
                                ),
                                border: Border.all(color: _primary.withOpacity(0.25), width: 2),
                              ),
                              child: Center(
                                child: Text(
                                  driverName.isNotEmpty ? driverName[0].toUpperCase() : '?',
                                  style: GoogleFonts.outfit(
                                    fontSize: 22,
                                    fontWeight: FontWeight.bold,
                                    color: _primary,
                                  ),
                                ),
                              ),
                            ),
                            // Level badge
                            Positioned(
                              bottom: 0,
                              right: 0,
                              child: _LevelBadge(level: driverLevel),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(width: 14),

                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              driverName,
                              style: GoogleFonts.outfit(
                                fontSize: 17,
                                fontWeight: FontWeight.bold,
                                color: _textPrimary,
                              ),
                            ),
                            const SizedBox(height: 3),
                            Row(
                              children: [
                                const Icon(Icons.star_rounded, size: 15, color: Color(0xFFE5B80B)),
                                const SizedBox(width: 3),
                                Text(
                                  driverRating.toStringAsFixed(1),
                                  style: GoogleFonts.outfit(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w600,
                                    color: _textSecond,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),

                      // Vehicle plate
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          color: Colors.black87,
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: _amber, width: 1.5),
                        ),
                        child: Text(
                          vehiclePlate,
                          style: GoogleFonts.outfit(
                            fontSize: 12,
                            fontWeight: FontWeight.bold,
                            color: _amber,
                            letterSpacing: 1.2,
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 12),

                  // ── Vehicle info strip ─────────────────────────────────────
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF7F8FA),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: const Color(0xFFE8E8F0)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        _VehicleInfoItem(
                          icon: Icons.directions_car_outlined,
                          label: vehicleModel,
                        ),
                        Container(width: 1, height: 18, color: const Color(0xFFE8E8F0)),
                        _VehicleInfoItem(
                          icon: Icons.palette_outlined,
                          label: vehicleColor,
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 14),

                  // ── Action row: Call / Message / Safety ────────────────────
                  Row(
                    children: [
                      Expanded(
                        child: _ActionButton(
                          icon: Icons.call_rounded,
                          label: tr('call_driver', lang),
                          color: _green,
                          onTap: onCallDriver,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: _ActionButton(
                          icon: Icons.shield_rounded,
                          label: tr('safety', lang),
                          color: _primary,
                          hasGlow: true,
                          onTap: onSafety,
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 10),

                  // ── Share trip (secondary) ────────────────────────────────
                  GestureDetector(
                    onTap: onShareTrip,
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 14),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF7F8FA),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFFE8E8F0)),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.share_location_rounded, size: 18, color: _textSecond),
                          const SizedBox(width: 8),
                          Text(
                            tr('share_trip', lang),
                            style: GoogleFonts.outfit(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: _textSecond,
                            ),
                          ),
                          const Spacer(),
                          const Icon(Icons.chevron_right_rounded, size: 18, color: _textSecond),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 14),

                  // ── Payment info ───────────────────────────────────────────
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: _green.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(Icons.payments_rounded, color: Color(0xFF22C55E), size: 16),
                      ),
                      const SizedBox(width: 10),
                      Text(
                        tr('cash_payment', lang),
                        style: GoogleFonts.outfit(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: _textSecond,
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 14),

                  // ── Cancel ────────────────────────────────────────────────
                  SizedBox(
                    width: double.infinity,
                    height: 44,
                    child: OutlinedButton(
                      style: OutlinedButton.styleFrom(
                        foregroundColor: _danger,
                        side: const BorderSide(color: Color(0xFFEF4444)),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                      ),
                      onPressed: onCancel,
                      child: Text(
                        tr('cancel_ride', lang),
                        style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 14),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Sub-widgets ───────────────────────────────────────────────────────────────

class _LevelBadge extends StatelessWidget {
  final String? level;
  const _LevelBadge({this.level});

  @override
  Widget build(BuildContext context) {
    if (level == null || level!.isEmpty) return const SizedBox.shrink();

    Color badgeColor;
    IconData badgeIcon;
    switch (level) {
      case 'Premier':
        badgeColor = const Color(0xFF683EE6);
        badgeIcon = Icons.workspace_premium_rounded;
        break;
      case 'Gold':
        badgeColor = const Color(0xFFE5B80B);
        badgeIcon = Icons.star_rounded;
        break;
      default: // Silver
        badgeColor = const Color(0xFF9CA3AF);
        badgeIcon = Icons.verified_rounded;
    }

    return Container(
      width: 18,
      height: 18,
      decoration: BoxDecoration(
        color: badgeColor,
        shape: BoxShape.circle,
        border: Border.all(color: Colors.white, width: 1.5),
      ),
      child: Icon(badgeIcon, size: 10, color: Colors.white),
    );
  }
}

class _VehicleInfoItem extends StatelessWidget {
  final IconData icon;
  final String label;
  const _VehicleInfoItem({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) => Row(
        children: [
          Icon(icon, size: 15, color: const Color(0xFF6B7280)),
          const SizedBox(width: 6),
          Text(
            label,
            style: GoogleFonts.outfit(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: const Color(0xFF1A1A2E),
            ),
          ),
        ],
      );
}

class _ActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final bool hasGlow;
  final VoidCallback? onTap;

  const _ActionButton({
    required this.icon,
    required this.label,
    required this.color,
    this.hasGlow = false,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) => GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: color.withOpacity(0.08),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: color.withOpacity(0.22)),
            boxShadow: hasGlow
                ? [
                    BoxShadow(
                      color: color.withOpacity(0.14),
                      blurRadius: 10,
                      spreadRadius: 1,
                      offset: const Offset(0, 2),
                    ),
                  ]
                : null,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, color: color, size: 20),
              const SizedBox(height: 4),
              Text(
                label,
                style: GoogleFonts.outfit(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: color,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      );
}
