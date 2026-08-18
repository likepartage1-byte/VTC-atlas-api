import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Platform,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Calendar,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Shield,
  CheckCircle2,
  Building,
  MapPin,
  Hash,
  HelpCircle,
  Maximize2,
  Minimize2,
} from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';
import { DrawerHeader } from '../../components/DrawerHeader';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── 4 Languages Terms of Service Complete Dictionary ───────────────────────
const TRANSLATIONS: any = {
  ar: {
    tos_title: 'شروط الخدمة',
    last_updated: 'آخر تحديث: 28 يوليو 2026',
    expand_all: 'توسيع الكل',
    collapse_all: 'طي الكل',
    section_index: 'فهرس الأقسام',
    official_support_btn: 'مركز الدعم الفني المباشر',
    help_center_btn: 'فتح مركز المساعدة داخل التطبيق',
    legal_footer_title: 'المعلومات القانونية الرسمية',
    registered_office_label: 'Registered Office',
    company_number_label: 'Company Number',
    legal_disclaimer: 'تخضع جميع الخدمات والأنشطة لشروط وأحكام منصة Yalla VTC وفق القوانين والأنظمة الجاري بها العمل.',

    sections: [
      {
        id: 's1',
        title: '1. مقدمة',
        content: 'أهلاً بك في منصة Yalla VTC. تشكل هذه الشروط والأحكام اتفاقية قانونية بينك كـ (مستخدم أو سائق) وبين تطبيق Yalla VTC. إن وصولك إلى التطبيق أو استخدامه يعني موافقتك الصريحة الكاملة على الالتزام بجميع القواعد الواردة في هذه الاتفاقية.',
      },
      {
        id: 's2',
        title: '2. قبول الشروط',
        content: 'إن إنشاء حساب جديد، أو تسجيل الدخول، أو إجراء أي عملية حجز أو تقديم خدمة نقل من خلال Yalla VTC يعتبر بمثابة قبول قانوني كامل لجميع شروط الخدمة وسياسة الخصوصية المتعلقة بالمنصة، ودون أي تحفظ.',
      },
      {
        id: 's3',
        title: '3. أهلية الاستخدام',
        content: 'للحصول على حق استخدام Yalla VTC، يجب عليك أن تكون بالغا للسن القانوني وفق التشريعات المحلية، وأن تمتك حساباً مفلّعاً وصالحاً، وتلتزم بتقديم معلومات صحيحة ودقيقة بالكامل، مع الحفاظ التام على سرية بيانات تسجيل الدخول وتطبيق كافة القوانين المحلية ذات الصلة.',
      },
      {
        id: 's4',
        title: '4. حساب المستخدم',
        content: 'يتحمل المستخدم أو السائق المسؤولية الكاملة عن سلامة وصحة المعلومات المدخلة في حسابه على Yalla VTC، وتحديث البيانات فور حدوث أي تغيير، والحفاظ على أمان كلمات المرور ورموز التفعيل، ويُحظر حظراً تاماً مشاركة الحساب أو تمكين طرف ثالث من استخدامه.',
      },
      {
        id: 's5',
        title: '5. استخدام التطبيق والأنشطة المحظورة',
        content: 'يُخصص تطبيق Yalla VTC حصرياً لحجز وتنفيذ خدمات النقل الذكي بشكل قانوني. ويُمنع منعاً باتاً استخدام التطبيق في أي نشاط غير مشروع، أو الاحتيال، أو التلاعب بنظام الأسعار والرحلات، أو التعرض لسلامة المنصة ومحاولة اختراق البرمجيات أو الخوادم.',
      },
      {
        id: 's6',
        title: '6. التحقق من الوثائق والتدقيق',
        content: 'تتطلب بعض الخدمات والميزات في Yalla VTC (وخاصة تفعيل حسابات السائقين) رفع الوثائق الرسمية المطلوبة مثل رخصة السياقة، بطاقة التعريف، والبطاقة الرمادية. وتخضع هذه الوثائق للتدقيق والموافقة من طرف فريق المنصة قبل التفعيل النهائي.',
      },
      {
        id: 's7',
        title: '7. تنفيذ الرحلات والالتزامات',
        content: 'يتم تقديم الرحلات للسائقين بناءً على الموقع الجغرافي وتوفر السائق. يُعتبر إنهاء الرحلة داخل التطبيق شرطاً أساسياً لتوثيق الرحلة، ويتم تسجيل وتخزين كافة تفاصيل ومسارات الرحلات بشكل آلي في النظام لضمان جودة الأداء وحماية كافة الأطراف.',
      },
      {
        id: 's8',
        title: '8. نظام الدفع والعمولات',
        content: 'يعتمد الإصدار الحالي من Yalla VTC بالكامل على الدفع النقدي (Cash) المباشر من الراكب إلى السائق عند نهاية الرحلة. تُحسب عمولة المنصة وفق النظام الديناميكي المعتمد في التطبيق وتُخصم تلقائياً من محفظة السائق بعد اكتمال الرحلة بنجاح. ولا يتم خصم أي عمولة في حالة إلغاء الرحلة.',
      },
      {
        id: 's9',
        title: '9. سياسة إلغاء الرحلات',
        content: 'يحق لكل من السائق والراكب إلغاء الطلب وفق ضوابط محددة داخل التطبيق. تهدف سياسة الإلغاء في Yalla VTC إلى حماية وقت وموارد كافة الأطراف، مع تطبيق إجراءات الحد من الإلغاء غير المبرر لضمان استقرار الخدمة.',
      },
      {
        id: 's10',
        title: '10. تعليق أو إنهاء الحساب',
        content: 'تحتفظ إدارة Yalla VTC بالحق الكامل في تعليق أو تقييد أو إنهاء حساب أي مستخدم أو سائق فوراً ودون إشعار سابق في حالات: تقديم معلومات مزورة، مخالِفة شروط الخدمة، السلوك غير اللائق، السجل السالب المفرط في المحفظة، أو تنفيذ أنشطة احتيالية.',
      },
      {
        id: 's11',
        title: '11. الملكية الفكرية والعلامات التجارية',
        content: 'جميع عناصر تطبيق Yalla VTC، بما في ذلك الاسم التجاري، الشعار، التصاميم، الواجهات، الأكواد البرمجية، والمحتوى النصي هي ملكية فكرية حصرياً لـ Yalla VTC ومحمية بموجب القوانين الدولية. يمنع نسخ أو إعادة استخدام أي جزء دون إذن كتابي صريح.',
      },
      {
        id: 's12',
        title: '12. حدود المسؤولية القانونية',
        content: 'تعمل منصة Yalla VTC كمنصة تقنية تربط بين الركاب والسائقين المستقلين. وفي الحدود التي يسمح بها القانون، لا تتحمل المنصة المسؤولية عن الأضرار المباشرة أو غير المباشرة الناتجة عن أفعال الأطراف الخارجية، مع التزام المنصة بالسعي المستمر لضمان أعلى معايير الأمان.',
      },
      {
        id: 's13',
        title: '13. تعديل شروط الخدمة',
        content: 'تحتفظ Yalla VTC بالحق في تحديث وتعديل شروط الخدمة في أي وقت. يتم نشر التحديثات عبر التطبيق، ويُعد استمرارك في استخدام الخدمات بعد نشر التعديلات بمثابة موافقة وقبول صريح بالشروط المحدثة.',
      },
      {
        id: 's14',
        title: '14. القانون الواجب التطبيق والاختصاص القضائي',
        content: 'تخضع هذه الشروط والأحكام وتُفسر وفقاً للقوانين والأنظمة النافذة ذات الصلة، ويكون للمحاكم المختصة إقليمياً حق الفصل في أي نزاع قد ينشأ عن استخدام تطبيق Yalla VTC.',
      },
      {
        id: 's15',
        title: '15. قنوات التواصل والدعم الفني',
        content: 'لأي استفسارات أو تقديم بلاغات، يرجى التوجه حائرياً إلى صفحة الدعم الفني الرسمية عبر الرابط الخارجي: https://yallavtc.com/contacts/support أو التواصل المباشر عبر "مركز المساعدة" المدمج داخل التطبيق.',
      },
      {
        id: 's16',
        title: '16. المعلومات القانونية والتسجيل',
        content: 'فيما يلي البيانات القانونية الرسمية المتعلقة بالتسجيل والمقر المعتمد للمنصة:',
      },
    ],
  },
  fr: {
    tos_title: "Conditions d'utilisation",
    last_updated: 'Dernière mise à jour: 28 Juillet 2026',
    expand_all: 'Tout développer',
    collapse_all: 'Tout réduire',
    section_index: 'Index des sections',
    official_support_btn: 'Centre de support officiel',
    help_center_btn: "Ouvrir le centre d'aide dans l'application",
    legal_footer_title: 'Informations Légales Officielle',
    registered_office_label: 'Registered Office',
    company_number_label: 'Company Number',
    legal_disclaimer: 'Tous les services sont régis par les conditions d\'utilisation de la plateforme Yalla VTC conformément aux lois en vigueur.',

    sections: [
      { id: 's1', title: '1. Introduction', content: 'Bienvenue sur la plateforme Yalla VTC. Ces conditions forment un contrat juridique entre vous et Yalla VTC. Votre accès ou utilisation de l\'application implique votre acceptation intégrale des présentes règles.' },
      { id: 's2', title: '2. Acceptation des conditions', content: 'La création d\'un compte ou l\'utilisation des services Yalla VTC constitue une acceptation ferme et sans réserve de toutes les conditions d\'utilisation et de la politique de confidentialité.' },
      { id: 's3', title: '3. Éligibilité', content: 'Pour utiliser Yalla VTC, vous devez avoir l\'âge légal requis, posséder un compte valide, fournir des informations exactes et respecter l\'ensemble des lois locales applicables.' },
      { id: 's4', title: '4. Compte utilisateur', content: 'Vous êtes entièrement responsable de la confidentialité de vos identifiants et de l\'exactitude des données de votre compte Yalla VTC. Le partage de compte avec un tiers est strictement interdit.' },
      { id: 's5', title: '5. Utilisation et interdictions', content: 'L\'application Yalla VTC est destinée uniquement aux services de transport légaux. Tout usage frauduleux, tentative de piratage ou comportement abusif entraînera la suspension immédiate du compte.' },
      { id: 's6', title: '6. Vérification des documents', content: 'Certains services nécessitent le téléchargement et la vérification préalable des documents officiels (Permis de conduire, CIN, Carte Grise) avant activation.' },
      { id: 's7', title: '7. Déroulement des courses', content: 'Les demandes sont attribuées selon la géolocalisation et la disponibilité. Toutes les courses sont enregistrées dans le système pour la sécurité des utilisateurs.' },
      { id: 's8', title: '8. Paiement et commission', content: 'Toutes les courses sont payées en espèces directement au chauffeur. La commission de la plateforme est calculée selon le barème dynamique en vigueur et déduite du portefeuille après chaque course réussie. Aucune commission sur les annulations.' },
      { id: 's9', title: '9. Annulation de courses', content: 'Les chauffeurs et passagers disposent d\'un droit d\'annulation selon les règles définies dans l\'application pour éviter les abus.' },
      { id: 's10', title: '10. Suspension et résiliation', content: 'Yalla VTC se réserve le droit de suspendre ou fermer tout compte en cas de violation des conditions, fraude ou comportement inapproprié.' },
      { id: 's11', title: '11. Propriété intellectuelle', content: 'Tous les éléments de Yalla VTC (nom, logo, design, logiciel) sont protégés par le droit d\'auteur et appartiennent exclusivement à Yalla VTC.' },
      { id: 's12', title: '12. Limitation de responsabilité', content: 'Yalla VTC opère en tant que plateforme technologique de mise en relation dans les limites autorisées par la loi.' },
      { id: 's13', title: '13. Modifications des conditions', content: 'Yalla VTC peut modifier ces conditions à tout moment. La poursuite de l\'utilisation de l\'application vaut acceptation des révisions.' },
      { id: 's14', title: '14. Droit applicable', content: 'Ces conditions sont régies et interprétées conformément au droit et tribunaux compétents.' },
      { id: 's15', title: '15. Contact et assistance', content: 'Pour toute demande, rendez-vous sur la page officielle : https://yallavtc.com/contacts/support ou via le centre d\'aide intégré.' },
      { id: 's16', title: '16. Informations légales', content: 'Veuillez trouver ci-dessous les informations légales officielles relatives à l\'immatriculation :' },
    ],
  },
  es: {
    tos_title: 'Términos del Servicio',
    last_updated: 'Última actualización: 28 de Julio de 2026',
    expand_all: 'Expandir todo',
    collapse_all: 'Contraer todo',
    section_index: 'Índice de secciones',
    official_support_btn: 'Centro de soporte oficial',
    help_center_btn: 'Abrir centro de ayuda en la aplicación',
    legal_footer_title: 'Información Legal Oficial',
    registered_office_label: 'Registered Office',
    company_number_label: 'Company Number',
    legal_disclaimer: 'Todos los servicios están sujetos a los términos de la plataforma Yalla VTC de acuerdo con la legislación vigente.',

    sections: [
      { id: 's1', title: '1. Introducción', content: 'Bienvenido a Yalla VTC. Estos términos constituyen un acuerdo legal entre usted y Yalla VTC. El uso de la aplicación implica su aceptación total.' },
      { id: 's2', title: '2. Aceptación de términos', content: 'Crear una cuenta o utilizar Yalla VTC se considera una aceptación plena de estos términos y de la política de privacidad.' },
      { id: 's3', title: '3. Elegibilidad', content: 'Debe tener la edad legal, una cuenta válida y proporcionar datos correctos cumpliendo las leyes locales.' },
      { id: 's4', title: '4. Cuenta de usuario', content: 'Es responsable de la seguridad de sus credenciales y de mantener sus datos actualizados. Está prohibido compartir la cuenta.' },
      { id: 's5', title: '5. Uso de la aplicación', content: 'Yalla VTC se utiliza exclusivamente para servicios de transporte legítimos. El uso fraudulento o indebido provocará la suspensión de la cuenta.' },
      { id: 's6', title: '6. Verificación de documentos', content: 'La activación de servicios requiere la revisión y aprobación previa de los documentos oficiales cargados.' },
      { id: 's7', title: '7. Viajes', content: 'Los viajes se asignan según la ubicación y disponibilidad. Todos los viajes quedan registrados para la seguridad del sistema.' },
      { id: 's8', title: '8. Pago y comisión', content: 'Los viajes se pagan en efectivo directamente al conductor. La comisión de la plataforma se calcula según el sistema dinámico vigente y se descuenta de la billetera tras completar el viaje. Sin comisión en cancelaciones.' },
      { id: 's9', title: '9. Cancelación de viajes', content: 'Tanto conductores como pasajeros pueden cancelar viajes según las reglas de la app para evitar un mal uso.' },
      { id: 's10', title: '10. Suspensión de cuenta', content: 'Yalla VTC se reserva el derecho de suspender cuentas en caso de incumplimiento, fraude o conductas inapropiadas.' },
      { id: 's11', title: '11. Propiedad intelectual', content: 'Todos los elementos de Yalla VTC (marca, logotipo, diseño, software) están protegidos por leyes de propiedad intelectual.' },
      { id: 's12', title: '12. Limitación de responsabilidad', content: 'Yalla VTC opera como una plataforma tecnológica que conecta a usuarios dentro de los límites legales.' },
      { id: 's13', title: '13. Modificaciones', content: 'Yalla VTC puede actualizar estos términos en cualquier momento. El uso continuado implica la aceptación de los cambios.' },
      { id: 's14', title: '14. Ley aplicable', content: 'Estos términos se rigen conforme a las leyes y tribunales aplicables.' },
      { id: 's15', title: '15. Contacto', content: 'Para soporte técnico, diríjase a la página oficial: https://yallavtc.com/contacts/support o al centro de ayuda.' },
      { id: 's16', title: '16. Información legal', content: 'A continuación se presenta la información legal y de registro de la plataforma:' },
    ],
  },
  en: {
    tos_title: 'Terms of Service',
    last_updated: 'Last Updated: July 28, 2026',
    expand_all: 'Expand All',
    collapse_all: 'Collapse All',
    section_index: 'Section Index',
    official_support_btn: 'Official Support Web Page',
    help_center_btn: 'Open In-App Help Center',
    legal_footer_title: 'Official Legal Information',
    registered_office_label: 'Registered Office',
    company_number_label: 'Company Number',
    legal_disclaimer: 'All services are governed by the Yalla VTC platform terms of service in accordance with applicable laws.',

    sections: [
      { id: 's1', title: '1. Introduction', content: 'Welcome to Yalla VTC. These terms constitute a legally binding agreement between you and Yalla VTC. Accessing or using the app signifies your full acceptance of these terms.' },
      { id: 's2', title: '2. Acceptance of Terms', content: 'Creating an account or using Yalla VTC services represents full and unconditional consent to all terms of service and privacy policies.' },
      { id: 's3', title: '3. Eligibility', content: 'You must be of legal age, hold a valid account, provide accurate information, and comply with all applicable local regulations.' },
      { id: 's4', title: '4. User Account', content: 'You are responsible for keeping your Yalla VTC account credentials secure and data updated. Sharing accounts with third parties is strictly prohibited.' },
      { id: 's5', title: '5. App Usage & Restrictions', content: 'Yalla VTC is strictly intended for booking and executing legal transport services. Fraudulent use, system abuse, or hacking attempts will result in account termination.' },
      { id: 's6', title: '6. Document Verification', content: 'Driver account activation requires uploading official documents (Driver License, National ID, Vehicle Registration) for prior review and approval.' },
      { id: 's7', title: '7. Rides & Execution', content: 'Rides are dispatched based on proximity and availability. All completed rides are logged in the system for safety and quality audit.' },
      { id: 's8', title: '8. Payment & Commissions', content: 'The current version operates on direct Cash payments from passenger to driver. Platform commission is calculated dynamically according to the active app rate and automatically deducted from driver wallet upon completion. Zero commission on cancellations.' },
      { id: 's9', title: '9. Cancellation Policy', content: 'Drivers and passengers may cancel rides under fair-use guidelines defined in the app to prevent service disruption.' },
      { id: 's10', title: '10. Account Suspension & Termination', content: 'Yalla VTC reserves the right to suspend or close accounts for policy violations, fraudulent activities, or negative balance limits.' },
      { id: 's11', title: '11. Intellectual Property', content: 'All Yalla VTC assets (name, logo, design, software, text) are protected by intellectual property laws and belong exclusively to Yalla VTC.' },
      { id: 's12', title: '12. Limitation of Liability', content: 'Yalla VTC acts as a technology platform connecting users within the boundaries permitted by applicable law.' },
      { id: 's13', title: '13. Amendments', content: 'Yalla VTC may update these terms at any time. Continued use of the app constitutes acceptance of revised terms.' },
      { id: 's14', title: '14. Governing Law', content: 'These terms are governed by and construed in accordance with applicable laws and competent jurisdiction.' },
      { id: 's15', title: '15. Contact & Support', content: 'For support requests, please visit the official support page at https://yallavtc.com/contacts/support or use the in-app Help Center.' },
      { id: 's16', title: '16. Legal Information', content: 'Below is the official registration and corporate information for the platform:' },
    ],
  },
};

const getTr = (key: string, lang: string) => {
  const activeLang = (lang || 'ar').toLowerCase().split('-')[0];
  const langKey = (activeLang === 'fr' || activeLang === 'es' || activeLang === 'en') ? activeLang : 'ar';
  return TRANSLATIONS[langKey][key] || TRANSLATIONS['ar'][key] || key;
};

export const TermsOfServiceScreen = () => {
  const navigation = useNavigation<any>();
  const { colors, isDarkMode } = useTheme();
  const { i18n } = useTranslation();
  const activeLang = (i18n.language || 'ar').toLowerCase().split('-')[0];
  const lang = (activeLang === 'fr' || activeLang === 'es' || activeLang === 'en') ? activeLang : 'ar';
  const isRTL = lang === 'ar';

  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, Platform.OS === 'android' ? (StatusBar.currentHeight || 28) : 0);

  const sectionsList = useMemo(() => {
    return TRANSLATIONS[lang]?.sections || TRANSLATIONS['ar'].sections;
  }, [lang]);

  // Accordion Expanded State (all expanded by default for smooth browsing)
  const [expandedIds, setExpandedIds] = useState<string[]>(
    sectionsList.map((s: any) => s.id)
  );

  const toggleSection = (id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExpandAll = () => {
    setExpandedIds(sectionsList.map((s: any) => s.id));
  };

  const handleCollapseAll = () => {
    setExpandedIds([]);
  };

  return (
    <View style={[styles.safe, { backgroundColor: colors.bg }]}>

      {/* Drawer-aware Header */}
      <DrawerHeader title={getTr('tos_title', lang)} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Top Hero Meta Banner */}
        <View style={[styles.heroMetaCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }, isRTL && { flexDirection: 'row-reverse' }]}>
            <View style={[styles.badgeIcon, { backgroundColor: colors.primary + '18' }]}>
              <FileText size={22} color={colors.primary} />
            </View>
            <View style={{ flex: 1, alignItems: isRTL ? 'flex-end' : 'flex-start' }}>
              <Text style={[styles.heroAppTitle, { color: colors.textPrimary }]}>Yalla VTC</Text>
              <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 6 }, isRTL && { flexDirection: 'row-reverse' }]}>
                <Calendar size={13} color={colors.textMuted} />
                <Text style={[styles.heroDateText, { color: colors.textMuted }]}>
                  {getTr('last_updated', lang)}
                </Text>
              </View>
            </View>
          </View>

          {/* Quick Actions Bar: Expand / Collapse All */}
          <View style={[styles.controlsRow, { borderTopColor: colors.border }, isRTL && { flexDirection: 'row-reverse' }]}>
            <TouchableOpacity style={styles.ctrlBtn} onPress={handleExpandAll}>
              <Maximize2 size={14} color={colors.primary} />
              <Text style={[styles.ctrlBtnTxt, { color: colors.primary }]}>{getTr('expand_all', lang)}</Text>
            </TouchableOpacity>
            <Text style={{ color: colors.border }}>|</Text>
            <TouchableOpacity style={styles.ctrlBtn} onPress={handleCollapseAll}>
              <Minimize2 size={14} color={colors.textMuted} />
              <Text style={[styles.ctrlBtnTxt, { color: colors.textMuted }]}>{getTr('collapse_all', lang)}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Section Quick Index Chips */}
        <View style={styles.sectionMargin}>
          <Text style={[styles.sectionIndexLabel, { color: colors.textMuted, textAlign: isRTL ? 'right' : 'left' }]}>
            📍 {getTr('section_index', lang)}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
            <View style={[{ flexDirection: 'row', gap: 8 }, isRTL && { flexDirection: 'row-reverse' }]}>
              {sectionsList.map((sec: any) => {
                const isExp = expandedIds.includes(sec.id);
                return (
                  <TouchableOpacity
                    key={sec.id}
                    activeOpacity={0.8}
                    style={[
                      styles.indexChip,
                      {
                        backgroundColor: isExp ? colors.primary + '14' : colors.surface,
                        borderColor: isExp ? colors.primary : colors.border,
                      },
                    ]}
                    onPress={() => toggleSection(sec.id)}
                  >
                    <Text style={[styles.indexChipTxt, { color: isExp ? colors.primary : colors.textPrimary }]}>
                      {sec.title}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* ── 16 Legal Sections Accordions ────────────────────────────── */}
        <View style={styles.sectionMargin}>
          {sectionsList.map((sec: any) => {
            const isExpanded = expandedIds.includes(sec.id);
            const isLegalInfoSection = sec.id === 's16';

            return (
              <View
                key={sec.id}
                style={[
                  styles.accordionCard,
                  { backgroundColor: colors.surface, borderColor: isExpanded ? colors.primary + '50' : colors.border },
                ]}
              >
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={[styles.accordionHeader, isRTL && { flexDirection: 'row-reverse' }]}
                  onPress={() => toggleSection(sec.id)}
                >
                  <Text style={[styles.accordionTitle, { color: colors.textPrimary, flex: 1, textAlign: isRTL ? 'right' : 'left' }]}>
                    {sec.title}
                  </Text>
                  {isExpanded ? (
                    <ChevronUp size={18} color={colors.primary} />
                  ) : (
                    <ChevronDown size={18} color={colors.textMuted} />
                  )}
                </TouchableOpacity>

                {isExpanded && (
                  <View style={[styles.accordionBody, { borderTopColor: colors.border }]}>
                    <Text style={[styles.accordionBodyTxt, { color: colors.textSecondary, textAlign: isRTL ? 'right' : 'left' }]}>
                      {sec.content}
                    </Text>

                    {/* Special Handling for Section 15: Official Support Link */}
                    {sec.id === 's15' && (
                      <View style={{ marginTop: 14, gap: 10 }}>
                        <TouchableOpacity
                          activeOpacity={0.85}
                          style={[styles.supportLinkBtn, { backgroundColor: colors.primary }]}
                          onPress={() => Linking.openURL('https://yallavtc.com/contacts/support')}
                        >
                          <ExternalLink size={16} color="#FFF" />
                          <Text style={styles.supportLinkTxt}>https://yallavtc.com/contacts/support</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          activeOpacity={0.85}
                          style={[styles.inAppHelpBtn, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
                          onPress={() => navigation.navigate('HelpCenter')}
                        >
                          <HelpCircle size={16} color={colors.primary} />
                          <Text style={[styles.inAppHelpTxt, { color: colors.textPrimary }]}>
                            {getTr('help_center_btn', lang)}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* Special Handling for Section 16: Legal Registered Info ONLY AT BOTTOM */}
                    {isLegalInfoSection && (
                      <View style={[styles.legalInfoBox, { backgroundColor: isDarkMode ? '#1E293B' : '#0F172A' }]}>
                        <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }, isRTL && { flexDirection: 'row-reverse' }]}>
                          <Building size={20} color="#F59E0B" />
                          <Text style={styles.legalInfoBoxHeader}>
                            {getTr('legal_footer_title', lang)}
                          </Text>
                        </View>

                        {/* Registered Office */}
                        <View style={styles.legalRowItem}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                            <MapPin size={14} color="#94A3B8" />
                            <Text style={styles.legalRowLbl}>{getTr('registered_office_label', lang)}</Text>
                          </View>
                          <Text style={styles.legalRowVal}>128 City Road</Text>
                          <Text style={styles.legalRowVal}>London, EC1V 2NX</Text>
                          <Text style={styles.legalRowVal}>United Kingdom</Text>
                        </View>

                        <View style={styles.legalDivider} />

                        {/* Company Number */}
                        <View style={styles.legalRowItem}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                            <Hash size={14} color="#94A3B8" />
                            <Text style={styles.legalRowLbl}>{getTr('company_number_label', lang)}</Text>
                          </View>
                          <Text style={[styles.legalRowVal, { color: '#4ADE80', fontWeight: '800', fontSize: 16 }]}>
                            15380150
                          </Text>
                        </View>
                      </View>
                    )}

                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Footer Disclaimer */}
        <View style={styles.footerWrap}>
          <Shield size={20} color={colors.textMuted} style={{ marginBottom: 6 }} />
          <Text style={[styles.disclaimerTxt, { color: colors.textMuted }]}>
            {getTr('legal_disclaimer', lang)}
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  heroMetaCard: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  badgeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroAppTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  heroDateText: {
    fontSize: 12,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 12,
  },
  ctrlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ctrlBtnTxt: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  sectionMargin: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  sectionIndexLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    marginBottom: 4,
  },
  indexChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  indexChipTxt: {
    fontSize: 12,
    fontWeight: '600',
  },
  accordionCard: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  accordionTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    lineHeight: 20,
  },
  accordionBody: {
    padding: 16,
    borderTopWidth: 1,
  },
  accordionBodyTxt: {
    fontSize: 13.5,
    lineHeight: 22,
  },
  supportLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
  },
  supportLinkTxt: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  inAppHelpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  inAppHelpTxt: {
    fontSize: 13,
    fontWeight: '700',
  },
  legalInfoBox: {
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
  },
  legalInfoBoxHeader: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
  legalRowItem: {
    marginVertical: 4,
  },
  legalRowLbl: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  legalRowVal: {
    color: '#F8FAFC',
    fontSize: 13.5,
    lineHeight: 19,
    fontWeight: '600',
  },
  legalDivider: {
    height: 1,
    backgroundColor: '#334155',
    marginVertical: 10,
  },
  footerWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    marginTop: 24,
  },
  disclaimerTxt: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default TermsOfServiceScreen;
