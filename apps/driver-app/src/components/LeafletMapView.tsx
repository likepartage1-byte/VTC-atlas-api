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
  driverToPickupDist = '1.5 km',
  driverToPickupEta = '2 min',
  tripDist = '8.8 km',
  tripEta = '14 min',
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

    const hasDestination = !!destination;

    const driverLat = driver?.lat || pickup.lat + 0.015;
    const driverLng = driver?.lng || pickup.lng - 0.012;

    const destLat = destination?.lat || pickup.lat + 0.020;
    const destLng = destination?.lng || pickup.lng + 0.018;

    const cleanDriverDist = driverToPickupDist.replace(/^~/, '').trim();
    const cleanDriverEta = driverToPickupEta.replace(/^~/, '').trim();
    const cleanTripDist = tripDist.replace(/^~/, '').trim();
    const cleanTripEta = tripEta.replace(/^~/, '').trim();

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
      width: 36px;
      height: 36px;
      background: ${isDarkMode ? '#1E293B' : '#FFFFFF'};
      border-radius: 50%;
      border: 3px solid #3B82F6;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.45);
      font-size: 19px;
    }

    /* Pickup Point A Marker Badge 🔵 */
    .custom-pin-a {
      width: 30px;
      height: 30px;
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

    /* Destination Point B Marker Badge 🟣 (Yalla Logo Purple #683EE6) */
    .custom-pin-b {
      width: 30px;
      height: 30px;
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

    /* Compact Square Badge above Marker A (Blue) */
    .tag-badge-a {
      background: #3B82F6;
      color: #FFFFFF;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 800;
      text-align: center;
      box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
      margin-bottom: 4px;
      white-space: nowrap;
      line-height: 1.25;
      font-family: system-ui, -apple-system, sans-serif;
    }

    /* Compact Square Badge above Marker B (Yalla Logo Purple #683EE6) */
    .tag-badge-b {
      background: #683EE6;
      color: #FFFFFF;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 800;
      text-align: center;
      box-shadow: 0 3px 8px rgba(104, 62, 230, 0.4);
      margin-bottom: 4px;
      white-space: nowrap;
      line-height: 1.25;
      font-family: system-ui, -apple-system, sans-serif;
    }

    /* Floating Zoom Controls (+ / -) */
    .zoom-container {
      position: absolute;
      bottom: 12px;
      right: 12px;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .zoom-btn {
      width: 36px;
      height: 36px;
      background: ${isDarkMode ? '#1E293B' : '#FFFFFF'};
      color: ${isDarkMode ? '#F9FAFB' : '#111827'};
      border-radius: 10px;
      border: 1px solid ${isDarkMode ? '#334155' : '#E5E7EB'};
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      font-weight: 800;
      cursor: pointer;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
    }
    .zoom-btn:active {
      transform: scale(0.92);
      background: ${isDarkMode ? '#334155' : '#E5E7EB'};
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <div class="zoom-container">
    <div class="zoom-btn" onclick="map.zoomIn()">+</div>
    <div class="zoom-btn" onclick="map.zoomOut()">−</div>
  </div>
  <script>
    var map = L.map('map', {
      zoomControl: false,
      attributionControl: false,
      dragging: true,
      touchZoom: true,
      doubleClickZoom: true,
      scrollWheelZoom: true,
      tap: true,
    }).setView([${pickup.lat}, ${pickup.lng}], 12);

    L.tileLayer('${tileUrl}', {
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    var allBounds = [];

    // 1. DRIVER MARKER 🚗
    var driverIcon = L.divIcon({
      className: '',
      html: '<div class="custom-driver-car">🚗</div>',
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });
    var driverMarker = L.marker([${driverLat}, ${driverLng}], { icon: driverIcon }).addTo(map);
    allBounds.push([${driverLat}, ${driverLng}]);

    // 2. PICKUP MARKER A 🔵 with Tag Box directly above (Distance top, ETA bottom)
    var pickupIcon = L.divIcon({
      className: '',
      html: '<div style="display:flex; flex-direction:column; align-items:center;">' +
              '<div class="tag-badge-a">' +
                '<div>${cleanDriverDist}</div>' +
                '<div>${cleanDriverEta}</div>' +
              '</div>' +
              '<div class="custom-pin-a">A</div>' +
            '</div>',
      iconSize: [75, 75],
      iconAnchor: [37, 75]
    });
    var pickupMarker = L.marker([${pickup.lat}, ${pickup.lng}], {
      icon: pickupIcon,
      draggable: ${interactivePickup}
    }).addTo(map);
    allBounds.push([${pickup.lat}, ${pickup.lng}]);

    // 3. DESTINATION MARKER B 🟣 with Yalla Logo Purple Tag Box directly above (Distance top, ETA bottom)
    ${
      hasDestination
        ? `
    var destIcon = L.divIcon({
      className: '',
      html: '<div style="display:flex; flex-direction:column; align-items:center;">' +
              '<div class="tag-badge-b">' +
                '<div>${cleanTripDist}</div>' +
                '<div>${cleanTripEta}</div>' +
              '</div>' +
              '<div class="custom-pin-b">B</div>' +
            '</div>',
      iconSize: [75, 75],
      iconAnchor: [37, 75]
    });
    var destMarker = L.marker([${destLat}, ${destLng}], { icon: destIcon }).addTo(map);
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

    // 5. ROUTE LINE 2: PICKUP A -> DROP OFF B (Solid Yalla Purple Line #683EE6)
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

    // 6. GUARANTEED AUTOMATIC FIT BOUNDS (Driver 🚗, Pickup A, Dropoff B)
    function autoFitCamera() {
      if (allBounds.length > 1) {
        map.invalidateSize();
        var bounds = L.latLngBounds(allBounds);
        map.fitBounds(bounds, { padding: [35, 35], maxZoom: 15, animate: false });
      }
    }

    // Execute autoFit immediately and with delayed timeouts to handle WebView layout stabilization
    autoFitCamera();
    setTimeout(autoFitCamera, 100);
    setTimeout(autoFitCamera, 300);
  </script>
</body>
</html>
    `;
  }, [driver, pickup, destination, driverToPickupDist, driverToPickupEta, tripDist, tripEta, isDarkMode, interactivePickup]);

  return (
    <View style={[styles.container, { height }]}>
      <WebView
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scrollEnabled={true}
        nestedScrollEnabled={true}
        overScrollMode="always"
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
