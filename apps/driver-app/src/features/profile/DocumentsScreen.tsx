/**
 * DocumentsScreen.tsx
 * ──────────────────────────────────────────────────────────────────────────────
 * Main checklist screen for document verification.
 * Each card navigates to DocumentDetailScreen for full detail/upload flow.
 * Camera + timeline lives in DocumentDetailScreen — this screen is list-only.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  StatusBar,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ChevronLeft,
  Camera as CameraIcon,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Lock,
  FileText,
  Plus,
  BadgeAlert,
  ArrowRight,
  RefreshCw,
  Check,
  Sparkles,
  FolderPlus,
  X,
  ChevronDown,
  User,
  CheckCircle,
  Pencil,
} from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { api } from '../../api/axios.instance';
import i18n from '../../i18n';
import { DrawerHeader } from '../../components/DrawerHeader';
import { useCallback } from 'react';
import { useVehicleMode } from '../../hooks/useVehicleMode';

// ── Register Locales ──────────────────────────────────────────────────────────
const registerDocumentLocales = () => {
  i18n.addResourceBundle('ar', 'profile', {
    documents_title: 'الوثائق',
    verification_status: 'حالة التحقق',
    verification_notice: 'تتم مراجعة جميع الوثائق من قبل فريق Yalla VTC قبل تفعيل الحساب.',
    progress_percent: 'اكتمل {{percent}}٪',
    required_docs_section: 'الوثائق الأساسية',
    conditional_docs_section: 'الوثائق الشرطية',
    optional_docs_section: 'وثائق إضافية اختيارية',
    optional_docs_desc: 'يمكن أن تساعد هذه الوثائق في تسريع عملية التحقق عند الحاجة.',
    upload_document: 'رفع الوثيقة',
    under_review: 'قيد المراجعة',
    approved: 'تمت الموافقة',
    rejected: 'تم الرفض',
    expired: 'منتهية الصلاحية',
    renew_document: 'تجديد الوثيقة',
    reupload_document: 'إعادة رفع الوثيقة',
    expiration_warning_days: 'تنتهي خلال {{days}} يوم',
    timeline_submit: 'رفع الوثيقة',
    timeline_review: 'قيد المراجعة',
    timeline_approved: 'تمت الموافقة',
    timeline_title: 'مراحل التحقق',
    verification_status_approved: 'حساب موثق ومقبول ✓',
    verification_status_rejected: 'تم رفض بعض الوثائق',
    verification_status_pending: 'قيد مراجعة الإدارة',
    verification_status_incomplete: 'يرجى إكمال الوثائق المطلوبة',
    driver_license: 'رخصة السياقة',
    driver_license_desc: 'صورة واضحة للواجهة الأمامية لرخصة السياقة',
    national_id_or_passport: 'البطاقة الوطنية أو جواز السفر',
    national_id_or_passport_desc: 'صورة الهوية الوطنية أو صفحة جواز السفر الرئيسية',
    vehicle_registration: 'البطاقة الرمادية',
    vehicle_registration_desc: 'صورة البطاقة الرمادية الرسمية للمركبة',
    insurance_certificate: 'تأمين المركبة',
    insurance_certificate_desc: 'شهادة تأمين مركبة VTC سارية المفعول',
    technical_inspection: 'الفحص التقني',
    technical_inspection_desc: 'شهادة الفحص التقني للمركبة سارية الصلاحية',
    professional_permit: 'بطاقة الثقة المهنية',
    professional_permit_desc: 'رخصة السياقة المهنية أو رخصة الثقة',
    taxi_authorization: 'ترخيص سيارة الأجرة',
    taxi_authorization_desc: 'رخصة أو مأذونية النقل لسيارة الأجرة',
    municipal_authorization: 'الترخيص البلدي',
    municipal_authorization_desc: 'موافقة أو ترخيص الجهة البلدية المحلية',
    special_authorization: 'الترخيص الخاص',
    special_authorization_desc: 'الترخيص الاستثنائي للخدمات الخاصة',
    registre_commerce: 'السجل التجاري',
    registre_commerce_desc: 'نسخة رسمية حديثة من السجل التجاري',
    rental_agreement: 'عقد كراء المركبة',
    rental_agreement_desc: 'عقد استئجار أو إيجار السيارة الرسمي',
    company_docs: 'وثائق الشركة',
    company_docs_desc: 'النظام الأساسي وتفاصيل الشركة أو الكيان القانوني',
    fleet_permit: 'تصريح الأسطول',
    fleet_permit_desc: 'ترخيص رسمي لإدارة أسطول المركبات',
    additional_doc: 'وثيقة إضافية',
    additional_doc_desc: 'أي مستند آخر تطلبه الإدارة',
  }, true, true);

  i18n.addResourceBundle('fr', 'profile', {
    documents_title: 'Documents',
    verification_status: 'Statut de Vérification',
    verification_notice: 'Tous les documents sont examinés par l\'équipe Yalla VTC avant l\'activation.',
    progress_percent: '{{percent}}% validés',
    required_docs_section: 'Documents Obligatoires',
    conditional_docs_section: 'Documents Conditionnels',
    optional_docs_section: 'Documents Supplémentaires',
    optional_docs_desc: 'Ces documents peuvent accélérer le processus de vérification si nécessaire.',
    upload_document: 'Soumettre le document',
    under_review: 'En révision',
    approved: 'Approuvé',
    rejected: 'Refusé',
    expired: 'Expiré',
    renew_document: 'Renouveler le document',
    reupload_document: 'Soumettre à nouveau',
    expiration_warning_days: 'Expire dans {{days}} jours',
    timeline_submit: 'Soumission',
    timeline_review: 'Validation en cours',
    timeline_approved: 'Approbation finale',
    timeline_title: 'Étapes de validation',
    verification_status_approved: 'Profil validé et conforme ✓',
    verification_status_rejected: 'Certains documents ont été rejetés',
    verification_status_pending: 'Examen administratif en cours',
    verification_status_incomplete: 'Documents requis manquants',
    driver_license: 'Permis de Conduire',
    driver_license_desc: 'Photo recto de votre permis de conduire original',
    national_id_or_passport: 'Pièce d\'identité ou Passeport',
    national_id_or_passport_desc: 'Photo de votre carte nationale ou passeport',
    vehicle_registration: 'Carte Grise',
    vehicle_registration_desc: 'Photo lisible de la carte grise du véhicule',
    insurance_certificate: 'Attestation d\'Assurance',
    insurance_certificate_desc: 'Attestation de responsabilité civile professionnelle',
    technical_inspection: 'Contrôle Technique',
    technical_inspection_desc: 'Procès-verbal de contrôle technique à jour',
    professional_permit: 'Permis de Confiance',
    professional_permit_desc: 'Permis de confiance professionnel de transport',
    taxi_authorization: 'Agrément Taxi',
    taxi_authorization_desc: 'Autorisation administrative officielle de taxi',
    municipal_authorization: 'Autorisation Municipale',
    municipal_authorization_desc: 'Autorisation municipale locale de transport',
    special_authorization: 'Autorisation Spéciale',
    special_authorization_desc: 'Autorisation spéciale exceptionnelle de transport',
    registre_commerce: 'Registre du Commerce',
    registre_commerce_desc: 'Copie récente du registre du commerce',
    rental_agreement: 'Contrat de Location',
    rental_agreement_desc: 'Contrat d\'affrètement ou de location du véhicule',
    company_docs: 'Dossier Entreprise',
    company_docs_desc: 'Statuts officiels et informations de l\'entreprise',
    fleet_permit: 'Autorisation Flotte',
    fleet_permit_desc: 'Autorisation de gestion de flotte délivrée',
    additional_doc: 'Document Supplémentaire',
    additional_doc_desc: 'Toute pièce demandée par l\'administration',
  }, true, true);

  i18n.addResourceBundle('en', 'profile', {
    documents_title: 'Documents',
    verification_status: 'Verification Status',
    verification_notice: 'All documents are reviewed by the Yalla VTC team before account activation.',
    progress_percent: '{{percent}}% validated',
    required_docs_section: 'Required Documents',
    conditional_docs_section: 'Conditional Documents',
    optional_docs_section: 'Additional Documents',
    optional_docs_desc: 'These documents can help speed up verification if needed.',
    upload_document: 'Upload Document',
    under_review: 'Under Review',
    approved: 'Approved',
    rejected: 'Rejected',
    expired: 'Expired',
    renew_document: 'Renew Document',
    reupload_document: 'Re-upload',
    expiration_warning_days: 'Expires in {{days}} days',
    timeline_submit: 'Upload Files',
    timeline_review: 'Under Review',
    timeline_approved: 'Final Approval',
    timeline_title: 'Verification Phases',
    verification_status_approved: 'Account verified & active ✓',
    verification_status_rejected: 'Some documents were rejected',
    verification_status_pending: 'Under administrative review',
    verification_status_incomplete: 'Please complete required documents',
    driver_license: 'Driver\'s License',
    driver_license_desc: 'Clear front photo of your driving license',
    national_id_or_passport: 'National ID or Passport',
    national_id_or_passport_desc: 'Photo of national identity card or passport',
    vehicle_registration: 'Vehicle Registration (Grey Card)',
    vehicle_registration_desc: 'Clear photo of official vehicle registration',
    insurance_certificate: 'Vehicle Insurance',
    insurance_certificate_desc: 'Valid professional liability transport insurance',
    technical_inspection: 'Technical Inspection',
    technical_inspection_desc: 'Valid safety technical inspection certificate',
    professional_permit: 'Professional Trust Permit',
    professional_permit_desc: 'Copy of valid professional transport permit',
    taxi_authorization: 'Taxi License',
    taxi_authorization_desc: 'Copy of the official taxi permit registration',
    municipal_authorization: 'Municipal Authorization',
    municipal_authorization_desc: 'Local municipality issued transport license',
    special_authorization: 'Special Authorization',
    special_authorization_desc: 'Exceptional route transport authorization',
    registre_commerce: 'Commercial Registry',
    registre_commerce_desc: 'Official certificate of commercial registry',
    rental_agreement: 'Rental Agreement',
    rental_agreement_desc: 'Vehicle hire or charter agreement',
    company_docs: 'Company Portfolio',
    company_docs_desc: 'Company registration or constitution details',
    fleet_permit: 'Fleet Operations Permit',
    fleet_permit_desc: 'Official permit issued for managing fleet',
    additional_doc: 'Additional File',
    additional_doc_desc: 'Any extra document requested by admins',
  }, true, true);

  i18n.addResourceBundle('es', 'profile', {
    documents_title: 'Documentos',
    verification_status: 'Estado de Verificación',
    verification_notice: 'Todos los documentos son revisados por el equipo de Yalla VTC antes de la activación.',
    progress_percent: '{{percent}}% validados',
    required_docs_section: 'Documentos Obligatorios',
    conditional_docs_section: 'Documentos Condicionales',
    optional_docs_section: 'Documentos Adicionales',
    optional_docs_desc: 'Estos documentos pueden acelerar el proceso de verificación si es necesario.',
    upload_document: 'Subir documento',
    under_review: 'En revisión',
    approved: 'Aprobado',
    rejected: 'Rechazado',
    expired: 'Expirado',
    renew_document: 'Renovar documento',
    reupload_document: 'Volver a subir',
    expiration_warning_days: 'Vence en {{days}} días',
    timeline_submit: 'Envío',
    timeline_review: 'Validación en curso',
    timeline_approved: 'Aprobación final',
    timeline_title: 'Fases de Verificación',
    verification_status_approved: 'Estado activo y aprobado ✓',
    verification_status_rejected: 'Algunos documentos fueron rechazados',
    verification_status_pending: 'Examen administrativo en curso',
    verification_status_incomplete: 'Faltan documentos obligatorios',
    driver_license: 'Permiso de Conducir',
    driver_license_desc: 'Foto clara de la parte frontal de su licencia',
    national_id_or_passport: 'Documento Nacional o Pasaporte',
    national_id_or_passport_desc: 'Foto de tarjeta de identidad o pasaporte',
    vehicle_registration: 'Permiso de Circulación (Tarjeta Gris)',
    vehicle_registration_desc: 'Foto del documento de registro del vehículo',
    insurance_certificate: 'Seguro del Vehículo',
    insurance_certificate_desc: 'Certificado de seguro comercial de transporte',
    technical_inspection: 'Inspección Técnica',
    technical_inspection_desc: 'Certificado técnico de seguridad vehicular vigente',
    professional_permit: 'Permiso Profesional',
    professional_permit_desc: 'Copia de tarjeta de permiso profesional',
    taxi_authorization: 'Licencia de Taxi',
    taxi_authorization_desc: 'Tarjeta de autorización municipal de taxi',
    municipal_authorization: 'Autorización Municipal',
    municipal_authorization_desc: 'Copias del permiso de transporte local',
    special_authorization: 'Autorización Especial',
    special_authorization_desc: 'Autorización de conducción excepcional',
    registre_commerce: 'Registro Mercantil',
    registre_commerce_desc: 'Certificado fiscal del registro de la organización',
    rental_agreement: 'Contrato de Arrendamiento',
    rental_agreement_desc: 'Contrato de renting comercial del automóvil',
    company_docs: 'Estatuto de la Empresa',
    company_docs_desc: 'Presentación legal de la empresa',
    fleet_permit: 'Permiso de Flota',
    fleet_permit_desc: 'Autorizaciones expedidas para la flota empresarial',
    additional_doc: 'Archivo Adicional',
    additional_doc_desc: 'Cualquier otro documento requerido por la gerencia',
  }, true, true);
};

// ── Document config ───────────────────────────────────────────────────────────
const getDocumentConfig = (type: string, t: (k: string) => string) => {
  switch (type) {
    case 'DRIVING_LICENSE':         return { title: t('driver_license'), desc: t('driver_license_desc'), expires: true };
    case 'IDENTITY_CARD':           return { title: t('national_id_or_passport'), desc: t('national_id_or_passport_desc'), expires: true };
    case 'CARTE_GRISE':             return { title: t('vehicle_registration'), desc: t('vehicle_registration_desc'), expires: true };
    case 'INSURANCE_POLICY':        return { title: t('insurance_certificate'), desc: t('insurance_certificate_desc'), expires: true };
    case 'TECHNICAL_INSPECTION':    return { title: t('technical_inspection'), desc: t('technical_inspection_desc'), expires: true };
    case 'PROFESSIONAL_PERMIT':     return { title: t('professional_permit'), desc: t('professional_permit_desc'), expires: true };
    case 'TAXI_AUTHORIZATION':      return { title: t('taxi_authorization'), desc: t('taxi_authorization_desc'), expires: true };
    case 'MUNICIPAL_AUTHORIZATION': return { title: t('municipal_authorization'), desc: t('municipal_authorization_desc'), expires: true };
    case 'SPECIAL_AUTHORIZATION':   return { title: t('special_authorization'), desc: t('special_authorization_desc'), expires: true };
    case 'REGISTRE_COMMERCE':       return { title: t('registre_commerce'), desc: t('registre_commerce_desc'), expires: false };
    case 'RENTAL_AGREEMENT':        return { title: t('rental_agreement'), desc: t('rental_agreement_desc'), expires: true };
    case 'COMPANY_DOCS':            return { title: t('company_docs'), desc: t('company_docs_desc'), expires: false };
    case 'FLEET_PERMIT':            return { title: t('fleet_permit'), desc: t('fleet_permit_desc'), expires: true };
    case 'ADDITIONAL_DOC':          return { title: t('additional_doc'), desc: t('additional_doc_desc'), expires: false };
    default: return { title: type.replace(/_/g, ' '), desc: '', expires: false };
  }
};

const daysLeft = (expiresAt: string) =>
  Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86400000);

export const clearDocumentStorageCache = async () => {
  try {
    const keys = [
      '@uploaded_doc_IDENTITY_CARD',
      '@uploaded_doc_PASSPORT',
      '@uploaded_doc_CIN',
      '@uploaded_doc_DRIVING_LICENSE',
      '@uploaded_doc_DRIVER_LICENSE',
      '@uploaded_doc_CARTE_GRISE',
      '@uploaded_doc_VEHICLE_REGISTRATION',
    ];
    await AsyncStorage.multiRemove(keys);
  } catch (_) {}
};

// ── Main Screen ───────────────────────────────────────────────────────────────
export const DocumentsScreen = () => {
  useEffect(() => { registerDocumentLocales(); }, []);

  const { t, i18n: currentI18n } = useTranslation(['profile', 'translation']);
  const { colors, isDarkMode } = useTheme();
  const navigation = useNavigation<any>();
  const isRTL = currentI18n.language === 'ar';

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [showOptionalModal, setShowOptionalModal] = useState(false);

  // ── Full Name Modal (shown when fullName is missing before submit) ────────
  const [showNameModal, setShowNameModal] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);

  // Refetch every time screen is focused (e.g. after returning from DocumentDetailScreen)
  useFocusEffect(
    useCallback(() => {
      fetchDocumentsSummary();
    }, [])
  );

  const fetchDocumentsSummary = async () => {
    try {
      setLoading(true);
      const res = await api.get('/driver/documents').catch(() => null);
      let docsData = res?.data || { uploadedDocuments: [], verificationStatus: 'PENDING', progressPercentage: 0 };
      if (!docsData.uploadedDocuments) docsData.uploadedDocuments = [];

      // Check local storage for warm-cached uploads matching all key aliases
      const mandatoryBasicKeys = [
        'driver_license',
        'national_id_or_passport',
        'vehicle_registration',
        'insurance_certificate',
      ];

      const keyAliases: Record<string, string[]> = {
        'driver_license': ['driver_license', 'DRIVING_LICENSE', 'license'],
        'national_id_or_passport': ['national_id_or_passport', 'IDENTITY_CARD', 'PASSPORT', 'CIN', 'cin_recto', 'cin_verso'],
        'vehicle_registration': ['vehicle_registration', 'CARTE_GRISE', 'vehicle_grey_card', 'grey_card'],
        'insurance_certificate': ['insurance_certificate', 'INSURANCE', 'insurance', 'assurance'],
      };

      for (const mainKey of mandatoryBasicKeys) {
        const aliases = keyAliases[mainKey] || [mainKey];
        let foundStored: string | null = null;
        for (const alias of aliases) {
          const stored = await AsyncStorage.getItem(`@uploaded_doc_${alias}`);
          if (stored) {
            foundStored = stored;
            break;
          }
        }
        if (foundStored) {
          try {
            const parsed = JSON.parse(foundStored);
            const exists = docsData.uploadedDocuments.some((d: any) => {
              const dt = (d.type || d.documentType || '').toLowerCase();
              return aliases.some(a => a.toLowerCase() === dt);
            });
            if (!exists) {
              docsData.uploadedDocuments.push({
                type: mainKey,
                status: parsed.status || 'PENDING',
                expiresAt: parsed.expiresAt,
                documentType: mainKey,
              });
            }
          } catch (_) {}
        }
      }

      // Calculate progress percentage dynamically for basic required documents ONLY (optional docs do NOT alter 100%)
      const uploadedCount = mandatoryBasicKeys.filter(mainKey => {
        const aliases = keyAliases[mainKey] || [mainKey];
        return docsData.uploadedDocuments.some((d: any) => {
          const dt = (d.type || d.documentType || '').toLowerCase();
          return aliases.some(a => a.toLowerCase() === dt);
        });
      }).length;

      docsData.progressPercentage = Math.round((uploadedCount / mandatoryBasicKeys.length) * 100);

      // Force PENDING status if at least one doc uploaded
      if (uploadedCount > 0 && docsData.verificationStatus !== 'APPROVED' && docsData.verificationStatus !== 'REJECTED') {
        docsData.verificationStatus = 'PENDING';
      }

      setData(docsData);
    } catch (err) {
      console.error('[DocumentsScreen] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ── Submit with Name Check ────────────────────────────────────────────────
  /**
   * Called when the user presses the submit/confirm button on any doc flow.
   * If driver has no fullName yet, we show the name modal first.
   * After saving the name, the original submit action proceeds automatically.
   */
  const checkFullNameThenProceed = async (onProceed: () => void) => {
    try {
      const res = await api.get('/driver/profile');
      const profile = res.data;
      if (!profile?.fullName || profile.fullName.trim() === '') {
        // Store the callback so we can call it after name is saved
        setPendingSubmit(true);
        setShowNameModal(true);
        // Save callback via a ref trick using state
        (checkFullNameThenProceed as any)._pendingCb = onProceed;
      } else {
        onProceed();
      }
    } catch {
      // If profile fetch fails, let the original action proceed
      onProceed();
    }
  };

  const handleSaveNameAndSubmit = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert(
        i18n.language === 'ar' ? 'تنبيه' : 'Required',
        i18n.language === 'ar'
          ? 'يرجى إدخال الاسم الشخصي والاسم العائلي.'
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
      setPendingSubmit(false);
      // Call the pending submit action
      const cb = (checkFullNameThenProceed as any)._pendingCb;
      if (cb) {
        (checkFullNameThenProceed as any)._pendingCb = null;
        cb();
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        (i18n.language === 'ar' ? 'فشل حفظ الاسم. حاول مجدداً.' : 'Failed to save name. Please try again.');
      Alert.alert(i18n.language === 'ar' ? 'خطأ' : 'Error', msg);
    } finally {
      setIsSavingName(false);
    }
  };

  const { isMotorcycleMode, vehicleType: cachedModeType } = useVehicleMode();

  // Navigate to document detail
  const openDetail = async (type: string) => {
    const uploaded = data?.uploadedDocuments?.find((d: any) => d.type === type) || null;
    if (type === 'IDENTITY_CARD' || type === 'PASSPORT') {
      navigation.navigate('IdentityCard', { uploadedDoc: uploaded });
    } else if (type === 'DRIVING_LICENSE' || type === 'DRIVER_LICENSE') {
      navigation.navigate('DriverLicense', { uploadedDoc: uploaded });
    } else if (type === 'CARTE_GRISE' || type === 'VEHICLE_REGISTRATION' || type === 'REGISTRATION_CARD') {
      const storedVehicleType = await AsyncStorage.getItem('registered_vehicle_type');
      if (
        isMotorcycleMode ||
        cachedModeType === 'MOTORCYCLE' ||
        storedVehicleType === 'MOTORCYCLE' ||
        data?.vehicleType === 'MOTORCYCLE' ||
        data?.vehicle?.type === 'MOTORCYCLE'
      ) {
        navigation.navigate('MotorcycleInfo');
      } else {
        navigation.navigate('VehicleInfo');
      }
    } else {
      navigation.navigate('DocumentDetail', { type, uploadedDoc: uploaded });
    }
  };

  const getStatusDetails = (status: string) => {
    const isArabic = i18n.language === 'ar';
    const isFrench = i18n.language === 'fr';
    const isSpanish = i18n.language === 'es';

    switch (status) {
      case 'APPROVED': return { color: '#22C55E', bg: 'rgba(34,197,94,0.10)', badge: isArabic ? 'مكتملة ومقبولة ✅' : (isFrench ? 'Approuvé ✅' : (isSpanish ? 'Aprobado ✅' : 'Approved ✅')), icon: <CheckCircle2 size={16} color="#22C55E" /> };
      case 'REJECTED': return { color: '#EF4444', bg: 'rgba(239,68,68,0.10)', badge: t('rejected'), icon: <XCircle size={16} color="#EF4444" /> };
      case 'EXPIRED':  return { color: '#F97316', bg: 'rgba(249,115,22,0.10)', badge: t('expired'), icon: <AlertTriangle size={16} color="#F97316" />};
      case 'PENDING':  return { color: '#22C55E', bg: 'rgba(34,197,94,0.10)', badge: isArabic ? 'مكتملة (قيد المراجعة) ✅' : (isFrench ? 'Complété (En révision) ✅' : (isSpanish ? 'Completado (En revisión) ✅' : 'Completed (Under Review) ✅')), icon: <CheckCircle2 size={16} color="#22C55E" /> };
      default:         return { color: colors.textMuted, bg: colors.surfaceAlt, badge: '', icon: null };
    }
  };

  const getVerificationHeader = () => {
    const isArabic = i18n.language === 'ar';
    const isFrench = i18n.language === 'fr';
    const isSpanish = i18n.language === 'es';

    const hasAnyDoc = (data?.uploadedDocuments?.length || 0) > 0 || (data?.progressPercentage || 0) > 0;
    const effStatus = data?.verificationStatus || (hasAnyDoc ? 'PENDING' : 'INCOMPLETE');

    switch (effStatus) {
      case 'APPROVED':
        return { title: t('approved'), desc: t('verification_status_approved'), color: '#22C55E', icon: <CheckCircle2 size={30} color="#22C55E" /> };
      case 'REJECTED':
        return { title: t('rejected'), desc: t('verification_status_rejected'), color: '#EF4444', icon: <XCircle size={30} color="#EF4444" />     };
      case 'PENDING':
        return {
          title: t('under_review'),
          desc: isArabic ? 'قيد مراجعة الإدارة (تم استقبال الوثائق)' : (isFrench ? 'Examen administratif en cours' : (isSpanish ? 'Examen administrativo en curso' : 'Under administrative review')),
          color: '#F59E0B',
          icon: <Clock size={30} color="#F59E0B" />
        };
      default:
        return { title: t('verification_status'), desc: t('verification_status_incomplete'), color: '#94A3B8', icon: <AlertTriangle size={30} color="#94A3B8" /> };
    }
  };

  // ── Render Document Card ──────────────────────────────────────────────────
  const renderCard = (type: string) => {
    const cfg = getDocumentConfig(type, t);
    const uploaded = data?.uploadedDocuments?.find((d: any) => {
      const dt = (d.type || d.documentType || '').toUpperCase();
      const target = (type || '').toUpperCase();
      if (target === 'IDENTITY_CARD') return dt === 'IDENTITY_CARD' || dt === 'PASSPORT' || dt === 'CIN';
      if (target === 'DRIVING_LICENSE') return dt === 'DRIVING_LICENSE' || dt === 'DRIVER_LICENSE' || dt === 'LICENSE';
      if (target === 'CARTE_GRISE') return dt === 'CARTE_GRISE' || dt === 'VEHICLE_REGISTRATION' || dt === 'REGISTRATION_CARD';
      return dt === target;
    });
    const remaining = uploaded?.expiresAt ? daysLeft(uploaded.expiresAt) : null;
    const isExpired = uploaded?.status === 'EXPIRED' || (remaining !== null && remaining <= 0);
    const isRejected = uploaded?.status === 'REJECTED';
    const isApproved = uploaded?.status === 'APPROVED';
    const isPending = uploaded?.status === 'PENDING';
    const needsAction = isExpired || isRejected;

    if (!uploaded) {
      // ── Not uploaded yet
      return (
        <TouchableOpacity
          key={type}
          activeOpacity={0.82}
          onPress={() => openDetail(type)}
          style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderStyle: 'dashed' }]}
        >
          <View style={styles.cardBody}>
            <View style={[styles.iconCircle, { backgroundColor: colors.surfaceAlt }]}>
              <FileText size={20} color={colors.textSecondary} />
            </View>
            <View style={styles.cardText}>
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{cfg.title}</Text>
              <Text style={[styles.cardDesc, { color: colors.textSecondary }]} numberOfLines={1}>{cfg.desc}</Text>
            </View>
            <View style={[styles.roundPlusBtn, { backgroundColor: colors.surfaceAlt }]}>
              <Plus size={15} color={colors.textSecondary} />
            </View>
          </View>
          <View style={[styles.uploadFooter, { borderTopColor: colors.border + '80' }]}>
            <CameraIcon size={12} color={colors.primary} style={{ marginRight: 5 }} />
            <Text style={[styles.uploadFooterText, { color: colors.primary }]}>{t('upload_document')}</Text>
          </View>
        </TouchableOpacity>
      );
    }

    const st = getStatusDetails(isExpired ? 'EXPIRED' : uploaded.status);

    return (
      <TouchableOpacity
        key={type}
        activeOpacity={0.82}
        onPress={() => openDetail(type)}
        style={[styles.card, { backgroundColor: st.bg, borderColor: st.color + '55' }]}
      >
        <View style={styles.cardBody}>
          <View style={[styles.iconCircle, { backgroundColor: colors.surface }]}>
            <FileText size={20} color={st.color} />
          </View>
          <View style={styles.cardText}>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{cfg.title}</Text>
            <View style={styles.rowInline}>
              <View style={[styles.statusPill, { backgroundColor: st.color + '18', borderColor: st.color + '60' }]}>
                <Text style={[styles.statusPillText, { color: st.color }]}>{st.badge}</Text>
              </View>
              {uploaded.expiresAt && !isExpired && remaining !== null && remaining < 30 && (
                <Text style={[styles.expiryChip, { color: remaining < 8 ? '#EF4444' : '#F97316' }]}>
                  {t('expiration_warning_days', { days: remaining })}
                </Text>
              )}
            </View>
          </View>
          <View style={styles.cardRight}>
            {isApproved ? (
              <Lock size={14} color={colors.textMuted} />
            ) : isPending ? (
              <Clock size={14} color="#F59E0B" />
            ) : (
              <ChevronLeft size={16} style={{ transform: [{ scaleX: isRTL ? 1 : -1 }] }} color={st.color} />
            )}
          </View>
        </View>

        {/* Rejection reason inline */}
        {isRejected && uploaded.rejectionReason && (
          <View style={[styles.rejectionInline, { borderTopColor: '#EF4444' + '30' }]}>
            <BadgeAlert size={13} color="#EF4444" style={{ marginRight: 6 }} />
            <Text style={styles.rejectionInlineText} numberOfLines={2}>{uploaded.rejectionReason}</Text>
          </View>
        )}

        {/* Direct action footer for rejected/expired */}
        {needsAction && (
          <View style={[styles.actionFooter, { borderTopColor: st.color + '30', backgroundColor: st.color + '08' }]}>
            <RefreshCw size={13} color={st.color} style={{ marginRight: 6 }} />
            <Text style={[styles.actionFooterText, { color: st.color }]}>
              {isRejected ? t('reupload_document') : t('renew_document')}
            </Text>
            <ArrowRight size={13} color={st.color} style={{ marginLeft: 'auto' as any, transform: [{ scaleX: isRTL ? -1 : 1 }] }} />
          </View>
        )}

        {/* Direct action footer for completed/uploaded docs: Edit button */}
        {!needsAction && (
          <View style={[styles.actionFooter, { borderTopColor: colors.primary + '30', backgroundColor: colors.primary + '0D' }]}>
            <Pencil size={13} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={[styles.actionFooterText, { color: colors.primary, fontWeight: '700' }]}>
              {isRTL ? 'مكتملة — انقر لتعديل الوثيقة ✏️' : (i18n.language === 'fr' ? 'Complété — Appuyez pour modifier ✏️' : 'Completed — Tap to edit ✏️')}
            </Text>
            <ChevronLeft size={14} color={colors.primary} style={{ marginLeft: 'auto', transform: [{ scaleX: isRTL ? 1 : -1 }] }} />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const vHeader = getVerificationHeader();
  const progressPct = data?.progressPercentage || 0;

  // ── Skeleton ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
        <DrawerHeader title={t('documents_title')} />
        <View style={styles.skeletonWrap}>
          {[1, 2, 3, 4].map(i => (
            <View key={i} style={[styles.skeletonCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.skeletonLine, { width: '60%', backgroundColor: colors.surfaceAlt }]} />
              <View style={[styles.skeletonLine, { width: '90%', backgroundColor: colors.surfaceAlt, marginTop: 8 }]} />
            </View>
          ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {/* Drawer-aware Header */}
      <DrawerHeader title={t('documents_title')} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Verification Status Card */}
        <View style={[styles.statusCard, { backgroundColor: colors.surface, borderColor: vHeader.color + '40' }]}>
          <View style={[styles.statusRow, isRTL && { flexDirection: 'row-reverse' }]}>
            {vHeader.icon}
            <View style={[styles.statusTextBlk, { alignItems: isRTL ? 'flex-end' : 'flex-start', marginHorizontal: 14 }]}>
              <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>{t('verification_status')}</Text>
              <Text style={[styles.statusDesc, { color: colors.textPrimary }]}>{vHeader.desc}</Text>
            </View>
            <Text style={[styles.progressPct, { color: vHeader.color, marginLeft: 'auto' as any }]}>{progressPct}%</Text>
          </View>

          {/* Progress bar */}
          <View style={[styles.progressBg, { backgroundColor: colors.surfaceAlt }]}>
            <View style={[styles.progressFill, { width: `${progressPct}%`, backgroundColor: vHeader.color }]} />
          </View>
          <Text style={[styles.progressNotice, { color: colors.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
            {t('verification_notice')}
          </Text>
        </View>

        {/* ── Required Documents ─────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeading, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
            {t('required_docs_section')}
          </Text>
          {data?.basicRequired?.map((type: string) => renderCard(type))}
        </View>

        {/* ── Conditional Documents ──────────────────────────────────────── */}
        {data?.conditionalRequired?.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionHeading, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
              {t('conditional_docs_section')}
            </Text>
            {data.conditionalRequired.map((type: string) => renderCard(type))}
          </View>
        )}

        {/* ── 3D Button Card for Optional Additional Documents ──────────── */}
        <View style={styles.section}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setShowOptionalModal(true)}
            style={[
              styles.btn3DCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.primary + '55',
                shadowColor: colors.primary,
              },
            ]}
          >
            {/* Top Gloss Highlight Accent */}
            <View style={[styles.card3DGlossAccent, { backgroundColor: colors.primary }]} />

            <View style={[styles.card3DBody, isRTL && { flexDirection: 'row-reverse' }]}>
              {/* Glowing Circle Icon */}
              <View style={[styles.card3DIconBadge, { backgroundColor: colors.primary + '18' }]}>
                <Sparkles size={24} color={colors.primary} />
              </View>

              <View style={[styles.card3DText, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                <View style={[styles.card3DTitleRow, isRTL && { flexDirection: 'row-reverse' }]}>
                  <Text style={[styles.card3DTitle, { color: colors.textPrimary }]}>
                    {t('optional_docs_section')}
                  </Text>
                  <View style={[styles.badgePill3D, { backgroundColor: colors.primary + '20', borderColor: colors.primary + '50' }]}>
                    <Text style={[styles.badgePill3DText, { color: colors.primary }]}>
                      {data?.optionalTypes?.filter((type: string) => data?.uploadedDocuments?.some((d: any) => d.type === type)).length || 0} / {data?.optionalTypes?.length || 11}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.card3DDesc, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={2}>
                  {t('optional_docs_desc')}
                </Text>
              </View>

              {/* Action Circle */}
              <View style={[styles.roundAction3DBtn, { backgroundColor: colors.primary }]}>
                <Plus size={18} color="#FFFFFF" />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── Modal Bottom Sheet for Optional Documents Selection ───────────── */}
      <Modal
        visible={showOptionalModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowOptionalModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setShowOptionalModal(false)}
          />
          <View style={[styles.modalSheet, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
            {/* Modal Drag Handle */}
            <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />

            {/* Modal Header */}
            <View style={[styles.modalHeaderRow, isRTL && { flexDirection: 'row-reverse' }]}>
              <View style={{ flex: 1, alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
                <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 8 }}>
                  <Sparkles size={20} color={colors.primary} />
                  <Text style={[styles.modalHeaderTitle, { color: colors.textPrimary }]}>
                    {t('optional_docs_section')}
                  </Text>
                </View>
                <Text style={[styles.modalHeaderSub, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
                  {t('optional_docs_desc')}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.modalCloseBtn, { backgroundColor: colors.surfaceAlt }]}
                onPress={() => setShowOptionalModal(false)}
              >
                <X size={20} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* List of Optional Documents */}
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {data?.optionalTypes?.map((type: string) => (
                <TouchableOpacity
                  key={type}
                  activeOpacity={0.8}
                  onPress={() => {
                    setShowOptionalModal(false);
                    openDetail(type);
                  }}
                >
                  {renderCard(type)}
                </TouchableOpacity>
              ))}
              <View style={{ height: 30 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Full Name Modal ─────────────────────────────────────────────── */}
      <Modal
        visible={showNameModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowNameModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={() => !isSavingName && setShowNameModal(false)}
            />
            <View style={[styles.nameModalSheet, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
              {/* Drag Handle */}
              <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />

              {/* Header */}
              <View style={[styles.nameModalHeader, isRTL && { alignItems: 'flex-end' }]}>
                <View style={[styles.nameModalIconBadge, { backgroundColor: colors.primary + '18' }]}>
                  <User size={24} color={colors.primary} />
                </View>
                <Text style={[styles.nameModalTitle, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>
                  {isRTL || currentI18n.language === 'ar'
                    ? 'أكمل معلوماتك الشخصية'
                    : currentI18n.language === 'fr'
                    ? 'Complétez vos informations'
                    : 'Complete Your Profile'}
                </Text>
                <Text style={[styles.nameModalSub, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
                  {isRTL || currentI18n.language === 'ar'
                    ? 'لإرسال طلب التسجيل، نحتاج إلى اسمك الحقيقي كما هو مكتوب في بطاقة الهوية.'
                    : currentI18n.language === 'fr'
                    ? `Pour soumettre votre dossier, nous avons besoin de votre nom réel tel qu'il figure sur votre pièce d'identité.`
                    : 'To submit your registration, we need your full legal name as it appears on your ID.'}
                </Text>
              </View>

              {/* Inputs */}
              <View style={[styles.nameModalInputsRow, isRTL && { flexDirection: 'row-reverse' }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.nameInputLabel, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
                    {isRTL || currentI18n.language === 'ar' ? 'الاسم الشخصي *' : currentI18n.language === 'fr' ? 'Prénom *' : 'First Name *'}
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
                    placeholder={isRTL || currentI18n.language === 'ar' ? 'مثال: محمد' : 'e.g. John'}
                    placeholderTextColor={colors.textMuted}
                    value={firstName}
                    onChangeText={setFirstName}
                    autoCapitalize="words"
                    returnKeyType="next"
                  />
                </View>
                <View style={{ width: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.nameInputLabel, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
                    {isRTL || currentI18n.language === 'ar' ? 'الاسم العائلي *' : currentI18n.language === 'fr' ? 'Nom *' : 'Last Name *'}
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
                    placeholder={isRTL || currentI18n.language === 'ar' ? 'مثال: العمري' : 'e.g. Doe'}
                    placeholderTextColor={colors.textMuted}
                    value={lastName}
                    onChangeText={setLastName}
                    autoCapitalize="words"
                    returnKeyType="done"
                    onSubmitEditing={handleSaveNameAndSubmit}
                  />
                </View>
              </View>

              {/* Preview of full name */}
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
                onPress={handleSaveNameAndSubmit}
                disabled={isSavingName || !firstName.trim() || !lastName.trim()}
                activeOpacity={0.85}
              >
                {isSavingName ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={[
                    styles.nameConfirmBtnText,
                    { color: firstName.trim() && lastName.trim() ? '#fff' : colors.textMuted },
                  ]}>
                    {isRTL || currentI18n.language === 'ar'
                      ? 'متابعة وإرسال الوثائق'
                      : currentI18n.language === 'fr'
                      ? 'Continuer et soumettre'
                      : 'Continue & Submit Documents'}
                  </Text>
                )}
              </TouchableOpacity>

              <View style={{ height: 20 }} />
            </View>
          </View>
        </KeyboardAvoidingView>
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
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  scrollContent: { padding: 16 },

  skeletonWrap: { padding: 16 },
  skeletonCard: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 12 },
  skeletonLine: { height: 12, borderRadius: 6 },

  statusCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 20 },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  statusTextBlk: { flex: 1 },
  statusLabel: { fontSize: 11, fontWeight: '600', marginBottom: 2 },
  statusDesc: { fontSize: 13, fontWeight: '700', lineHeight: 18 },
  progressPct: { fontSize: 18, fontWeight: '800' },
  progressBg: { height: 6, borderRadius: 3, overflow: 'hidden', marginTop: 12, marginBottom: 8 },
  progressFill: { height: '100%', borderRadius: 3 },
  progressNotice: { fontSize: 11.5, lineHeight: 15 },

  section: { marginBottom: 22 },
  sectionHeading: { fontSize: 13, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8 },
  sectionDesc: { fontSize: 12, lineHeight: 16, marginBottom: 12 },

  card: { borderRadius: 14, borderWidth: 1, marginBottom: 10, overflow: 'hidden' },
  cardBody: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  cardDesc: { fontSize: 12, lineHeight: 15 },
  cardRight: { paddingLeft: 8 },
  rowInline: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  statusPill: { borderWidth: 1, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusPillText: { fontSize: 10.5, fontWeight: '700' },
  expiryChip: { fontSize: 11, fontWeight: '600' },
  roundPlusBtn: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  uploadFooter: {
    borderTopWidth: 1,
    paddingVertical: 9,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadFooterText: { fontSize: 12, fontWeight: '700' },
  rejectionInline: {
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  rejectionInlineText: { flex: 1, color: '#EF4444', fontSize: 12, lineHeight: 16 },
  actionFooter: {
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  actionFooterText: { fontSize: 12.5, fontWeight: '700' },

  timelineCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginTop: 4 },
  timelineHeading: { fontSize: 14, fontWeight: '700', marginBottom: 18 },
  timelineRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 },
  timelineStepBlk: { alignItems: 'center', width: 72 },
  timelineCircle: {
    width: 28, height: 28, borderRadius: 14, borderWidth: 1,
    justifyContent: 'center', alignItems: 'center', marginBottom: 6,
  },
  timelineDot: { width: 8, height: 8, borderRadius: 4 },
  timelineLabel: { fontSize: 10.5, fontWeight: '600', textAlign: 'center', lineHeight: 14 },
  timelineConnector: { flex: 1, height: 2, marginBottom: 20 },

  // 3D Card Styles
  btn3DCard: {
    borderRadius: 20,
    borderWidth: 1.5,
    overflow: 'hidden',
    elevation: 6,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    marginVertical: 4,
  },
  card3DGlossAccent: {
    height: 4,
    width: '100%',
    opacity: 0.9,
  },
  card3DBody: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  card3DIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card3DText: {
    flex: 1,
  },
  card3DTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    gap: 8,
  },
  card3DTitle: {
    fontSize: 15.5,
    fontWeight: '700',
  },
  card3DDesc: {
    fontSize: 12.5,
    lineHeight: 17,
  },
  badgePill3D: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  badgePill3DText: {
    fontSize: 11,
    fontWeight: '700',
  },
  roundAction3DBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },

  // Modal Bottom Sheet Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    maxHeight: '82%',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  modalHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 12,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150,150,150,0.15)',
  },
  modalHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalHeaderSub: {
    fontSize: 12.5,
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalScroll: {
    paddingBottom: 20,
  },

  // ── Full Name Modal Styles ───────────────────────────────────────────────
  nameModalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  nameModalHeader: {
    marginBottom: 20,
    paddingTop: 6,
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
