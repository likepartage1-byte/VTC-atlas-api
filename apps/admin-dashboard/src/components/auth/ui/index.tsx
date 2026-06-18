import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'luxury', size?: 'sm' | 'md' | 'lg' | 'icon', isLoading?: boolean }
>(({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
  const variants = {
    primary: "bg-[#2563EB] text-white hover:bg-[#3B82F6] shadow-[0_8px_20px_-6px_rgba(37,99,235,0.4)] disabled:bg-slate-700 font-bold transition-all active:scale-[0.98]",
    luxury: "bg-gradient-to-r from-[#2563EB] to-[#06B6D4] text-white hover:brightness-110 shadow-[0_8px_30px_-6px_rgba(37,99,235,0.5)] font-black uppercase tracking-widest transition-all active:scale-[0.98]",
    secondary: "bg-[#1F2937] text-white border border-[#374151] hover:bg-[#2D3748] transition-all font-bold",
    ghost: "bg-transparent hover:bg-white/5 text-slate-400 hover:text-white transition-all font-bold",
  };

  const sizes = {
    sm: "px-4 py-2 text-xs rounded-xl",
    md: "px-6 py-4 text-sm rounded-2xl",
    lg: "px-10 py-5 text-base rounded-2xl",
    icon: "p-4 rounded-2xl",
  };

  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-3 transition-colors disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : children}
    </button>
  );
});

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }
>(({ className, label, error, ...props }, ref) => {
  return (
    <div className="relative group w-full">
      <input
        ref={ref}
        className={cn(
          "peer w-full px-5 pt-6 pb-2 rounded-2xl border border-[#374151] bg-[#111827] text-white",
          "placeholder-transparent focus:placeholder-slate-500",
          "focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 outline-none transition-all duration-300",
          error && "border-red-500/50 focus:border-red-500 focus:ring-red-500/10",
          className
        )}
        placeholder={label}
        {...props}
      />
      {label && (
        <label className={cn(
          "absolute left-5 top-1.5 text-[10px] uppercase font-black tracking-widest text-[#9CA3AF] transition-all duration-200",
          "peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:font-bold peer-placeholder-shown:text-[#6B7280]",
          "peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:font-black peer-focus:text-[#2563EB]"
        )}>
          {label}
        </label>
      )}
      {error && (
        <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest mt-1.5 ml-2">
          {error}
        </p>
      )}
    </div>
  );
});
