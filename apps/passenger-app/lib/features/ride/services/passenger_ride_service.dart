import '../../../core/api/api_client.dart';

class PassengerRideService {
  final ApiClient apiClient;

  PassengerRideService(this.apiClient);

  Future<Map<String, dynamic>> requestRide({
    required double pickupLat,
    required double pickupLng,
    required String pickupAddress,
    required double dropoffLat,
    required double dropoffLng,
    required String dropoffAddress,
    String serviceType = 'ECONOMY',
  }) async {
    try {
      final response = await apiClient.dio.post('/passenger/rides', data: {
        'pickupLat': pickupLat,
        'pickupLng': pickupLng,
        'pickupAddress': pickupAddress,
        'dropoffLat': dropoffLat,
        'dropoffLng': dropoffLng,
        'dropoffAddress': dropoffAddress,
        'serviceType': serviceType,
      });
      return response.data;
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> getRideStatus(String rideId) async {
    try {
      final response = await apiClient.dio.get('/passenger/rides/$rideId');
      return response.data;
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>?> getActiveRide() async {
    try {
      final response = await apiClient.dio.get('/passenger/rides/active');
      return response.data;
    } catch (e) {
      return null;
    }
  }

  Future<void> cancelRide(String rideId) async {
    try {
      await apiClient.dio.post('/passenger/rides/$rideId/cancel');
    } catch (_) {}
  }

  Future<List<dynamic>> getRideHistory() async {
    try {
      final response = await apiClient.dio.get('/passenger/rides/history');
      return (response.data as List<dynamic>?) ?? [];
    } catch (e) {
      return [];
    }
  }
}
