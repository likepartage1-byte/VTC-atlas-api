// test/widget_test.dart
import 'package:flutter_test/flutter_test.dart';
import 'package:passenger_app/core/api/api_client.dart';
import 'package:passenger_app/features/auth/services/passenger_auth_service.dart';
import 'package:passenger_app/features/ride/services/passenger_ride_service.dart';
import 'package:passenger_app/features/ride/services/realtime_tracking_service.dart';
import 'package:passenger_app/main.dart';

void main() {
  testWidgets('App initialization test', (WidgetTester tester) async {
    final apiClient = ApiClient();
    final rideService = PassengerRideService(apiClient);
    final trackingService = RealtimeTrackingService();
    final authService = PassengerAuthService(apiClient);

    await tester.pumpWidget(AtlasPassengerApp(
      rideService: rideService,
      trackingService: trackingService,
      authService: authService,
    ));
  });
}
