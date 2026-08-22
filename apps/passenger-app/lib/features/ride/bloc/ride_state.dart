// lib/features/ride/bloc/ride_state.dart
// Yalla VTC Passenger — Complete Ride State Machine

import '../map/yalla_map_controller.dart';

abstract class RideState {}

/// Default state on app open — no ride in progress
class RideInitial extends RideState {}

/// Destination has been selected, ready to confirm
class RideDestinationSelected extends RideState {
  final double originLat;
  final double originLng;
  final String originAddress;
  final double destLat;
  final double destLng;
  final String destAddress;
  final double? distanceKm;
  final int? durationMin;
  final double? estimatedPrice;
  final List<YallaLatLng> routePoints;

  RideDestinationSelected({
    required this.originLat,
    required this.originLng,
    required this.originAddress,
    required this.destLat,
    required this.destLng,
    required this.destAddress,
    this.distanceKm,
    this.durationMin,
    this.estimatedPrice,
    this.routePoints = const [],
  });
}

/// Ride request is being sent to the backend
class RideRequestInProgress extends RideState {}

/// Request sent — waiting for a driver to accept
class RideSearchingDriver extends RideState {
  final String rideId;
  final List<YallaLatLng> routePoints;
  final double? offeredPrice;
  final double? distanceKm;
  final int? durationMin;

  RideSearchingDriver({
    required this.rideId,
    this.routePoints = const [],
    this.offeredPrice,
    this.distanceKm,
    this.durationMin,
  });
}

/// A driver accepted the ride — driver details available
class RideDriverAccepted extends RideState {
  final String rideId;
  final String driverName;
  final double driverRating;
  final String vehicleModel;
  final String vehicleColor;
  final String vehiclePlate;
  final int etaMinutes;
  final String? driverPhone;
  final double? driverLat;
  final double? driverLng;
  final double? driverBearing;

  RideDriverAccepted({
    required this.rideId,
    required this.driverName,
    required this.driverRating,
    required this.vehicleModel,
    required this.vehicleColor,
    required this.vehiclePlate,
    required this.etaMinutes,
    this.driverPhone,
    this.driverLat,
    this.driverLng,
    this.driverBearing,
  });

  RideDriverAccepted copyWith({
    double? driverLat,
    double? driverLng,
    double? driverBearing,
    int? etaMinutes,
  }) {
    return RideDriverAccepted(
      rideId: rideId,
      driverName: driverName,
      driverRating: driverRating,
      vehicleModel: vehicleModel,
      vehicleColor: vehicleColor,
      vehiclePlate: vehiclePlate,
      etaMinutes: etaMinutes ?? this.etaMinutes,
      driverLat: driverLat ?? this.driverLat,
      driverLng: driverLng ?? this.driverLng,
      driverBearing: driverBearing ?? this.driverBearing,
    );
  }
}

/// Ride is ongoing — driver picked up passenger
class RideActive extends RideState {
  final String rideId;
  final String status;
  final dynamic data;
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
      rideId: rideId,
      status: status ?? this.status,
      data: data ?? this.data,
      driverLat: driverLat ?? this.driverLat,
      driverLng: driverLng ?? this.driverLng,
      driverBearing: driverBearing ?? this.driverBearing,
    );
  }
}

/// Ride was cancelled (by passenger or driver)
class RideCancelled extends RideState {
  final String reason;
  RideCancelled({this.reason = ''});
}

/// Trip completed successfully
class RideCompleted extends RideState {
  final String rideId;
  final double totalPrice;
  RideCompleted({required this.rideId, required this.totalPrice});
}

/// Any error in the ride flow
class RideFailure extends RideState {
  final String error;
  RideFailure({required this.error});
}
