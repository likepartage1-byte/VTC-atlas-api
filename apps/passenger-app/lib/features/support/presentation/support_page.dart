// lib/features/support/presentation/support_page.dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../shared/l10n/app_translations.dart';

class HelpSupportPage extends StatefulWidget {
  final String currentLang;

  const HelpSupportPage({
    super.key,
    required this.currentLang,
  });

  @override
  State<HelpSupportPage> createState() => _HelpSupportPageState();
}

class _HelpSupportPageState extends State<HelpSupportPage> {
  final TextEditingController _issueController = TextEditingController();

  @override
  void dispose() {
    _issueController.dispose();
    super.dispose();
  }

  Future<void> _makePhoneCall(String phoneNumber) async {
    final Uri launchUri = Uri(scheme: 'tel', path: phoneNumber);
    if (await canLaunchUrl(launchUri)) {
      await launchUrl(launchUri);
    }
  }

  void _submitTicket() {
    if (_issueController.text.trim().isEmpty) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          widget.currentLang == 'ar'
              ? '✅ تم إرسال طلب الدعم بنجاح. سيتواصل معك فريقنا قريباً.'
              : '✅ Demande d\'assistance envoyée avec succès.',
          style: GoogleFonts.outfit(),
        ),
        backgroundColor: const Color(0xFF2E7D32),
      ),
    );
    _issueController.clear();
  }

  @override
  Widget build(BuildContext context) {
    final isArabic = isRTL(widget.currentLang);

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
            tr('menu_help', widget.currentLang),
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
            // Emergency SOS Call Banner
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.red[700],
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                children: [
                  const Icon(Icons.emergency_rounded, color: Colors.white, size: 32),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          widget.currentLang == 'ar' ? 'طوارئ الأمان' : 'Assistance Urgente',
                          style: GoogleFonts.outfit(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          widget.currentLang == 'ar' ? 'اتصل بالطوارئ مباشرة' : 'Appeler la Police Nationale',
                          style: GoogleFonts.outfit(fontSize: 12, color: Colors.white70),
                        ),
                      ],
                    ),
                  ),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white,
                      foregroundColor: Colors.red[700],
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    ),
                    onPressed: () => _makePhoneCall('19'),
                    child: Text(
                      '19',
                      style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // FAQ Accordions Header
            Text(
              widget.currentLang == 'ar' ? 'الأسئلة الشائعة' : 'Foire Aux Questions',
              style: GoogleFonts.outfit(
                fontSize: 15,
                fontWeight: FontWeight.bold,
                color: Colors.grey[800],
              ),
            ),
            const SizedBox(height: 12),

            _buildFaqItem(
              widget.currentLang == 'ar' ? 'كيف يتم احتساب سعر الرحلة؟' : 'Comment est calculé le tarif ?',
              widget.currentLang == 'ar'
                  ? 'يتم تحديد السعر بناءً على السعر الأدنى للخدمة ومسافة الرحلة والمدة الزمنية.'
                  : 'Le tarif est calculé selon le tarif de base, la distance parcourue et la durée estimée.',
            ),
            _buildFaqItem(
              widget.currentLang == 'ar' ? 'نسيت غرضاً في السيارة، ماذا أفعل؟' : 'Objet oublié dans la voiture ?',
              widget.currentLang == 'ar'
                  ? 'يمكنك التواصل مع السائق مباشرة من سجل الرحلات أو إرسال بلاغ لفريق الدعم.'
                  : 'Vous pouvez contacter le chauffeur via votre historique de courses ou soumettre un signalement.',
            ),
            _buildFaqItem(
              widget.currentLang == 'ar' ? 'ما هي طرق الدفع المتاحة؟' : 'Modes de paiement disponibles',
              widget.currentLang == 'ar'
                  ? 'حالياً نوفر الدفع نقدًا (كاش) مباشرة للسائق عند نهاية الرحلة.'
                  : 'Le paiement en espèces est actuellement disponible directement auprès du chauffeur.',
            ),
            const SizedBox(height: 24),

            // Report Lost / Ticket Submission Form
            Text(
              widget.currentLang == 'ar' ? 'إرسال ملاحظة أو استفسار' : 'Envoyer un message au support',
              style: GoogleFonts.outfit(
                fontSize: 15,
                fontWeight: FontWeight.bold,
                color: Colors.grey[800],
              ),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(16),
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
                children: [
                  TextField(
                    controller: _issueController,
                    maxLines: 4,
                    style: GoogleFonts.outfit(fontSize: 14),
                    decoration: InputDecoration(
                      hintText: widget.currentLang == 'ar'
                          ? 'اكتب استفسارك أو مشكلتك هنا...'
                          : 'Décrivez votre problème ici...',
                      hintStyle: GoogleFonts.outfit(color: Colors.grey[400]),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: Colors.grey[300]!),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: Colors.grey[300]!),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: const BorderSide(color: Color(0xFFE5B80B)),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFE5B80B),
                        foregroundColor: Colors.black,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        elevation: 0,
                      ),
                      onPressed: _submitTicket,
                      child: Text(
                        tr('confirm', widget.currentLang),
                        style: GoogleFonts.outfit(
                          fontSize: 15,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFaqItem(String question, String answer) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
      ),
      child: ExpansionTile(
        title: Text(
          question,
          style: GoogleFonts.outfit(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: Colors.black87,
          ),
        ),
        children: [
          Padding(
            padding: const EdgeInsets.only(left: 16, right: 16, bottom: 16),
            child: Text(
              answer,
              style: GoogleFonts.outfit(
                fontSize: 13,
                color: Colors.grey[700],
                height: 1.4,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
