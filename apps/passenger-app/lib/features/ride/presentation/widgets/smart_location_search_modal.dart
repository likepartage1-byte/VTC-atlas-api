// lib/features/ride/presentation/widgets/smart_location_search_modal.dart
// Yalla VTC — Smart Location Search Modal (A -> B Selector)

import 'dart:async';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../shared/l10n/app_translations.dart';
import '../../services/location_search_abstraction.dart';

class SmartLocationSearchResult {
  final String pickupAddress;
  final double pickupLat;
  final double pickupLng;
  final String destAddress;
  final double destLat;
  final double destLng;

  const SmartLocationSearchResult({
    required this.pickupAddress,
    required this.pickupLat,
    required this.pickupLng,
    required this.destAddress,
    required this.destLat,
    required this.destLng,
  });
}

class SmartLocationSearchModal extends StatefulWidget {
  final String currentLang;
  final String initialPickupAddress;
  final double initialPickupLat;
  final double initialPickupLng;
  final String initialDestAddress;
  final double? initialDestLat;
  final double? initialDestLng;
  final LocationSearchProvider searchProvider;

  const SmartLocationSearchModal({
    super.key,
    required this.currentLang,
    required this.initialPickupAddress,
    required this.initialPickupLat,
    required this.initialPickupLng,
    required this.initialDestAddress,
    this.initialDestLat,
    this.initialDestLng,
    required this.searchProvider,
  });

  @override
  State<SmartLocationSearchModal> createState() => _SmartLocationSearchModalState();
}

class _SmartLocationSearchModalState extends State<SmartLocationSearchModal> {
  late String _pickupAddress;
  late double _pickupLat;
  late double _pickupLng;

  late String _destAddress;
  double? _destLat;
  double? _destLng;

  bool _isEditingPickup = false; // false = editing Destination B, true = editing Pickup A
  final TextEditingController _searchController = TextEditingController();
  Timer? _debounceTimer;

  List<PlaceSearchResult> _searchResults = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _pickupAddress = widget.initialPickupAddress;
    _pickupLat = widget.initialPickupLat;
    _pickupLng = widget.initialPickupLng;

    _destAddress = widget.initialDestAddress;
    _destLat = widget.initialDestLat;
    _destLng = widget.initialDestLng;

    _searchController.text = _isEditingPickup ? _pickupAddress : _destAddress;
    _performSearch(_searchController.text);
  }

  @override
  void dispose() {
    _debounceTimer?.cancel();
    _searchController.dispose();
    super.dispose();
  }

  void _onSearchChanged(String query) {
    _debounceTimer?.cancel();
    _debounceTimer = Timer(const Duration(milliseconds: 300), () {
      _performSearch(query);
    });
  }

  Future<void> _performSearch(String query) async {
    if (!mounted) return;
    setState(() => _isLoading = true);
    try {
      final results = await widget.searchProvider.searchPlaces(query);
      if (!mounted) return;
      setState(() {
        _searchResults = results;
        _isLoading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _searchResults = [];
        _isLoading = false;
      });
    }
  }

  void _swapLocations() {
    if (_destLat == null) return;
    setState(() {
      final tempAddress = _pickupAddress;
      final tempLat = _pickupLat;
      final tempLng = _pickupLng;

      _pickupAddress = _destAddress;
      _pickupLat = _destLat!;
      _pickupLng = _destLng!;

      _destAddress = tempAddress;
      _destLat = tempLat;
      _destLng = tempLng;

      _searchController.text = _isEditingPickup ? _pickupAddress : _destAddress;
    });
  }

  void _selectPlace(PlaceSearchResult place) {
    if (_isEditingPickup) {
      _pickupAddress = place.title;
      _pickupLat = place.latitude;
      _pickupLng = place.longitude;
    } else {
      _destAddress = place.title;
      _destLat = place.latitude;
      _destLng = place.longitude;
    }

    if (_destLat != null) {
      Navigator.pop(
        context,
        SmartLocationSearchResult(
          pickupAddress: _pickupAddress,
          pickupLat: _pickupLat,
          pickupLng: _pickupLng,
          destAddress: _destAddress,
          destLat: _destLat!,
          destLng: _destLng!,
        ),
      );
    }
  }

  IconData _getCategoryIcon(String category) {
    switch (category) {
      case 'airport':
        return Icons.local_airport_rounded;
      case 'mall':
        return Icons.shopping_bag_rounded;
      case 'cafe':
        return Icons.coffee_rounded;
      case 'street':
        return Icons.alt_route_rounded;
      default:
        return Icons.location_on_rounded;
    }
  }

  @override
  Widget build(BuildContext context) {
    final lang = widget.currentLang;
    final isArabic = isRTL(lang);

    return Directionality(
      textDirection: isArabic ? TextDirection.rtl : TextDirection.ltr,
      child: Container(
        height: MediaQuery.of(context).size.height * 0.85,
        padding: const EdgeInsets.all(20),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
        ),
        child: Column(
          children: [
            // Handle bar
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

            // A / B Selector Card with Swap Button
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.grey[100],
                borderRadius: BorderRadius.circular(20),
              ),
              child: Column(
                children: [
                  // Point A Pickup Row
                  GestureDetector(
                    onTap: () {
                      setState(() {
                        _isEditingPickup = true;
                        _searchController.text = _pickupAddress;
                      });
                      _performSearch(_pickupAddress);
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      decoration: BoxDecoration(
                        color: _isEditingPickup ? Colors.white : Colors.transparent,
                        borderRadius: BorderRadius.circular(14),
                        border: _isEditingPickup ? Border.all(color: const Color(0xFFE5B80B), width: 1.5) : null,
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 10,
                            height: 10,
                            decoration: const BoxDecoration(
                              color: Color(0xFF22C55E),
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  tr('origin_label', lang),
                                  style: GoogleFonts.outfit(fontSize: 11, color: Colors.grey[600]),
                                ),
                                Text(
                                  _pickupAddress.isNotEmpty ? _pickupAddress : tr('current_location', lang),
                                  style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.bold),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  // Divider with Swap A ↔ B button
                  Stack(
                    alignment: Alignment.center,
                    children: [
                      const Divider(height: 16),
                      GestureDetector(
                        onTap: _swapLocations,
                        child: Container(
                          padding: const EdgeInsets.all(6),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.grey[300]!),
                            boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 4)],
                          ),
                          child: const Icon(Icons.swap_vert_rounded, color: Color(0xFFE5B80B), size: 18),
                        ),
                      ),
                    ],
                  ),

                  // Point B Destination Row
                  GestureDetector(
                    onTap: () {
                      setState(() {
                        _isEditingPickup = false;
                        _searchController.text = _destAddress;
                      });
                      _performSearch(_destAddress);
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      decoration: BoxDecoration(
                        color: !_isEditingPickup ? Colors.white : Colors.transparent,
                        borderRadius: BorderRadius.circular(14),
                        border: !_isEditingPickup ? Border.all(color: const Color(0xFFE5B80B), width: 1.5) : null,
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 10,
                            height: 10,
                            decoration: const BoxDecoration(
                              color: Colors.redAccent,
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  tr('destination_label', lang),
                                  style: GoogleFonts.outfit(fontSize: 11, color: Colors.grey[600]),
                                ),
                                Text(
                                  _destAddress.isNotEmpty ? _destAddress : tr('where_to', lang),
                                  style: GoogleFonts.outfit(
                                    fontSize: 14,
                                    fontWeight: FontWeight.bold,
                                    color: _destAddress.isNotEmpty ? Colors.black87 : Colors.grey[400],
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Search Input Field
            TextField(
              controller: _searchController,
              onChanged: _onSearchChanged,
              style: GoogleFonts.outfit(color: Colors.black87),
              decoration: InputDecoration(
                hintText: _isEditingPickup ? tr('origin_label', lang) : tr('search_destination', lang),
                hintStyle: GoogleFonts.outfit(color: Colors.grey[400]),
                prefixIcon: const Icon(Icons.search_rounded, color: Color(0xFFE5B80B)),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear_rounded, size: 20),
                        onPressed: () {
                          _searchController.clear();
                          _performSearch('');
                        },
                      )
                    : null,
                filled: true,
                fillColor: Colors.grey[100],
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: BorderSide.none,
                ),
              ),
            ),

            const SizedBox(height: 16),

            // Use Current GPS CTA for Pickup
            if (_isEditingPickup)
              GestureDetector(
                onTap: () {
                  _selectPlace(
                    PlaceSearchResult(
                      id: 'current_gps',
                      title: widget.initialPickupAddress,
                      subtitle: tr('current_location', lang),
                      latitude: widget.initialPickupLat,
                      longitude: widget.initialPickupLng,
                    ),
                  );
                },
                child: Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF22C55E).withOpacity(0.12),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.my_location, color: Color(0xFF22C55E), size: 20),
                      const SizedBox(width: 10),
                      Text(
                        tr('current_location', lang),
                        style: GoogleFonts.outfit(
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                          color: const Color(0xFF22C55E),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

            // Search Results List
            Expanded(
              child: _isLoading
                  ? const Center(
                      child: CircularProgressIndicator(
                        color: Color(0xFFE5B80B),
                        strokeWidth: 2.5,
                      ),
                    )
                  : _searchResults.isEmpty
                      ? Center(
                          child: Text(
                            'لم يتم العثور على المكان / No results found',
                            style: GoogleFonts.outfit(color: Colors.grey[500], fontSize: 13),
                          ),
                        )
                      : ListView.builder(
                          itemCount: _searchResults.length,
                          itemBuilder: (context, index) {
                            final place = _searchResults[index];
                            return ListTile(
                              leading: Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFE5B80B).withOpacity(0.12),
                                  shape: BoxShape.circle,
                                ),
                                child: Icon(
                                  _getCategoryIcon(place.categoryIcon),
                                  color: const Color(0xFFB38B00),
                                  size: 20,
                                ),
                              ),
                              title: Text(
                                place.title,
                                style: GoogleFonts.outfit(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 14,
                                  color: Colors.black87,
                                ),
                              ),
                              subtitle: Text(
                                place.subtitle,
                                style: GoogleFonts.outfit(fontSize: 12, color: Colors.grey[600]),
                              ),
                              onTap: () => _selectPlace(place),
                            );
                          },
                        ),
            ),
          ],
        ),
      ),
    );
  }
}
