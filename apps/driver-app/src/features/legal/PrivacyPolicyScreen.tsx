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
  ShieldCheck,
  Calendar,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Lock,
  Building,
  MapPin,
  Hash,
  HelpCircle,
  Maximize2,
  Minimize2,
} from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── 4 Languages Privacy Policy Complete Dictionary ─────────────────────────
const TRANSLATIONS: any = {
  ar: {
    privacy_title: 'سياسة الخصوصية',
    last_updated: 'آخر تحديث: 28 يوليو 2026',
    expand_all: 'توسيع الكل',
    collapse_all: 'طي الكل',
    section_index: 'فهرس الأقسام',
    official_support_btn: 'صفحة الدعم الرسمية',
    help_center_btn: 'مركز المساعدة داخل التطبيق',
    legal_footer_title: 'المعلومات القانونية الرسمية',
    registered_office_label: 'Registered Office',
    company_number_label: 'Company Number',
    legal_disclaimer: 'تلتزم منصة Yalla VTC بجميع معايير الخصوصية وحماية البيانات وفق القوانين والأنظمة المعمول بها.',

    sections: [
      {
        id: 'p1',
        title: '1. مقدمة',
        content: 'تحترم منصة Yalla VTC خصوصية جميع المستخدمين والسائقين والركاب، وتلتزم حماية بياناتهم الشخصية واستخدامها بطريقة آمنة، شفافة، ومسؤولة وفق أعلى المعايير العالمية المعمول بها.',
      },
      {
        id: 'p2',
        title: '2. البيانات التي نقوم بجمعها',
        content: 'تجمع منصة Yalla VTC الفئات التالية من البيانات لضمان تقديم الخدمات بكفاءة عالية:\n\n• بيانات الحساب: الاسم الكامل، رقم الهاتف، عنوان البريد الإلكتروني (إن وجد)، واللغة المفضلة.\n• بيانات الهوية والتحقق: صورة البطاقة الوطنية، رخصة السياقة، صور الوثائق، وصور الملف الشخصي.\n• بيانات المركبة: نوع المركبة، الماركة، الطراز، سنة الصنع، لوحة التسجيل، والبطاقة الرمادية.\n• بيانات الرحلات: نقطة الانطلاق، نقطة الوصول، الوقت، مدة الرحلة، المسافة، الحالة، والقيمة المالية.\n• بيانات الموقع الجغرافي (GPS): يُجمع الموقع في الخلفية والمقدمة أثناء استخدام التطبيق لتحديد موقع السائق، توجيه وتأمين الرحلات، وحساب المسافات بدقة.',
      },
      {
        id: 'p3',
        title: '3. استخدام الكاميرا والصور',
        content: 'قد يطلب تطبيق Yalla VTC إذن الوصول إلى الكاميرا أو مكتبة الصور حائرياً لـ: التقاط صور الوثائق الرسمية، التقاط صورة شخصية، وتصوير المركبة لأغراض التحقق من الهوية. ولا يتم استخدام الكاميرا مطلقاً لأي غرض آخر بدون موافقة صريحة.',
      },
      {
        id: 'p4',
        title: '4. الإشعارات والتنبيهات',
        content: 'يستخدم Yalla VTC الإشعارات لإبقاء المستخدمين على علم بـ: طلبات الرحلات القريبة، تحديثات الحساب والوثائق، تنبيهات المحفظة والعمليات المالية، والإشعارات التحديثية والأمنية المهمة.',
      },
      {
        id: 'p5',
        title: '5. كيفية استخدام البيانات',
        content: 'تُعالج البيانات للأغراض التالية فقط: إنشاء وإدارة الحسابات، التحقق من الهوية، تنفيذ خدمات النقل وتتبع المسارات، تقديم الدعم الفني، منع الاحتيال وحماية أمان المنصة، والامتثال للمتطلبات التنظيمية والقانونية.',
      },
      {
        id: 'p6',
        title: '6. مشاركة البيانات والإفصاح',
        content: 'لا يتم بيع البيانات الشخصية لأي طرف ثالث. قد يتم الإفصاح عن البيانات فقط عند الضرورة القصوى لـ: السلطات الحكومية والقضائية عند وجود التزام قانوني رسمي، ومزودي الخدمات التقنية المساندة الذين يلتزمون بمعايير أمان صارمة.',
      },
      {
        id: 'p7',
        title: '7. حماية البيانات وأمن المعلومات',
        content: 'يتخذ Yalla VTC تدابير أمنية وتقنية متقدمة تشمل التشفير الإلكتروني، جدران الحماية، والرقابة على الصلاحيات لحماية بياناتك من التلف، الفقدان، الوصول غير المصرح به، التعديل، أو الإفصاح.',
      },
      {
        id: 'p8',
        title: '8. الاحتفاظ بالبيانات والحذف',
        content: 'يتم الاحتفاظ بالبيانات طيلة الفترة اللازمة لتقديم الخدمات والالتزام بالمتطلبات القانونية والتنظيمية والمحاسبية. وبمجرد انتهاء الحاجة إليها، يتم إتلافها أو إخفاء هوية أصحابها بشكل آمن وفق السياسات المعتمدة.',
      },
      {
        id: 'p9',
        title: '9. حقوق المستخدم والتحكم',
        content: 'يحق للمستخدم بموجب القوانين ذات الصلة: الاطلاع على بياناته الشخصية، طلب تصحيح أي بيانات غير دقيقة، طلب حذف البيانات متى كان ذلك ممكناً قانونياً، والاعتراض على معالجة معينة للبيانات وفق الضوابط.',
      },
      {
        id: 'p10',
        title: '10. ملفات السجل والتحليلات البرمجية',
        content: 'قد يجمع التطبيق بيانات تقنية آفرة مثل عنوان IP، نوع الجهاز، ونظام التشغيل بهدف تحسين أداء التطبيق، اكتشاف التشخيصات والأعطال البرمجية، وتطوير تجربة الاستخدام دون التعرف على الهوية الشخصية المباشرة.',
      },
      {
        id: 'p11',
        title: '11. ملفات تعريف الارتباط والتقنيات المشابهة',
        content: 'تستخدم المنصة التقنيات والآليات اللازمة لحفظ الجلسات وتسهيل الانتقال عبر الخدمات الرقمية المرتبطة بالتطبيق، بما يضمن تجربة سريعة وآمنة للمستخدمين.',
      },
      {
        id: 'p12',
        title: '12. خصوصية الأطفال والقاصرين',
        content: 'خدمات Yalla VTC غير موجهة للأشخاص دون السن القانوني المسموح به محلياً، ولا يتم جمع بيانات أي شخص قاصر عن قصد.',
      },
      {
        id: 'p13',
        title: '13. تحديث سياسة الخصوصية',
        content: 'يجوز لـ Yalla VTC تحديث سياسة الخصوصية عند الحاجة. يُنشر أي تعديل داخل التطبيق مع توضيح تاريخ آخر تحديث، ويُعتبر استمرار استخدام الخدمات بمثابة موافقة على التحديثات.',
      },
      {
        id: 'p14',
        title: '14. التواصل والدعم',
        content: 'لأي استفسار يتعلق بالخصوصية، يرجى التواصل عبر "مركز المساعدة" داخل التطبيق أو من خلال صفحة الدعم الرسمية: https://yallavtc.com/contacts/support (لا يتم عرض أي بريد إلكتروني مباشر).',
      },
      {
        id: 'p15',
        title: '15. المعلومات القانونية والتسجيل',
        content: 'فيما يلي البيانات القانونية الرسمية المتعلقة بالتسجيل والمقر المعتمد للمنصة:',
      },
    ],
  },
  fr: {
    privacy_title: 'Politique de confidentialité',
    last_updated: 'Dernière mise à jour: 28 Juillet 2026',
    expand_all: 'Tout développer',
    collapse_all: 'Tout réduire',
    section_index: 'Index des sections',
    official_support_btn: 'Page de support officielle',
    help_center_btn: "Ouvrir le centre d'aide dans l'application",
    legal_footer_title: 'Informations Légales Officielle',
    registered_office_label: 'Registered Office',
    company_number_label: 'Company Number',
    legal_disclaimer: 'La plateforme Yalla VTC s\'engage à respecter les normes de confidentialité conformément aux lois en vigueur.',

    sections: [
      { id: 'p1', title: '1. Introduction', content: 'Yalla VTC respecte la vie privée de tous les utilisateurs et s\'engage à protéger leurs données personnelles de manière sécurisée et transparente.' },
      { id: 'p2', title: '2. Données collectées', content: 'Nous collectons les données de compte (nom, téléphone, langue), d\'identité (permis, CIN, photos), du véhicule (marque, immatriculation), des courses et de géolocalisation GPS.' },
      { id: 'p3', title: '3. Utilisation de la caméra', content: 'L\'accès à l\'appareil photo sert uniquement à la prise de vue des documents officiels, du profil et du véhicule pour la vérification.' },
      { id: 'p4', title: '4. Notifications', content: 'Les notifications sont utilisées pour les demandes de courses, alertes de portefeuille et mises à jour de sécurité.' },
      { id: 'p5', title: '5. Utilisation des données', content: 'Les données permettent de gérer les comptes, exécuter les transports, prévenir la fraude et respecter les obligations légales.' },
      { id: 'p6', title: '6. Partage des données', content: 'Vos données personnelles ne sont jamais vendues. Elles peuvent être partagées uniquement si la loi l\'exige ou avec des prestataires techniques autorisés.' },
      { id: 'p7', title: '7. Protection des données', content: 'Yalla VTC applique des mesures de sécurité avancées et le chiffrement pour protéger vos informations.' },
      { id: 'p8', title: '8. Conservation des données', content: 'Les données sont conservées pendant la durée nécessaire au service et aux obligations légales, puis supprimées de manière sécurisée.' },
      { id: 'p9', title: '9. Droits des utilisateurs', content: 'Vous avez le droit d\'accéder, corriger, mettre à jour ou demander la suppression de vos données conformément aux lois.' },
      { id: 'p10', title: '10. Fichiers journaux et analyses', content: 'Des données techniques anonymes peuvent être collectées pour optimiser les performances et la sécurité.' },
      { id: 'p11', title: '11. Technologies web & cookies', content: 'Des mécanismes de session sont utilisés pour garantir une navigation fluide et sécurisée.' },
      { id: 'p12', title: '12. Protection des mineurs', content: 'Le service Yalla VTC est réservé aux personnes majeures selon la législation locale.' },
      { id: 'p13', title: '13. Mises à jour de la politique', content: 'Yalla VTC se réserve le droit de modifier cette politique. L\'utilisation continue de l\'application vaut acceptation.' },
      { id: 'p14', title: '14. Contact et assistance', content: 'Pour toute question, contactez-nous via le centre d\'aide ou sur : https://yallavtc.com/contacts/support' },
      { id: 'p15', title: '15. Informations légales', content: 'Veuillez trouver ci-dessous les informations légales officielles relatives à l\'immatriculation :' },
    ],
  },
  es: {
    privacy_title: 'Política de Privacidad',
    last_updated: 'Última actualización: 28 de Julio de 2026',
    expand_all: 'Expandir todo',
    collapse_all: 'Contraer todo',
    section_index: 'Índice de secciones',
    official_support_btn: 'Página de soporte oficial',
    help_center_btn: 'Abrir centro de ayuda en la aplicación',
    legal_footer_title: 'Información Legal Oficial',
    registered_office_label: 'Registered Office',
    company_number_label: 'Company Number',
    legal_disclaimer: 'La plataforma Yalla VTC cumple con todos los estándares de privacidad según la ley aplicable.',

    sections: [
      { id: 'p1', title: '1. Introducción', content: 'Yalla VTC respeta la privacidad de todos los usuarios y se compromete a proteger sus datos personales de forma segura y responsable.' },
      { id: 'p2', title: '2. Datos que recopilamos', content: 'Recopilamos datos de cuenta (nombre, teléfono, idioma), identidad (documentos, fotos), vehículo (matrícula, modelo), viajes y ubicación GPS.' },
      { id: 'p3', title: '3. Uso de la cámara', content: 'La cámara se utiliza únicamente para fotografiar documentos oficiales, perfil y vehículo para verificación.' },
      { id: 'p4', title: '4. Notificaciones', content: 'Usamos notificaciones para solicitudes de viaje, alertas de billetera y avisos de seguridad.' },
      { id: 'p5', title: '5. Uso de datos', content: 'Los datos se procesan para gestionar cuentas, ejecutar viajes, prevenir el fraude y cumplir con las leyes.' },
      { id: 'p6', title: '6. Compartición de datos', content: 'Los datos personales no se venden. Solo se comparten por requerimiento legal o con proveedores técnicos autorizados.' },
      { id: 'p7', title: '7. Protección de datos', content: 'Yalla VTC implementa medidas de seguridad y cifrado para proteger sus datos.' },
      { id: 'p8', title: '8. Retención de datos', content: 'Los datos se conservan el tiempo necesario para el servicio y obligaciones legales, luego se eliminan de forma segura.' },
      { id: 'p9', title: '9. Derechos del usuario', content: 'Tiene derecho a acceder, corregir, actualizar o solicitar la eliminación de sus datos según la ley.' },
      { id: 'p10', title: '10. Archivos de registro', content: 'Se recopilan datos técnicos anónimos para mejorar el rendimiento y la seguridad.' },
      { id: 'p11', title: '11. Tecnologías asociadas', content: 'Se utilizan tecnologías de sesión para garantizar un uso seguro y ágil.' },
      { id: 'p12', title: '12. Privacidad de menores', content: 'Los servicios de Yalla VTC están destinados únicamente a personas mayores de edad.' },
      { id: 'p13', title: '13. Modificaciones', content: 'Yalla VTC puede actualizar esta política. El uso continuado implica la aceptación de los cambios.' },
      { id: 'p14', title: '14. Contacto', content: 'Para dudas de privacidad, visite el centro de ayuda o: https://yallavtc.com/contacts/support' },
      { id: 'p15', title: '15. Información legal', content: 'A continuación se presenta la información legal y de registro de la plataforma:' },
    ],
  },
  en: {
    privacy_title: 'Privacy Policy',
    last_updated: 'Last Updated: July 28, 2026',
    expand_all: 'Expand All',
    collapse_all: 'Collapse All',
    section_index: 'Section Index',
    official_support_btn: 'Official Support Web Page',
    help_center_btn: 'Open In-App Help Center',
    legal_footer_title: 'Official Legal Information',
    registered_office_label: 'Registered Office',
    company_number_label: 'Company Number',
    legal_disclaimer: 'Yalla VTC is committed to protecting data privacy in accordance with applicable laws.',

    sections: [
      { id: 'p1', title: '1. Introduction', content: 'Yalla VTC respects user privacy and is committed to collecting and processing personal data securely and transparently.' },
      { id: 'p2', title: '2. Data We Collect', content: 'We collect Account Data (name, phone, language), Identity & Verification Data (documents, photos), Vehicle Data, Ride Details, and GPS Location.' },
      { id: 'p3', title: '3. Camera Usage', content: 'Camera access is strictly used to capture official documents, profile pictures, and vehicle photos for verification.' },
      { id: 'p4', title: '4. Notifications', content: 'Notifications keep drivers updated on ride requests, wallet activity, and security alerts.' },
      { id: 'p5', title: '5. How We Use Data', content: 'Data is used for account setup, verification, ride dispatching, fraud prevention, and legal compliance.' },
      { id: 'p6', title: '6. Data Sharing', content: 'We never sell personal data. Data is disclosed only under legal obligations or to authorized technical service providers.' },
      { id: 'p7', title: '7. Data Protection', content: 'Yalla VTC applies encryption and advanced technical safeguards to secure your information.' },
      { id: 'p8', title: '8. Data Retention', content: 'Data is retained for as long as required for service operation and compliance, then safely deleted or anonymized.' },
      { id: 'p9', title: '9. User Rights', content: 'You hold rights to access, correct, update, or request data deletion as permitted by law.' },
      { id: 'p10', title: '10. Logs & Analytics', content: 'Technical diagnostic data is used to optimize app performance and enhance safety.' },
      { id: 'p11', title: '11. Cookies & Similar Tech', content: 'Session technologies ensure smooth, secure browsing across linked web services.' },
      { id: 'p12', title: '12. Children\'s Privacy', content: 'Yalla VTC services are strictly intended for individuals of legal age under local regulations.' },
      { id: 'p13', title: '13. Policy Updates', content: 'Yalla VTC may update this policy periodically. Continued use constitutes acceptance of revised terms.' },
      { id: 'p14', title: '14. Contact', content: 'For privacy inquiries, use the in-app Help Center or visit: https://yallavtc.com/contacts/support' },
      { id: 'p15', title: '15. Legal Information', content: 'Below is the official registration and corporate information for the platform:' },
    ],
  },
};

const getTr = (key: string, lang: string) => {
  const activeLang = (lang || 'ar').toLowerCase().split('-')[0];
  const langKey = (activeLang === 'fr' || activeLang === 'es' || activeLang === 'en') ? activeLang : 'ar';
  return TRANSLATIONS[langKey][key] || TRANSLATIONS['ar'][key] || key;
};

export const PrivacyPolicyScreen = () => {
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

  // Accordion Expanded State
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
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {/* Header Bar */}
      <View style={[styles.header, { borderBottomColor: colors.border, paddingTop: topPadding, height: 56 + topPadding }, isRTL && styles.headerRTL]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          {isRTL ? <ChevronRight size={24} color={colors.textPrimary} /> : <ChevronLeft size={24} color={colors.textPrimary} />}
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
          {getTr('privacy_title', lang)}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Top Hero Meta Banner */}
        <View style={[styles.heroMetaCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }, isRTL && { flexDirection: 'row-reverse' }]}>
            <View style={[styles.badgeIcon, { backgroundColor: colors.online + '18' }]}>
              <Lock size={22} color={colors.online} />
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

          {/* Quick Actions Bar */}
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

        {/* ── 15 Legal Sections Accordions ────────────────────────────── */}
        <View style={styles.sectionMargin}>
          {sectionsList.map((sec: any) => {
            const isExpanded = expandedIds.includes(sec.id);
            const isLegalInfoSection = sec.id === 'p15';

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

                    {/* Special Handling for Section 14: Official Support Link */}
                    {sec.id === 'p14' && (
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

                    {/* Special Handling for Section 15: Legal Registered Info ONLY AT BOTTOM */}
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
          <ShieldCheck size={20} color={colors.textMuted} style={{ marginBottom: 6 }} />
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

export default PrivacyPolicyScreen;
