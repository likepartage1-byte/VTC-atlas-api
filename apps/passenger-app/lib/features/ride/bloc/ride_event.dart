// lib/features/ride/bloc/ride_event.dart
// Yalla VTC Passenger — Ride Events

abstract class RideEvent {}

class SelectDestinationEvent extends RideEvent {
  final double originLat;
  final double originLng;
  final String originAddress;
  final double destLat;
  final double destLng;
  final String destAddress;

  SelectDestinationEvent({
    required this.originLat,
    required this.originLng,
    required this.originAddress,
    required this.destLat,
    required this.destLng,
    required this.destAddress,
  });
}

class RequestRideEvent extends RideEvent {
  final double pickupLat;
  final double pickupLng;
  final String pickupAddress;
  final double dropoffLat;
  final double dropoffLng;
  final String dropoffAddress;
  final String serviceType;

  RequestRideEvent({
    required this.pickupLat,
    required this.pickupLng,
    required this.pickupAddress,
    required this.dropoffLat,
    required this.dropoffLng,
    required this.dropoffAddress,
    this.serviceType = 'ECONOMY',
  });
}

class CancelRideEvent extends RideEvent {
  final String? rideId;
  final String? reason;

  CancelRideEvent({this.rideId, this.reason});
}

class ResetRideEvent extends RideEvent {}

class UpdateRideStatusEvent extends RideEvent {
  final String status;
  final dynamic data;

  UpdateRideStatusEvent(this.status, this.data);
}

class DriverLocationUpdatedEvent extends RideEvent {
  final double lat;
  final double lng;
  final double bearing;

  DriverLocationUpdatedEvent({
    required this.lat,
    required this.lng,
    this.bearing = 0.0,
  });
}
