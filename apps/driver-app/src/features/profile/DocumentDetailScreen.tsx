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
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import {
  ChevronLeft,
  ChevronRight,
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
  Info,
  X,
  User,
  CheckCircle,
} from 'lucide-react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import ImageResizer from '@bam.tech/react-native-image-resizer';
import { useTheme } from '../../theme/ThemeContext';
import { api, BASE_URL } from '../../api/axios.instance';
import i18n from '../../i18n';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ── 4 Languages Strict Translation Dictionary ─────────────────────────────────
const DOC_DETAIL_TRANSLATIONS: any = {
  ar: {
    ui: {
      not_uploaded: 'لم يُرفع بعد',
      upload_cta: 'ارفع الوثيقة الآن لبدء المراجعة والتحقق',
      re_capture: '🔄 إعادة تصوير الوثيقة',
      upload_new: 'رفع نسخة جديدة',
      capture_btn: '📸 التقاط وصفي للوثيقة',
      expires_in: 'تنتهي بعد {{days}} يوماً',
      expires_soon: 'تنتهي بعد {{days}} أيام ⚠️',
      expires_tomorrow: 'تنتهي غداً ⚠️',
      expired_since: 'منتهية منذ {{days}} يوماً',
      no_expiry: 'بدون تاريخ انتهاء',
      expiry_label: 'تاريخ الانتهاء',
      version_label: 'الإصدار {{v}}',
      approved_lock: 'هذه الوثيقة مقبولة ومحمية. تواصل مع الدعم للتحديث.',
      review_timeline: 'سجل المراجعات والتدقيق',
      evt_UPLOADED: 'تم رفع الوثيقة بنجاح',
      evt_PENDING: 'قيد مراجعة الإدارة',
      evt_APPROVED: 'تمت الموافقة على الوثيقة',
      evt_REJECTED: 'تم رفض الوثيقة',
      evt_EXPIRED: 'انتهت صلاحية الوثيقة',
      rejection_reason: 'سبب الرفض',
      view_image: 'عرض الصورة بكامل الشاشة',
      loading_history: 'جلب سجل المراجعات...',
      no_history: 'لا يوجد سجل مراجعات بعد.',
      ver_badge: 'نسخة {{v}}',
      expiry_section: 'الصلاحية والانتهاء',
      status_section: 'الحالة الحالية',
      err_real_name_required: 'يتطلب رفع الوثائق إدخال اسمك الحقيقي. يرجى تحديث اسمك في الملف الشخصي قبل رفع الوثائق.',
      rule_heading: '📋 تعليمات وإرشادات التوثيق:',
      under_review: 'قيد المراجعة',
      approved: 'تمت الموافقة ✓',
      rejected: 'تم الرفض ❌',
      expired: 'منتهية الصلاحية ⚠️',
      error: 'خطأ',
      success: 'نجاح',
      continue_btn: 'متابعة',
      quality_checking: 'جاري التحقق من وضوح الوثيقة...',
      blurry_warning_title: '⚠️ تنبيه: الصورة قد تكون غير واضحة',
      blurry_warning_desc: 'تأكد من عدم وجود اهتزاز وأن جميع النصوص ورقم الوثيقة واضحة تماماً.',
      retake_photo: '🔄 إعادة التصوير',
      force_use_photo: 'استخدام الصورة',
      confirm_and_upload: '✅ تأكيد ورفع الوثيقة',
      success_upload: 'تم رفع الوثيقة بنجاح للمراجعة والاعتماد.',
    },
    INSURANCE_POLICY: { title: 'تأمين المركبة', desc: 'شهادة تأمين مركبة VTC سارية المفعول' },
    REGISTRE_COMMERCE: { title: 'السجل التجاري', desc: 'نسخة رسمية حديثة من السجل التجاري' },
    TECHNICAL_INSPECTION: { title: 'الفحص التقني', desc: 'شهادة الفحص التقني للمركبة سارية الصلاحية' },
    RENTAL_AGREEMENT: { title: 'عقد كراء المركبة', desc: 'عقد استئجار أو إيجار السيارة الرسمي' },
    PROFESSIONAL_PERMIT: { title: 'بطاقة الثقة المهنية', desc: 'رخصة السياقة المهنية أو رخصة الثقة' },
    TAXI_AUTHORIZATION: { title: 'ترخيص سيارة الأجرة', desc: 'رخصة أو مأذونية النقل لسيارة الأجرة' },
    MUNICIPAL_AUTHORIZATION: { title: 'الترخيص البلدي', desc: 'موافقة أو ترخيص الجهة البلدية المحلية' },
    SPECIAL_AUTHORIZATION: { title: 'الترخيص الخاص', desc: 'الترخيص الاستثنائي للخدمات الخاصة' },
    COMPANY_DOCS: { title: 'وثائق الشركة', desc: 'النظام الأساسي وتفاصيل الشركة أو الكيان القانوني' },
    FLEET_PERMIT: { title: 'تصريح الأسطول', desc: 'ترخيص رسمي لإدارة أسطول المركبات' },
    ADDITIONAL_DOC: { title: 'وثيقة إضافية', desc: 'أي مستند آخر تطلبه الإدارة' },
    CARTE_GRISE: { title: 'البطاقة الرمادية', desc: 'صورة البطاقة الرمادية الرسمية للمركبة' },
    DRIVING_LICENSE: { title: 'رخصة السياقة', desc: 'صورة واضحة للواجهة الأمامية لرخصة السياقة' },
    IDENTITY_CARD: { title: 'البطاقة الوطنية أو جواز السفر', desc: 'صورة الهوية الوطنية أو صفحة جواز السفر' },
  },
  fr: {
    ui: {
      not_uploaded: 'Non soumis',
      upload_cta: 'Soumettez ce document pour démarrer la vérification',
      re_capture: '🔄 Reprendre la photo',
      upload_new: 'Nouvelle version',
      capture_btn: '📸 Photographier le document',
      expires_in: 'Expire dans {{days}} jours',
      expires_soon: 'Dans {{days}} jours ⚠️',
      expires_tomorrow: 'Expire demain ⚠️',
      expired_since: 'Expiré depuis {{days}} jours',
      no_expiry: 'Sans date d\'expiration',
      expiry_label: 'Date d\'expiration',
      version_label: 'Version {{v}}',
      approved_lock: 'Document approuvé et protégé. Contactez le support pour modifier.',
      review_timeline: 'Journal des révisions',
      evt_UPLOADED: 'Document soumis avec succès',
      evt_PENDING: 'En cours de révision',
      evt_APPROVED: 'Document approuvé',
      evt_REJECTED: 'Document refusé',
      evt_EXPIRED: 'Document expiré',
      rejection_reason: 'Motif du refus',
      view_image: 'Afficher en plein écran',
      loading_history: 'Chargement du journal...',
      no_history: 'Aucun historique pour l\'instant.',
      ver_badge: 'Version {{v}}',
      expiry_section: 'Validité',
      status_section: 'Statut actuel',
      err_real_name_required: 'La soumission nécessite votre vrai nom. Veuillez mettre à jour votre profil avant de continuer.',
      rule_heading: '📋 Consignes de numérisation :',
      under_review: 'En révision',
      approved: 'Approuvé ✓',
      rejected: 'Refusé ❌',
      expired: 'Expiré ⚠️',
      error: 'Erreur',
      success: 'Succès',
      continue_btn: 'Continuer',
      quality_checking: 'Vérification de la clarté du document...',
      blurry_warning_title: '⚠️ Attention : Image potentiellement floue',
      blurry_warning_desc: 'Assurez-vous que le texte et les numéros sont parfaitement lisibles.',
      retake_photo: '🔄 Reprendre',
      force_use_photo: 'Utiliser la photo',
      confirm_and_upload: '✅ Confirmer et soumettre',
      success_upload: 'Document téléchargé avec succès pour vérification.',
    },
    INSURANCE_POLICY: { title: 'Attestation d\'Assurance', desc: 'Attestation de responsabilité civile professionnelle' },
    REGISTRE_COMMERCE: { title: 'Registre du Commerce', desc: 'Copie récente du registre du commerce' },
    TECHNICAL_INSPECTION: { title: 'Contrôle Technique', desc: 'Procès-verbal de contrôle technique à jour' },
    RENTAL_AGREEMENT: { title: 'Contrat de Location', desc: 'Contrat d\'affrètement ou de location du véhicule' },
    PROFESSIONAL_PERMIT: { title: 'Permis de Confiance', desc: 'Permis de confiance professionnel de transport' },
    TAXI_AUTHORIZATION: { title: 'Agrément Taxi', desc: 'Autorisation administrative officielle de taxi' },
    MUNICIPAL_AUTHORIZATION: { title: 'Autorisation Municipale', desc: 'Autorisation municipale locale de transport' },
    SPECIAL_AUTHORIZATION: { title: 'Autorisation Spéciale', desc: 'Autorisation spéciale exceptionnelle de transport' },
    COMPANY_DOCS: { title: 'Dossier Entreprise', desc: 'Statuts officiels et informations de l\'entreprise' },
    FLEET_PERMIT: { title: 'Autorisation Flotte', desc: 'Autorisation de gestion de flotte délivrée' },
    ADDITIONAL_DOC: { title: 'Document Supplémentaire', desc: 'Toute pièce demandée par l\'administration' },
    CARTE_GRISE: { title: 'Carte Grise', desc: 'Photo lisible de la carte grise du véhicule' },
    DRIVING_LICENSE: { title: 'Permis de Conduire', desc: 'Photo recto de votre permis de conduire original' },
    IDENTITY_CARD: { title: 'Pièce d\'identité ou Passeport', desc: 'Photo de votre carte nationale ou passeport' },
  },
  es: {
    ui: {
      not_uploaded: 'No enviado aún',
      upload_cta: 'Envíe este documento para iniciar la verificación',
      re_capture: '🔄 Volver a tomar',
      upload_new: 'Subir nueva versión',
      capture_btn: '📸 Fotografiar documento',
      expires_in: 'Vence en {{days}} días',
      expires_soon: 'En {{days}} días ⚠️',
      expires_tomorrow: 'Vence mañana ⚠️',
      expired_since: 'Expirado hace {{days}} días',
      no_expiry: 'Sin fecha de vencimiento',
      expiry_label: 'Fecha de vencimiento',
      version_label: 'Versión {{v}}',
      approved_lock: 'Documento aprobado y bloqueado. Contacte soporte para modificar.',
      review_timeline: 'Historial de revisiones',
      evt_UPLOADED: 'Documento enviado con éxito',
      evt_PENDING: 'En revisión',
      evt_APPROVED: 'Documento aprobado',
      evt_REJECTED: 'Documento rechazado',
      evt_EXPIRED: 'Documento caducado',
      rejection_reason: 'Motivo del rechazo',
      view_image: 'Ver a pantalla completa',
      loading_history: 'Cargando historial...',
      no_history: 'Sin historial de revisión todavía.',
      ver_badge: 'Versión {{v}}',
      expiry_section: 'Vigencia',
      status_section: 'Estado actual',
      err_real_name_required: 'El envío requiere su nombre real. Actualice su perfil antes de continuar.',
      rule_heading: '📋 Instrucciones de captura:',
      under_review: 'En revisión',
      approved: 'Aprobado ✓',
      rejected: 'Rechazado ❌',
      expired: 'Caducado ⚠️',
      error: 'Error',
      success: 'Éxito',
      continue_btn: 'Continuar',
      quality_checking: 'Comprobando nitidez del documento...',
      blurry_warning_title: '⚠️ Atención: Imagen potencialmente borrosa',
      blurry_warning_desc: 'Asegúrese de que el texto y los números sean perfectamente legibles.',
      retake_photo: '🔄 Repetir',
      force_use_photo: 'Usar foto',
      confirm_and_upload: '✅ Confirmar y subir',
      success_upload: 'Documento subido correctamente para su revisión.',
    },
    INSURANCE_POLICY: { title: 'Seguro del Vehículo', desc: 'Certificado de seguro comercial de transporte' },
    REGISTRE_COMMERCE: { title: 'Registro Mercantil', desc: 'Certificado fiscal del registro de la organización' },
    TECHNICAL_INSPECTION: { title: 'Inspección Técnica', desc: 'Certificado técnico de seguridad vehicular vigente' },
    RENTAL_AGREEMENT: { title: 'Contrato de Arrendamiento', desc: 'Contrato de renting comercial del automóvil' },
    PROFESSIONAL_PERMIT: { title: 'Permiso Profesional', desc: 'Copia de tarjeta de permiso profesional' },
    TAXI_AUTHORIZATION: { title: 'Licencia de Taxi', desc: 'Tarjeta de autorización municipal de taxi' },
    MUNICIPAL_AUTHORIZATION: { title: 'Autorización Municipal', desc: 'Copias del permiso de transporte local' },
    SPECIAL_AUTHORIZATION: { title: 'Autorización Especial', desc: 'Autorización de conducción excepcional' },
    COMPANY_DOCS: { title: 'Estatuto de la Empresa', desc: 'Presentación legal de la empresa' },
    FLEET_PERMIT: { title: 'Permiso de Flota', desc: 'Autorizaciones expedidas para la flota empresarial' },
    ADDITIONAL_DOC: { title: 'Archivo Adicional', desc: 'Cualquier otro documento requerido por la gerencia' },
    CARTE_GRISE: { title: 'Permiso de Circulación (Tarjeta Gris)', desc: 'Foto del documento de registro del vehículo' },
    DRIVING_LICENSE: { title: 'Permiso de Conducir', desc: 'Foto clara de la parte frontal de su licencia' },
    IDENTITY_CARD: { title: 'Documento Nacional o Pasaporte', desc: 'Foto de tarjeta de identidad o pasaporte' },
  },
  en: {
    ui: {
      not_uploaded: 'Not uploaded yet',
      upload_cta: 'Upload this document to start verification',
      re_capture: '🔄 Retake Photo',
      upload_new: 'Upload New Version',
      capture_btn: '📸 Capture Document',
      expires_in: 'Expires in {{days}} days',
      expires_soon: 'In {{days}} days ⚠️',
      expires_tomorrow: 'Expires tomorrow ⚠️',
      expired_since: 'Expired {{days}} days ago',
      no_expiry: 'No expiration date',
      expiry_label: 'Expiration Date',
      version_label: 'Version {{v}}',
      approved_lock: 'This document is approved and locked. Contact support to update.',
      review_timeline: 'Review History',
      evt_UPLOADED: 'Document uploaded successfully',
      evt_PENDING: 'Under admin review',
      evt_APPROVED: 'Document approved',
      evt_REJECTED: 'Document rejected',
      evt_EXPIRED: 'Document expired',
      rejection_reason: 'Rejection reason',
      view_image: 'View Full Screen',
      loading_history: 'Fetching review history...',
      no_history: 'No review history yet.',
      ver_badge: 'Version {{v}}',
      expiry_section: 'Validity',
      status_section: 'Current Status',
      err_real_name_required: 'Document submission requires your real name. Please update your profile before uploading.',
      rule_heading: '📋 Document Guidelines:',
      under_review: 'Under Review',
      approved: 'Approved ✓',
      rejected: 'Rejected ❌',
      expired: 'Expired ⚠️',
      error: 'Error',
      success: 'Success',
      continue_btn: 'Continue',
      quality_checking: 'Checking document clarity...',
      blurry_warning_title: '⚠️ Warning: Image may be blurry',
      blurry_warning_desc: 'Ensure all text and document numbers are clearly visible.',
      retake_photo: '🔄 Retake',
      force_use_photo: 'Use Photo',
      confirm_and_upload: '✅ Confirm & Upload',
      success_upload: 'Document successfully uploaded for verification.',
    },
    INSURANCE_POLICY: { title: 'Vehicle Insurance', desc: 'Valid professional liability transport insurance' },
    REGISTRE_COMMERCE: { title: 'Commercial Registry', desc: 'Official certificate of commercial registry' },
    TECHNICAL_INSPECTION: { title: 'Technical Inspection', desc: 'Valid safety technical inspection certificate' },
    RENTAL_AGREEMENT: { title: 'Rental Agreement', desc: 'Vehicle hire or charter agreement' },
    PROFESSIONAL_PERMIT: { title: 'Professional Trust Permit', desc: 'Copy of valid professional transport permit' },
    TAXI_AUTHORIZATION: { title: 'Taxi License', desc: 'Copy of the official taxi permit registration' },
    MUNICIPAL_AUTHORIZATION: { title: 'Municipal Authorization', desc: 'Local municipality issued transport license' },
    SPECIAL_AUTHORIZATION: { title: 'Special Authorization', desc: 'Exceptional route transport authorization' },
    COMPANY_DOCS: { title: 'Company Portfolio', desc: 'Company registration or constitution details' },
    FLEET_PERMIT: { title: 'Fleet Operations Permit', desc: 'Official permit issued for managing fleet' },
    ADDITIONAL_DOC: { title: 'Additional File', desc: 'Any extra document requested by admins' },
    CARTE_GRISE: { title: 'Vehicle Registration (Grey Card)', desc: 'Clear photo of official vehicle registration' },
    DRIVING_LICENSE: { title: 'Driver\'s License', desc: 'Clear front photo of your driving license' },
    IDENTITY_CARD: { title: 'National ID or Passport', desc: 'Photo of national identity card or passport' },
  },
};

const getDocTitle = (type: string, lang: string) => {
  const activeLang = (lang || 'ar').toLowerCase().split('-')[0];
  const langKey = (activeLang === 'fr' || activeLang === 'es' || activeLang === 'en') ? activeLang : 'ar';
  return DOC_DETAIL_TRANSLATIONS[langKey][type]?.title || DOC_DETAIL_TRANSLATIONS['ar'][type]?.title || type.replace(/_/g, ' ');
};

const getDocDesc = (type: string, lang: string) => {
  const activeLang = (lang || 'ar').toLowerCase().split('-')[0];
  const langKey = (activeLang === 'fr' || activeLang === 'es' || activeLang === 'en') ? activeLang : 'ar';
  return DOC_DETAIL_TRANSLATIONS[langKey][type]?.desc || DOC_DETAIL_TRANSLATIONS['ar'][type]?.desc || '';
};

const getUIText = (key: string, lang: string) => {
  const activeLang = (lang || 'ar').toLowerCase().split('-')[0];
  const langKey = (activeLang === 'fr' || activeLang === 'es' || activeLang === 'en') ? activeLang : 'ar';
  return DOC_DETAIL_TRANSLATIONS[langKey].ui[key] || DOC_DETAIL_TRANSLATIONS['ar'].ui[key] || key;
};

const computeDaysLeft = (expiresAt: string | null): number | null => {
  if (!expiresAt) return null;
  return Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86400000);
};

const getDocRules = (type: string, lang: string) => {
  const activeLang = (lang || 'ar').toLowerCase().split('-')[0];
  const isAr = activeLang === 'ar';
  const isFr = activeLang === 'fr';
  const isEs = activeLang === 'es';

  switch (type) {
    case 'INSURANCE_POLICY':
      if (isAr) return ['وضوح تاريخ بداية ونهاية التغطية التأمينية.', 'وضوح رقم وثيقة التأمين ورقم اللوحة.'];
      if (isFr) return ['Lisibilité des dates de couverture d\'assurance.', 'Numéro de police et d\'immatriculation clairs.'];
      if (isEs) return ['Fechas de cobertura bien visibles.', 'Número de póliza y matrícula claros.'];
      return ['Clear start & end coverage dates.', 'Policy number & plate number clearly visible.'];

    case 'REGISTRE_COMMERCE':
      if (isAr) return ['وضوح رقم السجل التجاري (RC) والتعريف الموحد (ICE).', 'وضوح اسم الشركة والنشاط المعتمد.'];
      if (isFr) return ['Numéro RC et identifiant commun (ICE) lisibles.', 'Raison sociale et activité claires.'];
      if (isEs) return ['Número RC e identificador (ICE) claros.', 'Nombre de empresa y actividad claros.'];
      return ['Clear RC & ICE identification numbers.', 'Company name & activity clearly visible.'];

    case 'TECHNICAL_INSPECTION':
      if (isAr) return ['وضوح تاريخ الفحص وتاريخ الصلاحية القادم.', 'وضوح رقم الإطار الحديدي (Chassis) ورقم اللوحة.'];
      if (isFr) return ['Date du contrôle et date de validité lisibles.', 'Numéro de châssis et immatriculation clairs.'];
      if (isEs) return ['Fecha de inspección y validez bien visibles.', 'Número de chasis y matrícula claros.'];
      return ['Clear inspection date & validity date.', 'Chassis number & plate number clearly visible.'];

    case 'RENTAL_AGREEMENT':
      if (isAr) return ['وضوح أسماء أطراف العقد (المؤجر والمستأجر).', 'وضوح تواريخ بداية ونهاية عقد الاستئجار.'];
      if (isFr) return ['Noms des parties (loueur et locataire) lisibles.', 'Dates de début et de fin du contrat claires.'];
      if (isEs) return ['Nombres del arrendador y arrendatario claros.', 'Fechas de inicio y fin de contrato visibles.'];
      return ['Clear lessor & lessee party names.', 'Contract start & end dates clearly visible.'];

    case 'PROFESSIONAL_PERMIT':
      if (isAr) return ['وضوح رقم رخصة الثقة أو البطاقة المهنية والصورة.', 'وضوح تاريخ الصلاحية والجهة البلدية المصدرة.'];
      if (isFr) return ['Numéro de permis et photo d\'identité lisibles.', 'Date de validité et autorité émettrice claires.'];
      if (isEs) return ['Número de tarjeta y foto claros.', 'Fecha de validez y autoridad emisora visibles.'];
      return ['Clear permit number & photo.', 'Expiration date & issuing authority visible.'];

    case 'TAXI_AUTHORIZATION':
      if (isAr) return ['وضوح رقم مأذونية أو رخصة سيارة الأجرة.', 'وضوح اسم صاحب الترخيص ورقم السيارة.'];
      if (isFr) return ['Numéro d\'agrément taxi lisible.', 'Nom du titulaire et immatriculation clairs.'];
      if (isEs) return ['Número de licencia de taxi claro.', 'Nombre del titular y número de taxi visibles.'];
      return ['Clear taxi authorization permit number.', 'License holder name & taxi details visible.'];

    default:
      if (isAr) return ['عدم تغطية البيانات أو النصوص بأصابعك.', 'تجنب الفلاش المباشر والانعكاسات الضوئية على الوثيقة.'];
      if (isFr) return ['Ne masquez aucun texte avec vos doigts.', 'Évitez les reflets lumineux intenses sur la pièce.'];
      if (isEs) return ['No cubra el texto con sus dedos.', 'Evite reflejos de luz intensos en el documento.'];
      return ['Do not cover any text with fingers.', 'Avoid direct flash glare or heavy reflections.'];
  }
};

// ── Main Screen ───────────────────────────────────────────────────────────────
export const DocumentDetailScreen = () => {
  const { colors, isDarkMode } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const activeLang = (i18n.language || 'ar').toLowerCase().split('-')[0];
  const lang = (activeLang === 'fr' || activeLang === 'es' || activeLang === 'en') ? activeLang : 'ar';
  const isRTL = lang === 'ar';

  const { type, uploadedDoc } = route.params as {
    type: string;
    uploadedDoc?: any;
  };

  const docTitle = getDocTitle(type, lang);
  const docDesc = getDocDesc(type, lang);
  const expires = (type !== 'REGISTRE_COMMERCE' && type !== 'COMPANY_DOCS' && type !== 'ADDITIONAL_DOC');

  const [currentDoc, setCurrentDoc] = useState<any>(uploadedDoc || null);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Camera flow
  const [showCamera, setShowCamera] = useState(false);
  const [captureUri, setCaptureUri] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [checkingQuality, setCheckingQuality] = useState(false);
  const [failedQualityCheck, setFailedQualityCheck] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);

  // ── Full Name Modal (إذا كان المستخدم جديداً ولم يدخل اسمه بعد) ────────────
  const [showNameModal, setShowNameModal] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);

  const scanAnim = useRef(new Animated.Value(0)).current;
  const cameraRef = useRef<any>(null);
  const device = useCameraDevice('back');

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
      console.warn('[DocumentDetailScreen] fetchHistory error:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

const getLocalizedApiError = (msg: string, lang: string) => {
  const lower = (msg || '').toLowerCase();
  const activeLang = (lang || 'ar').toLowerCase().split('-')[0];
  const isAr = activeLang === 'ar';
  const isFr = activeLang === 'fr';
  const isEs = activeLang === 'es';

  if (lower.includes('opening vehicle update request') || lower.includes('update request') || lower.includes('pending vehicle')) {
    if (isAr) return 'لديك بالفعل طلب سارٍ قيد المراجعة لتعديل المركبة أو الوثائق. يرجى انتظار رد الإدارة قبل إرسال طلب جديد.';
    if (isFr) return 'Vous avez déjà une demande de mise à jour de véhicule en cours. Veuillez attendre la validation de l\'administration avant de soumettre une nouvelle demande.';
    if (isEs) return 'Ya tiene una solicitud de actualización de vehículo en curso. Espere la revisión de la administración antes de enviar otra.';
    return 'You already have an open vehicle update request under review. Please wait for admin response.';
  }

  if (lower.includes('real name') || lower.includes('new user') || lower.includes('kyc submission')) {
    if (isAr) return 'يتطلب رفع الوثائق إدخال اسمك الحقيقي. يرجى تحديث اسمك في الملف الشخصي بدلاً من "New User" قبل التوثيق.';
    if (isFr) return 'La soumission nécessite votre vrai nom. Veuillez mettre à jour votre nom dans le profil avant de télécharger des documents.';
    if (isEs) return 'El envío de documentos requiere su nombre real. Por favor actualice su perfil antes de continuar.';
    return 'Document submission requires your real name. Please update your profile before uploading.';
  }

  if (lower.includes('access denied') || lower.includes('requires one of the following roles') || lower.includes('role')) {
    if (isAr) return 'عذراً، هذا الإجراء يتطلب حساب سائق مفعل (DRIVER). يرجى التأكد من تسجيل الدخول بحساب السائق.';
    if (isFr) return 'Accès refusé: Cette action nécessite un compte chauffeur (DRIVER).';
    if (isEs) return 'Acceso denegado: Esta acción requiere una cuenta de conductor (DRIVER).';
    return 'Access denied: This action requires a driver account (DRIVER).';
  }

  if (isAr) return msg || 'حدث خطأ أثناء رفع الوثيقة، يرجى إعادة المحاولة.';
  if (isFr) return msg || 'Une erreur est survenue lors du téléchargement du document. Veuillez réessayer.';
  if (isEs) return msg || 'Ocurrió un error al cargar el documento. Inténtelo de nuevo.';
  return msg || 'An error occurred while uploading document. Please try again.';
};

  const openCamera = async () => {
    const hasPerm = cameraPermission || (await requestCameraPermission());
    if (!hasPerm) {
      const permMsg = (lang === 'fr')
        ? 'L\'autorisation d\'accès à la caméra est requise.'
        : (lang === 'es')
        ? 'Se requiere permiso de cámara.'
        : (lang === 'en')
        ? 'Camera permission is required.'
        : 'من فضلك اسمح للتطبيق بالوصول للكاميرا لالتقاط الوثيقة.';
      Alert.alert(getUIText('error', lang), permMsg);
      return;
    }
    setCaptureUri(null);
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
      Animated.timing(scanAnim, { toValue: 1, duration: 1800, useNativeDriver: true }).start(() => {
        setCheckingQuality(false);
      });
    } catch (err) {
      const failMsg = (lang === 'fr')
        ? 'Échec de la capture de la photo.'
        : (lang === 'es')
        ? 'Error al capturar la foto.'
        : (lang === 'en')
        ? 'Capture failed.'
        : 'فشل التقاط الصورة، يرجى المحاولة مرة أخرى.';
      Alert.alert(getUIText('error', lang), failMsg);
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
      await api.post('/driver/documents/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setShowCamera(false);
      Alert.alert(getUIText('success', lang), getUIText('success_upload', lang));
      fetchHistory();
    } catch (err: any) {
      const rawMsg = err.response?.data?.message || err.message || '';
      const localizedError = getLocalizedApiError(rawMsg, lang);
      Alert.alert(getUIText('error', lang), localizedError);
    } finally {
      setUploading(false);
    }
  };

  /**
   * Checks if the driver has a real fullName before uploading.
   * If missing, shows the name modal first, then calls the upload after saving.
   */
  const handleUploadWithNameCheck = async () => {
    try {
      const res = await api.get('/driver/profile');
      const profile = res.data;
      if (!profile?.fullName || profile.fullName.trim() === '' || profile.fullName.trim().toLowerCase() === 'new user') {
        setShowNameModal(true);
        return;
      }
    } catch {
      // If profile fetch fails, proceed with upload directly
    }
    handleUpload();
  };

  const handleSaveNameAndUpload = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert(
        lang === 'ar' ? 'تنبيه' : lang === 'fr' ? 'Champs requis' : 'Required',
        lang === 'ar'
          ? 'يرجى إدخال الاسم الشخصي والاسم العائلي.'
          : lang === 'fr'
          ? 'Veuillez saisir votre prénom et votre nom.'
          : 'Please enter both first name and last name.',
      );
      return;
    }
    try {
      setIsSavingName(true);
      await api.patch('/driver/profile', {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        fullName: `${firstName.trim()} ${lastName.trim()}`,
      });
      setShowNameModal(false);
      // Now proceed with the actual upload
      handleUpload();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        (lang === 'ar' ? 'فشل حفظ الاسم. حاول مجدداً.' : lang === 'fr' ? 'Erreur lors de l\'enregistrement.' : 'Failed to save. Try again.');
      Alert.alert(lang === 'ar' ? 'خطأ' : 'Error', msg);
    } finally {
      setIsSavingName(false);
    }
  };

  const daysLeft = computeDaysLeft(currentDoc?.expiresAt);
  const isExpired = currentDoc?.status === 'EXPIRED' || (daysLeft !== null && daysLeft <= 0);
  const isApproved = currentDoc?.status === 'APPROVED';
  const isRejected = currentDoc?.status === 'REJECTED';
  const isPending = currentDoc?.status === 'PENDING';

  const getStatusBadge = () => {
    if (isExpired)  return { text: getUIText('expired', lang),     color: '#F97316', bg: 'rgba(249,115,22,0.12)'  };
    if (isApproved) return { text: getUIText('approved', lang),    color: '#22C55E', bg: 'rgba(34,197,94,0.12)'   };
    if (isRejected) return { text: getUIText('rejected', lang),    color: '#EF4444', bg: 'rgba(239,68,68,0.12)'   };
    if (isPending)  return { text: getUIText('under_review', lang),color: '#F59E0B', bg: 'rgba(245,158,11,0.12)'  };
    return            { text: getUIText('not_uploaded', lang), color: colors.textMuted, bg: colors.surfaceAlt };
  };

  const badge = getStatusBadge();

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

  const isLastEvent = (idx: number) => idx === history.length - 1;

  const canReupload = isRejected || isExpired;
  const canUpload = !currentDoc;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {/* Header Bar */}
      <View style={[styles.header, { borderBottomColor: colors.border }, isRTL && styles.headerRTL]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          {isRTL ? <ChevronRight size={24} color={colors.textPrimary} /> : <ChevronLeft size={24} color={colors.textPrimary} />}
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]} numberOfLines={1}>{docTitle}</Text>
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
                <Text style={styles.imageOverlayText}>{getUIText('view_image', lang)}</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={[styles.docImagePlaceholder, { backgroundColor: colors.surfaceAlt }]}>
              <FileText size={52} color={colors.textMuted} />
              <Text style={[styles.placeholderText, { color: colors.textMuted }]}>{getUIText('not_uploaded', lang)}</Text>
            </View>
          )}
        </View>

        {/* Status + Expiry Info */}
        <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Current Status */}
          <View style={[styles.infoRow, isRTL && { flexDirection: 'row-reverse' }]}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{getUIText('status_section', lang)}</Text>
            <View style={[styles.statusBadge, { backgroundColor: badge.bg, borderColor: badge.color }]}>
              <Text style={[styles.statusBadgeText, { color: badge.color }]}>{badge.text}</Text>
            </View>
          </View>

          {/* Rejection Reason Box */}
          {isRejected && currentDoc?.rejectionReason && (
            <View style={[styles.rejectionBox, { backgroundColor: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.2)' }]}>
              <BadgeAlert size={16} color="#EF4444" style={{ marginRight: 8 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.rejectionLabel}>{getUIText('rejection_reason', lang)}</Text>
                <Text style={styles.rejectionText}>{currentDoc.rejectionReason}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Guidelines Card per Document Type */}
        <View style={[styles.guidelinesCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }, isRTL && { flexDirection: 'row-reverse' }]}>
            <Info size={18} color={colors.primary} />
            <Text style={[styles.guidelinesTitle, { color: colors.textPrimary }]}>
              {getUIText('rule_heading', lang)}
            </Text>
          </View>
          {getDocRules(type, lang).map((rule: string, rIdx: number) => (
            <View key={rIdx} style={[styles.ruleLineItem, isRTL && { flexDirection: 'row-reverse' }]}>
              <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '700' }}>•</Text>
              <Text style={[styles.ruleLineText, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
                {rule}
              </Text>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        {canUpload && (
          <View style={styles.actionSection}>
            <Text style={[styles.actionHint, { color: colors.textSecondary }]}>{getUIText('upload_cta', lang)}</Text>
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.primary }]} onPress={openCamera}>
              <CameraIcon size={18} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.primaryBtnText}>{getUIText('capture_btn', lang)}</Text>
            </TouchableOpacity>
          </View>
        )}

        {canReupload && (
          <View style={styles.actionSection}>
            <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: isRejected ? '#EF4444' : '#F97316' }]} onPress={openCamera}>
              <RefreshCw size={18} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.primaryBtnText}>{getUIText('re_capture', lang)}</Text>
            </TouchableOpacity>
          </View>
        )}

        {isApproved && (
          <View style={[styles.lockedBanner, { backgroundColor: 'rgba(34,197,94,0.06)', borderColor: 'rgba(34,197,94,0.2)' }]}>
            <Lock size={16} color="#22C55E" style={{ marginRight: 8 }} />
            <Text style={[styles.lockedText, { color: '#22C55E' }]}>{getUIText('approved_lock', lang)}</Text>
          </View>
        )}

        {/* Review Timeline */}
        <View style={[styles.timelineCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.timelineHeading, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>
            {getUIText('review_timeline', lang)}
          </Text>

          {loadingHistory ? (
            <View style={styles.historyLoader}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[styles.historyLoaderText, { color: colors.textSecondary }]}>{getUIText('loading_history', lang)}</Text>
            </View>
          ) : history.length === 0 ? (
            <Text style={[styles.noHistoryText, { color: colors.textMuted }]}>{getUIText('no_history', lang)}</Text>
          ) : (
            <View style={styles.timelineList}>
              {history.map((evt, idx) => (
                <View key={idx} style={[styles.timelineItem, isRTL && styles.timelineItemRTL]}>
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

                  <View style={[styles.timelineContent, { marginBottom: isLastEvent(idx) ? 0 : 20 }]}>
                    <View style={styles.timelineContentTop}>
                      <Text style={[styles.timelineEventLabel, { color: colors.textPrimary }]}>
                        {getUIText(`evt_${evt.eventType}`, lang)}
                      </Text>
                    </View>
                    <Text style={[styles.timelineDate, { color: colors.textMuted }]}>
                      {new Date(evt.date).toLocaleDateString(lang)}
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

      {/* ── Camera Modal (Frameless Open ViewFinder for Optional Documents) ─────── */}
      <Modal visible={showCamera} animationType="slide" transparent={false}>
        <View style={styles.cameraContainer}>
          <TouchableOpacity style={styles.cameraCloseBtn} onPress={() => setShowCamera(false)}>
            <X size={24} color="#FFF" />
          </TouchableOpacity>

          {!captureUri && device && (
            <View style={{ flex: 1 }}>
              <Camera ref={cameraRef} style={StyleSheet.absoluteFill} device={device} photo isActive={showCamera} />
              
              {/* Clean Frameless Viewfinder Banner */}
              <View style={styles.openCameraHeaderBanner}>
                <Text style={styles.openCameraTitle}>{docTitle}</Text>
                <Text style={styles.openCameraSub}>{docDesc}</Text>
              </View>

              <View style={styles.shutterWrap}>
                <TouchableOpacity activeOpacity={0.8} style={styles.shutterBtnCircle} onPress={triggerCapture}>
                  <View style={[styles.shutterInner, { backgroundColor: colors.primary }]} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {captureUri && (
            <View style={{ flex: 1 }}>
              <Image source={{ uri: captureUri }} style={StyleSheet.absoluteFill} />
              {!checkingQuality && (
                <View style={styles.previewBtns}>
                  <TouchableOpacity style={[styles.previewBtn, styles.btnRetake]} onPress={() => setCaptureUri(null)}>
                    <Text style={styles.retakeText}>{getUIText('retake_photo', lang)}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.previewBtn, { backgroundColor: colors.primary }]} onPress={handleUploadWithNameCheck}>
                    {uploading ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.confirmText}>{getUIText('confirm_and_upload', lang)}</Text>}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>
      </Modal>

      {/* Full image Modal */}
      <Modal visible={showFullImage} transparent animationType="fade" onRequestClose={() => setShowFullImage(false)}>
        <View style={styles.fullImageModal}>
          <TouchableOpacity style={styles.fullImageClose} onPress={() => setShowFullImage(false)}>
            <X size={26} color="#FFF" />
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

      {/* ── Full Name Modal ──────────────────────────────────────────────────── */}
      <Modal
        visible={showNameModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => !isSavingName && setShowNameModal(false)}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={styles.nameModalOverlay}>
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={() => !isSavingName && setShowNameModal(false)}
            />
            <View style={[styles.nameModalSheet, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
              {/* Drag Handle */}
              <View style={[styles.nameModalHandle, { backgroundColor: colors.border }]} />

              {/* Header */}
              <View style={[styles.nameModalHeaderBlk, isRTL && { alignItems: 'flex-end' }]}>
                <View style={[styles.nameModalIconBadge, { backgroundColor: colors.primary + '18' }]}>
                  <User size={24} color={colors.primary} />
                </View>
                <Text style={[styles.nameModalTitle, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>
                  {lang === 'ar' ? 'أكمل معلوماتك الشخصية' : lang === 'fr' ? 'Complétez votre profil' : 'Complete Your Profile'}
                </Text>
                <Text style={[styles.nameModalSub, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
                  {lang === 'ar'
                    ? 'لإرسال الوثيقة، نحتاج إلى اسمك الحقيقي كما هو مكتوب في بطاقة الهوية.'
                    : lang === 'fr'
                    ? `Pour soumettre ce document, votre vrai nom est requis tel qu'il figure sur votre pièce d'identité.`
                    : 'To upload this document, we need your full legal name as it appears on your ID.'}
                </Text>
              </View>

              {/* Inputs */}
              <View style={[styles.nameModalInputsRow, isRTL && { flexDirection: 'row-reverse' }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.nameInputLabel, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
                    {lang === 'ar' ? 'الاسم الشخصي *' : lang === 'fr' ? 'Prénom *' : 'First Name *'}
                  </Text>
                  <TextInput
                    style={[
                      styles.nameInput,
                      {
                        backgroundColor: colors.surfaceAlt,
                        color: colors.textPrimary,
                        borderColor: firstName.trim() ? colors.primary + '80' : colors.border,
                        textAlign: isRTL ? 'right' : 'left',
                      },
                    ]}
                    placeholder={lang === 'ar' ? 'مثال: محمد' : 'e.g. John'}
                    placeholderTextColor={colors.textMuted}
                    value={firstName}
                    onChangeText={setFirstName}
                    autoCapitalize="words"
                    returnKeyType="next"
                    editable={!isSavingName}
                  />
                </View>
                <View style={{ width: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.nameInputLabel, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
                    {lang === 'ar' ? 'الاسم العائلي *' : lang === 'fr' ? 'Nom *' : 'Last Name *'}
                  </Text>
                  <TextInput
                    style={[
                      styles.nameInput,
                      {
                        backgroundColor: colors.surfaceAlt,
                        color: colors.textPrimary,
                        borderColor: lastName.trim() ? colors.primary + '80' : colors.border,
                        textAlign: isRTL ? 'right' : 'left',
                      },
                    ]}
                    placeholder={lang === 'ar' ? 'مثال: العمري' : 'e.g. Doe'}
                    placeholderTextColor={colors.textMuted}
                    value={lastName}
                    onChangeText={setLastName}
                    autoCapitalize="words"
                    returnKeyType="done"
                    onSubmitEditing={handleSaveNameAndUpload}
                    editable={!isSavingName}
                  />
                </View>
              </View>

              {/* Preview full name */}
              {firstName.trim() && lastName.trim() && (
                <View style={[styles.namePreviewRow, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' }]}>
                  <CheckCircle size={14} color={colors.primary} />
                  <Text style={[styles.namePreviewText, { color: colors.primary }]}>
                    {firstName.trim()} {lastName.trim()}
                  </Text>
                </View>
              )}

              {/* Confirm Button */}
              <TouchableOpacity
                style={[
                  styles.nameConfirmBtn,
                  {
                    backgroundColor: firstName.trim() && lastName.trim() ? colors.primary : colors.surfaceAlt,
                    opacity: isSavingName ? 0.7 : 1,
                  },
                ]}
                onPress={handleSaveNameAndUpload}
                disabled={isSavingName || !firstName.trim() || !lastName.trim()}
                activeOpacity={0.85}
              >
                {isSavingName ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={[styles.nameConfirmBtnText, { color: firstName.trim() && lastName.trim() ? '#fff' : colors.textMuted }]}>
                    {lang === 'ar' ? 'متابعة ورفع الوثيقة' : lang === 'fr' ? 'Continuer et télécharger' : 'Continue & Upload'}
                  </Text>
                )}
              </TouchableOpacity>

              <View style={{ height: 24 }} />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </SafeAreaView>
  );
};

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
  headerRTL: { flexDirection: 'row-reverse' },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  scrollContent: { padding: 16 },
  imageCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden', marginBottom: 16 },
  docImage: { width: '100%', height: 200 },
  imageOverlay: {
    position: 'absolute', bottom: 10, right: 10,
    backgroundColor: 'rgba(0,0,0,0.65)', paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  imageOverlayText: { color: '#FFF', fontSize: 12, fontWeight: '600' },
  docImagePlaceholder: { height: 180, justifyContent: 'center', alignItems: 'center', gap: 8 },
  placeholderText: { fontSize: 13, fontWeight: '600' },
  infoCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { fontSize: 13, fontWeight: '600' },
  statusBadge: { borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusBadgeText: { fontSize: 12, fontWeight: '700' },
  rejectionBox: {
    flexDirection: 'row', borderWidth: 1, borderRadius: 10, padding: 12, marginTop: 14, alignItems: 'flex-start',
  },
  rejectionLabel: { color: '#EF4444', fontSize: 11, fontWeight: '700', marginBottom: 3 },
  rejectionText: { color: '#EF4444', fontSize: 12, lineHeight: 16 },
  guidelinesCard: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 16 },
  guidelinesTitle: { fontSize: 14, fontWeight: '700' },
  ruleLineItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 6 },
  ruleLineText: { fontSize: 13, flex: 1, lineHeight: 18 },
  actionSection: { marginBottom: 16 },
  actionHint: { fontSize: 13, lineHeight: 17, marginBottom: 10, textAlign: 'center' },
  primaryBtn: {
    height: 52, borderRadius: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
  },
  primaryBtnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  lockedBanner: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 16,
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
    width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center',
  },
  timelineConnector: { width: 2, flex: 1, marginTop: 4, marginBottom: 4, minHeight: 16 },
  timelineContent: { flex: 1, paddingBottom: 0 },
  timelineContentTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  timelineEventLabel: { fontSize: 13.5, fontWeight: '600' },
  timelineDate: { fontSize: 11, marginTop: 3 },
  timelineRejectionNote: { color: '#EF4444', fontSize: 11.5, marginTop: 4, fontStyle: 'italic' },
  cameraContainer: { flex: 1, backgroundColor: '#000' },
  cameraCloseBtn: {
    position: 'absolute', top: 50, right: 20, width: 44, height: 44,
    borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center', zIndex: 50,
  },
  openCameraHeaderBanner: {
    position: 'absolute', top: 60, left: 20, right: 70, zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.65)', padding: 12, borderRadius: 12,
  },
  openCameraTitle: { color: '#FFF', fontSize: 15, fontWeight: '700', marginBottom: 2 },
  openCameraSub: { color: '#94A3B8', fontSize: 12, lineHeight: 16 },
  shutterWrap: { position: 'absolute', bottom: 40, left: 0, right: 0, alignItems: 'center', zIndex: 10 },
  shutterBtnCircle: { width: 76, height: 76, borderRadius: 38, borderWidth: 4, borderColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
  shutterInner: { width: 60, height: 60, borderRadius: 30 },
  previewBtns: { position: 'absolute', bottom: 40, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', gap: 15 },
  previewBtn: { flex: 1, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  btnRetake: { backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  retakeText: { color: '#FFF', fontWeight: '600' },
  confirmText: { color: '#FFF', fontWeight: '700' },
  fullImageModal: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  fullImageClose: { position: 'absolute', top: 50, right: 20, zIndex: 10 },
  fullImage: { width: SCREEN_W, height: SCREEN_H * 0.8 },

  // ── Full Name Modal Styles ─────────────────────────────────────────────────
  nameModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  nameModalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  nameModalHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 16,
  },
  nameModalHeaderBlk: {
    marginBottom: 20,
  },
  nameModalIconBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  nameModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
    lineHeight: 26,
  },
  nameModalSub: {
    fontSize: 13,
    lineHeight: 18,
  },
  nameModalInputsRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  nameInputLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    marginBottom: 7,
  },
  nameInput: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: '600',
  },
  namePreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  namePreviewText: {
    fontSize: 14,
    fontWeight: '700',
  },
  nameConfirmBtn: {
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  nameConfirmBtnText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});

