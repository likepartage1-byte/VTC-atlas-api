import 'package:socket_io_client/socket_io_client.dart' as io;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class RealtimeTrackingService {
  late io.Socket socket;
  final storage = const FlutterSecureStorage();
  final String socketUrl = "http://187.124.34.118";

  void connect() async {
    final token = await storage.read(key: 'jwt_token');
    
    socket = io.io(socketUrl, <String, dynamic>{
      'transports': ['websocket'],
      'autoConnect': false,
      'auth': {'token': token}
    });

    socket.connect();

    socket.onConnect((_) {
      print('Connected to Real-time Gateway');
    });
  }

  void listenToRideUpdates(String rideId, Function(dynamic) onUpdate) {
    socket.on('ride.$rideId.status', (data) {
      onUpdate(data);
    });
  }

  void listenToDriverLocation(String rideId, Function(dynamic) onLocation) {
    socket.on('ride.$rideId.driver_location', (data) {
      onLocation(data);
    });
  }

  void disconnect() {
    socket.disconnect();
  }
}
