import React from 'react';
import { motion } from 'framer-motion';
import { User, Car, Globe } from 'lucide-react';
import { cn } from './ui';

interface RoleSelectionProps {
  selectedRole: 'PASSENGER' | 'DRIVER';
  onSelect: (role: 'PASSENGER' | 'DRIVER') => void;
}

export const RoleSelection: React.FC<RoleSelectionProps> = ({ selectedRole, onSelect }) => {
  return (
    <div className="grid grid-cols-2 gap-3 mb-8">
      <button
        onClick={() => onSelect('PASSENGER')}
        className={cn(
          "relative flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-300",
          selectedRole === 'PASSENGER' 
            ? "border-primary bg-primary/5 text-primary shadow-sm" 
            : "border-slate-100 bg-white text-slate-500 hover:border-slate-200"
        )}
      >
        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", selectedRole === 'PASSENGER' ? "bg-primary text-white" : "bg-slate-100 text-slate-400")}>
          <User size={20} />
        </div>
        <span className="text-sm font-bold uppercase tracking-wider">Passenger</span>
        {selectedRole === 'PASSENGER' && (
          <motion.div layoutId="active-role" className="absolute -bottom-1 left-4 right-4 h-1 bg-primary rounded-full" />
        )}
      </button>

      <button
        onClick={() => onSelect('DRIVER')}
        className={cn(
          "relative flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-300",
          selectedRole === 'DRIVER' 
            ? "border-primary bg-primary/5 text-primary shadow-sm" 
            : "border-slate-100 bg-white text-slate-500 hover:border-slate-200"
        )}
      >
        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", selectedRole === 'DRIVER' ? "bg-primary text-white" : "bg-slate-100 text-slate-400")}>
          <Car size={20} />
        </div>
        <span className="text-sm font-bold uppercase tracking-wider">Driver</span>
        {selectedRole === 'DRIVER' && (
          <motion.div layoutId="active-role" className="absolute -bottom-1 left-4 right-4 h-1 bg-primary rounded-full" />
        )}
      </button>
    </div>
  );
};

export const LanguageSelector: React.FC<{ current: string; onSelect: (l: string) => void }> = ({ current, onSelect }) => {
  const langs = [
    { code: 'FR', label: 'Français' },
    { code: 'AR', label: 'العربية' },
    { code: 'EN', label: 'English' }
  ];

  return (
    <div className="flex justify-center gap-4 mt-8">
      {langs.map(l => (
        <button
          key={l.code}
          onClick={() => onSelect(l.code)}
          className={cn(
            "text-xs font-black tracking-widest transition-colors",
            current === l.code ? "text-primary border-b-2 border-primary pb-0.5" : "text-slate-400 hover:text-slate-600"
          )}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
};
