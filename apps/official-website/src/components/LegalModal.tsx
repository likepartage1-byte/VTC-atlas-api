import React from 'react';
import { X, Shield, FileText, AlertTriangle } from 'lucide-react';
import { SupportedLang } from '../i18n/translations';

interface LegalModalProps {
  type: 'terms' | 'privacy' | null;
  lang: SupportedLang;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, lang, onClose }) => {
  if (!type) return null;

  const isAr = lang === 'AR';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-slate-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold">
              {type === 'terms' ? <FileText size={20} /> : <Shield size={20} />}
            </div>
            <div>
              <h3 className="text-lg font-black text-white">
                {type === 'terms'
                  ? (isAr ? 'مسودة شروط الخدمة والتعاقد' : 'Draft Terms of Service')
                  : (isAr ? 'مسودة سياسة الخصوصية وحماية البيانات' : 'Draft Privacy Policy')}
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold inline-flex items-center gap-1 mt-1">
                <AlertTriangle size={10} />
                <span>{isAr ? 'مسودة قانونية قيد الاعتماد الرسمي' : 'Legal Draft Pending Final Approval'}</span>
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-4 text-xs font-medium leading-relaxed text-slate-300">
          {type === 'terms' ? (
            <>
              <p>
                {isAr
                  ? 'تحدد هذه الوثيقة الشروط التجريبية والاسترشادية لاستخدام منصة Yalla VTC في المملكة المغربية. يتم التفاوض على أسعار الرحلات مباشرة بين الراكب والسائق بدون أي تدخل قسري في تحديد التعرفة من قبل المنصة.'
                  : 'This document defines the trial and indicative terms of use for the Yalla VTC platform in Morocco. Ride prices are negotiated directly between passenger and driver without platform fare fixing.'}
              </p>
              <h4 className="text-sm font-bold text-white pt-2">
                {isAr ? '1. آلية التفاوض العادل (Counter-Bidding)' : '1. Fair Counter-Bidding Mechanism'}
              </h4>
              <p>
                {isAr
                  ? 'يقوم الراكب باقتراح تعرفة الرحلة، ويحق للسائق قبول العرض أو تقديم عرض مضاد. العقد المبرم هو عقد مباشر بين الطرفين.'
                  : 'Passengers offer ride fares and drivers retain full freedom to accept or present counter-offers. The contract is agreed directly between both parties.'}
              </p>
              <h4 className="text-sm font-bold text-white pt-2">
                {isAr ? '2. برنامج رصيد السائقين والحوافز' : '2. Driver Credit & Incentive Program Terms'}
              </h4>
              <p>
                {isAr
                  ? 'يخضع عرض الرصيد التجريبي (10 MAD) والرصيد التحفيزي (حتى 600 MAD) لشروط الأهلية المعتمدة في البرنامج. يتم إضافة الرصيد التحفيزي إلى رصيد السائق داخل نظام Yalla VTC عند استيفاء إتمام 6 طلبات ناجحة خلال 15 يوماً، ولا يعتبر هذا الرصيد دخلاً نقدياً ثابتاً أو تحويلاً بنكياً مباشراً.'
                  : 'The 10 MAD Trial Credit and up to 600 MAD Promotional Credit are subject to program eligibility conditions. Credits are added to the driver balance inside Yalla VTC upon completing 6 successful rides within 15 days and do not constitute fixed cash income or direct bank transfers.'}
              </p>
              <h4 className="text-sm font-bold text-white pt-2">
                {isAr ? '3. النزاهة والأمان وأكواد OTP' : '3. Integrity & OTP Verification Security'}
              </h4>
              <p>
                {isAr
                  ? 'تلتزم المنصة بتوفير رمز أمان OTP فريد لكل رحلة، ويُمنع بدء الرحلة قبل إدخال الرمز لتفادي الانتحال وضمان أمان الركاب.'
                  : 'The platform provides a unique OTP verification code for every ride. Trips start strictly after code entry to prevent impersonation.'}
              </p>
            </>
          ) : (
            <>
              <p>
                {isAr
                  ? 'تلتزم منصة Yalla VTC بحماية البيانات الشخصية للمستخدمين والسائقين وفق القوانين المغربية لحماية المعطيات ذات الطابع الشخصي (القانون 09-08).'
                  : 'Yalla VTC is committed to protecting user and driver personal data in full compliance with Moroccan Law 09-08 on personal data protection.'}
              </p>
              <h4 className="text-sm font-bold text-white pt-2">
                {isAr ? '1. البيانات المجمعة' : '1. Collected Personal Data'}
              </h4>
              <p>
                {isAr
                  ? 'تشمل البيانات المجمعة: الاسم الكامل، رقم الهاتف، الموقع الجغرافي المباشر أثناء الرحلة، والوثائق الرسمية المرفوعة من قبل السائقين (رخصة السياقة، البطاقة الوطنية).'
                  : 'Collected data includes full name, phone number, real-time GPS telemetry during rides, and driver inspection documents (license, national ID).'}
              </p>
              <h4 className="text-sm font-bold text-white pt-2">
                {isAr ? '2. حماية وتشفير البيانات' : '2. Data Security & Encryption'}
              </h4>
              <p>
                {isAr
                  ? 'يتم تخزين المعطيات على قواعد بيانات مشفرة، ولا يتم مشاركتها مع أي طرف ثالث إلا للضرورات الأمنية والقانونية.'
                  : 'All data is secured on encrypted databases and is never disclosed to third parties except for safety or legal compliance.'}
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors"
          >
            {isAr ? 'إغلاق Window' : 'Close Window'}
          </button>
        </div>
      </div>
    </div>
  );
};
