import React, { useState, useEffect, useRef } from 'react';
import { motion as motionBase, AnimatePresence } from 'framer-motion';
const motion = motionBase as any;
import { CheckCircle2, ShieldEllipsis, RefreshCw, MessageCircle } from 'lucide-react';
import { Button, Input, cn } from './ui';
import api from '../../lib/api';

export const PhoneAuth: React.FC<{ 
  isDarkMode: boolean; 
  onLoginSuccess: () => void; 
  role: 'PASSENGER' | 'DRIVER' | 'ADMIN'; 
}> = ({ isDarkMode, onLoginSuccess, role }) => {
  const [step, setStep] = useState<'input' | 'otp' | 'success'>('input');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [deviceId, setDeviceId] = useState('');
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let interval: any;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  useEffect(() => {
    const storedDeviceId = localStorage.getItem('admin_device_id');
    if (storedDeviceId) {
      setDeviceId(storedDeviceId);
      return;
    }

    const generatedDeviceId = typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? (crypto as any).randomUUID()
      : `web-admin-${Date.now()}`;

    localStorage.setItem('admin_device_id', generatedDeviceId);
    setDeviceId(generatedDeviceId);
  }, []);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post('/auth/otp/request', {
        phoneNumber: `+212${phone.replace(/\s/g, '')}`,
        deviceId,
        role,
      });
      setStep('otp');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to request OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWhatsAppLogin = () => {
    setIsLoading(true);
    // Logic for WhatsApp deep link would go here
    setTimeout(() => setIsLoading(false), 2000);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    if (newOtp.every(v => v !== '')) {
      handleOtpVerify(newOtp.join(''));
    }
  };

  const [simulationStep, setSimulationStep] = useState<string>('');

  const handleOtpVerify = async (code: string) => {
    setIsLoading(true);
    setSimulationStep('Verifying secure session...');
    
    try {
      const response = await api.post('/auth/otp/verify', {
        phoneNumber: `+212${phone.replace(/\s/g, '')}`,
        code,
        deviceId,
        role,
      });

      const { accessToken } = response.data;
      if (!accessToken) {
        throw new Error('Authentication failed.');
      }
      localStorage.setItem('admin_token', accessToken);
      
      setSimulationStep('Authentication successful.');
      setStep('success');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Invalid OTP code');
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
          <CheckCircle2 size={40} />
        </motion.div>
        <div className="space-y-2">
          <h3 className="text-2xl font-black">{role === 'DRIVER' ? 'Welcome Captain.' : 'Welcome Back.'}</h3>
          <p className="text-slate-500 font-medium">
            {role === 'DRIVER' ? 'Secure session established. Get ready to earn.' : 'Your next trip is just a tap away.'}
          </p>
        </div>
        <div className="pt-4">
           <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
             <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: '100%' }} 
                transition={{ duration: 2 }}
                onAnimationComplete={onLoginSuccess}
                className="h-full bg-primary" 
             />
           </div>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {step === 'input' ? (
        <motion.div 
          key="phone-input"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="space-y-6"
        >
          <form onSubmit={handlePhoneSubmit} className="space-y-6">
            <div className="space-y-2">
               <label className="text-xs font-black uppercase tracking-[0.1em] text-slate-400 ml-1">Phone Number</label>
               <div className="flex gap-3">
                  <div className={cn(
                    "flex items-center gap-2 px-4 rounded-2xl border font-bold text-sm bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800",
                    isDarkMode ? "text-white" : "text-slate-900"
                  )}>
                    🇲🇦 +212
                  </div>
                  <Input 
                    placeholder="6 XX XX XX XX" 
                    type="tel"
                    required
                    value={phone}
                    autoFocus
                    onChange={(e) => setPhone(e.target.value)}
                    className="tracking-widest font-black py-4"
                  />
               </div>
            </div>

            <Button 
              variant="luxury"
              className="w-full py-4 text-sm"
              isLoading={isLoading}
              type="submit"
            >
              Continue Journey
            </Button>
          </form>

          <Button 
            variant="secondary" 
            className="w-full py-4 bg-green-500/5 border-green-500/20 text-green-400 hover:bg-green-500/10 group"
            onClick={handleWhatsAppLogin}
          >
            <MessageCircle size={20} className="fill-green-500/10 group-hover:scale-110 transition-transform" />
            Verify with WhatsApp
          </Button>

          <div className="flex gap-3">
            <Button variant="secondary" className="w-full py-4" size="icon">
              <svg className="w-5 h-5 mx-auto" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            </Button>
            <Button variant="secondary" className="w-full py-4 font-black" size="icon">
              <span className="text-xl"></span>
            </Button>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          key="otp-input"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-black">Verify Identity.</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              We sent a code to <span className="text-slate-900 dark:text-white font-bold tracking-widest">+212 {phone}</span>
            </p>
          </div>

          <div className="flex justify-between gap-2 max-w-sm mx-auto">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => { otpRefs.current[idx] = el; }}
                type="text"
                inputMode="numeric"
                value={digit}
                autoFocus={idx === 0}
                onChange={(e) => handleOtpChange(idx, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Backspace' && !digit && idx > 0) {
                    otpRefs.current[idx - 1]?.focus();
                  }
                }}
                className={cn(
                  "w-full h-14 sm:h-16 text-center text-2xl font-black rounded-2xl border transition-all duration-300 outline-none",
                  isDarkMode 
                    ? "bg-slate-900 border-slate-800 text-white focus:border-primary focus:ring-4 focus:ring-primary/10" 
                    : "bg-slate-50 border-slate-200 text-slate-900 focus:border-primary focus:ring-4 focus:ring-primary/10",
                  digit && "border-primary bg-primary/5 ring-4 ring-primary/5 shadow-inner"
                )}
              />
            ))}
          </div>

            <Button 
                variant="luxury"
                className="w-full py-4 text-sm relative overflow-hidden group"
                isLoading={isLoading}
                disabled={otp.some(v => v === '')}
                onClick={() => handleOtpVerify(otp.join(''))}
              >
                {/* Secure Verification Sweep Effect */}
                {isLoading && (
                  <motion.div 
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  Verify Secure Session
                </span>
              </Button>
  
              {/* Trust Indicator */}
              <div className="flex items-center justify-center gap-2 mt-6 opacity-40 group hover:opacity-100 transition-opacity">
                <ShieldEllipsis size={14} className="text-[#06B6D4]" />
                <span className="text-[9px] uppercase font-black tracking-[0.2em] text-slate-300">
                  End-to-End Secure Authentication
                </span>
              </div>

              {isLoading && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[9px] text-[#06B6D4] text-center mt-4 font-black uppercase tracking-[0.3em]"
                >
                  {simulationStep}
                </motion.p>
              )}

          <div className="text-center">
            {timer > 0 ? (
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Resend code in <span className="text-primary">{timer}s</span></p>
            ) : (
              <button 
                onClick={() => setTimer(30)}
                className="flex items-center gap-2 mx-auto text-xs text-primary font-black uppercase tracking-widest hover:text-primary-dark transition-colors"
              >
                <RefreshCw size={14} />
                Resend Code
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
