abstract class RideState {}

class RideInitial extends RideState {}

class RideRequestInProgress extends RideState {}

class RideRequested extends RideState {
  final String rideId;
  final dynamic rideData;
  RideRequested({required this.rideId, required this.rideData});
}

class RideActive extends RideState {
  final String rideId;
  final String status;
  final dynamic data;
  
  // Real-time Driver Location Engine Fields
  final double? driverLat;
  final double? driverLng;
  final double? driverBearing;

  RideActive({
    required this.rideId, 
    required this.status, 
    required this.data,
    this.driverLat,
    this.driverLng,
    this.driverBearing,
  });

  RideActive copyWith({
    String? status,
    dynamic data,
    double? driverLat,
    double? driverLng,
    double? driverBearing,
  }) {
    return RideActive(
      rideId: this.rideId,
      status: status ?? this.status,
      data: data ?? this.data,
      driverLat: driverLat ?? this.driverLat,
      driverLng: driverLng ?? this.driverLng,
      driverBearing: driverBearing ?? this.driverBearing,
    );
  }
}

class RideFailure extends RideState {
  final String error;
  RideFailure({required this.error});
}
