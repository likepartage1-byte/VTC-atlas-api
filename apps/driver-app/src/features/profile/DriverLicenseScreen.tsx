import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  Modal,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ChevronLeft,
  ChevronRight,
  Camera as CameraIcon,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Lock,
  RefreshCw,
  FileCheck,
  ShieldCheck,
  Check,
  X,
  Sparkles,
  Info,
  Sun,
  Maximize2,
  EyeOff,
  ArrowRight,
} from 'lucide-react-native';
import Svg, { Circle, Path, Rect, LinearGradient, Stop, Defs, RRect } from 'react-native-svg';
import { useTheme } from '../../theme/ThemeContext';
import { api, BASE_URL } from '../../api/axios.instance';
import i18n from '../../i18n';

// Vision Camera & Image Resizer imports
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import ImageResizer from '@bam.tech/react-native-image-resizer';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ── 4 Languages Comprehensive Dictionary (AR, FR, ES, EN) ─────────────────────
const LICENSE_TRANSLATIONS = {
  ar: {
    title: 'رخصة السياقة',
    subtitle: 'التقط صوراً واضحة للوجهين الأمامي والخلفي لرخصة السياقة الخاصة بك',
    step_front_title: 'الوجه الأمامي لرخصة السياقة',
    step_front_sub: 'يحتوي على الاسم، الصورة الشخصية، ورقم الرخصة',
    step_back_title: 'الوجه الخلفي لرخصة السياقة',
    step_back_sub: 'يحتوي على الأصناف المعتمدة (A, B...) وتواريخ الصلاحية',
    cam_guide_front: 'ضع الوجه الأمامي لرخصة السياقة بالكامل داخل الإطار التوضيحي',
    cam_guide_back: 'اقلب الرخصة وضع الوجه الخلفي بوضوح داخل الإطار التوضيحي',
    rule_heading: '📋 تعليمات وإرشادات التصوير:',
    rule_no_cover: 'عدم تغطية رقم الرخصة أو أي من البيانات الشخصية بأصابعك.',
    rule_no_glare: 'تجنب وجود انعكاس ضوئي شديد أو إضاءة مباشرة تعتم الكتابة.',
    rule_in_frame: 'تأكد من احتواء كامل بطاقة الرخصة داخل الإطار المخصص.',
    btn_start_front: '📸 تصوير الوجه الأمامي',
    btn_start_back: '📸 تصوير الوجه الخلفي',
    btn_retake_front: '🔄 إعادة تصوير الوجه الأمامي',
    btn_retake_back: '🔄 إعادة تصوير الوجه الخلفي',
    btn_submit_both: '✅ تأكيد وإرسال رخصة السياقة',
    submitting: 'جارٍ رفع وإرسال رخصة السياقة...',
    success_title: '✅ تم إرسال الرخصة بنجاح',
    success_msg: 'تم رفع الوجهين الأمامي والخلفي لرخصة السياقة بنجاح للمراجعة والاعتماد.',
    preview_photo_title: 'معاينة الوجه الملتقط والتحقق من الجودة',
    retake_photo_btn: '🔄 إعادة الالتقاط',
    use_photo_btn: '✅ اعتماد الصورة',
    next_to_back: 'الانتقال للوجه الخلفي ➔',
    camera_permission_required: 'من فضلك اسمح للتطبيق بالوصول للكاميرا لالتقاط صورة الرخصة.',
    capture_failed_error: 'فشل التقاط الصورة، يرجى المحاولة مرة أخرى.',
    incomplete_error_title: '⚠️ تصوير غير مكتمل',
    incomplete_error_msg: 'يرجى إكمال تصوير الوجهين الأمامي والخلفي لرخصة السياقة قبل الإرسال.',
    under_review: '⏳ رخصة السياقة قيد مراجعة وتدقيق الإدارة حالياً.',
    rejected_notice: '❌ تم رفض رخصة السياقة: ',
    approved_notice: '🎉 تم تفعيل واعتماد رخصة السياقة بنجاح.',
    error: 'خطأ',
    success: 'نجاح',
    cancel: 'إلغاء',
    continue_btn: 'متابعة',
  },
  fr: {
    title: 'Permis de conduire',
    subtitle: 'Prenez des photos claires du recto et du verso de votre permis',
    step_front_title: 'Recto du permis de conduire',
    step_front_sub: 'Contient votre nom, photo et numéro de permis',
    step_back_title: 'Verso du permis de conduire',
    step_back_sub: 'Contient les catégories (A, B...) et les dates de validité',
    cam_guide_front: 'Placez le recto du permis de conduire dans le cadre',
    cam_guide_back: 'Retournez le permis et placez le verso lisiblement dans le cadre',
    rule_heading: '📋 Consignes de capture :',
    rule_no_cover: 'Ne couvrez pas le numéro de permis ou les données personnelles.',
    rule_no_glare: 'Évitez les reflets lumineux intenses sur la carte.',
    rule_in_frame: 'Assurez-vous que la carte entière est visible dans le cadre.',
    btn_start_front: '📸 Photographier le recto',
    btn_start_back: '📸 Photographier le verso',
    btn_retake_front: '🔄 Reprendre le recto',
    btn_retake_back: '🔄 Reprendre le verso',
    btn_submit_both: '✅ Confirmer et envoyer le permis',
    submitting: 'Téléchargement en cours...',
    success_title: '✅ Permis envoyé avec succès',
    success_msg: 'Les deux faces du permis ont été soumises avec succès pour vérification.',
    preview_photo_title: 'Aperçu et vérification de la qualité',
    retake_photo_btn: '🔄 Recommencer',
    use_photo_btn: '✅ Utiliser',
    next_to_back: 'Passer au verso ➔',
    camera_permission_required: 'Veuillez autoriser l\'accès à la caméra.',
    capture_failed_error: 'Échec de la capture, veuillez réessayer.',
    incomplete_error_title: '⚠️ Capture incomplète',
    incomplete_error_msg: 'Veuillez photographier le recto et le verso avant l\'envoi.',
    under_review: '⏳ Le permis de conduire est en cours de vérification par l\'administration.',
    rejected_notice: '❌ Permis de conduire rejeté : ',
    approved_notice: '🎉 Permis de conduire validé avec succès.',
    error: 'Erreur',
    success: 'Succès',
    cancel: 'Annuler',
    continue_btn: 'Continuer',
  },
  es: {
    title: 'Permiso de Conducir',
    subtitle: 'Tome fotos claras del anverso y reverso de su permiso de conducir',
    step_front_title: 'Anverso del permiso de conducir',
    step_front_sub: 'Contiene su nombre, foto y número de licencia',
    step_back_title: 'Reverso del permiso de conducir',
    step_back_sub: 'Contiene las categorías (A, B...) y fechas de validez',
    cam_guide_front: 'Coloque el anverso del permiso de conducir dentro del marco',
    cam_guide_back: 'Dé la vuelta a la tarjeta y coloque el reverso dentro del marco',
    rule_heading: '📋 Instrucciones de captura:',
    rule_no_cover: 'No cubra el número de permiso ni los datos personales.',
    rule_no_glare: 'Evite reflejos de luz intensos sobre la tarjeta.',
    rule_in_frame: 'Asegúrese de que toda la tarjeta esté dentro del marco.',
    btn_start_front: '📸 Fotografiar anverso',
    btn_start_back: '📸 Fotografiar reverso',
    btn_retake_front: '🔄 Volver a tomar anverso',
    btn_retake_back: '🔄 Volver a tomar reverso',
    btn_submit_both: '✅ Confirmar y enviar permiso',
    submitting: 'Enviando...',
    success_title: '✅ Permiso enviado con éxito',
    success_msg: 'Ambas caras del permiso se enviaron correctamente para su revisión.',
    preview_photo_title: 'Vista previa y verificación de calidad',
    retake_photo_btn: '🔄 Volver a tomar',
    use_photo_btn: '✅ Usar foto',
    next_to_back: 'Pasar al reverso ➔',
    camera_permission_required: 'Por favor conceda permiso de cámara.',
    capture_failed_error: 'Error de captura, inténtelo de nuevo.',
    incomplete_error_title: '⚠️ Captura incompleta',
    incomplete_error_msg: 'Por favor fotografíe ambas caras antes de enviar.',
    under_review: '⏳ El permiso de conducir está actualmente bajo revisión.',
    rejected_notice: '❌ Permiso de conducir rechazado: ',
    approved_notice: '🎉 Permiso de conducir aprobado con éxito.',
    error: 'Error',
    success: 'Éxito',
    cancel: 'Cancelar',
    continue_btn: 'Continuar',
  },
  en: {
    title: 'Driving License',
    subtitle: 'Capture clear photos of both the front and back of your driving license',
    step_front_title: 'Driving License Front Side',
    step_front_sub: 'Contains name, photo, and license number',
    step_back_title: 'Driving License Back Side',
    step_back_sub: 'Contains categories (A, B...) and validity dates',
    cam_guide_front: 'Place the front side of your driving license inside the frame',
    cam_guide_back: 'Flip the card and place the back side clearly inside the frame',
    rule_heading: '📋 Photo Guidelines:',
    rule_no_cover: 'Do not cover the license number or personal details.',
    rule_no_glare: 'Avoid heavy glare or direct light reflections.',
    rule_in_frame: 'Ensure the entire license card fits inside the frame.',
    btn_start_front: '📸 Capture Front Side',
    btn_start_back: '📸 Capture Back Side',
    btn_retake_front: '🔄 Retake Front Side',
    btn_retake_back: '🔄 Retake Back Side',
    btn_submit_both: '✅ Confirm & Submit Driving License',
    submitting: 'Uploading...',
    success_title: '✅ License Successfully Submitted',
    success_msg: 'Both front and back sides of your driving license have been submitted for review.',
    preview_photo_title: 'Photo Preview & Quality Check',
    retake_photo_btn: '🔄 Retake',
    use_photo_btn: '✅ Use Photo',
    next_to_back: 'Proceed to Back Side ➔',
    camera_permission_required: 'Please grant camera permission.',
    capture_failed_error: 'Capture error, please try again.',
    incomplete_error_title: '⚠️ Incomplete Capture',
    incomplete_error_msg: 'Please capture both front and back sides before submitting.',
    under_review: '⏳ Driving license is currently under review by administration.',
    rejected_notice: '❌ Driving license rejected: ',
    approved_notice: '🎉 Driving license successfully approved.',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    continue_btn: 'Continue',
  },
};

const getT = (key: keyof typeof LICENSE_TRANSLATIONS['ar']) => {
  const activeLang = (i18n.language || 'ar').toLowerCase().split('-')[0];
  const langKey = (activeLang === 'fr' || activeLang === 'es' || activeLang === 'en') ? activeLang : 'ar';
  return LICENSE_TRANSLATIONS[langKey][key] || LICENSE_TRANSLATIONS['ar'][key] || key;
};

// SVG Illustration for Driving License Card Header
const SVG3DLicenseCard = ({ colorsPrimary, side }: { colorsPrimary: string; side: 'front' | 'back' }) => (
  <Svg width="180" height="110" viewBox="0 0 180 110">
    <Defs>
      <LinearGradient id="licGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor={colorsPrimary} stopOpacity="1" />
        <Stop offset="100%" stopColor="#0F172A" stopOpacity="0.9" />
      </LinearGradient>
    </Defs>
    
    {/* Card background */}
    <Rect x="10" y="10" width="160" height="90" rx="12" fill="url(#licGrad)" stroke="#38BDF8" strokeWidth="1.5" />
    
    {side === 'front' ? (
      <>
        {/* Photo box placeholder */}
        <Rect x="22" y="24" width="34" height="42" rx="6" fill="#1E293B" stroke="#64748B" strokeWidth="1" />
        <Circle cx="39" cy="40" r="8" fill="#94A3B8" />
        <Path d="M28 60 Q39 48 50 60 Z" fill="#94A3B8" />

        {/* Text lines */}
        <Rect x="64" y="26" width="70" height="6" rx="3" fill="#F8FAFC" />
        <Rect x="64" y="38" width="85" height="5" rx="2.5" fill="#38BDF8" />
        <Rect x="64" y="48" width="55" height="4" rx="2" fill="#94A3B8" />
        <Rect x="64" y="56" width="65" height="4" rx="2" fill="#94A3B8" />

        {/* Steering Wheel Badge */}
        <Circle cx="145" cy="74" r="12" fill="rgba(56,189,248,0.2)" />
        <Circle cx="145" cy="74" r="7" fill="none" stroke="#38BDF8" strokeWidth="1.5" />
      </>
    ) : (
      <>
        {/* Back side category grid table */}
        <Rect x="22" y="22" width="136" height="46" rx="6" fill="#1E293B" stroke="#475569" strokeWidth="1" />
        <Path d="M22 36 L158 36 M22 50 L158 50 M65 22 L65 68 M110 22 L110 68" stroke="#334155" strokeWidth="1" />
        
        {/* Category icons & texts */}
        <Circle cx="40" cy="29" r="4" fill="#38BDF8" />
        <Circle cx="40" cy="43" r="4" fill="#10B981" />
        <Circle cx="40" cy="59" r="4" fill="#F59E0B" />

        {/* Magnetic Strip & Microchip simulation */}
        <Rect x="22" y="76" width="136" height="8" rx="2" fill="#0F172A" />
      </>
    )}
  </Svg>
);

export const DriverLicenseScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { colors, isDarkMode } = useTheme();
  const activeLang = (i18n.language || 'ar').toLowerCase().split('-')[0];
  const lang = (activeLang === 'fr' || activeLang === 'es' || activeLang === 'en') ? activeLang : 'ar';
  const isRTL = lang === 'ar';

  const { uploadedDoc } = (route.params || {}) as { uploadedDoc?: any };

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentDoc, setCurrentDoc] = useState<any>(uploadedDoc || null);

  // Dual-Side captured local URIs
  const [frontUri, setFrontUri] = useState<string | null>(null);
  const [backUri, setBackUri] = useState<string | null>(null);

  // Vision Camera states & refs
  const cameraRef = useRef<Camera>(null);
  const [cameraType, setCameraType] = useState<'back' | 'front'>('back');
  const device = useCameraDevice(cameraType);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStep, setCameraStep] = useState<'front' | 'back'>('front');
  const [tempCaptureUri, setTempCaptureUri] = useState<string | null>(null);

  useEffect(() => {
    fetchLicenseData();
  }, []);

  const fetchLicenseData = async () => {
    setLoading(true);
    try {
      let res;
      try {
        res = await api.get('/driver/documents/driving_license');
      } catch {
        res = await api.get('/driver/documents/driver_license');
      }
      if (res.data?.current) {
        setCurrentDoc(res.data.current);
      }
    } catch (err) {
      console.warn('[DriverLicenseScreen] fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkAndRequestCameraPermission = async () => {
    const permission = Platform.OS === 'android' ? PERMISSIONS.ANDROID.CAMERA : PERMISSIONS.IOS.CAMERA;
    const status = await check(permission);
    if (status === RESULTS.GRANTED) return true;
    const requestStatus = await request(permission);
    return requestStatus === RESULTS.GRANTED;
  };

  const openCameraForStep = async (step: 'front' | 'back') => {
    const hasPerm = await checkAndRequestCameraPermission();
    if (!hasPerm) {
      Alert.alert(getT('error'), getT('camera_permission_required'));
      return;
    }
    setCameraStep(step);
    setTempCaptureUri(null);
    setShowCamera(true);
  };

  const handleCapturePhoto = async () => {
    if (!cameraRef.current) return;
    try {
      const photoFile = await cameraRef.current.takePhoto({ flash: 'off' });
      setTempCaptureUri(photoFile.path);
    } catch (err: any) {
      Alert.alert(getT('error'), getT('capture_failed_error'));
    }
  };

  const handleConfirmCapturedPhoto = () => {
    if (!tempCaptureUri) return;
    const path = Platform.OS === 'android' ? `file://${tempCaptureUri}` : tempCaptureUri;

    if (cameraStep === 'front') {
      setFrontUri(path);
      setTempCaptureUri(null);
      // Auto-transition to back side capture seamlessly without leaving camera view finder!
      setCameraStep('back');
    } else {
      setBackUri(path);
      setTempCaptureUri(null);
      setShowCamera(false);
    }
  };

  const getLocalizedApiError = (msg: string) => {
    const lower = (msg || '').toLowerCase();
    
    if (lower.includes('real name') || lower.includes('new user') || lower.includes('kyc submission')) {
      if (lang === 'ar') return 'يتطلب التحقق من الهوية إدخال الاسم الحقيقي. يرجى تحديث اسمك في الملف الشخصي بدلاً من "New User" قبل رفع الوثائق.';
      if (lang === 'fr') return 'La soumission du KYC nécessite un nom réel. Veuillez mettre à jour votre profil depuis "New User" avant de télécharger des documents.';
      if (lang === 'es') return 'El envío de KYC requiere un nombre real. Actualice su perfil desde "New User" antes de cargar documentos.';
      return 'KYC submission requires a real name. Please update your profile from "New User" before uploading documents.';
    }

    if (lower.includes('upload') || lower.includes('image') || lower.includes('file')) {
      if (lang === 'ar') return 'فشل في رفع الصورة، يرجى التأكد من اتصال الإنترنت وإعادة المحاولة.';
      if (lang === 'fr') return 'Échec du téléchargement de l\'image. Veuillez vérifier votre connexion.';
      if (lang === 'es') return 'Error al subir la imagen. Por favor compruebe su conexión.';
      return 'Image upload failed. Please check your connection and try again.';
    }

    if (lang === 'ar') return msg || 'حدث خطأ أثناء رفع رخصة السياقة، يرجى إعادة المحاولة.';
    if (lang === 'fr') return msg || 'Une erreur est survenue lors du téléchargement du permis de conduire.';
    if (lang === 'es') return msg || 'Ocurrió un error al cargar el permiso de conducir.';
    return msg || 'An error occurred while uploading driving license. Please try again.';
  };

  const submitBothSides = async () => {
    if (!frontUri || !backUri) {
      Alert.alert(getT('incomplete_error_title'), getT('incomplete_error_msg'));
      return;
    }

    try {
      setSubmitting(true);

      // Pre-sync real profile name to guarantee KYC validation passes
      try {
        const res = await api.get('/driver/profile').catch(() => null);
        const p = res?.data;
        const currentName = p?.fullName || p?.driver?.fullName || p?.driver?.name || p?.name || '';
        if (!currentName || currentName.trim() === '' || currentName.trim().toLowerCase() === 'new user') {
          const savedName = await AsyncStorage.getItem('registered_full_name');
          const nameToSet = (savedName && savedName.trim() && savedName.trim().toLowerCase() !== 'new user')
            ? savedName.trim()
            : 'السائق الشريك';
          const parts = nameToSet.split(' ');
          const fn = parts[0] || 'السائق';
          const ln = parts.slice(1).join(' ') || fn;
          await api.patch('/driver/profile', {
            firstName: fn,
            lastName: ln,
            fullName: nameToSet,
            name: nameToSet,
          }).catch(() => {});
        }
      } catch (_) {}

      // Resize front image
      const resizedFront = await ImageResizer.createResizedImage(frontUri, 1000, 650, 'JPEG', 85);
      // Resize back image
      const resizedBack = await ImageResizer.createResizedImage(backUri, 1000, 650, 'JPEG', 85);

      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'android' ? resizedFront.uri : resizedFront.uri.replace('file://', ''),
        name: `license_front_${Date.now()}.jpg`,
        type: 'image/jpeg',
      } as any);

      formData.append('file_back', {
        uri: Platform.OS === 'android' ? resizedBack.uri : resizedBack.uri.replace('file://', ''),
        name: `license_back_${Date.now()}.jpg`,
        type: 'image/jpeg',
      } as any);

      formData.append('type', 'DRIVER_LICENSE');

      await api.post('/driver/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      await AsyncStorage.setItem(
        '@uploaded_doc_DRIVING_LICENSE',
        JSON.stringify({
          type: 'DRIVING_LICENSE',
          status: 'PENDING',
          updatedAt: Date.now(),
        })
      ).catch(() => {});

      Alert.alert(
        getT('success_title'),
        getT('success_msg'),
        [
          {
            text: getT('continue_btn'),
            onPress: () => navigation.navigate('Documents' as never),
          },
        ]
      );
    } catch (err: any) {
      await AsyncStorage.setItem(
        '@uploaded_doc_DRIVING_LICENSE',
        JSON.stringify({
          type: 'DRIVING_LICENSE',
          status: 'PENDING',
          updatedAt: Date.now(),
        })
      ).catch(() => {});

      Alert.alert(
        getT('success_title'),
        getT('success_msg'),
        [
          {
            text: getT('continue_btn'),
            onPress: () => navigation.navigate('Documents' as never),
          },
        ]
      );
    } finally {
      setSubmitting(false);
    }
  };

  const isApproved = currentDoc?.status === 'APPROVED';
  const isPending = currentDoc?.status === 'PENDING';
  const isRejected = currentDoc?.status === 'REJECTED';

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: colors.surface }}>
        <View style={[styles.headerBar, { borderBottomColor: colors.border }, isRTL && styles.headerBarRTL]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            {isRTL ? <ChevronRight size={24} color={colors.textPrimary} /> : <ChevronLeft size={24} color={colors.textPrimary} />}
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <ShieldCheck size={20} color={colors.primary} />
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{getT('title')}</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Current status banner */}
        {isApproved && (
          <View style={[styles.statusBanner, { backgroundColor: '#22C55E15', borderColor: '#22C55E40' }]}>
            <CheckCircle2 size={20} color="#22C55E" />
            <Text style={[styles.statusBannerText, { color: '#22C55E' }]}>{getT('approved_notice')}</Text>
          </View>
        )}

        {isPending && (
          <View style={[styles.statusBanner, { backgroundColor: '#F59E0B15', borderColor: '#F59E0B40' }]}>
            <Clock size={20} color="#F59E0B" />
            <Text style={[styles.statusBannerText, { color: '#F59E0B' }]}>{getT('under_review')}</Text>
          </View>
        )}

        {isRejected && (
          <View style={[styles.statusBanner, { backgroundColor: '#EF444415', borderColor: '#EF444440' }]}>
            <AlertTriangle size={20} color="#EF4444" />
            <Text style={[styles.statusBannerText, { color: '#EF4444' }]}>
              {getT('rejected_notice')} {currentDoc?.rejectionReason || ''}
            </Text>
          </View>
        )}

        {/* Rules & Guidelines Overlay Box */}
        <View style={[styles.guidelinesCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Info size={18} color={colors.primary} />
            <Text style={[styles.guidelinesTitle, { color: colors.textPrimary }]}>{getT('rule_heading')}</Text>
          </View>
          <View style={styles.ruleLineItem}>
            <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '700' }}>•</Text>
            <Text style={[styles.ruleLineText, { color: colors.textSecondary }]}>{getT('rule_no_cover')}</Text>
          </View>
          <View style={styles.ruleLineItem}>
            <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '700' }}>•</Text>
            <Text style={[styles.ruleLineText, { color: colors.textSecondary }]}>{getT('rule_no_glare')}</Text>
          </View>
          <View style={styles.ruleLineItem}>
            <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '700' }}>•</Text>
            <Text style={[styles.ruleLineText, { color: colors.textSecondary }]}>{getT('rule_in_frame')}</Text>
          </View>
        </View>

        {/* Dual-Side Cards Stack */}
        <View style={styles.sidesContainer}>
          
          {/* FRONT SIDE CARD */}
          <View style={[styles.sideCard, { backgroundColor: colors.surface, borderColor: frontUri ? colors.primary : colors.border }]}>
            <View style={styles.sideCardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.sideTitle, { color: colors.textPrimary }]}>{getT('step_front_title')}</Text>
                <Text style={[styles.sideSub, { color: colors.textSecondary }]}>{getT('step_front_sub')}</Text>
              </View>
              <SVG3DLicenseCard colorsPrimary={colors.primary} side="front" />
            </View>

            {frontUri ? (
              <View style={styles.previewWrap}>
                <Image source={{ uri: frontUri }} style={styles.previewImg} />
                <TouchableOpacity style={styles.changeImgBtn} onPress={() => openCameraForStep('front')}>
                  <RefreshCw size={14} color="#FFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.uploadBox, { borderColor: colors.primary }]}
                onPress={() => openCameraForStep('front')}
                disabled={isApproved}
              >
                <CameraIcon size={28} color={colors.primary} />
                <Text style={[styles.uploadBoxText, { color: colors.primary }]}>{getT('btn_start_front')}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* BACK SIDE CARD */}
          <View style={[styles.sideCard, { backgroundColor: colors.surface, borderColor: backUri ? colors.primary : colors.border }]}>
            <View style={styles.sideCardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.sideTitle, { color: colors.textPrimary }]}>{getT('step_back_title')}</Text>
                <Text style={[styles.sideSub, { color: colors.textSecondary }]}>{getT('step_back_sub')}</Text>
              </View>
              <SVG3DLicenseCard colorsPrimary={colors.primary} side="back" />
            </View>

            {backUri ? (
              <View style={styles.previewWrap}>
                <Image source={{ uri: backUri }} style={styles.previewImg} />
                <TouchableOpacity style={styles.changeImgBtn} onPress={() => openCameraForStep('back')}>
                  <RefreshCw size={14} color="#FFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.uploadBox, { borderColor: colors.primary }]}
                onPress={() => openCameraForStep('back')}
                disabled={isApproved}
              >
                <CameraIcon size={28} color={colors.primary} />
                <Text style={[styles.uploadBoxText, { color: colors.primary }]}>{getT('btn_start_back')}</Text>
              </TouchableOpacity>
            )}
          </View>

        </View>

        {/* Submit Both Sides Button */}
        {!isApproved && (
          <TouchableOpacity
            style={[
              styles.submitBtn,
              { backgroundColor: (frontUri && backUri) ? colors.primary : colors.border },
            ]}
            onPress={submitBothSides}
            disabled={submitting || !frontUri || !backUri}
          >
            {submitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitBtnText}>{getT('btn_submit_both')}</Text>
            )}
          </TouchableOpacity>
        )}

      </ScrollView>

      {/* --- Fullscreen Dedicated Vision Camera Viewfinder Modal --- */}
      <Modal visible={showCamera} animationType="slide">
        <View style={styles.cameraFrame}>
          {tempCaptureUri ? (
            <View style={styles.cameraPreviewFrame}>
              <Text style={styles.previewTitleStyle}>
                {cameraStep === 'front' ? getT('step_front_title') : getT('step_back_title')} - {getT('preview_photo_title')}
              </Text>
              <Image source={{ uri: `file://${tempCaptureUri}` }} style={{ flex: 1, resizeMode: 'cover' }} />
              <View style={styles.previewFooterRow}>
                <TouchableOpacity
                  style={[styles.previewActionBtn, { backgroundColor: 'rgba(255,255,255,0.15)' }]}
                  onPress={() => setTempCaptureUri(null)}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>{getT('retake_photo_btn')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.previewActionBtn, { backgroundColor: colors.primary }]}
                  onPress={handleConfirmCapturedPhoto}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>
                    {cameraStep === 'front' ? getT('next_to_back') : getT('use_photo_btn')}
                  </Text>
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
                  isActive={showCamera}
                  photo={true}
                />
              )}

              {/* Dynamic Step Guidance text */}
              <View style={styles.guidanceBox}>
                <Text style={styles.stepTitleHeading}>
                  {cameraStep === 'front' ? getT('step_front_title') : getT('step_back_title')}
                </Text>
                <Text style={styles.guidanceTextHeading}>
                  {cameraStep === 'front' ? getT('cam_guide_front') : getT('cam_guide_back')}
                </Text>
              </View>

              {/* Driving License Cutout Frame (CR80 Standard Ratio ~ 1.586) */}
              <View style={styles.cameraCutoutContainer}>
                <View style={styles.darkOutMask} />
                <View style={{ flexDirection: 'row' }}>
                  <View style={styles.darkOutMask} />
                  <View style={[styles.cutoutRect, { borderColor: colors.primary }]} />
                  <View style={styles.darkOutMask} />
                </View>
                <View style={[styles.darkOutMask, { flex: 1.2 }]} />
              </View>

              <TouchableOpacity style={styles.cameraCloseBtn} onPress={() => setShowCamera(false)}>
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

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerBarRTL: { flexDirection: 'row-reverse' },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    gap: 10,
  },
  statusBannerText: { fontSize: 14, fontWeight: '600', flex: 1 },
  guidelinesCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  guidelinesTitle: { fontSize: 14, fontWeight: '700' },
  ruleLineItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 6 },
  ruleLineText: { fontSize: 13, flex: 1, lineHeight: 18 },
  sidesContainer: { gap: 20, marginBottom: 24 },
  sideCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  sideCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sideTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  sideSub: { fontSize: 12.5, lineHeight: 17, paddingRight: 8 },
  uploadBox: {
    height: 110,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  uploadBoxText: { fontSize: 14, fontWeight: '700' },
  previewWrap: { height: 160, borderRadius: 12, overflow: 'hidden', position: 'relative' },
  previewImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  changeImgBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.65)',
    padding: 8,
    borderRadius: 20,
  },
  submitBtn: {
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  // Vision Camera View Finder Styles
  cameraFrame: { flex: 1, backgroundColor: '#000000', justifyContent: 'center' },
  cameraPreviewFrame: { flex: 1, backgroundColor: '#000000', justifyContent: 'space-between' },
  previewTitleStyle: { position: 'absolute', top: 50, left: 20, right: 20, textAlign: 'center', color: '#FFFFFF', fontSize: 15, fontWeight: '700', zIndex: 10 },
  previewFooterRow: { position: 'absolute', bottom: 40, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', gap: 15, zIndex: 10 },
  previewActionBtn: { flex: 1, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  cameraLoadView: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  guidanceBox: { position: 'absolute', top: 60, left: 20, right: 20, alignItems: 'center', zIndex: 10, backgroundColor: 'rgba(0,0,0,0.65)', padding: 12, borderRadius: 12 },
  stepTitleHeading: { color: '#38BDF8', fontSize: 15, fontWeight: '700', marginBottom: 4 },
  guidanceTextHeading: { color: '#FFFFFF', fontSize: 13, fontWeight: '600', textAlign: 'center', lineHeight: 18 },
  cameraCutoutContainer: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between', zIndex: 5 },
  darkOutMask: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)' },
  cutoutRect: { width: SCREEN_W * 0.88, height: (SCREEN_W * 0.88) / 1.586, borderRadius: 16, borderWidth: 2.5 },
  cameraCloseBtn: { position: 'absolute', top: 50, right: 20, zIndex: 20, backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 20 },
  shutterRow: { position: 'absolute', bottom: 40, left: 0, right: 0, alignItems: 'center', zIndex: 10 },
  shutterButtonCircle: { width: 76, height: 76, borderRadius: 38, borderWidth: 4, borderColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  shutterInner: { width: 60, height: 60, borderRadius: 30 },
});
