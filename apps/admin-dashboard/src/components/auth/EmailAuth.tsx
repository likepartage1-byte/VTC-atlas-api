import React, { useState, useEffect } from 'react';
import { motion as motionBase } from 'framer-motion';
const motion = motionBase as any;
import { Mail, KeyRound, ShieldCheck, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { Button, Input } from './ui';
import { TRANSLATIONS } from './LanguageSelector';
import type { SupportedLanguage, TranslationDictionary } from './LanguageSelector';

interface EmailAuthProps {
  isDarkMode?: boolean;
  onLoginSuccess: () => void;
  lang?: SupportedLanguage;
  translations?: TranslationDictionary;
}

export const EmailAuth: React.FC<EmailAuthProps> = ({
  onLoginSuccess,
  lang = 'en',
  translations,
}) => {
  const t = translations || TRANSLATIONS[lang] || TRANSLATIONS.en;
  const [step, setStep] = useState<'EMAIL' | 'OTP'>('EMAIL');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer: any;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const getApiUrl = (path: string) => {
    const envBase = import.meta.env.VITE_API_URL;
    if (!envBase || envBase.includes('187.124.34.118')) {
      return path.startsWith('/') ? path : `/${path}`;
    }
    let base = envBase.replace(/\/api\/v1\/?$/, '').replace(/\/+$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${cleanPath}`;
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError(t.emailLabel);
      return;
    }

    setIsLoading(true);
    setError(null);
    setInfoMessage(null);

    try {
      const endpoint = getApiUrl('/api/v1/auth/admin/email/request');
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {}

      if (!res.ok) {
        throw new Error(data.message || t.networkError);
      }

      setInfoMessage(data.message || t.otpSentMessage);
      setStep('OTP');
      setCooldown(60);
    } catch (err: any) {
      setError(err.message || t.networkError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.trim().length !== 6) {
      setError(t.otpInputLabel);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const endpoint = getApiUrl('/api/v1/auth/admin/email/verify');
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: code.trim(),
          deviceId: 'admin-dashboard-browser',
        }),
      });

      const text = await res.text();
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {}

      if (!res.ok) {
        throw new Error(data.message || t.invalidOtpError);
      }

      // Store Tokens
      if (data.accessToken) {
        localStorage.setItem('access_token', data.accessToken);
        localStorage.setItem('admin_token', data.accessToken);
        localStorage.setItem('token', data.accessToken);
      }
      if (data.refreshToken) {
        localStorage.setItem('refresh_token', data.refreshToken);
      }
      if (data.user) {
        localStorage.setItem('admin_user', JSON.stringify(data.user));
      }

      onLoginSuccess();
    } catch (err: any) {
      setError(err.message || t.invalidOtpError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-start gap-2 text-red-400 text-xs">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {infoMessage && step === 'OTP' && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl flex items-start gap-2 text-emerald-400 text-xs">
          <ShieldCheck size={16} className="shrink-0 mt-0.5" />
          <span>{infoMessage}</span>
        </div>
      )}

      {step === 'EMAIL' ? (
        <form onSubmit={handleRequestOtp} className="space-y-6">
          <div className="space-y-4">
            <Input
              label={t.emailLabel}
              placeholder={t.emailPlaceholder}
              type="email"
              value={email}
              onChange={(e: any) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="bg-slate-500/5 p-4 rounded-2xl border border-slate-500/10 flex items-start gap-3">
            <Mail size={18} className="text-[#06B6D4] shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-relaxed">
              {t.otpBadgeTitle}
            </p>
          </div>

          <Button
            className="w-full py-4 font-black tracking-widest text-sm shadow-indigo-500/10 shadow-xl flex items-center justify-center gap-2"
            isLoading={isLoading}
            type="submit"
          >
            <span>{t.sendCodeBtn}</span>
            <ArrowRight size={16} className={lang === 'ar' ? 'rotate-180' : ''} />
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-6">
          <div className="space-y-4">
            <div className="text-xs text-slate-400 font-medium">
              Verification code sent to <strong className="text-white">{email}</strong>
            </div>

            <Input
              label={t.otpInputLabel}
              placeholder="123456"
              type="text"
              maxLength={6}
              value={code}
              onChange={(e: any) => setCode(e.target.value.replace(/\D/g, ''))}
              required
              autoFocus
              className="text-center font-mono tracking-[0.5em] text-lg"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <button
              type="button"
              onClick={() => {
                setStep('EMAIL');
                setError(null);
                setCode('');
              }}
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <span>{t.backBtn}</span>
            </button>

            <button
              type="button"
              disabled={cooldown > 0 || isLoading}
              onClick={handleRequestOtp}
              className="flex items-center gap-1 text-[#06B6D4] font-bold disabled:opacity-40 hover:underline"
            >
              <RefreshCw size={12} className={cooldown > 0 ? 'animate-spin' : ''} />
              {cooldown > 0
                ? t.resendCooldown.replace('{seconds}', String(cooldown))
                : t.resendBtn}
            </button>
          </div>

          <Button
            className="w-full py-4 font-black tracking-widest text-sm shadow-indigo-500/10 shadow-xl flex items-center justify-center gap-2"
            isLoading={isLoading}
            type="submit"
          >
            <KeyRound size={16} />
            <span>{t.verifyBtn}</span>
          </Button>
        </form>
      )}
    </motion.div>
  );
};
