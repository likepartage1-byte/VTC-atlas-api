import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import Svg, { Path, Circle, Rect, Line, Text as SvgText, G } from 'react-native-svg';
import { MapPin, Navigation, Compass, Plus, Minus, User, Flag } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeContext';

const { width: SCREEN_W } = Dimensions.get('window');

interface LocationCoord {
  latitude: number;
  longitude: number;
  title?: string;
}

interface AtlasMapViewProps {
  pickup?: LocationCoord;
  destination?: LocationCoord;
  height?: number;
  isDarkMode?: boolean;
  interactive?: boolean;
  onPressMap?: () => void;
}

export const AtlasMapView: React.FC<AtlasMapViewProps> = ({
  pickup = { latitude: 31.6258, longitude: -7.9891, title: 'CPGE-MARRAKECH PREPAS' },
  destination = { latitude: 31.6425, longitude: -8.0125, title: 'Clinique RIAD SALAM' },
  height = 240,
  isDarkMode = true,
  interactive = true,
  onPressMap,
}) => {
  const { colors } = useTheme();
  const [zoomLevel, setZoomLevel] = useState(1);

  const mapBg = isDarkMode ? '#1E1E22' : '#F3F4F6';
  const roadColor = isDarkMode ? '#2D2D35' : '#E5E7EB';
  const mainRoadColor = isDarkMode ? '#3F3F48' : '#D1D5DB';
  const landmarkTextColor = isDarkMode ? '#A1A1AA' : '#6B7280';
  const watermarkTextColor = isDarkMode ? '#3F3F46' : '#9CA3AF';

  return (
    <TouchableOpacity
      activeOpacity={onPressMap ? 0.9 : 1}
      onPress={onPressMap}
      style={[styles.container, { height, backgroundColor: mapBg }]}
    >
      {/* ── 1. Vector Map Roads & Grid Background ── */}
      <Svg height="100%" width="100%" viewBox="0 0 400 240" style={StyleSheet.absoluteFillObject}>
        {/* Secondary Roads Grid */}
        <Path d="M 0,40 L 400,40" stroke={roadColor} strokeWidth="3" />
        <Path d="M 0,90 L 400,90" stroke={roadColor} strokeWidth="2" />
        <Path d="M 0,150 L 400,150" stroke={roadColor} strokeWidth="3" />
        <Path d="M 0,200 L 400,200" stroke={roadColor} strokeWidth="2" />
        
        <Path d="M 50,0 L 50,240" stroke={roadColor} strokeWidth="2" />
        <Path d="M 120,0 L 120,240" stroke={roadColor} strokeWidth="3" />
        <Path d="M 220,0 L 220,240" stroke={roadColor} strokeWidth="2" />
        <Path d="M 310,0 L 310,240" stroke={roadColor} strokeWidth="4" />
        <Path d="M 370,0 L 370,240" stroke={roadColor} strokeWidth="2" />

        {/* Diagonal Arterial Avenues (Avenue Mohammed V / Boulevard Zerktouni) */}
        <Path d="M -20,220 Q 150,140 420,30" stroke={mainRoadColor} strokeWidth="8" />
        <Path d="M 60,-20 Q 200,100 340,260" stroke={mainRoadColor} strokeWidth="6" />

        {/* Park / Landmark Area (Jardin Majorelle / Menara) */}
        <Rect x="230" y="25" width="70" height="50" rx="10" fill={isDarkMode ? '#1B2E23' : '#D1FAE5'} />
        <SvgText x="265" y="55" fontSize="10" fontWeight="bold" fill={isDarkMode ? '#34D399' : '#059669'} textAnchor="middle">
          Majorelle
        </SvgText>

        <Rect x="40" y="160" width="80" height="55" rx="12" fill={isDarkMode ? '#1F2937' : '#E0F2FE'} />
        <SvgText x="80" y="192" fontSize="10" fontWeight="bold" fill={isDarkMode ? '#60A5FA' : '#0284C7'} textAnchor="middle">
          Ménara
        </SvgText>

        {/* ── 2. Route Path Curve (Blue Navigation Polyline) ── */}
        <Path
          d="M 85,175 C 130,165 140,110 200,105 C 250,100 270,70 295,50"
          stroke="#2563EB"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray="0"
          fill="none"
        />
        {/* Route Outer Glow Line */}
        <Path
          d="M 85,175 C 130,165 140,110 200,105 C 250,100 270,70 295,50"
          stroke="#60A5FA"
          strokeWidth="9"
          strokeOpacity="0.3"
          strokeLinecap="round"
          fill="none"
        />

        {/* City Label Watermark */}
        <SvgText x="18" y="222" fontSize="16" fontWeight="900" fill={watermarkTextColor} opacity="0.6">
          Marrakech • OpenStreetMap
        </SvgText>
      </Svg>

      {/* ── 3. Pickup Marker Pin (Green Dot / User Icon) ── */}
      <View style={[styles.markerAbsolute, { left: 70, top: 150 }]}>
        <View style={styles.markerPulseRing} />
        <View style={[styles.markerCircle, { backgroundColor: '#10B981' }]}>
          <User size={16} color="#FFFFFF" />
        </View>
        <View style={styles.markerTooltipCard}>
          <Text style={styles.markerTooltipText} numberOfLines={1}>
            {pickup.title || 'Pickup'}
          </Text>
        </View>
      </View>

      {/* ── 4. Destination Marker Pin (Red Flag / Destination) ── */}
      <View style={[styles.markerAbsolute, { left: 280, top: 25 }]}>
        <View style={[styles.markerCircle, { backgroundColor: '#EF4444' }]}>
          <Flag size={16} color="#FFFFFF" />
        </View>
        <View style={styles.markerTooltipCard}>
          <Text style={styles.markerTooltipText} numberOfLines={1}>
            {destination.title || 'Destination'}
          </Text>
        </View>
      </View>

      {/* ── 5. Map Controls Overlay ── */}
      {interactive && (
        <View style={styles.controlsOverlay}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.controlBtn}
            onPress={() => setZoomLevel((z) => Math.min(z + 0.2, 2))}
          >
            <Plus size={18} color={isDarkMode ? '#FFFFFF' : '#000000'} />
          </TouchableOpacity>
          <View style={styles.controlDivider} />
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.controlBtn}
            onPress={() => setZoomLevel((z) => Math.max(z - 0.2, 0.8))}
          >
            <Minus size={18} color={isDarkMode ? '#FFFFFF' : '#000000'} />
          </TouchableOpacity>
        </View>
      )}

      {/* Recenter Badge Button */}
      {interactive && (
        <TouchableOpacity activeOpacity={0.8} style={styles.recenterBtn}>
          <Compass size={18} color="#2563EB" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerAbsolute: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 10,
  },
  markerPulseRing: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
    top: -6,
  },
  markerCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  markerTooltipCard: {
    backgroundColor: 'rgba(18, 18, 20, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 4,
    maxWidth: 140,
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  markerTooltipText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  controlsOverlay: {
    position: 'absolute',
    right: 12,
    top: 12,
    backgroundColor: 'rgba(30, 30, 34, 0.88)',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 2,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3F3F46',
    elevation: 4,
  },
  controlBtn: {
    width: 34,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlDivider: {
    width: 20,
    height: 1,
    backgroundColor: '#3F3F46',
  },
  recenterBtn: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
});

export default AtlasMapView;
