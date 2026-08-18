// lib/core/notifications/fcm_service.dart
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import '../api/api_client.dart';

class FCMService {
  final ApiClient _apiClient;
  bool _initialized = false;

  FCMService(this._apiClient);

  Future<void> initialize() async {
    if (_initialized) return;

    try {
      // Graceful Firebase Core init (if google-services.json / GoogleService-Info.plist is configured)
      await Firebase.initializeApp();
      
      final messaging = FirebaseMessaging.instance;
      
      final settings = await messaging.requestPermission(
        alert: true,
        badge: true,
        sound: true,
      );

      if (settings.authorizationStatus == AuthorizationStatus.authorized) {
        final token = await messaging.getToken();
        if (token != null) {
          await registerTokenWithBackend(token);
        }

        messaging.onTokenRefresh.listen((newToken) async {
          await registerTokenWithBackend(newToken);
        });
      }

      _initialized = true;
    } catch (e) {
      if (kDebugMode) {
        print('[FCMService] Graceful skip — Firebase not initialized: $e');
      }
    }
  }

  Future<void> registerTokenWithBackend(String fcmToken) async {
    try {
      await _apiClient.dio.post('/notifications/token', data: {
        'token': fcmToken,
        'platform': defaultTargetPlatform.name.toUpperCase(),
      });
    } catch (_) {
      // Silent fail if network is offline
    }
  }
}
