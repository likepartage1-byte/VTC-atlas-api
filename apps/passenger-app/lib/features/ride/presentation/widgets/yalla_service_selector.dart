// lib/features/ride/presentation/widgets/yalla_service_selector.dart
// Yalla VTC — Horizontal Service Category Selector

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../shared/l10n/app_translations.dart';
import '../../models/service_category_model.dart';

class YallaServiceSelector extends StatelessWidget {
  final String currentLang;
  final String selectedServiceId; // 'ECONOMY', 'COMFORT', 'MOTO', 'PREMIUM'
  final ValueChanged<String> onSelectService;
  final double? estimatedPrice; // Estimated price supplied directly by RideBloc

  const YallaServiceSelector({
    super.key,
    required this.currentLang,
    required this.selectedServiceId,
    required this.onSelectService,
    this.estimatedPrice,
  });

  @override
  Widget build(BuildContext context) {
    const categories = YallaServiceCategory.defaultCategories;

    return SizedBox(
      height: 90,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 4),
        itemCount: categories.length,
        separatorBuilder: (_, __) => const SizedBox(width: 10),
        itemBuilder: (context, index) {
          final cat = categories[index];
          final isSelected = selectedServiceId == cat.id;

          return GestureDetector(
            onTap: () => onSelectService(cat.id),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              width: 104,
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: isSelected ? const Color(0xFFE5B80B).withOpacity(0.14) : Colors.grey[50],
                borderRadius: BorderRadius.circular(18),
                border: Border.all(
                  color: isSelected ? const Color(0xFFE5B80B) : Colors.grey[300]!,
                  width: isSelected ? 2 : 1,
                ),
                boxShadow: isSelected
                    ? [
                        BoxShadow(
                          color: const Color(0xFFE5B80B).withOpacity(0.2),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ]
                    : null,
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Icon(
                        cat.icon,
                        size: 20,
                        color: isSelected ? const Color(0xFFB38B00) : Colors.grey[700],
                      ),
                      if (cat.badge != null)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 2),
                          decoration: BoxDecoration(
                            color: isSelected ? const Color(0xFFE5B80B) : Colors.grey[300],
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            cat.badge!,
                            style: GoogleFonts.outfit(
                              fontSize: 9,
                              fontWeight: FontWeight.bold,
                              color: isSelected ? Colors.black : Colors.grey[800],
                            ),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    tr(cat.titleKey, currentLang),
                    style: GoogleFonts.outfit(
                      fontSize: 12,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
                      color: isSelected ? Colors.black87 : Colors.grey[800],
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  if (estimatedPrice != null) ...[
                    const SizedBox(height: 2),
                    Text(
                      '~${estimatedPrice!.toStringAsFixed(0)} MAD',
                      style: GoogleFonts.outfit(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: isSelected ? const Color(0xFFB38B00) : Colors.grey[600],
                      ),
                    ),
                  ],
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
