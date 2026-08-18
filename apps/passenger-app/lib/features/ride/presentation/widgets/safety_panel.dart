// lib/features/ride/presentation/widgets/safety_panel.dart
// Yalla VTC — Safety / SOS Panel
//
// Accessible during an active ride from the DriverCard.
// First-class safety UI: current vehicle info + configurable emergency call.
//
// The emergency number is NOT hardcoded — it reads from a central config
// so it can be updated without a code release.

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../shared/l10n/app_translations.dart';

/// Configurable emergency number — override in app config if needed.
const String _kEmergencyNumber = '190'; // Police Nationale — Maroc

class SafetyPanel extends StatelessWidget {
  final String currentLang;
  final String driverName;
  final String vehicleModel;
  final String vehiclePlate;
  final String vehicleColor;

  const SafetyPanel({
    super.key,
    required this.currentLang,
    required this.driverName,
    required this.vehicleModel,
    required this.vehiclePlate,
    required this.vehicleColor,
  });

  static const Color _primary  = Color(0xFF683EE6);
  static const Color _danger   = Color(0xFFEF4444);
  static const Color _textMain = Color(0xFF1A1A2E);
  static const Color _textSub  = Color(0xFF6B7280);

  @override
  Widget build(BuildContext context) {
    final isRTL = currentLang == 'ar';
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
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Handle bar
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  margin: const EdgeInsets.only(top: 12, bottom: 6),
                  decoration: BoxDecoration(
                    color: Colors.grey[300],
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),

              // Header
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 8, 20, 0),
                child: Row(
                  children: [
                    Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: _danger.withOpacity(0.10),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.security_rounded, color: Color(0xFFEF4444), size: 22),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        tr('safety', currentLang),
                        style: GoogleFonts.outfit(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: _textMain,
                        ),
                      ),
                    ),
                    IconButton(
                      onPressed: () => Navigator.pop(context),
                      icon: const Icon(Icons.close_rounded, color: Color(0xFF6B7280)),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 4),

              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Text(
                  tr('safety_subtitle', currentLang),
                  style: GoogleFonts.outfit(
                    fontSize: 13,
                    color: _textSub,
                    height: 1.5,
                  ),
                ),
              ),

              const SizedBox(height: 20),

              // Current trip vehicle info
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
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        tr('your_current_trip', currentLang),
                        style: GoogleFonts.outfit(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: _textSub,
                          letterSpacing: 0.6,
                        ),
                      ),
                      const SizedBox(height: 10),
                      if (driverName.isNotEmpty)
                        _TripInfoRow(
                          icon: Icons.person_rounded,
                          label: tr('driver', currentLang),
                          value: driverName,
                        ),
                      if (vehicleModel.isNotEmpty)
                        _TripInfoRow(
                          icon: Icons.directions_car_rounded,
                          label: tr('vehicle', currentLang),
                          value: vehicleModel,
                        ),
                      if (vehicleColor.isNotEmpty)
                        _TripInfoRow(
                          icon: Icons.palette_outlined,
                          label: tr('color', currentLang),
                          value: vehicleColor,
                        ),
                      if (vehiclePlate.isNotEmpty)
                        _TripInfoRow(
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

              const SizedBox(height: 16),

              // Emergency instruction
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: _danger.withOpacity(0.05),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: _danger.withOpacity(0.18)),
                  ),
                  child: Text(
                    tr('sos_instruction', currentLang),
                    style: GoogleFonts.outfit(
                      fontSize: 13,
                      color: _danger.withOpacity(0.85),
                      height: 1.5,
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 20),

              // Emergency call button
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20),
                child: SizedBox(
                  height: 56,
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: _danger,
                      foregroundColor: Colors.white,
                      elevation: 4,
                      shadowColor: _danger.withOpacity(0.45),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(18),
                      ),
                    ),
                    onPressed: () => _callEmergency(context),
                    icon: const Icon(Icons.call_rounded, size: 20),
                    label: Text(
                      '${tr('call_emergency', currentLang)} $_kEmergencyNumber',
                      style: GoogleFonts.outfit(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
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

  Future<void> _callEmergency(BuildContext context) async {
    final uri = Uri(scheme: 'tel', path: _kEmergencyNumber);
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }
}

class _TripInfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final TextStyle? valueStyle;

  const _TripInfoRow({
    required this.icon,
    required this.label,
    required this.value,
    this.valueStyle,
  });

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.only(bottom: 8),
        child: Row(
          children: [
            Icon(icon, size: 15, color: const Color(0xFF6B7280)),
            const SizedBox(width: 8),
            Text(
              label,
              style: GoogleFonts.outfit(
                fontSize: 12,
                color: const Color(0xFF6B7280),
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(width: 6),
            Expanded(
              child: Text(
                value,
                style: valueStyle ??
                    GoogleFonts.outfit(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: const Color(0xFF1A1A2E),
                    ),
                textAlign: TextAlign.end,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      );
}
