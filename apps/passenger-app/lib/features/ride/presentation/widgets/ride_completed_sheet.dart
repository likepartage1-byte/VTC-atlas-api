// lib/features/ride/presentation/widgets/ride_completed_sheet.dart
// Yalla VTC — Trip Completed Sheet
//
// Shown when RideCompleted is emitted from RideBloc.
// Features:
//   • Trip summary (A→B, distance, duration, driver)
//   • Total fare + payment method
//   • Star rating (5 stars)
//   • New trip / Repeat trip CTAs
//
// The sheet is non-dismissible (isDismissible: false in showModalBottomSheet)
// so the passenger must actively choose their next step.

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../shared/l10n/app_translations.dart';

class RideCompletedSheet extends StatefulWidget {
  final String currentLang;
  final double totalFare;
  final double distanceKm;
  final int durationMin;
  final String driverName;
  final String originAddress;
  final String destAddress;
  final VoidCallback onNewRide;
  final VoidCallback onRepeatRide;

  const RideCompletedSheet({
    super.key,
    required this.currentLang,
    required this.totalFare,
    required this.distanceKm,
    required this.durationMin,
    required this.driverName,
    required this.originAddress,
    required this.destAddress,
    required this.onNewRide,
    required this.onRepeatRide,
  });

  @override
  State<RideCompletedSheet> createState() => _RideCompletedSheetState();
}

class _RideCompletedSheetState extends State<RideCompletedSheet>
    with SingleTickerProviderStateMixin {
  int _selectedStars = 0;
  bool _ratingSubmitted = false;
  final Set<String> _selectedCompliments = {};

  void _toggleCompliment(String key) {
    setState(() {
      if (_selectedCompliments.contains(key)) {
        _selectedCompliments.remove(key);
      } else {
        _selectedCompliments.add(key);
      }
    });
  }

  late AnimationController _checkCtrl;
  late Animation<double> _checkScale;

  static const Color _primary = Color(0xFF683EE6);
  static const Color _green = Color(0xFF22C55E);
  static const Color _amber = Color(0xFFE5B80B);
  static const Color _textMain = Color(0xFF1A1A2E);
  static const Color _textSub = Color(0xFF6B7280);

  @override
  void initState() {
    super.initState();
    _checkCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    _checkScale = CurvedAnimation(parent: _checkCtrl, curve: Curves.elasticOut);
    _checkCtrl.forward();
  }

  @override
  void dispose() {
    _checkCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final lang = widget.currentLang;
    final isRTL = lang == 'ar';

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
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 24),
            child: Column(
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

                // ── Completion checkmark ─────────────────────────────────────
                Center(
                  child: ScaleTransition(
                    scale: _checkScale,
                    child: Container(
                      width: 72,
                      height: 72,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        gradient: const LinearGradient(
                          colors: [Color(0xFF34D399), Color(0xFF22C55E)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: _green.withOpacity(0.35),
                            blurRadius: 18,
                            offset: const Offset(0, 6),
                          ),
                        ],
                      ),
                      child: const Icon(Icons.check_rounded, color: Colors.white, size: 36),
                    ),
                  ),
                ),

                const SizedBox(height: 16),

                Text(
                  tr('trip_completed', lang),
                  style: GoogleFonts.outfit(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: _textMain,
                  ),
                  textAlign: TextAlign.center,
                ),

                const SizedBox(height: 4),

                if (widget.driverName.isNotEmpty)
                  Text(
                    '${tr('with_driver', lang)} ${widget.driverName}',
                    style: GoogleFonts.outfit(
                      fontSize: 13,
                      color: _textSub,
                    ),
                    textAlign: TextAlign.center,
                  ),

                const SizedBox(height: 20),

                // ── Route summary ────────────────────────────────────────────
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF7F8FA),
                    borderRadius: BorderRadius.circular(18),
                    border: Border.all(color: const Color(0xFFE8E8F0)),
                  ),
                  child: Column(
                    children: [
                      // Origin
                      Row(
                        children: [
                          Container(
                            width: 10,
                            height: 10,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: _green,
                              boxShadow: [
                                BoxShadow(
                                    color: _green.withOpacity(0.4),
                                    blurRadius: 6),
                              ],
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              widget.originAddress.isNotEmpty
                                  ? widget.originAddress
                                  : tr('current_location', lang),
                              style: GoogleFonts.outfit(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: _textMain,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                      Padding(
                        padding: const EdgeInsets.only(left: 4, top: 4, bottom: 4),
                        child: Column(
                          children: List.generate(
                            3,
                            (_) => Container(
                              width: 1.5,
                              height: 4,
                              margin: const EdgeInsets.only(bottom: 2),
                              color: const Color(0xFFD1D5DB),
                            ),
                          ),
                        ),
                      ),
                      // Destination
                      Row(
                        children: [
                          Container(
                            width: 10,
                            height: 10,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: _primary,
                              boxShadow: [
                                BoxShadow(
                                    color: _primary.withOpacity(0.4),
                                    blurRadius: 6),
                              ],
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              widget.destAddress,
                              style: GoogleFonts.outfit(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: _textMain,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 12),

                // ── Distance / Duration / Price chips ────────────────────────
                Row(
                  children: [
                    if (widget.distanceKm > 0)
                      Expanded(
                        child: _SummaryChip(
                          icon: Icons.straighten_rounded,
                          label: '${widget.distanceKm.toStringAsFixed(1)} km',
                          color: _primary,
                        ),
                      ),
                    if (widget.distanceKm > 0) const SizedBox(width: 8),
                    if (widget.durationMin > 0)
                      Expanded(
                        child: _SummaryChip(
                          icon: Icons.schedule_rounded,
                          label: '${widget.durationMin} min',
                          color: _textSub,
                        ),
                      ),
                    if (widget.durationMin > 0) const SizedBox(width: 8),
                    Expanded(
                      child: _SummaryChip(
                        icon: Icons.payments_rounded,
                        label: '${widget.totalFare.toStringAsFixed(0)} DH',
                        color: _green,
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 12),

                // ── Payment row ──────────────────────────────────────────────
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF7F8FA),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: const Color(0xFFE8E8F0)),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: _green.withOpacity(0.12),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(Icons.payments_rounded,
                            color: Color(0xFF22C55E), size: 16),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          tr('cash_payment', lang),
                          style: GoogleFonts.outfit(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: _textSub,
                          ),
                        ),
                      ),
                      Text(
                        '${widget.totalFare.toStringAsFixed(0)} DH',
                        style: GoogleFonts.outfit(
                          fontSize: 17,
                          fontWeight: FontWeight.bold,
                          color: _textMain,
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 24),

                // ── Star rating & compliments ────────────────────────────────
                _ratingSubmitted
                    ? _RatingThanks(lang: lang)
                    : Column(
                        children: [
                          Text(
                            tr('rate_trip', lang),
                            style: GoogleFonts.outfit(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                              color: _textMain,
                            ),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 12),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: List.generate(5, (i) {
                              final filled = i < _selectedStars;
                              return GestureDetector(
                                onTap: () {
                                  setState(() => _selectedStars = i + 1);
                                },
                                child: AnimatedContainer(
                                  duration: const Duration(milliseconds: 150),
                                  padding: const EdgeInsets.all(4),
                                  child: Icon(
                                    filled
                                        ? Icons.star_rounded
                                        : Icons.star_outline_rounded,
                                    color: filled ? _amber : Colors.grey[300],
                                    size: filled ? 38 : 34,
                                  ),
                                ),
                              );
                            }),
                          ),
                          if (_selectedStars >= 4) ...[
                            const SizedBox(height: 14),
                            Wrap(
                              spacing: 8,
                              runSpacing: 8,
                              alignment: WrapAlignment.center,
                              children: [
                                _ComplimentToggleChip(
                                  label: tr('great_conversation', lang),
                                  isSelected: _selectedCompliments.contains('conversation'),
                                  onTap: () => _toggleCompliment('conversation'),
                                ),
                                _ComplimentToggleChip(
                                  label: tr('clean_car', lang),
                                  isSelected: _selectedCompliments.contains('clean'),
                                  onTap: () => _toggleCompliment('clean'),
                                ),
                                _ComplimentToggleChip(
                                  label: tr('good_routes', lang),
                                  isSelected: _selectedCompliments.contains('route'),
                                  onTap: () => _toggleCompliment('route'),
                                ),
                                _ComplimentToggleChip(
                                  label: tr('on_time', lang),
                                  isSelected: _selectedCompliments.contains('punctual'),
                                  onTap: () => _toggleCompliment('punctual'),
                                ),
                              ],
                            ),
                          ],
                          if (_selectedStars > 0) ...[
                            const SizedBox(height: 14),
                            SizedBox(
                              height: 40,
                              child: ElevatedButton(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: _primary,
                                  foregroundColor: Colors.white,
                                  elevation: 0,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                ),
                                onPressed: () {
                                  setState(() => _ratingSubmitted = true);
                                },
                                child: Text(
                                  tr('confirm', lang),
                                  style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 13),
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),

                const SizedBox(height: 24),

                // ── Action buttons ───────────────────────────────────────────
                SizedBox(
                  height: 52,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: _primary,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shadowColor: _primary.withOpacity(0.35),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                    onPressed: widget.onNewRide,
                    child: Text(
                      tr('new_ride', lang),
                      style: GoogleFonts.outfit(
                        fontWeight: FontWeight.bold,
                        fontSize: 15,
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 10),

                SizedBox(
                  height: 48,
                  child: OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      foregroundColor: _primary,
                      side: const BorderSide(color: Color(0xFF683EE6), width: 1.5),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                    onPressed: widget.onRepeatRide,
                    icon: const Icon(Icons.replay_rounded, size: 16),
                    label: Text(
                      tr('repeat_ride', lang),
                      style: GoogleFonts.outfit(
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
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

// ── Sub-widgets ───────────────────────────────────────────────────────────────

class _SummaryChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;

  const _SummaryChip({
    required this.icon,
    required this.label,
    required this.color,
  });

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 10),
        decoration: BoxDecoration(
          color: color.withOpacity(0.07),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withOpacity(0.18)),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 16),
            const SizedBox(height: 4),
            Text(
              label,
              style: GoogleFonts.outfit(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: color,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      );
}

class _RatingThanks extends StatelessWidget {
  final String lang;
  const _RatingThanks({required this.lang});

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: const Color(0xFFF0FDF4),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: const Color(0xFF22C55E).withOpacity(0.3)),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.favorite_rounded, color: Color(0xFF22C55E), size: 18),
            const SizedBox(width: 8),
            Text(
              tr('rating_thanks', lang),
              style: GoogleFonts.outfit(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: const Color(0xFF16A34A),
              ),
            ),
          ],
        ),
      );
}

class _ComplimentToggleChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _ComplimentToggleChip({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) => GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
          decoration: BoxDecoration(
            color: isSelected ? const Color(0xFF683EE6) : const Color(0xFFF7F8FA),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: isSelected ? const Color(0xFF683EE6) : const Color(0xFFE8E8F0),
            ),
          ),
          child: Text(
            label,
            style: GoogleFonts.outfit(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: isSelected ? Colors.white : const Color(0xFF1A1A2E),
            ),
          ),
        ),
      );
}
