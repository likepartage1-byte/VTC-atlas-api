import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { SupportedLang } from './i18n/translations';
import { SEOHead } from './components/SEOHead';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { OneAppShowcaseSection } from './components/OneAppShowcaseSection';
import { PassengerExperienceSection } from './components/PassengerExperienceSection';
import { DriverExperienceSection } from './components/DriverExperienceSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { ServicesSection } from './components/ServicesSection';
import { SafetySection } from './components/SafetySection';
import { JournalSection } from './components/JournalSection';
import { AppDownloadSection } from './components/AppDownloadSection';
import { FaqSection } from './components/FaqSection';
import { FooterSection } from './components/FooterSection';
import { LegalModal } from './components/LegalModal';
import { JournalPage } from './pages/JournalPage';
import { ArticlePage } from './pages/ArticlePage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);
  return null;
}

// Main home page
function HomePage({ lang }: { lang: SupportedLang }) {
  const titles: Record<SupportedLang, string> = {
    AR: 'Yalla VTC — طريقة أذكى للتنقل',
    FR: 'Yalla VTC — Une façon plus intelligente de se déplacer',
    EN: 'Yalla VTC — A Smarter Way to Get Around',
    ES: 'Yalla VTC — Una forma más inteligente de desplazarse',
  };

  const descriptions: Record<SupportedLang, string> = {
    AR: 'Yalla VTC منصة تنقل رقمية موحدة تجمع الراكب والسائق في تطبيق واحد لتفاوض مباشر، عادل وآمن.',
    FR: 'Yalla VTC est une plateforme de mobilité unifiée réunissant passagers et chauffeurs dans une seule application.',
    EN: 'Yalla VTC is a unified mobility platform bringing passengers and drivers together in one single app for direct, fair rides.',
    ES: 'Yalla VTC es una plataforma de movilidad unificada que une a pasajeros y conductores en una sola app.',
  };

  return (
    <main>
      <SEOHead
        title={titles[lang]}
        description={descriptions[lang]}
        canonicalPath="/"
        ogType="website"
      />
      <HeroSection lang={lang} />
      <OneAppShowcaseSection lang={lang} />
      <PassengerExperienceSection lang={lang} />
      <DriverExperienceSection lang={lang} />
      <HowItWorksSection lang={lang} />
      <SafetySection lang={lang} />
      <ServicesSection lang={lang} />
      <JournalSection lang={lang} />
      <AppDownloadSection lang={lang} />
      <FaqSection lang={lang} />
    </main>
  );
}

// Inner App
function InnerApp() {
  const [lang, setLang] = useState<SupportedLang>('AR');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('yalla_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });
  const [activeLegalModal, setActiveLegalModal] = useState<'terms' | 'privacy' | null>(null);

  // Theme handling
  useEffect(() => {
    const html = document.documentElement;
    if (theme === 'light') {
      html.classList.add('light');
    } else {
      html.classList.remove('light');
    }
    localStorage.setItem('yalla_theme', theme);
  }, [theme]);

  // RTL / LTR handling
  useEffect(() => {
    const html = document.documentElement;
    if (lang === 'AR') {
      html.setAttribute('dir', 'rtl');
      html.setAttribute('lang', 'ar');
    } else {
      html.setAttribute('dir', 'ltr');
      html.setAttribute('lang', lang.toLowerCase());
    }
  }, [lang]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-900 dark:text-white font-sans transition-colors duration-300">
      <ScrollToTop />
      <Navbar
        lang={lang}
        onLanguageChange={setLang}
        theme={theme}
        onThemeToggle={toggleTheme}
      />

      <Routes>
        <Route
          path="/"
          element={<HomePage lang={lang} />}
        />
        <Route
          path="/journal"
          element={<JournalPage lang={lang} />}
        />
        <Route
          path="/journal/:slug"
          element={<ArticlePage lang={lang} />}
        />
        <Route
          path="/about"
          element={<AboutPage lang={lang} />}
        />
        <Route
          path="/contact"
          element={<ContactPage lang={lang} />}
        />
        {/* Fallback */}
        <Route
          path="*"
          element={<HomePage lang={lang} />}
        />
      </Routes>

      <FooterSection
        lang={lang}
        onOpenLegal={(type) => setActiveLegalModal(type)}
      />

      <LegalModal
        type={activeLegalModal}
        lang={lang}
        onClose={() => setActiveLegalModal(null)}
      />
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <InnerApp />
    </BrowserRouter>
  );
}

export default App;
