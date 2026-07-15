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
  Car,
  ChevronDown,
  Bike,
  Image as ImageIcon,
} from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { api } from '../../api/axios.instance';

// Native Vision Camera and permission imports
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import { launchImageLibrary } from 'react-native-image-picker';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const FUEL_TYPES = ['Diesel', 'Petrol', 'Hybrid', 'Electric'];
const TRANSMISSIONS = ['Manual', 'Automatic'];

export const VehicleInfoScreen = () => {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation('profile');
  const { colors } = useTheme();
  const isRTL = i18n.language === 'ar';
  const RowChevron = isRTL ? ChevronLeft : ChevronRight;

  // --- View State ---
  const [viewState, setViewState] = useState<'select' | 'form'>('select');
  const [selectedTypeChoice, setSelectedTypeChoice] = useState<'CAR' | 'MOTORCYCLE'>('CAR');

  // --- API State ---
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);

  // --- Approved Reference Data (For comparison & displaying current values)
  const [approvedPhotos, setApprovedPhotos] = useState<{
    vehicle: string | null;
    registration: string | null;
  }>({ vehicle: null, registration: null });

  // --- Form Fields State ---
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

  // --- Vehicle Photos State (Contains current active preview, showing pending if proposed)
  const [photos, setPhotos] = useState<{
    vehicle: string | null;
    registration: string | null;
  }>({
    vehicle: null,
    registration: null,
  });

  // --- Modal Selectors ---
  const [showFuelModal, setShowFuelModal] = useState(false);
  const [showTransModal, setShowTransModal] = useState(false);
  const [showPhotoOptionsSheet, setShowPhotoOptionsSheet] = useState(false);
  const [selectedPhotoSlot, setSelectedPhotoSlot] = useState<'vehicle' | 'registration' | null>(null);

  // --- Camera Overlay State ---
  const [showCameraView, setShowCameraView] = useState(false);
  const [cameraType, setCameraType] = useState<'front' | 'back'>('back');
  const [tempCaptureUri, setTempCaptureUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const cameraRef = useRef<Camera>(null);
  const device = useCameraDevice(cameraType);

  // --- Fetch vehicle profile ---
  const fetchVehicleProfile = async () => {
    setLoading(true);
    try {
      const response = await api.get('/driver/profile/vehicle');
      const data = response.data;

      // Extract current vehicle details
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

      // Handle pending / rejected states
      if (data.pendingVehicleUpdate) {
        setHasPendingRequest(true);
        setRejectionReason(null);

        // Hydrate inputs with proposed values so driver sees what was submitted
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

        // Note: Approved photos will remain the reference, but local preview photos shows the pending ones
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
      console.error('[Vehicle Info] Error loading details:', err);
      Alert.alert(t('error', 'Erreur'), t('update_error', 'Impossible de charger les données du véhicule.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicleProfile();
  }, []);

  // --- Camera Helpers & Permissions ---
  const checkAndRequestCameraPermission = async () => {
    const permission =
      Platform.OS === 'android'
        ? PERMISSIONS.ANDROID.CAMERA
        : PERMISSIONS.IOS.CAMERA;
    const status = await check(permission);

    if (status === RESULTS.GRANTED) {
      return true;
    }

    const requestStatus = await request(permission);
    return requestStatus === RESULTS.GRANTED;
  };

  const handleCardPress = (slot: 'vehicle' | 'registration') => {
    if (hasPendingRequest) {
      Alert.alert(
        t('warning', 'Attention'),
        t(
          'vehicle_already_pending_warning',
          'Vous avez déjà une demande en cours. Veuillez patienter pour la décision de l\'administration.'
        )
      );
      return;
    }

    setSelectedPhotoSlot(slot);
    setShowPhotoOptionsSheet(true);
  };

  // Open vision-camera view
  const triggerCamera = async () => {
    setShowPhotoOptionsSheet(false);
    const hasPermission = await checkAndRequestCameraPermission();
    if (!hasPermission) {
      Alert.alert(
        t('error', 'Erreur'),
        t('camera_permission_required', 'Veuillez autoriser l’accès à la caméra pour prendre votre photo.')
      );
      return;
    }

    setCameraType('back'); // Vehicle photos always shot using rear lens
    setTempCaptureUri(null);
    setShowCameraView(true);
  };

  // Choose photo from device library
  const triggerGallery = async () => {
    setShowPhotoOptionsSheet(false);
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.85,
      });

      if (result.didCancel || !result.assets || result.assets.length === 0) {
        return;
      }

      const selectedUri = result.assets[0].uri;
      if (selectedUri && selectedPhotoSlot) {
        setLoadingPhoto(selectedUri);
      }
    } catch (err: any) {
      console.error('[Vehicle Info] Gallery error:', err);
      Alert.alert(t('error'), 'Impossible de lire le fichier de l\'appareil.');
    }
  };

  // Process and upload a file path (from camera or gallery)
  const setLoadingPhoto = async (localPath: string) => {
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

      // Upload file directly to backend temp files folder
      const response = await api.post('/driver/profile/vehicle/photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const uploadedUrl = response.data.url;

      // Update local preview state
      setPhotos((prev) => ({
        ...prev,
        [selectedPhotoSlot]: uploadedUrl,
      }));

      setTempCaptureUri(null);
      setShowCameraView(false);
      setSelectedPhotoSlot(null);
    } catch (err: any) {
      console.error('[Vehicle Info] Upload image error:', err);
      const errMsg = err.response?.data?.message || err.message || 'File upload failed.';
      Alert.alert(t('error'), errMsg);
    } finally {
      setUploading(false);
    }
  };

  const handleCapturePhoto = async () => {
    if (!cameraRef.current) return;
    try {
      const photoFile = await cameraRef.current.takePhoto({
        flash: 'off',
      });
      setTempCaptureUri(photoFile.path);
    } catch (err: any) {
      console.error('[Vehicle Info] Capture error:', err);
      Alert.alert(t('error'), 'Capture error.');
    }
  };

  const handleConfirmCapturedPhoto = async () => {
    if (!tempCaptureUri || !selectedPhotoSlot) return;
    await setLoadingPhoto(tempCaptureUri);
  };

  // --- Save vehicle modifications ---
  const handleSaveChanges = async () => {
    if (hasPendingRequest) {
      Alert.alert(
        t('warning'),
        t('vehicle_already_pending_warning', 'Vous avez déjà une modification en cours.')
      );
      return;
    }

    // Required fields check
    if (
      !manufacturer.trim() ||
      !brand.trim() ||
      !model.trim() ||
      !year.trim() ||
      !color.trim() ||
      !plateNumber.trim() ||
      !registrationNumber.trim()
    ) {
      Alert.alert(t('validation_error', 'Erreur de validation'), t('mandatory_field_error'));
      return;
    }

    // Year validation
    const yearVal = parseInt(year, 10);
    const currentYear = new Date().getFullYear();
    if (isNaN(yearVal) || yearVal < 1980 || yearVal > currentYear + 1) {
      Alert.alert(t('validation_error'), t('invalid_year_error'));
      return;
    }

    // Seats validation (CAR only)
    if (vehicleType === 'CAR') {
      const seatsVal = parseInt(seats, 10);
      if (isNaN(seatsVal) || seatsVal < 1 || seatsVal > 20) {
        Alert.alert(t('validation_error'), t('invalid_seats_error'));
        return;
      }
    }

    // Plate number basic length validation
    if (plateNumber.trim().length < 3) {
      Alert.alert(t('validation_error'), t('invalid_plate_error'));
      return;
    }

    // Check mandatory photos uploads
    if (!photos.vehicle) {
      Alert.alert(t('validation_error'), t('mandatory_field_error', 'Veuillez uploader la photo du véhicule.'));
      return;
    }
    if (!photos.registration) {
      Alert.alert(t('validation_error'), t('mandatory_field_error', 'Veuillez uploader la carte grise.'));
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        type: vehicleType,
        manufacturer,
        brand,
        model,
        year: yearVal,
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

      Alert.alert(
        t('success', 'Succès'),
        t('profile_update_submitted', 'Votre demande a été soumise avec succès pour révision.')
      );
    } catch (err: any) {
      console.error('[Vehicle Info] Save error:', err);
      const errMsg = err.response?.data?.message || err.message || 'Operation failed.';
      Alert.alert(t('error'), errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Change type warning prompt
  const handleChangeVehicleTypePress = () => {
    if (hasPendingRequest) {
      Alert.alert(
        t('warning'),
        t('vehicle_already_pending_warning', 'Vous avez déjà une modification en cours.')
      );
      return;
    }

    Alert.alert(
      t('confirm_change_title', 'Changer le type de véhicule'),
      t(
        'confirm_change_type_message',
        'Changer de type de véhicule soumettra une demande de révision et pourrait demander de nouvelles photos.'
      ),
      [
        { text: t('cancel_btn', 'Annuler'), style: 'cancel' },
        {
          text: t('continue_btn', 'Continuer'),
          onPress: () => {
            setViewState('select');
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingRoot, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Determine if selected slot is currently "Approved" (Has an approved value inside approvedPhotos reference)
  const isApproved = selectedPhotoSlot ? !!approvedPhotos[selectedPhotoSlot] : false;

  // --- RENDER ViewState: Select vehicle type cards ---
  if (viewState === 'select') {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top', 'bottom']}>
        {/* Header Bar */}
        <View style={[styles.headerBar, { borderBottomColor: colors.border }, isRTL && styles.headerBarRTL]}>
          <TouchableOpacity
            style={[styles.headerBackBtn, { backgroundColor: colors.surfaceAlt }]}
            onPress={() => {
              if (vehicleType) {
                setViewState('form');
              } else {
                navigation.goBack();
              }
            }}
          >
            {isRTL ? <ChevronRight size={20} color={colors.textPrimary} /> : <ChevronLeft size={20} color={colors.textPrimary} />}
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            {t('vehicle_type_title', 'Selectionner le type de véhicule')}
          </Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView contentContainerStyle={styles.selectScrollBody} showsVerticalScrollIndicator={false}>
          <Text style={[styles.selectMainTitle, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>
            {t('vehicle_type_title', 'Sélectionner le type de véhicule')}
          </Text>
          <Text style={[styles.selectSubText, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
            {t('vehicle_type_sub', 'Choisissez le type de véhicule que vous utiliserez pour travailler sur Yalla VTC.')}
          </Text>

          <View style={styles.cardsContainer}>
            {/* CAR Choice Card */}
            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.choiceCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: selectedTypeChoice === 'CAR' ? colors.primary : colors.border,
                  borderWidth: selectedTypeChoice === 'CAR' ? 2.5 : 1,
                },
                isRTL && styles.choiceCardRTL,
              ]}
              onPress={() => setSelectedTypeChoice('CAR')}
            >
              <View style={[styles.cardGlowBadge, { backgroundColor: selectedTypeChoice === 'CAR' ? colors.primary + '15' : 'transparent' }]}>
                <Car size={32} color={selectedTypeChoice === 'CAR' ? colors.primary : colors.textMuted} />
              </View>

              <View style={[styles.cardTextContent, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                <Text style={[styles.cardLabel, { color: colors.textPrimary }]}>
                  {t('type_car_label', 'Voiture')}
                </Text>
                <Text style={[styles.cardDesc, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
                  {t('type_car_desc', 'Pour transporter des passagers en voiture.')}
                </Text>
              </View>

              <View style={styles.cardIndicatorWrapper}>
                {selectedTypeChoice === 'CAR' ? (
                  <View style={[styles.selectedCheckCircle, { backgroundColor: colors.primary }]}>
                    <Check size={12} color="#FFFFFF" strokeWidth={3} />
                  </View>
                ) : (
                  <RowChevron size={18} color={colors.textMuted} />
                )}
              </View>
            </TouchableOpacity>

            {/* MOTORCYCLE Choice Card */}
            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.choiceCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: selectedTypeChoice === 'MOTORCYCLE' ? colors.primary : colors.border,
                  borderWidth: selectedTypeChoice === 'MOTORCYCLE' ? 2.5 : 1,
                },
                isRTL && styles.choiceCardRTL,
              ]}
              onPress={() => setSelectedTypeChoice('MOTORCYCLE')}
            >
              <View style={[styles.cardGlowBadge, { backgroundColor: selectedTypeChoice === 'MOTORCYCLE' ? colors.primary + '15' : 'transparent' }]}>
                <Bike size={32} color={selectedTypeChoice === 'MOTORCYCLE' ? colors.primary : colors.textMuted} />
              </View>

              <View style={[styles.cardTextContent, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                <Text style={[styles.cardLabel, { color: colors.textPrimary }]}>
                  {t('type_motorcycle_label', 'Moto')}
                </Text>
                <Text style={[styles.cardDesc, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
                  {t('type_motorcycle_desc', 'Pour la livraison ou autre service disponible.')}
                </Text>
              </View>

              <View style={styles.cardIndicatorWrapper}>
                {selectedTypeChoice === 'MOTORCYCLE' ? (
                  <View style={[styles.selectedCheckCircle, { backgroundColor: colors.primary }]}>
                    <Check size={12} color="#FFFFFF" strokeWidth={3} />
                  </View>
                ) : (
                  <RowChevron size={18} color={colors.textMuted} />
                )}
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={[styles.footerContainer, { backgroundColor: colors.bg }]}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.btnSave, { backgroundColor: colors.primary }]}
            onPress={() => {
              setViewState('form');
              setVehicleType(selectedTypeChoice);
            }}
          >
            <Text style={styles.btnSaveText}>{t('continue_btn', 'Continuer')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // --- RENDER ViewState: Form view ---
  const isFirstRegistrationVehicle = !approvedPhotos.vehicle;
  const isFirstRegistrationRegistration = !approvedPhotos.registration;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top', 'bottom']}>
      {/* Header Bar */}
      <View style={[styles.headerBar, { borderBottomColor: colors.border }, isRTL && styles.headerBarRTL]}>
        <TouchableOpacity
          style={styles.headerBackBtn}
          onPress={() => {
            if (!vehicleType) {
              setViewState('select');
            } else {
              navigation.goBack();
            }
          }}
        >
          <X size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          {t('vehicle_info', 'Informations sur le véhicule')}
        </Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
            {t('close_btn', 'Fermer')}
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollBody}
          showsVerticalScrollIndicator={false}
        >
          {/* Rejection Notice Banner */}
          {rejectionReason ? (
            <View style={[styles.infoCard, { backgroundColor: colors.error + '12', borderColor: colors.error + '30', marginTop: 0, marginBottom: 15 }, isRTL && styles.infoCardRTL]}>
              <X size={18} color={colors.error} style={isRTL ? { marginLeft: 10 } : { marginRight: 10 }} />
              <Text style={[styles.infoCardText, { color: colors.error, fontWeight: '500' }]}>
                {t('vehicle_update_rejected_notice', 'Rejeté : ')}
                {rejectionReason}
              </Text>
            </View>
          ) : null}

          {/* Pending Notice Banner */}
          {hasPendingRequest ? (
            <View style={[styles.infoCard, { backgroundColor: colors.warning + '12', borderColor: colors.warning + '30', marginTop: 0, marginBottom: 15 }, isRTL && styles.infoCardRTL]}>
              <Info size={18} color={colors.warning} style={isRTL ? { marginLeft: 10 } : { marginRight: 10 }} />
              <Text style={[styles.infoCardText, { color: colors.warning, fontWeight: '500' }]}>
                {t('vehicle_update_pending_notice', 'Modification en attente de validation.')}
              </Text>
            </View>
          ) : null}

          {/* SECTION 1: TWO LARGE PHOTO CARDS (Side-by-side) */}
          <View style={styles.twoCardsRow}>
            {/* Card 1: Vehicle Photo */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.largeAssetCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => handleCardPress('vehicle')}
            >
              <View style={styles.assetPreviewStub}>
                {photos.vehicle ? (
                  <View style={{ flex: 1, width: '100%' }}>
                    <Image source={{ uri: photos.vehicle }} style={styles.assetImage} />
                    {/* Render badge indicator if version differs from approved reference */}
                    {approvedPhotos.vehicle !== photos.vehicle && (
                      <View style={styles.pendingBadgeMini}>
                        <Text style={styles.pendingBadgeText}>Pending</Text>
                      </View>
                    )}
                  </View>
                ) : (
                  <View style={[styles.plusIconCircle, { backgroundColor: colors.border + '30' }]}>
                    <Text style={[styles.plusIconText, { color: colors.textPrimary }]}>+</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.assetCardTitle, { color: colors.textPrimary }]}>
                {t('vehicle_photo_label', 'Photo du véhicule')}
              </Text>
            </TouchableOpacity>

            {/* Card 2: Grey Card (Vehicle Registration Card) */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.largeAssetCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => handleCardPress('registration')}
            >
              <View style={styles.assetPreviewStub}>
                {photos.registration ? (
                  <View style={{ flex: 1, width: '100%' }}>
                    <Image source={{ uri: photos.registration }} style={styles.assetImage} />
                    {/* Render badge indicator if version differs from approved reference */}
                    {approvedPhotos.registration !== photos.registration && (
                      <View style={styles.pendingBadgeMini}>
                        <Text style={styles.pendingBadgeText}>Pending</Text>
                      </View>
                    )}
                  </View>
                ) : (
                  <View style={[styles.plusIconCircle, { backgroundColor: colors.border + '30' }]}>
                    <Text style={[styles.plusIconText, { color: colors.textPrimary }]}>+</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.assetCardTitle, { color: colors.textPrimary }]}>
                {t('grey_card_label', 'Carte grise du véhicule')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Fields Section */}
          <View style={[styles.cardContainer, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: 24 }]}>
            {/* Brand */}
            <View style={[styles.fieldRow, { borderColor: colors.border }, isRTL && styles.fieldRowRTL]}>
              <View style={[styles.fieldContent, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>{t('brand_label', 'Marque du véhicule')}</Text>
                <TextInput
                  style={[styles.fieldInput, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left', width: '100%' }]}
                  value={brand}
                  onChangeText={setBrand}
                  placeholder="Marque du véhicule"
                  placeholderTextColor={colors.textMuted}
                  editable={!hasPendingRequest}
                />
              </View>
            </View>

            {/* Model */}
            <View style={[styles.fieldRow, { borderColor: colors.border }, isRTL && styles.fieldRowRTL]}>
              <View style={[styles.fieldContent, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>{t('model_label', 'Modèle du véhicule')}</Text>
                <TextInput
                  style={[styles.fieldInput, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left', width: '100%' }]}
                  value={model}
                  onChangeText={setModel}
                  placeholder="Modèle du véhicule"
                  placeholderTextColor={colors.textMuted}
                  editable={!hasPendingRequest}
                />
              </View>
            </View>

            {/* Color */}
            <View style={[styles.fieldRow, { borderColor: colors.border }, isRTL && styles.fieldRowRTL]}>
              <View style={[styles.fieldContent, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>{t('color_label', 'Couleur du véhicule')}</Text>
                <TextInput
                  style={[styles.fieldInput, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left', width: '100%' }]}
                  value={color}
                  onChangeText={setColor}
                  placeholder="Couleur du véhicule"
                  placeholderTextColor={colors.textMuted}
                  editable={!hasPendingRequest}
                />
              </View>
            </View>

            {/* Plate Number */}
            <View style={[styles.fieldRow, { borderColor: colors.border }, isRTL && styles.fieldRowRTL]}>
              <View style={[styles.fieldContent, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>{t('plate_number_label', 'Numéro d\'immatriculation')}</Text>
                <TextInput
                  style={[styles.fieldInput, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left', width: '100%' }]}
                  value={plateNumber}
                  onChangeText={setPlateNumber}
                  placeholder="Numéro d'immatriculation"
                  placeholderTextColor={colors.textMuted}
                  autoCapitalize="characters"
                  editable={!hasPendingRequest}
                />
              </View>
            </View>

            {/* Year of production */}
            <View style={[styles.fieldRow, { borderBottomWidth: 0 }, isRTL && styles.fieldRowRTL]}>
              <View style={[styles.fieldContent, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>{t('year_label', 'Année de production')}</Text>
                <TextInput
                  style={[styles.fieldInput, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left', width: '100%' }]}
                  value={year}
                  onChangeText={setYear}
                  placeholder="Année de production"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  maxLength={4}
                  editable={!hasPendingRequest}
                />
              </View>
            </View>
          </View>

          {/* VIN & hidden values section inside bottom fields */}
          <View style={[styles.cardContainer, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: 15 }]}>
            {/* Manufacturer */}
            <View style={[styles.fieldRow, { borderColor: colors.border }, isRTL && styles.fieldRowRTL]}>
              <View style={[styles.fieldContent, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>{t('manufacturer_label', 'Constructeur')}</Text>
                <TextInput
                  style={[styles.fieldInput, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left', width: '100%' }]}
                  value={manufacturer}
                  onChangeText={setManufacturer}
                  placeholder="ex. Dacia"
                  placeholderTextColor={colors.textMuted}
                  editable={!hasPendingRequest}
                />
              </View>
            </View>

            {/* registration number */}
            <View style={[styles.fieldRow, { borderColor: colors.border }, isRTL && styles.fieldRowRTL]}>
              <View style={[styles.fieldContent, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>{t('registration_number_label', 'Numéro d\'enregistrement')}</Text>
                <TextInput
                  style={[styles.fieldInput, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left', width: '100%' }]}
                  value={registrationNumber}
                  onChangeText={setRegistrationNumber}
                  placeholder="Registration Number"
                  placeholderTextColor={colors.textMuted}
                  editable={!hasPendingRequest}
                />
              </View>
            </View>

            {/* Conditional CAR fields */}
            {vehicleType === 'CAR' && (
              <>
                {/* Fuel Type */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.fieldRow, { borderColor: colors.border }, isRTL && styles.fieldRowRTL]}
                  onPress={() => !hasPendingRequest && setShowFuelModal(true)}
                  disabled={hasPendingRequest}
                >
                  <View style={[styles.fieldContent, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                    <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>{t('fuel_type_label', 'Type de carburant')}</Text>
                    <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <Text style={[styles.fieldText, { color: colors.textPrimary }]}>{fuelType}</Text>
                      <ChevronDown size={16} color={colors.textMuted} />
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Transmission */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.fieldRow, { borderColor: colors.border }, isRTL && styles.fieldRowRTL]}
                  onPress={() => !hasPendingRequest && setShowTransModal(true)}
                  disabled={hasPendingRequest}
                >
                  <View style={[styles.fieldContent, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                    <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>{t('transmission_label', 'Boîte de vitesse')}</Text>
                    <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <Text style={[styles.fieldText, { color: colors.textPrimary }]}>{transmission}</Text>
                      <ChevronDown size={16} color={colors.textMuted} />
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Seats */}
                <View style={[styles.fieldRow, { borderColor: colors.border }, isRTL && styles.fieldRowRTL]}>
                  <View style={[styles.fieldContent, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                    <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>{t('seats_label', 'Nombre de places')}</Text>
                    <TextInput
                      style={[styles.fieldInput, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left', width: '100%' }]}
                      value={seats}
                      onChangeText={setSeats}
                      placeholder="4"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="numeric"
                      editable={!hasPendingRequest}
                    />
                  </View>
                </View>
              </>
            )}

            {/* VIN Read-Only */}
            <View style={[styles.fieldRow, { borderBottomWidth: 0 }, isRTL && styles.fieldRowRTL]}>
              <View style={[styles.fieldContent, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>{t('vin_label', 'VIN (Numéro du châssis)')}</Text>
                  <Lock size={10} color={colors.textMuted} style={{ marginLeft: 4, marginBottom: 1 }} />
                </View>
                <Text style={[styles.fieldTextDisabled, { color: colors.textMuted, fontSize: 13.5 }]}>
                  {vin || 'vf3789b1238910...'}
                </Text>
              </View>
            </View>
          </View>

          {/* Change vehicle type trigger options */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.changeTypeOptionRow, { borderColor: colors.border, backgroundColor: colors.surface }]}
            onPress={handleChangeVehicleTypePress}
            disabled={hasPendingRequest}
          >
            <Text style={[styles.changeTypeOptionText, { color: colors.primary }]}>
              {t('change_type_btn', 'Changer de type de véhicule')}
            </Text>
            <RowChevron size={16} color={colors.primary} />
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer CTA */}
      <View style={[styles.footerContainer, { backgroundColor: colors.bg }]}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={[
            styles.btnSave,
            { backgroundColor: hasPendingRequest ? colors.border : colors.primary },
          ]}
          onPress={handleSaveChanges}
          disabled={hasPendingRequest || submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.btnSaveText}>{t('save_changes_btn', 'Enregistrer les modifications')}</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* --- PHOTO CARD BOTTOM SHEET SELECTOR --- */}
      <Modal visible={showPhotoOptionsSheet} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowPhotoOptionsSheet(false)} />
          <View style={[styles.modalContent, { backgroundColor: colors.surface, height: 'auto' }]}>
            <View style={styles.sheetHandleBar} />
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                {selectedPhotoSlot === 'vehicle' ? t('vehicle_photo_label') : t('grey_card_label')}
              </Text>
              <TouchableOpacity onPress={() => setShowPhotoOptionsSheet(false)}>
                <X size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={{ paddingVertical: 10 }}>
              {/* Check if slot has already been approved (Approved reference exists) */}
              {(selectedPhotoSlot === 'vehicle' ? isFirstRegistrationVehicle : isFirstRegistrationRegistration) ? (
                // First Registration: camera only!
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.sheetItem, { borderBottomColor: colors.border }]}
                  onPress={triggerCamera}
                >
                  <CameraIcon size={20} color={colors.textPrimary} />
                  <Text style={[styles.sheetItemText, { color: colors.textPrimary }]}>
                    {t('take_photo_option', '📷 Prendre une photo')}
                  </Text>
                </TouchableOpacity>
              ) : (
                // Approved state: take photo OR choose from device!
                <>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={[styles.sheetItem, { borderBottomColor: colors.border }]}
                    onPress={triggerCamera}
                  >
                    <CameraIcon size={20} color={colors.textPrimary} />
                    <Text style={[styles.sheetItemText, { color: colors.textPrimary }]}>
                      {t('take_new_photo_option', '📷 Prendre une nouvelle photo')}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={[styles.sheetItem, { borderBottomColor: colors.border }]}
                    onPress={triggerGallery}
                  >
                    <ImageIcon size={20} color={colors.textPrimary} />
                    <Text style={[styles.sheetItemText, { color: colors.textPrimary }]}>
                      {t('choose_from_device_option', '🖼️ Choisir depuis l\'appareil')}
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {/* Cancel item */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.sheetItem, { borderBottomWidth: 0 }]}
                onPress={() => setShowPhotoOptionsSheet(false)}
              >
                <X size={20} color={colors.error} />
                <Text style={[styles.sheetItemText, { color: colors.error, fontWeight: '700' }]}>
                  {t('cancel_btn', '❌ Annuler')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- Fuel Type Bottom Sheet Modal selector --- */}
      <Modal visible={showFuelModal} animated animateType="slide" transparent>
        <View style={styles.modalBg}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowFuelModal(false)} />
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>{t('fuel_type_label')}</Text>
              <TouchableOpacity onPress={() => setShowFuelModal(false)}>
                <X size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {FUEL_TYPES.map((fuel) => (
                <TouchableOpacity
                  key={fuel}
                  style={[styles.modalItem, { borderBottomColor: colors.border }]}
                  onPress={() => {
                    setFuelType(fuel);
                    setShowFuelModal(false);
                  }}
                >
                  <Text style={[styles.modalItemText, { color: colors.textPrimary }]}>{fuel}</Text>
                  {fuelType === fuel && <Check size={16} color={colors.primary} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* --- Transmission Bottom Sheet Modal selector --- */}
      <Modal visible={showTransModal} animated animateType="slide" transparent>
        <View style={styles.modalBg}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowTransModal(false)} />
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>{t('transmission_label')}</Text>
              <TouchableOpacity onPress={() => setShowTransModal(false)}>
                <X size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {TRANSMISSIONS.map((trans) => (
                <TouchableOpacity
                  key={trans}
                  style={[styles.modalItem, { borderBottomColor: colors.border }]}
                  onPress={() => {
                    setTransmission(trans);
                    setShowTransModal(false);
                  }}
                >
                  <Text style={[styles.modalItemText, { color: colors.textPrimary }]}>{trans}</Text>
                  {transmission === trans && <Check size={16} color={colors.primary} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* --- Fullscreen Custom Guided Camera overlay modal --- */}
      <Modal visible={showCameraView} animationType="slide" transparent={false}>
        <View style={styles.cameraContainer}>
          {tempCaptureUri ? (
            <View style={styles.previewContainer}>
              <View style={styles.previewHeader}>
                <Text style={styles.previewTitle}>{t('preview_photo_title', 'Aperçu de la photo')}</Text>
              </View>

              <Image source={{ uri: `file://${tempCaptureUri}` }} style={{ flex: 1, resizeMode: 'cover' }} />

              {uploading && (
                <View style={styles.uploadScrim}>
                  <ActivityIndicator size="large" color="#FFFFFF" />
                </View>
              )}

              <View style={styles.previewBtnContainer}>
                <TouchableOpacity
                  style={[styles.previewBtn, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
                  onPress={() => setTempCaptureUri(null)}
                  disabled={uploading}
                >
                  <Text style={[styles.btnPhotoUpdateText, { color: '#FFFFFF' }]}>
                    {t('retake_photo_btn', '🔄 Recommencer')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.previewBtn, { backgroundColor: colors.primary }]}
                  onPress={handleConfirmCapturedPhoto}
                  disabled={uploading}
                >
                  <Text style={[styles.btnPhotoUpdateText, { color: '#FFFFFF' }]}>
                    {t('use_photo_btn', '✅ Utiliser')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              {device == null ? (
                <View style={styles.cameraError}>
                  <ActivityIndicator size="large" color="#FFFFFF" />
                  <Text style={{ color: '#FFFFFF', marginTop: 15 }}>Loading Camera Hardware...</Text>
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

              {/* Top guidance message */}
              <View style={styles.cameraTextOverlay}>
                <View style={styles.instructionsContainer}>
                  <Text style={styles.instructionsText}>
                    {selectedPhotoSlot === 'vehicle'
                      ? t('camera_guide_vehicle', 'Placez le véhicule en entier dans le cadre.')
                      : t('camera_guide_registration', 'Placez la carte grise de manière lisible dans le cadre.')}
                  </Text>
                  <Text style={styles.instructionsSubText}>
                    {t('face_guide_sub_instruction', 'Assurez-vous que l\'image est nette et lumineuse.')}
                  </Text>
                </View>
              </View>

              {/* Rectangular guide mask cutout overlay */}
              <View style={styles.maskContainer}>
                <View style={styles.maskDark} />
                <View style={{ flexDirection: 'row' }}>
                  <View style={styles.maskDark} />
                  <View style={[styles.rectCutout, { borderColor: colors.primary }]} />
                  <View style={styles.maskDark} />
                </View>
                <View style={[styles.maskDark, { flex: 1.3 }]} />
              </View>

              {/* Close Camera button */}
              <TouchableOpacity
                style={styles.cameraCloseBtn}
                onPress={() => {
                  setShowCameraView(false);
                  setSelectedPhotoSlot(null);
                }}
              >
                <X size={24} color="#FFFFFF" />
              </TouchableOpacity>

              {/* Flip camera control */}
              <TouchableOpacity
                style={styles.cameraFlipBtn}
                onPress={() => setCameraType((prev) => (prev === 'front' ? 'back' : 'front'))}
              >
                <RefreshCw size={20} color="#FFFFFF" />
              </TouchableOpacity>

              {/* Shot shutter button */}
              <View style={styles.cameraShutterContainer}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.shutterButton, { borderColor: colors.primary }]}
                  onPress={handleCapturePhoto}
                >
                  <View style={[styles.shutterInnerCircle, { backgroundColor: colors.primary }]} />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loadingRoot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  scrollBody: {
    paddingHorizontal: 16,
    paddingTop: 15,
    paddingBottom: 32,
  },
  selectScrollBody: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  selectMainTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  selectSubText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 32,
  },
  cardsContainer: {
    gap: 16,
  },
  choiceCard: {
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  choiceCardRTL: {
    flexDirection: 'row-reverse',
  },
  cardGlowBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTextContent: {
    flex: 1,
    gap: 4,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  cardIndicatorWrapper: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCheckCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeTypeOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 15,
  },
  changeTypeOptionText: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  // Side-by-side Large asset cards row
  twoCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginVertical: 10,
  },
  largeAssetCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
    aspectRatio: 1.15,
    justifyContent: 'center',
  },
  assetPreviewStub: {
    width: '100%',
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.02)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  assetImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  plusIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusIconText: {
    fontSize: 24,
    fontWeight: '400',
  },
  assetCardTitle: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  pendingBadgeMini: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#EAB308',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pendingBadgeText: {
    color: '#000000',
    fontSize: 8.5,
    fontWeight: '700',
  },
  cardContainer: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  fieldRowRTL: {
    flexDirection: 'row-reverse',
  },
  fieldContent: {
    flex: 1,
    justifyContent: 'center',
  },
  fieldLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 1,
  },
  fieldTextDisabled: {
    fontSize: 14.5,
    fontWeight: '500',
  },
  fieldText: {
    fontSize: 14.5,
    fontWeight: '500',
  },
  fieldInput: {
    height: 24,
    fontSize: 14.5,
    fontWeight: '500',
    padding: 0,
    margin: 0,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  infoCardRTL: {
    flexDirection: 'row-reverse',
  },
  infoCardText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16.5,
    textAlign: 'left',
  },
  footerContainer: {
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 20 : 16,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  btnSave: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnSaveText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 30,
    height: 300,
  },
  sheetHandleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.1)',
    alignSelf: 'center',
    marginTop: 8,
  },
  modalHeader: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalList: {
    flex: 1,
  },
  modalItem: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalItemText: {
    fontSize: 14.5,
  },
  sheetItem: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sheetItemText: {
    fontSize: 15,
    fontWeight: '500',
  },
  // Camera layout styling
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  cameraError: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraTextOverlay: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  instructionsContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  instructionsText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  instructionsSubText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12.5,
    fontWeight: '500',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  cameraCloseBtn: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  cameraFlipBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  cameraShutterContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  shutterButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterInnerCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
  },
  // Capture view masks
  maskContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
  },
  maskDark: {
    flex: 1.1,
    backgroundColor: 'rgba(15,23,42,0.65)',
  },
  rectCutout: {
    width: SCREEN_W - 60,
    height: 220,
    borderRadius: 14,
    borderWidth: 3.5,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
  },
  // Post-capture preview structures
  previewContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  previewHeader: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  previewTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  previewBtnContainer: {
    position: 'absolute',
    bottom: 50,
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 20,
  },
  previewBtn: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  uploadScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    zIndex: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
