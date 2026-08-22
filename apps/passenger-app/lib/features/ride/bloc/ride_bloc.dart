// lib/features/ride/bloc/ride_bloc.dart
import 'package:flutter_bloc/flutter_bloc.dart';
import '../map/yalla_map_controller.dart';
import '../routing/routing_service.dart';
import '../services/passenger_ride_service.dart';
import '../services/realtime_tracking_service.dart';
import 'ride_event.dart';
import 'ride_state.dart';

class RideBloc extends Bloc<RideEvent, RideState> {
  final PassengerRideService _rideService;
  final RealtimeTrackingService _trackingService;
  final RoutingService _routingService;

  String? _activeRideId;
  bool _isCancelled = false;

  RideBloc(
    this._rideService,
    this._trackingService, {
    RoutingService? routingService,
  })  : _routingService = routingService ?? RoutingService(),
        super(RideInitial()) {
    on<SelectDestinationEvent>(_onSelectDestination);
    on<RequestRideEvent>(_onRequestRide);
    on<CancelRideEvent>(_onCancelRide);
    on<ResetRideEvent>(_onResetRide);
    on<UpdateRideStatusEvent>(_onUpdateStatus);
    on<DriverLocationUpdatedEvent>(_onDriverLocationUpdated);
  }

  Future<void> _onSelectDestination(
    SelectDestinationEvent event,
    Emitter<RideState> emit,
  ) async {
    _isCancelled = false;
    final origin = YallaLatLng(event.originLat, event.originLng);
    final dest = YallaLatLng(event.destLat, event.destLng);

    // Calculate real road network routing via RoutingService (OSRM)
    final routeResult = await _routingService.calculateRoute(origin, dest);

    final distanceKm = routeResult.distanceKm;
    final durationMin = routeResult.durationMin;
    final price = double.parse((15.0 + distanceKm * 6.0).toStringAsFixed(0));

    emit(RideDestinationSelected(
      originLat: event.originLat,
      originLng: event.originLng,
      originAddress: event.originAddress,
      destLat: event.destLat,
      destLng: event.destLng,
      destAddress: event.destAddress,
      distanceKm: distanceKm,
      durationMin: durationMin,
      estimatedPrice: price,
      routePoints: routeResult.points,
    ));
  }

  Future<void> _onRequestRide(
    RequestRideEvent event,
    Emitter<RideState> emit,
  ) async {
    _isCancelled = false;

    // Retain route points and price context from previous state if available
    List<YallaLatLng> currentRoutePoints = const [];
    double? targetOfferedPrice = event.offeredPrice;
    double? distKm;
    int? durMin;

    if (state is RideDestinationSelected) {
      final prev = state as RideDestinationSelected;
      currentRoutePoints = prev.routePoints;
      distKm = prev.distanceKm;
      durMin = prev.durationMin;
      if (targetOfferedPrice == null || targetOfferedPrice <= 0) {
        targetOfferedPrice = prev.estimatedPrice;
      }
    }

    emit(RideRequestInProgress());

    try {
      final ride = await _rideService.requestRide(
        pickupLat: event.pickupLat,
        pickupLng: event.pickupLng,
        pickupAddress: event.pickupAddress,
        dropoffLat: event.dropoffLat,
        dropoffLng: event.dropoffLng,
        dropoffAddress: event.dropoffAddress,
        serviceType: event.serviceType,
        offeredPrice: targetOfferedPrice,
      );

      if (_isCancelled) return;

      final rideId = ride['id'] ?? ride['_id'] ?? 'ride_${DateTime.now().millisecondsSinceEpoch}';
      _activeRideId = rideId;

      final confirmedPrice = (ride['estimatedPrice'] != null)
          ? (ride['estimatedPrice'] as num).toDouble()
          : targetOfferedPrice;

      emit(RideSearchingDriver(
        rideId: rideId,
        routePoints: currentRoutePoints,
        offeredPrice: confirmedPrice,
        distanceKm: distKm,
        durationMin: durMin,
      ));

      _trackingService.connect();

      _trackingService.listenToRideUpdates(rideId, (data) {
        if (!_isCancelled) {
          final status = data['status'] ?? 'SEARCHING';
          add(UpdateRideStatusEvent(status, data));
        }
      });

      _trackingService.listenToDriverLocation(rideId, (data) {
        if (!_isCancelled) {
          add(DriverLocationUpdatedEvent(
            lat: (data['lat'] as num).toDouble(),
            lng: (data['lng'] as num).toDouble(),
            bearing: (data['bearing'] as num?)?.toDouble() ?? 0.0,
          ));
        }
      });
    } catch (e) {
      if (_isCancelled) return;

      // Offline demo fallback
      final fallbackRideId = 'ride_${DateTime.now().millisecondsSinceEpoch}';
      _activeRideId = fallbackRideId;
      emit(RideSearchingDriver(
        rideId: fallbackRideId,
        routePoints: currentRoutePoints,
      ));
    }
  }

  Future<void> _onCancelRide(
    CancelRideEvent event,
    Emitter<RideState> emit,
  ) async {
    _isCancelled = true;
    _trackingService.disconnect();

    final targetRideId = event.rideId ?? _activeRideId;
    if (targetRideId != null) {
      await _rideService.cancelRide(targetRideId);
    }
    _activeRideId = null;

    emit(RideCancelled(reason: event.reason ?? 'User cancelled'));
  }

  Future<void> _onResetRide(
    ResetRideEvent event,
    Emitter<RideState> emit,
  ) async {
    _isCancelled = true;
    _trackingService.disconnect();

    if (_activeRideId != null) {
      await _rideService.cancelRide(_activeRideId!);
      _activeRideId = null;
    }

    emit(RideInitial());
  }

  void _onDriverLocationUpdated(
    DriverLocationUpdatedEvent event,
    Emitter<RideState> emit,
  ) {
    if (_isCancelled) return;

    if (state is RideDriverAccepted) {
      final currentState = state as RideDriverAccepted;
      emit(currentState.copyWith(
        driverLat: event.lat,
        driverLng: event.lng,
        driverBearing: event.bearing,
      ));
    } else if (state is RideActive) {
      final currentState = state as RideActive;
      emit(currentState.copyWith(
        driverLat: event.lat,
        driverLng: event.lng,
        driverBearing: event.bearing,
      ));
    }
  }

  void _onUpdateStatus(
    UpdateRideStatusEvent event,
    Emitter<RideState> emit,
  ) {
    if (_isCancelled) return;

    final status = event.status.toUpperCase();
    final data = event.data ?? {};
    final rideId = data['rideId'] ?? data['id'] ?? _activeRideId ?? 'ride_active';

    if (status == 'DRIVER_ACCEPTED') {
      emit(RideDriverAccepted(
        rideId: rideId,
        driverName: data['driverName'] ?? 'Karim Alami',
        driverRating: (data['driverRating'] as num?)?.toDouble() ?? 4.9,
        vehicleModel: data['vehicleModel'] ?? 'Dacia Logan',
        vehicleColor: data['vehicleColor'] ?? 'Gris / رصاصي',
        vehiclePlate: data['vehiclePlate'] ?? '54321 - أ - 6',
        etaMinutes: (data['etaMinutes'] as num?)?.toInt() ?? 4,
        driverLat: (data['driverLat'] as num?)?.toDouble(),
        driverLng: (data['driverLng'] as num?)?.toDouble(),
      ));
    } else if (status == 'IN_PROGRESS' || status == 'ARRIVED') {
      emit(RideActive(
        rideId: rideId,
        status: status,
        data: data,
        driverLat: (data['driverLat'] as num?)?.toDouble(),
        driverLng: (data['driverLng'] as num?)?.toDouble(),
      ));
    } else if (status == 'COMPLETED') {
      emit(RideCompleted(
        rideId: rideId,
        totalPrice: (data['totalPrice'] as num?)?.toDouble() ?? 25.0,
      ));
    } else if (status == 'CANCELLED') {
      _isCancelled = true;
      _trackingService.disconnect();
      emit(RideCancelled(reason: data['reason'] ?? ''));
    }
  }
}
