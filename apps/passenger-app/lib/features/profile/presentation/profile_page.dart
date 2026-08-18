// lib/features/profile/presentation/profile_page.dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../auth/services/passenger_auth_service.dart';
import '../../../shared/l10n/app_translations.dart';

class ProfilePage extends StatefulWidget {
  final PassengerAuthService authService;
  final String currentLang;

  const ProfilePage({
    super.key,
    required this.authService,
    required this.currentLang,
  });

  @override
  State<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  late TextEditingController _nameController;
  late TextEditingController _phoneController;
  late TextEditingController _emailController;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController();
    _phoneController = TextEditingController();
    _emailController = TextEditingController();
    _loadProfileData();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _loadProfileData() async {
    final name = await widget.authService.getPassengerName() ?? '';
    final phone = await widget.authService.storage.read(key: 'passenger_phone') ?? '';
    final email = await widget.authService.storage.read(key: 'passenger_email') ?? '';

    setState(() {
      _nameController.text = name;
      _phoneController.text = phone;
      _emailController.text = email;
      _isLoading = false;
    });
  }

  Future<void> _saveProfile() async {
    final newName = _nameController.text.trim();
    if (newName.isNotEmpty) {
      await widget.authService.savePassengerName(newName);
    }
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            tr('save', widget.currentLang) == 'Save' ? 'Profile saved successfully!' : 'تم حفظ الملف الشخصي بنجاح',
            style: GoogleFonts.outfit(),
          ),
          backgroundColor: const Color(0xFFE5B80B),
        ),
      );
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isArabic = isRTL(widget.currentLang);

    return Directionality(
      textDirection: isArabic ? TextDirection.rtl : TextDirection.ltr,
      child: Scaffold(
        backgroundColor: Colors.grey[50],
        appBar: AppBar(
          backgroundColor: const Color(0xFF1A1A1A),
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white, size: 20),
            onPressed: () => Navigator.pop(context),
          ),
          title: Text(
            tr('menu_profile', widget.currentLang),
            style: GoogleFonts.outfit(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          centerTitle: true,
        ),
        body: _isLoading
            ? const Center(child: CircularProgressIndicator(color: Color(0xFFE5B80B)))
            : SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: Column(
                  children: [
                    const SizedBox(height: 12),
                    // Avatar Header
                    Center(
                      child: Stack(
                        children: [
                          CircleAvatar(
                            radius: 46,
                            backgroundColor: const Color(0xFFE5B80B),
                            child: Text(
                              _nameController.text.isNotEmpty ? _nameController.text[0].toUpperCase() : 'Y',
                              style: GoogleFonts.outfit(
                                fontSize: 36,
                                fontWeight: FontWeight.bold,
                                color: Colors.black,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 32),

                    // Name Field
                    _buildTextField(
                      controller: _nameController,
                      label: tr('name_label', widget.currentLang),
                      icon: Icons.person_outline,
                    ),
                    const SizedBox(height: 16),

                    // Phone Field (Read-only as authenticated)
                    _buildTextField(
                      controller: _phoneController,
                      label: tr('enter_phone', widget.currentLang),
                      icon: Icons.phone_android_rounded,
                      readOnly: true,
                    ),
                    const SizedBox(height: 16),

                    // Email Field
                    _buildTextField(
                      controller: _emailController,
                      label: 'Email / البريد الإلكتروني',
                      icon: Icons.email_outlined,
                    ),
                    const SizedBox(height: 36),

                    // Save Button
                    SizedBox(
                      width: double.infinity,
                      height: 52,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFE5B80B),
                          foregroundColor: Colors.black,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                          elevation: 0,
                        ),
                        onPressed: _saveProfile,
                        child: Text(
                          tr('save', widget.currentLang),
                          style: GoogleFonts.outfit(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    bool readOnly = false,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: GoogleFonts.outfit(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: Colors.grey[700],
          ),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: controller,
          readOnly: readOnly,
          style: GoogleFonts.outfit(
            fontSize: 15,
            fontWeight: FontWeight.w500,
            color: readOnly ? Colors.grey[600] : Colors.black87,
          ),
          decoration: InputDecoration(
            prefixIcon: Icon(icon, color: const Color(0xFFE5B80B), size: 20),
            filled: true,
            fillColor: readOnly ? Colors.grey[200] : Colors.white,
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: BorderSide(color: Colors.grey[300]!),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: BorderSide(color: Colors.grey[300]!),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(14),
              borderSide: const BorderSide(color: Color(0xFFE5B80B), width: 1.5),
            ),
          ),
        ),
      ],
    );
  }
}
