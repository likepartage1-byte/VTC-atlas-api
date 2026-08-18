// lib/features/history/presentation/history_page.dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../ride/services/passenger_ride_service.dart';
import '../../../shared/l10n/app_translations.dart';

class RideHistoryPage extends StatefulWidget {
  final PassengerRideService rideService;
  final String currentLang;

  const RideHistoryPage({
    super.key,
    required this.rideService,
    required this.currentLang,
  });

  @override
  State<RideHistoryPage> createState() => _RideHistoryPageState();
}

class _RideHistoryPageState extends State<RideHistoryPage> {
  bool _isLoading = true;
  List<dynamic> _history = [];

  @override
  void initState() {
    super.initState();
    _fetchHistory();
  }

  Future<void> _fetchHistory() async {
    setState(() => _isLoading = true);
    final data = await widget.rideService.getRideHistory();
    setState(() {
      _history = data;
      _isLoading = false;
    });
  }

  Color _getStatusColor(String status) {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return const Color(0xFF2E7D32);
      case 'CANCELLED':
        return const Color(0xFFC62828);
      case 'DRIVER_ACCEPTED':
      case 'IN_PROGRESS':
      case 'ARRIVED':
        return const Color(0xFF1565C0);
      default:
        return const Color(0xFFE5B80B);
    }
  }

  String _getStatusLabel(String status, String lang) {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return lang == 'ar' ? 'مكتملة' : 'Terminée';
      case 'CANCELLED':
        return lang == 'ar' ? 'ملغاة' : 'Annulée';
      case 'DRIVER_ACCEPTED':
        return lang == 'ar' ? 'تم القبول' : 'Acceptée';
      case 'IN_PROGRESS':
        return lang == 'ar' ? 'جارية' : 'En cours';
      case 'ARRIVED':
        return lang == 'ar' ? 'وصل السائق' : 'Chauffeur arrivé';
      default:
        return lang == 'ar' ? 'قيد البحث' : 'En recherche';
    }
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
            tr('menu_my_rides', widget.currentLang),
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
            : _history.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.history_rounded, size: 64, color: Colors.grey[400]),
                        const SizedBox(height: 16),
                        Text(
                          widget.currentLang == 'ar' ? 'لا توجد رحلات سابقة' : 'Aucune course effectuée',
                          style: GoogleFonts.outfit(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                  )
                : RefreshIndicator(
                    onRefresh: _fetchHistory,
                    color: const Color(0xFFE5B80B),
                    child: ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _history.length,
                      itemBuilder: (context, index) {
                        final item = _history[index];
                        final status = (item['status'] ?? 'REQUESTED').toString();
                        final statusColor = _getStatusColor(status);
                        final price = item['estimatedPrice'] ?? item['actualPrice'] ?? 0;
                        final pickup = item['pickupAddress'] ?? '';
                        final dropoff = item['dropoffAddress'] ?? '';
                        final createdAt = item['createdAt'] != null
                            ? DateTime.tryParse(item['createdAt'].toString())
                            : null;

                        return Container(
                          margin: const EdgeInsets.only(bottom: 12),
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
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Status & Price Row
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: statusColor.withOpacity(0.12),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text(
                                      _getStatusLabel(status, widget.currentLang),
                                      style: GoogleFonts.outfit(
                                        fontSize: 12,
                                        fontWeight: FontWeight.bold,
                                        color: statusColor,
                                      ),
                                    ),
                                  ),
                                  Text(
                                    '$price MAD',
                                    style: GoogleFonts.outfit(
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.black87,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 12),

                              // Locations
                              Row(
                                children: [
                                  const Icon(Icons.my_location_rounded, size: 16, color: Color(0xFFE5B80B)),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Text(
                                      pickup,
                                      style: GoogleFonts.outfit(fontSize: 13, color: Colors.grey[800]),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 6),
                              Row(
                                children: [
                                  const Icon(Icons.location_on_rounded, size: 16, color: Colors.redAccent),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Text(
                                      dropoff,
                                      style: GoogleFonts.outfit(fontSize: 13, color: Colors.grey[800]),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                ],
                              ),
                              if (createdAt != null) ...[
                                const SizedBox(height: 10),
                                Text(
                                  '${createdAt.day}/${createdAt.month}/${createdAt.year} ${createdAt.hour}:${createdAt.minute.toString().padLeft(2, '0')}',
                                  style: GoogleFonts.outfit(fontSize: 11, color: Colors.grey[500]),
                                ),
                              ],
                            ],
                          ),
                        );
                      },
                    ),
                  ),
      ),
    );
  }
}
