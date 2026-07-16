import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Dimensions,
  Animated,
  PanResponder,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import {
  Camera as CameraIcon,
  ChevronLeft,
  ChevronRight,
  Info,
  Lock,
  Check,
  X,
  RefreshCw,
  Search,
  Sliders,
} from 'lucide-react-native';
import Svg, { Path, Circle, Rect, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '../../theme/ThemeContext';
import { api } from '../../api/axios.instance';

// Photo utility imports
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import { launchImageLibrary } from 'react-native-image-picker';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// Data Constants
const BRANDS_DATA = [
  { name: 'Mercedes-Benz', logo: 'mercedes' },
  { name: 'Renault', logo: 'renault' },
  { name: 'Peugeot', logo: 'peugeot' },
  { name: 'Dacia', logo: 'dacia' },
  { name: 'Toyota', logo: 'toyota' },
  { name: 'Volkswagen', logo: 'volkswagen' },
  { name: 'Hyundai', logo: 'hyundai' },
  { name: 'BMW', logo: 'bmw' },
  { name: 'Audi', logo: 'audi' },
  { name: 'Ford', logo: 'ford' },
];

const MODELS_MAP: Record<string, string[]> = {
  'Mercedes-Benz': ['Classe C', 'Classe E', 'Classe V', 'CLA', 'GLC'],
  'Renault': ['Clio', 'Megane', 'Express', 'Talisman', 'Kadjar'],
  'Peugeot': ['208', '3008', '5008', '308', 'Partner'],
  'Dacia': ['Logan', 'Sandero', 'Duster', 'Lodgy', 'Jogger'],
  'Toyota': ['Corolla', 'Camry', 'Prius', 'Yaris', 'RAV4'],
  'Volkswagen': ['Golf', 'Caddy', 'Passat', 'Tiguan', 'Touran'],
  'Hyundai': ['i30', 'Tucson', 'Accent', 'Elantra', 'Santa Fe'],
  'BMW': ['Série 3', 'Série 5', 'X3', 'i4'],
  'Audi': ['A4', 'A6', 'Q3', 'Q5'],
  'Ford': ['Focus', 'Fiesta', 'Kuga', 'Transit'],
};

const YEARS_ARRAY = Array.from({ length: 16 }, (_, i) => String(new Date().getFullYear() - i));
const SEATS_ARRAY = ['2', '4', '5', '7', '8', '9'];

const COLOR_TEMPLATES = [
  { name: 'Deep Black', hex: '#0F172A', glow: 'rgba(15,23,42,0.4)' },
  { name: 'Titanium Grey', hex: '#64748B', glow: 'rgba(100,116,139,0.4)' },
  { name: 'Polar White', hex: '#F8FAFC', glow: 'rgba(248,250,252,0.5)' },
  { name: 'Metallic Silver', hex: '#CBD5E1', glow: 'rgba(203,213,225,0.4)' },
  { name: 'Ruby Red', hex: '#EF4444', glow: 'rgba(239,68,68,0.4)' },
  { name: 'Royal Blue', hex: '#3B82F6', glow: 'rgba(59,130,246,0.4)' },
];

const FUEL_TYPES = ['Diesel', 'Petrol', 'Hybrid', 'Electric'];
const TRANSMISSIONS = ['Manual', 'Automatic'];

// Brand Logo Svg Renderer Component
const BrandLogo = ({ type, color }: { type: string; color: string }) => {
  switch (type) {
    case 'mercedes':
      return (
        <Svg width="26" height="26" viewBox="0 0 100 100">
          <Circle cx="50" cy="50" r="45" stroke={color} strokeWidth="5" fill="none" />
          <Path d="M50 5 L50 50 M50 50 L15 75 M50 50 L85 75" stroke={color} strokeWidth="5" strokeLinecap="round" />
        </Svg>
      );
    case 'renault':
      return (
        <Svg width="26" height="26" viewBox="0 0 100 100">
          <Path d="M50 5 L85 35 L85 65 L50 95 L15 65 L15 35 Z" stroke={color} strokeWidth="6" fill="none" strokeLinejoin="miter" />
          <Path d="M50 25 L70 45 L70 55 L50 75 L30 55 L30 45 Z" stroke={color} strokeWidth="4" fill="none" />
        </Svg>
      );
    case 'peugeot':
      return (
        <Svg width="26" height="26" viewBox="0 0 100 100">
          <Path d="M50 5 L80 15 L80 65 L50 95 L20 65 L20 15 Z" stroke={color} strokeWidth="6" fill="none" />
          <Path d="M35 60 C40 45 45 40 50 40 C55 40 60 45 65 60 C65 45 60 30 50 30 C40 30 35 45 35 60" fill={color} />
        </Svg>
      );
    case 'dacia':
      return (
        <Svg width="26" height="26" viewBox="0 0 100 100">
          <Path d="M20 30 L45 30 C55 30 65 40 65 50 C65 60 55 70 45 70 L20 70 Z" stroke={color} strokeWidth="7" fill="none" />
          <Path d="M40 30 L55 30 M40 70 L55 70" stroke={color} strokeWidth="7" />
          <Path d="M60 30 H80 V70 H60" stroke={color} strokeWidth="7" fill="none" />
        </Svg>
      );
    case 'toyota':
      return (
        <Svg width="26" height="26" viewBox="0 0 100 100">
          <Circle cx="50" cy="50" r="45" stroke={color} strokeWidth="4" fill="none" />
          <Circle cx="50" cy="35" r="28" stroke={color} strokeWidth="4" fill="none" transform="scale(1, 0.45) translate(0, 60)" />
          <Circle cx="50" cy="50" r="20" stroke={color} strokeWidth="4" fill="none" transform="scale(0.35, 1) translate(92, 0)" />
        </Svg>
      );
    case 'volkswagen':
      return (
        <Svg width="26" height="26" viewBox="0 0 100 100">
          <Circle cx="50" cy="50" r="45" stroke={color} strokeWidth="5" fill="none" />
          <Path d="M25 25 L45 68 H55 L75 25 M32 25 L50 63 L68 25 M40 25 L50 48 L60 25" stroke={color} strokeWidth="4" fill="none" />
        </Svg>
      );
    case 'hyundai':
      return (
        <Svg width="26" height="26" viewBox="0 0 100 100">
          <Circle cx="50" cy="50" r="45" stroke={color} strokeWidth="4" fill="none" transform="scale(1.2, 0.8) translate(-8, 12)" />
          <Path d="M30 25 L35 75 M70 25 L65 75 M33 50 L67 50" stroke={color} strokeWidth="7" strokeLinecap="round" />
        </Svg>
      );
    case 'bmw':
      return (
        <Svg width="26" height="26" viewBox="0 0 100 100">
          <Circle cx="50" cy="50" r="45" stroke={color} strokeWidth="5" fill="none" />
          <Circle cx="50" cy="50" r="30" stroke={color} strokeWidth="3" fill="none" />
          <Path d="M50 20 V80 M20 50 H80" stroke={color} strokeWidth="3" />
        </Svg>
      );
    case 'audi':
      return (
        <Svg width="26" height="26" viewBox="0 0 100 100 col">
          <Circle cx="26" cy="50" r="18" stroke={color} strokeWidth="4" fill="none" />
          <Circle cx="42" cy="50" r="18" stroke={color} strokeWidth="4" fill="none" />
          <Circle cx="58" cy="50" r="18" stroke={color} strokeWidth="4" fill="none" />
          <Circle cx="74" cy="50" r="18" stroke={color} strokeWidth="4" fill="none" />
        </Svg>
      );
    default:
      return <Sliders size={20} color={color} />;
  }
};

// 3D Car Vector Component
const SVG3DCar = ({ colorsPrimary }: { colorsPrimary: string }) => (
  <Svg width="180" height="120" viewBox="0 0 200 120" style={{ transform: [{ scale: 1.1 }] }}>
    <Defs>
      <SvgLinearGradient id="carGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor={colorsPrimary} stopOpacity="1" />
        <Stop offset="100%" stopColor="#1E293B" stopOpacity="0.8" />
      </SvgLinearGradient>
      <SvgLinearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
        <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.05" />
      </SvgLinearGradient>
    </Defs>
    {/* Floor reflection shadow */}
    <Ellipse cx="100" cy="100" rx="75" ry="12" fill="rgba(0,0,0,0.35)" />
    
    {/* Car Isometric body projection */}
    <Path d="M30 85 L20 70 L42 45 L95 40 L160 48 L185 70 L175 88 Z" fill="url(#carGrad)" />
    
    {/* Windshield & Cabin Glassmorphism */}
    <Path d="M50 48 L90 44 L110 58 L52 64 Z" fill="url(#glassGrad)" />
    <Path d="M96 44 L142 49 L148 60 L114 58 Z" fill="url(#glassGrad)" />
    
    {/* Wheels with chrome inserts */}
    <Circle cx="55" cy="85" r="15" fill="#0F172A" />
    <Circle cx="55" cy="85" r="7" fill="#E2E8F0" />
    <Circle cx="145" cy="86" r="15" fill="#0F172A" />
    <Circle cx="145" cy="86" r="7" fill="#E2E8F0" />
    
    {/* Glowing laser neo-headlights */}
    <Path d="M20 72 L32 75 L30 80 L18 76 Z" fill="#3B82F6" opacity="0.95" />
    <Circle cx="20" cy="74" r="6" fill="#60A5FA" opacity="0.8" />
    
    {/* Back red taillights */}
    <Path d="M185 71 L178 74 L177 78 L184 75 Z" fill="#EF4444" opacity="0.95" />
  </Svg>
);

// 3D Motorcycle Vector Component
const SVG3DMotorcycle = ({ colorsPrimary }: { colorsPrimary: string }) => (
  <Svg width="180" height="120" viewBox="0 0 200 120" style={{ transform: [{ scale: 1.15 }] }}>
    <Defs>
      <SvgLinearGradient id="motoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor={colorsPrimary} stopOpacity="1" />
        <Stop offset="100%" stopColor="#334155" stopOpacity="0.9" />
      </SvgLinearGradient>
    </Defs>
    {/* Floor reflection shadow */}
    <Ellipse cx="100" cy="100" rx="65" ry="10" fill="rgba(0,0,0,0.35)" />
    
    {/* Motorcycle Body silhouette */}
    <Path d="M45 82 L70 50 L115 48 L140 70 L120 85 L95 62 L65 82 Z" fill="url(#motoGrad)" />
    
    {/* Isometric details/Engine blocks */}
    <Rect x="85" y="65" width="28" height="20" rx="3" fill="#64748B" />
    
    {/* Front Fork & Steering */}
    <Path d="M60 85 L42 35 M42 35 L50 30" stroke="#F1F5F9" strokeWidth="4" strokeLinecap="round" />
    
    {/* Wheels with details */}
    <Circle cx="50" cy="85" r="18" fill="#0F172A" />
    <Circle cx="50" cy="85" r="8" fill="#94A3B8" />
    <Circle cx="145" cy="85" r="18" fill="#0F172A" />
    <Circle cx="145" cy="85" r="8" fill="#94A3B8" />
    
    {/* Front light glow */}
    <Circle cx="39" cy="38" r="7" fill="#60A5FA" opacity="0.9" />
  </Svg>
);

import { Ellipse } from 'react-native-svg';

export const VehicleInfoScreen = () => {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation('profile');
  const { colors } = useTheme();
  const isRTL = i18n.language === 'ar';

  // --- View State ---
  const [viewState, setViewState] = useState<'select' | 'form'>('select');
  const [selectedTypeChoice, setSelectedTypeChoice] = useState<'CAR' | 'MOTORCYCLE'>('CAR');

  // --- API State & Initial data ---
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [approvedPhotos, setApprovedPhotos] = useState<{
    vehicle: string | null;
    registration: string | null;
  }>({ vehicle: null, registration: null });

  // --- Form Input States ---
  const [vehicleType, setVehicleType] = useState<'CAR' | 'MOTORCYCLE' | null>(null);
  const [manufacturer, setManufacturer] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [color, setColor] = useState('');
  const [fuelType, setFuelType] = useState('Diesel');
  const [transmission, setTransmission] = useState('Manual');
  const [seats, setSeats] = useState('4');
  const [plateNumber, setPlateNumber] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [vin, setVin] = useState('');

  const [photos, setPhotos] = useState<{
    vehicle: string | null;
    registration: string | null;
  }>({
    vehicle: null,
    registration: null,
  });

  // --- Custom Picker Modals ---
  const [showBrandSelector, setShowBrandSelector] = useState(false);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [showFuelModal, setShowFuelModal] = useState(false);
  const [showTransModal, setShowTransModal] = useState(false);
  const [showPhotoOptionsSheet, setShowPhotoOptionsSheet] = useState(false);
  const [selectedPhotoSlot, setSelectedPhotoSlot] = useState<'vehicle' | 'registration' | null>(null);

  // --- Dynamic Vehicle Data from Database ---
  const [dbBrands, setDbBrands] = useState<{ id: string; name: string; logo: string | null }[]>([]);
  const [dbModels, setDbModels] = useState<{ id: string; name: string }[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);

  // Suggestion states
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [suggestedBrand, setSuggestedBrand] = useState('');
  const [suggestedModel, setSuggestedModel] = useState('');
  const [submittingSuggestion, setSubmittingSuggestion] = useState(false);

  // --- Search text in brand list ---
  const [brandSearchQuery, setBrandSearchQuery] = useState('');

  // --- Guided Camera view ---
  const [showCameraView, setShowCameraView] = useState(false);
  const [cameraType, setCameraType] = useState<'front' | 'back'>('back');
  const [tempCaptureUri, setTempCaptureUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const cameraRef = useRef<Camera>(null);
  const device = useCameraDevice(cameraType);

  // --- Animated 3D Floating Value ---
  const floatAnim = useRef(new Animated.Value(0)).current;

  // --- Pan Responder for 3D Card tilt effect ---
  const panX = useRef(new Animated.Value(0)).current;
  const panY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        // Map drag gesture coordinates to degrees values (-15 to 15 degrees)
        const tiltX = (gestureState.dy / (SCREEN_H / 2)) * -18;
        const tiltY = (gestureState.dx / (SCREEN_W / 2)) * 18;
        panX.setValue(tiltX);
        panY.setValue(tiltY);
      },
      onPanResponderRelease: () => {
        // Snap back card rotation smoothly on release
        Animated.parallel([
          Animated.spring(panX, { toValue: 0, friction: 5, tension: 40, useNativeDriver: true }),
          Animated.spring(panY, { toValue: 0, friction: 5, tension: 40, useNativeDriver: true }),
        ]).start();
      },
    })
  ).current;

  useEffect(() => {
    // 3D Card floating animation loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 2200,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 8,
          duration: 2200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const fetchManufacturers = async () => {
    setLoadingBrands(true);
    try {
      const res = await api.get('/driver/profile/vehicle/manufacturers');
      setDbBrands(res.data);
    } catch (err) {
      console.warn('Failed to load brands from database:', err);
    } finally {
      setLoadingBrands(false);
    }
  };

  const fetchModelsForBrand = async (brandName: string) => {
    if (!brandName) return;
    setLoadingModels(true);
    try {
      const res = await api.get(`/driver/profile/vehicle/models?manufacturer=${encodeURIComponent(brandName)}`);
      setDbModels(res.data);
    } catch (err) {
      console.warn('Failed to load models for brand:', err);
    } finally {
      setLoadingModels(false);
    }
  };

  useEffect(() => {
    fetchManufacturers();
  }, []);

  useEffect(() => {
    if (brand) {
      fetchModelsForBrand(brand);
    }
  }, [brand]);

  // Fetch approved profile settings
  const fetchVehicleProfile = async () => {
    setLoading(true);
    try {
      const response = await api.get('/driver/profile/vehicle');
      const data = response.data;

      const vehicle = data.vehicleInfo || {};
      const activeType = vehicle.type || null;

      const appPhotos = {
        vehicle: vehicle.photos?.vehicle || null,
        registration: vehicle.photos?.registration || null,
      };

      setApprovedPhotos(appPhotos);
      setVehicleType(activeType);
      setManufacturer(vehicle.manufacturer || '');
      setBrand(vehicle.brand || '');
      setModel(vehicle.model || '');
      setYear(vehicle.year ? String(vehicle.year) : '');
      setColor(vehicle.color || '');
      setFuelType(vehicle.fuelType || 'Diesel');
      setTransmission(vehicle.transmission || 'Manual');
      setSeats(vehicle.seats ? String(vehicle.seats) : '4');
      setPlateNumber(vehicle.plateNumber || '');
      setRegistrationNumber(vehicle.registrationNumber || '');
      setVin(vehicle.vin || '');

      setPhotos(appPhotos);

      if (data.pendingVehicleUpdate) {
        setHasPendingRequest(true);
        setRejectionReason(null);

        const proposed = data.pendingVehicleUpdate.fields || {};
        const proposedPhotos = data.pendingVehicleUpdate.photos || {};
        const proposedType = proposed.type || activeType || 'CAR';

        setVehicleType(proposedType);
        setSelectedTypeChoice(proposedType);
        if (proposed.manufacturer) setManufacturer(proposed.manufacturer);
        if (proposed.brand) setBrand(proposed.brand);
        if (proposed.model) setModel(proposed.model);
        if (proposed.year) setYear(String(proposed.year));
        if (proposed.color) setColor(proposed.color);
        if (proposed.fuelType) setFuelType(proposed.fuelType);
        if (proposed.transmission) setTransmission(proposed.transmission);
        if (proposed.seats) setSeats(String(proposed.seats));
        if (proposed.plateNumber) setPlateNumber(proposed.plateNumber);
        if (proposed.registrationNumber) setRegistrationNumber(proposed.registrationNumber);

        setPhotos({
          vehicle: proposedPhotos.vehicle || appPhotos.vehicle,
          registration: proposedPhotos.registration || appPhotos.registration,
        });

        setViewState('form');
      } else if (data.rejectedVehicleUpdate) {
        setHasPendingRequest(false);
        setRejectionReason(data.rejectedVehicleUpdate.rejectionReason || 'Rejected by admin');
        if (activeType) {
          setSelectedTypeChoice(activeType);
          setViewState('form');
        } else {
          setViewState('select');
        }
      } else {
        setHasPendingRequest(false);
        setRejectionReason(null);
        if (activeType) {
          setSelectedTypeChoice(activeType);
          setViewState('form');
        } else {
          setViewState('select');
        }
      }
    } catch (err: any) {
      console.error('[Vehicle Info] Fetch error:', err);
      Alert.alert(t('error'), t('update_error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicleProfile();
  }, []);

  const triggerCamera = async () => {
    setShowPhotoOptionsSheet(false);
    const hasPermission = await checkAndRequestCameraPermission();
    if (!hasPermission) {
      Alert.alert(t('error'), t('camera_permission_required'));
      return;
    }
    setCameraType('back');
    setTempCaptureUri(null);
    setShowCameraView(true);
  };

  const checkAndRequestCameraPermission = async () => {
    const permission = Platform.OS === 'android' ? PERMISSIONS.ANDROID.CAMERA : PERMISSIONS.IOS.CAMERA;
    const status = await check(permission);
    if (status === RESULTS.GRANTED) return true;
    const requestStatus = await request(permission);
    return requestStatus === RESULTS.GRANTED;
  };

  const triggerGallery = async () => {
    setShowPhotoOptionsSheet(false);
    try {
      const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
      if (result.didCancel || !result.assets || result.assets.length === 0) return;
      const selectedUri = result.assets[0].uri;
      if (selectedUri) {
        await handleUploadPhoto(selectedUri);
      }
    } catch (err: any) {
      Alert.alert(t('error'), 'Impossible de lire le fichier.');
    }
  };

  const handleUploadPhoto = async (localPath: string) => {
    if (!selectedPhotoSlot) return;
    setUploading(true);
    try {
      const resized = await ImageResizer.createResizedImage(
        localPath,
        800,
        600,
        'JPEG',
        80,
        0,
        undefined,
        false,
        { mode: 'contain', onlyScaleDown: true }
      );

      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'android' ? resized.uri : resized.uri.replace('file://', ''),
        name: `vehicle_${selectedPhotoSlot}_${Date.now()}.jpg`,
        type: 'image/jpeg',
      } as any);

      const response = await api.post('/driver/profile/vehicle/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const uploadedUrl = response.data.url;

      setPhotos((prev) => ({
        ...prev,
        [selectedPhotoSlot]: uploadedUrl,
      }));

      setTempCaptureUri(null);
      setShowCameraView(false);
      setSelectedPhotoSlot(null);
    } catch (err: any) {
      console.error('[Vehicle Info] Camera upload failed:', err);
      Alert.alert(t('error'), 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleCapturePhoto = async () => {
    if (!cameraRef.current) return;
    try {
      const photoFile = await cameraRef.current.takePhoto({ flash: 'off' });
      setTempCaptureUri(photoFile.path);
    } catch (err: any) {
      Alert.alert(t('error'), 'Capture error.');
    }
  };

  const handleConfirmCapturedPhoto = async () => {
    if (!tempCaptureUri || !selectedPhotoSlot) return;
    await handleUploadPhoto(tempCaptureUri);
  };

  const handleSaveChanges = async () => {
    if (hasPendingRequest) return;

    if (
      !manufacturer.trim() ||
      !brand.trim() ||
      !model.trim() ||
      !year.trim() ||
      !color.trim() ||
      !plateNumber.trim() ||
      !registrationNumber.trim()
    ) {
      Alert.alert(t('validation_error'), t('mandatory_field_error'));
      return;
    }

    if (!photos.vehicle || !photos.registration) {
      Alert.alert(t('validation_error'), t('mandatory_field_error', 'Veuillez uploader les deux photos requises.'));
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        type: vehicleType,
        manufacturer,
        brand,
        model,
        year: parseInt(year, 10),
        color,
        fuelType: vehicleType === 'CAR' ? fuelType : undefined,
        transmission: vehicleType === 'CAR' ? transmission : undefined,
        seats: vehicleType === 'CAR' ? parseInt(seats, 10) : undefined,
        plateNumber: plateNumber.trim(),
        registrationNumber: registrationNumber.trim(),
        photos,
      };

      await api.patch('/driver/profile/vehicle', payload);
      setHasPendingRequest(true);
      setRejectionReason(null);
      Alert.alert(t('success'), t('profile_update_submitted'));
    } catch (err: any) {
      Alert.alert(t('error'), 'Update failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredBrands = dbBrands.filter((b) =>
    b.name.toLowerCase().includes(brandSearchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top', 'bottom']}>
      <StatusBar barStyle={colors.bg === '#000000' ? 'light-content' : 'dark-content'} />

      {/* Header Bar */}
      <View style={[styles.headerBar, { borderBottomColor: colors.border }, isRTL && styles.headerBarRTL]}>
        <TouchableOpacity
          style={[styles.headerBackBtn, { backgroundColor: colors.surfaceAlt }]}
          onPress={() => {
            if (viewState === 'form' && !vehicleType) {
              setViewState('select');
            } else {
              navigation.goBack();
            }
          }}
        >
          {isRTL ? <ChevronRight size={20} color={colors.textPrimary} /> : <ChevronLeft size={20} color={colors.textPrimary} />}
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          {viewState === 'select' ? t('vehicle_type_title', 'Selectionner le type') : t('vehicle_info', 'Véhicule')}
        </Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>{t('close_btn', 'Fermer')}</Text>
        </TouchableOpacity>
      </View>

      {/* --- SELECT STATE --- */}
      {viewState === 'select' && (
        <ScrollView contentContainerStyle={styles.selectScroll} showsVerticalScrollIndicator={false}>
          <Text style={[styles.mainHeading, { color: colors.textPrimary }]}>
            {t('vehicle_type_title', 'Véhicule')}
          </Text>
          <Text style={[styles.subHeading, { color: colors.textSecondary }]}>
            {t('vehicle_type_sub', 'Sélectionnez votre type de service.')}
          </Text>

          <View style={styles.cardsStack}>
            {/* Car card */}
            <TouchableOpacity
              activeOpacity={0.9}
              style={[
                styles.luxCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: selectedTypeChoice === 'CAR' ? colors.primary : colors.border,
                  borderWidth: selectedTypeChoice === 'CAR' ? 2 : 1,
                  shadowColor: selectedTypeChoice === 'CAR' ? colors.primary : '#000000',
                },
              ]}
              onPress={() => setSelectedTypeChoice('CAR')}
            >
              <SVG3DCar colorsPrimary={colors.primary} />
              <View style={styles.luxLabelBlock}>
                <Text style={[styles.luxLabelTitle, { color: colors.textPrimary }]}>{t('type_car_label', 'Car')}</Text>
                <Text style={[styles.luxLabelDesc, { color: colors.textSecondary }]}>{t('type_car_desc')}</Text>
              </View>
            </TouchableOpacity>

            {/* Motorcycle card */}
            <TouchableOpacity
              activeOpacity={0.9}
              style={[
                styles.luxCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: selectedTypeChoice === 'MOTORCYCLE' ? colors.primary : colors.border,
                  borderWidth: selectedTypeChoice === 'MOTORCYCLE' ? 2 : 1,
                  shadowColor: selectedTypeChoice === 'MOTORCYCLE' ? colors.primary : '#000000',
                },
              ]}
              onPress={() => setSelectedTypeChoice('MOTORCYCLE')}
            >
              <SVG3DMotorcycle colorsPrimary={colors.primary} />
              <View style={styles.luxLabelBlock}>
                <Text style={[styles.luxLabelTitle, { color: colors.textPrimary }]}>{t('type_motorcycle_label', 'Motorcycle')}</Text>
                <Text style={[styles.luxLabelDesc, { color: colors.textSecondary }]}>{t('type_motorcycle_desc')}</Text>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.luxPrimaryBtn, { backgroundColor: colors.primary, marginTop: 40 }]}
            onPress={() => {
              setVehicleType(selectedTypeChoice);
              setViewState('form');
            }}
          >
            <Text style={styles.luxPrimaryBtnText}>{t('continue_btn', 'Continuer')}</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* --- FORM STATE --- */}
      {viewState === 'form' && (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.formScroll} showsVerticalScrollIndicator={false}>
            {/* Notices banners */}
            {hasPendingRequest && (
              <View style={[styles.fancyNotice, { backgroundColor: '#F59E0B20', borderColor: '#F59E0B50' }]}>
                <Info size={16} color="#F59E0B" />
                <Text style={styles.fancyNoticeText}>{t('vehicle_update_pending_notice')}</Text>
              </View>
            )}

            {/* Premium 3D Interactive Card (Upper Section) */}
            <Animated.View
              style={[
                styles.parallaxCardWrapper,
                {
                  transform: [
                    { perspective: 1000 },
                    { rotateX: panX.interpolate({ inputRange: [-30, 30], outputRange: ['-30deg', '30deg'] }) },
                    { rotateY: panY.interpolate({ inputRange: [-30, 30], outputRange: ['-30deg', '30deg'] }) },
                    { translateY: floatAnim },
                  ],
                },
              ]}
              {...panResponder.panHandlers}
            >
              <View style={[styles.premium3DCardBody, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.cardHeaderInfo}>
                  <Text style={styles.glassLabelSmall}>{t('vehicle_info', 'Vehicle details')}</Text>
                  <Text style={[styles.glassLabelPlate, { color: colors.textPrimary }]}>
                    {plateNumber || 'AA-123-BB'}
                  </Text>
                </View>

                {vehicleType === 'CAR' ? (
                  <SVG3DCar colorsPrimary={colors.primary} />
                ) : (
                  <SVG3DMotorcycle colorsPrimary={colors.primary} />
                )}

                <View style={styles.cardFooterDetails}>
                  <Text style={[styles.glassLabelTitle, { color: colors.textPrimary }]}>
                    {brand || 'Select Brand'} {model || ''}
                  </Text>
                  <Text style={{ color: colors.textMuted, fontSize: 10 }}>{color || 'Main Color'} • {year || 'Year'}</Text>
                </View>
              </View>
            </Animated.View>

            {/* Upload Section - Two Glassmorphic Cards Side-by-Side */}
            <View style={styles.photoContainerSplit}>
              {/* Photo du véhicule */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.glassPhotoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => {
                  setSelectedPhotoSlot('vehicle');
                  setShowPhotoOptionsSheet(true);
                }}
              >
                <View style={styles.glassPhotoInner}>
                  {photos.vehicle ? (
                    <Image source={{ uri: photos.vehicle }} style={styles.glassPhotoPreview} />
                  ) : (
                    <View style={styles.photoStubCenter}>
                      <CameraIcon size={24} color={colors.primary} />
                      <Text style={[styles.photoTitleText, { color: colors.textSecondary }]}>
                        {t('vehicle_photo_label', 'Photo du véhicule')}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>

              {/* Carte grise */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.glassPhotoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => {
                  setSelectedPhotoSlot('registration');
                  setShowPhotoOptionsSheet(true);
                }}
              >
                <View style={styles.glassPhotoInner}>
                  {photos.registration ? (
                    <Image source={{ uri: photos.registration }} style={styles.glassPhotoPreview} />
                  ) : (
                    <View style={styles.photoStubCenter}>
                      <CameraIcon size={24} color={colors.primary} />
                      <Text style={[styles.photoTitleText, { color: colors.textSecondary }]}>
                        {t('grey_card_label', 'Carte grise')}
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </View>

            {/* Inputs Form */}
            <View style={styles.glassFormGroup}>
              {/* Brand Selector */}
              <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.glassFormRow, { borderColor: colors.border }]}
                onPress={() => {
                  if (hasPendingRequest) return;
                  setShowBrandSelector(true);
                }}
              >
                <View style={styles.rowLabelWrapper}>
                  <Text style={[styles.glassFormLabel, { color: colors.textMuted }]}>{t('brand_label', 'Marque')}</Text>
                  <Text style={[styles.glassFormValue, { color: colors.textPrimary }]}>
                    {brand || 'Mercedes, Renault, Peugeot...'}
                  </Text>
                </View>
                <ChevronRight size={18} color={colors.textSecondary} />
              </TouchableOpacity>

              {/* Model Selector */}
              <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.glassFormRow, { borderColor: colors.border }]}
                onPress={() => {
                  if (hasPendingRequest) return;
                  if (!brand) {
                    Alert.alert(t('warning', 'Notice'), 'Veuillez choisir une marque d\'abord.');
                    return;
                  }
                  setShowModelSelector(true);
                }}
              >
                <View style={styles.rowLabelWrapper}>
                  <Text style={[styles.glassFormLabel, { color: colors.textMuted }]}>{t('model_label', 'Modèle')}</Text>
                  <Text style={[styles.glassFormValue, { color: colors.textPrimary }]}>
                    {model || 'Select Model...'}
                  </Text>
                </View>
                <ChevronRight size={18} color={colors.textSecondary} />
              </TouchableOpacity>

              {/* Year wheel selection */}
              <View style={[styles.glassFormHeadingRow, { borderColor: colors.border }]}>
                <Text style={[styles.glassFormLabel, { color: colors.textMuted }]}>{t('year_label', 'Année de production')}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizWheelScroll}>
                  {YEARS_ARRAY.map((y) => (
                    <TouchableOpacity
                      key={y}
                      style={[
                        styles.wheelItem,
                        { borderColor: y === year ? colors.primary : 'transparent', backgroundColor: y === year ? colors.primary + '15' : 'transparent' },
                      ]}
                      onPress={() => !hasPendingRequest && setYear(y)}
                      disabled={hasPendingRequest}
                    >
                      <Text style={[styles.wheelItemText, { color: y === year ? colors.primary : colors.textSecondary }]}>{y}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Color Circular selectors */}
              <View style={[styles.glassFormHeadingRow, { borderColor: colors.border }]}>
                <Text style={[styles.glassFormLabel, { color: colors.textMuted }]}>{t('color_label', 'Couleur du véhicule')}</Text>
                <View style={styles.colorPillsPack}>
                  {COLOR_TEMPLATES.map((c) => (
                    <TouchableOpacity
                      key={c.name}
                      style={[
                        styles.colorCircleBtn,
                        {
                          backgroundColor: c.hex,
                          borderColor: c.name === color ? colors.primary : 'transparent',
                          borderWidth: c.name === color ? 3.5 : 0,
                          shadowColor: c.glow,
                        },
                      ]}
                      onPress={() => !hasPendingRequest && setColor(c.name)}
                      disabled={hasPendingRequest}
                    >
                      {c.name === color && <Check size={14} color={c.name === 'Polar White' ? '#000000' : '#FFFFFF'} />}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Fuel and Transmission Bottom Sheets selectors CAR only */}
              {vehicleType === 'CAR' && (
                <>
                  {/* Transmission */}
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={[styles.glassFormRow, { borderColor: colors.border }]}
                    onPress={() => !hasPendingRequest && setShowTransModal(true)}
                    disabled={hasPendingRequest}
                  >
                    <View style={styles.rowLabelWrapper}>
                      <Text style={[styles.glassFormLabel, { color: colors.textMuted }]}>{t('transmission_label', 'Transmission')}</Text>
                      <Text style={[styles.glassFormValue, { color: colors.textPrimary }]}>{transmission}</Text>
                    </View>
                    <ChevronRight size={18} color={colors.textSecondary} />
                  </TouchableOpacity>

                  {/* Fuel type */}
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={[styles.glassFormRow, { borderColor: colors.border }]}
                    onPress={() => !hasPendingRequest && setShowFuelModal(true)}
                    disabled={hasPendingRequest}
                  >
                    <View style={styles.rowLabelWrapper}>
                      <Text style={[styles.glassFormLabel, { color: colors.textMuted }]}>{t('fuel_type_label', 'Carburant')}</Text>
                      <Text style={[styles.glassFormValue, { color: colors.textPrimary }]}>{fuelType}</Text>
                    </View>
                    <ChevronRight size={18} color={colors.textSecondary} />
                  </TouchableOpacity>

                  {/* Seats Picker wheels */}
                  <View style={[styles.glassFormHeadingRow, { borderColor: colors.border }]}>
                    <Text style={[styles.glassFormLabel, { color: colors.textMuted }]}>{t('seats_label', 'Nombre de places')}</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizWheelScroll}>
                      {SEATS_ARRAY.map((s) => (
                        <TouchableOpacity
                          key={s}
                          style={[
                            styles.wheelItem,
                            { borderColor: s === seats ? colors.primary : 'transparent', backgroundColor: s === seats ? colors.primary + '15' : 'transparent' },
                          ]}
                          onPress={() => !hasPendingRequest && setSeats(s)}
                          disabled={hasPendingRequest}
                        >
                          <Text style={[styles.wheelItemText, { color: s === seats ? colors.primary : colors.textSecondary }]}>{s}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </>
              )}

              {/* Manufacturer */}
              <View style={[styles.glassFormInputRow, { borderColor: colors.border }]}>
                <Text style={[styles.glassFormLabel, { color: colors.textMuted }]}>{t('manufacturer_label', 'Constructeur')}</Text>
                <TextInput
                  style={[styles.glassValInput, { color: colors.textPrimary }]}
                  value={manufacturer}
                  onChangeText={setManufacturer}
                  placeholder="ex. Renault"
                  placeholderTextColor={colors.textMuted}
                  editable={!hasPendingRequest}
                />
              </View>

              {/* Plate Number */}
              <View style={[styles.glassFormInputRow, { borderColor: colors.border }]}>
                <Text style={[styles.glassFormLabel, { color: colors.textMuted }]}>{t('plate_number_label', 'Plaque d\'immatriculation')}</Text>
                <TextInput
                  style={[styles.glassValInput, { color: colors.textPrimary }]}
                  value={plateNumber}
                  onChangeText={setPlateNumber}
                  placeholder="ex. 12345-A-15"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="characters"
                  editable={!hasPendingRequest}
                />
              </View>

              {/* Registration Number */}
              <View style={[styles.glassFormInputRow, { borderColor: colors.border }]}>
                <Text style={[styles.glassFormLabel, { color: colors.textMuted }]}>{t('registration_number_label', 'Numéro d\'enregistrement')}</Text>
                <TextInput
                  style={[styles.glassValInput, { color: colors.textPrimary }]}
                  value={registrationNumber}
                  onChangeText={setRegistrationNumber}
                  placeholder="ex. A129840B"
                  placeholderTextColor={colors.textMuted}
                  editable={!hasPendingRequest}
                />
              </View>

              {/* Chassis Number (VIN) */}
              <View style={[styles.glassFormInputRow, { borderBottomWidth: 0 }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[styles.glassFormLabel, { color: colors.textMuted, marginRight: 4 }]}>{t('vin_label', 'VIN (Châssis)')}</Text>
                  <Lock size={12} color={colors.textMuted} />
                </View>
                <Text style={{ color: colors.textMuted, fontSize: 14, marginTop: 4 }}>
                  {vin || 'VF3N... (Validé par l\'administration)'}
                </Text>
              </View>
            </View>

            {/* Change service type trigger */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.triggerTypeChangeBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => {
                if (hasPendingRequest) return;
                setViewState('select');
              }}
              disabled={hasPendingRequest}
            >
              <Text style={[styles.triggerTypeText, { color: colors.primary }]}>{t('change_type_btn')}</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Form Save Button Footer */}
          <View style={[styles.stickyFooter, { backgroundColor: colors.bg }]}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.saveButton,
                { backgroundColor: hasPendingRequest ? colors.border : colors.primary },
              ]}
              onPress={handleSaveChanges}
              disabled={hasPendingRequest || submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" strokeWidth={3} />
              ) : (
                <Text style={styles.saveButtonText}>{t('save_changes_btn', 'Enregistrer les modifications')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* --- FULLSCREEN PREMIUM BRAND SELECTOR --- */}
      <Modal visible={showBrandSelector} animationType="slide">
        <SafeAreaView style={[styles.fullModalLayout, { backgroundColor: colors.bg }]}>
          <View style={[styles.modalHeaderClose, { borderBottomColor: colors.border }]}>
            <Text style={[styles.largeModalHeaderTitle, { color: colors.textPrimary }]}>Sélectionner la marque</Text>
            <TouchableOpacity style={styles.modalCloseCircle} onPress={() => setShowBrandSelector(false)}>
              <X size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Search bar inside brand view */}
          <View style={[styles.modalSearchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Search size={18} color={colors.textSecondary} />
            <TextInput
              style={[styles.modalSearchInput, { color: colors.textPrimary }]}
              placeholder="Rechercher une marque..."
              placeholderTextColor={colors.textMuted}
              value={brandSearchQuery}
              onChangeText={setBrandSearchQuery}
            />
          </View>

          {loadingBrands ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <FlatList
              data={filteredBrands}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listPaddings}
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.brandItemRow, { borderBottomColor: colors.border }]}
                  onPress={() => {
                    setBrand(item.name);
                    setModel(''); // Reset model when brand changes
                    setBrandSearchQuery('');
                    setShowBrandSelector(false);
                    // Automatically trigger model selector open after select
                    setTimeout(() => {
                      setShowModelSelector(true);
                    }, 400);
                  }}
                >
                  <View style={styles.brandRowLeft}>
                    <BrandLogo type={item.logo || ''} color={colors.primary} />
                    <Text style={[styles.brandLabelName, { color: colors.textPrimary }]}>{item.name}</Text>
                  </View>
                  {brand === item.name && <Check size={18} color={colors.primary} />}
                </TouchableOpacity>
              )}
              ListFooterComponent={
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[styles.triggerTypeChangeBtn, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: 20 }]}
                  onPress={() => {
                    setShowBrandSelector(false);
                    setSuggestedBrand('');
                    setSuggestedModel('');
                    setTimeout(() => {
                      setShowSuggestionModal(true);
                    }, 450);
                  }}
                >
                  <Text style={{ color: colors.primary, fontWeight: '700' }}>Marque introuvable ? Suggérer de l'ajouter</Text>
                </TouchableOpacity>
              }
            />
          )}
        </SafeAreaView>
      </Modal>

      {/* --- FULLSCREEN PREMIUM MODEL SELECTOR --- */}
      <Modal visible={showModelSelector} animationType="slide">
        <SafeAreaView style={[styles.fullModalLayout, { backgroundColor: colors.bg }]}>
          <View style={[styles.modalHeaderClose, { borderBottomColor: colors.border }]}>
            <Text style={[styles.largeModalHeaderTitle, { color: colors.textPrimary }]}>Sélectionner le modèle</Text>
            <TouchableOpacity style={styles.modalCloseCircle} onPress={() => setShowModelSelector(false)}>
              <X size={20} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {loadingModels ? (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <FlatList
              data={dbModels}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listPaddings}
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.brandItemRow, { borderBottomColor: colors.border }]}
                  onPress={() => {
                    setModel(item.name);
                    setShowModelSelector(false);
                  }}
                >
                  <Text style={[styles.brandLabelName, { color: colors.textPrimary }]}>{item.name}</Text>
                  {model === item.name && <Check size={18} color={colors.primary} />}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.emptyViewSearch}>
                  <Text style={{ color: colors.textMuted }}>Aucun modèle disponible.</Text>
                </View>
              }
              ListFooterComponent={
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[styles.triggerTypeChangeBtn, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: 20 }]}
                  onPress={() => {
                    setShowModelSelector(false);
                    setSuggestedBrand(brand || '');
                    setSuggestedModel('');
                    setTimeout(() => {
                      setShowSuggestionModal(true);
                    }, 450);
                  }}
                >
                  <Text style={{ color: colors.primary, fontWeight: '700' }}>Modèle introuvable ? Suggérer de l'ajouter</Text>
                </TouchableOpacity>
              }
            />
          )}
        </SafeAreaView>
      </Modal>

      {/* --- MODEL/BRAND SUGGESTION MODAL --- */}
      <Modal visible={showSuggestionModal} animationType="slide" transparent>
        <View style={styles.sheetBackdrop}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowSuggestionModal(false)} />
          <View style={[styles.sheetFrame, { backgroundColor: colors.surface, paddingBottom: 40 }]}>
            <View style={styles.sheetHeaderGroup}>
              <Text style={[styles.sheetTitleText, { color: colors.textPrimary }]}>
                Suggérer une marque/modèle
              </Text>
              <TouchableOpacity onPress={() => setShowSuggestionModal(false)}>
                <X size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, gap: 15 }} keyboardShouldPersistTaps="handled">
              <Text style={{ color: colors.textSecondary, fontSize: 13, lineHeight: 18 }}>
                Proposez un nouveau modèle de véhicule à l'administration de Yalla VTC. Après vérification par l'équipe, il sera disponible pour tous les chauffeurs.
              </Text>

              {/* Manufacturer input */}
              <View style={[styles.modalSearchBox, { backgroundColor: colors.bg, borderColor: colors.border, margin: 0, height: 48 }]}>
                <TextInput
                  style={[styles.modalSearchInput, { color: colors.textPrimary }]}
                  placeholder="Nom du constructeur (ex: Renault)"
                  placeholderTextColor={colors.textMuted}
                  value={suggestedBrand}
                  onChangeText={setSuggestedBrand}
                />
              </View>

              {/* Model input */}
              <View style={[styles.modalSearchBox, { backgroundColor: colors.bg, borderColor: colors.border, margin: 0, height: 48 }]}>
                <TextInput
                  style={[styles.modalSearchInput, { color: colors.textPrimary }]}
                  placeholder="Nom du modèle (ex: Clio Campus)"
                  placeholderTextColor={colors.textMuted}
                  value={suggestedModel}
                  onChangeText={setSuggestedModel}
                />
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.luxPrimaryBtn, { backgroundColor: colors.primary, marginTop: 10 }]}
                disabled={submittingSuggestion}
                onPress={async () => {
                  if (!suggestedBrand.trim() || !suggestedModel.trim()) {
                    Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
                    return;
                  }
                  setSubmittingSuggestion(true);
                  try {
                    await api.post('/driver/profile/vehicle/models/suggest', {
                      manufacturerName: suggestedBrand.trim(),
                      modelName: suggestedModel.trim(),
                    });
                    Alert.alert('Succès', 'Votre suggestion a été enregistrée avec succès. Elle sera examinée très bientôt.');
                    setSuggestedBrand('');
                    setSuggestedModel('');
                    setShowSuggestionModal(false);
                  } catch (err: any) {
                    Alert.alert('Erreur', 'Une erreur est survenue lors de l\'enregistrement de votre suggestion.');
                  } finally {
                    setSubmittingSuggestion(false);
                  }
                }}
              >
                {submittingSuggestion ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.luxPrimaryBtnText}>Envoyer la suggestion</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* --- PHOTO SHEET BOTTOM SHEETS SELECTOR --- */}
      <Modal visible={showPhotoOptionsSheet} animationType="slide" transparent>
        <View style={styles.sheetBackdrop}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowPhotoOptionsSheet(false)} />
          <View style={[styles.sheetFrame, { backgroundColor: colors.surface }]}>
            <View style={styles.sheetTopNotch} />
            <View style={styles.sheetHeaderGroup}>
              <Text style={[styles.sheetTitleText, { color: colors.textPrimary }]}>
                {selectedPhotoSlot === 'vehicle' ? t('vehicle_photo_label') : t('grey_card_label')}
              </Text>
              <TouchableOpacity onPress={() => setShowPhotoOptionsSheet(false)}>
                <X size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.sheetItemsStack}>
              {/* If not approved (first reg): camera only */}
              {!(selectedPhotoSlot === 'vehicle' ? approvedPhotos.vehicle : approvedPhotos.registration) ? (
                <TouchableOpacity activeOpacity={0.8} style={[styles.sheetRowBtn, { borderBottomColor: colors.border }]} onPress={triggerCamera}>
                  <CameraIcon size={20} color={colors.textPrimary} />
                  <Text style={[styles.sheetRowText, { color: colors.textPrimary }]}>{t('take_photo_option', '📷 Prendre une photo')}</Text>
                </TouchableOpacity>
              ) : (
                // Approved state: camera & gallery
                <>
                  <TouchableOpacity activeOpacity={0.8} style={[styles.sheetRowBtn, { borderBottomColor: colors.border }]} onPress={triggerCamera}>
                    <CameraIcon size={20} color={colors.textPrimary} />
                    <Text style={[styles.sheetRowText, { color: colors.textPrimary }]}>{t('take_new_photo_option')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity activeOpacity={0.8} style={[styles.sheetRowBtn, { borderBottomColor: colors.border }]} onPress={triggerGallery}>
                    <Info size={20} color={colors.textPrimary} />
                    <Text style={[styles.sheetRowText, { color: colors.textPrimary }]}>{t('choose_from_device_option')}</Text>
                  </TouchableOpacity>
                </>
              )}

              {/* Cancel option */}
              <TouchableOpacity activeOpacity={0.8} style={styles.sheetRowBtn} onPress={() => setShowPhotoOptionsSheet(false)}>
                <X size={20} color={colors.error} />
                <Text style={[styles.sheetRowText, { color: colors.error, fontWeight: '700' }]}>{t('cancel_btn', 'Annuler')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- Fuel Type Bottom Sheet Modal selector --- */}
      <Modal visible={showFuelModal} animated animateType="slide" transparent>
        <View style={styles.sheetBackdrop}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowFuelModal(false)} />
          <View style={[styles.sheetFrame, { backgroundColor: colors.surface }]}>
            <View style={styles.sheetHeaderGroup}>
              <Text style={[styles.sheetTitleText, { color: colors.textPrimary }]}>{t('fuel_type_label', 'Fuel Type')}</Text>
              <TouchableOpacity onPress={() => setShowFuelModal(false)}>
                <X size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {FUEL_TYPES.map((fuel) => (
                <TouchableOpacity
                  key={fuel}
                  style={[styles.sheetRowItemTap, { borderBottomColor: colors.border }]}
                  onPress={() => {
                    setFuelType(fuel);
                    setShowFuelModal(false);
                  }}
                >
                  <Text style={[styles.sheetRowItemText, { color: colors.textPrimary }]}>{fuel}</Text>
                  {fuelType === fuel && <Check size={16} color={colors.primary} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* --- Transmission Bottom Sheet Modal selector --- */}
      <Modal visible={showTransModal} animated animateType="slide" transparent>
        <View style={styles.sheetBackdrop}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowTransModal(false)} />
          <View style={[styles.sheetFrame, { backgroundColor: colors.surface }]}>
            <View style={styles.sheetHeaderGroup}>
              <Text style={[styles.sheetTitleText, { color: colors.textPrimary }]}>{t('transmission_label', 'Transmission')}</Text>
              <TouchableOpacity onPress={() => setShowTransModal(false)}>
                <X size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {TRANSMISSIONS.map((trans) => (
                <TouchableOpacity
                  key={trans}
                  style={[styles.sheetRowItemTap, { borderBottomColor: colors.border }]}
                  onPress={() => {
                    setTransmission(trans);
                    setShowTransModal(false);
                  }}
                >
                  <Text style={[styles.sheetRowItemText, { color: colors.textPrimary }]}>{trans}</Text>
                  {transmission === trans && <Check size={16} color={colors.primary} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* --- Fullscreen Guided Camera Overlay Modal --- */}
      <Modal visible={showCameraView} animationType="slide">
        <View style={styles.cameraFrame}>
          {tempCaptureUri ? (
            <View style={styles.cameraPreviewFrame}>
              <Text style={styles.previewTitleStyle}>{t('preview_photo_title')}</Text>
              <Image source={{ uri: `file://${tempCaptureUri}` }} style={{ flex: 1, resizeMode: 'cover' }} />
              {uploading && (
                <View style={styles.uploadScrimIndicator}>
                  <ActivityIndicator size="large" color="#FFFFFF" strokeWidth={3} />
                </View>
              )}
              <View style={styles.previewFooterRow}>
                <TouchableOpacity
                  style={[styles.previewActionBtn, { backgroundColor: 'rgba(255,255,255,0.15)' }]}
                  onPress={() => setTempCaptureUri(null)}
                  disabled={uploading}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>{t('retake_photo_btn', 'Recommencer')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.previewActionBtn, { backgroundColor: colors.primary }]}
                  onPress={handleConfirmCapturedPhoto}
                  disabled={uploading}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>{t('use_photo_btn', 'Utiliser')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              {device == null ? (
                <View style={styles.cameraLoadView}>
                  <ActivityIndicator size="large" color="#FFFFFF" />
                </View>
              ) : (
                <Camera
                  ref={cameraRef}
                  style={StyleSheet.absoluteFill}
                  device={device}
                  isActive={showCameraView}
                  photo={true}
                />
              )}

              {/* Guidance labels & overlay mask */}
              <View style={styles.guidanceBox}>
                <Text style={styles.guidanceTextHeading}>
                  {selectedPhotoSlot === 'vehicle'
                    ? t('camera_guide_vehicle', 'Placez le véhicule en entier dans le cadre.')
                    : t('camera_guide_registration', 'Placez la carte grise de manière lisible.')}
                </Text>
              </View>

              {/* Rectangle cutout */}
              <View style={styles.cameraCutoutContainer}>
                <View style={styles.darkOutMask} />
                <View style={{ flexDirection: 'row' }}>
                  <View style={styles.darkOutMask} />
                  <View style={[styles.cutoutRect, { borderColor: colors.primary }]} />
                  <View style={styles.darkOutMask} />
                </View>
                <View style={[styles.darkOutMask, { flex: 1.2 }]} />
              </View>

              <TouchableOpacity style={styles.cameraCloseBtn} onPress={() => setShowCameraView(false)}>
                <X size={22} color="#FFFFFF" />
              </TouchableOpacity>

              <View style={styles.shutterRow}>
                <TouchableOpacity activeOpacity={0.8} style={styles.shutterButtonCircle} onPress={handleCapturePhoto}>
                  <View style={[styles.shutterInner, { backgroundColor: colors.primary }]} />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
};
import { FlatList } from 'react-native';

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  headerBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerBarRTL: {
    flexDirection: 'row-reverse',
  },
  headerBackBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  selectScroll: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  mainHeading: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 6,
  },
  subHeading: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 35,
  },
  cardsStack: {
    gap: 20,
  },
  luxCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 6,
  },
  luxLabelBlock: {
    marginTop: 15,
    alignItems: 'center',
    gap: 4,
  },
  luxLabelTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  luxLabelDesc: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  luxPrimaryBtn: {
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  luxPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  formScroll: {
    paddingHorizontal: 16,
    paddingTop: 15,
    paddingBottom: 110,
  },
  fancyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 10,
    marginBottom: 20,
  },
  fancyNoticeText: {
    flex: 1,
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '600',
  },
  // Animated Tilt Card wrapper
  parallaxCardWrapper: {
    alignItems: 'center',
    marginBottom: 24,
  },
  premium3DCardBody: {
    width: '100%',
    aspectRatio: 1.6,
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
  },
  cardHeaderInfo: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  glassLabelSmall: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  glassLabelPlate: {
    fontSize: 14,
    fontWeight: '800',
  },
  cardFooterDetails: {
    alignItems: 'center',
    gap: 2,
  },
  glassLabelTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  // Dual photo columns
  photoContainerSplit: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  glassPhotoCard: {
    flex: 1,
    aspectRatio: 1.15,
    borderRadius: 20,
    borderWidth: 1,
    padding: 6,
    overflow: 'hidden',
  },
  glassPhotoInner: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.02)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glassPhotoPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoStubCenter: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
  },
  photoTitleText: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  // Form fields
  glassFormGroup: {
    borderRadius: 24,
    paddingVertical: 8,
  },
  glassFormRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 64,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLabelWrapper: {
    flex: 1,
    gap: 2,
  },
  glassFormLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  glassFormValue: {
    fontSize: 14.5,
    fontWeight: '600',
  },
  glassFormHeadingRow: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  horizWheelScroll: {
    gap: 8,
    paddingVertical: 4,
  },
  wheelItem: {
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  wheelItemText: {
    fontSize: 13,
    fontWeight: '700',
  },
  colorPillsPack: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 4,
  },
  colorCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 2,
  },
  glassFormInputRow: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 2,
  },
  glassValInput: {
    height: 32,
    fontSize: 14.5,
    fontWeight: '600',
    padding: 0,
    margin: 0,
  },
  triggerTypeChangeBtn: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  triggerTypeText: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  saveButton: {
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  // Modal layout
  fullModalLayout: {
    flex: 1,
  },
  modalHeaderClose: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  largeModalHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalCloseCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    margin: 16,
    paddingHorizontal: 12,
    gap: 8,
  },
  modalSearchInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    padding: 0,
  },
  listPaddings: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  brandItemRow: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  brandRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandLabelName: {
    fontSize: 15,
    fontWeight: '600',
  },
  emptyViewSearch: {
    alignItems: 'center',
    marginTop: 40,
  },
  // Bottom Sheet frames
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheetFrame: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 34,
    maxHeight: '65%',
  },
  sheetTopNotch: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignSelf: 'center',
    marginTop: 8,
  },
  sheetHeaderGroup: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  sheetTitleText: {
    fontSize: 16,
    fontWeight: '700',
  },
  sheetItemsStack: {
    paddingVertical: 8,
  },
  sheetRowBtn: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sheetRowText: {
    fontSize: 14.5,
    fontWeight: '600',
  },
  sheetRowItemTap: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sheetRowItemText: {
    fontSize: 14.5,
  },
  // Camera Custom Styles
  cameraFrame: {
    flex: 1,
    backgroundColor: '#000000',
  },
  cameraLoadView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraPreviewFrame: {
    flex: 1,
    backgroundColor: '#000000',
  },
  previewTitleStyle: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    color: '#FFFFFF',
    fontWeight: '700',
    zIndex: 10,
  },
  uploadScrimIndicator: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 30,
  },
  previewFooterRow: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 20,
    gap: 15,
  },
  previewActionBtn: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guidanceBox: {
    position: 'absolute',
    top: 90,
    left: 24,
    right: 24,
    zIndex: 10,
    alignItems: 'center',
  },
  guidanceTextHeading: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  cameraCloseBtn: {
    position: 'absolute',
    top: 45,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  shutterRow: {
    position: 'absolute',
    bottom: 45,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 25,
  },
  shutterButtonCircle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
  },
  cameraCutoutContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
  },
  darkOutMask: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.7)',
  },
  cutoutRect: {
    width: SCREEN_W - 50,
    height: 230,
    borderRadius: 20,
    borderWidth: 3,
  },
});
