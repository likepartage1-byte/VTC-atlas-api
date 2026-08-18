// lib/features/ride/presentation/widgets/yalla_bottom_sheet.dart
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../shared/l10n/app_translations.dart';
import '../../bloc/ride_state.dart';
import 'yalla_service_selector.dart';

class YallaBottomSheet extends StatefulWidget {
  final RideState rideState;
  final String currentLang;
  final String currentOriginAddress;
  final String currentDestAddress;
  final VoidCallback onTapWhereTo;
  final VoidCallback onRequestRide;
  final VoidCallback onCancelRide;

  const YallaBottomSheet({
    super.key,
    required this.rideState,
    required this.currentLang,
    required this.currentOriginAddress,
    required this.currentDestAddress,
    required this.onTapWhereTo,
    required this.onRequestRide,
    required this.onCancelRide,
  });

  @override
  State<YallaBottomSheet> createState() => _YallaBottomSheetState();
}

class _YallaBottomSheetState extends State<YallaBottomSheet> {
  String _selectedServiceId = 'ECONOMY';
  bool _isRideForOther = false;
  final TextEditingController _otherNameController = TextEditingController();
  final TextEditingController _otherPhoneController = TextEditingController();

  @override
  void dispose() {
    _otherNameController.dispose();
    _otherPhoneController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final lang = widget.currentLang;
    final isArabic = isRTL(lang);
    final state = widget.rideState;

    return Directionality(
      textDirection: isArabic ? TextDirection.rtl : TextDirection.ltr,
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
          boxShadow: [
            BoxShadow(
              color: Colors.black12,
              blurRadius: 20,
              spreadRadius: 2,
              offset: Offset(0, -2),
            ),
          ],
        ),
        child: SafeArea(
          top: false,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Handle Bar
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: Colors.grey[300],
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),

              // STATE 1: SEARCHING DRIVER
              if (state is RideSearchingDriver || state is RideRequestInProgress) ...[
                const SizedBox(height: 10),
                const CircularProgressIndicator(
                  color: Color(0xFFE5B80B),
                  strokeWidth: 3,
                ),
                const SizedBox(height: 20),
                Text(
                  tr('searching_driver', lang),
                  style: GoogleFonts.outfit(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.black87,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  tr('searching_subtitle', lang),
                  style: GoogleFonts.outfit(
                    fontSize: 13,
                    color: Colors.grey[600],
                  ),
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: OutlinedButton(
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.redAccent,
                      side: const BorderSide(color: Colors.redAccent),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                    ),
                    onPressed: widget.onCancelRide,
                    child: Text(
                      tr('cancel_ride', lang),
                      style: GoogleFonts.outfit(
                        fontWeight: FontWeight.bold,
                        fontSize: 15,
                      ),
                    ),
                  ),
                ),
              ]

              // STATE 2: DESTINATION SELECTED — ROUTE PREVIEW & CONFIRMATION
              else if (state is RideDestinationSelected) ...[
                // Origin & Destination Info
                Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: Colors.grey[100],
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Column(
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.my_location, color: Color(0xFF22C55E), size: 18),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              state.originAddress,
                              style: GoogleFonts.outfit(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                                color: Colors.black87,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                      const Padding(
                        padding: EdgeInsets.symmetric(vertical: 6.0),
                        child: Divider(height: 1),
                      ),
                      Row(
                        children: [
                          const Icon(Icons.location_on, color: Colors.redAccent, size: 18),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              state.destAddress,
                              style: GoogleFonts.outfit(
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                color: Colors.black87,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          GestureDetector(
                            onTap: widget.onTapWhereTo,
                            child: const Icon(Icons.edit_outlined, size: 18, color: Colors.grey),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 14),

                // Distance, Time & Price Summary Chips
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _buildInfoChip(
                      icon: Icons.straighten,
                      label: '${state.distanceKm ?? 3.8} km',
                    ),
                    _buildInfoChip(
                      icon: Icons.access_time,
                      label: '~${state.durationMin ?? 12} ${tr('minutes', lang)}',
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: const Color(0xFFE5B80B).withOpacity(0.15),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.payments_outlined, color: Color(0xFFB38B00), size: 16),
                          const SizedBox(width: 6),
                          Text(
                            '~${state.estimatedPrice?.toStringAsFixed(0) ?? 25} MAD',
                            style: GoogleFonts.outfit(
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: const Color(0xFFB38B00),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 14),

                // Horizontal Yalla Service Selector
                YallaServiceSelector(
                  currentLang: lang,
                  selectedServiceId: _selectedServiceId,
                  onSelectService: (id) => setState(() => _selectedServiceId = id),
                  estimatedPrice: state.estimatedPrice,
                ),

                const SizedBox(height: 12),

                // Ride for someone else non-intrusive Expander
                GestureDetector(
                  onTap: () => setState(() => _isRideForOther = !_isRideForOther),
                  child: Row(
                    children: [
                      Icon(
                        _isRideForOther ? Icons.check_circle_rounded : Icons.radio_button_unchecked_rounded,
                        color: _isRideForOther ? const Color(0xFFE5B80B) : Colors.grey[400],
                        size: 20,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        tr('ride_for_other', lang),
                        style: GoogleFonts.outfit(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: Colors.grey[800],
                        ),
                      ),
                    ],
                  ),
                ),

                if (_isRideForOther) ...[
                  const SizedBox(height: 10),
                  TextField(
                    controller: _otherNameController,
                    style: GoogleFonts.outfit(fontSize: 13),
                    decoration: InputDecoration(
                      hintText: tr('other_passenger_name', lang),
                      hintStyle: GoogleFonts.outfit(color: Colors.grey[400], fontSize: 13),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      filled: true,
                      fillColor: Colors.grey[100],
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none,
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _otherPhoneController,
                    keyboardType: TextInputType.phone,
                    style: GoogleFonts.outfit(fontSize: 13),
                    decoration: InputDecoration(
                      hintText: tr('other_passenger_phone', lang),
                      hintStyle: GoogleFonts.outfit(color: Colors.grey[400], fontSize: 13),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      filled: true,
                      fillColor: Colors.grey[100],
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide.none,
                      ),
                    ),
                  ),
                ],

                const SizedBox(height: 14),

                // Payment Method (Cash only for v1)
                Row(
                  children: [
                    const Icon(Icons.money, color: Colors.green, size: 18),
                    const SizedBox(width: 8),
                    Text(
                      tr('cash_payment', lang),
                      style: GoogleFonts.outfit(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: Colors.grey[800],
                      ),
                    ),
                    const Spacer(),
                    const Icon(Icons.check_circle, color: Color(0xFF22C55E), size: 16),
                  ],
                ),

                const SizedBox(height: 16),

                // Primary Request Ride Button
                SizedBox(
                  width: double.infinity,
                  height: 52,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFFE5B80B),
                      foregroundColor: Colors.black,
                      elevation: 2,
                      shadowColor: const Color(0x66E5B80B),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                    ),
                    onPressed: widget.onRequestRide,
                    child: Text(
                      tr('request_yalla', lang),
                      style: GoogleFonts.outfit(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              ]

              // STATE 3: IDLE — MINIMAL TRIGGER
              else ...[
                // Current Location Row
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: const Color(0xFF22C55E).withOpacity(0.12),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.my_location, color: Color(0xFF22C55E), size: 18),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            tr('origin_label', lang),
                            style: GoogleFonts.outfit(
                              fontSize: 11,
                              color: Colors.grey[500],
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                          Text(
                            widget.currentOriginAddress.isNotEmpty
                                ? widget.currentOriginAddress
                                : tr('current_location', lang),
                            style: GoogleFonts.outfit(
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                              color: Colors.black87,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 14),

                // Where To Button (Primary Minimal Trigger)
                GestureDetector(
                  onTap: widget.onTapWhereTo,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                    decoration: BoxDecoration(
                      color: Colors.grey[100],
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.grey[300]!, width: 1),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.search_rounded, color: Color(0xFFE5B80B), size: 22),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            tr('where_to', lang),
                            style: GoogleFonts.outfit(
                              fontSize: 15,
                              fontWeight: FontWeight.bold,
                              color: Colors.black87,
                            ),
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.all(6),
                          decoration: BoxDecoration(
                            color: const Color(0xFFE5B80B),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: const Icon(Icons.arrow_forward_rounded, color: Colors.black, size: 16),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 14),

                // Horizontal Service Selector Preview in Idle
                YallaServiceSelector(
                  currentLang: lang,
                  selectedServiceId: _selectedServiceId,
                  onSelectService: (id) => setState(() => _selectedServiceId = id),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoChip({required IconData icon, required String label}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Icon(icon, size: 14, color: Colors.grey[700]),
          const SizedBox(width: 4),
          Text(
            label,
            style: GoogleFonts.outfit(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: Colors.grey[800],
            ),
          ),
        ],
      ),
    );
  }
}
