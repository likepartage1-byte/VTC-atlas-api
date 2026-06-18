import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  MapPin, 
  Smartphone, 
  Mail, 
  Apple, 
  ChevronLeft,
  Navigation,
  Globe,
  Wind
} from 'lucide-react';
import { Button, cn } from './ui';
import { PhoneAuth } from './PhoneAuth';
import { EmailAuth } from './EmailAuth';
import { RoleSelection, LanguageSelector } from './RoleSelection';

export const AuthPage: React.FC<{ onLoginSuccess: () => void }> = ({ onLoginSuccess }) => {
  const [authMethod, setAuthMethod] = useState<'selection' | 'phone' | 'email'>('selection');
  const [role, setRole] = useState<'PASSENGER' | 'DRIVER'>('PASSENGER');
  const [lang, setLang] = useState('EN');

  return (
    <div className="min-h-screen w-full flex bg-[#05080F] text-white font-sans selection:bg-[#2563EB]/40 overflow-hidden">
      
      {/* --- Ambient Background Layers with Subtle Parallax --- */}
      <motion.div 
        initial={{ scale: 1.02 }}
        animate={{ x: [0, 4, 0], y: [0, 2, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
      >
        {/* Soft Blue/Cyan City Glow */}
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-[#2563EB]/5 blur-[160px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#06B6D4]/5 blur-[140px] rounded-full" />
        
        {/* Dainty Particle Stars */}
        <div className="absolute inset-0 z-0 opacity-20">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-px h-px bg-white rounded-full"
              style={{ top: `${Math.random()*100}%`, left: `${Math.random()*100}%` }}
            />
          ))}
        </div>

        {/* Live Network Nodes (Thin & Professional) */}
        <div className="absolute inset-0 z-10 opacity-[0.1]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            {[...Array(20)].map((_, i) => {
              const x1 = Math.random()*1000;
              const y1 = Math.random()*1000;
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
                    transition={{ duration: 5 + Math.random()*10, repeat: Infinity }}
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Floating Pins with Refined Energy Pulse */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute flex items-center justify-center"
            style={{ 
               top: `${20 + Math.random()*60}%`, 
               left: `${20 + Math.random()*60}%` 
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

      {/* --- Main Content Layout (Focused & Minimalist) --- */}
      <div className="relative z-20 w-full flex flex-col items-center justify-center p-6 lg:p-12">
        
        {/* Clean Header: Brand + Slogan Only */}
        <header className="mb-10 text-center space-y-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-white font-black text-2xl tracking-tighter uppercase italic"
          >
            Atlas
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[#06B6D4] font-black uppercase tracking-[0.4em] text-[8px] opacity-80"
          >
            Move Smarter
          </motion.p>
        </header>

        {/* --- Focused Auth Card --- */}
        <motion.main 
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full max-w-[400px] relative"
        >
          <div className="absolute inset-0 bg-[#0B1220]/60 backdrop-blur-3xl rounded-[24px] border border-white/5 z-0" />
          
          <div className="relative z-10 p-8 sm:p-10 space-y-8">
            <AnimatePresence mode="wait">
              {authMethod === 'selection' && (
                <motion.div 
                  key="selection"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-8"
                >
                  <PhoneAuth 
                     isDarkMode={true} 
                     onLoginSuccess={onLoginSuccess} 
                     role={role} 
                  />
                  
                  {/* Integrated Language Selection - Primary Secondary Action */}
                  <div className="pt-2">
                    <LanguageSelector current={lang} onSelect={setLang} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.main>

        {/* Minimalist Global Footer */}
        <footer className="mt-12 flex flex-col items-center gap-6">
          <div className="flex gap-10 text-[10px] uppercase font-black tracking-[0.3em] text-slate-700">
             <a href="#" className="hover:text-white transition-colors">Privacy</a>
             <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
          
          <button className="text-[11px] font-bold text-slate-500 hover:text-white transition-colors">
            Having trouble? Get Help
          </button>

          <div className="flex items-center gap-2 text-[8px] uppercase font-black tracking-[0.4em] text-slate-800">
            <ShieldCheck size={12} className="text-[#06B6D4]" />
            Enterprise-Grade Security
          </div>
        </footer>
      </div>
    </div>
  );
};
