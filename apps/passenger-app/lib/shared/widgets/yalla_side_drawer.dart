// lib/shared/widgets/yalla_side_drawer.dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../l10n/app_translations.dart';

class YallaSideDrawer extends StatefulWidget {
  final String currentLang;
  final String passengerName;
  final Function(String) onSelectLanguage;
  final VoidCallback onLogout;
  final String currentRole; // 'PASSENGER' or 'DRIVER'
  final bool hasDriverProfile;
  final Function(String)? onRoleSwitch;
  final VoidCallback? onRegisterDriver;
  final VoidCallback? onOpenProfile;
  final VoidCallback? onOpenHistory;
  final VoidCallback? onOpenSettings;
  final VoidCallback? onOpenHelp;

  const YallaSideDrawer({
    super.key,
    required this.currentLang,
    required this.passengerName,
    required this.onSelectLanguage,
    required this.onLogout,
    this.currentRole = 'PASSENGER',
    this.hasDriverProfile = false,
    this.onRoleSwitch,
    this.onRegisterDriver,
    this.onOpenProfile,
    this.onOpenHistory,
    this.onOpenSettings,
    this.onOpenHelp,
  });

  @override
  State<YallaSideDrawer> createState() => _YallaSideDrawerState();
}

class _YallaSideDrawerState extends State<YallaSideDrawer> {
  late String _activeRole;

  @override
  void initState() {
    super.initState();
    _activeRole = widget.currentRole;
  }

  void _showDriverRegistrationDialog(BuildContext context, String lang) {
    final isArabic = isRTL(lang);
    showDialog(
      context: context,
      builder: (dialogContext) => Directionality(
        textDirection: isArabic ? TextDirection.rtl : TextDirection.ltr,
        child: AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          backgroundColor: Colors.white,
          title: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: const Color(0xFFE5B80B).withOpacity(0.2),
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.local_taxi_rounded, color: Color(0xFFB38B00), size: 24),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  tr('driver_reg_dialog_title', lang),
                  style: GoogleFonts.outfit(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.black87,
                  ),
                ),
              ),
            ],
          ),
          content: Text(
            tr('driver_reg_dialog_msg', lang),
            style: GoogleFonts.outfit(
              fontSize: 14,
              color: Colors.grey[700],
              height: 1.5,
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialogContext),
              child: Text(
                tr('driver_reg_cancel', lang),
                style: GoogleFonts.outfit(
                  color: Colors.grey[600],
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFE5B80B),
                foregroundColor: Colors.black,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                elevation: 0,
              ),
              onPressed: () {
                Navigator.pop(dialogContext);
                Navigator.pop(context); // Close drawer
                if (widget.onRegisterDriver != null) {
                  widget.onRegisterDriver!();
                }
              },
              child: Text(
                tr('driver_reg_continue', lang),
                style: GoogleFonts.outfit(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMenuItem({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
    bool isDanger = false,
  }) {
    final isArabic = isRTL(widget.currentLang);
    return ListTile(
      leading: Icon(
        icon,
        color: isDanger ? Colors.redAccent : Colors.black87,
        size: 22,
      ),
      title: Text(
        title,
        style: GoogleFonts.outfit(
          fontSize: 15,
          fontWeight: FontWeight.w500,
          color: isDanger ? Colors.redAccent : Colors.black87,
        ),
      ),
      trailing: Icon(
        isArabic ? Icons.chevron_left : Icons.chevron_right,
        color: Colors.grey[400],
        size: 20,
      ),
      onTap: onTap,
    );
  }

  Widget _buildRoleSegment({
    required String roleKey,
    required String title,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 220),
          curve: Curves.easeInOut,
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: isSelected ? const Color(0xFFE5B80B) : Colors.transparent,
            borderRadius: BorderRadius.circular(14),
            boxShadow: isSelected
                ? const [
                    BoxShadow(
                      color: Color(0x44E5B80B),
                      blurRadius: 8,
                      offset: Offset(0, 2),
                    )
                  ]
                : [],
          ),
          child: Center(
            child: Text(
              title,
              style: GoogleFonts.outfit(
                fontSize: 14,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
                color: isSelected ? Colors.black : Colors.white70,
              ),
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final lang = widget.currentLang;
    final isArabic = isRTL(lang);

    return Directionality(
      textDirection: isArabic ? TextDirection.rtl : TextDirection.ltr,
      child: Drawer(
        backgroundColor: Colors.white,
        child: Column(
          children: [
            // Header Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.only(top: 54, bottom: 20, left: 20, right: 20),
              decoration: const BoxDecoration(
                color: Color(0xFF1A1A1A),
                borderRadius: BorderRadius.only(
                  bottomRight: Radius.circular(24),
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      CircleAvatar(
                        radius: 26,
                        backgroundColor: const Color(0xFFE5B80B),
                        child: Text(
                          widget.passengerName.isNotEmpty ? widget.passengerName[0].toUpperCase() : 'Y',
                          style: GoogleFonts.outfit(
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                            color: Colors.black,
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              widget.passengerName,
                              style: GoogleFonts.outfit(
                                fontSize: 17,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 2),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(
                                color: const Color(0xFFE5B80B).withOpacity(0.2),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                _activeRole == 'PASSENGER'
                                    ? tr('passenger_label', lang)
                                    : tr('driver_label', lang),
                                style: GoogleFonts.outfit(
                                  fontSize: 12,
                                  color: const Color(0xFFE5B80B),
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 16),

                  // ── ROLE SWITCHER (Segmented Control) ──────────────────────
                  Text(
                    tr('current_mode', lang),
                    style: GoogleFonts.outfit(
                      fontSize: 11,
                      color: Colors.white54,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(18),
                      border: Border.all(color: Colors.white12, width: 1),
                    ),
                    child: Row(
                      children: [
                        _buildRoleSegment(
                          roleKey: 'PASSENGER',
                          title: tr('role_passenger', lang),
                          isSelected: _activeRole == 'PASSENGER',
                          onTap: () {
                            setState(() => _activeRole = 'PASSENGER');
                            if (widget.onRoleSwitch != null) {
                              widget.onRoleSwitch!('PASSENGER');
                            }
                          },
                        ),
                        _buildRoleSegment(
                          roleKey: 'DRIVER',
                          title: tr('role_driver', lang),
                          isSelected: _activeRole == 'DRIVER',
                          onTap: () {
                            if (widget.hasDriverProfile) {
                              setState(() => _activeRole = 'DRIVER');
                              if (widget.onRoleSwitch != null) {
                                widget.onRoleSwitch!('DRIVER');
                              }
                            } else {
                              _showDriverRegistrationDialog(context, lang);
                            }
                          },
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 8),

            // Menu Options
            Expanded(
              child: ListView(
                padding: EdgeInsets.zero,
                children: [
                  _buildMenuItem(
                    icon: Icons.person_outline,
                    title: tr('menu_profile', lang),
                    onTap: () {
                      Navigator.pop(context);
                      if (widget.onOpenProfile != null) {
                        widget.onOpenProfile!();
                      }
                    },
                  ),
                  _buildMenuItem(
                    icon: Icons.history_rounded,
                    title: tr('menu_my_rides', lang),
                    onTap: () {
                      Navigator.pop(context);
                      if (widget.onOpenHistory != null) {
                        widget.onOpenHistory!();
                      }
                    },
                  ),
                  _buildMenuItem(
                    icon: Icons.notifications_none_rounded,
                    title: tr('menu_notifications', lang),
                    onTap: () => Navigator.pop(context),
                  ),
                  _buildMenuItem(
                    icon: Icons.security_rounded,
                    title: tr('menu_security', lang),
                    onTap: () => Navigator.pop(context),
                  ),
                  _buildMenuItem(
                    icon: Icons.settings_outlined,
                    title: tr('menu_settings', lang),
                    onTap: () {
                      Navigator.pop(context);
                      if (widget.onOpenSettings != null) {
                        widget.onOpenSettings!();
                      }
                    },
                  ),
                  _buildMenuItem(
                    icon: Icons.help_outline_rounded,
                    title: tr('menu_help', lang),
                    onTap: () {
                      Navigator.pop(context);
                      if (widget.onOpenHelp != null) {
                        widget.onOpenHelp!();
                      }
                    },
                  ),
                  const Divider(indent: 20, endIndent: 20),

                  // Language Switcher Section
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20.0, vertical: 8.0),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'اللغة / Langue',
                          style: GoogleFonts.outfit(
                            fontSize: 13,
                            color: Colors.grey[600],
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        DropdownButton<String>(
                          value: widget.currentLang,
                          underline: const SizedBox(),
                          icon: const Icon(Icons.language, size: 18, color: Color(0xFFE5B80B)),
                          items: const [
                            DropdownMenuItem(value: 'ar', child: Text('العربية 🇸🇦')),
                            DropdownMenuItem(value: 'fr', child: Text('Français 🇫🇷')),
                            DropdownMenuItem(value: 'en', child: Text('English 🇬🇧')),
                            DropdownMenuItem(value: 'es', child: Text('Español 🇪🇸')),
                          ],
                          onChanged: (val) {
                            if (val != null) {
                              widget.onSelectLanguage(val);
                              Navigator.pop(context);
                            }
                          },
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Logout Footer
            Padding(
              padding: const EdgeInsets.all(16.0),
              child: _buildMenuItem(
                icon: Icons.logout_rounded,
                title: tr('menu_logout', lang),
                isDanger: true,
                onTap: widget.onLogout,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
