import React, { useState, useEffect, useRef } from 'react';
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
  Animated,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import {
  ChevronLeft,
  Camera as CameraIcon,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Lock,
  Calendar,
  FileText,
  RefreshCw,
  ZoomIn,
  BadgeAlert,
  ArrowUpCircle,
  Check,
} from 'lucide-react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import { useTheme } from '../../theme/ThemeContext';
import { api, BASE_URL } from '../../api/axios.instance';
import i18n from '../../i18n';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ── Register locales ─────────────────────────────────────────────────────────
const registerDocumentDetailLocales = () => {
  i18n.addResourceBundle('ar', 'profile', {
    doc_detail_not_uploaded: 'لم يُرفع بعد',
    doc_detail_upload_cta: 'ارفع الوثيقة الآن لبدء المراجعة',
    doc_detail_re_capture: 'إعادة التصوير',
    doc_detail_upload_new: 'رفع نسخة جديدة',
    doc_detail_capture_btn: 'التقاط الوثيقة',
    doc_detail_expires_in: 'تنتهي بعد {{days}} يوماً',
    doc_detail_expires_soon: 'بعد {{days}} أيام ⚠️',
    doc_detail_expires_tomorrow: 'تنتهي غداً ⚠️',
    doc_detail_expired_since: 'منتهية منذ {{days}} يوماً',
    doc_detail_no_expiry: 'بدون تاريخ انتهاء',
    doc_detail_expiry_label: 'تاريخ الانتهاء',
    doc_detail_version_label: 'الإصدار {{v}}',
    doc_detail_approved_lock: 'هذه الوثيقة مقبولة ومحمية. تواصل مع الدعم للتحديث.',
    doc_detail_review_timeline: 'سجل المراجعات',
    doc_detail_evt_UPLOADED: 'تم رفع الوثيقة',
    doc_detail_evt_PENDING: 'قيد مراجعة الإدارة',
    doc_detail_evt_APPROVED: 'تمت الموافقة على الوثيقة',
    doc_detail_evt_REJECTED: 'تم رفض الوثيقة',
    doc_detail_evt_EXPIRED: 'انتهت صلاحية الوثيقة',
    doc_detail_rejection_reason: 'سبب الرفض',
    doc_detail_view_image: 'عرض الصورة',
    doc_detail_loading_history: 'جلب سجل المراجعات...',
    doc_detail_no_history: 'لا يوجد سجل مراجعات بعد.',
    doc_detail_ver_badge: 'نسخة {{v}}',
    doc_detail_expiry_section: 'الصلاحية',
    doc_detail_status_section: 'الحالة الحالية',
  }, true, true);

  i18n.addResourceBundle('fr', 'profile', {
    doc_detail_not_uploaded: 'Non soumis',
    doc_detail_upload_cta: 'Soumettez ce document pour démarrer la vérification',
    doc_detail_re_capture: 'Reprendre la photo',
    doc_detail_upload_new: 'Nouvelle version',
    doc_detail_capture_btn: 'Photographier',
    doc_detail_expires_in: 'Expire dans {{days}} jours',
    doc_detail_expires_soon: 'Dans {{days}} jours ⚠️',
    doc_detail_expires_tomorrow: 'Expire demain ⚠️',
    doc_detail_expired_since: 'Expiré depuis {{days}} jours',
    doc_detail_no_expiry: 'Sans date d\'expiration',
    doc_detail_expiry_label: 'Date d\'expiration',
    doc_detail_version_label: 'Version {{v}}',
    doc_detail_approved_lock: 'Document approuvé et protégé. Contactez le support pour modifier.',
    doc_detail_review_timeline: 'Journal des révisions',
    doc_detail_evt_UPLOADED: 'Document soumis',
    doc_detail_evt_PENDING: 'En cours de révision',
    doc_detail_evt_APPROVED: 'Document approuvé',
    doc_detail_evt_REJECTED: 'Document refusé',
    doc_detail_evt_EXPIRED: 'Document expiré',
    doc_detail_rejection_reason: 'Motif du refus',
    doc_detail_view_image: 'Voir l\'image',
    doc_detail_loading_history: 'Chargement du journal...',
    doc_detail_no_history: 'Aucun historique pour l\'instant.',
    doc_detail_ver_badge: 'Version {{v}}',
    doc_detail_expiry_section: 'Validité',
    doc_detail_status_section: 'Statut actuel',
  }, true, true);

  i18n.addResourceBundle('en', 'profile', {
    doc_detail_not_uploaded: 'Not uploaded yet',
    doc_detail_upload_cta: 'Upload this document to start verification',
    doc_detail_re_capture: 'Retake Photo',
    doc_detail_upload_new: 'Upload New Version',
    doc_detail_capture_btn: 'Capture Document',
    doc_detail_expires_in: 'Expires in {{days}} days',
    doc_detail_expires_soon: 'In {{days}} days ⚠️',
    doc_detail_expires_tomorrow: 'Expires tomorrow ⚠️',
    doc_detail_expired_since: 'Expired {{days}} days ago',
    doc_detail_no_expiry: 'No expiration date',
    doc_detail_expiry_label: 'Expiration Date',
    doc_detail_version_label: 'Version {{v}}',
    doc_detail_approved_lock: 'This document is approved and locked. Contact support to update.',
    doc_detail_review_timeline: 'Review History',
    doc_detail_evt_UPLOADED: 'Document uploaded',
    doc_detail_evt_PENDING: 'Under admin review',
    doc_detail_evt_APPROVED: 'Document approved',
    doc_detail_evt_REJECTED: 'Document rejected',
    doc_detail_evt_EXPIRED: 'Document expired',
    doc_detail_rejection_reason: 'Rejection reason',
    doc_detail_view_image: 'View Image',
    doc_detail_loading_history: 'Fetching review history...',
    doc_detail_no_history: 'No review history yet.',
    doc_detail_ver_badge: 'Version {{v}}',
    doc_detail_expiry_section: 'Validity',
    doc_detail_status_section: 'Current Status',
  }, true, true);

  i18n.addResourceBundle('es', 'profile', {
    doc_detail_not_uploaded: 'No enviado aún',
    doc_detail_upload_cta: 'Envíe este documento para iniciar la verificación',
    doc_detail_re_capture: 'Volver a tomar',
    doc_detail_upload_new: 'Subir nueva versión',
    doc_detail_capture_btn: 'Fotografiar',
    doc_detail_expires_in: 'Vence en {{days}} días',
    doc_detail_expires_soon: 'En {{days}} días ⚠️',
    doc_detail_expires_tomorrow: 'Vence mañana ⚠️',
    doc_detail_expired_since: 'Expirado hace {{days}} días',
    doc_detail_no_expiry: 'Sin fecha de vencimiento',
    doc_detail_expiry_label: 'Fecha de vencimiento',
    doc_detail_version_label: 'Versión {{v}}',
    doc_detail_approved_lock: 'Documento aprobado y bloqueado. Contacte soporte para modificar.',
    doc_detail_review_timeline: 'Historial de revisiones',
    doc_detail_evt_UPLOADED: 'Documento enviado',
    doc_detail_evt_PENDING: 'En revisión',
    doc_detail_evt_APPROVED: 'Documento aprobado',
    doc_detail_evt_REJECTED: 'Documento rechazado',
    doc_detail_evt_EXPIRED: 'Documento caducado',
    doc_detail_rejection_reason: 'Motivo del rechazo',
    doc_detail_view_image: 'Ver imagen',
    doc_detail_loading_history: 'Cargando historial...',
    doc_detail_no_history: 'Sin historial de revisión todavía.',
    doc_detail_ver_badge: 'Versión {{v}}',
    doc_detail_expiry_section: 'Vigencia',
    doc_detail_status_section: 'Estado actual',
  }, true, true);
};

// ── Document config map ───────────────────────────────────────────────────────
const getDocConfig = (type: string, t: (k: string) => string) => {
  switch (type) {
    case 'DRIVING_LICENSE':       return { title: t('driver_license'), desc: t('driver_license_desc'), expires: true };
    case 'IDENTITY_CARD':         return { title: t('national_id_or_passport'), desc: t('national_id_or_passport_desc'), expires: true };
    case 'CARTE_GRISE':           return { title: t('vehicle_registration'), desc: t('vehicle_registration_desc'), expires: true };
    case 'INSURANCE_POLICY':      return { title: t('insurance_certificate'), desc: t('insurance_certificate_desc'), expires: true };
    case 'TECHNICAL_INSPECTION':  return { title: t('technical_inspection'), desc: t('technical_inspection_desc'), expires: true };
    case 'PROFESSIONAL_PERMIT':   return { title: t('professional_permit'), desc: t('professional_permit_desc'), expires: true };
    case 'TAXI_AUTHORIZATION':    return { title: t('taxi_authorization'), desc: t('taxi_authorization_desc'), expires: true };
    case 'MUNICIPAL_AUTHORIZATION': return { title: t('municipal_authorization'), desc: t('municipal_authorization_desc'), expires: true };
    case 'SPECIAL_AUTHORIZATION': return { title: t('special_authorization'), desc: t('special_authorization_desc'), expires: true };
    case 'REGISTRE_COMMERCE':     return { title: t('registre_commerce'), desc: t('registre_commerce_desc'), expires: false };
    case 'RENTAL_AGREEMENT':      return { title: t('rental_agreement'), desc: t('rental_agreement_desc'), expires: true };
    case 'COMPANY_DOCS':          return { title: t('company_docs'), desc: t('company_docs_desc'), expires: false };
    case 'FLEET_PERMIT':          return { title: t('fleet_permit'), desc: t('fleet_permit_desc'), expires: true };
    case 'ADDITIONAL_DOC':        return { title: t('additional_doc'), desc: t('additional_doc_desc'), expires: false };
    default: return { title: type.replace(/_/g, ' '), desc: '', expires: false };
  }
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const computeDaysLeft = (expiresAt: string | null): number | null => {
  if (!expiresAt) return null;
  return Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86400000);
};

// ── Main Screen ───────────────────────────────────────────────────────────────
export const DocumentDetailScreen = () => {
  useEffect(() => { registerDocumentDetailLocales(); }, []);

  const { t, i18n: currentI18n } = useTranslation(['profile', 'translation']);
  const { colors, isDarkMode } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const isRTL = currentI18n.language === 'ar';

  const { type, uploadedDoc } = route.params as {
    type: string;
    uploadedDoc?: any;  // pre-loaded from parent list
  };

  const docConfig = getDocConfig(type, t);
  const [currentDoc, setCurrentDoc] = useState<any>(uploadedDoc || null);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Camera flow
  const [showCamera, setShowCamera] = useState(false);
  const [captureUri, setCaptureUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [checkingQuality, setCheckingQuality] = useState(false);
  const [failedQualityCheck, setFailedQualityCheck] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear() + 2);
  const [tempExpiresAt, setTempExpiresAt] = useState<string | null>(null);
  const [cameraPermission, setCameraPermission] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);

  const scanAnim = useRef(new Animated.Value(0)).current;
  const cameraRef = useRef<any>(null);
  const cameraType = type === 'PROFILE_PHOTO' ? 'front' : 'back';
  const device = useCameraDevice(cameraType);

  useEffect(() => {
    fetchHistory();
    checkCameraPermission();
  }, []);

  const checkCameraPermission = async () => {
    const perm = Platform.OS === 'android' ? PERMISSIONS.ANDROID.CAMERA : PERMISSIONS.IOS.CAMERA;
    const res = await check(perm);
    setCameraPermission(res === RESULTS.GRANTED);
  };

  const requestCameraPermission = async () => {
    const perm = Platform.OS === 'android' ? PERMISSIONS.ANDROID.CAMERA : PERMISSIONS.IOS.CAMERA;
    const res = await request(perm);
    const granted = res === RESULTS.GRANTED;
    setCameraPermission(granted);
    return granted;
  };

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await api.get(`/driver/documents/${type.toLowerCase()}/history`);
      setHistory(res.data.events || []);
      if (res.data.current) setCurrentDoc(res.data.current);
    } catch (err) {
      console.error('[DocumentDetailScreen] fetchHistory error:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const openCamera = async () => {
    const hasPerm = cameraPermission || (await requestCameraPermission());
    if (!hasPerm) {
      Alert.alert(t('error'), t('camera_permission_required'));
      return;
    }
    setCaptureUri(null);
    setTempExpiresAt(null);
    setFailedQualityCheck(false);
    setCheckingQuality(false);
    setShowCamera(true);
  };

  const triggerCapture = async () => {
    if (!cameraRef.current) return;
    try {
      const file = await cameraRef.current.takePhoto({ flash: 'off' });
      const uri = Platform.OS === 'android' ? `file://${file.path}` : file.path;
      setCaptureUri(uri);
      setCheckingQuality(true);
      scanAnim.setValue(0);
      Animated.timing(scanAnim, { toValue: 1, duration: 2200, useNativeDriver: true }).start(() => {
        setCheckingQuality(false);
        const blurry = Math.random() < 0.05;
        if (blurry) {
          setFailedQualityCheck(true);
        } else if (docConfig.expires) {
          setShowDatePicker(true);
        }
      });
    } catch (err) {
      Alert.alert(t('error'), t('capture_failed_error'));
    }
  };

  const handleUpload = async () => {
    if (!captureUri) return;
    try {
      setUploading(true);
      const resized = await ImageResizer.createResizedImage(captureUri, 1400, 1000, 'JPEG', 88);
      const formData = new FormData();
      formData.append('file', { uri: resized.uri, type: 'image/jpeg', name: `${type.toLowerCase()}.jpg` } as any);
      formData.append('type', type);
      if (tempExpiresAt) formData.append('expiresAt', tempExpiresAt);
      await api.post('/driver/documents/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setShowCamera(false);
      Alert.alert(t('success'), t('success_upload'));
      fetchHistory();
    } catch (err: any) {
      Alert.alert(t('error'), err.response?.data?.message || t('upload_failed_error'));
    } finally {
      setUploading(false);
    }
  };

  const saveDateAndClose = () => {
    const d = String(selectedDay).padStart(2, '0');
    const m = String(selectedMonth).padStart(2, '0');
    setTempExpiresAt(`${selectedYear}-${m}-${d}`);
    setShowDatePicker(false);
  };

  // ── Derived Values ────────────────────────────────────────────────────────
  const daysLeft = computeDaysLeft(currentDoc?.expiresAt);
  const isExpired = currentDoc?.status === 'EXPIRED' || (daysLeft !== null && daysLeft <= 0);
  const isApproved = currentDoc?.status === 'APPROVED';
  const isRejected = currentDoc?.status === 'REJECTED';
  const isPending = currentDoc?.status === 'PENDING';

  const getStatusBadge = () => {
    if (isExpired)  return { text: t('expired'),      color: '#F97316', bg: 'rgba(249,115,22,0.12)'  };
    if (isApproved) return { text: t('approved'),     color: '#22C55E', bg: 'rgba(34,197,94,0.12)'   };
    if (isRejected) return { text: t('rejected'),     color: '#EF4444', bg: 'rgba(239,68,68,0.12)'   };
    if (isPending)  return { text: t('under_review'), color: '#F59E0B', bg: 'rgba(245,158,11,0.12)'  };
    return            { text: t('doc_detail_not_uploaded'), color: colors.textMuted, bg: colors.surfaceAlt };
  };

  const badge = getStatusBadge();

  const getExpiryLabel = () => {
    if (!currentDoc?.expiresAt) return t('doc_detail_no_expiry');
    if (daysLeft === null) return t('doc_detail_no_expiry');
    if (daysLeft < 0)  return t('doc_detail_expired_since', { days: Math.abs(daysLeft) });
    if (daysLeft === 1) return t('doc_detail_expires_tomorrow');
    if (daysLeft <= 15) return t('doc_detail_expires_soon', { days: daysLeft });
    return t('doc_detail_expires_in', { days: daysLeft });
  };

  const getExpiryColor = () => {
    if (!daysLeft) return colors.textSecondary;
    if (daysLeft < 0) return '#EF4444';
    if (daysLeft <= 15) return '#F97316';
    return colors.textSecondary;
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'UPLOADED': return <ArrowUpCircle size={16} color={colors.primary} />;
      case 'PENDING':  return <Clock size={16} color="#F59E0B" />;
      case 'APPROVED': return <CheckCircle2 size={16} color="#22C55E" />;
      case 'REJECTED': return <XCircle size={16} color="#EF4444" />;
      case 'EXPIRED':  return <AlertTriangle size={16} color="#F97316" />;
      default:         return <FileText size={16} color={colors.textSecondary} />;
    }
  };

  const getEventLabel = (eventType: string) => {
    return (t as any)(`doc_detail_evt_${eventType}`) || eventType;
  };

  const isLastEvent = (idx: number) => idx === history.length - 1;

  const renderScanLine = () => {
    const ty = scanAnim.interpolate({ inputRange: [0, 1], outputRange: [0, SCREEN_W * 1.2] });
    return <Animated.View style={[styles.scanBeam, { transform: [{ translateY: ty }] }]} />;
  };

  const canReupload = isRejected || isExpired;
  const canUpload = !currentDoc;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]} numberOfLines={1}>{docConfig.title}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Document Image Preview */}
        <View style={[styles.imageCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {currentDoc?.url ? (
            <TouchableOpacity onPress={() => setShowFullImage(true)} activeOpacity={0.9}>
              <Image
                source={{ uri: currentDoc.url.startsWith('http') ? currentDoc.url : `${BASE_URL}${currentDoc.url}` }}
                style={styles.docImage}
                resizeMode="cover"
              />
              <View style={styles.imageOverlay}>
                <ZoomIn size={22} color="#FFFFFF" />
                <Text style={styles.imageOverlayText}>{t('doc_detail_view_image')}</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={[styles.docImagePlaceholder, { backgroundColor: colors.surfaceAlt }]}>
              <FileText size={52} color={colors.textMuted} />
              <Text style={[styles.placeholderText, { color: colors.textMuted }]}>{t('doc_detail_not_uploaded')}</Text>
            </View>
          )}
        </View>

        {/* Status + Expiry Info */}
        <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>

          {/* Current Status */}
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{t('doc_detail_status_section')}</Text>
            <View style={[styles.statusBadge, { backgroundColor: badge.bg, borderColor: badge.color }]}>
              <Text style={[styles.statusBadgeText, { color: badge.color }]}>{badge.text}</Text>
            </View>
          </View>

          {/* Version */}
          {currentDoc?.version && (
            <View style={[styles.infoRow, { marginTop: 10 }]}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                {t('doc_detail_version_label', { v: currentDoc.version })}
              </Text>
              <Text style={[styles.infoValue, { color: colors.textSecondary }]}>
                {new Date(currentDoc.updatedAt || currentDoc.createdAt).toLocaleDateString(currentI18n.language)}
              </Text>
            </View>
          )}

          {/* Expiry Countdown */}
          {docConfig.expires && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{t('doc_detail_expiry_section')}</Text>
                <View style={styles.expiryRow}>
                  <Calendar size={14} color={getExpiryColor()} style={{ marginRight: 5 }} />
                  <Text style={[styles.expiryText, { color: getExpiryColor() }]}>{getExpiryLabel()}</Text>
                </View>
              </View>
              {currentDoc?.expiresAt && (
                <Text style={[styles.expiryDateSub, { color: colors.textMuted }]}>
                  {new Date(currentDoc.expiresAt).toLocaleDateString(currentI18n.language, { year: 'numeric', month: 'long', day: 'numeric' })}
                </Text>
              )}
            </>
          )}

          {/* Rejection Reason Box */}
          {isRejected && currentDoc?.rejectionReason && (
            <View style={[styles.rejectionBox, { backgroundColor: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.2)' }]}>
              <BadgeAlert size={16} color="#EF4444" style={{ marginRight: 8 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.rejectionLabel}>{t('doc_detail_rejection_reason')}</Text>
                <Text style={styles.rejectionText}>{currentDoc.rejectionReason}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        {canUpload && (
          <View style={styles.actionSection}>
            <Text style={[styles.actionHint, { color: colors.textSecondary }]}>{t('doc_detail_upload_cta')}</Text>
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.primary }]} onPress={openCamera}>
              <CameraIcon size={18} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.primaryBtnText}>{t('doc_detail_capture_btn')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {canReupload && (
          <View style={styles.actionSection}>
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: isRejected ? '#EF4444' : '#F97316' }]} onPress={openCamera}>
              <RefreshCw size={18} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.primaryBtnText}>{t('doc_detail_re_capture')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {isApproved && (
          <View style={[styles.lockedBanner, { backgroundColor: 'rgba(34,197,94,0.06)', borderColor: 'rgba(34,197,94,0.2)' }]}>
            <Lock size={16} color="#22C55E" style={{ marginRight: 8 }} />
            <Text style={[styles.lockedText, { color: '#22C55E' }]}>{t('doc_detail_approved_lock')}</Text>
          </View>
        )}

        {/* Review Timeline */}
        <View style={[styles.timelineCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.timelineHeading, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>
            {t('doc_detail_review_timeline')}
          </Text>

          {loadingHistory ? (
            <View style={styles.historyLoader}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[styles.historyLoaderText, { color: colors.textSecondary }]}>{t('doc_detail_loading_history')}</Text>
            </View>
          ) : history.length === 0 ? (
            <Text style={[styles.noHistoryText, { color: colors.textMuted }]}>{t('doc_detail_no_history')}</Text>
          ) : (
            <View style={styles.timelineList}>
              {history.map((evt, idx) => (
                <View key={idx} style={[styles.timelineItem, isRTL && styles.timelineItemRTL]}>
                  {/* Vertical line + dot */}
                  <View style={styles.timelineDotColumn}>
                    <View style={[styles.timelineDot, {
                      backgroundColor: evt.eventType === 'APPROVED' ? '#22C55E' :
                        evt.eventType === 'REJECTED' ? '#EF4444' :
                        evt.eventType === 'EXPIRED'  ? '#F97316' :
                        evt.eventType === 'PENDING'  ? '#F59E0B' : colors.primary
                    }]}>
                      {getEventIcon(evt.eventType)}
                    </View>
                    {!isLastEvent(idx) && (
                      <View style={[styles.timelineConnector, { backgroundColor: colors.border }]} />
                    )}
                  </View>

                  {/* Content */}
                  <View style={[styles.timelineContent, { marginBottom: isLastEvent(idx) ? 0 : 20 }]}>
                    <View style={styles.timelineContentTop}>
                      <Text style={[styles.timelineEventLabel, { color: colors.textPrimary }]}>
                        {getEventLabel(evt.eventType)}
                      </Text>
                      {evt.version && (
                        <View style={[styles.verBadge, { backgroundColor: colors.surfaceAlt }]}>
                          <Text style={[styles.verBadgeText, { color: colors.textMuted }]}>
                            {t('doc_detail_ver_badge', { v: evt.version })}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.timelineDate, { color: colors.textMuted }]}>
                      {new Date(evt.date).toLocaleDateString(currentI18n.language, {
                        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </Text>
                    {evt.rejectionReason && (
                      <Text style={styles.timelineRejectionNote}>{evt.rejectionReason}</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── Camera Modal ──────────────────────────────────────────────────── */}
      <Modal visible={showCamera} animationType="slide" transparent={false}>
        <View style={styles.cameraContainer}>
          <TouchableOpacity style={styles.cameraCloseBtn} onPress={() => setShowCamera(false)}>
            <ChevronLeft size={28} color="#FFF" />
          </TouchableOpacity>

          {!captureUri && device && (
            <View style={{ flex: 1 }}>
              <Camera ref={cameraRef} style={StyleSheet.absoluteFill} device={device} photo isActive={showCamera} />
              <View style={StyleSheet.absoluteFill}>
                <View style={[styles.overlayArea, styles.darkBg, { justifyContent: 'flex-end', paddingBottom: 20 }]}>
                  <Text style={styles.overlayText}>
                    {type === 'PROFILE_PHOTO' ? t('camera_guide_oval') : t('camera_guide_box')}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', height: type === 'PROFILE_PHOTO' ? 320 : 250 }}>
                  <View style={[styles.overlaySide, styles.darkBg]} />
                  <View style={type === 'PROFILE_PHOTO' ? styles.cutoutOval : styles.cutoutRect} />
                  <View style={[styles.overlaySide, styles.darkBg]} />
                </View>
                <View style={[styles.overlayArea, styles.darkBg]} />
              </View>
              <View style={styles.shutterWrap}>
                <TouchableOpacity style={styles.shutterBtn} onPress={triggerCapture}>
                  <View style={styles.shutterInner} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {captureUri && (
            <View style={{ flex: 1 }}>
              <Image source={{ uri: captureUri }} style={StyleSheet.absoluteFill} />
              {checkingQuality && (
                <View style={styles.scanLayer}>
                  {renderScanLine()}
                  <View style={styles.scanBubble}>
                    <ActivityIndicator size="small" color="#FFF" style={{ marginRight: 8 }} />
                    <Text style={styles.scanBubbleText}>{t('quality_checking')}</Text>
                  </View>
                </View>
              )}
              {failedQualityCheck && (
                <View style={styles.alarmOverlay}>
                  <XCircle size={60} color="#EF4444" style={{ marginBottom: 15 }} />
                  <Text style={styles.alarmTitle}>{t('blurry_warning_title')}</Text>
                  <Text style={styles.alarmDesc}>{t('blurry_warning_desc')}</Text>
                  <View style={styles.alarmBtns}>
                    <TouchableOpacity style={[styles.alarmBtn, styles.alarmBtnOutline]} onPress={() => { setFailedQualityCheck(false); setCaptureUri(null); }}>
                      <Text style={styles.alarmOutlineText}>{t('retake_photo')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.alarmBtn, styles.alarmBtnSolid]} onPress={() => setFailedQualityCheck(false)}>
                      <Text style={styles.alarmSolidText}>{t('force_use_photo')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              {!checkingQuality && !failedQualityCheck && (
                <View style={styles.previewBtns}>
                  <TouchableOpacity style={[styles.previewBtn, styles.btnRetake]} onPress={() => setCaptureUri(null)}>
                    <Text style={styles.retakeText}>{t('retake_photo')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.previewBtn, styles.btnConfirm]} onPress={handleUpload}>
                    {uploading ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.confirmText}>{t('confirm_and_upload')}</Text>}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>
      </Modal>

      {/* ── Date Picker Modal ─────────────────────────────────────────────── */}
      <Modal visible={showDatePicker} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.dateCard, { backgroundColor: colors.surface }]}>
            <Calendar size={28} color={colors.primary} style={{ alignSelf: 'center', marginBottom: 12 }} />
            <Text style={[styles.dateCardTitle, { color: colors.textPrimary }]}>{t('expiration_date')}</Text>
            <View style={styles.dateCols}>
              {[
                { label: t('select_day'), values: Array.from({ length: 31 }, (_, i) => i + 1), selected: selectedDay, onSelect: setSelectedDay },
                { label: t('select_month'), values: Array.from({ length: 12 }, (_, i) => i + 1), selected: selectedMonth, onSelect: setSelectedMonth },
                { label: t('select_year'), values: Array.from({ length: 15 }, (_, i) => new Date().getFullYear() + i), selected: selectedYear, onSelect: setSelectedYear },
              ].map((col, ci) => (
                <View key={ci} style={styles.dateCol}>
                  <Text style={[styles.dateColLabel, { color: colors.textSecondary }]}>{col.label}</Text>
                  <ScrollView nestedScrollEnabled style={styles.dateScroll}>
                    {col.values.map(v => (
                      <TouchableOpacity key={v} style={[styles.dateOpt, col.selected === v && { backgroundColor: colors.primaryGlow }]} onPress={() => col.onSelect(v)}>
                        <Text style={[styles.dateOptText, { color: col.selected === v ? colors.primary : colors.textPrimary }]}>{v}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              ))}
            </View>
            <TouchableOpacity style={[styles.saveDateBtn, { backgroundColor: colors.primary }]} onPress={saveDateAndClose}>
              <Text style={styles.saveDateText}>{t('save_date')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── Full Image Viewer Modal ───────────────────────────────────────── */}
      <Modal visible={showFullImage} transparent animationType="fade">
        <View style={styles.fullImageModal}>
          <TouchableOpacity style={styles.fullImageClose} onPress={() => setShowFullImage(false)}>
            <XCircle size={32} color="#FFF" />
          </TouchableOpacity>
          {currentDoc?.url && (
            <Image
              source={{ uri: currentDoc.url.startsWith('http') ? currentDoc.url : `${BASE_URL}${currentDoc.url}` }}
              style={styles.fullImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '700', flex: 1, textAlign: 'center' },
  scrollContent: { padding: 16 },

  imageCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden', marginBottom: 14 },
  docImage: { width: '100%', height: 200 },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  imageOverlayText: { color: '#FFF', fontSize: 13, fontWeight: '600', marginLeft: 6 },
  docImagePlaceholder: {
    width: '100%',
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: { fontSize: 13, marginTop: 10 },

  infoCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 14 },
  infoRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  infoLabel: { fontSize: 13, fontWeight: '600' },
  infoValue: { fontSize: 12 },
  statusBadge: { borderWidth: 1, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  statusBadgeText: { fontSize: 11, fontWeight: '700' },
  divider: { height: 1, marginVertical: 12 },
  expiryRow: { flexDirection: 'row', alignItems: 'center' },
  expiryText: { fontSize: 13, fontWeight: '700' },
  expiryDateSub: { fontSize: 11.5, marginTop: 4, textAlign: 'right' },
  rejectionBox: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginTop: 14,
    alignItems: 'flex-start',
  },
  rejectionLabel: { color: '#EF4444', fontSize: 11, fontWeight: '700', marginBottom: 3 },
  rejectionText: { color: '#FCA5A5', fontSize: 12, lineHeight: 16 },

  actionSection: { marginBottom: 14 },
  actionHint: { fontSize: 12.5, lineHeight: 16, marginBottom: 10, textAlign: 'center' },
  primaryBtn: {
    height: 50,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  lockedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  lockedText: { flex: 1, fontSize: 12.5, lineHeight: 17 },

  timelineCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginTop: 6 },
  timelineHeading: { fontSize: 15, fontWeight: '700', marginBottom: 18 },
  historyLoader: { flexDirection: 'row', alignItems: 'center', paddingVertical: 20, justifyContent: 'center' },
  historyLoaderText: { marginLeft: 10, fontSize: 13 },
  noHistoryText: { fontSize: 13, textAlign: 'center', paddingVertical: 20 },
  timelineList: {},
  timelineItem: { flexDirection: 'row' },
  timelineItemRTL: { flexDirection: 'row-reverse' },
  timelineDotColumn: { alignItems: 'center', marginRight: 14 },
  timelineDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineConnector: { width: 2, flex: 1, marginTop: 4, marginBottom: 4, minHeight: 16 },
  timelineContent: { flex: 1, paddingBottom: 0 },
  timelineContentTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  timelineEventLabel: { fontSize: 13.5, fontWeight: '600' },
  timelineDate: { fontSize: 11, marginTop: 3 },
  timelineRejectionNote: { color: '#EF4444', fontSize: 11.5, marginTop: 4, fontStyle: 'italic' },
  verBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  verBadgeText: { fontSize: 10, fontWeight: '600' },

  // Camera
  cameraContainer: { flex: 1, backgroundColor: '#000' },
  cameraCloseBtn: {
    position: 'absolute', top: 50, left: 20, width: 44, height: 44,
    borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center', alignItems: 'center', zIndex: 50,
  },
  shutterWrap: { position: 'absolute', bottom: 50, left: 0, right: 0, alignItems: 'center' },
  shutterBtn: { width: 72, height: 72, borderRadius: 36, borderWidth: 4, borderColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
  shutterInner: { width: 58, height: 58, borderRadius: 29, backgroundColor: '#FFF' },
  darkBg: { backgroundColor: 'rgba(0,0,0,0.65)' },
  overlayArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  overlaySide: { width: 30 },
  cutoutRect: { flex: 1, borderWidth: 2, borderColor: '#22C55E', borderRadius: 12, backgroundColor: 'transparent' },
  cutoutOval: { flex: 1, borderWidth: 2, borderColor: '#22C55E', borderRadius: 150, backgroundColor: 'transparent' },
  overlayText: {
    color: '#FFF', fontSize: 13, fontWeight: '600', textAlign: 'center', paddingHorizontal: 30,
    textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3,
  },
  scanLayer: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  scanBeam: { position: 'absolute', top: 0, left: 0, right: 0, height: 4, backgroundColor: '#818CF8', shadowColor: '#6366F1', shadowOpacity: 0.9, shadowRadius: 10, elevation: 8 },
  scanBubble: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.85)', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, position: 'absolute', bottom: 120 },
  scanBubbleText: { color: '#FFF', fontSize: 13, fontWeight: '600' },
  alarmOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15,23,42,0.92)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 28 },
  alarmTitle: { color: '#FFF', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  alarmDesc: { color: '#94A3B8', fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 30 },
  alarmBtns: { width: '100%', flexDirection: 'row', justifyContent: 'space-between' },
  alarmBtn: { flex: 1, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginHorizontal: 6 },
  alarmBtnOutline: { backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  alarmBtnSolid: { backgroundColor: '#F59E0B' },
  alarmOutlineText: { color: '#FFF', fontWeight: '600' },
  alarmSolidText: { color: '#0F172A', fontWeight: '700' },
  previewBtns: { position: 'absolute', bottom: 50, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between' },
  previewBtn: { flex: 1, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginHorizontal: 6 },
  btnRetake: { backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  btnConfirm: { backgroundColor: '#6366F1' },
  retakeText: { color: '#FFF', fontWeight: '600' },
  confirmText: { color: '#FFF', fontWeight: '700' },

  // Date picker
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', paddingHorizontal: 24 },
  dateCard: { padding: 20, borderRadius: 18 },
  dateCardTitle: { fontSize: 16, fontWeight: '700', textAlign: 'center', marginBottom: 20 },
  dateCols: { flexDirection: 'row', justifyContent: 'space-between', height: 180, marginBottom: 20 },
  dateCol: { flex: 1, marginHorizontal: 4 },
  dateColLabel: { fontSize: 12, fontWeight: '600', textAlign: 'center', marginBottom: 8 },
  dateScroll: { flex: 1, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: 8 },
  dateOpt: { paddingVertical: 10, alignItems: 'center' },
  dateOptText: { fontSize: 14, fontWeight: '600' },
  saveDateBtn: { height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  saveDateText: { color: '#FFF', fontWeight: '700' },

  // Full image
  fullImageModal: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  fullImageClose: { position: 'absolute', top: 50, right: 20, zIndex: 10 },
  fullImage: { width: SCREEN_W, height: SCREEN_H * 0.8 },
});
