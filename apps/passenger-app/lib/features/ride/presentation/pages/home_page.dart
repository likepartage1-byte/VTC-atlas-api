import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/ride_bloc.dart';
import '../bloc/ride_event.dart';
import '../bloc/ride_state.dart';
import '../services/realtime_tracking_service.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  late GoogleMapController _mapController;
  
  static const CameraPosition _initialPosition = CameraPosition(
    target: LatLng(31.6295, -7.9811), // Marrakech
    zoom: 13.5,
  );

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => RideBloc(
        context.read<PassengerRideService>(),
        context.read<RealtimeTrackingService>(),
      ),
      child: BlocConsumer<RideBloc, RideState>(
        listener: (context, state) {
          if (state is RideFailure) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('Error: ${state.error}')),
            );
          }
        },
        builder: (context, state) {
          return Scaffold(
            body: Stack(
              children: [
                // 1. Map Layer
                GoogleMap(
                  initialCameraPosition: _initialPosition,
                  onMapCreated: (controller) => _mapController = controller,
                  myLocationEnabled: true,
                  myLocationButtonEnabled: false,
                  markers: _buildMarkers(state),
                  circles: _buildCircles(state),
                ),
// ...
  Set<Marker> _buildMarkers(RideState state) {
    final markers = <Marker>{};

    if (state is RideActive && state.driverLat != null) {
      markers.add(
        Marker(
          markerId: const MarkerId('driver'),
          position: LatLng(state.driverLat!, state.driverLng!),
          rotation: state.driverBearing ?? 0,
          anchor: const Offset(0.5, 0.5),
          icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueAzure), // Future: Custom Car SVG
          infoWindow: const InfoWindow(title: "Your Driver"),
        ),
      );

      // Pickup Marker
      markers.add(
        const Marker(
          markerId: MarkerId('pickup'),
          position: LatLng(31.6295, -7.9811),
          icon: BitmapDescriptor.defaultMarker,
        ),
      );
    }
    return markers;
  }

  Set<Circle> _buildCircles(RideState state) {
    if (state is RideActive) {
      return {
        Circle(
          circleId: const CircleId('geofence'),
          center: const LatLng(31.6295, -7.9811),
          radius: 150,
          fillColor: const Color(0xFFE5B80B).withOpacity(0.1),
          strokeColor: const Color(0xFFE5B80B),
          strokeWidth: 2,
        ),
      };
    }
    return {};
  }

                // 2. Search UI
                SafeArea(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                    child: Column(
                      children: [
                        const AtlasSearchBar(hintText: "Where to?"),
                        const SizedBox(height: 10),
                        _buildQuickActionChips(),
                      ],
                    ),
                  ),
                ),

                // 3. Booking Panel (Triggered by Search)
                if (state is! RideActive)
                  Positioned(
                    bottom: 0,
                    left: 0,
                    right: 0,
                    child: _buildBookingPanel(context, state),
                  ),
                
                // 4. Ride Status Overlay
                if (state is RideActive)
                  Positioned(
                    bottom: 30,
                    left: 20,
                    right: 20,
                    child: _buildStatusCard(state),
                  ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildBookingPanel(BuildContext context, RideState state) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Text("Atlas Economy", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const Text("Approx. 25 MAD • 8 mins away", style: TextStyle(color: Colors.grey)),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            height: 55,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFE5B80B),
                foregroundColor: Colors.black,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              onPressed: state is RideRequestInProgress 
                ? null 
                : () {
                    context.read<RideBloc>().add(RequestRideEvent(
                      pickupLat: 31.6295,
                      pickupLng: -7.9811,
                      pickupAddress: "Current Location",
                      dropoffLat: 31.6420,
                      dropoffLng: -8.0120,
                      dropoffAddress: "Majorelle Garden",
                    ));
                  },
              child: state is RideRequestInProgress
                ? const CircularProgressIndicator(color: Colors.black)
                : const Text("Confirm Atlas", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusCard(RideActive state) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.black,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          const CircularProgressIndicator(color: Color(0xFFE5B80B), strokeWidth: 2),
          const SizedBox(width: 20),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "Status: ${state.status}",
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                ),
                const Text("Looking for nearest driver...", style: TextStyle(color: Colors.grey, fontSize: 12)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActionChips() {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          _actionChip(Icons.home, "Home"),
          _actionChip(Icons.work, "Work"),
          _actionChip(Icons.star, "Favorites"),
        ],
      ),
    );
  }

  Widget _actionChip(IconData icon, String label) {
    return Container(
      margin: const EdgeInsets.only(right: 10),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(30),
        boxShadow: [
          BoxShadow(color: Colors.black12, blurRadius: 10, spreadRadius: 0)
        ],
      ),
      child: Row(
        children: [
          Icon(icon, size: 18, color: Colors.grey[700]),
          const SizedBox(width: 8),
          Text(label, style: const TextStyle(fontWeight: FontWeight.w600)),
        ],
      ),
    );
  }

  Widget _buildLocationButton() {
    return FloatingActionButton(
      mini: true,
      backgroundColor: Colors.white,
      onPressed: () {},
      child: const Icon(Icons.my_location, color: Colors.black),
    );
  }

  final String _mapStyle = "[]"; // Placeholder for Map Style JSON
}
