import React, { useState, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  StatusBar,
  Dimensions,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  HelpCircle,
  MessageSquare,
  Mail,
  Phone,
  Clock,
  Send,
  Paperclip,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Shield,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
  Info,
  LifeBuoy,
  Lock,
  Headphones,
  Bot,
} from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { api } from '../../api/axios.instance';
import { DrawerHeader } from '../../components/DrawerHeader';

const { width: SCREEN_W } = Dimensions.get('window');

export interface SupportTicket {
  id: string;
  ticketNo: string;
  category: string;
  subject: string;
  description: string;
  status: 'UNDER_REVIEW' | 'REPLIED' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
  replyMessage?: string;
  hasAttachment?: boolean;
}

// ─── 4 Languages Translations Dictionary ─────────────────────────────────────
const TRANSLATIONS: any = {
  ar: {
    help_center_title: 'مركز المساعدة',
    search_placeholder: 'كيف يمكننا مساعدتك؟ (المحفظة، الوثائق، الرحلات...)',
    category_all: 'الكل',
    category_wallet: '💰 المحفظة',
    category_docs: '📄 الوثائق',
    category_rides: '🗺️ الرحلات',
    category_account: '👤 الحساب',
    category_vehicle: '🚗 المركبة',
    faq_section_title: 'الأسئلة الشائعة (FAQ)',
    no_faq_found: 'لم نجد أسئلة تطابق بحثك',
    report_btn: '🆘 الإبلاغ عن مشكلة جديد',
    contact_section_title: 'تواصل مع الدعم الفني',
    live_chat: 'الدردشة المباشرة (Live Chat)',
    live_chat_sub: 'تحدث مع فريق الدعم الفني عبر واتساب',
    email_support: 'البريد الإلكتروني الرسمي',
    email_val: 'support@yallavtc.ma',
    phone_support: 'الهاتف المباشر',
    phone_val: '+212 5 22 00 00 00',
    working_hours: 'ساعات عمل الدعم',
    working_hours_val: '24/7 (على مدار 24 ساعة طيلة الأسبوع)',
    tickets_section_title: 'حالة طلبات الدعم البلاغات',
    no_tickets_desc: 'لم تقم بتقديم أي بلاغ دعم حتى الآن.',
    ticket_status_under_review: 'قيد المراجعة',
    ticket_status_replied: 'تم الرد',
    ticket_status_resolved: 'تم الحل',
    ticket_status_closed: 'مغلق',
    app_info_section: 'معلومات التطبيق والقانونية',
    app_version: 'إصدار التطبيق v1.4.2 (Build 2026)',
    last_update: 'آخر تحديث: 28 يوليو 2026',
    privacy_policy: 'سياسة الخصوصية',
    terms_of_service: 'شروط الاستخدام',
    
    // Modal Report
    report_modal_title: 'الإبلاغ عن مشكلة',
    select_category_lbl: 'اختر نوع المشكلة',
    desc_label: 'وصف المشكلة بالتفصيل',
    desc_placeholder: 'اكتب هنا تفاصيل المشكلة التي واجهتك لنتحدث معك فوراً...',
    attach_image_btn: 'إرفاق لقطة شاشة / صورة',
    image_attached: 'تم إرفاق صورة البلاغ بنجاح 📷',
    submit_ticket: 'إرسال البلاغ للدعم',
    sending: 'جاري إرسال الطلب...',
    success_msg: 'تم إرسال بلاغك بنجاح! رقم المرجع: ',

    // Modal Details
    ticket_details_title: 'تفاصيل بلاغ الدعم',
    ticket_no_lbl: 'رقم المرجع:',
    date_lbl: 'تاريخ الإرسال:',
    agent_reply: 'رد فريق الدعم الفني Yalla VTC:',
    close_modal: 'إغلاق',
  },
  fr: {
    help_center_title: "Centre d'aide",
    search_placeholder: 'Comment pouvons-nous vous aider ? (Portefeuille, Docs...)',
    category_all: 'Tous',
    category_wallet: '💰 Portefeuille',
    category_docs: '📄 Documents',
    category_rides: '🗺️ Courses',
    category_account: '👤 Compte',
    category_vehicle: '🚗 Véhicule',
    faq_section_title: 'Foire Aux Questions (FAQ)',
    no_faq_found: 'Aucune question ne correspond à votre recherche',
    report_btn: '🆘 Signaler un problème',
    contact_section_title: 'Contacter le support technique',
    live_chat: 'Chat en direct (Live Chat)',
    live_chat_sub: 'Discutez avec notre équipe via WhatsApp',
    email_support: 'E-mail officiel',
    email_val: 'support@yallavtc.ma',
    phone_support: 'Téléphone direct',
    phone_val: '+212 5 22 00 00 00',
    working_hours: 'Heures d\'ouverture du support',
    working_hours_val: '24/7 (Disponible 24h/24 et 7j/7)',
    tickets_section_title: 'Statut de vos tickets de support',
    no_tickets_desc: 'Vous n\'avez soumis aucun ticket pour le moment.',
    ticket_status_under_review: 'En cours',
    ticket_status_replied: 'Répondu',
    ticket_status_resolved: 'Résolu',
    ticket_status_closed: 'Fermé',
    app_info_section: 'Informations sur l\'application & Légal',
    app_version: 'Version de l\'application v1.4.2 (Build 2026)',
    last_update: 'Dernière mise à jour: 28 Juillet 2026',
    privacy_policy: 'Politique de confidentialité',
    terms_of_service: 'Conditions d\'utilisation',

    report_modal_title: 'Signaler un problème',
    select_category_lbl: 'Sélectionner la catégorie',
    desc_label: 'Description détaillée',
    desc_placeholder: 'Décrivez votre problème ici...',
    attach_image_btn: 'Joindre une capture d\'écran',
    image_attached: 'Image jointe avec succès 📷',
    submit_ticket: 'Envoyer au support',
    sending: 'Envoi en cours...',
    success_msg: 'Ticket envoyé avec succès ! Réf: ',

    ticket_details_title: 'Détails du ticket de support',
    ticket_no_lbl: 'Référence:',
    date_lbl: 'Date d\'envoi:',
    agent_reply: 'Réponse de l\'équipe Yalla VTC:',
    close_modal: 'Fermer',
  },
  es: {
    help_center_title: 'Centro de Ayuda',
    search_placeholder: '¿Cómo podemos ayudarte? (Billetera, Docs...)',
    category_all: 'Todos',
    category_wallet: '💰 Billetera',
    category_docs: '📄 Documentos',
    category_rides: '🗺️ Viajes',
    category_account: '👤 Cuenta',
    category_vehicle: '🚗 Vehículo',
    faq_section_title: 'Preguntas Frecuentes (FAQ)',
    no_faq_found: 'No se encontraron preguntas que coincidan',
    report_btn: '🆘 Reportar un problema',
    contact_section_title: 'Contactar a soporte técnico',
    live_chat: 'Chat en vivo (Live Chat)',
    live_chat_sub: 'Habla con nuestro equipo por WhatsApp',
    email_support: 'Correo oficial',
    email_val: 'support@yallavtc.ma',
    phone_support: 'Teléfono directo',
    phone_val: '+212 5 22 00 00 00',
    working_hours: 'Horarios de atención',
    working_hours_val: '24/7 (Disponible las 24 horas)',
    tickets_section_title: 'Estado de sus tickets de soporte',
    no_tickets_desc: 'No has enviado ningún ticket hasta el momento.',
    ticket_status_under_review: 'En revisión',
    ticket_status_replied: 'Respondido',
    ticket_status_resolved: 'Resuelto',
    ticket_status_closed: 'Cerrado',
    app_info_section: 'Información de la app y Legal',
    app_version: 'Versión de la app v1.4.2 (Build 2026)',
    last_update: 'Última actualización: 28 de Julio de 2026',
    privacy_policy: 'Política de privacidad',
    terms_of_service: 'Términos de servicio',

    report_modal_title: 'Reportar un problema',
    select_category_lbl: 'Seleccionar categoría',
    desc_label: 'Descripción detallada',
    desc_placeholder: 'Escriba los detalles de su problema aquí...',
    attach_image_btn: 'Adjuntar captura de pantalla',
    image_attached: 'Imagen adjuntada con éxito 📷',
    submit_ticket: 'Enviar a soporte',
    sending: 'Enviando...',
    success_msg: '¡Ticket enviado con éxito! Ref: ',

    ticket_details_title: 'Detalles del ticket de soporte',
    ticket_no_lbl: 'Referencia:',
    date_lbl: 'Fecha de envío:',
    agent_reply: 'Respuesta del equipo Yalla VTC:',
    close_modal: 'Cerrar',
  },
  en: {
    help_center_title: 'Help Center',
    search_placeholder: 'How can we help you? (Wallet, Docs, Rides...)',
    category_all: 'All',
    category_wallet: '💰 Wallet',
    category_docs: '📄 Documents',
    category_rides: '🗺️ Rides',
    category_account: '👤 Account',
    category_vehicle: '🚗 Vehicle',
    faq_section_title: 'Frequently Asked Questions (FAQ)',
    no_faq_found: 'No questions matching your search query',
    report_btn: '🆘 Report a Problem',
    contact_section_title: 'Contact Technical Support',
    live_chat: 'Live Chat (Support)',
    live_chat_sub: 'Chat with our support team via WhatsApp',
    email_support: 'Official Email',
    email_val: 'support@yallavtc.ma',
    phone_support: 'Direct Phone Line',
    phone_val: '+212 5 22 00 00 00',
    working_hours: 'Support Working Hours',
    working_hours_val: '24/7 (Around the clock service)',
    tickets_section_title: 'Support Tickets & Reports Status',
    no_tickets_desc: 'You have not submitted any support tickets yet.',
    ticket_status_under_review: 'Under Review',
    ticket_status_replied: 'Replied',
    ticket_status_resolved: 'Resolved',
    ticket_status_closed: 'Closed',
    app_info_section: 'App Info & Legal Notices',
    app_version: 'App Version v1.4.2 (Build 2026)',
    last_update: 'Last Update: July 28, 2026',
    privacy_policy: 'Privacy Policy',
    terms_of_service: 'Terms of Service',

    report_modal_title: 'Report a Problem',
    select_category_lbl: 'Select Issue Category',
    desc_label: 'Detailed Description',
    desc_placeholder: 'Describe your issue in detail here...',
    attach_image_btn: 'Attach Screenshot / Photo',
    image_attached: 'Image attached successfully 📷',
    submit_ticket: 'Submit Ticket',
    sending: 'Submitting...',
    success_msg: 'Ticket submitted successfully! Ref: ',

    ticket_details_title: 'Support Ticket Details',
    ticket_no_lbl: 'Reference:',
    date_lbl: 'Date Submitted:',
    agent_reply: 'Yalla VTC Support Team Response:',
    close_modal: 'Close',
  },
};

const getTr = (key: string, lang: string) => {
  const activeLang = (lang || 'ar').toLowerCase().split('-')[0];
  const langKey = (activeLang === 'fr' || activeLang === 'es' || activeLang === 'en') ? activeLang : 'ar';
  return TRANSLATIONS[langKey][key] || TRANSLATIONS['ar'][key] || key;
};

// ─── Complete FAQ Dataset across 4 Languages ─────────────────────────────────
const FAQ_ITEMS = [
  {
    id: 'faq-01',
    category: 'wallet',
    q: {
      ar: 'كيف أشحن محفظتي؟',
      fr: 'Comment recharger mon portefeuille ?',
      es: '¿Cómo recargo mi billetera?',
      en: 'How do I top up my wallet?',
    },
    a: {
      ar: 'يمكنك شحن محفظتك بسهولة من خلال الانتقال إلى شاشة "المحفظة والدفع" والضغط على زر "شحن الرصيد". يمكنك الشحن عبر التحويل البنكي، أو بطاقة الائتمان، أو عبر وكلاء الشحن المعتمدين لدى Yalla VTC.',
      fr: 'Vous pouvez recharger votre portefeuille en allant sur l\'écran "Portefeuille et Paiement" et en cliquant sur "Recharger". Vous pouvez recharger par virement bancaire, carte de crédit ou agents agréés.',
      es: 'Puedes recargar tu billetera accediendo a "Billetera y Pagos" y presionando "Recargar". Puedes usar transferencia bancaria, tarjeta o agentes autorizados.',
      en: 'You can easily top up your wallet by opening "Wallet & Payments" and pressing "Recharge". You can top up via bank transfer, credit card, or authorized top-up partners.',
    },
  },
  {
    id: 'faq-02',
    category: 'rides',
    q: {
      ar: 'لماذا لا أستقبل طلبات الرحلات القريبة؟',
      fr: 'Pourquoi ne suis-je pas en train de recevoir de courses ?',
      es: '¿Por qué no recibo solicitudes de viaje?',
      en: 'Why am I not receiving nearby ride requests?',
    },
    a: {
      ar: 'تأكد أولاً من تفعيل زر "بدء العمل" (Online)، وتأكد من تفعيل نظام GPS وصلاحيات الموقع. كذلك، إذا كان رصيد المحفظة سالبًا عن حد التقييد (-50 د.م.) أو كانت إحدى الوثائق منتهية الصلاحية، يتم إيقاف الاستقبال تلقائيًا.',
      fr: 'Vérifiez que le statut est "En ligne" et que la géolocalisation GPS est activée. De plus, si votre solde est négatif au-delà de la limite (-50 MAD) ou si un document a expiré, le système suspend les demandes.',
      es: 'Asegúrate de estar "Conectado" y de tener el GPS activado. Si tu saldo es negativo más allá del límite (-50 MAD) o un documento venció, la recepción se suspende.',
      en: 'Make sure your status is set to "Go Online" and GPS permissions are enabled. Also, if your wallet balance is below the negative limit (-50 MAD) or a document has expired, requests are automatically paused.',
    },
  },
  {
    id: 'faq-03',
    category: 'docs',
    q: {
      ar: 'كيف أرفع أو أحدث الوثائق المطلوبة؟',
      fr: 'Comment télécharger ou mettre à jour mes documents ?',
      es: '¿Cómo subo o actualizo mis documentos?',
      en: 'How do I upload or update required documents?',
    },
    a: {
      ar: 'انتقل إلى قسم "الملف الشخصي" ثم اختر "الوثائق". اضغط على الوثيقة المراد تحديثها (مثل رخصة السياقة، البطاقة الوطنية، أو البطاقة الرمادية)، وقم بجمع الصورة بوضوح بدون إطار ليتم تدقيقها فوراً.',
      fr: 'Allez dans "Profil" puis "Documents". Cliquez sur le document à mettre à jour (Permis, CIN, Carte Grise) et prenez une photo claire sans cadre pour validation rapide.',
      es: 'Ve a "Perfil" y selecciona "Documentos". Haz clic en el documento que deseas actualizar y toma una foto clara para revisión inmediata.',
      en: 'Go to "Profile" and select "Documents". Tap the document you want to update (Driver License, National ID, Registration) and take a clear picture for instant review.',
    },
  },
  {
    id: 'faq-04',
    category: 'wallet',
    q: {
      ar: 'كيف يتم احتساب عمولة المنصة؟',
      fr: 'Comment la commission de la plateforme est-elle calculée ?',
      es: '¿Cómo se calcula la comisión de la plataforma?',
      en: 'How is platform commission calculated?',
    },
    a: {
      ar: 'العمولة الأساسية لمنصة Yalla VTC هي 10.4% فقط من إجمالي قيمة الرحلة. يتم خصم العمولة تلقائيًا من رصيد محفظتك بعد إكمال الرحلة واستلامك للمبلغ نقدًا من الراكب.',
      fr: 'La commission de base de Yalla VTC est de seulement 10.4% du montant total de la course. Elle est prélevée automatiquement de votre portefeuille après la course.',
      es: 'La comisión básica es de solo 10.4% del valor del viaje. Se descuenta automáticamente de tu billetera una vez completado el viaje pagado en efectivo.',
      en: 'Yalla VTC platform commission is only 10.4% of the total trip fare. Commission is automatically deducted from your wallet balance upon ride completion.',
    },
  },
  {
    id: 'faq-05',
    category: 'docs',
    q: {
      ar: 'ماذا أفعل إذا تم رفض إحدى وثائقي أثناء المراجعة؟',
      fr: 'Que faire si l\'un de mes documents est refusé ?',
      es: '¿Qué hago si uno de mis documentos es rechazado?',
      en: 'What should I do if one of my documents is rejected?',
    },
    a: {
      ar: 'إذا تم رفض وثيقة، يظهر لك سبب الرفض بالتفصيل (مثل: صورة غير واضحة أو وثيقة منتهية الصلاحية). كل ما عليك هو التقاط صورة جديدة واضحة وإعادة رفعها للتدقيق.',
      fr: 'En cas de refus, la raison exacte s\'affiche (ex: photo floue, document expiré). Prenez simplement une nouvelle photo claire et téléchargez-la à nouveau.',
      es: 'Si un documento es rechazado, se mostrará el motivo exacto. Simplemente toma una nueva foto clara y vuelve a subirla.',
      en: 'If a document is rejected, the reason will be displayed (e.g. blurry photo, expired date). Simply take a new clear photo and re-upload it.',
    },
  },
  {
    id: 'faq-06',
    category: 'account',
    q: {
      ar: 'كيف أغير معلوماتي الشخصية أو رقم الهاتف؟',
      fr: 'Comment modifier mes informations personnelles ?',
      es: '¿Cómo modifico mi información personal?',
      en: 'How do I change my personal details or phone number?',
    },
    a: {
      ar: 'يمكنك تعديل الاسم، البريد الإلكتروني وصورة الملف الشخصي مباشرة من شاشة "المعلومات الشخصية". أما بالنسبة لتغيير رقم الهاتف، يتطلب ذلك التأكيد برمز OTP لحماية حسابك.',
      fr: 'Vous pouvez modifier votre nom, e-mail et photo depuis "Informations personnelles". Le changement de numéro nécessite une vérification par SMS OTP.',
      es: 'Puedes cambiar tu nombre, correo y foto desde "Información personal". El cambio de número requiere verificación SMS OTP por seguridad.',
      en: 'You can update your name, email, and photo from "Personal Info". Changing your registered phone number requires SMS OTP confirmation for security.',
    },
  },
  {
    id: 'faq-07',
    category: 'wallet',
    q: {
      ar: 'ماذا يحدث إذا أصبح رصيد المحفظة سالبًا؟',
      fr: 'Que se passe-t-il si le solde de mon portefeuille devient négatif ?',
      es: '¿Qué ocurre si el saldo de mi billetera es negativo?',
      en: 'What happens if my wallet balance becomes negative?',
    },
    a: {
      ar: 'نظراً لأن جميع الرحلات نقداً، تنخفض المحفظة بقيمة العمولة مع كل رحلة. يُسمح بالعمل حتى رصيد -50 د.م. عند الوصول لهذا الحد يتوقف استقبال الرحلات مؤقتاً حتى تقوم بشحن الرصيد.',
      fr: 'Toutes les courses étant en espèces, la commission est déduite du portefeuille. Vous pouvez conduire jusqu\'à -50 MAD. Au-delà, le compte est temporairement restreint.',
      es: 'Como los viajes son en efectivo, la comisión se descuenta del saldo. Puedes conducir hasta -50 MAD. Luego, la recepción se pausa hasta recargar.',
      en: 'Since all rides are paid in cash, commission is deducted from your wallet. You can drive down to -50 MAD. Beyond that limit, account is temporarily paused until topped up.',
    },
  },
];

export const HelpCenterScreen = () => {
  const navigation = useNavigation<any>();
  const { colors, isDarkMode } = useTheme();
  const { i18n } = useTranslation();
  const activeLang = (i18n.language || 'ar').toLowerCase().split('-')[0];
  const lang = (activeLang === 'fr' || activeLang === 'es' || activeLang === 'en') ? activeLang : 'ar';
  const isRTL = lang === 'ar';

  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 0);

  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>('faq-01');

  // Modal States
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [issueCategory, setIssueCategory] = useState('wallet');
  const [issueDesc, setIssueDesc] = useState('');
  const [hasAttachment, setHasAttachment] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Ticket Detail Modal State
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  // Tickets List State
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  // ── AI Conversations History State ─────────────────────────────────────
  const [conversations, setConversations] = useState<any[]>([]);
  const [convsLoading, setConvsLoading] = useState(false);

  useEffect(() => {
    fetchTickets();
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    setConvsLoading(true);
    try {
      const res = await api.get('/support/conversations');
      if (res.data && Array.isArray(res.data)) {
        setConversations(res.data);
      } else if (res.data?.conversations) {
        setConversations(res.data.conversations);
      }
    } catch (e) {
      // No conversations yet
    } finally {
      setConvsLoading(false);
    }
  };

  const getConvStatusPill = (status: string) => {
    if (status === 'WAITING_HUMAN') {
      return {
        label: lang === 'fr' ? '🟡 En attente du service client' : lang === 'en' ? '🟡 Awaiting Support' : lang === 'es' ? '🟡 Esperando soporte' : '🟡 بانتظار خدمة العملاء',
        bg: 'rgba(245,158,11,0.12)',
        border: '#F59E0B',
        color: '#D97706',
      };
    }
    if (status === 'CLOSED') {
      return {
        label: lang === 'fr' ? '🔴 Fermée' : lang === 'en' ? '🔴 Closed' : lang === 'es' ? '🔴 Cerrada' : '🔴 مغلقة',
        bg: 'rgba(239,68,68,0.10)',
        border: '#EF4444',
        color: '#DC2626',
      };
    }
    // AI_ACTIVE or HUMAN_RESPONDED
    return {
      label: lang === 'fr' ? '🟢 Répondu' : lang === 'en' ? '🟢 Replied' : lang === 'es' ? '🟢 Respondido' : '🟢 تم الرد',
      bg: 'rgba(34,197,94,0.10)',
      border: '#22C55E',
      color: '#16A34A',
    };
  };

  const fetchTickets = async () => {
    try {
      const res = await api.get('/driver/support/tickets');
      if (res.data && Array.isArray(res.data.tickets)) {
        setTickets(res.data.tickets);
        return;
      }
    } catch (e) {
      // Fallback live tickets dataset
    }

    setTickets([
      {
        id: 't-1',
        ticketNo: '#TICK-8021',
        category: 'wallet',
        subject: 'تأخير في تحديث رصيد الشحن البنكي',
        description: 'قمت بتحويل مبلغ 200 د.م. عبر الحساب البنكي صباح اليوم ولم يظهر الرصيد في محفظتي بعد.',
        status: 'RESOLVED',
        createdAt: '2026-07-26 10:30',
        updatedAt: '2026-07-26 12:15',
        replyMessage: 'أهلاً خالد، تم التحقق من الإيداع البنكي وإضافة مبلغ 200 د.م. إلى محفظتك بنجاح. شكراً لتواصلك معنا!',
      },
      {
        id: 't-2',
        ticketNo: '#TICK-7914',
        category: 'docs',
        subject: 'استفسار بشأن توثيق رخصة السياقة الجديدة',
        description: 'قمت برفع النسخة المحدثة من رخصة السياقة وأرغب في تأكيد استلامها من طرف الإدارة.',
        status: 'UNDER_REVIEW',
        createdAt: '2026-07-27 15:45',
        updatedAt: '2026-07-27 15:45',
        replyMessage: 'طلبك حالياً قيد الدراسة من طرف فريق التدقيق والتحقق. سيتم إشعارك خلال ساعتين بحد أقصى.',
      },
      {
        id: 't-3',
        ticketNo: '#TICK-6540',
        category: 'vehicle',
        subject: 'طلب تعديل نوع المركبة المسجلة',
        description: 'أريد تغيير صنف السيارة المسجل في التطبيق إلى فئة داسيا لوجان 2024.',
        status: 'REPLIED',
        createdAt: '2026-07-20 09:10',
        updatedAt: '2026-07-20 11:00',
        replyMessage: 'مرحباً، تم إرسال رابط تحديث الوثائق الخاصة بالمركبة الجديدة. يرجى رفع البطاقة الرمادية الجديدة.',
      },
    ]);
  };

  // Filter FAQs based on category & search query
  const filteredFaqs = useMemo(() => {
    return FAQ_ITEMS.filter((item) => {
      const matchesCat = activeCategory === 'all' || item.category === activeCategory;
      const qText = item.q[lang as keyof typeof item.q] || item.q.ar;
      const aText = item.a[lang as keyof typeof item.a] || item.a.ar;
      const matchesSearch =
        searchQuery.trim() === '' ||
        qText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        aText.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCat && matchesSearch;
    });
  }, [activeCategory, searchQuery, lang]);

  // Submit Ticket Handler
  const handleSubmitTicket = async () => {
    if (!issueDesc.trim()) {
      Alert.alert(
        lang === 'ar' ? 'تنبيه' : 'Attention',
        lang === 'ar' ? 'يرجى كتابة وصف المشكلة قبل الإرسال' : 'Please enter issue description before submitting.'
      );
      return;
    }

    setSubmitting(true);

    const generatedRefNo = `#TICK-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      await api.post('/driver/support/tickets', {
        category: issueCategory,
        description: issueDesc,
        hasAttachment,
      });
    } catch (e) {
      // Ignore API errors for fallback state
    }

    const newTicket: SupportTicket = {
      id: `t-${Date.now()}`,
      ticketNo: generatedRefNo,
      category: issueCategory,
      subject: issueDesc.slice(0, 35) + '...',
      description: issueDesc,
      status: 'UNDER_REVIEW',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      hasAttachment,
    };

    setTickets((prev) => [newTicket, ...prev]);
    setSubmitting(false);
    setReportModalVisible(false);
    setIssueDesc('');
    setHasAttachment(false);

    Alert.alert(
      lang === 'ar' ? 'تم الإرسال بنجاح ✅' : 'Submitted Successfully ✅',
      `${getTr('success_msg', lang)}${generatedRefNo}`
    );
  };

  const getStatusPill = (status: SupportTicket['status']) => {
    switch (status) {
      case 'UNDER_REVIEW':
        return { label: getTr('ticket_status_under_review', lang), bg: 'rgba(234,179,8,0.14)', color: '#D97706', border: '#F59E0B' };
      case 'REPLIED':
        return { label: getTr('ticket_status_replied', lang), bg: 'rgba(59,130,246,0.14)', color: '#2563EB', border: '#3B82F6' };
      case 'RESOLVED':
        return { label: getTr('ticket_status_resolved', lang), bg: 'rgba(34,197,94,0.14)', color: '#16A34A', border: '#22C55E' };
      case 'CLOSED':
      default:
        return { label: getTr('ticket_status_closed', lang), bg: 'rgba(148,163,184,0.14)', color: '#64748B', border: '#94A3B8' };
    }
  };

  return (
    <View style={[styles.safe, { backgroundColor: colors.bg }]}>

      {/* Drawer-aware Header */}
      <DrawerHeader title={getTr('help_center_title', lang)} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── 1. Search Bar ────────────────────────────────────────────── */}
        <View style={styles.searchSection}>
          <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }, isRTL && { flexDirection: 'row-reverse' }]}>
            <Search size={20} color={colors.primary} style={{ marginHorizontal: 10 }} />
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}
              placeholder={getTr('search_placeholder', lang)}
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 6 }}>
                <X size={16} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Quick Filter Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
            <View style={[{ flexDirection: 'row', gap: 8 }, isRTL && { flexDirection: 'row-reverse' }]}>
              {[
                { key: 'all', label: getTr('category_all', lang) },
                { key: 'wallet', label: getTr('category_wallet', lang) },
                { key: 'docs', label: getTr('category_docs', lang) },
                { key: 'rides', label: getTr('category_rides', lang) },
                { key: 'account', label: getTr('category_account', lang) },
                { key: 'vehicle', label: getTr('category_vehicle', lang) },
              ].map((chip) => {
                const isActive = activeCategory === chip.key;
                return (
                  <TouchableOpacity
                    key={chip.key}
                    activeOpacity={0.8}
                    style={[
                      styles.chipItem,
                      {
                        backgroundColor: isActive ? colors.primary : colors.surface,
                        borderColor: isActive ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => setActiveCategory(chip.key)}
                  >
                    <Text style={[styles.chipText, { color: isActive ? '#FFF' : colors.textPrimary }]}>
                      {chip.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* ── 2. Frequently Asked Questions (FAQ Accordion) ──────────── */}
        <View style={styles.sectionMargin}>
          <View style={[styles.sectionTitleRow, isRTL && { flexDirection: 'row-reverse' }]}>
            <HelpCircle size={20} color={colors.primary} />
            <Text style={[styles.sectionTitleText, { color: colors.textPrimary }]}>
              {getTr('faq_section_title', lang)}
            </Text>
          </View>

          {filteredFaqs.length === 0 ? (
            <View style={[styles.emptyFaqBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Info size={24} color={colors.textMuted} style={{ marginBottom: 8 }} />
              <Text style={[styles.emptyFaqText, { color: colors.textMuted }]}>
                {getTr('no_faq_found', lang)}
              </Text>
            </View>
          ) : (
            filteredFaqs.map((faq) => {
              const isExpanded = expandedFaqId === faq.id;
              const qText = faq.q[lang as keyof typeof faq.q] || faq.q.ar;
              const aText = faq.a[lang as keyof typeof faq.a] || faq.a.ar;

              return (
                <View
                  key={faq.id}
                  style={[
                    styles.faqCard,
                    { backgroundColor: colors.surface, borderColor: isExpanded ? colors.primary + '60' : colors.border },
                  ]}
                >
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={[styles.faqHeaderBtn, isRTL && { flexDirection: 'row-reverse' }]}
                    onPress={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                  >
                    <Text style={[styles.faqQuestionText, { color: colors.textPrimary, flex: 1, textAlign: isRTL ? 'right' : 'left' }]}>
                      {qText}
                    </Text>
                    {isExpanded ? (
                      <ChevronUp size={20} color={colors.primary} />
                    ) : (
                      <ChevronDown size={20} color={colors.textMuted} />
                    )}
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={[styles.faqAnswerBox, { borderTopColor: colors.border }]}>
                      <Text style={[styles.faqAnswerText, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
                        {aText}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>

        {/* ── 3. مركز المساعدة — Simple Clean Button ─────────────────── */}
        <View style={styles.sectionMargin}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.supportCenterBtn,
              { backgroundColor: colors.primary, shadowColor: colors.primary },
            ]}
            onPress={() => navigation.navigate('SupportChat')}
          >
            <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 12 }, isRTL && { flexDirection: 'row-reverse' }]}>
              <MessageSquare size={22} color="#FFF" />
              <Text style={[styles.supportCenterBtnText]}>
                {lang === 'fr' ? 'Centre d\'Assistance' : lang === 'en' ? 'Help Center' : lang === 'es' ? 'Centro de Ayuda' : 'مركز المساعدة'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ── 5. AI Conversations History (سجل المحادثات الذكية) ───────── */}
        <View style={styles.sectionMargin}>
          <View style={[styles.sectionTitleRow, isRTL && { flexDirection: 'row-reverse' }]}>
            <MessageSquare size={20} color={colors.primary} />
            <Text style={[styles.sectionTitleText, { color: colors.textPrimary }]}>
              {lang === 'fr' ? 'Mes Conversations' : lang === 'en' ? 'My Conversations' : lang === 'es' ? 'Mis Conversaciones' : 'سجل محادثاتي مع الدعم'}
            </Text>
          </View>

          {convsLoading ? (
            <View style={[styles.emptyFaqBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : conversations.length === 0 ? (
            <View style={[styles.emptyFaqBox, { backgroundColor: colors.surface, borderColor: colors.border, paddingVertical: 28 }]}>
              <MessageSquare size={32} color={colors.textMuted} style={{ marginBottom: 8 }} />
              <Text style={[styles.emptyFaqText, { color: colors.textMuted, textAlign: 'center' }]}>
                {lang === 'fr' ? 'Aucune conversation encore. Appuyez sur le bouton ci-dessus pour démarrer.' : lang === 'en' ? 'No conversations yet. Tap the button above to start.' : lang === 'es' ? 'Sin conversaciones aún. Toca el botón de arriba para empezar.' : 'لا توجد محادثات بعد. اضغط على الزر أعلاه لبدء محادثة جديدة.'}
              </Text>
            </View>
          ) : (
            conversations.map((conv) => {
              const pill = getConvStatusPill(conv.status);
              const lastMsg = conv.lastMessageText || '';
              const lastMsgShort = lastMsg.length > 60 ? lastMsg.slice(0, 60) + '...' : lastMsg;
              const dateStr = conv.lastMessageAt
                ? new Date(conv.lastMessageAt).toLocaleDateString(lang === 'ar' ? 'ar-MA' : lang === 'fr' ? 'fr-FR' : 'en-US', { day: '2-digit', month: 'short' })
                : '';
              return (
                <TouchableOpacity
                  key={conv.id}
                  activeOpacity={0.88}
                  style={[styles.convCard, { backgroundColor: colors.surface, borderColor: conv.status === 'WAITING_HUMAN' ? '#F59E0B' : colors.border }]}
                  onPress={() => navigation.navigate('SupportChat', { conversationId: conv.id })}
                >
                  {/* Left: Bot/Human Icon */}
                  <View style={[styles.convIconBadge, {
                    backgroundColor: conv.status === 'WAITING_HUMAN' ? 'rgba(245,158,11,0.15)'
                      : conv.status === 'CLOSED' ? 'rgba(239,68,68,0.10)'
                      : 'rgba(34,197,94,0.12)'
                  }]}>
                    {conv.status === 'WAITING_HUMAN' ? (
                      <Headphones size={20} color="#F59E0B" />
                    ) : conv.status === 'CLOSED' ? (
                      <Lock size={20} color="#EF4444" />
                    ) : (
                      <Bot size={20} color="#22C55E" />
                    )}
                  </View>

                  {/* Middle: Text */}
                  <View style={{ flex: 1, paddingHorizontal: 12, alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
                    <Text style={[styles.convLastMsg, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={2}>
                      {lastMsgShort || (lang === 'ar' ? 'محادثة دعم' : 'Support Chat')}
                    </Text>
                    {dateStr !== '' && (
                      <Text style={[styles.convDate, { color: colors.textMuted }]}>{dateStr}</Text>
                    )}
                  </View>

                  {/* Right: Status pill + chevron */}
                  <View style={{ alignItems: 'flex-end', gap: 6 }}>
                    <View style={[styles.statusPill, { backgroundColor: pill.bg, borderColor: pill.border }]}>
                      <Text style={[styles.statusPillTxt, { color: pill.color }]}>{pill.label}</Text>
                    </View>
                    {isRTL ? <ChevronLeft size={16} color={colors.textMuted} /> : <ChevronRight size={16} color={colors.textMuted} />}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* ── 6. Old Support Tickets (حالة البلاغات التقليدية) ─────────── */}
        <View style={styles.sectionMargin}>
          <View style={[styles.sectionTitleRow, isRTL && { flexDirection: 'row-reverse' }]}>
            <FileText size={20} color={colors.primary} />
            <Text style={[styles.sectionTitleText, { color: colors.textPrimary }]}>
              {getTr('tickets_section_title', lang)}
            </Text>
          </View>

          {tickets.length === 0 ? (
            <View style={[styles.emptyFaqBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.emptyFaqText, { color: colors.textMuted }]}>
                {getTr('no_tickets_desc', lang)}
              </Text>
            </View>
          ) : (
            tickets.map((tItem) => {
              const pill = getStatusPill(tItem.status);
              return (
                <TouchableOpacity
                  key={tItem.id}
                  activeOpacity={0.88}
                  style={[styles.ticketCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => setSelectedTicket(tItem)}
                >
                  <View style={[styles.ticketHeader, { borderBottomColor: colors.border }, isRTL && { flexDirection: 'row-reverse' }]}>
                    <Text style={[styles.ticketNoText, { color: colors.primary }]}>{tItem.ticketNo}</Text>
                    <View style={[styles.statusPill, { backgroundColor: pill.bg, borderColor: pill.border }]}>
                      <Text style={[styles.statusPillTxt, { color: pill.color }]}>{pill.label}</Text>
                    </View>
                  </View>

                  <View style={{ padding: 14, alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
                    <Text style={[styles.ticketSubject, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>
                      {tItem.subject}
                    </Text>
                    <Text style={[styles.ticketDateText, { color: colors.textMuted }]}>
                      {tItem.createdAt}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>

        {/* ── 6. App Information & Legal Footer ──────────────────────── */}
        <View style={[styles.footerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={{ alignItems: 'center', marginBottom: 12 }}>
            <View style={[styles.appLogoCircle, { backgroundColor: colors.primary + '18' }]}>
              <Sparkles size={24} color={colors.primary} />
            </View>
            <Text style={[styles.appNameTitle, { color: colors.textPrimary }]}>Yalla VTC Driver</Text>
            <Text style={[styles.appVersionText, { color: colors.textMuted }]}>
              {getTr('app_version', lang)}
            </Text>
            <Text style={[styles.appVersionText, { color: colors.textMuted, marginTop: 2 }]}>
              {getTr('last_update', lang)}
            </Text>
          </View>

          <View style={[styles.legalRow, { borderTopColor: colors.border }, isRTL && { flexDirection: 'row-reverse' }]}>
            <TouchableOpacity style={styles.legalBtn} onPress={() => Alert.alert(getTr('privacy_policy', lang), 'سياسة الخصوصية وحماية بيانات السائقين معتمدة رسمياً لدى Yalla VTC.')}>
              <Shield size={14} color={colors.primary} style={{ marginHorizontal: 4 }} />
              <Text style={[styles.legalBtnTxt, { color: colors.primary }]}>{getTr('privacy_policy', lang)}</Text>
            </TouchableOpacity>
            <Text style={{ color: colors.border }}>|</Text>
            <TouchableOpacity style={styles.legalBtn} onPress={() => Alert.alert(getTr('terms_of_service', lang), 'شروط استخدام تطبيق السائق وتحديد الالتزامات والعمولة.')}>
              <Lock size={14} color={colors.primary} style={{ marginHorizontal: 4 }} />
              <Text style={[styles.legalBtnTxt, { color: colors.primary }]}>{getTr('terms_of_service', lang)}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── Modal 1: Report a Problem Form ────────────────────────────── */}
      <Modal
        visible={reportModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setReportModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setReportModalVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }, isRTL && { flexDirection: 'row-reverse' }]}>
              <Text style={[styles.modalHeaderTitle, { color: colors.textPrimary }]}>
                {getTr('report_modal_title', lang)}
              </Text>
              <TouchableOpacity onPress={() => setReportModalVisible(false)} style={styles.closeBtn}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 20 }}>
              {/* Category Picker */}
              <Text style={[styles.formLabel, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>
                {getTr('select_category_lbl', lang)}
              </Text>
              <View style={[{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }, isRTL && { flexDirection: 'row-reverse' }]}>
                {[
                  { key: 'wallet', label: getTr('category_wallet', lang) },
                  { key: 'docs', label: getTr('category_docs', lang) },
                  { key: 'rides', label: getTr('category_rides', lang) },
                  { key: 'account', label: getTr('category_account', lang) },
                  { key: 'vehicle', label: getTr('category_vehicle', lang) },
                ].map((c) => {
                  const isSel = issueCategory === c.key;
                  return (
                    <TouchableOpacity
                      key={c.key}
                      style={[
                        styles.catChoiceChip,
                        {
                          backgroundColor: isSel ? colors.primary + '18' : colors.surfaceAlt,
                          borderColor: isSel ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => setIssueCategory(c.key)}
                    >
                      <Text style={[styles.catChoiceTxt, { color: isSel ? colors.primary : colors.textPrimary }]}>
                        {c.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Description Input */}
              <Text style={[styles.formLabel, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>
                {getTr('desc_label', lang)}
              </Text>
              <TextInput
                style={[
                  styles.multilineInput,
                  { backgroundColor: colors.surfaceAlt, borderColor: colors.border, color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' },
                ]}
                placeholder={getTr('desc_placeholder', lang)}
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={5}
                value={issueDesc}
                onChangeText={setIssueDesc}
              />

              {/* Attach Screenshot Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.attachBtn,
                  { backgroundColor: hasAttachment ? 'rgba(34,197,94,0.12)' : colors.surfaceAlt, borderColor: hasAttachment ? '#22C55E' : colors.border },
                  isRTL && { flexDirection: 'row-reverse' },
                ]}
                onPress={() => setHasAttachment(!hasAttachment)}
              >
                <Paperclip size={18} color={hasAttachment ? '#22C55E' : colors.primary} />
                <Text style={[styles.attachBtnTxt, { color: hasAttachment ? '#22C55E' : colors.textPrimary }]}>
                  {hasAttachment ? getTr('image_attached', lang) : getTr('attach_image_btn', lang)}
                </Text>
              </TouchableOpacity>

              {/* Submit Button */}
              <TouchableOpacity
                activeOpacity={0.88}
                disabled={submitting}
                style={[styles.submitTicketBtn, { backgroundColor: colors.primary }]}
                onPress={handleSubmitTicket}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 8 }, isRTL && { flexDirection: 'row-reverse' }]}>
                    <Send size={18} color="#FFF" />
                    <Text style={styles.submitTicketTxt}>{getTr('submit_ticket', lang)}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* ── Modal 2: Ticket Details View ──────────────────────────────── */}
      <Modal
        visible={selectedTicket !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedTicket(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedTicket(null)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }, isRTL && { flexDirection: 'row-reverse' }]}>
              <Text style={[styles.modalHeaderTitle, { color: colors.textPrimary }]}>
                {getTr('ticket_details_title', lang)}
              </Text>
              <TouchableOpacity onPress={() => setSelectedTicket(null)} style={styles.closeBtn}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {selectedTicket && (
              <ScrollView style={{ padding: 20 }}>
                <View style={[{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }, isRTL && { flexDirection: 'row-reverse' }]}>
                  <Text style={[styles.ticketRefText, { color: colors.primary }]}>
                    {getTr('ticket_no_lbl', lang)} {selectedTicket.ticketNo}
                  </Text>
                  {(() => {
                    const pill = getStatusPill(selectedTicket.status);
                    return (
                      <View style={[styles.statusPill, { backgroundColor: pill.bg, borderColor: pill.border }]}>
                        <Text style={[styles.statusPillTxt, { color: pill.color }]}>{pill.label}</Text>
                      </View>
                    );
                  })()}
                </View>

                {/* Question/Issue Box */}
                <View style={[styles.ticketBox, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
                  <Text style={[styles.ticketBoxTitle, { color: colors.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
                    {getTr('date_lbl', lang)} {selectedTicket.createdAt}
                  </Text>
                  <Text style={[styles.ticketBoxDesc, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>
                    {selectedTicket.description}
                  </Text>
                </View>

                {/* Reply Box if present */}
                {selectedTicket.replyMessage && (
                  <View style={[styles.replyBox, { backgroundColor: 'rgba(99,102,241,0.08)', borderColor: colors.primary }]}>
                    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }, isRTL && { flexDirection: 'row-reverse' }]}>
                      <Sparkles size={16} color={colors.primary} />
                      <Text style={[styles.replyHeaderTxt, { color: colors.primary }]}>
                        {getTr('agent_reply', lang)}
                      </Text>
                    </View>
                    <Text style={[styles.replyBodyTxt, { color: colors.textPrimary, textAlign: isRTL ? 'right' : 'left' }]}>
                      {selectedTicket.replyMessage}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.closeDetailBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
                  onPress={() => setSelectedTicket(null)}
                >
                  <Text style={[styles.closeDetailTxt, { color: colors.textPrimary }]}>
                    {getTr('close_modal', lang)}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

    </View>
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
  headerRTL: {
    flexDirection: 'row-reverse',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  searchSection: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 10,
    height: 48,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },
  chipItem: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  sectionMargin: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sectionTitleText: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyFaqBox: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyFaqText: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  faqCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    overflow: 'hidden',
  },
  faqHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  faqQuestionText: {
    fontSize: 14.5,
    fontWeight: '700',
    lineHeight: 20,
  },
  faqAnswerBox: {
    padding: 16,
    borderTopWidth: 1,
  },
  faqAnswerText: {
    fontSize: 13.5,
    lineHeight: 21,
  },
  reportBanner: {
    borderRadius: 20,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  reportIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportBannerTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  reportBannerSub: {
    color: '#94A3B8',
    fontSize: 12.5,
    lineHeight: 18,
  },
  contactCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  contactIconBg: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    marginBottom: 2,
  },
  contactSub: {
    fontSize: 12,
  },
  ticketCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  ticketNoText: {
    fontSize: 13.5,
    fontWeight: '800',
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusPillTxt: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  ticketSubject: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  ticketDateText: {
    fontSize: 11.5,
  },
  footerCard: {
    marginHorizontal: 16,
    marginTop: 28,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
  },
  appLogoCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  appNameTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  appVersionText: {
    fontSize: 12,
  },
  legalRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    borderTopWidth: 1,
    paddingTop: 14,
    marginTop: 12,
  },
  legalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legalBtnTxt: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    maxHeight: '90%',
  },
  modalHeader: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  modalHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  closeBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    marginBottom: 8,
  },
  catChoiceChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  catChoiceTxt: {
    fontSize: 12.5,
    fontWeight: '600',
  },
  multilineInput: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    height: 110,
    textAlignVertical: 'top',
    fontSize: 14,
    marginBottom: 16,
  },
  attachBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
  },
  attachBtnTxt: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  submitTicketBtn: {
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  submitTicketTxt: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  ticketRefText: {
    fontSize: 15,
    fontWeight: '800',
  },
  ticketBox: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  ticketBoxTitle: {
    fontSize: 11.5,
    marginBottom: 6,
  },
  ticketBoxDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  replyBox: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  replyHeaderTxt: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  replyBodyTxt: {
    fontSize: 13.5,
    lineHeight: 20,
  },
  closeDetailBtn: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  closeDetailTxt: {
    fontSize: 14,
    fontWeight: '700',
  },

  supportCenterBtn: {
    height: 54,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  supportCenterBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  convCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    gap: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  convIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  convLastMsg: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
    marginBottom: 3,
  },
  convDate: {
    fontSize: 11,
    fontWeight: '500',
  },
});

export default HelpCenterScreen;
