// ─── Core Style Props ─────────────────────────────────────────────────────────

export interface ColorPair {
  light: string;
  dark: string;
}

export type FontSize =
  | 'xs' | 'sm' | 'base' | 'lg' | 'xl'
  | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | '8xl';

export type FontWeight = '400' | '500' | '600' | '700' | '800' | '900';

export type TextAlign = 'left' | 'center' | 'right';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export interface StyleProps {
  color?: ColorPair;
  fontSize?: FontSize;
  fontWeight?: FontWeight;
  textAlign?: TextAlign;
  visible?: boolean;
  showDesktop?: boolean;
  showMobile?: boolean;
  bgColor?: string;
  textColor?: string;
  borderColor?: string;
}

// ─── Element Types ────────────────────────────────────────────────────────────

export interface MultiLangText {
  AR: string;
  FR: string;
  EN: string;
  ES?: string;
}

export interface TextElement {
  text: MultiLangText;
  style: StyleProps;
}

export interface ImageElement {
  src: string;
  srcMobile?: string;
  alt?: string;
  overlayOpacity: number;
}

export interface ButtonElement {
  text: MultiLangText;
  href: string;
  style: StyleProps & { variant: ButtonVariant };
}

// ─── Section Configs ──────────────────────────────────────────────────────────

export interface HeroConfig {
  title: TextElement;
  subtitle: TextElement;
  primaryButton: ButtonElement;
  secondaryButton: ButtonElement;
  background: ImageElement;
}

export interface OneAppConfig {
  badge: TextElement;
  heading: TextElement;
  subtitle: TextElement;
  visible: boolean;
}

// ─── Global Theme ─────────────────────────────────────────────────────────────

export interface ThemeTokens {
  primary: string;
  background: string;
  surface: string;
  heading: string;
  body: string;
  muted: string;
  border: string;
}

export interface ThemeConfig {
  light: ThemeTokens;
  dark: ThemeTokens;
}

// ─── Section Metadata ─────────────────────────────────────────────────────────

export type SectionId =
  | 'hero' | 'oneApp' | 'passenger' | 'driver'
  | 'howItWorks' | 'safety' | 'services'
  | 'journal' | 'download' | 'faq';

export interface SectionMeta {
  id: SectionId;
  labelAR: string;
  labelEN: string;
  visible: boolean;
  order: number;
}

// ─── Root Config ──────────────────────────────────────────────────────────────

export interface HomepageConfig {
  version: number;
  isDraft: boolean;
  publishedAt: string | null;
  lastSavedAt: string | null;
  theme: ThemeConfig;
  sections: SectionMeta[];
  hero: HeroConfig;
  oneApp: OneAppConfig;
}

// ─── Editor Selection ─────────────────────────────────────────────────────────

export type ElementPath =
  | 'hero.title' | 'hero.subtitle'
  | 'hero.primaryButton' | 'hero.secondaryButton'
  | 'hero.background'
  | 'oneApp.badge' | 'oneApp.heading' | 'oneApp.subtitle'
  | 'theme';

export interface SelectedElement {
  sectionId: SectionId | 'theme';
  elementPath: ElementPath;
  label: string;
}

// ─── Default Config ───────────────────────────────────────────────────────────

export const DEFAULT_HOMEPAGE_CONFIG: HomepageConfig = {
  version: 1,
  isDraft: false,
  publishedAt: null,
  lastSavedAt: null,
  theme: {
    light: {
      primary: '#683EE6', background: '#F7F7FA', surface: '#FFFFFF',
      heading: '#0F172A', body: '#334155', muted: '#64748B', border: '#E2E8F0',
    },
    dark: {
      primary: '#683EE6', background: '#020617', surface: '#0F172A',
      heading: '#FFFFFF', body: '#CBD5E1', muted: '#94A3B8', border: '#1E293B',
    },
  },
  sections: [
    { id: 'hero',       labelAR: 'الهيدر الرئيسي', labelEN: 'Hero',         visible: true,  order: 1 },
    { id: 'oneApp',     labelAR: 'تطبيق واحد',      labelEN: 'One App',      visible: true,  order: 2 },
    { id: 'passenger',  labelAR: 'تجربة الراكب',     labelEN: 'Passenger',    visible: true,  order: 3 },
    { id: 'driver',     labelAR: 'تجربة السائق',     labelEN: 'Driver',       visible: true,  order: 4 },
    { id: 'howItWorks', labelAR: 'كيف تعمل الرحلة', labelEN: 'How It Works', visible: true,  order: 5 },
    { id: 'safety',     labelAR: 'الأمان والثقة',    labelEN: 'Safety',       visible: true,  order: 6 },
    { id: 'services',   labelAR: 'الخدمات',          labelEN: 'Services',     visible: true,  order: 7 },
    { id: 'journal',    labelAR: 'المجلة',           labelEN: 'Journal',      visible: true,  order: 8 },
    { id: 'download',   labelAR: 'تحميل التطبيق',    labelEN: 'Download',     visible: true,  order: 9 },
    { id: 'faq',        labelAR: 'الأسئلة الشائعة', labelEN: 'FAQ',          visible: true,  order: 10 },
  ],
  hero: {
    title: {
      text: { AR: 'طريقة أذكى للتنقل.', FR: 'Une façon plus intelligente de se déplacer.', EN: 'A Smarter Way to Get Around.' },
      style: { color: { light: '#FFFFFF', dark: '#FFFFFF' }, fontSize: '7xl', fontWeight: '900', textAlign: 'center', visible: true },
    },
    subtitle: {
      text: { AR: 'تطبيق واحد يجمع الراكب والسائق في تجربة تنقل بسيطة ومرنة.', FR: 'Une seule application réunit passagers et chauffeurs.', EN: 'One app bringing passengers and drivers together.' },
      style: { color: { light: '#CBD5E1', dark: '#FFFFFF' }, fontSize: 'xl', fontWeight: '600', textAlign: 'center', visible: true },
    },
    primaryButton: {
      text: { AR: 'حمّل تطبيق Yalla VTC', FR: 'Télécharger Yalla VTC', EN: 'Download Yalla VTC' },
      href: '#download',
      style: { variant: 'primary', visible: true, bgColor: '#683EE6', textColor: '#FFFFFF' },
    },
    secondaryButton: {
      text: { AR: 'استكشف التجربة', FR: 'Explorer', EN: 'Explore the Experience' },
      href: '#app-showcase',
      style: { variant: 'ghost', visible: true },
    },
    background: {
      src: '/images/hero_banner_desktop.webp',
      srcMobile: '/images/hero_banner_mobile.webp',
      alt: 'Yalla VTC Hero',
      overlayOpacity: 70,
    },
  },
  oneApp: {
    badge: {
      text: { AR: 'منصة موحدة', FR: 'Plateforme unifiée', EN: 'Unified Platform' },
      style: { visible: true },
    },
    heading: {
      text: { AR: 'تجربتان في تطبيق واحد.', FR: 'Deux expériences, une seule app.', EN: 'Two Experiences, One App.' },
      style: { color: { light: '#0F172A', dark: '#FFFFFF' }, fontSize: '6xl', fontWeight: '900', textAlign: 'right', visible: true },
    },
    subtitle: {
      text: { AR: 'سواء كنت راكباً تبحث عن رحلة مريحة أو سائقاً تسعى لدخل مرن، يمنحك Yalla VTC التجربة الكاملة من تطبيق واحد.', FR: "Que vous soyez passager ou chauffeur, Yalla VTC vous offre l'expérience complète.", EN: "Whether you're a passenger or driver, Yalla VTC delivers the full experience." },
      style: { color: { light: '#475569', dark: '#94A3B8' }, fontSize: 'lg', fontWeight: '500', textAlign: 'right', visible: true },
    },
    visible: true,
  },
};
