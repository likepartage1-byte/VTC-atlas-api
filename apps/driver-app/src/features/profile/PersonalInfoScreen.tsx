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
  Pencil,
  ChevronLeft,
  ChevronRight,
  Info,
  Lock,
  Mail,
  MapPin,
  Check,
  X,
  RefreshCw,
} from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { api } from '../../api/axios.instance';

// Native Vision Camera and permission imports
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import ImageResizer from '@bam.tech/react-native-image-resizer';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const CITIES = [
  'Marrakech',
  'Casablanca',
  'Rabat',
  'Tangier',
  'Agadir',
  'Fes',
  'Meknes',
  'Oujda',
];

export const PersonalInfoScreen = () => {
  const { t, i18n } = useTranslation(['profile', 'translation']);
  const { colors } = useTheme();
  const navigation = useNavigation();
  const isRTL = i18n.language === 'ar';

  // Profile fields state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');

  // Local UI modals state
  const [showCityModal, setShowCityModal] = useState(false);
  const [showCameraView, setShowCameraView] = useState(false);

  // Photos state
  const [approvedPhoto, setApprovedPhoto] = useState<string | null>(null);
  const [pendingPhoto, setPendingPhoto] = useState<string | null>(null);
  const [photoStatus, setPhotoStatus] = useState<string | null>(null);

  // loading state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [tempCaptureUri, setTempCaptureUri] = useState<string | null>(null);
  const [cameraType, setCameraType] = useState<'front' | 'back'>('front');

  // Camera reference & device selector
  const cameraRef = useRef<any>(null);
  const device = useCameraDevice(cameraType);

  // Fetch initial profile
  const fetchData = async () => {
    try {
      setLoading(true);
      const [profileRes, verificationRes] = await Promise.all([
        api.get('/driver/profile'),
        api.get('/driver/verification/summary').catch(() => ({ data: { uploadedDocuments: [] } })),
      ]);

      const profile = profileRes.data;
      const verifiedData = verificationRes.data;

      setIsVerified(profile.driver?.verified || false);

      if (profile.personalInfo) {
        setFirstName(profile.personalInfo.firstName || '');
        setLastName(profile.personalInfo.lastName || '');
        setEmail(profile.personalInfo.email || '');
        setCity(profile.personalInfo.city || 'Marrakech');
        setPhone(profile.personalInfo.phone || profile.driver?.phone || '');
      } else {
        const nameParts = (profile.driver?.name || '').split(' ');
        setFirstName(nameParts[0] || '');
        setLastName(nameParts.slice(1).join(' ') || '');
        setPhone(profile.driver?.phone || '');
      }

      setApprovedPhoto(profile.driver?.avatar || null);

      const docs = verifiedData.uploadedDocuments || [];
      const photoDoc = docs.find((d: any) => d.type === 'PROFILE_PHOTO');
      if (photoDoc) {
        setPhotoStatus(photoDoc.status);
        if (photoDoc.status === 'PENDING') {
          setPendingPhoto(photoDoc.url || null);
        } else {
          setPendingPhoto(null);
        }
      }
    } catch (err: any) {
      console.error('[Personal Info] Load error:', err);
      Alert.alert(t('error'), t('update_error') || 'Failed to load details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatPhone = (val: string) => {
    if (!val) return '';
    const clean = val.replace(/\s+/g, '');
    if (clean.length < 5) return clean;
    const firstTwo = clean.substring(0, 2);
    const lastTwo = clean.substring(clean.length - 2);
    return `${firstTwo}********${lastTwo}`;
  };

  // Check and demand permission locally
  const checkAndRequestCameraPermission = async () => {
    const permissionToken =
      Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA;
    const status = await check(permissionToken);
    if (status === RESULTS.GRANTED) {
      return true;
    }
    const requestStatus = await request(permissionToken);
    return requestStatus === RESULTS.GRANTED;
  };

  // Trigger Camera viewport
  const handleSnapPhotoPress = async () => {
    const isNewUser = !firstName.trim() || !lastName.trim() || 
      (firstName.trim().toLowerCase() === 'new' && lastName.trim().toLowerCase() === 'user');
    
    if (isNewUser) {
      Alert.alert(
        t('name_required_title', 'Configuration Requise'),
        t('name_required_message', 'Veuillez saisir votre vrai nom et prénom, puis enregistrer les modifications en bas avant de prendre une photo selfie.')
      );
      return;
    }

    const hasPermission = await checkAndRequestCameraPermission();
    if (!hasPermission) {
      Alert.alert(t('error'), t('camera_permission_required', 'Please grant camera permission to take a photo.'));
      return;
    }
    setShowCameraView(true);
  };

  // Shutter action
  const handleCapturePhoto = async () => {
    if (!cameraRef.current) return;
    try {
      const photoFile = await cameraRef.current.takePhoto({
        flash: 'off',
      });
      setTempCaptureUri(photoFile.path);
    } catch (err: any) {
      console.error('[Personal Info] Camera snap error:', err);
      Alert.alert(t('error'), 'Failed to capture photo.');
    }
  };

  // Confirm and upload selected selfie photo
  const handleConfirmCapturedPhoto = async () => {
    if (!tempCaptureUri) return;
    setUploading(true);
    try {
      const localPath = tempCaptureUri;

      // Compress and resize the image before uploading to reduce bandwidth usage
      // Target: 600x600 size, jpeg format, 80% quality
      const resized = await ImageResizer.createResizedImage(
        localPath,
        600,
        600,
        'JPEG',
        80,
        0,
        undefined,
        false,
        { mode: 'contain', onlyScaleDown: true }
      );

      // Prepare multi-part request body
      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'android' ? resized.uri : resized.uri.replace('file://', ''),
        name: `selfie_${Date.now()}.jpg`,
        type: 'image/jpeg',
      } as any);

      await api.post('/driver/verification/documents/PROFILE_PHOTO', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update state local view
      setPendingPhoto(resized.uri);
      setPhotoStatus('PENDING');
      setTempCaptureUri(null);
      setShowCameraView(false);

      Alert.alert(
        t('success', 'Succès'),
        t('photo_pending_alert', 'Votre photo de profil a été téléchargée avec succès. Elle est en cours d’examen par l’administration.')
      );
    } catch (err: any) {
      console.error('[Personal Info] Camera upload error:', err);
      const errMsg = err.response?.data?.message || err.message || 'File upload failed.';
      Alert.alert(t('error'), errMsg);
    } finally {
      setUploading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert(t('error'), t('invalid_email', 'Please enter a valid email address.'));
      return;
    }

    if (!isVerified) {
      if (!firstName.trim()) {
        Alert.alert(t('error'), t('first_name_required', 'Veuillez saisir votre prénom.'));
        return;
      }
      if (!lastName.trim()) {
        Alert.alert(t('error'), t('last_name_required', 'Veuillez saisir votre nom de famille.'));
        return;
      }
      if (firstName.trim().toLowerCase() === 'new' && lastName.trim().toLowerCase() === 'user') {
        Alert.alert(t('error'), t('name_cannot_be_default', 'Veuillez saisir un vrai prénom et nom de famille.'));
        return;
      }
    }

    setSaving(true);
    try {
      const payload: any = {
        email: email.trim(),
        city,
      };

      if (!isVerified) {
        payload.firstName = firstName.trim();
        payload.lastName = lastName.trim();
      }

      await api.patch('/driver/profile', payload);
      Alert.alert(t('success'), t('update_success', 'Profil mis à jour avec succès!'));
      await fetchData();
    } catch (err: any) {
      console.error('[Personal Info] Save profile error:', err);
      Alert.alert(t('error'), err.response?.data?.message || t('update_error'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingRoot, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const BackChevron = isRTL ? ChevronRight : ChevronLeft;
  const RowChevron = isRTL ? ChevronLeft : ChevronRight;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top', 'left', 'right']}>
      {/* Header bar matching Yalla VTC layout */}
      <View style={[styles.headerBar, isRTL && styles.headerBarRTL]}>
        <TouchableOpacity
          style={[styles.headerBackBtn, { backgroundColor: colors.surfaceAlt }]}
          onPress={() => navigation.goBack()}
        >
          <BackChevron size={20} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          {t('profile_settings_title', 'Paramètres du profil')}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollBody}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Avatar frame area (Indigo color glow around avatar) */}
          <View style={styles.avatarSection}>
            <TouchableOpacity activeOpacity={0.8} style={styles.avatarWrapper} onPress={handleSnapPhotoPress}>
              <View style={[styles.avatarGlowCircle, { borderColor: colors.primary }]}>
                {uploading ? (
                  <View style={styles.uploadScrim}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  </View>
                ) : null}

                {pendingPhoto ? (
                  <Image source={{ uri: pendingPhoto }} style={styles.avatarImage} />
                ) : approvedPhoto ? (
                  <Image source={{ uri: approvedPhoto }} style={styles.avatarImage} />
                ) : (
                  <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80' }}
                    style={styles.avatarImage}
                  />
                )}
              </View>

              {/* Blue Camera overlap badge */}
              <View style={[styles.cameraIconBadge, { backgroundColor: colors.primary }]}>
                <CameraIcon size={14} color="#FFFFFF" />
              </View>
            </TouchableOpacity>

            {photoStatus === 'PENDING' ? (
              <View style={[styles.reviewBadge, { backgroundColor: colors.warning + '1A', borderColor: colors.warning + '33' }]}>
                <Text style={[styles.reviewBadgeText, { color: colors.warning }]}>
                  {t('photo_review_badge', 'En cours')}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Group 1: Verified Details Card (Locked status, very unique and premium) */}
          <View style={styles.sectionHeader}>
            <Lock size={14} color={colors.textMuted} style={isRTL ? { marginLeft: 6 } : { marginRight: 6 }} />
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
              {t('verified_info', 'Informations Vérifiées')}
            </Text>
          </View>

          <View style={[styles.cardContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {/* Nom */}
            <View style={[styles.fieldRow, { borderColor: colors.border }, isRTL && styles.fieldRowRTL]}>
              <View style={[styles.fieldContent, { alignItems: isRTL ? 'flex-end' : 'flex-start', flex: 1 }]}>
                <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>{t('first_name', 'Nom')}</Text>
                {isVerified ? (
                  <Text style={[styles.fieldTextDisabled, { color: colors.textSecondary }]}>{firstName || 'Khalid'}</Text>
                ) : (
                  <TextInput
                    style={[styles.fieldInput, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left', width: '100%', marginTop: 2 }]}
                    value={firstName === 'New' ? '' : firstName}
                    onChangeText={setFirstName}
                    placeholder={t('first_name_placeholder', 'Saisir le prénom')}
                    placeholderTextColor={colors.textMuted}
                  />
                )}
              </View>
            </View>

            {/* Nom de famille */}
            <View style={[styles.fieldRow, { borderColor: colors.border }, isRTL && styles.fieldRowRTL]}>
              <View style={[styles.fieldContent, { alignItems: isRTL ? 'flex-end' : 'flex-start', flex: 1 }]}>
                <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>{t('last_name', 'Nom de famille')}</Text>
                {isVerified ? (
                  <Text style={[styles.fieldTextDisabled, { color: colors.textSecondary }]}>{lastName || 'Bouchater'}</Text>
                ) : (
                  <TextInput
                    style={[styles.fieldInput, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left', width: '100%', marginTop: 2 }]}
                    value={lastName === 'User' ? '' : lastName}
                    onChangeText={setLastName}
                    placeholder={t('last_name_placeholder', 'Saisir le nom de famille')}
                    placeholderTextColor={colors.textMuted}
                  />
                )}
              </View>
            </View>

            {/* Numéro de téléphone */}
            <View style={[styles.fieldRow, { borderBottomWidth: 0 }]}>
              <View style={[styles.fieldContent, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>{t('phone_label', 'Numéro de téléphone')}</Text>
                <Text style={[styles.fieldTextDisabled, { color: colors.textSecondary }]}>{formatPhone(phone) || '21********85'}</Text>
              </View>
            </View>
          </View>

          {/* Group 2: Editable fields */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
              {t('editable_info', 'Informations Modifiables')}
            </Text>
          </View>

          <View style={[styles.cardContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {/* Email field */}
            <View style={[styles.fieldRow, { borderColor: colors.border }, isRTL && styles.fieldRowRTL]}>
              <Mail size={16} color={colors.textMuted} style={isRTL ? { marginLeft: 12 } : { marginRight: 12 }} />
              <View style={[styles.fieldContent, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>{t('email_label', 'E-mail')}</Text>
                <TextInput
                  style={[styles.fieldInput, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="mail@xyz.com"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>

            {/* Ville field */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.fieldRow, { borderBottomWidth: 0 }, isRTL && styles.fieldRowRTL]}
              onPress={() => setShowCityModal(true)}
            >
              <MapPin size={16} color={colors.textMuted} style={isRTL ? { marginLeft: 12 } : { marginRight: 12 }} />
              <View style={[styles.fieldContent, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>{t('city_label', 'Ville')}</Text>
                <Text style={[styles.fieldText, { color: colors.textPrimary }]}>{city || 'Marrakech'}</Text>
              </View>
              <RowChevron size={16} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Info verified alert row */}
          <View style={[styles.infoCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }, isRTL && styles.infoCardRTL]}>
            <Info size={18} color={colors.neutral} style={isRTL ? { marginLeft: 10 } : { marginRight: 10 }} />
            <Text style={[styles.infoCardText, { color: colors.textSecondary }]}>
              {t('info_verified_support')}
            </Text>
          </View>
        </ScrollView>

        {/* Indigo Save Changes Button at the bottom */}
        <View style={[styles.footerContainer, { backgroundColor: colors.bg }]}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.btnSave, { backgroundColor: colors.primary }]}
            onPress={handleSaveChanges}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.btnSaveText}>{t('save_btn')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Modern City Option Picker */}
      <Modal
        visible={showCityModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCityModal(false)}
      >
        <View style={styles.modalBg}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHeader, { borderColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>{t('city_label')}</Text>
              <TouchableOpacity onPress={() => setShowCityModal(false)}>
                <X size={22} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {CITIES.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.modalItem, city === c && { backgroundColor: colors.primaryGlow }, { borderColor: colors.border }]}
                  onPress={() => {
                    setCity(c);
                    setShowCityModal(false);
                  }}
                >
                  <Text style={[styles.modalItemText, city === c ? { color: colors.primary, fontWeight: '700' } : { color: colors.textPrimary }]}>
                    {c}
                  </Text>
                  {city === c && <Check size={16} color={colors.primary} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Fullscreen Direct Camera Modal View (prevents gallery selector) */}
      <Modal
        visible={showCameraView}
        transparent={false}
        animationType="slide"
        onRequestClose={() => {
          setTempCaptureUri(null);
          setShowCameraView(false);
        }}
      >
        <View style={styles.cameraContainer}>
          {tempCaptureUri ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: 'file://' + tempCaptureUri }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
              
              {/* Instructions on preview (confirm view details) */}
              <View style={styles.previewHeader}>
                <Text style={styles.previewTitle}>
                  {t('preview_photo_title', 'Aperçu du Selfie')}
                </Text>
              </View>

              {/* Action buttons at bottom */}
              <View style={styles.previewBtnContainer}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={[styles.previewBtn, styles.btnRetake]}
                  onPress={() => setTempCaptureUri(null)}
                >
                  <Text style={styles.previewBtnTextRetake}>
                    {t('retake_photo_btn', '🔄 Réessayer')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  style={[styles.previewBtn, styles.btnConfirm]}
                  onPress={handleConfirmCapturedPhoto}
                  disabled={uploading}
                >
                  {uploading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.previewBtnTextConfirm}>
                      {t('use_photo_btn', '✅ Utiliser')}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              {device != null ? (
                <Camera
                  ref={cameraRef}
                  style={StyleSheet.absoluteFillObject}
                  device={device}
                  isActive={showCameraView}
                  photo={true}
                />
              ) : (
                <View style={styles.cameraError}>
                  <ActivityIndicator size="large" color="#FFFFFF" style={{ marginBottom: 12 }} />
                  <Text style={{ color: '#FFFFFF', textAlign: 'center' }}>
                    Camera hardware loading or not available...
                  </Text>
                </View>
              )}

              {/* Face Guide Mask Overlay */}
              <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
                {/* Top mask block */}
                <View style={[styles.maskBlock, styles.maskTop]}>
                  <View style={styles.instructionsContainer}>
                    <Text style={styles.instructionsText}>
                      {t('face_guide_instruction', 'ضع وجهك بالكامل داخل الإطار')}
                    </Text>
                    <Text style={styles.instructionsSubText}>
                      {t('face_guide_sub_instruction', 'تأكد من أن الوجه واضح والإضاءة جيدة')}
                    </Text>
                  </View>
                </View>
                
                {/* Middle row containing cutout */}
                <View style={styles.maskMiddleRow}>
                  <View style={[styles.maskBlock, styles.maskSide]} />
                  {/* Visual oval outline */}
                  <View style={[styles.maskCutout, { borderColor: colors.primary }]} />
                  <View style={[styles.maskBlock, styles.maskSide]} />
                </View>

                {/* Bottom mask block */}
                <View style={[styles.maskBlock, styles.maskBottom]} />
              </View>

              {/* Close trigger overlay at top-left */}
              <TouchableOpacity
                style={styles.cameraCloseBtn}
                onPress={() => setShowCameraView(false)}
              >
                <X size={24} color="#FFFFFF" />
              </TouchableOpacity>

              {/* Flip camera control at top-right */}
              <TouchableOpacity
                style={styles.cameraFlipBtn}
                onPress={() => setCameraType(prev => prev === 'front' ? 'back' : 'front')}
              >
                <RefreshCw size={20} color="#FFFFFF" />
              </TouchableOpacity>

              {/* Shutter button wrapper */}
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
    paddingTop: 8,
    paddingBottom: 32,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  avatarWrapper: {
    width: 96,
    height: 96,
    position: 'relative',
  },
  avatarGlowCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 48,
    borderWidth: 2.5,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 48,
  },
  uploadScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 48,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0f172a',
  },
  reviewBadge: {
    borderWidth: 1,
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginTop: 10,
  },
  reviewBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
    marginTop: 20,
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
    height: 380,
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
  // Camera full screen styles
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  cameraError: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
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
  // Face guide overlays styling
  maskBlock: {
    backgroundColor: 'rgba(15,23,42,0.65)',
  },
  maskTop: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 24,
  },
  maskMiddleRow: {
    height: 320,
    flexDirection: 'row',
  },
  maskSide: {
    flex: 1,
  },
  maskCutout: {
    width: 240,
    height: 320,
    borderRadius: 120,
    borderWidth: 3.5,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
  },
  maskBottom: {
    flex: 1.6,
  },
  instructionsContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  instructionsText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  instructionsSubText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12.5,
    fontWeight: '500',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
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
  btnRetake: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  btnConfirm: {
    backgroundColor: '#6366F1', // Premium Indigo
  },
  previewBtnTextRetake: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  previewBtnTextConfirm: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
