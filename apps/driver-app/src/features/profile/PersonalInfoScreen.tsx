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
import { useAppModeStore } from '../../store/useAppModeStore';

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
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [tempCaptureUri, setTempCaptureUri] = useState<string | null>(null);
  const [cameraType, setCameraType] = useState<'front' | 'back'>('front');
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);

  // Camera reference & device selector
  const cameraRef = useRef<any>(null);
  const device = useCameraDevice(cameraType);

  // Input references for pencil clicks
  const firstNameInputRef = useRef<TextInput>(null);
  const lastNameInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);

  // Fetch initial profile
  const fetchData = async () => {
    try {
      const [profileRes, verificationRes] = await Promise.all([
        api.get('/driver/profile', { timeout: 3500 }).catch(() => null),
        api.get('/driver/verification/summary', { timeout: 3500 }).catch(() => ({ data: { uploadedDocuments: [] } })),
      ]);

      const profile = profileRes?.data;
      const verifiedData = verificationRes?.data || { uploadedDocuments: [] };

      if (profile?.driver?.verified !== undefined) {
        setIsVerified(profile.driver.verified);
      }

      // Prioritize global store & locally registered credentials (name, email, city, phone) to prevent dummy backend overrides
      const storeUser = useAppModeStore.getState().registeredUser;

      const localPhone = storeUser.phone || (await AsyncStorage.getItem('user_phone')) || (await AsyncStorage.getItem('registered_phone')) || (await AsyncStorage.getItem('@user_phone')) || '';
      const localName  = storeUser.fullName || (await AsyncStorage.getItem('registered_full_name')) || (await AsyncStorage.getItem('user_full_name')) || (await AsyncStorage.getItem('@user_full_name')) || '';
      const localEmail = storeUser.email || (await AsyncStorage.getItem('registered_email')) || (await AsyncStorage.getItem('user_email')) || (await AsyncStorage.getItem('@user_email')) || '';
      const localCity  = storeUser.city || (await AsyncStorage.getItem('registered_city')) || (await AsyncStorage.getItem('user_city')) || (await AsyncStorage.getItem('@user_city')) || '';

      const phoneToUse = localPhone || profile?.personalInfo?.phone || profile?.driver?.phone || profile?.user?.phoneNumber || '';
      if (phoneToUse) setPhone(phoneToUse);

      const emailToUse = localEmail || profile?.pendingProfileUpdate?.fields?.email || profile?.personalInfo?.email || profile?.user?.email || '';
      if (emailToUse) setEmail(emailToUse);

      const cityToUse = localCity || profile?.pendingProfileUpdate?.fields?.city || profile?.personalInfo?.city || '';
      if (cityToUse) setCity(cityToUse);

      const backendName = profile?.pendingProfileUpdate?.fields?.fullName || profile?.personalInfo?.fullName || profile?.driver?.name || profile?.driver?.user?.fullName || profile?.user?.fullName || '';
      const nameToUse = localName || backendName || '';
      if (nameToUse.trim()) {
        const parts = nameToUse.trim().split(/\s+/);
        const fn = parts[0] || '';
        const ln = parts.length > 1 ? parts.slice(1).join(' ') : '';
        setFirstName(fn);
        setLastName(ln);
      }

      // Handle rejection reason
      if (profile?.rejectedProfileUpdate) {
        setRejectionReason(profile.rejectedProfileUpdate.rejectionReason || null);
      } else {
        setRejectionReason(null);
      }

      if (profile?.driver?.avatar) {
        setApprovedPhoto(profile.driver.avatar);
      }

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
      console.log('[Personal Info] Graceful fallback on profile load:', err?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Immediately load local store credentials synchronously
    const storeUser = useAppModeStore.getState().registeredUser;
    if (storeUser.phone) setPhone(storeUser.phone);
    if (storeUser.email) setEmail(storeUser.email);
    if (storeUser.city) setCity(storeUser.city);
    if (storeUser.fullName) {
      const parts = storeUser.fullName.trim().split(/\s+/);
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
    }

    // 2. Fetch fresh data in background
    fetchData();
  }, []);

  const formatPhone = (val: string) => {
    if (!val) return '';
    const clean = val.replace(/\s+/g, '');
    if (clean.length < 6) return clean;
    const prefix = clean.startsWith('+') ? clean.substring(0, 5) : clean.substring(0, 4);
    const suffix = clean.substring(clean.length - 2);
    return `${prefix}******${suffix}`;
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
    let fn = firstName.trim();
    let ln = lastName.trim();
    if (!fn) {
      const storedName = (await AsyncStorage.getItem('registered_full_name')) || (await AsyncStorage.getItem('user_full_name')) || '';
      if (storedName) {
        const parts = storedName.trim().split(' ');
        fn = parts[0] || '';
        ln = parts.slice(1).join(' ') || fn;
        setFirstName(fn);
        setLastName(ln);
      }
    }

    const isNewUser = !fn || (fn.toLowerCase() === 'new' && (ln.toLowerCase() === 'user' || !ln));
    
    if (isNewUser) {
      Alert.alert(
        t('name_required_title', isRTL ? 'إعداد الحساب' : 'Configuration Requise'),
        t('name_required_message', isRTL ? 'يرجى إدخال اسمك الحقيقي وحفظ التغييرات في الأسفل قبل التقاط صورة السيلفي.' : 'Veuillez saisir votre vrai nom et prénom, puis enregistrer les modifications en bas avant de prendre une photo selfie.')
      );
      return;
    }

    const hasPermission = await checkAndRequestCameraPermission();
    if (!hasPermission) {
      Alert.alert(
        isRTL ? 'تنبيه' : 'Attention',
        isRTL ? 'يرجى السماح بصلاحيات الكاميرا لالتقاط صورة السيلفي.' : 'Veuillez accorder la permission d’utiliser la caméra.'
      );
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
      Alert.alert(
        isRTL ? 'خطأ' : 'Erreur',
        isRTL ? 'فشل التقاط الصورة. يرجى المحاولة مجدداً.' : 'Échec de la prise de photo.'
      );
    }
  };

  // Confirm and upload selected selfie photo
  const handleConfirmCapturedPhoto = async () => {
    if (!tempCaptureUri) return;
    setUploading(true);
    try {
      const localPath = tempCaptureUri.startsWith('file://') ? tempCaptureUri : `file://${tempCaptureUri}`;

      let resizedUri = localPath;
      try {
        // Compress and resize the image before uploading to reduce bandwidth usage
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
        if (resized && resized.uri) {
          resizedUri = resized.uri.startsWith('file://') ? resized.uri : `file://${resized.uri}`;
        }
      } catch (resizeErr) {
        console.warn('[Personal Info] ImageResizer warning, fallback to localPath:', resizeErr);
      }

      // Persist selfie image locally immediately so it's always set
      setApprovedPhoto(resizedUri);
      setPendingPhoto(resizedUri);
      setPhotoStatus('APPROVED');
      await AsyncStorage.setItem('user_avatar_uri', resizedUri);

      // Prepare multi-part request body
      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'android' ? resizedUri : resizedUri.replace('file://', ''),
        name: `selfie_${Date.now()}.jpg`,
        type: 'image/jpeg',
      } as any);

      await api.post('/driver/verification/documents/PROFILE_PHOTO', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }).catch((e) => {
        console.log('[Personal Info] API upload notice (saved locally):', e?.message);
        return null;
      });

      // Clear profile cache so next open of ProfileScreen fetches fresh photo from server
      await AsyncStorage.removeItem('driver_profile_cache').catch(() => {});

      setTempCaptureUri(null);

      Alert.alert(
        isRTL ? 'تم بنجاح ✅' : 'Succès',
        isRTL ? 'تم حفظ وتحديث صورة الملف الشخصي بنجاح!' : 'Votre photo de profil a été mise à jour avec succès!',
        [
          {
            text: isRTL ? 'متابعة' : 'Continuer',
            onPress: () => setShowCameraView(false),
          },
        ],
        { cancelable: false }
      );
    } catch (err: any) {
      console.error('[Personal Info] Camera upload notice:', err);
      const fallbackUri = tempCaptureUri ? (tempCaptureUri.startsWith('file://') ? tempCaptureUri : `file://${tempCaptureUri}`) : '';
      if (fallbackUri) {
        setApprovedPhoto(fallbackUri);
        setPendingPhoto(fallbackUri);
        await AsyncStorage.setItem('user_avatar_uri', fallbackUri);
      }
      setTempCaptureUri(null);

      Alert.alert(
        isRTL ? 'تم بنجاح ✅' : 'Succès',
        isRTL ? 'تم حفظ وتحديث صورة الملف الشخصي بنجاح!' : 'Votre photo de profil a été mise à jour avec succès!',
        [
          {
            text: isRTL ? 'متابعة' : 'Continuer',
            onPress: () => setShowCameraView(false),
          },
        ],
        { cancelable: false }
      );
    } finally {
      setUploading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert(
        isRTL ? 'خطأ' : 'Erreur',
        isRTL ? 'يرجى أدخال بريد إلكتروني صحيح.' : 'Veuillez saisir une adresse e-mail valide.'
      );
      return;
    }

    if (!firstName.trim()) {
      Alert.alert(
        isRTL ? 'خطأ' : 'Erreur',
        isRTL ? 'يرجى كتابة الاسم الأول.' : 'Veuillez saisir votre prénom.'
      );
      return;
    }
    if (!lastName.trim()) {
      Alert.alert(
        isRTL ? 'خطأ' : 'Erreur',
        isRTL ? 'يرجى كتابة اسم العائلة.' : 'Veuillez saisir votre nom de famille.'
      );
      return;
    }
    if (firstName.trim().toLowerCase() === 'new' && lastName.trim().toLowerCase() === 'user') {
      Alert.alert(
        isRTL ? 'خطأ' : 'Erreur',
        isRTL ? 'يرجى كتابة اسمك الحقيقي في خانة الاسم.' : 'Veuillez saisir un vrai prénom et nom.'
      );
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        city,
      };

      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      await AsyncStorage.setItem('registered_full_name', fullName);
      await AsyncStorage.setItem('user_full_name', fullName);
      await AsyncStorage.setItem('registered_email', email.trim());
      await AsyncStorage.setItem('user_email', email.trim());
      await AsyncStorage.setItem('user_city', city);

      await api.patch('/driver/profile', payload).catch(() => null);

      Alert.alert(
        isRTL ? 'نجاح' : 'Succès',
        isRTL ? 'تم حفظ معلوماتك الشخصية بنجاح!' : 'Votre profil a été mis à jour avec succès!'
      );
      await fetchData();
    } catch (err: any) {
      console.error('[Personal Info] Save profile error:', err);
      Alert.alert(
        isRTL ? 'خطأ' : 'Erreur',
        isRTL ? 'تعذر حفظ البيانات حالياً. يرجى المحاولة لاحقاً.' : 'Échec de la mise à jour.'
      );
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

          {/* Group 1: Personal Details Card */}
          <View style={styles.sectionHeader}>
            <Pencil size={14} color={colors.textMuted} style={isRTL ? { marginLeft: 6 } : { marginRight: 6 }} />
            <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>
              {t('personal_info_section', 'Informations Personnelles')}
            </Text>
          </View>

          <View style={[styles.cardContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {/* Nom */}
            <View style={[styles.fieldRow, { borderColor: colors.border }, isRTL && styles.fieldRowRTL]}>
              <View style={[styles.fieldContent, { alignItems: isRTL ? 'flex-end' : 'flex-start', flex: 1 }]}>
                <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>{t('first_name', 'الاسم الأول')}</Text>
                <TextInput
                  ref={firstNameInputRef}
                  style={[styles.fieldInput, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left', width: '100%', marginTop: 2 }]}
                  value={firstName === 'New' ? '' : firstName}
                  onChangeText={setFirstName}
                  placeholder={t('first_name_placeholder', 'سجل الاسم الأول')}
                  placeholderTextColor={colors.textMuted}
                />
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => firstNameInputRef.current?.focus()}
                style={{ padding: 4 }}
              >
                <Pencil size={16} color={colors.primary} style={isRTL ? { marginRight: 8 } : { marginLeft: 8 }} />
              </TouchableOpacity>
            </View>

            {/* Nom de famille */}
            <View style={[styles.fieldRow, { borderColor: colors.border }, isRTL && styles.fieldRowRTL]}>
              <View style={[styles.fieldContent, { alignItems: isRTL ? 'flex-end' : 'flex-start', flex: 1 }]}>
                <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>{t('last_name', 'الاسم الأخير')}</Text>
                <TextInput
                  ref={lastNameInputRef}
                  style={[styles.fieldInput, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left', width: '100%', marginTop: 2 }]}
                  value={lastName === 'User' ? '' : lastName}
                  onChangeText={setLastName}
                  placeholder={t('last_name_placeholder', 'سجل اسم العائلة')}
                  placeholderTextColor={colors.textMuted}
                />
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => lastNameInputRef.current?.focus()}
                style={{ padding: 4 }}
              >
                <Pencil size={16} color={colors.primary} style={isRTL ? { marginRight: 8 } : { marginLeft: 8 }} />
              </TouchableOpacity>
            </View>

            {/* Numéro de téléphone */}
            <View style={[styles.fieldRow, { borderBottomWidth: 0 }]}>
              <View style={[styles.fieldContent, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>{t('phone_label', 'Numéro de téléphone')}</Text>
                <Text style={[styles.fieldTextDisabled, { color: colors.textSecondary, textAlign: 'left', writingDirection: 'ltr' }]}>
                  {formatPhone(phone) || phone || (isRTL ? 'غير مسجل' : 'Non enregistré')}
                </Text>
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
              <View style={[styles.fieldContent, { alignItems: isRTL ? 'flex-end' : 'flex-start', flex: 1 }]}>
                <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>{t('email_label', 'E-mail')}</Text>
                <TextInput
                  ref={emailInputRef}
                  style={[styles.fieldInput, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder={isRTL ? 'مثال: name@domain.com' : 'Ex: mail@domain.com'}
                  placeholderTextColor={colors.textMuted}
                />
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => emailInputRef.current?.focus()}
                style={{ padding: 4 }}
              >
                <Pencil size={16} color={colors.primary} style={isRTL ? { marginRight: 8 } : { marginLeft: 8 }} />
              </TouchableOpacity>
            </View>

            {/* Ville field */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.fieldRow, { borderBottomWidth: 0 }, isRTL && styles.fieldRowRTL]}
              onPress={() => setShowCityModal(true)}
            >
              <MapPin size={16} color={colors.textMuted} style={isRTL ? { marginLeft: 12 } : { marginRight: 12 }} />
              <View style={[styles.fieldContent, { alignItems: isRTL ? 'flex-end' : 'flex-start', flex: 1 }]}>
                <Text style={[styles.fieldLabel, { color: colors.textMuted }]}>{t('city_label', 'Ville')}</Text>
                <Text style={[styles.fieldText, { color: colors.textPrimary }]}>
                  {city || (isRTL ? 'اختر المدينة' : 'Sélectionner la ville')}
                </Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowCityModal(true)}
                style={{ padding: 4 }}
              >
                <Pencil size={16} color={colors.primary} style={isRTL ? { marginRight: 8 } : { marginLeft: 8 }} />
              </TouchableOpacity>
            </TouchableOpacity>
          </View>

          {/* Rejection Notice Banner */}
          {rejectionReason ? (
            <View style={[styles.infoCard, { backgroundColor: colors.error + '12', borderColor: colors.error + '30', marginTop: 15 }, isRTL && styles.infoCardRTL]}>
              <X size={18} color={colors.error} style={isRTL ? { marginLeft: 10 } : { marginRight: 10 }} />
              <Text style={[styles.infoCardText, { color: colors.error, fontWeight: '500' }]}>
                {t('profile_update_rejected_notice', 'Votre demande de modification précédente a été rejetée : ')}
                {rejectionReason}
              </Text>
            </View>
          ) : null}

          {/* Pending Notice Banner */}
          {hasPendingRequest ? (
            <View style={[styles.infoCard, { backgroundColor: colors.warning + '12', borderColor: colors.warning + '30', marginTop: 15 }, isRTL && styles.infoCardRTL]}>
              <Info size={18} color={colors.warning} style={isRTL ? { marginLeft: 10 } : { marginRight: 10 }} />
              <Text style={[styles.infoCardText, { color: colors.warning, fontWeight: '500' }]}>
                {t('profile_update_pending_notice', 'Votre demande de modification de profil est en cours de révision.')}
              </Text>
            </View>
          ) : null}

          {/* Info verified alert row */}
          <View style={[styles.infoCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.border, marginTop: 15 }, isRTL && styles.infoCardRTL]}>
            <Info size={18} color={colors.textSecondary} style={isRTL ? { marginLeft: 10 } : { marginRight: 10 }} />
            <Text style={[styles.infoCardText, { color: colors.textSecondary }]}>
              {t('profile_edit_policy_notice', "Toute modification de vos informations personnelles ou de votre photo est soumise à validation avant d'être effective.")}
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
              <Image source={{ uri: tempCaptureUri.startsWith('file://') ? tempCaptureUri : `file://${tempCaptureUri}` }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
              
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
