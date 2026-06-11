import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_fonts/google_fonts.dart';
import 'core/api/api_client.dart';
import 'features/ride/services/passenger_ride_service.dart';
import 'features/ride/services/realtime_tracking_service.dart';
import 'features/ride/presentation/pages/home_page.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  
  final apiClient = ApiClient();
  final rideService = PassengerRideService(apiClient);
  final trackingService = RealtimeTrackingService();

  runApp(AtlasPassengerApp(rideService: rideService, trackingService: trackingService));
}

class AtlasPassengerApp extends StatelessWidget {
  final PassengerRideService rideService;
  final RealtimeTrackingService trackingService;

  const AtlasPassengerApp({super.key, required this.rideService, required this.trackingService});

  @override
  Widget build(BuildContext context) {
    return MultiRepositoryProvider(
      providers: [
        RepositoryProvider.value(value: rideService),
        RepositoryProvider.value(value: trackingService),
      ],
      child: MaterialApp(
        title: 'Atlas Passenger',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          useMaterial3: true,
          colorScheme: ColorScheme.fromSeed(
            seedColor: const Color(0xFF1A1A1A),
            primary: const Color(0xFFE5B80B), // Atlas Gold
            surface: Colors.white,
          ),
          textTheme: GoogleFonts.outfitTextTheme(),
        ),
        home: const HomePage(),
      ),
    );
  }
}
