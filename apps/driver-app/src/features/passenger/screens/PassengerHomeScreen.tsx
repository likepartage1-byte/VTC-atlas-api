import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  StatusBar,
  Switch,
  Modal,
} from 'react-native';
import MapView, { Marker, UrlTile, Polyline } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { useTheme } from '../../../theme/ThemeContext';
import { useTranslation } from 'react-i18next';
import { useAppModeStore } from '../../../store/useAppModeStore';
import { usePassengerRideStore } from '../../../store/usePassengerRideStore';
import { passengerRideService } from '../services/passenger-ride.service';
import { routingService, GeocodedPlace } from '../services/routing.service';
import { ModeSwitcherBadge } from '../../../components/ModeSwitcherBadge';
import { DrawerHeader } from '../../../components/DrawerHeader';
import { LeafletMapView } from '../../../components/LeafletMapView';
import { AtlasMapView } from '../../../components/AtlasMapView';
import { calculatePricing } from '../../../services/pricingEngine.service';
import Svg, { Path, Rect, Circle, Ellipse, G, Defs, LinearGradient as SvgLinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import {
  MapPin,
  Navigation,
  Car,
  Bike,
  Truck,
  ShieldCheck,
  Phone,
  MessageSquare,
  Clock,
  Route,
  Menu,
  Compass,
  Search,
  X,
  User,
  Sparkles,
  Crown,
  Plus,
  Minus,
  SlidersHorizontal,
} from 'lucide-react-native';

const DEFAULT_MARRAKECH = { lat: 31.6258, lng: -7.9891 };

// --- YALLA VTC FULL-COLOR REALISTIC VEHICLE CATEGORY GRAPHICS ---
const YallaCategoryGraphic: React.FC<{ id: string; size?: number }> = ({ id, size = 68 }) => {
  const normId = (id || 'ECO').toUpperCase();

  switch (normId) {
    case 'ECO':
      // 🚗 Yalla Eco: Full Color Metallic Purple Urban Hatchback (Dacia Sandero / Peugeot 208 Style)
      return (
        <Svg width={size} height={size * 0.55} viewBox="0 0 100 55" fill="none">
          <Ellipse cx="50" cy="50" rx="42" ry="4.5" fill="rgba(0,0,0,0.35)" />
          <Path
            d="M 12 39 C 12 31, 18 30, 24 30 L 34 16 C 37 12, 44 10, 52 10 L 68 10 C 74 10, 80 13, 84 17 L 90 31 C 94 31, 96 33, 96 37 L 96 43 C 96 45, 94 46, 91 46 L 87 46 C 87 49, 83 51, 78 51 C 73 51, 69 49, 69 46 L 37 46 C 37 49, 33 51, 28 51 C 23 51, 19 49, 19 46 L 13 46 C 11 46, 9 44, 9 42 L 9 38 C 9 36, 10 35, 12 35 Z"
            fill="url(#purpleBodyGrad)"
            stroke="#5B21B6"
            strokeWidth="1.5"
          />
          <Path
            d="M 35 28 L 81 28 L 74 16 C 72 13, 67 12, 62 12 L 47 12 C 42 12, 38 14, 36 18 Z"
            fill="url(#glassGrad)"
            stroke="#312E81"
            strokeWidth="1.5"
          />
          <Path d="M 86 32 L 95 34 L 94 39 L 85 37 Z" fill="#E0E7FF" stroke="#818CF8" strokeWidth="1" />
          <Rect x="48" y="33" width="8" height="2" rx="1" fill="#E2E8F0" />
          <Circle cx="28" cy="46" r="7.5" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
          <Circle cx="28" cy="46" r="4" fill="#94A3B8" stroke="#475569" strokeWidth="1.2" />
          <Circle cx="78" cy="46" r="7.5" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
          <Circle cx="78" cy="46" r="4" fill="#94A3B8" stroke="#475569" strokeWidth="1.2" />
          <Defs>
            <SvgLinearGradient id="purpleBodyGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#A855F7" />
              <Stop offset="50%" stopColor="#7C3AED" />
              <Stop offset="100%" stopColor="#4C1D95" />
            </SvgLinearGradient>
            <SvgLinearGradient id="glassGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#818CF8" stopOpacity="0.85" />
              <Stop offset="100%" stopColor="#1E1B4B" stopOpacity="0.95" />
            </SvgLinearGradient>
          </Defs>
        </Svg>
      );

    case 'COURSE_PLUS':
    case 'CARGO':
      // 🚘 Yalla Course+: Full Color Electric Blue Modern Sedan (Renault Megane / Peugeot 308 Style)
      return (
        <Svg width={size} height={size * 0.55} viewBox="0 0 100 55" fill="none">
          <Ellipse cx="50" cy="50" rx="44" ry="4.5" fill="rgba(0,0,0,0.35)" />
          <Path
            d="M 10 39 C 10 30, 16 29, 22 29 L 32 14 C 35 10, 43 8, 53 8 L 72 8 C 78 8, 84 11, 88 16 L 94 30 C 97 30, 98 32, 98 36 L 98 43 C 98 45, 96 46, 93 46 L 89 46 C 89 49, 85 51, 80 51 C 75 51, 71 49, 71 46 L 36 46 C 36 49, 32 51, 27 51 C 22 51, 18 49, 18 46 L 12 46 C 10 46, 8 44, 8 42 L 8 38 Z"
            fill="url(#blueBodyGrad)"
            stroke="#1D4ED8"
            strokeWidth="1.5"
          />
          <Path
            d="M 33 27 L 85 27 L 78 14 C 75 11, 70 10, 64 10 L 46 10 C 40 10, 36 12, 34 16 Z"
            fill="url(#blueGlassGrad)"
            stroke="#1E3A8A"
            strokeWidth="1.5"
          />
          <G transform="translate(68, 2)">
            <Circle cx="7" cy="7" r="6" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="1.2" />
            <Path d="M 7 3.5 L 7 10.5 M 3.5 7 L 10.5 7" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          </G>
          <Path d="M 90 31 L 97 33 L 96 38 L 89 36 Z" fill="#F0F9FF" stroke="#60A5FA" strokeWidth="1" />
          <Rect x="50" y="32" width="8" height="2" rx="1" fill="#E2E8F0" />
          <Circle cx="27" cy="46" r="7.5" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
          <Circle cx="27" cy="46" r="4" fill="#CBD5E1" stroke="#475569" strokeWidth="1.2" />
          <Circle cx="80" cy="46" r="7.5" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
          <Circle cx="80" cy="46" r="4" fill="#CBD5E1" stroke="#475569" strokeWidth="1.2" />
          <Defs>
            <SvgLinearGradient id="blueBodyGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#3B82F6" />
              <Stop offset="50%" stopColor="#2563EB" />
              <Stop offset="100%" stopColor="#1E40AF" />
            </SvgLinearGradient>
            <SvgLinearGradient id="blueGlassGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#60A5FA" stopOpacity="0.85" />
              <Stop offset="100%" stopColor="#172554" stopOpacity="0.95" />
            </SvgLinearGradient>
          </Defs>
        </Svg>
      );

    case 'CONFORT':
    case 'COMFORT':
      // 🖤 Yalla Confort: Full Color Glossy Black Executive VIP Sedan (Mercedes Benz S-Class / E-Class Style)
      return (
        <Svg width={size} height={size * 0.55} viewBox="0 0 100 55" fill="none">
          <Ellipse cx="50" cy="50" rx="46" ry="5" fill="rgba(0,0,0,0.5)" />
          <Path
            d="M 8 39 C 8 29, 15 28, 21 28 L 31 12 C 34 8, 43 6, 54 6 L 74 6 C 80 6, 86 9, 90 14 L 96 28 C 99 28, 100 30, 100 34 L 100 42 C 100 44, 98 46, 95 46 L 91 46 C 91 49, 87 51.5, 81 51.5 C 75 51.5, 71 49, 71 46 L 36 46 C 36 49, 32 51.5, 26 51.5 C 20 51.5, 16 49, 16 46 L 10 46 C 8 46, 6 44, 6 42 L 6 38 Z"
            fill="url(#blackBodyGrad)"
            stroke="#475569"
            strokeWidth="1.5"
          />
          <Path d="M 12 31 L 93 31" stroke="#E2E8F0" strokeWidth="1.8" opacity="0.9" />
          <Path
            d="M 32 25 L 87 25 L 80 12 C 77 9, 72 8, 65 8 L 45 8 C 39 8, 35 10, 33 14 Z"
            fill="url(#blackGlassGrad)"
            stroke="#64748B"
            strokeWidth="1.5"
          />
          <G transform="translate(45, 10)">
            <Path d="M2 8 L5 2 L8 5 L11 2 L14 8 Z" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
          </G>
          <Path d="M 92 29 L 99 31 L 98 36 L 91 34 Z" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1" />
          <Rect x="52" y="30" width="10" height="2" rx="1" fill="#F8FAFC" />
          <Circle cx="26" cy="46" r="8" fill="#0F172A" stroke="#334155" strokeWidth="2" />
          <Circle cx="26" cy="46" r="4.5" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.2" />
          <Circle cx="81" cy="46" r="8" fill="#0F172A" stroke="#334155" strokeWidth="2" />
          <Circle cx="81" cy="46" r="4.5" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.2" />
          <Defs>
            <SvgLinearGradient id="blackBodyGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#334155" />
              <Stop offset="40%" stopColor="#1E293B" />
              <Stop offset="100%" stopColor="#020617" />
            </SvgLinearGradient>
            <SvgLinearGradient id="blackGlassGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#475569" stopOpacity="0.75" />
              <Stop offset="100%" stopColor="#000000" stopOpacity="0.95" />
            </SvgLinearGradient>
          </Defs>
        </Svg>
      );

    case 'TAXI':
      // 🚕 Yalla Taxi: Full Color Vibrant Yellow Moroccan City Taxi with TAXI Roof Box
      return (
        <Svg width={size} height={size * 0.55} viewBox="0 0 100 55" fill="none">
          <Ellipse cx="50" cy="50" rx="42" ry="4.5" fill="rgba(0,0,0,0.35)" />
          <Rect x="42" y="3" width="16" height="7" rx="2" fill="#000000" stroke="#EAB308" strokeWidth="1.2" />
          <SvgText x="50" y="8.5" textAnchor="middle" fill="#FACC15" fontSize="5.5" fontWeight="bold">TAXI</SvgText>

          <Path
            d="M 12 39 C 12 31, 18 30, 24 30 L 34 16 C 37 12, 44 10, 52 10 L 68 10 C 74 10, 80 13, 84 17 L 90 31 C 94 31, 96 33, 96 37 L 96 43 C 96 45, 94 46, 91 46 L 87 46 C 87 49, 83 51, 78 51 C 73 51, 69 49, 69 46 L 37 46 C 37 49, 33 51, 28 51 C 23 51, 19 49, 19 46 L 13 46 C 11 46, 9 44, 9 42 L 9 38 Z"
            fill="url(#yellowTaxiGrad)"
            stroke="#CA8A04"
            strokeWidth="1.5"
          />
          <Rect x="30" y="32" width="5" height="3.5" fill="#000000" />
          <Rect x="40" y="32" width="5" height="3.5" fill="#000000" />
          <Rect x="50" y="32" width="5" height="3.5" fill="#000000" />
          <Rect x="60" y="32" width="5" height="3.5" fill="#000000" />

          <Path
            d="M 35 28 L 81 28 L 74 16 C 72 13, 67 12, 62 12 L 47 12 C 42 12, 38 14, 36 18 Z"
            fill="url(#taxiGlassGrad)"
            stroke="#854D0E"
            strokeWidth="1.5"
          />
          <Circle cx="28" cy="46" r="7.5" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
          <Circle cx="28" cy="46" r="4" fill="#FACC15" stroke="#854D0E" strokeWidth="1.2" />
          <Circle cx="78" cy="46" r="7.5" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
          <Circle cx="78" cy="46" r="4" fill="#FACC15" stroke="#854D0E" strokeWidth="1.2" />
          <Defs>
            <SvgLinearGradient id="yellowTaxiGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#FDE047" />
              <Stop offset="50%" stopColor="#EAB308" />
              <Stop offset="100%" stopColor="#CA8A04" />
            </SvgLinearGradient>
            <SvgLinearGradient id="taxiGlassGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#FEF08A" stopOpacity="0.85" />
              <Stop offset="100%" stopColor="#713F12" stopOpacity="0.95" />
            </SvgLinearGradient>
          </Defs>
        </Svg>
      );

    case 'MOTO':
      // 🛵 Yalla Moto: Full Color Vibrant Red Express Motorbike Scooter
      return (
        <Svg width={size} height={size * 0.55} viewBox="0 0 100 55" fill="none">
          <Ellipse cx="50" cy="50" rx="36" ry="4" fill="rgba(0,0,0,0.35)" />
          <Circle cx="25" cy="40" r="9" fill="#1E293B" stroke="#0F172A" strokeWidth="2.5" />
          <Circle cx="25" cy="40" r="4" fill="#94A3B8" stroke="#475569" strokeWidth="1.2" />
          <Circle cx="75" cy="40" r="9" fill="#1E293B" stroke="#0F172A" strokeWidth="2.5" />
          <Circle cx="75" cy="40" r="4" fill="#94A3B8" stroke="#475569" strokeWidth="1.2" />

          <Path
            d="M 25 40 L 42 26 L 60 26 L 75 40 M 42 26 L 32 14 M 60 26 L 70 14 M 70 14 L 80 14 M 70 14 L 70 10"
            stroke="url(#redMotoGrad)"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M 30 22 C 30 18, 36 16, 48 16 L 62 16 C 68 16, 72 20, 72 24 Z"
            fill="url(#redMotoGrad)"
          />
          <Path d="M 22 21 C 22 17, 28 16, 38 16 L 46 16 C 42 21, 34 22, 22 21 Z" fill="#18181B" />
          <Circle cx="78" cy="14" r="3" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1" />
          <Defs>
            <SvgLinearGradient id="redMotoGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#F87171" />
              <Stop offset="50%" stopColor="#EF4444" />
              <Stop offset="100%" stopColor="#B91C1C" />
            </SvgLinearGradient>
          </Defs>
        </Svg>
      );

    default:
      return (
        <Svg width={size} height={size * 0.55} viewBox="0 0 100 55" fill="none">
          <Path d="M 12 40 L 88 40" stroke="#7C3AED" strokeWidth="3.5" />
        </Svg>
      );
  }
};

const POPULAR_LOCATIONS: GeocodedPlace[] = [
  { name: 'Jemaa el-Fnaa, Marrakech', lat: 31.6258, lng: -7.9891 },
  { name: 'Gueliz Avenue Mohammed V, Marrakech', lat: 31.6342, lng: -8.0089 },
  { name: 'Aéroport Marrakech-Ménara (RAK)', lat: 31.6069, lng: -8.0363 },
  { name: 'Palmeraie, Marrakech', lat: 31.6667, lng: -7.9500 },
  { name: 'Hivernage, Marrakech', lat: 31.6200, lng: -8.0100 },
  { name: 'Gare de Marrakech (ONCF)', lat: 31.6300, lng: -8.0150 },
];

export const PassengerHomeScreen = ({ navigation }: any) => {
  const { colors, isDarkMode, setMode } = useTheme();
  const { i18n } = useTranslation();
  const { activeMode } = useAppModeStore();
  const mapRef = useRef<MapView>(null);

  const rawLang = (i18n.language || 'fr').toLowerCase();
  const lang = rawLang.startsWith('ar') ? 'ar' : rawLang.startsWith('es') ? 'es' : rawLang.startsWith('en') ? 'en' : 'fr';
  const isRTL = lang === 'ar';



  const {
    status,
    rideId,
    pickup,
    destination,
    assignedDriver,
    estimatedFareMAD,
    serviceType,
    setSearching,
    setRideStatus,
    resetRide,
  } = usePassengerRideStore();

  const [pickupText, setPickupText] = useState('Mon Emplacement Actuel');
  const [pickupCoord, setPickupCoord] = useState<{ lat: number; lng: number }>(DEFAULT_MARRAKECH);
  const [pickupSearchResults, setPickupSearchResults] = useState<GeocodedPlace[]>([]);
  const [isSearchingPickup, setIsSearchingPickup] = useState(false);

  const [destinationText, setDestinationText] = useState('');
  const [selectedDestination, setSelectedDestination] = useState<GeocodedPlace | null>(null);
  const [searchResults, setSearchResults] = useState<GeocodedPlace[]>([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);

  const [selectedService, setSelectedService] = useState<'ECO' | 'COURSE_PLUS' | 'CONFORT' | 'TAXI' | 'MOTO' | 'CARGO' | 'COMFORT'>('ECO');
  const [isRequesting, setIsRequesting] = useState(false);

  // Custom Fare Bidding Controls (Integer Dirhams only & max 20% discount guard)
  const [customFareMAD, setCustomFareMAD] = useState<number | null>(null);
  const [showMinPriceWarning, setShowMinPriceWarning] = useState(false);
  const [autoAcceptOffer, setAutoAcceptOffer] = useState(false);
  const [isMoreThan4Passengers, setIsMoreThan4Passengers] = useState(false);
  const [passengerComment, setPassengerComment] = useState('');
  const [showOptionsModal, setShowOptionsModal] = useState(false);

  // Map Pickup Location Picker Modal
  const [showMapPickerModal, setShowMapPickerModal] = useState(false);
  const [pickerCoord, setPickerCoord] = useState<{ lat: number; lng: number }>(DEFAULT_MARRAKECH);
  const [isGeocodingPicker, setIsGeocodingPicker] = useState(false);

  // Search input & autocomplete inside Map Picker Modal
  const [pickerSearchQuery, setPickerSearchQuery] = useState('');
  const [pickerSearchResults, setPickerSearchResults] = useState<GeocodedPlace[]>([]);
  const [isSearchingPickerPlaces, setIsSearchingPickerPlaces] = useState(false);

  // Search places when user types >= 3 characters in Map Picker Modal
  useEffect(() => {
    if (!pickerSearchQuery || pickerSearchQuery.trim().length < 3) {
      setPickerSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingPickerPlaces(true);
      const results = await routingService.searchPlaces(pickerSearchQuery);
      setPickerSearchResults(results);
      setIsSearchingPickerPlaces(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [pickerSearchQuery]);

  // OSRM route details & polyline coordinates
  const [distanceKm, setDistanceKm] = useState(4.5);
  const [durationMins, setDurationMins] = useState(11);
  const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  // Active Ride Polling/Sync Engine while searching or active
  useEffect(() => {
    let intervalId: any = null;

    const checkActiveRide = async () => {
      try {
        const activeRide = await passengerRideService.getActiveRide();
        if (activeRide && activeRide.id) {
          const isAcceptedState = ['DRIVER_ACCEPTED', 'ARRIVED', 'IN_PROGRESS'].includes(activeRide.status);
          if (isAcceptedState && activeRide.driverId) {
            setAssignedDriver({
              id: activeRide.driverId,
              name: activeRide.driverName || 'Sami Driver',
              phone: activeRide.driverPhone || '+212600000000',
              vehicleInfo: activeRide.driverVehicle || {
                make: 'Dacia',
                model: 'Logan',
                plate: 'Marrakech 44-A-12345',
              },
            });
          }
        }
      } catch (err) {
        console.log('[Passenger Active Ride Sync Error]', err);
      }
    };

    if (status === 'SEARCHING' || status === 'ACCEPTED') {
      checkActiveRide();
      intervalId = setInterval(checkActiveRide, 3000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [status, rideId]);

  // 1. Get Device GPS Position on Mount
  useEffect(() => {
    try {
      Geolocation.getCurrentPosition(
        (pos) => {
          if (pos && pos.coords) {
            const { latitude, longitude } = pos.coords;
            setPickupCoord({ lat: latitude, lng: longitude });
            setPickupText('Mon Emplacement Actuel (GPS)');
            if (mapRef.current) {
              mapRef.current.animateToRegion({
                latitude,
                longitude,
                latitudeDelta: 0.03,
                longitudeDelta: 0.03,
              });
            }
          }
        },
        (err) => {
          console.log('[Passenger GPS Warning]', err?.message);
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 10000 }
      );
    } catch (e) {
      console.log('[Passenger GPS Catch]', e);
    }
  }, []);

  // 2a. Autocomplete search when user types pickup address (3+ chars)
  useEffect(() => {
    if (!pickupText || pickupText.trim().length < 3 || pickupText.includes('Emplacement Actuel')) {
      setPickupSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingPickup(true);
      const results = await routingService.searchPlaces(pickupText);
      setPickupSearchResults(results);
      setIsSearchingPickup(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [pickupText]);

  // 2b. Autocomplete search when user types destination
  useEffect(() => {
    if (!destinationText || destinationText.length < 3 || selectedDestination?.name === destinationText) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingPlaces(true);
      const results = await routingService.searchPlaces(destinationText);
      setSearchResults(results);
      setIsSearchingPlaces(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [destinationText]);

  // 3. Recalculate OSRM route & polyline whenever destination changes
  useEffect(() => {
    if (!selectedDestination) return;
    let isMounted = true;
    setIsCalculatingRoute(true);
    routingService.calculateRoute(pickupCoord, selectedDestination).then((res) => {
      if (isMounted) {
        setDistanceKm(res.distanceKm);
        setDurationMins(res.durationMins);
        setRouteCoordinates(res.coordinates || []);
        setIsCalculatingRoute(false);

        if (mapRef.current && res.coordinates.length > 0) {
          mapRef.current.fitToCoordinates(
            [
              { latitude: pickupCoord.lat, longitude: pickupCoord.lng },
              { latitude: selectedDestination.lat, longitude: selectedDestination.lng },
            ],
            { edgePadding: { top: 70, right: 70, bottom: 70, left: 70 }, animated: true }
          );
        }
      }
    });
    return () => { isMounted = false; };
  }, [selectedDestination]);

  // Re-center Map on User GPS Position & Update Pickup Location Address
  const handleRecenterLocation = async () => {
    Geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const pt = { lat: latitude, lng: longitude };
        setPickupCoord(pt);
        const address = await routingService.reverseGeocode(latitude, longitude);
        setPickupText(address || 'Mon Emplacement Actuel (GPS)');
        if (mapRef.current) {
          mapRef.current.animateToRegion({
            latitude,
            longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          });
        }
      },
      async (_) => {
        const address = await routingService.reverseGeocode(pickupCoord.lat, pickupCoord.lng);
        setPickupText(address || 'Mon Emplacement Actuel');
        if (mapRef.current) {
          mapRef.current.animateToRegion({
            latitude: pickupCoord.lat,
            longitude: pickupCoord.lng,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          });
        }
      }
    );
  };

  // Distance Rounding Rule: If fraction > 500 meters (0.5 km), round UP to next full km
  const getBillableKm = (km: number) => {
    const whole = Math.floor(km);
    const fraction = km - whole;
    if (fraction > 0.5) {
      return whole + 1;
    }
    return Math.max(1, whole);
  };

  // Smart Dynamic Fare Engine based on Central Category Pricing Rules
  const getBaseFare = (type: 'ECO' | 'COMFORT' | 'MOTO' | 'CARGO') => {
    const pricing = calculatePricing(type, distanceKm);
    return pricing.displayedPrice;
  };

  // Smart Negotiation Minimum Price Floor (NEVER BELOW CATEGORY MINIMUM FARE)
  const getMinAllowedFare = (type: 'ECO' | 'COMFORT' | 'MOTO' | 'CARGO') => {
    const pricing = calculatePricing(type, distanceKm);
    return pricing.minNegotiationFloor;
  };

  const getEffectiveFare = (type: 'ECO' | 'COMFORT' | 'MOTO' | 'CARGO') => {
    if (type === selectedService && customFareMAD !== null) {
      return customFareMAD;
    }
    return getBaseFare(type);
  };

  const currentFare = getEffectiveFare(selectedService);
  const minAllowedFare = getMinAllowedFare(selectedService);

  const handleIncreaseFare = () => {
    const start = currentFare;
    const next = Math.min(start + 1, 999);
    setCustomFareMAD(Math.floor(next));
    setShowMinPriceWarning(false);
  };

  const handleDecreaseFare = () => {
    const start = currentFare;
    const next = start - 1;

    if (next < minAllowedFare) {
      setCustomFareMAD(minAllowedFare);
      setShowMinPriceWarning(true);
      // Silent minimum price floor: No popup alert shown, only red warning subtext below price counter!
    } else {
      setCustomFareMAD(Math.floor(next));
      setShowMinPriceWarning(false);
    }
  };

  const handleSelectDestination = (loc: GeocodedPlace) => {
    const validLat = Number(loc.lat) || 31.6258;
    const validLng = Number(loc.lng) || -7.9891;
    const validLoc = { name: loc.name, lat: validLat, lng: validLng };

    setDestinationText(loc.name);
    setSelectedDestination(validLoc);
    setSearchResults([]);
    setCustomFareMAD(null);
    setShowMinPriceWarning(false);
  };

  const handleRequestRide = async () => {
    if (!destinationText.trim()) {
      Alert.alert(
        lang === 'ar' ? 'تنبيه' : lang === 'es' ? 'Atención' : lang === 'en' ? 'Notice' : 'Attention',
        lang === 'ar' ? 'يرجى إدخال أو اختيار وجهتك أولاً.' : lang === 'es' ? 'Por favor ingrese su destino.' : lang === 'en' ? 'Please enter your destination.' : 'Veuillez choisir votre destination.'
      );
      return;
    }

    const dest = selectedDestination || {
      name: destinationText,
      lat: 31.6258,
      lng: -7.9891,
    };

    const pickupPoint = {
      lat: pickupCoord.lat,
      lng: pickupCoord.lng,
      address: pickupText,
    };

    const destPoint = {
      lat: dest.lat,
      lng: dest.lng,
      address: dest.name,
    };

    const fare = currentFare;

    setIsRequesting(true);
    try {
      const res = await passengerRideService.createRide({
        pickup: pickupPoint,
        destination: destPoint,
        serviceType: selectedService,
        estimatedFareMAD: fare,
      });

      const newRideId = res?.id || res?.rideId || 'ride-' + Date.now();

      setSearching({
        rideId: newRideId,
        pickup: pickupPoint,
        destination: destPoint,
        estimatedFareMAD: fare,
        serviceType: selectedService,
      });
    } catch (err: any) {
      console.error('[Passenger Ride Request Error]', err);
      setSearching({
        rideId: 'ride-' + Date.now(),
        pickup: pickupPoint,
        destination: destPoint,
        estimatedFareMAD: fare,
        serviceType: selectedService,
      });
    } finally {
      setIsRequesting(false);
    }
  };

  const handleCancelRequest = async () => {
    if (rideId) {
      try {
        await passengerRideService.cancelRide(rideId);
      } catch (_) {}
    }
    resetRide();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      {/* Unified Drawer Header with Menu Button (☰) only (Title & Mode Switcher hidden) */}
      <DrawerHeader showOnlyMenu={true} />

      {/* Real HTML5 OpenStreetMap Leaflet Canvas (Zero Google API Key requirement) */}
      <View style={styles.mapContainer}>
        <LeafletMapView
          height="100%"
          isDarkMode={isDarkMode}
          pickup={{ lat: pickupCoord.lat, lng: pickupCoord.lng, title: pickupText }}
          destination={selectedDestination ? { lat: selectedDestination.lat, lng: selectedDestination.lng, title: selectedDestination.name } : undefined}
          routeCoordinates={routeCoordinates}
          onLocationSelect={async (pt) => {
            setPickupCoord(pt);
            setPickerCoord(pt);
            const address = await routingService.reverseGeocode(pt.lat, pt.lng);
            setPickupText(address);
          }}
        />

        {/* Floating Route Stats Badge */}
        {selectedDestination && (
          <View style={styles.routeStatsBadge}>
            <Route size={14} color="#10B981" />
            <Text style={styles.routeStatsText}> {distanceKm} km</Text>
            <Text style={{ color: '#94A3B8' }}> • </Text>
            <Clock size={14} color="#F59E0B" />
            <Text style={styles.routeStatsText}> {durationMins} min</Text>
          </View>
        )}

        {/* Floating Re-center GPS Location Button (◎) */}
        <TouchableOpacity
          style={[styles.recenterFab, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={handleRecenterLocation}
          activeOpacity={0.8}
        >
          <Compass size={22} color="#10B981" />
        </TouchableOpacity>
      </View>

      {/* Active State: SEARCHING */}
      {status === 'SEARCHING' && (
        <View style={[styles.searchingOverlay, { backgroundColor: colors.surface }]}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.searchingTitle, { color: colors.textPrimary }]}>
            {lang === 'ar'
              ? 'جاري البحث عن سائقين بالقرب منك...'
              : lang === 'es'
              ? 'Buscando conductores cercanos...'
              : lang === 'en'
              ? 'Searching for nearby drivers...'
              : 'Recherche de chauffeurs à proximité...'}
          </Text>
          <Text style={[styles.searchingSub, { color: colors.textMuted }]}>
            {lang === 'ar'
              ? `طلبك (${distanceKm} كم • ~${durationMins} دقيقة) قيد البث الآن.`
              : lang === 'es'
              ? `Tu solicitud (${distanceKm} km • ~${durationMins} min) se está transmitiendo.`
              : lang === 'en'
              ? `Your request (${distanceKm} km • ~${durationMins} min) is being sent.`
              : `Votre demande (${distanceKm} km • ~${durationMins} min) est diffusée.`}
          </Text>
          <View style={styles.fareBadge}>
            <Text style={styles.fareBadgeText}>{getBaseFare(selectedService)} MAD</Text>
          </View>
          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancelRequest}>
            <Text style={styles.cancelBtnText}>
              {lang === 'ar' ? 'إلغاء الطلب' : lang === 'es' ? 'Cancelar solicitud' : lang === 'en' ? 'Cancel Request' : 'Annuler la demande'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Active State: ACCEPTED */}
      {status === 'ACCEPTED' && assignedDriver && (
        <View style={[styles.driverCardOverlay, { backgroundColor: colors.surface }]}>
          <View style={styles.driverHeaderRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{assignedDriver.name?.substring(0, 1) || 'D'}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.driverName, { color: colors.textPrimary }]}>{assignedDriver.name}</Text>
              <Text style={[styles.vehicleModel, { color: colors.textMuted }]}>
                {assignedDriver.vehicleInfo?.make || 'Dacia'} {assignedDriver.vehicleInfo?.model || 'Logan'} • {assignedDriver.vehicleInfo?.plate || 'Marrakech'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <TouchableOpacity
                style={[styles.phoneCircle, { backgroundColor: '#10B981' }]}
                onPress={() => {
                  if (assignedDriver?.phone) {
                    Alert.alert(
                      lang === 'ar' ? 'خيارات الاتصال' : 'Option d\'appel',
                      lang === 'ar'
                        ? 'اختر طريقة الاتصال بالسائق:'
                        : 'Choisissez le mode de communication :',
                      [
                        {
                          text: lang === 'ar' ? '🟣 اتصال عبر Yalla VTC' : '🟣 Appels Yalla VTC',
                          onPress: () => Alert.alert('Yalla VTC Call', lang === 'ar' ? 'جاري الاتصال السري بدون إظهار رقمك...' : 'Appel privé en cours...'),
                        },
                        {
                          text: lang === 'ar' ? '📱 اتصال هاتفي مباشر' : '📱 Appel cellulaire',
                          onPress: () => Alert.alert('Téléphone', assignedDriver.phone),
                        },
                        { text: lang === 'ar' ? 'إلغاء' : 'Annuler', style: 'cancel' },
                      ]
                    );
                  }
                }}
              >
                <Phone size={18} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.phoneCircle, { backgroundColor: '#84CC16' }]}
                onPress={() => {
                  Alert.alert(
                    lang === 'ar' ? 'غرفة التواصل' : 'Communication',
                    lang === 'ar' ? 'مرحباً بك في غرفة التواصل الخاطفة بين الراكب والسائق' : 'Espace de communication sécurisé.'
                  );
                }}
              >
                <MessageSquare size={18} color="#000000" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.statusBadgeRow}>
            <Text style={styles.statusBadgeText}>
              {lang === 'ar' ? '🟢 السائق في طريقه إليك' : lang === 'es' ? '🟢 El conductor está en camino' : lang === 'en' ? '🟢 Driver is on the way' : '🟢 Chauffeur en route vers vous'}
            </Text>
            <Text style={styles.etaText}>ETA: ~4 min</Text>
          </View>

          <TouchableOpacity style={styles.cancelBtn} onPress={handleCancelRequest}>
            <Text style={styles.cancelBtnText}>
              {lang === 'ar' ? 'إلغاء الرحلة' : lang === 'es' ? 'Cancelar viaje' : lang === 'en' ? 'Cancel Ride' : 'Annuler la course'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Idle State */}
      {status === 'IDLE' && (
        <ScrollView style={styles.bottomSheet} contentContainerStyle={{ paddingBottom: 30 }} keyboardShouldPersistTaps="handled">
          {/* Location Inputs */}
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.inputRow, isRTL && { flexDirection: 'row-reverse' }]}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleRecenterLocation}
                style={{ padding: 4 }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Navigation size={18} color="#10B981" />
              </TouchableOpacity>
              <TextInput
                style={[styles.input, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}
                value={pickupText}
                onChangeText={setPickupText}
                placeholder={lang === 'ar' ? 'نقطة الانطلاق' : 'Point de départ'}
                placeholderTextColor={colors.textMuted}
              />
              {isSearchingPickup && <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 6 }} />}
              {pickupText.length > 0 && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setPickupText('')}
                  style={{ padding: 4, marginRight: 4 }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X size={16} color={colors.textMuted} />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.pickOnMapBtnChip}
                onPress={() => {
                  setPickerCoord(pickupCoord);
                  setShowMapPickerModal(true);
                }}
              >
                <MapPin size={13} color="#FFFFFF" style={{ marginRight: 4 }} />
                <Text style={styles.pickOnMapBtnText}>
                  {lang === 'ar' ? 'من الخريطة' : 'Sur carte'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.divider} />
            <View style={[styles.inputRow, isRTL && { flexDirection: 'row-reverse' }]}>
              <MapPin size={18} color="#EF4444" />
              <TextInput
                style={[styles.input, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}
                value={destinationText}
                onChangeText={setDestinationText}
                placeholder={
                  lang === 'ar'
                    ? 'إلى أين تريد الذهاب؟ (مثلاً: جيليز، المطار)'
                    : lang === 'es'
                    ? '¿A dónde vas? (ej: Guéliz, Aeropuerto)'
                    : lang === 'en'
                    ? 'Where to? (e.g. Gueliz, Airport)'
                    : 'Où allez-vous ? (ex: Gueliz, Aéroport)'
                }
                placeholderTextColor={colors.textMuted}
              />
              {destinationText.length > 0 && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    setDestinationText('');
                    setSelectedDestination(null);
                    setSearchResults([]);
                  }}
                  style={{ padding: 4, marginHorizontal: 4 }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X size={16} color={colors.textMuted} />
                </TouchableOpacity>
              )}
              {isSearchingPlaces && <ActivityIndicator size="small" color={colors.primary} />}
            </View>
          </View>

          {/* Pickup Search Autocomplete List */}
          {pickupSearchResults.length > 0 && (
            <View style={[styles.searchResultsBox, { backgroundColor: colors.surface, borderColor: colors.border, marginBottom: 12 }]}>
              {pickupSearchResults.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.searchResultRow, { borderBottomColor: colors.border }]}
                  onPress={() => {
                    setPickupCoord({ lat: item.lat, lng: item.lng });
                    setPickupText(item.name);
                    setPickupSearchResults([]);
                    if (selectedDestination) {
                      routingService.calculateRoute({ lat: item.lat, lng: item.lng }, selectedDestination).then((res) => {
                        setDistanceKm(res.distanceKm);
                        setDurationMins(res.durationMins);
                        setRouteCoordinates(res.coordinates || []);
                      });
                    }
                  }}
                >
                  <Navigation size={16} color="#10B981" style={{ marginRight: 10 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.searchResultTitle, { color: colors.textPrimary }]}>{item.name}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Search Autocomplete List */}
          {searchResults.length > 0 && (
            <View style={[styles.searchResultsBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {searchResults.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.searchResultRow, { borderBottomColor: colors.border }]}
                  onPress={() => handleSelectDestination(item)}
                >
                  <MapPin size={16} color={colors.primary} style={{ marginRight: 8 }} />
                  <Text style={[styles.searchResultText, { color: colors.textPrimary }]}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Popular Location Chips */}
          {!destinationText && (
            <View style={styles.suggestionsContainer}>
              {POPULAR_LOCATIONS.map((loc, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.chip, { backgroundColor: colors.surfaceAlt }]}
                  onPress={() => handleSelectDestination(loc)}
                >
                  <Text style={[styles.chipText, { color: colors.textPrimary }]}>{loc.name.split(',')[0]}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Active Selected Service & Interactive Fare Bidding Card matching inDrive UI */}
          <View style={[styles.fareCardContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {/* Header row with vehicle info & edit options icon */}
            <View style={[styles.serviceHeaderRow, isRTL && { flexDirection: 'row-reverse' }]}>
              <View style={styles.serviceCarThumb}>
                <YallaCategoryGraphic id={selectedService} size={76} />
              </View>

              <View style={[{ flex: 1, marginHorizontal: 10 }, isRTL && { alignItems: 'flex-end' }]}>
                <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 6 }, isRTL && { flexDirection: 'row-reverse' }]}>
                  <Text style={[styles.selectedServiceNameText, { color: colors.textPrimary }]}>
                    {selectedService === 'ECO'
                      ? 'Yalla Eco'
                      : selectedService === 'COURSE_PLUS'
                      ? 'Yalla Course+'
                      : selectedService === 'CONFORT' || selectedService === 'COMFORT'
                      ? 'Yalla Confort'
                      : selectedService === 'TAXI'
                      ? 'Yalla Taxi'
                      : 'Yalla Moto'}
                  </Text>
                  <Text style={{ fontSize: 12, color: colors.textMuted }}>ℹ️</Text>
                </View>

                <Text style={[styles.serviceSubStatsText, { color: colors.textMuted }]}>
                  👤 {selectedService === 'MOTO' ? '1' : '4'} • {durationMins} min • {lang === 'ar' ? 'أسعار مناسبة' : 'Prix abordables'}
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.optionsModalTriggerBtn}
                onPress={() => setShowOptionsModal(true)}
              >
                <SlidersHorizontal size={18} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Interactive (-) Price MAD (+) Counter */}
            <View style={styles.fareCounterBox}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.fareStepBtn, { backgroundColor: isDarkMode ? '#27272A' : '#E4E4E7' }]}
                onPress={handleDecreaseFare}
              >
                <Minus size={24} color={colors.textPrimary} />
              </TouchableOpacity>

              <View style={styles.farePriceCenterWrap}>
                <Text
                  style={[
                    styles.currentFareText,
                    { color: showMinPriceWarning || currentFare <= minAllowedFare ? '#F87171' : colors.textPrimary },
                  ]}
                >
                  {currentFare} MAD
                </Text>

                {showMinPriceWarning || currentFare <= minAllowedFare ? (
                  <Text style={styles.minPriceWarningText}>
                    {lang === 'ar' ? `الحد الأدنى : ${minAllowedFare} درهم` : `Prix minimal : ${minAllowedFare} MAD`}
                  </Text>
                ) : (
                  <Text style={[styles.baseFareHintText, { color: colors.textMuted }]}>
                    {lang === 'ar' ? `السعر التقديري : ${getBaseFare(selectedService)} درهم` : `Prix estimé : ${getBaseFare(selectedService)} MAD`}
                  </Text>
                )}
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.fareStepBtn, { backgroundColor: isDarkMode ? '#27272A' : '#E4E4E7' }]}
                onPress={handleIncreaseFare}
              >
                <Plus size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Auto-Accept Offer Toggle Row matching screenshot 2 */}
            <View style={[styles.autoAcceptToggleRow, isRTL && { flexDirection: 'row-reverse' }]}>
              <Text style={[styles.autoAcceptToggleText, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>
                {lang === 'ar'
                  ? `قبول تلقائي لعرض ${currentFare} درهم`
                  : `Accepter automatiquement l'offre de ${currentFare} MAD`}
              </Text>

              <Switch
                value={autoAcceptOffer}
                onValueChange={setAutoAcceptOffer}
                trackColor={{ false: '#3F3F46', true: '#10B981' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          {/* Service Tier Carousel */}
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              {lang === 'ar' ? 'اختر فئة المركبة' : 'Autres options de véhicules'}
            </Text>
            {isCalculatingRoute && <ActivityIndicator size="small" color={colors.primary} />}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.servicesRow}>
            {([
              { id: 'ECO', name: 'Yalla Eco', icon: Car, desc: '5 MAD/km • اقتصادي', cap: '4' },
              { id: 'COURSE_PLUS', name: 'Yalla Course+', icon: Truck, desc: '6 MAD/km • سيارات حديثة', cap: '4' },
              { id: 'CONFORT', name: 'Yalla Confort', icon: ShieldCheck, desc: '6.5 MAD/km • راحة تامة', cap: '4' },
              { id: 'TAXI', name: 'Yalla Taxi', icon: Car, desc: '5.5 MAD/km • تكسي سريع', cap: '4' },
              { id: 'MOTO', name: 'Yalla Moto', icon: Bike, desc: '3.5 MAD/km • دراجة نارية', cap: '1' },
            ] as const).map((item) => {
              const Icon = item.icon;
              const isSelected = selectedService === item.id;
              const fare = getEffectiveFare(item.id);
              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.8}
                  style={[
                    styles.serviceCard,
                    {
                      backgroundColor: isSelected ? (isDarkMode ? '#27272A' : '#E4E4E7') : colors.surface,
                      borderColor: isSelected ? colors.primary : colors.border,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                  onPress={() => {
                    setSelectedService(item.id);
                    setCustomFareMAD(null);
                    setShowMinPriceWarning(false);
                  }}
                >
                  <YallaCategoryGraphic id={item.id} size={64} />
                  <Text style={[styles.serviceName, { color: colors.textPrimary }]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.serviceFare, { color: colors.textPrimary }]}>~{fare} MAD</Text>
                  <Text style={[styles.serviceDesc, { color: colors.textMuted }]}>👤 {item.cap} • {durationMins} min</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Primary High-Contrast Request Action Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.requestBtn, { backgroundColor: '#84CC16' }]}
            onPress={handleRequestRide}
            disabled={isRequesting}
          >
            {isRequesting ? (
              <ActivityIndicator color="#000000" />
            ) : (
              <Text style={[styles.requestBtnText, { color: '#000000' }]}>
                {lang === 'ar'
                  ? `البحث عن الطلب (${currentFare} درهم)`
                  : lang === 'es'
                  ? `Buscar viaje (${currentFare} MAD)`
                  : lang === 'en'
                  ? `Find a Ride (${currentFare} MAD)`
                  : `Rechercher une course (${currentFare} MAD)`}
              </Text>
            )}
          </TouchableOpacity>

          {/* ── Options Bottom Sheet Modal matching Screenshot 1 ── */}
          <Modal
            visible={showOptionsModal}
            transparent
            animationType="slide"
            onRequestClose={() => setShowOptionsModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={[styles.optionsSheetContainer, { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF' }]}>
                {/* Header */}
                <View style={[styles.optionsSheetHeader, isRTL && { flexDirection: 'row-reverse' }]}>
                  <Text style={[styles.optionsSheetTitle, { color: colors.textPrimary }]}>
                    {lang === 'ar' ? 'خيارات إضافية' : 'Options'}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowOptionsModal(false)}
                    style={[styles.closeOptionsBtn, { backgroundColor: isDarkMode ? '#27272A' : '#E4E4E7' }]}
                  >
                    <X size={18} color={colors.textPrimary} />
                  </TouchableOpacity>
                </View>

                {/* Switch: Plus de 4 passagers */}
                <View style={[styles.optionRow, isRTL && { flexDirection: 'row-reverse' }]}>
                  <Text style={[styles.optionLabelText, { color: colors.textPrimary }]}>
                    {lang === 'ar' ? 'أكثر من 4 ركاب' : 'Plus de 4 passagers'}
                  </Text>
                  <Switch
                    value={isMoreThan4Passengers}
                    onValueChange={setIsMoreThan4Passengers}
                    trackColor={{ false: '#3F3F46', true: '#10B981' }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                {/* Input: Commentaires */}
                <TextInput
                  style={[
                    styles.commentsInput,
                    {
                      backgroundColor: isDarkMode ? '#27272A' : '#F4F4F5',
                      color: colors.textPrimary,
                      textAlign: isRTL ? 'right' : 'left',
                    },
                  ]}
                  placeholder={lang === 'ar' ? 'ملاحظات أو تعليق للسائق...' : 'Commentaires'}
                  placeholderTextColor={colors.textMuted}
                  value={passengerComment}
                  onChangeText={setPassengerComment}
                  multiline
                />

                {/* Fermer / Confirm Button */}
                <TouchableOpacity
                  style={[styles.closeModalActionBtn, { backgroundColor: '#84CC16' }]}
                  onPress={() => setShowOptionsModal(false)}
                >
                  <Text style={styles.closeModalActionText}>
                    {lang === 'ar' ? 'تأكيد وإغلاق' : 'Fermer'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* ── Map Pickup Location Picker Modal ── */}
          <Modal
            visible={showMapPickerModal}
            animationType="slide"
            onRequestClose={() => setShowMapPickerModal(false)}
          >
            <View style={{ flex: 1, backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC' }}>
              <View style={[styles.mapPickerHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                <TouchableOpacity
                  onPress={() => setShowMapPickerModal(false)}
                  style={[styles.closeOptionsBtn, { backgroundColor: isDarkMode ? '#27272A' : '#E4E4E7' }]}
                >
                  <X size={18} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.mapPickerTitle, { color: colors.textPrimary }]}>
                  {lang === 'ar' ? 'اختر نقطة الانطلاق من الخريطة' : 'Choisir le départ sur la carte'}
                </Text>
                <View style={{ width: 36 }} />
              </View>

              {/* Interactive Search Bar inside Map Location Picker Modal */}
              <View style={[styles.pickerSearchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Search size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
                <TextInput
                  style={[styles.pickerSearchInput, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}
                  placeholder={lang === 'ar' ? 'ابحث عن عنوان أو مكان هنا (مثال: جليز)...' : 'Rechercher un lieu ou adresse...'}
                  placeholderTextColor={colors.textMuted}
                  value={pickerSearchQuery}
                  onChangeText={setPickerSearchQuery}
                />
                {isSearchingPickerPlaces && <ActivityIndicator size="small" color={colors.primary} style={{ marginHorizontal: 4 }} />}
                {pickerSearchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => { setPickerSearchQuery(''); setPickerSearchResults([]); }}>
                    <X size={16} color={colors.textMuted} style={{ marginLeft: 6 }} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Autocomplete Suggestions Overlay when user types >= 3 chars */}
              {pickerSearchResults.length > 0 && (
                <View style={[styles.pickerSearchResultsBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled" style={{ maxHeight: 220 }}>
                    {pickerSearchResults.map((place, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={[styles.pickerSearchResultRow, { borderBottomColor: colors.border }, isRTL && { flexDirection: 'row-reverse' }]}
                        onPress={() => {
                          const validLat = Number(place.lat) || 31.6258;
                          const validLng = Number(place.lng) || -7.9891;
                          const pt = { lat: validLat, lng: validLng };

                          setPickerCoord(pt);
                          setPickupCoord(pt);
                          setPickupText(place.name);
                          setPickerSearchQuery('');
                          setPickerSearchResults([]);
                          setCustomFareMAD(null);
                          setShowMinPriceWarning(false);
                          setShowMapPickerModal(false);
                        }}
                      >
                        <MapPin size={16} color="#10B981" style={{ marginHorizontal: 8 }} />
                        <Text style={[styles.pickerSearchResultText, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>
                          {place.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              <View style={{ flex: 1, position: 'relative' }}>
                <LeafletMapView
                  height={500}
                  isDarkMode={isDarkMode}
                  pickup={{ lat: pickerCoord.lat, lng: pickerCoord.lng, title: lang === 'ar' ? 'نقطة الانطلاق 👤' : 'Départ 👤' }}
                  onLocationSelect={async (pt) => {
                    setPickerCoord(pt);
                    setIsGeocodingPicker(true);
                    const address = await routingService.reverseGeocode(pt.lat, pt.lng);
                    setPickupText(address);
                    setPickupCoord(pt);
                    setIsGeocodingPicker(false);
                  }}
                />

                {/* Floating GPS Recenter Button inside Map Picker Modal */}
                <TouchableOpacity
                  style={[styles.pickerGpsFab, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  activeOpacity={0.8}
                  onPress={() => {
                    Geolocation.getCurrentPosition(
                      async (pos) => {
                        const { latitude, longitude } = pos.coords;
                        const newPt = { lat: latitude, lng: longitude };
                        setPickerCoord(newPt);
                        setPickupCoord(newPt);
                        setIsGeocodingPicker(true);
                        const addr = await routingService.reverseGeocode(latitude, longitude);
                        setPickupText(addr);
                        setIsGeocodingPicker(false);
                      },
                      (err) => console.log('[Picker GPS Error]', err),
                      { enableHighAccuracy: true, timeout: 5000 }
                    );
                  }}
                >
                  <Compass size={22} color="#10B981" />
                </TouchableOpacity>
              </View>

              <View style={[styles.mapPickerFooter, { backgroundColor: colors.surface }]}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={[styles.confirmPickerBtn, { backgroundColor: '#10B981' }]}
                  disabled={isGeocodingPicker}
                  onPress={async () => {
                    setIsGeocodingPicker(true);
                    const address = await routingService.reverseGeocode(pickerCoord.lat, pickerCoord.lng);
                    setPickupCoord(pickerCoord);
                    setPickupText(address);
                    setIsGeocodingPicker(false);
                    setShowMapPickerModal(false);
                  }}
                >
                  {isGeocodingPicker ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <MapPin size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                      <Text style={styles.confirmPickerText}>
                        {lang === 'ar' ? 'تأكيد هذه النقطة كبداية للرحلة 🟢' : 'Confirmer ce point de départ 🟢'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 90,
    paddingTop: 44,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  logoText: { fontSize: 20, fontWeight: '800' },
  mapContainer: {
    height: 200,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  mapOverlayCenter: { alignItems: 'center' },
  mapPinShadow: {
    width: 14,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.4)',
    marginTop: 2,
  },
  menuBtn: {
    padding: 6,
    marginRight: 10,
  },
  recenterFab: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  routeStatsBadge: {
    position: 'absolute',
    top: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  routeStatsText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  mapSubtitle: {
    position: 'absolute',
    bottom: 10,
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  bottomSheet: { flex: 1, padding: 16 },
  card: { borderRadius: 14, borderWidth: 1, padding: 12, marginBottom: 8 },
  inputRow: { flexDirection: 'row', alignItems: 'center', height: 40 },
  input: { flex: 1, marginLeft: 10, fontSize: 14, fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#334155', marginVertical: 6 },
  searchResultsBox: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  searchResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
  },
  searchResultText: { fontSize: 13, fontWeight: '600' },
  suggestionsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 14 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: { fontSize: 12, fontWeight: '500' },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700' },
  servicesRow: { flexDirection: 'row', marginBottom: 18 },
  serviceCard: {
    width: 135,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    marginRight: 12,
    alignItems: 'center',
  },
  serviceName: { fontSize: 13, fontWeight: '700', marginTop: 8 },
  serviceFare: { fontSize: 16, fontWeight: '800', marginVertical: 4 },
  serviceDesc: { fontSize: 10, textAlign: 'center' },
  requestBtn: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  requestBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  searchingOverlay: {
    padding: 24,
    borderRadius: 20,
    margin: 16,
    alignItems: 'center',
  },
  searchingTitle: { fontSize: 16, fontWeight: '700', marginTop: 12 },
  searchingSub: { fontSize: 12, textAlign: 'center', marginTop: 6 },
  fareBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    marginVertical: 14,
  },
  fareBadgeText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#EF4444' + '20',
  },
  cancelBtnText: { color: '#EF4444', fontWeight: '700', fontSize: 13 },
  driverCardOverlay: {
    padding: 18,
    borderRadius: 20,
    margin: 16,
  },
  driverHeaderRow: { flexDirection: 'row', alignItems: 'center' },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#FFFFFF', fontWeight: '800', fontSize: 18 },
  driverName: { fontSize: 16, fontWeight: '800' },
  vehicleModel: { fontSize: 12, marginTop: 2 },
  phoneCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 14,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#1E293B',
  },
  statusBadgeText: { color: '#10B981', fontWeight: '700', fontSize: 12 },
  etaText: { color: '#F59E0B', fontWeight: '700', fontSize: 12 },

  // Fare Card & Options Modal Styles matching inDrive UI
  fareCardContainer: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  serviceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceCarThumb: {
    width: 48,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedServiceNameText: {
    fontSize: 18,
    fontWeight: '800',
  },
  serviceSubStatsText: {
    fontSize: 12.5,
    fontWeight: '600',
    marginTop: 2,
  },
  optionsModalTriggerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fareCounterBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  fareStepBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  farePriceCenterWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentFareText: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  minPriceWarningText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F87171',
    marginTop: 3,
  },
  baseFareHintText: {
    fontSize: 11.5,
    fontWeight: '600',
    marginTop: 3,
  },
  autoAcceptToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 8,
  },
  autoAcceptToggleText: {
    fontSize: 13.5,
    fontWeight: '700',
    flex: 1,
    marginRight: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  optionsSheetContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
  },
  optionsSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  optionsSheetTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  closeOptionsBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 10,
  },
  optionLabelText: {
    fontSize: 16,
    fontWeight: '700',
  },
  commentsInput: {
    borderRadius: 14,
    padding: 14,
    fontSize: 14,
    minHeight: 80,
    marginBottom: 20,
  },
  closeModalActionBtn: {
    borderRadius: 16,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeModalActionText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#000000',
  },

  // Pick Location from Map Styles
  pickOnMapBtnChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 6,
  },
  pickOnMapBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },
  mapPickerHeader: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  mapPickerTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  mapPickerFooter: {
    padding: 16,
  },
  confirmPickerBtn: {
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmPickerText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  pickerGpsFab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  pickerSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 14,
    marginVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    elevation: 3,
  },
  pickerSearchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 4,
  },
  pickerSearchResultsBox: {
    position: 'absolute',
    top: 125,
    left: 14,
    right: 14,
    zIndex: 9999,
    borderRadius: 14,
    borderWidth: 1,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  pickerSearchResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
  },
  pickerSearchResultText: {
    fontSize: 13.5,
    fontWeight: '600',
    flex: 1,
  },
});
