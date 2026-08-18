// lib/features/ride/models/service_category_model.dart
// Yalla VTC — Service Category Model (Clean, Decoupled UI Model)

import 'package:flutter/material.dart';

class YallaServiceCategory {
  final String id; // 'ECONOMY', 'COMFORT', 'MOTO', 'PREMIUM'
  final String titleKey;
  final String subtitleKey;
  final IconData icon;
  final String? badge;

  const YallaServiceCategory({
    required this.id,
    required this.titleKey,
    required this.subtitleKey,
    required this.icon,
    this.badge,
  });

  static const List<YallaServiceCategory> defaultCategories = [
    YallaServiceCategory(
      id: 'ECONOMY',
      titleKey: 'service_course',
      subtitleKey: 'vehicle_economy',
      icon: Icons.local_taxi_rounded,
      badge: 'Eco',
    ),
    YallaServiceCategory(
      id: 'COMFORT',
      titleKey: 'service_confort',
      subtitleKey: 'vehicle_comfort',
      icon: Icons.directions_car_filled_rounded,
      badge: null,
    ),
    YallaServiceCategory(
      id: 'MOTO',
      titleKey: 'service_moto',
      subtitleKey: 'service_moto',
      icon: Icons.two_wheeler_rounded,
      badge: 'Fast',
    ),
    YallaServiceCategory(
      id: 'PREMIUM',
      titleKey: 'service_course_plus',
      subtitleKey: 'vehicle_premium',
      icon: Icons.auto_awesome_rounded,
      badge: 'VIP',
    ),
  ];
}
