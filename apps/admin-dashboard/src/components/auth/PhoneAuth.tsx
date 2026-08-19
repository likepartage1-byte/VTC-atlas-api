import React, { useState, useEffect, useRef } from 'react';
import { motion as motionBase, AnimatePresence } from 'framer-motion';
const motion = motionBase as any;
import { CheckCircle2, ShieldEllipsis, RefreshCw } from 'lucide-react';
import { Button, Input, cn } from './ui';
import api from '../../lib/api';
import { TRANSLATIONS } from './LanguageSelector';
import type { SupportedLanguage, TranslationDictionary } from './LanguageSelector';

interface PhoneAuthProps {
  isDarkMode?: boolean;
  onLoginSuccess: () => void;
  lang?: SupportedLanguage;
  translations?: TranslationDictionary;
}

export const PhoneAuth: React.FC<PhoneAuthProps> = ({
  isDarkMode = true,
  onLoginSuccess,
  lang = 'en',
  translations,
}) => {
  const t = translations || TRANSLATIONS[lang] || TRANSLATIONS.en;
  const [step, setStep] = useState<'input' | 'otp' | 'success'>('input');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [role] = useState<'PASSENGER' | 'DRIVER' | 'ADMIN'>('ADMIN');
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let interval: any;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handlePhoneSubmit = async (phoneValue: string) => {
    setIsLoading(true);
    setPhone(phoneValue);

    try {
      let fullPhone = phoneValue.trim();
      if (!fullPhone.startsWith('+')) {
        fullPhone = `+212${fullPhone.replace(/^0/, '')}`;
      }

      await api.post('/auth/otp/request', {
        phoneNumber: fullPhone,
        deviceId: 'admin-dashboard-browser',
      });

      setStep('otp');
      setTimer(60);
    } catch (error: any) {
      alert(error.response?.data?.message || t.networkError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (codeValue?: string) => {
    const finalCode = codeValue || otp.join('');
    if (finalCode.length < 6) return;

    setIsLoading(true);
    try {
      let fullPhone = phone.trim();
      if (!fullPhone.startsWith('+')) {
        fullPhone = `+212${fullPhone.replace(/^0/, '')}`;
      }

      const response = await api.post('/auth/otp/verify', {
        phoneNumber: fullPhone,
        code: finalCode,
        deviceId: 'admin-dashboard-browser',
        role,
      });

      const { accessToken } = response.data;
      if (!accessToken) {
        throw new Error(t.invalidOtpError);
      }
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('admin_token', accessToken);
      localStorage.setItem('token', accessToken);

      setStep('success');
    } catch (error: any) {
      alert(error.response?.data?.message || t.invalidOtpError);
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="text-center py-8 space-y-6">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto"
        >
          <CheckCircle2 size={40} className="text-[#06B6D4]" />
        </motion.div>
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-white">Welcome Back.</h3>
          <p className="text-slate-400 font-medium text-xs">
            Secure session established. Redirecting...
          </p>
        </div>
        <div className="pt-4">
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 2 }}
              onAnimationComplete={onLoginSuccess}
              className="h-full bg-[#2563EB]"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {step === 'input' ? (
        <motion.form
          key="phone-input"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onSubmit={(e) => {
            e.preventDefault();
            handlePhoneSubmit(phone);
          }}
          className="space-y-6"
        >
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-[0.1em] text-slate-400">
              {t.phoneLabel}
            </label>
            <div className="flex gap-3">
              <div
                className={cn(
                  'flex items-center gap-2 px-4 rounded-2xl border font-bold text-sm bg-[#0F172A] border-white/10 text-white'
                )}
              >
                🇲🇦 +212
              </div>
              <Input
                placeholder={t.phonePlaceholder}
                type="tel"
                required
                value={phone}
                autoFocus
                onChange={(e: any) => setPhone(e.target.value)}
                className="tracking-widest font-black py-4"
              />
            </div>
          </div>

          <Button
            className="w-full py-4 text-sm font-black tracking-widest shadow-xl flex items-center justify-center gap-2"
            isLoading={isLoading}
            type="submit"
          >
            <span>{t.sendCodeBtn}</span>
          </Button>
        </motion.form>
      ) : (
        <motion.div
          key="otp-input"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="text-center space-y-2">
            <h3 className="text-xl font-black text-white">{t.otpInputLabel}</h3>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Sent to <span className="text-white font-bold tracking-widest">+212 {phone}</span>
            </p>
          </div>

          <div className="flex justify-center gap-2" dir="ltr">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  otpRefs.current[index] = el;
                }}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={cn(
                  'w-12 h-14 text-center text-xl font-mono font-bold rounded-2xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#2563EB]',
                  isDarkMode
                    ? 'bg-[#0F172A] border-white/10 text-white focus:border-[#2563EB]'
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#2563EB]'
                )}
              />
            ))}
          </div>

          <div className="flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => setStep('input')}
              className="text-slate-400 hover:text-white font-bold transition-colors"
            >
              {t.backBtn}
            </button>

            <button
              disabled={timer > 0 || isLoading}
              onClick={() => handlePhoneSubmit(phone)}
              className="flex items-center gap-1.5 text-[#06B6D4] font-bold disabled:opacity-40 hover:underline"
            >
              <RefreshCw size={12} className={timer > 0 ? 'animate-spin' : ''} />
              {timer > 0 ? t.resendCooldown.replace('{seconds}', String(timer)) : t.resendBtn}
            </button>
          </div>

          <Button
            className="w-full py-4 text-sm font-black tracking-widest flex items-center justify-center gap-2"
            isLoading={isLoading}
            onClick={() => handleVerifyOtp()}
          >
            <ShieldEllipsis size={18} />
            <span>{t.verifyBtn}</span>
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
