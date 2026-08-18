// lib/features/auth/services/passenger_auth_service.dart
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../../core/api/api_client.dart';

class PassengerAuthService {
  final ApiClient apiClient;
  final storage = const FlutterSecureStorage();

  PassengerAuthService(this.apiClient);

  Future<bool> isLoggedIn() async {
    final token = await storage.read(key: 'jwt_token');
    return token != null && token.isNotEmpty;
  }

  Future<Map<String, dynamic>> sendOtp(String phone) async {
    try {
      final response = await apiClient.dio.post('/auth/otp/request', data: {
        'phoneNumber': phone,
        'deviceId': 'passenger_app_device',
      });
      return response.data;
    } catch (e) {
      rethrow;
    }
  }

  Future<Map<String, dynamic>> verifyOtp(String phone, String otp, String? fullName) async {
    try {
      final response = await apiClient.dio.post('/auth/otp/verify', data: {
        'phoneNumber': phone,
        'code': otp,
        'deviceId': 'passenger_app_device',
        'role': 'PASSENGER',
        if (fullName != null && fullName.isNotEmpty) 'fullName': fullName,
      });
      final token = response.data['accessToken'] ?? response.data['token'];
      final refreshToken = response.data['refreshToken'];
      if (token != null) {
        await storage.write(key: 'jwt_token', value: token);
      }
      if (refreshToken != null) {
        await storage.write(key: 'refresh_token', value: refreshToken);
      }
      return response.data;
    } catch (e) {
      rethrow;
    }
  }

  Future<void> logout() async {
    await storage.delete(key: 'jwt_token');
    await storage.delete(key: 'refresh_token');
  }

  Future<String?> getPassengerName() async {
    return await storage.read(key: 'passenger_name') ?? 'Yalla Client';
  }

  Future<void> savePassengerName(String name) async {
    await storage.write(key: 'passenger_name', value: name);
  }
}
