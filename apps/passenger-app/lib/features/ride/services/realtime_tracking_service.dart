import 'package:dio/dio.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class RealtimeTrackingService {
  io.Socket? _socket;
  final storage = const FlutterSecureStorage();
  
  String? _activeRideId;

  String get socketHost {
    final baseUrl = dotenv.env['API_BASE_URL'] ?? "http://187.124.34.118/api/v1";
    final uri = Uri.parse(baseUrl);
    return "${uri.scheme}://${uri.host}:${uri.port}";
  }

  bool get isConnected => _socket != null && _socket!.connected;

  void connect() async {
    if (_socket != null && _socket!.connected) return;

    final token = await storage.read(key: 'jwt_token');
    await _connectWithToken(token);
  }

  Future<void> _connectWithToken(String? token) async {
    final targetUrl = "$socketHost/rides";

    _socket = io.io(targetUrl, <String, dynamic>{
      'transports': ['websocket'],
      'autoConnect': false,
      'auth': {'token': token},
      'reconnection': true,
      'reconnectionAttempts': 10,
      'reconnectionDelay': 1000,
    });

    _socket!.onConnect((_) {
      if (_activeRideId != null) {
        joinRideRoom(_activeRideId!);
      }
    });

    _socket!.onReconnect((_) {
      if (_activeRideId != null) {
        joinRideRoom(_activeRideId!);
      }
    });

    _socket!.on('connect_error', (err) async {
      final errStr = err?.toString() ?? '';
      final isAuthError = errStr.contains('Unauthorized') ||
          errStr.contains('401') ||
          errStr.contains('jwt') ||
          errStr.contains('token');

      if (!isAuthError) return;

      final newToken = await _refreshToken();
      if (newToken == null) return;

      _socket?.off('connect_error');
      _socket?.disconnect();
      _socket = null;
      await _connectWithToken(newToken);
    });

    _socket!.connect();
  }

  Future<String?> _refreshToken() async {
    final refreshToken = await storage.read(key: 'refresh_token');
    if (refreshToken == null || refreshToken.isEmpty) return null;

    try {
      final baseUrl = dotenv.env['API_BASE_URL'] ?? "http://187.124.34.118/api/v1";
      final plainDio = Dio(BaseOptions(
        baseUrl: baseUrl,
        connectTimeout: const Duration(seconds: 10),
        receiveTimeout: const Duration(seconds: 10),
      ));
      final response = await plainDio.post(
        '/auth/refresh',
        data: {'refreshToken': refreshToken},
      );
      final newToken = response.data['accessToken'] ?? response.data['token'];
      if (newToken is String) {
        await storage.write(key: 'jwt_token', value: newToken);
        return newToken;
      }
    } on DioException catch (e) {
      final status = e.response?.statusCode;
      // Only delete tokens if the server explicitly confirms the session is invalid (401 or 403)
      if (status == 401 || status == 403) {
        await storage.delete(key: 'jwt_token');
        await storage.delete(key: 'refresh_token');
      }
      // Network errors, timeouts, 5xx: DO NOT delete tokens
    } catch (_) {
      // Non-Dio exception: DO NOT delete tokens
    }
    return null;
  }

  void joinRideRoom(String rideId) {
    _activeRideId = rideId;
    _socket?.emit('joinRide', rideId);
  }

  void listenToRideUpdates(String rideId, Function(dynamic) onUpdate) {
    _activeRideId = rideId;
    joinRideRoom(rideId);
    _socket?.off('statusChanged');
    _socket?.on('statusChanged', (data) {
      onUpdate(data);
    });
  }

  void listenToDriverLocation(String rideId, Function(dynamic) onLocation) {
    _activeRideId = rideId;
    joinRideRoom(rideId);
    _socket?.off('driverMoved');
    _socket?.off('locationUpdated');
    _socket?.on('driverMoved', (data) {
      onLocation(data);
    });
    _socket?.on('locationUpdated', (data) {
      onLocation(data);
    });
  }

  /// Safe disconnect — no-op if socket was never connected.
  void disconnect() {
    _activeRideId = null;
    _socket?.disconnect();
    _socket = null;
  }
}
