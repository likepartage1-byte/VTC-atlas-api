import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, UserCheck } from 'lucide-react';
import { Button, Input, cn } from './ui';

export const EmailAuth: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 2000);
  };

  if (isSuccess) {
    return (
      <div className="text-center py-8 space-y-6">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-500 mx-auto"
        >
          <UserCheck size={40} />
        </motion.div>
        <div className="space-y-2">
          <h3 className="text-2xl font-black">Success.</h3>
          <p className="text-slate-500 font-medium">Account validated. Welcome back.</p>
        </div>
        <div className="pt-4">
           <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
             <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: '100%' }} 
                transition={{ duration: 1.5 }}
                className="h-full bg-indigo-600" 
             />
           </div>
        </div>
      </div>
    );
  }

  return (
    <motion.form 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      <div className="space-y-4">
        <Input 
          label="Corporate Email" 
          placeholder="name@atlas-vtc.com" 
          type="email"
          required
          autoFocus
        />
        
        <div className="relative">
          <Input 
            label="Security Password" 
            placeholder="••••••••" 
            type={showPassword ? "text" : "password"}
            required
            className="pr-12"
          />
          <button 
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-9 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 cursor-pointer group">
          <div className="w-4 h-4 rounded border border-slate-300 dark:border-slate-700 flex items-center justify-center group-hover:border-indigo-500 transition-colors">
            <div className="w-2 h-2 bg-indigo-500 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Keep Secure Session</span>
        </div>
        <button type="button" className="text-xs text-indigo-500 font-black uppercase tracking-wider hover:text-indigo-600 transition-colors">
          Forgot Path?
        </button>
      </div>

      <div className="bg-slate-500/5 p-4 rounded-2xl border border-slate-500/10 flex items-start gap-3">
         <Lock size={18} className="text-slate-400 shrink-0 mt-0.5" />
         <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider leading-relaxed">
           Identity Gateway: 256-bit encryption active. Your session is monitored for platform integrity and physical safety.
         </p>
      </div>

      <Button 
        className="w-full py-4 font-black tracking-widest text-base shadow-indigo-500/10 shadow-xl"
        isLoading={isLoading}
        type="submit"
      >
        ACCESS PLATFORM
      </Button>
    </motion.form>
  );
};
