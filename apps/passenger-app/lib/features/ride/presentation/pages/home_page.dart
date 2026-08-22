// lib/features/ride/presentation/pages/home_page.dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../ride/map/map_config.dart';
import '../../../ride/map/map_service.dart';
import '../../../ride/map/yalla_map_controller.dart';
import 'package:geolocator/geolocator.dart';

import '../../../../shared/l10n/app_translations.dart';
import '../../../../shared/widgets/yalla_side_drawer.dart';
import '../../../auth/presentation/phone_auth_screen.dart';
import '../../../auth/services/passenger_auth_service.dart';
import '../../../history/presentation/history_page.dart';
import '../../../profile/presentation/profile_page.dart';
import '../../../settings/presentation/settings_page.dart';
import '../../../support/presentation/support_page.dart';
import '../../bloc/ride_bloc.dart';
import '../../bloc/ride_event.dart';
import '../../bloc/ride_state.dart';
import '../../services/location_search_abstraction.dart';
import '../../services/passenger_ride_service.dart';
import '../widgets/driver_card.dart';
import '../widgets/smart_location_search_modal.dart';
import '../widgets/yalla_ride_sheet.dart';
import '../widgets/yalla_map_view.dart';
import '../widgets/map_route_pill.dart';
import '../widgets/safety_panel.dart';
import '../widgets/driver_profile_sheet.dart';
import '../widgets/share_trip_sheet.dart';
import '../widgets/ride_completed_sheet.dart';
import 'package:url_launcher/url_launcher.dart';

class HomePage extends StatefulWidget {
  final String currentLang;

  const HomePage({
    super.key,
    this.currentLang = 'ar',
  });

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  final MapService _mapService = MapService();
  late String _lang;

  final LocationSearchProvider _searchProvider = LocalCatalogSearchProvider();

  YallaLatLng _currentLocation = const YallaLatLng(MapConfig.defaultLat, MapConfig.defaultLng);
  String _pickupAddress = "📍 Marrakech Center";
  YallaLatLng? _pickupLocationOverride;

  String _destAddress = "";
  YallaLatLng? _destLocation;

  bool _isLocating = false;

  @override
  void initState() {
    super.initState();
    _lang = widget.currentLang;
    _getUserLocation();
  }

  Future<void> _getUserLocation() async {
    setState(() => _isLocating = true);
    try {
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        if (mounted) setState(() => _isLocating = false);
        return;
      }

      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          if (mounted) setState(() => _isLocating = false);
          return;
        }
      }

      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      final newLocation = YallaLatLng(position.latitude, position.longitude);
      if (!mounted) return;
      setState(() {
        _currentLocation = newLocation;
        // Show clean localized label — never raw coordinates
        _pickupAddress = tr('current_location', _lang);
        _isLocating = false;
      });

      _mapService.centerOnUser(newLocation.latitude, newLocation.longitude);
    } catch (e) {
      if (mounted) setState(() => _isLocating = false);
    }
  }

  void _openSafetyPanel(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => SafetyPanel(
        currentLang: _lang,
        driverName: _currentDriverName,
        vehicleModel: _currentVehicleModel,
        vehiclePlate: _currentVehiclePlate,
        vehicleColor: _currentVehicleColor,
      ),
    );
  }

  void _openDriverProfile(BuildContext context, RideDriverAccepted state) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => DriverProfileSheet(
        currentLang: _lang,
        driverName: state.driverName,
        driverRating: state.driverRating,
        vehicleModel: state.vehicleModel,
        vehicleColor: state.vehicleColor,
        vehiclePlate: state.vehiclePlate,
      ),
    );
  }

  void _openShareTrip(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => ShareTripSheet(currentLang: _lang),
    );
  }

  // Driver info & route stats cache (from OSRM & BLoC state)
  String _currentDriverName = '';
  String _currentVehicleModel = '';
  String _currentVehiclePlate = '';
  String _currentVehicleColor = '';
  double _cachedDistanceKm = 0.0;
  int _cachedDurationMin = 0;

  void _recenterMap() {
    final target = _pickupLocationOverride ?? _currentLocation;
    _mapService.centerOnUser(target.latitude, target.longitude);
  }

  Future<void> _openSmartSearchModal(BuildContext context) async {
    final rideBloc = context.read<RideBloc>();
    final activePickup = _pickupLocationOverride ?? _currentLocation;
    final result = await showModalBottomSheet<SmartLocationSearchResult>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (modalContext) {
        return SmartLocationSearchModal(
          currentLang: _lang,
          initialPickupAddress: _pickupAddress,
          initialPickupLat: activePickup.latitude,
          initialPickupLng: activePickup.longitude,
          initialDestAddress: _destAddress,
          initialDestLat: _destLocation?.latitude,
          initialDestLng: _destLocation?.longitude,
          searchProvider: _searchProvider,
        );
      },
    );

    if (result != null && mounted) {
      final newPickup = YallaLatLng(result.pickupLat, result.pickupLng);
      final newDest = YallaLatLng(result.destLat, result.destLng);

      setState(() {
        _pickupAddress = result.pickupAddress;
        _pickupLocationOverride = newPickup;
        _destAddress = result.destAddress;
        _destLocation = newDest;
      });

      // Dispatch destination selection event to RideBloc
      rideBloc.add(
        SelectDestinationEvent(
          originLat: newPickup.latitude,
          originLng: newPickup.longitude,
          originAddress: result.pickupAddress,
          destLat: newDest.latitude,
          destLng: newDest.longitude,
          destAddress: result.destAddress,
        ),
      );

      _fitMapToBounds(newPickup, newDest);
    }
  }

  void _fitMapToBounds(YallaLatLng origin, YallaLatLng dest) {
    _mapService.zoomToRide(
      pickupLat: origin.latitude, pickupLng: origin.longitude,
      destLat: dest.latitude, destLng: dest.longitude,
    );
  }

  void _onCancelOrResetRide() {
    context.read<RideBloc>().add(ResetRideEvent());
    setState(() {
      _destLocation = null;
      _destAddress = "";
      _pickupLocationOverride = null;
      _cachedDistanceKm = 0.0;
      _cachedDurationMin = 0;
    });
    _mapService.clearAll();
    _mapService.centerOnUser(_currentLocation.latitude, _currentLocation.longitude);
  }

  // Truncate address to first 3 words
  String _shortLabel(String address) {
    if (address.isEmpty) return '';
    final parts = address.split(' / ');
    return parts.first.trim().split(' ').take(3).join(' ');
  }

  @override
  Widget build(BuildContext context) {

    final activePickup = _pickupLocationOverride ?? _currentLocation;

    return Scaffold(
      key: _scaffoldKey,
      drawer: YallaSideDrawer(
        currentLang: _lang,
        passengerName: 'Client Yalla',
        onSelectLanguage: (newLang) {
          setState(() => _lang = newLang);
        },
        currentRole: 'PASSENGER',
        hasDriverProfile: false,
        onRoleSwitch: (newRole) {
          Navigator.pop(context);
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                newRole == 'DRIVER'
                    ? tr('driver_label', _lang)
                    : tr('passenger_label', _lang),
              ),
              backgroundColor: const Color(0xFFE5B80B),
              behavior: SnackBarBehavior.floating,
            ),
          );
        },
        onOpenProfile: () {
          final authService = RepositoryProvider.of<PassengerAuthService>(context);
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => ProfilePage(
                authService: authService,
                currentLang: _lang,
              ),
            ),
          );
        },
        onOpenHistory: () {
          final rideService = RepositoryProvider.of<PassengerRideService>(context);
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => RideHistoryPage(
                rideService: rideService,
                currentLang: _lang,
              ),
            ),
          );
        },
        onOpenSettings: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => SettingsPage(
                currentLang: _lang,
                onSelectLanguage: (newLang) {
                  setState(() => _lang = newLang);
                },
              ),
            ),
          );
        },
        onOpenHelp: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => HelpSupportPage(
                currentLang: _lang,
              ),
            ),
          );
        },
        onRegisterDriver: () {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(tr('driver_reg_continue', _lang)),
              backgroundColor: const Color(0xFFE5B80B),
              behavior: SnackBarBehavior.floating,
            ),
          );
        },
        onLogout: () async {
          final navigator = Navigator.of(context);
          final rideService = RepositoryProvider.of<PassengerRideService>(context);
          final authService = PassengerAuthService(rideService.apiClient);
          await authService.logout();
          if (!mounted) return;
          navigator.pushAndRemoveUntil(
            MaterialPageRoute(
              builder: (context) => PhoneAuthScreen(authService: authService, currentLang: _lang),
            ),
            (route) => false,
          );
        },
      ),
      body: BlocConsumer<RideBloc, RideState>(
        listener: (context, state) {
          if (state is RideFailure) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text(state.error), backgroundColor: Colors.red),
            );
          } else if (state is RideDestinationSelected) {
            _cachedDistanceKm = state.distanceKm ?? 0.0;
            _cachedDurationMin = state.durationMin ?? 0;
          } else if (state is RideCancelled) {
            setState(() {
              _destLocation = null;
              _destAddress = "";
              _pickupLocationOverride = null;
              _currentDriverName = '';
              _currentVehicleModel = '';
              _currentVehiclePlate = '';
              _currentVehicleColor = '';
              _cachedDistanceKm = 0.0;
              _cachedDurationMin = 0;
            });
            _mapService.clearAll();
            _mapService.centerOnUser(_currentLocation.latitude, _currentLocation.longitude);
          } else if (state is RideDriverAccepted) {
            // Cache driver info for SafetyPanel
            setState(() {
              _currentDriverName = state.driverName;
              _currentVehicleModel = state.vehicleModel;
              _currentVehiclePlate = state.vehiclePlate;
              _currentVehicleColor = state.vehicleColor;
            });
          } else if (state is RideCompleted) {
            // Show post-trip sheet with exact OSRM cached stats
            showModalBottomSheet(
              context: context,
              isScrollControlled: true,
              backgroundColor: Colors.transparent,
              isDismissible: false,
              builder: (_) => RideCompletedSheet(
                currentLang: _lang,
                totalFare: state.totalPrice,
                distanceKm: _cachedDistanceKm,
                durationMin: _cachedDurationMin,
                driverName: _currentDriverName,
                originAddress: _pickupAddress,
                destAddress: _destAddress,
                onNewRide: () {
                  Navigator.pop(context);
                  _onCancelOrResetRide();
                },
                onRepeatRide: () {
                  Navigator.pop(context);
                  _openSmartSearchModal(context);
                },
              ),
            );
          }
        },
        builder: (context, state) {
          return Stack(
            children: [
              // 1. Map Abstraction Layer
              YallaMapView(
                currentLocation: _currentLocation,
                pickupLocation: activePickup,
                destLocation: _destLocation,
                rideState: state,
                currentLang: _lang,
                onControllerReady: _mapService.attachController,
              ),

              // 2. Top Bar Controls
              SafeArea(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Side Menu Drawer Trigger
                      GestureDetector(
                        onTap: () => _scaffoldKey.currentState?.openDrawer(),
                        child: Container(
                          width: 48,
                          height: 48,
                          decoration: const BoxDecoration(
                            color: Colors.white,
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(color: Colors.black26, blurRadius: 10, spreadRadius: 1),
                            ],
                          ),
                          child: const Icon(Icons.menu_rounded, color: Colors.black87, size: 26),
                        ),
                      ),

                      // Re-center GPS Trigger
                      GestureDetector(
                        onTap: _recenterMap,
                        child: Container(
                          width: 48,
                          height: 48,
                          decoration: const BoxDecoration(
                            color: Colors.white,
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(color: Colors.black26, blurRadius: 10, spreadRadius: 1),
                            ],
                          ),
                          child: _isLocating
                              ? const Padding(
                                  padding: EdgeInsets.all(12.0),
                                  child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFF683EE6)),
                                )
                              : const Icon(Icons.my_location_rounded, color: Color(0xFF683EE6), size: 24),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // 3. Animated Route Pill — floats above map when dest selected
              if (state is RideDestinationSelected)
                Positioned(
                  top: MediaQuery.of(context).padding.top + 72,
                  left: 0,
                  right: 0,
                  child: MapRoutePill(
                    originLabel: _shortLabel(state.originAddress),
                    destLabel: _shortLabel(state.destAddress),
                    distanceKm: state.distanceKm ?? 0.0,
                    durationMin: state.durationMin ?? 0,
                  ),
                ),

              // 4. Driver Accepted Overlay Card
              if (state is RideDriverAccepted)
                Positioned(
                  top: MediaQuery.of(context).padding.top + 70,
                  left: 0,
                  right: 0,
                  child: DriverCard(
                    driverName: state.driverName,
                    driverRating: state.driverRating,
                    vehicleModel: state.vehicleModel,
                    vehicleColor: state.vehicleColor,
                    vehiclePlate: state.vehiclePlate,
                    etaMinutes: state.etaMinutes,
                    currentLang: _lang,
                    onCancel: _onCancelOrResetRide,
                    onCallDriver: () async {
                      final messenger = ScaffoldMessenger.of(context);
                      final phone = state.driverPhone;
                      if (phone != null && phone.trim().isNotEmpty) {
                        final uri = Uri(scheme: 'tel', path: phone.trim());
                        if (await canLaunchUrl(uri)) {
                          await launchUrl(uri);
                          return;
                        }
                      }
                      if (mounted) {
                        messenger.showSnackBar(
                          SnackBar(
                            content: Text(tr('phone_unavailable', _lang)),
                            backgroundColor: const Color(0xFF6B7280),
                            behavior: SnackBarBehavior.floating,
                          ),
                        );
                      }
                    },
                    onSafety: () => _openSafetyPanel(context),
                    onShareTrip: () => _openShareTrip(context),
                    onDriverProfile: () => _openDriverProfile(context, state),
                  ),
                ),

              // 4. Ride Sheet — Professional A/B/C selection + Service Cards
              if (state is! RideDriverAccepted)
                Positioned(
                  bottom: 0,
                  left: 0,
                  right: 0,
                  child: YallaRideSheet(
                    rideState: state,
                    currentLang: _lang,
                    originAddress: _pickupAddress,
                    destAddress: _destAddress,
                    onTapWhereTo: () => _openSmartSearchModal(context),
                    onRequestRide: (serviceId) {
                      if (_destLocation != null) {
                        final currentPrice = (state is RideDestinationSelected)
                            ? (state as RideDestinationSelected).estimatedPrice
                            : null;
                        context.read<RideBloc>().add(
                              RequestRideEvent(
                                pickupLat: activePickup.latitude,
                                pickupLng: activePickup.longitude,
                                pickupAddress: _pickupAddress,
                                dropoffLat: _destLocation!.latitude,
                                dropoffLng: _destLocation!.longitude,
                                dropoffAddress: _destAddress,
                                serviceType: serviceId,
                                offeredPrice: currentPrice,
                              ),
                            );
                      }
                    },
                    onCancelRide: _onCancelOrResetRide,
                  ),
                ),
            ],
          );
        },
      ),
    );
  }
}
