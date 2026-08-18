// lib/features/settings/presentation/settings_page.dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../../shared/l10n/app_translations.dart';

class SettingsPage extends StatefulWidget {
  final String currentLang;
  final Function(String) onSelectLanguage;

  const SettingsPage({
    super.key,
    required this.currentLang,
    required this.onSelectLanguage,
  });

  @override
  State<SettingsPage> createState() => _SettingsPageState();
}

class _SettingsPageState extends State<SettingsPage> {
  final storage = const FlutterSecureStorage();
  bool _pushNotifications = true;
  bool _soundEnabled = true;
  late String _selectedLang;

  @override
  void initState() {
    super.initState();
    _selectedLang = widget.currentLang;
    _loadSettings();
  }

  Future<void> _loadSettings() async {
    final push = await storage.read(key: 'setting_push') ?? 'true';
    final sound = await storage.read(key: 'setting_sound') ?? 'true';
    setState(() {
      _pushNotifications = push == 'true';
      _soundEnabled = sound == 'true';
    });
  }

  Future<void> _togglePush(bool val) async {
    setState(() => _pushNotifications = val);
    await storage.write(key: 'setting_push', value: val.toString());
  }

  Future<void> _toggleSound(bool val) async {
    setState(() => _soundEnabled = val);
    await storage.write(key: 'setting_sound', value: val.toString());
  }

  @override
  Widget build(BuildContext context) {
    final isArabic = isRTL(_selectedLang);

    return Directionality(
      textDirection: isArabic ? TextDirection.rtl : TextDirection.ltr,
      child: Scaffold(
        backgroundColor: Colors.grey[100],
        appBar: AppBar(
          backgroundColor: const Color(0xFF1A1A1A),
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white, size: 20),
            onPressed: () => Navigator.pop(context),
          ),
          title: Text(
            tr('menu_settings', _selectedLang),
            style: GoogleFonts.outfit(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          centerTitle: true,
        ),
        body: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            // Language Preference Card
            _buildCard(
              title: _selectedLang == 'ar' ? 'اللغة' : 'Langue / Language',
              child: Column(
                children: [
                  _buildLangTile('ar', 'العربية 🇸🇦'),
                  const Divider(height: 1),
                  _buildLangTile('fr', 'Français 🇫🇷'),
                  const Divider(height: 1),
                  _buildLangTile('en', 'English 🇬🇧'),
                  const Divider(height: 1),
                  _buildLangTile('es', 'Español 🇪🇸'),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Notifications & Sound Card
            _buildCard(
              title: _selectedLang == 'ar' ? 'التنبيهات والصوت' : 'Notifications & Sound',
              child: Column(
                children: [
                  SwitchListTile(
                    activeColor: const Color(0xFFE5B80B),
                    title: Text(
                      _selectedLang == 'ar' ? 'الإشعارات الفورية' : 'Notifications push',
                      style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.w500),
                    ),
                    value: _pushNotifications,
                    onChanged: _togglePush,
                  ),
                  const Divider(height: 1),
                  SwitchListTile(
                    activeColor: const Color(0xFFE5B80B),
                    title: Text(
                      _selectedLang == 'ar' ? 'أصوات التنبيهات' : 'Sons de notification',
                      style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.w500),
                    ),
                    value: _soundEnabled,
                    onChanged: _toggleSound,
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Default Payment Method Card
            _buildCard(
              title: _selectedLang == 'ar' ? 'طريقة الدفع الافتراضية' : 'Mode de paiement par défaut',
              child: ListTile(
                leading: const Icon(Icons.payments_outlined, color: Color(0xFFE5B80B)),
                title: Text(
                  tr('cash_payment', _selectedLang),
                  style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.w600),
                ),
                trailing: const Icon(Icons.check_circle_rounded, color: Color(0xFF2E7D32)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCard({required String title, required Widget child}) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.only(left: 16, right: 16, top: 16, bottom: 8),
            child: Text(
              title,
              style: GoogleFonts.outfit(
                fontSize: 13,
                fontWeight: FontWeight.bold,
                color: Colors.grey[600],
              ),
            ),
          ),
          child,
        ],
      ),
    );
  }

  Widget _buildLangTile(String langCode, String label) {
    final isSelected = _selectedLang == langCode;
    return ListTile(
      title: Text(
        label,
        style: GoogleFonts.outfit(
          fontSize: 15,
          fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
          color: isSelected ? const Color(0xFFE5B80B) : Colors.black87,
        ),
      ),
      trailing: isSelected ? const Icon(Icons.check_rounded, color: Color(0xFFE5B80B)) : null,
      onTap: () {
        setState(() => _selectedLang = langCode);
        widget.onSelectLanguage(langCode);
      },
    );
  }
}
