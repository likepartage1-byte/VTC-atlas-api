// lib/features/auth/presentation/phone_auth_screen.dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../shared/l10n/app_translations.dart';
import '../services/passenger_auth_service.dart';
import 'otp_screen.dart';

class PhoneAuthScreen extends StatefulWidget {
  final PassengerAuthService authService;
  final String currentLang;

  const PhoneAuthScreen({
    super.key,
    required this.authService,
    this.currentLang = 'ar',
  });

  @override
  State<PhoneAuthScreen> createState() => _PhoneAuthScreenState();
}

class _PhoneAuthScreenState extends State<PhoneAuthScreen> {
  final _phoneController = TextEditingController();
  final _nameController = TextEditingController();
  bool _isLoading = false;
  bool _isNewUser = true;

  @override
  void dispose() {
    _phoneController.dispose();
    _nameController.dispose();
    super.dispose();
  }

  void _handleSendOtp() async {
    final phone = _phoneController.text.trim();
    final name = _nameController.text.trim();

    if (phone.isEmpty || phone.length < 8) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(tr('invalid_phone', widget.currentLang)),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      await widget.authService.sendOtp(phone);
      if (name.isNotEmpty) {
        await widget.authService.savePassengerName(name);
      }
      if (!mounted) return;
      setState(() => _isLoading = false);

      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => OtpScreen(
            authService: widget.authService,
            phone: phone,
            fullName: name,
            currentLang: widget.currentLang,
          ),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(tr('auth_error', widget.currentLang)),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final lang = widget.currentLang;
    final isArabic = isRTL(lang);

    return Directionality(
      textDirection: isArabic ? TextDirection.rtl : TextDirection.ltr,
      child: Scaffold(
        backgroundColor: const Color(0xFF1A1A1A),
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 20.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 30),

                // Logo Header
                Center(
                  child: Column(
                    children: [
                      Container(
                        width: 80,
                        height: 80,
                        decoration: BoxDecoration(
                          color: const Color(0xFFE5B80B),
                          borderRadius: BorderRadius.circular(24),
                          boxShadow: const [
                            BoxShadow(
                              color: Color(0x66E5B80B),
                              blurRadius: 20,
                              spreadRadius: 2,
                            ),
                          ],
                        ),
                        child: const Icon(
                          Icons.local_taxi_rounded,
                          size: 44,
                          color: Colors.black,
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'YALLA VTC',
                        style: GoogleFonts.outfit(
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                          color: const Color(0xFFE5B80B),
                          letterSpacing: 2.0,
                        ),
                      ),
                      Text(
                        tr('welcome_subtitle', lang),
                        style: GoogleFonts.outfit(
                          fontSize: 14,
                          color: Colors.white70,
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 40),

                // Form Card
                Expanded(
                  child: SingleChildScrollView(
                    child: Container(
                      padding: const EdgeInsets.all(24),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(24),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            _isNewUser ? tr('new_account', lang) : tr('login', lang),
                            style: GoogleFonts.outfit(
                              fontSize: 22,
                              fontWeight: FontWeight.bold,
                              color: Colors.black87,
                            ),
                          ),
                          const SizedBox(height: 20),

                          if (_isNewUser) ...[
                            Text(
                              tr('name_label', lang),
                              style: GoogleFonts.outfit(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: Colors.grey[700],
                              ),
                            ),
                            const SizedBox(height: 8),
                            TextField(
                              controller: _nameController,
                              style: GoogleFonts.outfit(color: Colors.black87),
                              decoration: InputDecoration(
                                hintText: tr('name_hint', lang),
                                hintStyle: GoogleFonts.outfit(color: Colors.grey[400]),
                                prefixIcon: const Icon(Icons.person_outline, color: Color(0xFFE5B80B)),
                                filled: true,
                                fillColor: Colors.grey[100],
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(16),
                                  borderSide: BorderSide.none,
                                ),
                              ),
                            ),
                            const SizedBox(height: 16),
                          ],

                          Text(
                            tr('enter_phone', lang),
                            style: GoogleFonts.outfit(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: Colors.grey[700],
                            ),
                          ),
                          const SizedBox(height: 8),
                          TextField(
                            controller: _phoneController,
                            keyboardType: TextInputType.phone,
                            style: GoogleFonts.outfit(color: Colors.black87, fontWeight: FontWeight.bold),
                            decoration: InputDecoration(
                              hintText: '06 12 34 56 78',
                              hintStyle: GoogleFonts.outfit(color: Colors.grey[400]),
                              prefixIcon: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12),
                                margin: const EdgeInsets.only(right: 8),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Text('🇲🇦 +212', style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
                                    const SizedBox(width: 6),
                                    Container(width: 1, height: 20, color: Colors.grey[300]),
                                  ],
                                ),
                              ),
                              filled: true,
                              fillColor: Colors.grey[100],
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(16),
                                borderSide: BorderSide.none,
                              ),
                            ),
                          ),

                          const SizedBox(height: 28),

                          SizedBox(
                            width: double.infinity,
                            height: 54,
                            child: ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFFE5B80B),
                                foregroundColor: Colors.black,
                                elevation: 0,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(16),
                                ),
                              ),
                              onPressed: _isLoading ? null : _handleSendOtp,
                              child: _isLoading
                                  ? const CircularProgressIndicator(color: Colors.black)
                                  : Text(
                                      tr('send_otp', lang),
                                      style: GoogleFonts.outfit(
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                            ),
                          ),

                          const SizedBox(height: 16),

                          Center(
                            child: TextButton(
                              onPressed: () {
                                setState(() => _isNewUser = !_isNewUser);
                              },
                              child: Text(
                                _isNewUser ? tr('have_account', lang) : tr('new_account', lang),
                                style: GoogleFonts.outfit(
                                  color: Colors.grey[700],
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ),
                        ],
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
