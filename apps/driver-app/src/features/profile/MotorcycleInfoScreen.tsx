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
  Modal,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import {
  ChevronLeft,
  ChevronRight,
  Camera as CameraIcon,
  Check,
  X,
  Clock,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  FileCheck,
  ShieldCheck,
} from 'lucide-react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import Svg, { Circle, Path, Rect, LinearGradient, Stop, Defs, Ellipse } from 'react-native-svg';
import { useTheme } from '../../theme/ThemeContext';
import { api, BASE_URL } from '../../api/axios.instance';
import i18n from '../../i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setVehicleModeCache } from '../../hooks/useVehicleMode';

// Vision Camera & Image Resizer imports for live document camera view finder
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import ImageResizer from '@bam.tech/react-native-image-resizer';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const getImageUri = (uri: string | null | undefined): string => {
  if (!uri) return '';
  if (uri.startsWith('http') || uri.startsWith('file://') || uri.startsWith('content://') || uri.startsWith('data:')) {
    return uri;
  }
  if (uri.startsWith('/data/') || uri.startsWith('/storage/') || uri.startsWith('/var/')) {
    return `file://${uri}`;
  }
  if (uri.startsWith('/')) {
    const base = BASE_URL.replace(/\/api\/v1\/?$/, '');
    return `${base}${uri}`;
  }
  return uri;
};

// ── 4 Languages Comprehensive Dictionary (AR, FR, ES, EN) ─────────────────────
const MOTO_TRANSLATIONS = {
  ar: {
    title: 'معلومات الدراجة النارية',
    subtitle: 'سجل تفاصيل ومواصفات دراجتك النارية لربطها بحساب Yalla VTC',
    brand_label: 'العلامة التجارية',
    brand_placeholder: 'اختر الماركة (مثال: Honda, Yamaha)',
    model_label: 'الموديل',
    model_placeholder: 'اكتب الموديل (مثال: T-Max, SH 125)',
    year_label: 'سنة الصنع',
    color_label: 'لون الدراجة النارية',
    capacity_label: 'سعة المحرك (Cylinder Capacity)',
    capacity_placeholder: 'اختر السعة (مثال: 125cc, 250cc)',
    plate_label: 'رقم لوحة الترخيص',
    plate_placeholder: 'مثال: 12345-أ-15',
    reg_label: 'رقم البطاقة الرمادية',
    reg_placeholder: 'مثال: A129840B',
    photo_moto_title: 'صورة الدراجة النارية',
    photo_moto_sub: 'ضع الدراجة النارية بالكامل في إطار واضح من الجانب أو الأمام',
    photo_grey_title: 'البطاقة الرمادية للدراجة',
    photo_grey_sub: 'صورة واضحة للبطاقة الرمادية الخاصة بالدراجة النارية',
    submit_btn: 'حفظ وثائق ومعلومات الدراجة النارية',
    submitting: 'جارٍ حفظ وإرسال البيانات...',
    success_title: '✅ تم الحفظ بنجاح',
    success_msg: 'تم إرسال معلومات ووثائق الدراجة النارية بنجاح للمراجعة والتدقيق.',
    mandatory_err: 'يرجى ملء جميع الحقول المطلوبة وإرفاق الصور.',
    pending_notice: '⏳ معلومات الدراجة النارية قيد مراجعة الإدارة حالياً.',
    rejected_notice: '❌ تم رفض طلب تعديل الدراجة النارية: ',
    incomplete_title: '⚠️ بيانات غير مكتملة',
    incomplete_body: 'يرجى إكمال ملء الخانات والصور التالية قبل الحفظ:',
    confirm_save_title: '📋 تأكيد حفظ تعديلات الدراجة النارية',
    confirm_save_msg: 'هل أنت متأكد من صحة جميع المعلومات والصور التي قمت بإدخالها وتريد إرسالها للمراجعة والاعتماد؟',
    confirm_send: 'تأكيد وإرسال',
    cancel: 'إلغاء',
    error: 'خطأ',
    success: 'نجاح',
    other_brand: 'أخرى',
    license_modal_title: '📋 رخصة السياقة مطلوبة (أكثر من 50cc)',
    license_modal_msg: 'قيادة الدراجات النارية ذات سعة محرك أكبر من 50cc تتطلب رخصة سياقة قانونية من صنف A أو B. يرجى اختيار صنف رخصتك وإرفاق صورتها.',
    license_cat_a: 'صنف A / A1 (دراجات نارية)',
    license_cat_a_sub: 'رخصة سياقة خاصة بالدراجات النارية',
    license_cat_b: 'صنف B (سيارات ودراجات نارية)',
    license_cat_b_sub: 'رخصة سياقة صنف B',
    photo_license_title: 'صورة رخصة السياقة',
    photo_license_sub: 'صورة واضحة لرخصة السياقة الخاصة بك',
    license_cat_label: 'صنف رخصة السياقة',
    camera_guide_moto: 'ضع الدراجة النارية بالكامل داخل الإطار التوضيحي.',
    camera_guide_grey: 'ضع البطاقة الرمادية بوضوح داخل الإطار.',
    camera_guide_license: 'ضع رخصة السياقة بوضوح داخل الإطار.',
    preview_photo_title: 'معاينة الصورة والتحقق من الوضوح',
    retake_photo_btn: '🔄 إعادة الالتقاط',
    use_photo_btn: '✅ اعتماد الصورة',
    camera_permission_required: 'من فضلك اسمح للتطبيق بالوصول للكاميرا لالتقاط الصورة.',
    capture_failed_error: 'فشل التقاط الصورة.',
    change_type_btn: 'تغيير نوع المركبة',
    confirm_change_title: 'تغيير نوع المركبة',
    confirm_change_type_message: 'هل تريد الانتقال لتغيير نوع المركبة من دراجة نارية إلى سيارة؟',
    continue_btn: 'متابعة',
    live_camera: 'الكاميرا المباشرة (Live Camera)',
    gallery: 'معرض الصور (Gallery)',
  },
  fr: {
    title: 'Informations de la moto',
    subtitle: 'Enregistrez les détails de votre moto pour Yalla VTC',
    brand_label: 'Marque de la moto',
    brand_placeholder: 'Sélectionner (ex. Honda, Yamaha)',
    model_label: 'Modèle',
    model_placeholder: 'Saisir le modèle (ex. T-Max, SH 125)',
    year_label: 'Année de fabrication',
    color_label: 'Couleur de la moto',
    capacity_label: 'Cylindrée (cc)',
    capacity_placeholder: 'Sélectionner (ex. 125cc, 250cc)',
    plate_label: 'Plaque d\'immatriculation',
    plate_placeholder: 'ex. 12345-A-15',
    reg_label: 'Numéro de carte grise',
    reg_placeholder: 'ex. A129840B',
    photo_moto_title: 'Photo de la moto',
    photo_moto_sub: 'Photo claire et complète de la moto',
    photo_grey_title: 'Carte grise de la moto',
    photo_grey_sub: 'Photo lisible de la carte grise',
    submit_btn: 'Enregistrer les documents et infos de la moto',
    submitting: 'Enregistrement...',
    success_title: '✅ Enregistré avec succès',
    success_msg: 'Les informations et documents de la moto ont été soumis avec succès pour vérification.',
    mandatory_err: 'Veuillez remplir tous les champs obligatoires et joindre les photos.',
    pending_notice: '⏳ Informations en cours de vérification par l\'administration.',
    rejected_notice: '❌ Demande rejetée : ',
    incomplete_title: '⚠️ Informations incomplètes',
    incomplete_body: 'Veuillez compléter les champs et photos suivants avant d\'enregistrer :',
    confirm_save_title: '📋 Confirmation de l\'enregistrement',
    confirm_save_msg: 'Êtes-vous sûr de l\'exactitude des informations et des photos saisies pour la moto ?',
    confirm_send: 'Confirmer et envoyer',
    cancel: 'Annuler',
    error: 'Erreur',
    success: 'Succès',
    other_brand: 'Autre',
    license_modal_title: '📋 Permis de conduire requis (> 50cc)',
    license_modal_msg: 'La conduite d\'une moto avec une cylindrée supérieure à 50cc exige un permis de conduire valide de catégorie A ou B. Veuillez sélectionner votre catégorie de permis.',
    license_cat_a: 'Catégorie A / A1 (Moto)',
    license_cat_a_sub: 'Permis spécifique pour motocycles',
    license_cat_b: 'Catégorie B (Auto & Moto)',
    license_cat_b_sub: 'Permis de conduire catégorie B',
    photo_license_title: 'Photo du permis de conduire',
    photo_license_sub: 'Photo lisible du permis de conduire',
    license_cat_label: 'Catégorie de permis de conduire',
    camera_guide_moto: 'Placez la moto en entier dans le cadre.',
    camera_guide_grey: 'Placez la carte grise de manière lisible dans le cadre.',
    camera_guide_license: 'Placez le permis de conduire de manière lisible.',
    preview_photo_title: 'Aperçu et vérification de la photo',
    retake_photo_btn: '🔄 Recommencer',
    use_photo_btn: '✅ Utiliser',
    camera_permission_required: 'Veuillez autoriser l\'accès à la caméra.',
    capture_failed_error: 'Échec de la capture.',
    change_type_btn: 'Changer le type de véhicule',
    confirm_change_title: 'Changer le type de véhicule',
    confirm_change_type_message: 'Voulez-vous passer du type moto au type voiture ?',
    continue_btn: 'Continuer',
    live_camera: 'Caméra en direct (Live Camera)',
    gallery: 'Galerie d\'images (Gallery)',
  },
  es: {
    title: 'Información de la Motocicleta',
    subtitle: 'Registre los detalles y documentos de su moto para Yalla VTC',
    brand_label: 'Marca de la Moto',
    brand_placeholder: 'Seleccionar marca (ej. Honda, Yamaha)',
    model_label: 'Modelo',
    model_placeholder: 'Ingrese el modelo (ej. T-Max, SH 125)',
    year_label: 'Año de Fabricación',
    color_label: 'Color de la Moto',
    capacity_label: 'Cilindrada del Motor (cc)',
    capacity_placeholder: 'Seleccionar cilindrada (ej. 125cc, 250cc)',
    plate_label: 'Número de Matrícula',
    plate_placeholder: 'ej. 12345-A-15',
    reg_label: 'Número de Registro',
    reg_placeholder: 'ej. A129840B',
    photo_moto_title: 'Foto de la Motocicleta',
    photo_moto_sub: 'Foto clara y completa de la motocicleta',
    photo_grey_title: 'Tarjeta de Registro',
    photo_grey_sub: 'Foto legible de la tarjeta de registro de la moto',
    submit_btn: 'Guardar información y documentos de la moto',
    submitting: 'Enviando...',
    success_title: '✅ Guardado con éxito',
    success_msg: 'La información y documentos de la motocicleta se han enviado correctamente para su revisión.',
    mandatory_err: 'Por favor complete todos los campos obligatorios y adjunte las fotos.',
    pending_notice: '⏳ Los detalles de la moto están actualmente bajo revisión.',
    rejected_notice: '❌ Solicitud rechazada: ',
    incomplete_title: '⚠️ Información incompleta',
    incomplete_body: 'Por favor complete los siguientes campos y fotos antes de guardar:',
    confirm_save_title: '📋 Confirmar actualización de motocicleta',
    confirm_save_msg: '¿Está seguro de que toda la información y fotos ingresadas son correctas y desea enviarlas para su revisión?',
    confirm_send: 'Confirmar y enviar',
    cancel: 'Cancelar',
    error: 'Error',
    success: 'Éxito',
    other_brand: 'Otro',
    license_modal_title: '📋 Permiso de conducir requerido (> 50cc)',
    license_modal_msg: 'Conducir una motocicleta con cilindrada superior a 50cc requiere un permiso de conducir válido de Categoría A o B. Seleccione su categoría de permiso.',
    license_cat_a: 'Categoría A / A1 (Motocicleta)',
    license_cat_a_sub: 'Permiso específico para motocicletas',
    license_cat_b: 'Categoría B (Coche y Moto)',
    license_cat_b_sub: 'Permiso de conducir categoría B',
    photo_license_title: 'Foto del permiso de conducir',
    photo_license_sub: 'Foto legible del permiso de conducir',
    license_cat_label: 'Categoría del permiso de conducir',
    camera_guide_moto: 'Coloque toda la motocicleta dentro del marco.',
    camera_guide_grey: 'Coloque la tarjeta de registro claramente dentro del marco.',
    camera_guide_license: 'Coloque el permiso de conducir claramente dentro del marco.',
    preview_photo_title: 'Vista previa y verificación de foto',
    retake_photo_btn: '🔄 Volver a tomar',
    use_photo_btn: '✅ Usar foto',
    camera_permission_required: 'Por favor conceda permiso de cámara.',
    capture_failed_error: 'Error de captura.',
    change_type_btn: 'Cambiar tipo de vehículo',
    confirm_change_title: 'Cambiar tipo de vehículo',
    confirm_change_type_message: '¿Desea cambiar el tipo de vehículo de motocicleta a coche?',
    continue_btn: 'Continuar',
    live_camera: 'Cámara en vivo (Live Camera)',
    gallery: 'Galería de fotos (Gallery)',
  },
  en: {
    title: 'Motorcycle Information',
    subtitle: 'Register your motorcycle details and documents for Yalla VTC',
    brand_label: 'Motorcycle Brand',
    brand_placeholder: 'Select brand (e.g., Honda, Yamaha)',
    model_label: 'Model',
    model_placeholder: 'Enter model (e.g., T-Max, SH 125)',
    year_label: 'Year of Manufacture',
    color_label: 'Motorcycle Color',
    capacity_label: 'Engine Capacity (cc)',
    capacity_placeholder: 'Select capacity (e.g., 125cc, 250cc)',
    plate_label: 'License Plate Number',
    plate_placeholder: 'e.g., 12345-A-15',
    reg_label: 'Registration Number',
    reg_placeholder: 'e.g., A129840B',
    photo_moto_title: 'Motorcycle Photo',
    photo_moto_sub: 'Clear full view of the motorcycle',
    photo_grey_title: 'Registration Card',
    photo_grey_sub: 'Clear readable photo of the motorcycle grey card',
    submit_btn: 'Save Motorcycle Info & Documents',
    submitting: 'Submitting...',
    success_title: '✅ Saved Successfully',
    success_msg: 'Motorcycle information and documents have been successfully submitted for review.',
    mandatory_err: 'Please fill all mandatory fields and attach photos.',
    pending_notice: '⏳ Motorcycle details are currently under review.',
    rejected_notice: '❌ Modification request rejected: ',
    incomplete_title: '⚠️ Incomplete Information',
    incomplete_body: 'Please complete the following fields and photos before saving:',
    confirm_save_title: '📋 Confirm Motorcycle Information Update',
    confirm_save_msg: 'Are you sure all entered motorcycle information and attached photos are accurate and ready for submission?',
    confirm_send: 'Confirm & Send',
    cancel: 'Cancel',
    error: 'Error',
    success: 'Success',
    other_brand: 'Other',
    license_modal_title: '📋 Driving License Required (> 50cc)',
    license_modal_msg: 'Riding a motorcycle with engine capacity over 50cc requires a valid Category A or B driving license. Please select your license category.',
    license_cat_a: 'Category A / A1 (Motorcycle)',
    license_cat_a_sub: 'Specific motorcycle driving license',
    license_cat_b: 'Category B (Car & Moto)',
    license_cat_b_sub: 'Category B driving license',
    photo_license_title: 'Driving License Photo',
    photo_license_sub: 'Clear photo of your driving license',
    license_cat_label: 'Driving License Category',
    camera_guide_moto: 'Place the entire motorcycle inside the frame.',
    camera_guide_grey: 'Place the registration card clearly inside the frame.',
    camera_guide_license: 'Place the driving license clearly inside the frame.',
    preview_photo_title: 'Photo Preview & Quality Check',
    retake_photo_btn: '🔄 Retake',
    use_photo_btn: '✅ Use Photo',
    camera_permission_required: 'Please grant camera permission.',
    capture_failed_error: 'Capture error.',
    change_type_btn: 'Change Vehicle Type',
    confirm_change_title: 'Change Vehicle Type',
    confirm_change_type_message: 'Do you want to switch vehicle type from motorcycle to car?',
    continue_btn: 'Continue',
    live_camera: 'Live Camera',
    gallery: 'Photo Gallery',
  },
};

const getT = (key: keyof typeof MOTO_TRANSLATIONS['ar']) => {
  const activeLang = (i18n.language || 'ar').toLowerCase().split('-')[0];
  const langKey = (activeLang === 'fr' || activeLang === 'es' || activeLang === 'en') ? activeLang : 'ar';
  return MOTO_TRANSLATIONS[langKey][key] || MOTO_TRANSLATIONS['ar'][key] || key;
};

const MOTORCYCLE_BRANDS = [
  'Honda', 'Yamaha', 'Vespa', 'SYM', 'Peugeot', 'BMW', 'Kawasaki', 'Suzuki', 'KTM', 'Kymco', 'Aprilia', 'Ducati', 'Other'
];

const getBrandDisplayName = (b: string, lang: string) => {
  if (b === 'Other') {
    if (lang === 'ar') return 'أخرى';
    if (lang === 'fr') return 'Autre';
    if (lang === 'es') return 'Otro';
    return 'Other';
  }
  return b;
};

const CYLINDER_CAPACITIES = ['50cc', '125cc', '150cc', '250cc', '300cc', '400cc', '500cc', '600cc', '750cc+'];
const YEARS_ARRAY = Array.from({ length: 16 }, (_, i) => String(new Date().getFullYear() - i));

const COLOR_TEMPLATES = [
  { name: 'Deep Black', hex: '#0F172A', glow: 'rgba(15,23,42,0.4)' },
  { name: 'Titanium Grey', hex: '#64748B', glow: 'rgba(100,116,139,0.4)' },
  { name: 'Polar White', hex: '#F8FAFC', glow: 'rgba(248,250,252,0.5)' },
  { name: 'Metallic Silver', hex: '#CBD5E1', glow: 'rgba(203,213,225,0.4)' },
  { name: 'Ruby Red', hex: '#EF4444', glow: 'rgba(239,68,68,0.4)' },
  { name: 'Royal Blue', hex: '#3B82F6', glow: 'rgba(59,130,246,0.4)' },
  { name: 'Midnight Navy', hex: '#1E3A8A', glow: 'rgba(30,58,138,0.4)' },
  { name: 'Emerald Green', hex: '#10B981', glow: 'rgba(16,185,129,0.4)' },
  { name: 'Champagne Gold', hex: '#F59E0B', glow: 'rgba(245,158,11,0.4)' },
  { name: 'Chocolate Brown', hex: '#78350F', glow: 'rgba(120,53,15,0.4)' },
  { name: 'Warm Orange', hex: '#F97316', glow: 'rgba(249,115,22,0.4)' },
  { name: 'Burgundy Wine', hex: '#881337', glow: 'rgba(136,19,55,0.4)' },
];

const SVG3DMotorcycle = ({ colorsPrimary }: { colorsPrimary: string }) => (
  <Svg width="220" height="130" viewBox="0 0 200 120">
    <Defs>
      <LinearGradient id="motoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor={colorsPrimary} stopOpacity="1" />
        <Stop offset="50%" stopColor={colorsPrimary} stopOpacity="0.8" />
        <Stop offset="100%" stopColor="#0F172A" stopOpacity="0.95" />
      </LinearGradient>
    </Defs>
    {/* Floor shadow */}
    <Ellipse cx="100" cy="100" rx="75" ry="11" fill="rgba(0,0,0,0.3)" />
    
    {/* Motorcycle Body silhouette */}
    <Path d="M45 82 L70 50 L115 48 L140 70 L120 85 L95 62 L65 82 Z" fill="url(#motoGrad)" />
    
    {/* Engine Block & Details */}
    <Rect x="85" y="65" width="28" height="20" rx="4" fill="#475569" stroke="#94A3B8" strokeWidth="1" />
    
    {/* Steering Handlebars */}
    <Path d="M60 85 L42 35 M42 35 L52 28" stroke="#E2E8F0" strokeWidth="4" strokeLinecap="round" />
    
    {/* 3D Alloy Wheels */}
    <Circle cx="50" cy="83" r="18" fill="#0F172A" stroke="#334155" strokeWidth="2" />
    <Circle cx="50" cy="83" r="8" fill="#CBD5E1" />
    <Circle cx="50" cy="83" r="3" fill="#0F172A" />

    <Circle cx="145" cy="83" r="18" fill="#0F172A" stroke="#334155" strokeWidth="2" />
    <Circle cx="145" cy="83" r="8" fill="#CBD5E1" />
    <Circle cx="145" cy="83" r="3" fill="#0F172A" />
    
    {/* Headlight LED glow */}
    <Circle cx="39" cy="36" r="6" fill="#38BDF8" />
  </Svg>
);

export const MotorcycleInfoScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const activeLang = (i18n.language || 'ar').toLowerCase().split('-')[0];
  const lang = (activeLang === 'fr' || activeLang === 'es' || activeLang === 'en') ? activeLang : 'ar';
  const isRTL = lang === 'ar';

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [hasPendingRequest, setHasPendingRequest] = useState(false);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);

  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [color, setColor] = useState('');
  const [capacity, setCapacity] = useState('125cc');
  const [licenseCategory, setLicenseCategory] = useState<'A' | 'B' | null>('A');
  const [plateNumber, setPlateNumber] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');

  const [photos, setPhotos] = useState<{ vehicle: string | null; registration: string | null; license: string | null }>({
    vehicle: null,
    registration: null,
    license: null,
  });

  const [showBrandSelector, setShowBrandSelector] = useState(false);
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [showPhotoOptionsSheet, setShowPhotoOptionsSheet] = useState(false);
  const [selectedPhotoSlot, setSelectedPhotoSlot] = useState<'vehicle' | 'registration' | 'license' | null>(null);

  // Vision Camera states & refs
  const cameraRef = useRef<Camera>(null);
  const [cameraType, setCameraType] = useState<'back' | 'front'>('back');
  const device = useCameraDevice(cameraType);
  const [showCameraView, setShowCameraView] = useState(false);
  const [tempCaptureUri, setTempCaptureUri] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/driver/profile/vehicle');
      const data = res.data;
      if (data) {
        if (data.vehicle) {
          const v = data.vehicle;
          if (v.brand) setBrand(v.brand);
          if (v.model) setModel(v.model);
          if (v.year) setYear(String(v.year));
          if (v.color) setColor(v.color);
          if (v.capacity) setCapacity(v.capacity);
          if (v.licenseCategory) setLicenseCategory(v.licenseCategory);
          if (v.plateNumber) setPlateNumber(v.plateNumber);
          if (v.registrationNumber) setRegistrationNumber(v.registrationNumber);
          if (v.photos) {
            setPhotos({
              vehicle: v.photos.vehicle || null,
              registration: v.photos.registration || null,
              license: v.photos.license || null,
            });
          }
        }
        if (data.pendingVehicleUpdate) {
          setHasPendingRequest(true);
          const fields = data.pendingVehicleUpdate.pendingFields || {};
          if (fields.brand) setBrand(fields.brand);
          if (fields.model) setModel(fields.model);
          if (fields.year) setYear(String(fields.year));
          if (fields.color) setColor(fields.color);
          if (fields.capacity) setCapacity(fields.capacity);
          if (fields.licenseCategory) setLicenseCategory(fields.licenseCategory);
          if (fields.plateNumber) setPlateNumber(fields.plateNumber);
          if (fields.registrationNumber) setRegistrationNumber(fields.registrationNumber);
        }
        if (data.rejectedVehicleUpdate) {
          setRejectionReason(data.rejectedVehicleUpdate.rejectionReason || null);
        }
      }
    } catch (err) {
      console.warn('[MotorcycleInfo] Fetch error:', err);
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

  const triggerCamera = async () => {
    setShowPhotoOptionsSheet(false);
    const hasPermission = await checkAndRequestCameraPermission();
    if (!hasPermission) {
      Alert.alert(getT('error'), getT('camera_permission_required'));
      return;
    }
    setCameraType('back');
    setTempCaptureUri(null);
    setShowCameraView(true);
  };

  const handleSelectCapacity = (cc: string) => {
    setCapacity(cc);
    if (cc !== '50cc') {
      setShowLicenseModal(true);
    }
  };

  const handleSelectPhoto = (slot: 'vehicle' | 'registration' | 'license') => {
    setSelectedPhotoSlot(slot);
    setShowPhotoOptionsSheet(true);
  };

  const handleLaunchLibrary = async () => {
    setShowPhotoOptionsSheet(false);
    if (!selectedPhotoSlot) return;
    const res = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
    if (res.assets && res.assets[0]?.uri) {
      uploadPhoto(selectedPhotoSlot, res.assets[0].uri);
    }
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

  const handleConfirmCapturedPhoto = async () => {
    if (!tempCaptureUri || !selectedPhotoSlot) return;
    const pathToUpload = Platform.OS === 'android' ? `file://${tempCaptureUri}` : tempCaptureUri;
    setShowCameraView(false);
    setTempCaptureUri(null);
    await uploadPhoto(selectedPhotoSlot, pathToUpload);
  };

  const getLocalizedApiError = (msg: string) => {
    const lower = (msg || '').toLowerCase();
    
    if (
      lower.includes('opening') ||
      lower.includes('pending') ||
      lower.includes('already have') ||
      lower.includes('update request') ||
      lower.includes('review')
    ) {
      if (lang === 'ar') return 'لديك بالفعل طلب تعديل معلومات المركبة قيد مراجعة وتدقيق الإدارة حالياً. يرجى الانتظار حتى اكتمال المراجعة.';
      if (lang === 'fr') return 'Vous avez déjà une demande de modification de véhicule en cours de vérification par l\'administration. Veuillez patienter.';
      if (lang === 'es') return 'Ya tiene una solicitud de actualización de vehículo pendiente de revisión por parte de la administración. Por favor espere.';
      return 'You already have a vehicle update request under review by administration. Please wait until it is processed.';
    }
    
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

    if (lower.includes('mandatory') || lower.includes('required') || lower.includes('field')) {
      if (lang === 'ar') return 'يرجى ملء جميع الحقول والبيانات المطلوبة وإرفاق الصور.';
      if (lang === 'fr') return 'Veuillez remplir tous les champs obligatoires et joindre les photos.';
      if (lang === 'es') return 'Por favor complete todos los campos obligatorios y adjunte las fotos.';
      return 'All mandatory fields must be filled and photos attached.';
    }

    if (lower.includes('access denied') || lower.includes('requires one of the following roles') || lower.includes('role')) {
      if (lang === 'ar') return 'عذراً، هذا الإجراء يتطلب حساب سائق مفعل (DRIVER). يرجى التأكد من تسجيل الدخول بحساب السائق.';
      if (lang === 'fr') return 'Accès refusé: Cette action nécessite un compte chauffeur (DRIVER).';
      if (lang === 'es') return 'Acceso denegado: Esta acción requiere una cuenta de conductor (DRIVER).';
      return 'Access denied: This action requires a driver account (DRIVER).';
    }

    if (lang === 'ar') return msg || 'حدث خطأ أثناء حفظ معلومات الدراجة النارية، يرجى إعادة المحاولة.';
    if (lang === 'fr') return msg || 'Une erreur est survenue lors de l\'enregistrement des informations de la moto.';
    if (lang === 'es') return msg || 'Ocurrió un error al guardar los detalles de la motocicleta. Inténtelo de nuevo.';
    return msg || 'An error occurred while saving motorcycle details. Please try again.';
  };

  const uploadPhoto = async (slot: 'vehicle' | 'registration' | 'license', uri: string) => {
    // 1. Immediately display local photo preview so user sees it on screen without delay
    setPhotos((prev) => ({ ...prev, [slot]: uri }));

    try {
      setUploading(true);
      const resized = await ImageResizer.createResizedImage(
        uri,
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
        name: `motorcycle_${slot}_${Date.now()}.jpg`,
        type: 'image/jpeg',
      } as any);

      const res = await api.post('/driver/profile/vehicle/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const uploadedUrl = res.data?.url || uri;
      setPhotos((prev) => ({ ...prev, [slot]: uploadedUrl }));
    } catch (err: any) {
      console.warn('[MotorcycleInfo] Background upload warn, using local photo uri:', err);
    } finally {
      setUploading(false);
    }
  };

  const executeMotorcycleUpdateSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        type: 'MOTORCYCLE',
        manufacturer: brand.trim(),
        brand: brand.trim(),
        model: model.trim(),
        year: parseInt(year, 10),
        color,
        capacity,
        licenseCategory: capacity !== '50cc' ? licenseCategory : undefined,
        plateNumber: plateNumber.trim(),
        registrationNumber: registrationNumber.trim(),
        photos,
      };

      await api.patch('/driver/profile/vehicle', payload);
      setVehicleModeCache('MOTORCYCLE');
      await AsyncStorage.setItem(
        '@uploaded_doc_CARTE_GRISE',
        JSON.stringify({
          type: 'CARTE_GRISE',
          status: 'PENDING',
          updatedAt: Date.now(),
        })
      ).catch(() => {});
      setHasPendingRequest(true);
      setHasPendingRequest(true);
      setRejectionReason(null);
      
      // Directly navigate to Official Documents Screen upon saving motorcycle info
      navigation.navigate('Documents' as never);
    } catch (err: any) {
      console.error('[Motorcycle Info] Submit handler error:', err);
      setHasPendingRequest(true);
      navigation.navigate('Documents' as never);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveChanges = async () => {
    // 1. Check missing fields or missing photos
    const missingItems: string[] = [];
    if (!brand.trim()) missingItems.push(getT('brand_label'));
    if (!model.trim()) missingItems.push(getT('model_label'));
    if (!year.trim()) missingItems.push(getT('year_label'));
    if (!color.trim()) missingItems.push(getT('color_label'));
    if (!plateNumber.trim()) missingItems.push(getT('plate_label'));
    if (!registrationNumber.trim()) missingItems.push(getT('reg_label'));
    if (!photos.vehicle) missingItems.push(getT('photo_moto_title'));
    if (!photos.registration) missingItems.push(getT('photo_grey_title'));

    if (capacity !== '50cc') {
      if (!licenseCategory) missingItems.push(getT('license_cat_label'));
      if (!photos.license) missingItems.push(getT('photo_license_title'));
    }

    if (missingItems.length > 0) {
      Alert.alert(
        getT('incomplete_title'),
        `${getT('incomplete_body')}\n\n• ${missingItems.join('\n• ')}`
      );
      return;
    }

    // 2. All complete -> Confirmation dialog
    Alert.alert(
      getT('confirm_save_title'),
      getT('confirm_save_msg'),
      [
        {
          text: getT('cancel'),
          style: 'cancel',
        },
        {
          text: getT('confirm_send'),
          onPress: () => executeMotorcycleUpdateSubmit(),
        },
      ]
    );
  };

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
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{getT('title')}</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Top Change Vehicle Type Trigger Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.triggerTypeChangeBtn, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: 4, marginBottom: 12 }]}
          onPress={() => {
            Alert.alert(
              getT('confirm_change_title'),
              getT('confirm_change_type_message'),
              [
                { text: getT('cancel'), style: 'cancel' },
                {
                  text: getT('continue_btn'),
                  onPress: () => navigation.navigate('VehicleInfo' as never),
                },
              ]
            );
          }}
        >
          <Text style={[styles.triggerTypeText, { color: colors.primary }]}>
            🔄 {getT('change_type_btn')}
          </Text>
        </TouchableOpacity>

        {/* Top Frameless 3D Motorcycle Graphic (Pure 3D Image, Static, No Card Background) */}
        <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 4, marginBottom: 16 }}>
          <SVG3DMotorcycle colorsPrimary={colors.primary} />
          {brand ? (
            <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textPrimary, marginTop: 6, letterSpacing: 0.5 }}>
              {getBrandDisplayName(brand, lang)} {model || ''}
            </Text>
          ) : null}
          {plateNumber ? (
            <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textSecondary, marginTop: 2 }}>
              {plateNumber} {capacity ? `• ${capacity}` : ''} {color ? `• ${color}` : ''} {year ? `• ${year}` : ''}
            </Text>
          ) : null}
        </View>

        {hasPendingRequest && (
          <View style={[styles.alertCard, { backgroundColor: '#F59E0B15', borderColor: '#F59E0B40' }]}>
            <Clock size={20} color="#F59E0B" />
            <Text style={[styles.alertText, { color: '#F59E0B' }]}>{getT('pending_notice')}</Text>
          </View>
        )}

        {rejectionReason && (
          <View style={[styles.alertCard, { backgroundColor: '#EF444415', borderColor: '#EF444440' }]}>
            <AlertTriangle size={20} color="#EF4444" />
            <Text style={[styles.alertText, { color: '#EF4444' }]}>{getT('rejected_notice')} {rejectionReason}</Text>
          </View>
        )}

        {/* Inputs Form */}
        <View style={[styles.glassFormCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          
          {/* Brand Selector */}
          <TouchableOpacity
            style={[styles.formRow, { borderColor: colors.border }]}
            onPress={() => setShowBrandSelector(true)}
          >
            <Text style={[styles.formLabel, { color: colors.textMuted }]}>{getT('brand_label')}</Text>
            <View style={styles.valWithArrow}>
              <Text style={[styles.formValText, { color: brand ? colors.textPrimary : colors.textMuted }]}>
                {brand ? getBrandDisplayName(brand, lang) : getT('brand_placeholder')}
              </Text>
              <ChevronRight size={18} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>

          {/* Model Input */}
          <View style={[styles.formRowInput, { borderColor: colors.border }]}>
            <Text style={[styles.formLabel, { color: colors.textMuted }]}>{getT('model_label')}</Text>
            <TextInput
              style={[styles.valTextInput, { color: colors.textPrimary }]}
              value={model}
              onChangeText={setModel}
              placeholder={getT('model_placeholder')}
              placeholderTextColor={colors.textMuted}
            />
          </View>

          {/* Year Wheel */}
          <View style={[styles.formRowHeading, { borderColor: colors.border }]}>
            <Text style={[styles.formLabel, { color: colors.textMuted }]}>{getT('year_label')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizWheelScroll}>
              {YEARS_ARRAY.map((y) => (
                <TouchableOpacity
                  key={y}
                  style={[
                    styles.wheelItem,
                    { borderColor: y === year ? colors.primary : 'transparent', backgroundColor: y === year ? colors.primary + '15' : 'transparent' },
                  ]}
                  onPress={() => setYear(y)}
                >
                  <Text style={[styles.wheelItemText, { color: y === year ? colors.primary : colors.textSecondary }]}>{y}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Engine Capacity Wheel */}
          <View style={[styles.formRowHeading, { borderColor: colors.border }]}>
            <Text style={[styles.formLabel, { color: colors.textMuted }]}>{getT('capacity_label')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizWheelScroll}>
              {CYLINDER_CAPACITIES.map((cc) => (
                <TouchableOpacity
                  key={cc}
                  style={[
                    styles.wheelItem,
                    { borderColor: cc === capacity ? colors.primary : 'transparent', backgroundColor: cc === capacity ? colors.primary + '15' : 'transparent' },
                  ]}
                  onPress={() => handleSelectCapacity(cc)}
                >
                  <Text style={[styles.wheelItemText, { color: cc === capacity ? colors.primary : colors.textSecondary }]}>{cc}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Driving License Category Selector Row (Active when capacity > 50cc) */}
          {capacity !== '50cc' && (
            <TouchableOpacity
              style={[styles.formRow, { borderColor: colors.border, backgroundColor: colors.primary + '08' }]}
              onPress={() => setShowLicenseModal(true)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <ShieldCheck size={18} color={colors.primary} />
                <Text style={[styles.formLabel, { color: colors.textPrimary, marginBottom: 0 }]}>{getT('license_cat_label')}</Text>
              </View>
              <View style={styles.valWithArrow}>
                <Text style={[styles.formValText, { color: colors.primary, fontWeight: '800' }]}>
                  {licenseCategory === 'A' ? 'Permis A / A1' : licenseCategory === 'B' ? 'Permis B' : getT('license_cat_label')}
                </Text>
                <ChevronRight size={18} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>
          )}

          {/* 12 Colors Selector */}
          <View style={[styles.formRowHeading, { borderColor: colors.border }]}>
            <Text style={[styles.formLabel, { color: colors.textMuted }]}>{getT('color_label')}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.colorPillsPack}>
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
                  onPress={() => setColor(c.name)}
                >
                  {c.name === color && <Check size={14} color={c.name === 'Polar White' ? '#000000' : '#FFFFFF'} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* License Plate Number */}
          <View style={[styles.formRowInput, { borderColor: colors.border }]}>
            <Text style={[styles.formLabel, { color: colors.textMuted }]}>{getT('plate_label')}</Text>
            <TextInput
              style={[styles.valTextInput, { color: colors.textPrimary }]}
              value={plateNumber}
              onChangeText={setPlateNumber}
              placeholder={getT('plate_placeholder')}
              placeholderTextColor={colors.textMuted}
              autoCapitalize="characters"
            />
          </View>

          {/* Registration Number */}
          <View style={[styles.formRowInput, { borderBottomWidth: 0 }]}>
            <Text style={[styles.formLabel, { color: colors.textMuted }]}>{getT('reg_label')}</Text>
            <TextInput
              style={[styles.valTextInput, { color: colors.textPrimary }]}
              value={registrationNumber}
              onChangeText={setRegistrationNumber}
              placeholder={getT('reg_placeholder')}
              placeholderTextColor={colors.textMuted}
            />
          </View>
        </View>

        {/* Photo Upload Section */}
        <Text style={[styles.sectionHeading, { color: colors.textPrimary }]}>
          {getT('photo_moto_title')} & {getT('photo_grey_title')} {capacity !== '50cc' ? `& ${getT('photo_license_title')}` : ''}
        </Text>

        <View style={styles.photoGrid}>
          {/* Motorcycle Photo Card */}
          <View style={[styles.photoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.photoTitle, { color: colors.textPrimary }]}>{getT('photo_moto_title')}</Text>
            <Text style={[styles.photoSub, { color: colors.textSecondary }]}>{getT('photo_moto_sub')}</Text>
            {photos.vehicle ? (
              <View style={styles.previewWrap}>
                <Image source={{ uri: getImageUri(photos.vehicle) }} style={styles.previewImg} />
                <TouchableOpacity style={styles.changeImgBtn} onPress={() => handleSelectPhoto('vehicle')}>
                  <RefreshCw size={14} color="#FFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={[styles.uploadBox, { borderColor: colors.primary }]} onPress={() => handleSelectPhoto('vehicle')}>
                <CameraIcon size={28} color={colors.primary} />
                <Text style={[styles.uploadBoxText, { color: colors.primary }]}>{getT('photo_moto_title')}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Registration Card Photo */}
          <View style={[styles.photoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.photoTitle, { color: colors.textPrimary }]}>{getT('photo_grey_title')}</Text>
            <Text style={[styles.photoSub, { color: colors.textSecondary }]}>{getT('photo_grey_sub')}</Text>
            {photos.registration ? (
              <View style={styles.previewWrap}>
                <Image source={{ uri: getImageUri(photos.registration) }} style={styles.previewImg} />
                <TouchableOpacity style={styles.changeImgBtn} onPress={() => handleSelectPhoto('registration')}>
                  <RefreshCw size={14} color="#FFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={[styles.uploadBox, { borderColor: colors.primary }]} onPress={() => handleSelectPhoto('registration')}>
                <CameraIcon size={28} color={colors.primary} />
                <Text style={[styles.uploadBoxText, { color: colors.primary }]}>{getT('photo_grey_title')}</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Driving License Photo Card (Required when Capacity > 50cc) */}
          {capacity !== '50cc' && (
            <View style={[styles.photoCard, { backgroundColor: colors.surface, borderColor: colors.primary, borderWidth: 1.5 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <ShieldCheck size={18} color={colors.primary} />
                <Text style={[styles.photoTitle, { color: colors.textPrimary, marginBottom: 0 }]}>
                  {getT('photo_license_title')} ({licenseCategory || 'A/B'})
                </Text>
              </View>
              <Text style={[styles.photoSub, { color: colors.textSecondary }]}>{getT('photo_license_sub')}</Text>
              {photos.license ? (
                <View style={styles.previewWrap}>
                  <Image source={{ uri: getImageUri(photos.license) }} style={styles.previewImg} />
                  <TouchableOpacity style={styles.changeImgBtn} onPress={() => handleSelectPhoto('license')}>
                    <RefreshCw size={14} color="#FFF" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={[styles.uploadBox, { borderColor: colors.primary }]} onPress={() => handleSelectPhoto('license')}>
                  <CameraIcon size={28} color={colors.primary} />
                  <Text style={[styles.uploadBoxText, { color: colors.primary }]}>{getT('photo_license_title')}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        {/* Save Changes Button */}
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: colors.primary }]}
          onPress={handleSaveChanges}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveBtnText}>{getT('submit_btn')}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Brand Selector Modal */}
      <Modal visible={showBrandSelector} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>{getT('brand_label')}</Text>
              <TouchableOpacity onPress={() => setShowBrandSelector(false)}>
                <X size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 350 }}>
              {MOTORCYCLE_BRANDS.map((b) => (
                <TouchableOpacity
                  key={b}
                  style={[styles.brandItem, { borderBottomColor: colors.border }]}
                  onPress={() => {
                    setBrand(b);
                    setShowBrandSelector(false);
                  }}
                >
                  <Text style={[styles.brandItemText, { color: colors.textPrimary }]}>
                    {getBrandDisplayName(b, lang)}
                  </Text>
                  {brand === b && <Check size={18} color={colors.primary} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* License Category Selection Modal (> 50cc) */}
      <Modal visible={showLicenseModal} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <FileCheck size={20} color={colors.primary} />
                <Text style={[styles.modalTitle, { color: colors.textPrimary, fontSize: 16 }]}>{getT('license_modal_title')}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowLicenseModal(false)}>
                <X size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 13, color: colors.textSecondary, lineHeight: 18, marginBottom: 16 }}>
              {getT('license_modal_msg')}
            </Text>
            
            {/* Category A Option */}
            <TouchableOpacity
              style={[
                styles.licenseOptionCard,
                {
                  borderColor: licenseCategory === 'A' ? colors.primary : colors.border,
                  backgroundColor: licenseCategory === 'A' ? colors.primary + '10' : colors.surfaceAlt,
                },
              ]}
              onPress={() => {
                setLicenseCategory('A');
                setShowLicenseModal(false);
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.licenseOptionTitle, { color: colors.textPrimary }]}>{getT('license_cat_a')}</Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>{getT('license_cat_a_sub')}</Text>
              </View>
              {licenseCategory === 'A' && <Check size={20} color={colors.primary} />}
            </TouchableOpacity>

            {/* Category B Option */}
            <TouchableOpacity
              style={[
                styles.licenseOptionCard,
                {
                  borderColor: licenseCategory === 'B' ? colors.primary : colors.border,
                  backgroundColor: licenseCategory === 'B' ? colors.primary + '10' : colors.surfaceAlt,
                  marginTop: 10,
                },
              ]}
              onPress={() => {
                setLicenseCategory('B');
                setShowLicenseModal(false);
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.licenseOptionTitle, { color: colors.textPrimary }]}>{getT('license_cat_b')}</Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>{getT('license_cat_b_sub')}</Text>
              </View>
              {licenseCategory === 'B' && <Check size={20} color={colors.primary} />}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Photo Options Modal (Camera / Gallery) */}
      <Modal visible={showPhotoOptionsSheet} animationType="fade" transparent>
        <TouchableOpacity style={styles.modalBg} activeOpacity={1} onPress={() => setShowPhotoOptionsSheet(false)}>
          <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
            <TouchableOpacity style={[styles.sheetOption, { borderBottomColor: colors.border }]} onPress={triggerCamera}>
              <CameraIcon size={20} color={colors.primary} />
              <Text style={[styles.sheetOptionText, { color: colors.textPrimary }]}>{getT('live_camera')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sheetOption} onPress={handleLaunchLibrary}>
              <Sparkles size={20} color={colors.primary} />
              <Text style={[styles.sheetOptionText, { color: colors.textPrimary }]}>{getT('gallery')}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* --- Fullscreen Guided Camera Overlay Modal --- */}
      <Modal visible={showCameraView} animationType="slide">
        <View style={styles.cameraFrame}>
          {tempCaptureUri ? (
            <View style={styles.cameraPreviewFrame}>
              <Text style={styles.previewTitleStyle}>{getT('preview_photo_title')}</Text>
              <Image source={{ uri: `file://${tempCaptureUri}` }} style={{ flex: 1, resizeMode: 'cover' }} />
              {uploading && (
                <View style={styles.uploadScrimIndicator}>
                  <ActivityIndicator size="large" color="#FFFFFF" />
                </View>
              )}
              <View style={styles.previewFooterRow}>
                <TouchableOpacity
                  style={[styles.previewActionBtn, { backgroundColor: 'rgba(255,255,255,0.15)' }]}
                  onPress={() => setTempCaptureUri(null)}
                  disabled={uploading}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>{getT('retake_photo_btn')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.previewActionBtn, { backgroundColor: colors.primary }]}
                  onPress={handleConfirmCapturedPhoto}
                  disabled={uploading}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>{getT('use_photo_btn')}</Text>
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
                    ? getT('camera_guide_moto')
                    : selectedPhotoSlot === 'registration'
                    ? getT('camera_guide_grey')
                    : getT('camera_guide_license')}
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
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    gap: 10,
  },
  alertText: { fontSize: 14, fontWeight: '600', flex: 1 },
  glassFormCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden', marginBottom: 20 },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  formRowInput: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  formRowHeading: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  formLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  valWithArrow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  formValText: { fontSize: 15, fontWeight: '600' },
  valTextInput: { fontSize: 15, fontWeight: '600', paddingVertical: 4 },
  horizWheelScroll: { flexDirection: 'row', gap: 10, paddingVertical: 4 },
  wheelItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  wheelItemText: { fontSize: 14, fontWeight: '700' },
  colorPillsPack: { flexDirection: 'row', gap: 12, paddingVertical: 4 },
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
  sectionHeading: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  photoGrid: { gap: 16, marginBottom: 24 },
  photoCard: { padding: 16, borderRadius: 16, borderWidth: 1 },
  photoTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  photoSub: { fontSize: 13, marginBottom: 12 },
  uploadBox: {
    height: 120,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  uploadBoxText: { fontSize: 14, fontWeight: '600' },
  previewWrap: { height: 160, borderRadius: 12, overflow: 'hidden', position: 'relative' },
  previewImg: { width: '100%', height: '100%' },
  changeImgBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
    borderRadius: 20,
  },
  saveBtn: {
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: { padding: 20, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  brandItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  brandItemText: { fontSize: 16, fontWeight: '600' },
  sheetOption: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 16, borderBottomWidth: 1 },
  sheetOptionText: { fontSize: 16, fontWeight: '600' },
  licenseOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  licenseOptionTitle: { fontSize: 15, fontWeight: '700' },

  // Vision Camera View Finder Styles
  cameraFrame: { flex: 1, backgroundColor: '#000000', justifyContent: 'center' },
  cameraPreviewFrame: { flex: 1, backgroundColor: '#000000', justifyContent: 'space-between' },
  previewTitleStyle: { position: 'absolute', top: 50, left: 20, right: 20, textAlign: 'center', color: '#FFFFFF', fontSize: 16, fontWeight: '700', zIndex: 10 },
  uploadScrimIndicator: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', zIndex: 20 },
  previewFooterRow: { position: 'absolute', bottom: 40, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', gap: 15, zIndex: 10 },
  previewActionBtn: { flex: 1, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  cameraLoadView: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  guidanceBox: { position: 'absolute', top: 60, left: 20, right: 20, alignItems: 'center', zIndex: 10, backgroundColor: 'rgba(0,0,0,0.6)', padding: 12, borderRadius: 12 },
  guidanceTextHeading: { color: '#FFFFFF', fontSize: 14, fontWeight: '600', textAlign: 'center' },
  cameraCutoutContainer: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between', zIndex: 5 },
  darkOutMask: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)' },
  cutoutRect: { width: SCREEN_W * 0.85, height: SCREEN_H * 0.5, borderRadius: 16, borderWidth: 2 },
  cameraCloseBtn: { position: 'absolute', top: 50, right: 20, zIndex: 20, backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 20 },
  shutterRow: { position: 'absolute', bottom: 40, left: 0, right: 0, alignItems: 'center', zIndex: 10 },
  shutterButtonCircle: { width: 76, height: 76, borderRadius: 38, borderWidth: 4, borderColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  shutterInner: { width: 60, height: 60, borderRadius: 30 },
  triggerTypeChangeBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  triggerTypeText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
