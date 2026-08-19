import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check } from 'lucide-react';

export type SupportedLanguage = 'ar' | 'fr' | 'en' | 'es';

export interface LanguageOption {
  code: SupportedLanguage;
  label: string;
  flag: string;
  isRtl: boolean;
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'ar', label: 'العربية', flag: '🇲🇦', isRtl: true },
  { code: 'fr', label: 'Français', flag: '🇫🇷', isRtl: false },
  { code: 'en', label: 'English', flag: '🇬🇧', isRtl: false },
  { code: 'es', label: 'Español', flag: '🇪🇸', isRtl: false },
];

export interface TranslationDictionary {
  brandTitle: string;
  brandTagline: string;
  emailTab: string;
  phoneTab: string;
  emailLabel: string;
  emailPlaceholder: string;
  sendCodeBtn: string;
  phoneLabel: string;
  phonePlaceholder: string;
  otpBadgeTitle: string;
  otpInputLabel: string;
  verifyBtn: string;
  resendBtn: string;
  resendCooldown: string;
  backBtn: string;
  privacy: string;
  terms: string;
  help: string;
  securityBadge: string;
  otpSentMessage: string;
  invalidOtpError: string;
  networkError: string;
}

export const TRANSLATIONS: Record<SupportedLanguage, TranslationDictionary> = {
  ar: {
    brandTitle: 'أطلس',
    brandTagline: 'تنقل بذكاء أعلى',
    emailTab: 'البريد الإلكتروني',
    phoneTab: 'رقم الهاتف',
    emailLabel: 'البريد الإلكتروني للإدارة',
    emailPlaceholder: 'admin@yallavtc.com',
    sendCodeBtn: 'إرسال رمز الأمان',
    phoneLabel: 'رقم هاتف الحساب',
    phonePlaceholder: '+212 600-000000',
    otpBadgeTitle: 'بوابة الأمان: رمز محدد بـ 5 دقائق مخصص لاستخدام واحد بدون رموز تجاوز.',
    otpInputLabel: 'رمز التحقق (6 أرقام)',
    verifyBtn: 'المصادقة والدخول',
    resendBtn: 'إعادة إرسال الرمز',
    resendCooldown: 'إعادة الإرسال بعد {seconds}ث',
    backBtn: 'تغيير طريقة الدخول',
    privacy: 'الخصوصية',
    terms: 'الشروط',
    help: 'هل تحتاج مساعدة؟ اتصل بالدعم',
    securityBadge: 'حماية وتشفير عالي المستوى',
    otpSentMessage: 'إذا كان البريد يتبع لحساب إداري نشط، فقد تم إرسال رمز التحقق.',
    invalidOtpError: 'رمز التحقق غير صالح أو منتهي الصلاحية.',
    networkError: 'تعذر الاتصال بالخادم. يرجى التحقق من الشبكة.',
  },
  fr: {
    brandTitle: 'ATLAS',
    brandTagline: 'MOVE SMARTER',
    emailTab: 'E-mail',
    phoneTab: 'Téléphone',
    emailLabel: 'Adresse E-mail Admin',
    emailPlaceholder: 'admin@yallavtc.com',
    sendCodeBtn: 'Envoyer le code de sécurité',
    phoneLabel: 'Numéro de Téléphone',
    phonePlaceholder: '+212 600-000000',
    otpBadgeTitle: 'Passerelle de Sécurité: OTP à usage unique expirant en 5 min. Zero bypass.',
    otpInputLabel: 'Code de Vérification (6 chiffres)',
    verifyBtn: 'Authentifier & Connecter',
    resendBtn: 'Renvoyer le code',
    resendCooldown: 'Renvoyer dans {seconds}s',
    backBtn: 'Changer de méthode',
    privacy: 'Confidentialité',
    terms: 'Conditions',
    help: 'Besoin d\'aide ? Contactez le support',
    securityBadge: 'Sécurité de Niveau Entreprise',
    otpSentMessage: 'Si cet e-mail appartient à un administrateur actif, un code a été envoyé.',
    invalidOtpError: 'Code de vérification invalide ou expiré.',
    networkError: 'Échec de connexion au serveur. Vérifiez votre réseau.',
  },
  en: {
    brandTitle: 'ATLAS',
    brandTagline: 'MOVE SMARTER',
    emailTab: 'Email',
    phoneTab: 'Phone',
    emailLabel: 'Admin Email Address',
    emailPlaceholder: 'admin@yallavtc.com',
    sendCodeBtn: 'Send Security Code',
    phoneLabel: 'Account Phone Number',
    phonePlaceholder: '+212 600-000000',
    otpBadgeTitle: 'Security Gateway: Single-use Email OTP with 5-minute expiry. Zero bypass allowed.',
    otpInputLabel: 'Verification Code (6 digits)',
    verifyBtn: 'Authenticate & Enter',
    resendBtn: 'Resend Code',
    resendCooldown: 'Resend in {seconds}s',
    backBtn: 'Change Login Method',
    privacy: 'Privacy',
    terms: 'Terms',
    help: 'Having trouble? Get Help',
    securityBadge: 'Enterprise-Grade Security',
    otpSentMessage: 'If the provided email belongs to an active administrator, a code has been sent.',
    invalidOtpError: 'Invalid or expired verification code.',
    networkError: 'Failed to connect to server. Please check network.',
  },
  es: {
    brandTitle: 'ATLAS',
    brandTagline: 'MOVE SMARTER',
    emailTab: 'Correo',
    phoneTab: 'Teléfono',
    emailLabel: 'Correo Electrónico Admin',
    emailPlaceholder: 'admin@yallavtc.com',
    sendCodeBtn: 'Enviar Código de Seguridad',
    phoneLabel: 'Número de Teléfono',
    phonePlaceholder: '+212 600-000000',
    otpBadgeTitle: 'Pasarela de Seguridad: OTP de uso único con caducidad de 5 min. Sin códigos bypass.',
    otpInputLabel: 'Código de Verificación (6 dígitos)',
    verifyBtn: 'Autenticar e Entrar',
    resendBtn: 'Reenviar Código',
    resendCooldown: 'Reenviar en {seconds}s',
    backBtn: 'Cambiar Método',
    privacy: 'Privacidad',
    terms: 'Términos',
    help: '¿Necesita ayuda? Contacte soporte',
    securityBadge: 'Seguridad de Nivel Empresarial',
    otpSentMessage: 'Si el correo pertenece a un administrador activo, se ha enviado un código.',
    invalidOtpError: 'Código de verificación no válido o caducado.',
    networkError: 'Error al conectar con el servidor. Compruebe la red.',
  },
};

interface LanguageSelectorProps {
  currentLang: SupportedLanguage;
  onSelectLang: (lang: SupportedLanguage) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLang,
  onSelectLang,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeOption = LANGUAGE_OPTIONS.find((opt) => opt.code === currentLang) || LANGUAGE_OPTIONS[2];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-slate-300 text-xs font-bold transition-all duration-200"
        title="Select Language"
        aria-label="Select Language"
      >
        <Globe size={14} className="text-[#06B6D4]" />
        <span>{activeOption.flag}</span>
        <span className="uppercase text-[11px] font-black tracking-wider">{activeOption.code}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 bottom-full mb-2 w-44 rounded-2xl bg-[#0F172A] border border-white/10 shadow-2xl backdrop-blur-xl z-50 overflow-hidden py-1.5 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-white/5">
            Language / اللغة
          </div>
          {LANGUAGE_OPTIONS.map((opt) => {
            const isSelected = opt.code === currentLang;
            return (
              <button
                key={opt.code}
                type="button"
                onClick={() => {
                  onSelectLang(opt.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2 text-xs transition-colors ${
                  isSelected
                    ? 'bg-[#2563EB]/20 text-white font-bold'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-sm">{opt.flag}</span>
                  <span className={opt.isRtl ? 'font-arabic' : 'font-sans'}>{opt.label}</span>
                </div>
                {isSelected && <Check size={14} className="text-[#06B6D4]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
