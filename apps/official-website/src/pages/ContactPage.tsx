import React, { useState } from 'react';
import { SupportedLang } from '../i18n/translations';
import { SEOHead } from '../components/SEOHead';
import { Mail, MessageSquare, ShieldCheck, Send, CheckCircle2, Sparkles } from 'lucide-react';

interface ContactPageProps {
  lang: SupportedLang;
}

export const ContactPage: React.FC<ContactPageProps> = ({ lang }) => {
  const isAr = lang === 'AR';
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: 'general', message: '' });

  const titles: Record<SupportedLang, string> = {
    AR: 'تواصل معنا — Yalla VTC',
    FR: 'Contactez-nous — Yalla VTC',
    EN: 'Contact Us — Yalla VTC',
    ES: 'Contacto — Yalla VTC',
  };

  const descriptions: Record<SupportedLang, string> = {
    AR: 'تواصل مع فريق Yalla VTC للاستفسارات العامة، الشراكات التجارية، أو الدعم.',
    FR: 'Contactez l’équipe Yalla VTC pour toute question générale, partenariat ou assistance.',
    EN: 'Get in touch with the Yalla VTC team for general inquiries, business partnerships, or support.',
    ES: 'Póngase en contacto con el equipo de Yalla VTC.',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.email && formData.message) {
      setSubmitted(true);
    }
  };

  return (
    <main className="py-16 sm:py-24 relative overflow-hidden">
      <SEOHead
        title={titles[lang]}
        description={descriptions[lang]}
        canonicalPath="/contact"
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">

        {/* Header */}
        <div className="text-center space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-black">
            <Sparkles size={14} />
            <span>{isAr ? 'تواصل معنا' : 'Get in Touch'}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            {isAr ? 'تواصل مع فريق Yalla VTC' : 'Contact Yalla VTC Team'}
          </h1>

          <p className="text-slate-400 text-base max-w-xl mx-auto font-medium leading-relaxed">
            {isAr
              ? 'نحن هنا للإجابة على استفساراتك العامة، الترتيب للشراكات الرقمية، ومساعدة الإعلاميين.'
              : 'We are here to answer your general inquiries, assist with media requests, and discuss digital partnerships.'}
          </p>
        </div>

        {/* Channels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">

          {/* In-app Support */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <MessageSquare size={20} />
            </div>
            <h3 className="text-base font-black text-white">{isAr ? 'الدعم والمساعدة للرحلات' : 'Ride Support'}</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              {isAr
                ? 'للدعم الفني السريع أثناء الرحلة، يرجى التوجه لمركز المساعدة المباشر داخل تطبيق Yalla VTC.'
                : 'For instant ride assistance, please access live support directly inside the Yalla VTC App.'}
            </p>
            <span className="inline-block text-[11px] font-bold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-lg">
              {isAr ? 'متاح داخل التطبيق 24/7' : 'In-App 24/7'}
            </span>
          </div>

          {/* Partnerships */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Mail size={20} />
            </div>
            <h3 className="text-base font-black text-white">{isAr ? 'الشراكات والاستثمار' : 'Partnerships'}</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              {isAr
                ? 'لفرص التعاون المؤسسي والتكامل التقني، يرجى التواصل عبر البريد المخصص:'
                : 'For enterprise partnerships and technical integrations, email us at:'}
            </p>
            <a href="mailto:contact@yallavtc.com" className="text-xs font-bold text-emerald-400 hover:underline block pt-1">
              contact@yallavtc.com
            </a>
          </div>

          {/* Media & Press */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-base font-black text-white">{isAr ? 'الإعلام والصحافة' : 'Media & Press'}</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              {isAr
                ? 'للاستفسارات الصحفية والتصريحات الإعلامية الرسمية:'
                : 'For press inquiries and media relations:'}
            </p>
            <a href="mailto:media@yallavtc.com" className="text-xs font-bold text-indigo-400 hover:underline block pt-1">
              media@yallavtc.com
            </a>
          </div>
        </div>

        {/* Contact Form */}
        <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 max-w-2xl mx-auto shadow-2xl">
          {submitted ? (
            <div className="text-center py-8 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-xl font-black text-white">
                {isAr ? 'تم استلام رسالتك بنجاح' : 'Message Received'}
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {isAr ? 'شكراً لتواصلك معنا. سيقوم فريقنا بالرد على بريدك خلال 24 ساعة.' : 'Thank you for reaching out. Our team will get back to you within 24 hours.'}
              </p>
              <button
                onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', subject: 'general', message: '' }); }}
                className="mt-4 px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold text-slate-300 hover:text-white"
              >
                {isAr ? 'إرسال رسالة أخرى' : 'Send Another Message'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="text-lg font-black text-white mb-2">
                {isAr ? 'نموذج التواصل السريع' : 'Quick Inquiry Form'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {isAr ? 'الاسم الكامل' : 'Full Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-white focus:border-purple-500 focus:outline-none"
                    placeholder={isAr ? 'أدخل اسمك' : 'Your name'}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    {isAr ? 'البريد الإلكتروني' : 'Email Address'}
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-white focus:border-purple-500 focus:outline-none"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  {isAr ? 'الرسالة' : 'Message'}
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium text-white focus:border-purple-500 focus:outline-none"
                  placeholder={isAr ? 'اكتب استفسارك هنا...' : 'Write your message here...'}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-purple-600/20 transition-all flex items-center justify-center gap-2"
              >
                <Send size={14} />
                <span>{isAr ? 'إرسال الرسالة' : 'Send Message'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
};
