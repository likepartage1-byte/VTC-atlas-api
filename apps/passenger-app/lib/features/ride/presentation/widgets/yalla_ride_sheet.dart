// lib/features/ride/presentation/widgets/yalla_ride_sheet.dart
// Yalla VTC — Professional Ride Bottom Sheet
//
// Replaces YallaBottomSheet. Handles 4 states:
//
//   IDLE              → A/B input trigger + quick service preview
//   DESTINATION_SEL   → RouteSummaryBar + ServiceCards + Confirm button
//   SEARCHING_DRIVER  → Progress spinner + Cancel
//   DRIVER_ACCEPTED   → handled by DriverCard in HomePage (not here)
//
// Brand: #683EE6 primary, white cards, subtle shadows.
// RTL: Directionality wraps all content.
// Pricing: FareCalculator called here, RideBloc is untouched.

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../shared/l10n/app_translations.dart';
import '../../bloc/ride_state.dart';
import '../../pricing/fare_calculator.dart';
import '../../pricing/fare_config.dart';
import 'route_summary_bar.dart';
import 'yalla_service_card.dart';

class YallaRideSheet extends StatefulWidget {
  final RideState rideState;
  final String currentLang;

  // Address strings for display
  final String originAddress;
  final String destAddress;

  // Callbacks
  final VoidCallback onTapWhereTo;   // opens A/B search modal
  final void Function(String serviceId) onRequestRide; // passes selected service
  final VoidCallback onCancelRide;

  const YallaRideSheet({
    super.key,
    required this.rideState,
    required this.currentLang,
    required this.originAddress,
    required this.destAddress,
    required this.onTapWhereTo,
    required this.onRequestRide,
    required this.onCancelRide,
  });

  @override
  State<YallaRideSheet> createState() => _YallaRideSheetState();
}

class _YallaRideSheetState extends State<YallaRideSheet>
    with SingleTickerProviderStateMixin {
  static const Color _primary = Color(0xFF683EE6);
  static const Color _green = Color(0xFF22C55E);
  static const Color _textPrimary = Color(0xFF1A1A2E);
  static const Color _textSecond = Color(0xFF6B7280);

  /// Selected service — default to COURSE (most common)
  String _selectedServiceId = ServiceFareConfig.course.serviceId;

  // Pulse animation for searching state
  late AnimationController _pulseCtrl;
  late Animation<double> _pulseAnim;

  @override
  void initState() {
    super.initState();
    _pulseCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat(reverse: true);
    _pulseAnim = Tween<double>(begin: 0.85, end: 1.15).animate(
      CurvedAnimation(parent: _pulseCtrl, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _pulseCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final lang     = widget.currentLang;
    final isRTL    = isRightToLeft(lang);
    final state    = widget.rideState;

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
          child: SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                _HandleBar(),
                const SizedBox(height: 4),
                _buildBody(context, state, lang),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // ── State router ─────────────────────────────────────────────────────────────

  Widget _buildBody(BuildContext context, RideState state, String lang) {
    if (state is RideSearchingDriver || state is RideRequestInProgress) {
      return _buildSearchingState(lang);
    }
    if (state is RideDestinationSelected) {
      return _buildDestinationSelectedState(state, lang);
    }
    // Default: IDLE
    return _buildIdleState(lang);
  }

  // ── IDLE state ────────────────────────────────────────────────────────────────

  Widget _buildIdleState(String lang) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const SizedBox(height: 4),

        // Origin row — compact GPS indicator
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          decoration: BoxDecoration(
            color: const Color(0xFFF7F8FA),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: const Color(0xFFE8E8F0)),
          ),
          child: Row(
            children: [
              Container(
                width: 28,
                height: 28,
                decoration: BoxDecoration(
                  color: _green.withOpacity(0.12),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.my_location_rounded, color: Color(0xFF22C55E), size: 15),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      tr('origin_label', lang),
                      style: GoogleFonts.outfit(
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        color: _textSecond,
                        letterSpacing: 0.6,
                      ),
                    ),
                    Text(
                      widget.originAddress.isNotEmpty
                          ? widget.originAddress
                          : tr('current_location', lang),
                      style: GoogleFonts.outfit(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: _textPrimary,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: 8),

        // B — Prominent WHERE TO CTA
        GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: widget.onTapWhereTo,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 16),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF7B52F0), Color(0xFF5A2ED6)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(18),
              boxShadow: [
                BoxShadow(
                  color: _primary.withOpacity(0.28),
                  blurRadius: 16,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: Row(
              children: [
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.18),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.search_rounded, color: Colors.white, size: 20),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        tr('where_to', lang),
                        style: GoogleFonts.outfit(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                      Text(
                        tr('destination_label', lang),
                        style: GoogleFonts.outfit(
                          fontSize: 11,
                          color: Colors.white.withOpacity(0.75),
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.18),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    'A → B',
                    style: GoogleFonts.outfit(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),

        const SizedBox(height: 14),

        // Quick service preview strip
        _QuickServiceStrip(selectedId: _selectedServiceId),

        const SizedBox(height: 4),
      ],
    );
  }

  // ── DESTINATION SELECTED state ───────────────────────────────────────────────

  Widget _buildDestinationSelectedState(RideDestinationSelected state, String lang) {
    final distKm  = state.distanceKm ?? 0.0;
    final durMin  = state.durationMin ?? 1;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // A/B address summary (compact, editable)
        _AddressSummary(
          originAddress: state.originAddress,
          destAddress: state.destAddress,
          onEditDest: widget.onTapWhereTo,
        ),

        const SizedBox(height: 14),

        // Route bar: A ─── 🚗 ─── B + distance/time from OSRM
        RouteSummaryBar(
          distanceKm: distKm,
          durationMin: durMin,
          originLabel: _shortLabel(state.originAddress),
          destLabel: _shortLabel(state.destAddress),
        ),

        const SizedBox(height: 20),

        // Section header
        Text(
          tr('choose_service', lang),
          style: GoogleFonts.outfit(
            fontSize: 15,
            fontWeight: FontWeight.bold,
            color: Colors.black87,
          ),
        ),

        const SizedBox(height: 12),

        // Vertical service cards — FareCalculator runs here
        YallaServiceList(
          selectedServiceId: _selectedServiceId,
          routeDistanceKm: distKm > 0 ? distKm : null,
          currentLang: lang,
          onSelectService: (id) => setState(() => _selectedServiceId = id),
        ),

        const SizedBox(height: 8),

        // Payment method row
        _PaymentRow(lang: lang),

        const SizedBox(height: 16),

        // Confirm button — Yalla primary #683EE6
        _ConfirmButton(
          label: tr('request_yalla', lang),
          onTap: () => widget.onRequestRide(_selectedServiceId),
          fare: FareCalculator.calculate(
            serviceId: _selectedServiceId,
            distanceKm: distKm,
          ),
        ),
      ],
    );
  }

  // ── SEARCHING DRIVER state ────────────────────────────────────────────────────

  Widget _buildSearchingState(String lang) {
    final ds = widget.rideState is RideDestinationSelected
        ? widget.rideState as RideDestinationSelected
        : null;
    final distKm = ds?.distanceKm;
    final durMin = ds?.durationMin;
    final destAddr = widget.destAddress;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const SizedBox(height: 8),

        // Animated Yalla VTC search pulse
        Center(
          child: AnimatedBuilder(
            animation: _pulseAnim,
            builder: (_, __) => Container(
              width: 68 * _pulseAnim.value,
              height: 68 * _pulseAnim.value,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: _primary.withOpacity(0.08 + 0.04 * _pulseAnim.value),
              ),
              child: Center(
                child: Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: const LinearGradient(
                      colors: [Color(0xFF7B52F0), Color(0xFF5A2ED6)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: _primary.withOpacity(0.35),
                        blurRadius: 16,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: const Icon(Icons.directions_car_rounded, color: Colors.white, size: 22),
                ),
              ),
            ),
          ),
        ),

        const SizedBox(height: 14),

        Text(
          tr('searching_driver', lang),
          style: GoogleFonts.outfit(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: _textPrimary,
          ),
          textAlign: TextAlign.center,
        ),

        const SizedBox(height: 4),

        Text(
          tr('searching_subtitle', lang),
          style: GoogleFonts.outfit(fontSize: 12, color: _textSecond),
          textAlign: TextAlign.center,
        ),

        const SizedBox(height: 16),

        // Route context bar
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          decoration: BoxDecoration(
            color: const Color(0xFFF7F8FA),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: const Color(0xFFE8E8F0)),
          ),
          child: Row(
            children: [
              const Icon(Icons.my_location_rounded, color: Color(0xFF22C55E), size: 16),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  widget.originAddress.isNotEmpty
                      ? widget.originAddress
                      : tr('current_location', lang),
                  style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.w600, color: _textPrimary),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 8),
                child: Icon(Icons.arrow_forward_rounded, size: 14, color: _textSecond),
              ),
              const Icon(Icons.location_on_rounded, color: Color(0xFF683EE6), size: 16),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  destAddr.isNotEmpty ? destAddr : '...',
                  style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.bold, color: _textPrimary),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ),

        // Distance + ETA if available
        if (distKm != null) ...[
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _StatChip(
                icon: Icons.straighten_rounded,
                label: '${distKm.toStringAsFixed(1)} km',
                color: _primary,
              ),
              if (durMin != null)
                _StatChip(
                  icon: Icons.schedule_rounded,
                  label: '$durMin min',
                  color: _primary,
                ),
              _StatChip(
                icon: Icons.payments_outlined,
                label: FareCalculator.format(
                  FareCalculator.calculate(
                    serviceId: _selectedServiceId,
                    distanceKm: distKm,
                  ) ?? 0,
                ),
                color: const Color(0xFF22C55E),
              ),
            ],
          ),
        ],

        const SizedBox(height: 20),

        // Cancel button — always accessible
        SizedBox(
          width: double.infinity,
          height: 48,
          child: OutlinedButton(
            style: OutlinedButton.styleFrom(
              foregroundColor: const Color(0xFFEF4444),
              side: const BorderSide(color: Color(0xFFEF4444)),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(14),
              ),
            ),
            onPressed: widget.onCancelRide,
            child: Text(
              tr('cancel_ride', lang),
              style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 15),
            ),
          ),
        ),
        const SizedBox(height: 8),
      ],
    );
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  String _shortLabel(String address) {
    if (address.isEmpty) return '';
    final parts = address.split(' / ');
    return parts.first.trim().split(' ').take(3).join(' ');
  }
}

// ── Sub-widgets ───────────────────────────────────────────────────────────────

class _HandleBar extends StatelessWidget {
  @override
  Widget build(BuildContext context) => Center(
        child: Container(
          width: 40,
          height: 4,
          margin: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: Colors.grey[300],
            borderRadius: BorderRadius.circular(2),
          ),
        ),
      );
}

class _StatChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  const _StatChip({required this.icon, required this.label, required this.color});

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
        decoration: BoxDecoration(
          color: color.withOpacity(0.08),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: color.withOpacity(0.2)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 13, color: color),
            const SizedBox(width: 5),
            Text(
              label,
              style: GoogleFonts.outfit(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
          ],
        ),
      );
}



class _AddressSummary extends StatelessWidget {
  final String originAddress;
  final String destAddress;
  final VoidCallback onEditDest;

  const _AddressSummary({
    required this.originAddress,
    required this.destAddress,
    required this.onEditDest,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFF8F7FF),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE8E4FA)),
      ),
      child: Column(
        children: [
          Row(
            children: [
              const Icon(Icons.my_location_rounded, color: Color(0xFF22C55E), size: 16),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  originAddress,
                  style: GoogleFonts.outfit(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.black87),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 6),
            child: Divider(height: 1, color: Colors.grey[200]),
          ),
          Row(
            children: [
              const Icon(Icons.location_on_rounded, color: Color(0xFF683EE6), size: 16),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  destAddress,
                  style: GoogleFonts.outfit(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.black87),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              GestureDetector(
                onTap: onEditDest,
                child: Icon(Icons.edit_outlined, size: 16, color: Colors.grey[400]),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _QuickServiceStrip extends StatelessWidget {
  final String selectedId;
  const _QuickServiceStrip({required this.selectedId});

  static const Color _primary = Color(0xFF683EE6);

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 44,
      child: ListView(
        scrollDirection: Axis.horizontal,
        children: ServiceFareConfig.all.map((cfg) {
          final isSel = selectedId == cfg.serviceId;
          return Container(
            margin: const EdgeInsets.only(right: 8),
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            decoration: BoxDecoration(
              color: isSel ? _primary : const Color(0xFFF5F5F5),
              borderRadius: BorderRadius.circular(22),
              border: Border.all(
                color: isSel ? _primary : const Color(0xFFE0E0E0),
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  YallaServiceCard.iconForId(cfg.serviceId),
                  size: 14,
                  color: isSel ? Colors.white : Colors.grey[600],
                ),
                const SizedBox(width: 6),
                Text(
                  cfg.displayName,
                  style: GoogleFonts.outfit(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: isSel ? Colors.white : Colors.grey[700],
                  ),
                ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }
}

class _PaymentRow extends StatelessWidget {
  final String lang;
  const _PaymentRow({required this.lang});

  @override
  Widget build(BuildContext context) => Row(
        children: [
          const Icon(Icons.payments_outlined, color: Color(0xFF22C55E), size: 18),
          const SizedBox(width: 8),
          Text(
            tr('cash_payment', lang),
            style: GoogleFonts.outfit(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.grey[700]),
          ),
          const Spacer(),
          const Icon(Icons.check_circle_rounded, color: Color(0xFF22C55E), size: 16),
        ],
      );
}

class _ConfirmButton extends StatelessWidget {
  final String label;
  final VoidCallback onTap;
  final double? fare;

  const _ConfirmButton({required this.label, required this.onTap, this.fare});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 56,
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFF683EE6),
          foregroundColor: Colors.white,
          elevation: 4,
          shadowColor: const Color(0xFF683EE6).withOpacity(0.4),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        ),
        onPressed: onTap,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              label,
              style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
            ),
            if (fare != null) ...[
              const SizedBox(width: 10),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  FareCalculator.format(fare!),
                  style: GoogleFonts.outfit(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

// ── RTL helper (avoids importing app_translations internals) ─────────────────

bool isRightToLeft(String lang) => lang == 'ar';
