// lib/features/ride/presentation/widgets/route_summary_bar.dart
// Yalla VTC — Animated Compact A→B Route Summary Bar
//
// Features:
//   • Smooth animated car movement along the track from A to B on load/selection.
//   • Track fill animation in Yalla primary violet #683EE6 behind the moving car.
//   • Clean, modern typography and chips.
//   • Pure UI animation — zero backend/routing side-effects.

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class RouteSummaryBar extends StatefulWidget {
  final double distanceKm;
  final int durationMin;
  final String originLabel;
  final String destLabel;

  const RouteSummaryBar({
    super.key,
    required this.distanceKm,
    required this.durationMin,
    required this.originLabel,
    required this.destLabel,
  });

  @override
  State<RouteSummaryBar> createState() => _RouteSummaryBarState();
}

class _RouteSummaryBarState extends State<RouteSummaryBar>
    with SingleTickerProviderStateMixin {
  late AnimationController _animController;
  late Animation<double> _carProgress;

  static const Color _primaryColor = Color(0xFF683EE6);
  static const Color _pickupColor  = Color(0xFF22C55E);

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1600),
    );

    _carProgress = CurvedAnimation(
      parent: _animController,
      curve: Curves.easeInOutCubic,
    );

    _animController.forward();
  }

  @override
  void didUpdateWidget(covariant RouteSummaryBar oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.destLabel != widget.destLabel ||
        oldWidget.distanceKm != widget.distanceKm) {
      _animController.reset();
      _animController.forward();
    }
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: const Color(0xFFF8F7FF),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFE8E4FA), width: 1.2),
        boxShadow: const [
          BoxShadow(
            color: Color(0x08683EE6),
            blurRadius: 10,
            offset: Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        children: [
          // ── Animated A ── 🚗 ── B track ──────────────────────────────────
          SizedBox(
            height: 32,
            child: AnimatedBuilder(
              animation: _carProgress,
              builder: (context, child) {
                final progress = _carProgress.value;

                return LayoutBuilder(
                  builder: (context, constraints) {
                    final totalWidth = constraints.maxWidth;
                    const dotSize = 12.0;
                    const carSize = 28.0;

                    // Available path for car center between A dot and B dot
                    const startX = dotSize / 2;
                    final endX = totalWidth - dotSize / 2;
                    final carX = startX + (endX - startX) * progress;

                    return Stack(
                      alignment: Alignment.centerLeft,
                      children: [
                        // Background track line (Full dashed track)
                        Positioned(
                          left: dotSize,
                          right: dotSize,
                          child: Container(
                            height: 2,
                            color: const Color(0xFFE2E8F0),
                          ),
                        ),

                        // Animated active progress track (Filled with #683ee6)
                        Positioned(
                          left: dotSize / 2,
                          width: (carX - dotSize / 2).clamp(0.0, totalWidth),
                          child: Container(
                            height: 3,
                            decoration: BoxDecoration(
                              color: _primaryColor,
                              borderRadius: BorderRadius.circular(1.5),
                              boxShadow: [
                                BoxShadow(
                                  color: _primaryColor.withOpacity(0.35),
                                  blurRadius: 4,
                                  offset: const Offset(0, 1),
                                ),
                              ],
                            ),
                          ),
                        ),

                        // Point A (Pickup Green Dot)
                        Positioned(
                          left: 0,
                          child: Container(
                            width: dotSize,
                            height: dotSize,
                            decoration: BoxDecoration(
                              color: _pickupColor,
                              shape: BoxShape.circle,
                              border: Border.all(color: Colors.white, width: 2),
                              boxShadow: [
                                BoxShadow(
                                  color: _pickupColor.withOpacity(0.4),
                                  blurRadius: 4,
                                ),
                              ],
                            ),
                          ),
                        ),

                        // Point B (Destination Violet Dot)
                        Positioned(
                          right: 0,
                          child: Container(
                            width: dotSize,
                            height: dotSize,
                            decoration: BoxDecoration(
                              color: _primaryColor,
                              shape: BoxShape.circle,
                              border: Border.all(color: Colors.white, width: 2),
                              boxShadow: [
                                BoxShadow(
                                  color: _primaryColor.withOpacity(0.4),
                                  blurRadius: 4,
                                ),
                              ],
                            ),
                          ),
                        ),

                        // Animated Moving Car Icon (#683ee6)
                        Positioned(
                          left: (carX - carSize / 2).clamp(
                            0.0,
                            totalWidth - carSize,
                          ),
                          child: Container(
                            width: carSize,
                            height: carSize,
                            decoration: BoxDecoration(
                              color: _primaryColor,
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(
                                  color: _primaryColor.withOpacity(0.35),
                                  blurRadius: 8,
                                  offset: const Offset(0, 2),
                                ),
                              ],
                            ),
                            child: const Icon(
                              Icons.directions_car_rounded,
                              color: Colors.white,
                              size: 16,
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

          const SizedBox(height: 10),

          // ── Origin / Dest labels + Distance & Time Chips ──────────────────
          Row(
            children: [
              // A Label (Origin)
              Expanded(
                child: Text(
                  widget.originLabel,
                  style: GoogleFonts.outfit(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: _pickupColor,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),

              const SizedBox(width: 6),

              // Distance Chip
              _StatChip(
                icon: Icons.straighten_rounded,
                label: () {
                  final km = widget.distanceKm;
                  final str3 = km.toStringAsFixed(3);
                  final formatted = str3.endsWith('000') || str3.endsWith('00')
                      ? km.toStringAsFixed(1)
                      : (str3.endsWith('0') ? km.toStringAsFixed(2) : str3);
                  return '$formatted km';
                }(),
                color: _primaryColor,
              ),

              const SizedBox(width: 6),

              // Duration Chip
              _StatChip(
                icon: Icons.access_time_rounded,
                label: '${widget.durationMin} min',
                color: _primaryColor,
              ),

              const SizedBox(width: 6),

              // B Label (Destination)
              Expanded(
                child: Text(
                  widget.destLabel,
                  style: GoogleFonts.outfit(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: _primaryColor,
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
    );
  }
}

// ── Sub-widgets ───────────────────────────────────────────────────────────────

class _StatChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;

  const _StatChip({
    required this.icon,
    required this.label,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.08),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: color),
          const SizedBox(width: 4),
          Text(
            label,
            style: GoogleFonts.outfit(
              fontSize: 11,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}
