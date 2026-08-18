// lib/features/ride/presentation/widgets/map_route_pill.dart
// Yalla VTC — Floating Animated Route Pill (Map Overlay)
//
// Appears above the map when destination B is selected.
// The track fill slides from A → B in #683EE6 with smooth
// easeInOutCubic over 1400 ms.  Disappears when ride resets.

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class MapRoutePill extends StatefulWidget {
  final String originLabel;
  final String destLabel;
  final double distanceKm;
  final int durationMin;

  const MapRoutePill({
    super.key,
    required this.originLabel,
    required this.destLabel,
    required this.distanceKm,
    required this.durationMin,
  });

  @override
  State<MapRoutePill> createState() => _MapRoutePillState();
}

class _MapRoutePillState extends State<MapRoutePill>
    with SingleTickerProviderStateMixin {
  // ── Constants ──────────────────────────────────────────────────────────────
  static const Color _violet   = Color(0xFF683EE6);
  static const Color _green    = Color(0xFF22C55E);
  static const Color _trackBg  = Color(0xFFDDD8F7);

  late AnimationController _ctrl;
  late Animation<double>    _fillAnim;
  late Animation<double>    _fadeAnim;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    );

    _fillAnim = CurvedAnimation(parent: _ctrl, curve: Curves.easeInOutCubic);
    _fadeAnim = CurvedAnimation(parent: _ctrl, curve: const Interval(0.0, 0.25));

    _ctrl.forward();
  }

  @override
  void didUpdateWidget(covariant MapRoutePill old) {
    super.didUpdateWidget(old);
    // Re-animate when destination changes
    if (old.destLabel != widget.destLabel ||
        old.distanceKm != widget.distanceKm) {
      _ctrl.reset();
      _ctrl.forward();
    }
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  // ─────────────────────────────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _fadeAnim,
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 16),
        padding: const EdgeInsets.fromLTRB(14, 10, 14, 10),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: _violet.withOpacity(0.18),
              blurRadius: 16,
              offset: const Offset(0, 6),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // ── Animated Track ─────────────────────────────────────────────
            SizedBox(
              height: 28,
              child: AnimatedBuilder(
                animation: _fillAnim,
                builder: (ctx, _) {
                  final p = _fillAnim.value;
                  return LayoutBuilder(
                    builder: (ctx, bc) {
                      const dotR   = 6.0;   // radius of endpoint dots
                      const carD   = 24.0;  // car circle diameter
                      final total  = bc.maxWidth;

                      // Car center X: travels from dotR to (total − dotR)
                      const startX = dotR;
                      final endX   = total - dotR;
                      final carX   = startX + (endX - startX) * p;

                      return Stack(
                        alignment: Alignment.center,
                        children: [
                          // Grey background track
                          Positioned(
                            left: dotR,
                            right: dotR,
                            top: 13,
                            child: Container(height: 2, color: _trackBg),
                          ),

                          // #683EE6 filled progress track
                          Positioned(
                            left: dotR,
                            top: 12,
                            width: (carX - dotR).clamp(0, total - dotR * 2),
                            child: Container(
                              height: 4,
                              decoration: BoxDecoration(
                                gradient: LinearGradient(
                                  colors: [
                                    _violet.withOpacity(0.7),
                                    _violet,
                                  ],
                                ),
                                borderRadius: BorderRadius.circular(2),
                                boxShadow: [
                                  BoxShadow(
                                    color: _violet.withOpacity(0.4),
                                    blurRadius: 6,
                                    offset: const Offset(0, 1),
                                  ),
                                ],
                              ),
                            ),
                          ),

                          // Point A — green dot
                          const Positioned(
                            left: 0,
                            child: _EndDot(color: _green),
                          ),

                          // Point B — violet dot
                          const Positioned(
                            right: 0,
                            child: _EndDot(color: _violet),
                          ),

                          // Moving car icon
                          Positioned(
                            left: (carX - carD / 2).clamp(0.0, total - carD),
                            child: Container(
                              width: carD,
                              height: carD,
                              decoration: BoxDecoration(
                                color: _violet,
                                shape: BoxShape.circle,
                                boxShadow: [
                                  BoxShadow(
                                    color: _violet.withOpacity(0.4),
                                    blurRadius: 8,
                                    offset: const Offset(0, 3),
                                  ),
                                ],
                              ),
                              child: const Icon(
                                Icons.directions_car_rounded,
                                color: Colors.white,
                                size: 14,
                              ),
                            ),
                          ),
                        ],
                      );
                    },
                  );
                },
              ),
            ),

            const SizedBox(height: 8),

            // ── Labels + chips ──────────────────────────────────────────────
            Row(
              children: [
                // A label
                Expanded(
                  child: Text(
                    widget.originLabel,
                    style: GoogleFonts.outfit(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: _green,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),

                // Distance chip
                _Chip(
                  icon: Icons.straighten_rounded,
                  label: '${widget.distanceKm.toStringAsFixed(1)} km',
                ),

                const SizedBox(width: 6),

                // Duration chip
                _Chip(
                  icon: Icons.access_time_rounded,
                  label: '${widget.durationMin} min',
                ),

                // B label
                Expanded(
                  child: Text(
                    widget.destLabel,
                    style: GoogleFonts.outfit(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: _violet,
                    ),
                    textAlign: TextAlign.end,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

class _EndDot extends StatelessWidget {
  final Color color;
  const _EndDot({required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 12,
      height: 12,
      decoration: BoxDecoration(
        color: color,
        shape: BoxShape.circle,
        border: Border.all(color: Colors.white, width: 2),
        boxShadow: [
          BoxShadow(color: color.withOpacity(0.4), blurRadius: 4),
        ],
      ),
    );
  }
}

class _Chip extends StatelessWidget {
  final IconData icon;
  final String   label;
  const _Chip({required this.icon, required this.label});

  static const Color _violet = Color(0xFF683EE6);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
      decoration: BoxDecoration(
        color: _violet.withOpacity(0.09),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 11, color: _violet),
          const SizedBox(width: 3),
          Text(
            label,
            style: GoogleFonts.outfit(
              fontSize: 10,
              fontWeight: FontWeight.bold,
              color: _violet,
            ),
          ),
        ],
      ),
    );
  }
}
