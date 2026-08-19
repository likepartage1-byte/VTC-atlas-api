import React, { useState } from 'react';
import { motion as motionBase, AnimatePresence } from 'framer-motion';
const motion = motionBase as any;
import { ShieldCheck, MapPin, Mail, Phone } from 'lucide-react';
import { EmailAuth } from './EmailAuth';
import { PhoneAuth } from './PhoneAuth';
import { LanguageSelector, TRANSLATIONS } from './LanguageSelector';
import type { SupportedLanguage } from './LanguageSelector';

export const AuthPage: React.FC<{ onLoginSuccess: () => void }> = ({ onLoginSuccess }) => {
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [lang, setLang] = useState<SupportedLanguage>('en');

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const isRtl = lang === 'ar';

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="min-h-screen w-full flex bg-[#05080F] text-white font-sans selection:bg-[#2563EB]/40 overflow-hidden"
    >
      {/* --- Ambient Background Layers --- */}
      <motion.div
        initial={{ scale: 1.02 }}
        animate={{ x: [0, 4, 0], y: [0, 2, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
      >
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-[#2563EB]/5 blur-[160px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#06B6D4]/5 blur-[140px] rounded-full" />

        {/* Dainty Particle Stars */}
        <div className="absolute inset-0 z-0 opacity-20">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-px h-px bg-white rounded-full"
              style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
            />
          ))}
        </div>

        {/* Live Network Nodes */}
        <div className="absolute inset-0 z-10 opacity-[0.1]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            {[...Array(20)].map((_, i) => {
              const x1 = Math.random() * 1000;
              const y1 = Math.random() * 1000;
              const x2 = x1 + (Math.random() - 0.5) * 100;
              const y2 = y1 + (Math.random() - 0.5) * 100;
              return (
                <g key={i}>
                  <circle cx={x1} cy={y1} r="0.5" fill="#06B6D4" />
                  <motion.path
                    d={`M ${x1} ${y1} L ${x2} ${y2}`}
                    stroke="#2563EB"
                    strokeWidth="0.5"
                    strokeOpacity="0.3"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: [0, 1, 0] }}
                    transition={{ duration: 5 + Math.random() * 10, repeat: Infinity }}
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Floating Pins */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute flex items-center justify-center"
            style={{
              top: `${20 + Math.random() * 60}%`,
              left: `${20 + Math.random() * 60}%`,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.1, 0.4, 0.1] }}
            transition={{ duration: 8, repeat: Infinity, delay: i * 2 }}
          >
            <MapPin size={24} className="text-[#06B6D4]/30" />
            <div className="absolute w-12 h-12 border border-[#06B6D4]/10 rounded-full animate-ping" />
          </motion.div>
        ))}
      </motion.div>

      {/* --- Main Content Layout --- */}
      <div className="relative z-20 w-full flex flex-col items-center justify-center p-6 lg:p-12">
        {/* Header: Brand + Slogan */}
        <header className="mb-8 text-center space-y-3">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-white font-black text-3xl tracking-tighter uppercase italic"
          >
            {t.brandTitle}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[#06B6D4] font-black uppercase tracking-[0.4em] text-[9px] opacity-90"
          >
            {t.brandTagline}
          </motion.p>
        </header>

        {/* --- Focused Auth Card --- */}
        <motion.main
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full max-w-[420px] relative"
        >
          <div className="absolute inset-0 bg-[#0B1220]/75 backdrop-blur-3xl rounded-[28px] border border-white/10 shadow-2xl z-0" />

          <div className="relative z-10 p-7 sm:p-9 space-y-7">
            {/* Method Switcher Tabs */}
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-white/5 border border-white/10 gap-1">
              <button
                type="button"
                onClick={() => setAuthMethod('email')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                  authMethod === 'email'
                    ? 'bg-[#2563EB] text-white shadow-lg shadow-[#2563EB]/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Mail size={15} />
                <span>{t.emailTab}</span>
              </button>

              <button
                type="button"
                onClick={() => setAuthMethod('phone')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                  authMethod === 'phone'
                    ? 'bg-[#2563EB] text-white shadow-lg shadow-[#2563EB]/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Phone size={15} />
                <span>{t.phoneTab}</span>
              </button>
            </div>

            {/* Auth Form Flow */}
            <AnimatePresence mode="wait">
              {authMethod === 'email' ? (
                <motion.div
                  key="email-auth"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <EmailAuth
                    isDarkMode={true}
                    onLoginSuccess={onLoginSuccess}
                    lang={lang}
                    translations={t}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="phone-auth"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <PhoneAuth
                    isDarkMode={true}
                    onLoginSuccess={onLoginSuccess}
                    lang={lang}
                    translations={t}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer Bar inside Auth Card: Language Selector Trigger */}
            <div className="pt-2 flex items-center justify-between border-t border-white/5">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                YALLA VTC Gateway
              </span>
              <LanguageSelector currentLang={lang} onSelectLang={setLang} />
            </div>
          </div>
        </motion.main>

        {/* Global Footer */}
        <footer className="mt-10 flex flex-col items-center gap-5">
          <div className="flex gap-8 text-[10px] uppercase font-black tracking-[0.3em] text-slate-600">
            <a href="#" className="hover:text-white transition-colors">
              {t.privacy}
            </a>
            <a href="#" className="hover:text-white transition-colors">
              {t.terms}
            </a>
          </div>

          <button className="text-[11px] font-bold text-slate-500 hover:text-white transition-colors">
            {t.help}
          </button>

          <div className="flex items-center gap-2 text-[8px] uppercase font-black tracking-[0.4em] text-slate-700">
            <ShieldCheck size={13} className="text-[#06B6D4]" />
            {t.securityBadge}
          </div>
        </footer>
      </div>
    </div>
  );
};
