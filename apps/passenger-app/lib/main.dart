// lib/main.dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:google_fonts/google_fonts.dart';

import 'package:flutter_localizations/flutter_localizations.dart';

import 'core/api/api_client.dart';
import 'features/auth/presentation/phone_auth_screen.dart';
import 'features/auth/services/passenger_auth_service.dart';
import 'features/ride/bloc/ride_bloc.dart';
import 'features/ride/presentation/pages/home_page.dart';
import 'features/ride/services/passenger_ride_service.dart';
import 'features/ride/services/realtime_tracking_service.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Load .env before any config is read
  await dotenv.load(fileName: '.env');

  final apiClient = ApiClient();
  final rideService = PassengerRideService(apiClient);
  final trackingService = RealtimeTrackingService();
  final authService = PassengerAuthService(apiClient);

  runApp(AtlasPassengerApp(
    rideService: rideService,
    trackingService: trackingService,
    authService: authService,
  ));
}

class AtlasPassengerApp extends StatelessWidget {
  final PassengerRideService rideService;
  final RealtimeTrackingService trackingService;
  final PassengerAuthService authService;

  const AtlasPassengerApp({
    super.key,
    required this.rideService,
    required this.trackingService,
    required this.authService,
  });

  @override
  Widget build(BuildContext context) {
    return MultiRepositoryProvider(
      providers: [
        RepositoryProvider.value(value: rideService),
        RepositoryProvider.value(value: trackingService),
        RepositoryProvider.value(value: authService),
      ],
      child: BlocProvider(
        create: (context) => RideBloc(rideService, trackingService),
        child: MaterialApp(
          title: 'Yalla VTC Passager',
          debugShowCheckedModeBanner: false,
          localizationsDelegates: const [
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
          supportedLocales: const [
            Locale('ar', 'MA'),
            Locale('fr', 'FR'),
            Locale('en', 'US'),
            Locale('es', 'ES'),
          ],
          theme: ThemeData(
            useMaterial3: true,
            colorScheme: ColorScheme.fromSeed(
              seedColor: const Color(0xFF1A1A1A),
              primary: const Color(0xFFE5B80B), // Yalla Gold
              surface: Colors.white,
            ),
            textTheme: GoogleFonts.outfitTextTheme(),
          ),
          home: FutureBuilder<bool>(
            future: authService.isLoggedIn(),
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const Scaffold(
                  backgroundColor: Color(0xFF1A1A1A),
                  body: Center(
                    child: CircularProgressIndicator(color: Color(0xFFE5B80B)),
                  ),
                );
              }
              if (snapshot.data == true) {
                return const HomePage(currentLang: 'ar');
              }
              return PhoneAuthScreen(
                authService: authService,
                currentLang: 'ar',
              );
            },
          ),
        ),
      ),
    );
  }
}
