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

    _socket!.connect();
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
