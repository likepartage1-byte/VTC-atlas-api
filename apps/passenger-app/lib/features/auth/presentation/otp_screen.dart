// lib/features/auth/presentation/otp_screen.dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../shared/l10n/app_translations.dart';
import '../services/passenger_auth_service.dart';
import '../../ride/presentation/pages/home_page.dart';

class OtpScreen extends StatefulWidget {
  final PassengerAuthService authService;
  final String phone;
  final String? fullName;
  final String currentLang;

  const OtpScreen({
    super.key,
    required this.authService,
    required this.phone,
    this.fullName,
    this.currentLang = 'ar',
  });

  @override
  State<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends State<OtpScreen> {
  final _otpController = TextEditingController();
  bool _isLoading = false;

  @override
  void dispose() {
    _otpController.dispose();
    super.dispose();
  }

  void _handleVerifyOtp() async {
    final otp = _otpController.text.trim();
    if (otp.length < 4) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(tr('invalid_otp', widget.currentLang)),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      await widget.authService.verifyOtp(widget.phone, otp, widget.fullName);
      if (!mounted) return;
      setState(() => _isLoading = false);

      // Navigate to HomePage clearing auth stack
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(
          builder: (context) => HomePage(currentLang: widget.currentLang),
        ),
        (route) => false,
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
        appBar: AppBar(
          backgroundColor: Colors.transparent,
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white),
            onPressed: () => Navigator.pop(context),
          ),
        ),
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 20),
                Text(
                  tr('enter_otp', lang),
                  style: GoogleFonts.outfit(
                    fontSize: 26,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  '${tr('otp_sent_to', lang)} +212 ${widget.phone}',
                  style: GoogleFonts.outfit(
                    fontSize: 14,
                    color: Colors.white70,
                  ),
                ),
                const SizedBox(height: 36),

                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(24),
                  ),
                  child: Column(
                    children: [
                      TextField(
                        controller: _otpController,
                        keyboardType: TextInputType.number,
                        textAlign: TextAlign.center,
                        maxLength: 6,
                        style: GoogleFonts.outfit(
                          fontSize: 28,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 10,
                        ),
                        decoration: InputDecoration(
                          counterText: '',
                          hintText: '• • • • • •',
                          hintStyle: GoogleFonts.outfit(
                            color: Colors.grey[300],
                            letterSpacing: 10,
                          ),
                          filled: true,
                          fillColor: Colors.grey[100],
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(16),
                            borderSide: BorderSide.none,
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),

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
                          onPressed: _isLoading ? null : _handleVerifyOtp,
                          child: _isLoading
                              ? const CircularProgressIndicator(color: Colors.black)
                              : Text(
                                  tr('otp_verify', lang),
                                  style: GoogleFonts.outfit(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                        ),
                      ),

                      const SizedBox(height: 16),
                      TextButton(
                        onPressed: () {
                          widget.authService.sendOtp(widget.phone);
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text(tr('otp_sent_to', lang)),
                            ),
                          );
                        },
                        child: Text(
                          tr('otp_resend', lang),
                          style: GoogleFonts.outfit(
                            color: const Color(0xFFE5B80B),
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
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
