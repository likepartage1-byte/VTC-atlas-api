// lib/features/ride/presentation/widgets/share_trip_sheet.dart
// Yalla VTC — Share Trip Sheet
//
// Allows the passenger to share their live trip with a trusted contact.
// Architecture built for future real-time link backend — UI works as shell now.

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../shared/l10n/app_translations.dart';

class ShareTripSheet extends StatefulWidget {
  final String currentLang;

  const ShareTripSheet({super.key, required this.currentLang});

  @override
  State<ShareTripSheet> createState() => _ShareTripSheetState();
}

class _ShareTripSheetState extends State<ShareTripSheet> {
  bool _linkCopied = false;

  static const Color _primary = Color(0xFF683EE6);
  static const Color _primaryLight = Color(0xFFF3F0FF);
  static const Color _textMain = Color(0xFF1A1A2E);
  static const Color _textSub = Color(0xFF6B7280);

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

                // Icon + Title
                Row(
                  children: [
                    Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        color: _primaryLight,
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: const Icon(
                        Icons.share_location_rounded,
                        color: Color(0xFF683EE6),
                        size: 24,
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            tr('share_trip', lang),
                            style: GoogleFonts.outfit(
                              fontSize: 19,
                              fontWeight: FontWeight.bold,
                              color: _textMain,
                            ),
                          ),
                          Text(
                            tr('share_trip_subtitle', lang),
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
                      icon: const Icon(Icons.close_rounded, color: Color(0xFF6B7280)),
                    ),
                  ],
                ),

                const SizedBox(height: 24),

                // How it works cards
                _HowItWorksCard(
                  step: '1',
                  icon: Icons.link_rounded,
                  title: tr('share_step1_title', lang),
                  desc: tr('share_step1_desc', lang),
                ),
                const SizedBox(height: 10),
                _HowItWorksCard(
                  step: '2',
                  icon: Icons.person_pin_circle_rounded,
                  title: tr('share_step2_title', lang),
                  desc: tr('share_step2_desc', lang),
                ),
                const SizedBox(height: 10),
                _HowItWorksCard(
                  step: '3',
                  icon: Icons.lock_rounded,
                  title: tr('share_step3_title', lang),
                  desc: tr('share_step3_desc', lang),
                ),

                const SizedBox(height: 24),

                // Share link placeholder
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF7F8FA),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: const Color(0xFFE8E8F0)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.link_rounded, color: Color(0xFF683EE6), size: 18),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          'yallavtc.ma/share/••••••••',
                          style: GoogleFonts.outfit(
                            fontSize: 13,
                            color: _textSub,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                      AnimatedSwitcher(
                        duration: const Duration(milliseconds: 200),
                        child: _linkCopied
                            ? const Icon(Icons.check_circle_rounded,
                                color: Color(0xFF22C55E), size: 20, key: ValueKey('copied'))
                            : const Icon(Icons.copy_rounded,
                                color: _primary, size: 18, key: ValueKey('copy')),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 16),

                // Primary share CTA
                SizedBox(
                  height: 52,
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: _primary,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shadowColor: _primary.withOpacity(0.4),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                    onPressed: () => _onShareTap(context, lang),
                    icon: const Icon(Icons.share_rounded, size: 18),
                    label: Text(
                      tr('share_trip_cta', lang),
                      style: GoogleFonts.outfit(
                        fontWeight: FontWeight.bold,
                        fontSize: 15,
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

  void _onShareTap(BuildContext context, String lang) {
    // When backend live link is ready: use Share.share(realLink)
    // For now: simulate copy + show feedback
    Clipboard.setData(const ClipboardData(text: 'https://yallavtc.ma/share/demo'));
    setState(() => _linkCopied = true);
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) setState(() => _linkCopied = false);
    });
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          tr('share_copied', lang),
          style: GoogleFonts.outfit(fontWeight: FontWeight.w600),
        ),
        backgroundColor: const Color(0xFF22C55E),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        duration: const Duration(seconds: 2),
      ),
    );
  }
}

class _HowItWorksCard extends StatelessWidget {
  final String step;
  final IconData icon;
  final String title;
  final String desc;

  const _HowItWorksCard({
    required this.step,
    required this.icon,
    required this.title,
    required this.desc,
  });

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: const Color(0xFFF7F8FA),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: const Color(0xFFE8E8F0)),
        ),
        child: Row(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: const Color(0xFF683EE6).withOpacity(0.10),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Center(
                child: Text(
                  step,
                  style: GoogleFonts.outfit(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: const Color(0xFF683EE6),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Icon(icon, size: 18, color: const Color(0xFF683EE6)),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: GoogleFonts.outfit(
                      fontSize: 13,
                      fontWeight: FontWeight.bold,
                      color: const Color(0xFF1A1A2E),
                    ),
                  ),
                  Text(
                    desc,
                    style: GoogleFonts.outfit(
                      fontSize: 11,
                      color: const Color(0xFF6B7280),
                      height: 1.4,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      );
}
