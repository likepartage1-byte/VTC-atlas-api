abstract class RideEvent {}

class RequestRideEvent extends RideEvent {
  final double pickupLat;
  final double pickupLng;
  final String pickupAddress;
  final double dropoffLat;
  final double dropoffLng;
  final String dropoffAddress;

  RequestRideEvent({
    required this.pickupLat,
    required this.pickupLng,
    required this.pickupAddress,
    required this.dropoffLat,
    required this.dropoffLng,
    required this.dropoffAddress,
  });
}

class UpdateRideStatusEvent extends RideEvent {
  final String status;
  final dynamic data;
  UpdateRideStatusEvent(this.status, this.data);
}

class DriverLocationUpdatedEvent extends RideEvent {
  final double lat;
  final double lng;
  final double bearing;
  DriverLocationUpdatedEvent({required this.lat, required this.lng, required this.bearing});
}
