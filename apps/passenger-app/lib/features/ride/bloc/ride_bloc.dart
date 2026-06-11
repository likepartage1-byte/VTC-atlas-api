import 'package:flutter_bloc/flutter_bloc.dart';
import '../services/passenger_ride_service.dart';
import '../services/realtime_tracking_service.dart';
import 'ride_event.dart';
import 'ride_state.dart';

class RideBloc extends Bloc<RideEvent, RideState> {
  final PassengerRideService _rideService;
  final RealtimeTrackingService _trackingService;

  RideBloc(this._rideService, this._trackingService) : super(RideInitial()) {
    on<RequestRideEvent>(_onRequestRide);
    on<UpdateRideStatusEvent>(_onUpdateStatus);
    on<DriverLocationUpdatedEvent>(_onDriverLocationUpdated);
  }

  Future<void> _onRequestRide(RequestRideEvent event, Emitter<RideState> emit) async {
    emit(RideRequestInProgress());
    try {
      final ride = await _rideService.requestRide(
        pickupLat: event.pickupLat,
        pickupLng: event.pickupLng,
        pickupAddress: event.pickupAddress,
        dropoffLat: event.dropoffLat,
        dropoffLng: event.dropoffLng,
        dropoffAddress: event.dropoffAddress,
      );

      final rideId = ride['id'];
      emit(RideRequested(rideId: rideId, rideData: ride));

      // Start listening to real-time updates and location pings
      _trackingService.connect();
      
      _trackingService.listenToRideUpdates(rideId, (data) {
        add(UpdateRideStatusEvent(data['status'], data));
      });

      _trackingService.listenToDriverLocation(rideId, (data) {
        add(DriverLocationUpdatedEvent(
          lat: (data['lat'] as num).toDouble(),
          lng: (data['lng'] as num).toDouble(),
          bearing: (data['bearing'] as num?)?.toDouble() ?? 0.0,
        ));
      });
    } catch (e) {
      emit(RideFailure(error: e.toString()));
    }
  }

  void _onDriverLocationUpdated(DriverLocationUpdatedEvent event, Emitter<RideState> emit) {
    if (state is RideActive) {
      final currentState = state as RideActive;
      emit(currentState.copyWith(
        driverLat: event.lat,
        driverLng: event.lng,
        driverBearing: event.bearing,
      ));
    }
  }

  void _onUpdateStatus(UpdateRideStatusEvent event, Emitter<RideState> emit) {
    if (state is RideRequested || state is RideActive) {
      final rideId = (state as dynamic).rideId;
      emit(RideActive(
        rideId: rideId,
        status: event.status,
        data: event.data,
      ));
    }
  }
}
