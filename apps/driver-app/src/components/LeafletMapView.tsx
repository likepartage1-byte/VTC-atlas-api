import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

export interface LocationPoint {
  lat: number;
  lng: number;
  title?: string;
}

export interface LeafletMapViewProps {
  driver?: LocationPoint;
  pickup?: LocationPoint;
  destination?: LocationPoint;
  driverToPickupDist?: string;
  driverToPickupEta?: string;
  tripDist?: string;
  tripEta?: string;
  height?: number | string;
  isDarkMode?: boolean;
  routeCoordinates?: { latitude: number; longitude: number }[];
  onLocationSelect?: (point: { lat: number; lng: number }) => void;
  interactivePickup?: boolean;
}

const DEFAULT_MARRAKECH_DRIVER = { lat: 31.6342, lng: -8.0089, title: 'السائق (Driver)' };
const DEFAULT_MARRAKECH_PICKUP = { lat: 31.6258, lng: -7.9891, title: 'نقطة الانطلاق (A)' };
const DEFAULT_MARRAKECH_DEST   = { lat: 31.6425, lng: -8.0125, title: 'الوجهة (B)' };

export const LeafletMapView: React.FC<LeafletMapViewProps> = ({
  driver,
  pickup = DEFAULT_MARRAKECH_PICKUP,
  destination,
  driverToPickupDist,
  driverToPickupEta,
  tripDist,
  tripEta,
  height = '100%',
  isDarkMode = false,
  routeCoordinates = [],
  onLocationSelect,
  interactivePickup = false,
}) => {
  const htmlContent = useMemo(() => {
    const tileUrl = isDarkMode
      ? 'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png';

    const bgMapColor = isDarkMode ? '#12141A' : '#F3F4F6';

    const hasDriver = !!driver;
    const hasDestination = !!destination;

    const driverLat = driver?.lat || pickup.lat + 0.015;
    const driverLng = driver?.lng || pickup.lng - 0.012;

    const destLat = destination?.lat || pickup.lat + 0.020;
    const destLng = destination?.lng || pickup.lng + 0.018;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; background: ${bgMapColor}; overflow: hidden; }
    .leaflet-control-attribution, .leaflet-control-zoom { display: none !important; }

    /* Driver Vehicle Pin 🚗 */
    .custom-driver-car {
      width: 38px;
      height: 38px;
      background: ${isDarkMode ? '#1E293B' : '#FFFFFF'};
      border-radius: 50%;
      border: 3px solid #3B82F6;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.45);
      font-size: 20px;
    }

    /* Pickup Point A Badge 🔵 */
    .custom-pin-a {
      width: 32px;
      height: 32px;
      background: #10B981;
      border-radius: 50%;
      border: 3px solid #FFFFFF;
      box-shadow: 0 4px 10px rgba(16, 185, 129, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFFFFF;
      font-size: 15px;
      font-weight: 900;
    }

    /* Destination Point B Badge 🟣 */
    .custom-pin-b {
      width: 32px;
      height: 32px;
      background: #683EE6;
      border-radius: 50%;
      border: 3px solid #FFFFFF;
      box-shadow: 0 4px 10px rgba(104, 62, 230, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FFFFFF;
      font-size: 15px;
      font-weight: 900;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', { zoomControl: false, attributionControl: false }).setView([${pickup.lat}, ${pickup.lng}], 14);

    L.tileLayer('${tileUrl}', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    var allBounds = [];

    // 1. DRIVER MARKER 🚗
    var driverIcon = L.divIcon({
      className: '',
      html: '<div class="custom-driver-car">🚗</div>',
      iconSize: [38, 38],
      iconAnchor: [19, 19]
    });
    var driverMarker = L.marker([${driverLat}, ${driverLng}], { icon: driverIcon }).addTo(map);
    driverMarker.bindPopup("<b>${driver?.title || '🚗 السائق (Driver)'}</b>");
    allBounds.push([${driverLat}, ${driverLng}]);

    // 2. PICKUP MARKER A 🔵
    var pickupIcon = L.divIcon({
      className: '',
      html: '<div class="custom-pin-a">A</div>',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
    var pickupMarker = L.marker([${pickup.lat}, ${pickup.lng}], {
      icon: pickupIcon,
      draggable: ${interactivePickup}
    }).addTo(map);
    pickupMarker.bindPopup("<b>${pickup.title || 'Point A (Pickup)'}</b>");
    allBounds.push([${pickup.lat}, ${pickup.lng}]);

    // 3. DESTINATION MARKER B 🟣
    ${
      hasDestination
        ? `
    var destIcon = L.divIcon({
      className: '',
      html: '<div class="custom-pin-b">B</div>',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
    var destMarker = L.marker([${destLat}, ${destLng}], { icon: destIcon }).addTo(map);
    destMarker.bindPopup("<b>${destination.title || 'Point B (Destination)'}</b>");
    allBounds.push([${destLat}, ${destLng}]);
    `
        : ''
    }

    // 4. ROUTE LINE 1: DRIVER 🚗 -> PICKUP A (Dashed Blue Line)
    var driverToPickupPath = [
      [${driverLat}, ${driverLng}],
      [${pickup.lat}, ${pickup.lng}]
    ];
    L.polyline(driverToPickupPath, {
      color: '#3B82F6',
      weight: 4,
      dashArray: '6, 8',
      opacity: 0.9,
      lineCap: 'round'
    }).addTo(map);

    // 5. ROUTE LINE 2: PICKUP A -> DROP OFF B (Solid Purple Line)
    ${
      hasDestination
        ? `
    var pickupToDestPath = [
      [${pickup.lat}, ${pickup.lng}],
      [${destLat}, ${destLng}]
    ];
    L.polyline(pickupToDestPath, {
      color: '#683EE6',
      weight: 6,
      opacity: 0.95,
      lineCap: 'round'
    }).addTo(map);
    `
        : ''
    }

    // 6. FIT BOUNDS SO ALL 3 POINTS ARE VISIBLE ON MAP (Auto-fit Camera)
    if (allBounds.length > 1) {
      var bounds = L.latLngBounds(allBounds);
      map.fitBounds(bounds, { padding: [35, 35] });
    }
  </script>
</body>
</html>
    `;
  }, [driver, pickup, destination, isDarkMode, interactivePickup]);

  return (
    <View style={[styles.container, { height }]}>
      <WebView
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scrollEnabled={false}
        overScrollMode="never"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  webview: {
    backgroundColor: 'transparent',
    width: '100%',
    height: '100%',
  },
});

export default LeafletMapView;
