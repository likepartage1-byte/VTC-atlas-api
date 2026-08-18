// lib/features/ride/services/location_search_abstraction.dart
// Yalla VTC — Location Search Provider Abstraction Layer

class PlaceSearchResult {
  final String id;
  final String title;
  final String subtitle;
  final double latitude;
  final double longitude;
  final String categoryIcon; // landmark, airport, mall, hotel, cafe, street

  const PlaceSearchResult({
    required this.id,
    required this.title,
    required this.subtitle,
    required this.latitude,
    required this.longitude,
    this.categoryIcon = 'landmark',
  });
}

abstract class LocationSearchProvider {
  Future<List<PlaceSearchResult>> searchPlaces(String query);
}

/// Offline Local Catalog Provider — Safe Fallback Search Engine
class LocalCatalogSearchProvider implements LocationSearchProvider {
  final List<PlaceSearchResult> _catalog = const [
    PlaceSearchResult(
      id: 'jamaa_elfna',
      title: 'Jamaa El-Fna / ساحة جامع الفنا',
      subtitle: 'Marrakech Old Medina',
      latitude: 31.6258,
      longitude: -7.9891,
      categoryIcon: 'landmark',
    ),
    PlaceSearchResult(
      id: 'marrakesh_airport',
      title: 'Marrakesh Menara Airport / مطار مراكش المنارة',
      subtitle: 'RAK Airport Terminal Drop-off',
      latitude: 31.6015,
      longitude: -8.0265,
      categoryIcon: 'airport',
    ),
    PlaceSearchResult(
      id: 'jardin_majorelle',
      title: 'Jardin Majorelle / حدائق ماجوريل',
      subtitle: 'Rue Yves Saint Laurent',
      latitude: 31.6420,
      longitude: -8.0030,
      categoryIcon: 'landmark',
    ),
    PlaceSearchResult(
      id: 'carre_eden',
      title: 'Carré Eden Shopping Center / كاري إيدن',
      subtitle: 'Guéliz, Marrakech',
      latitude: 31.6346,
      longitude: -8.0089,
      categoryIcon: 'mall',
    ),
    PlaceSearchResult(
      id: 'rue_des_ecoles',
      title: 'Rue des Écoles / شارع المدارس',
      subtitle: 'Guéliz, Marrakech',
      latitude: 31.6380,
      longitude: -8.0120,
      categoryIcon: 'street',
    ),
    PlaceSearchResult(
      id: 'cafe_hayat',
      title: 'Café Hayat Moments',
      subtitle: 'Avenue Mohammed V',
      latitude: 31.6320,
      longitude: -8.0050,
      categoryIcon: 'cafe',
    ),
  ];

  @override
  Future<List<PlaceSearchResult>> searchPlaces(String query) async {
    final cleanQuery = query.trim().toLowerCase();
    if (cleanQuery.isEmpty) return _catalog;

    // Filter catalog safely by title or subtitle matching
    final results = _catalog.where((place) {
      final titleMatch = place.title.toLowerCase().contains(cleanQuery);
      final subMatch = place.subtitle.toLowerCase().contains(cleanQuery);
      return titleMatch || subMatch;
    }).toList();

    return results;
  }
}
