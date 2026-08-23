import { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import { RefreshCw, Loader2 } from 'lucide-react';
import { AuthPage } from './components/auth/AuthPage';
import api from './lib/api';
import { ControlCenterShell } from './components/layout/ControlCenterShell';
import { CommandCenterView } from './components/dashboard/CommandCenterView';

// Lazy-loaded sub-modules for performance & chunk code-splitting
const OperationsCenter = lazy(() => import('./modules/operations/OperationsCenter').then(m => ({ default: m.OperationsCenter })));
const AuditCenter = lazy(() => import('./modules/audit/AuditCenter').then(m => ({ default: m.AuditCenter })));
const PendingVerificationsTable = lazy(() => import('./modules/drivers/PendingVerificationsTable').then(m => ({ default: m.PendingVerificationsTable })));
const DriversManagementTable = lazy(() => import('./modules/drivers/DriversManagementTable').then(m => ({ default: m.DriversManagementTable })));
const PassengersManagementTable = lazy(() => import('./modules/passengers/PassengersManagementTable').then(m => ({ default: m.PassengersManagementTable })));
const RidesCenterTable = lazy(() => import('./modules/rides/RidesCenterTable').then(m => ({ default: m.RidesCenterTable })));
const FinancialLedgerCenter = lazy(() => import('./modules/financial/FinancialLedgerCenter').then(m => ({ default: m.FinancialLedgerCenter })));
const SupportCenterTable = lazy(() => import('./modules/support/SupportCenterTable').then(m => ({ default: m.SupportCenterTable })));
const IntegrityCenterTable = lazy(() => import('./modules/integrity/IntegrityCenterTable').then(m => ({ default: m.IntegrityCenterTable })));
const SettingsCenterForm = lazy(() => import('./modules/settings/SettingsCenterForm').then(m => ({ default: m.SettingsCenterForm })));
const HomepageBuilderShell = lazy(() => import('./modules/website/HomepageBuilderShell').then(m => ({ default: m.HomepageBuilderShell })));
const ControlCenterBuilderShell = lazy(() => import('./modules/builder/ControlCenterBuilderShell').then(m => ({ default: m.ControlCenterBuilderShell })));
const TrashBinManagement = lazy(() => import('./modules/trash/TrashBinManagement').then(m => ({ default: m.TrashBinManagement })));

function TabLoadingFallback() {
  return (
    <div className="h-64 flex flex-col items-center justify-center gap-3 text-slate-400">
      <Loader2 size={28} className="animate-spin text-purple-500" />
      <span className="text-xs font-bold uppercase tracking-widest">Loading Module...</span>
    </div>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDark, setIsDark] = useState(false); // Default to Light Mode (Pure White Background & Black Text)
  const [lang, setLang] = useState('AR'); // Default language AR for Moroccan market
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    let token = localStorage.getItem('admin_token');
    if (!token && import.meta.env.DEV) {
      token = 'dev-admin-token';
      localStorage.setItem('admin_token', token);
    }
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('admin_token');
    setIsAuthenticated(false);
  }, []);

  const handleSelectTab = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  const fetchInitialData = async () => {
    try {
      await api.get('/admin/dashboard/summary');
    } catch (error) {
      console.error("Failed to load admin data", error);
    }
  };

  if (!isAuthenticated) {
    return <AuthPage onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <ControlCenterShell
      activeTab={activeTab}
      onSelectTab={handleSelectTab}
      isDark={isDark}
      onToggleTheme={() => setIsDark(!isDark)}
      onLogout={handleLogout}
      currentLang={lang}
      onSelectLang={setLang}
    >
      {/* Active Tab Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-slate-800">
        <div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
            {activeTab === 'dashboard' ? (lang === 'AR' ? 'لوحة القيادة والعمليات' : 'Operations Dashboard') : 
             activeTab === 'operations' ? (lang === 'AR' ? 'العمليات المباشرة والخريطة' : 'Live Operations Map') :
             activeTab === 'audit' ? (lang === 'AR' ? 'مركز التدقيق والأمان' : 'Forensic Audit Center') :
             activeTab === 'financial' ? (lang === 'AR' ? 'الماليات والنسب المالية' : 'Financial Control') :
             (activeTab === 'users' || activeTab === 'passengers') ? (lang === 'AR' ? 'إدارة الركاب' : 'Passengers Management') :
             activeTab === 'drivers' ? (lang === 'AR' ? 'إدارة السائقين والأسطول' : 'Drivers Management') :
             activeTab === 'verification' ? (lang === 'AR' ? 'قائمة توثيق السائقين (KYC)' : 'Verification Queue (KYC)') :
             activeTab === 'rides' ? (lang === 'AR' ? 'مركز متابعة الرحلات' : 'Rides Center') :
             activeTab === 'support' ? (lang === 'AR' ? 'مركز الدعم والذكاء الاصطناعي' : 'Support & AI Center') :
             activeTab === 'settings' ? (lang === 'AR' ? 'إعدادات المنصة' : 'System Settings') :
             activeTab === 'website' ? (lang === 'AR' ? 'محرر الصفحة الرئيسية' : 'Homepage Builder') :
             activeTab === 'builder' ? (lang === 'AR' ? 'محرر مركز التحكم' : 'Control Center Builder') :
             activeTab === 'trash' ? (lang === 'AR' ? 'مركز إدارة سلة المهملات' : 'Trash Bin Management Center') :
             (lang === 'AR' ? 'مراقبة النزاهة والاحتيال' : 'Integrity Monitor')}
          </h2>
          <p className="text-gray-500 dark:text-slate-400 text-xs md:text-sm mt-1">
            {activeTab === 'dashboard' ? (lang === 'AR' ? 'نظرة عامة على مؤشرات المنصة والرحلات النشطة والأرباح.' : 'Real-time platform metrics and operational insights.') : 
             activeTab === 'operations' ? (lang === 'AR' ? 'تتبع فوري لمواقع السائقين وحالة التغطية الجغرافية.' : 'Real-time tracking of drivers and active trip statuses.') :
             activeTab === 'audit' ? (lang === 'AR' ? 'سجل عمليات النظير وتتبع الإجراءات الإدارية.' : 'Centralized ledger of system actions and administrative changes.') :
             activeTab === 'financial' ? (lang === 'AR' ? 'متابعة نسبة عمولة المنصة وحسابات سحب الأرباح.' : 'Manage global commission rates and financial policies.') : 
             (activeTab === 'users' || activeTab === 'passengers') ? (lang === 'AR' ? 'إدارة حسابات الركاب والملفات الشخصية وتفعيل خصم المسافة.' : 'User profiles, passenger records, and distance benefit management.') :
             activeTab === 'drivers' ? (lang === 'AR' ? 'فحص السائقين وتحديد حالة العمل وتراخيص المركبة.' : 'Driver verification, document review, and fleet management.') :
             activeTab === 'verification' ? (lang === 'AR' ? 'جدول توثيق ملفات السائقين الجدد ومراجعة الوثائق.' : 'Review queue for pending driver verification and documents.') :
             activeTab === 'rides' ? (lang === 'AR' ? 'متابعة الرحلات الجارية والمكتملة وإلغاء الرحلات.' : 'Live ride dispatch overview and ride lifecycle management.') :
             activeTab === 'support' ? (lang === 'AR' ? 'مركز الدعم المباشر ومحادثات المساعد الذكي.' : 'Helpdesk tickets and AI support conversations.') :
             activeTab === 'settings' ? (lang === 'AR' ? 'إعدادات النظام العامة وتغيير عمولة المنصة.' : 'Global configuration and system preferences.') :
             activeTab === 'website' ? (lang === 'AR' ? 'تخصيص وتحرير الصفحة الرئيسية بصرياً مع معاينة مباشرة.' : 'Visually customize the homepage with live preview and draft/publish workflow.') :
             activeTab === 'builder' ? (lang === 'AR' ? 'بناء وتعديل مكونات لوحة التحكم بصرياً.' : 'Visually customize control center elements.') :
             activeTab === 'trash' ? (lang === 'AR' ? 'معاينة الحسابات المنسقة في السلة، الاسترجاع والحذف النهائي الآمن.' : 'Review trashed profiles, restore account states, or anonymize PII.') :
             (lang === 'AR' ? 'تنبيهات كشف الاحتيال وتغيير الموقع الجغرافي المشبوه.' : 'Real-time fraud detection and security events feed.')}
          </p>
        </div>
        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            onClick={fetchInitialData}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-900 hover:bg-gray-200 dark:hover:bg-slate-800 text-xs font-bold rounded-xl transition-colors border border-transparent dark:border-slate-800"
          >
            <RefreshCw size={14} />
            <span>{lang === 'AR' ? 'تحديث البيانات' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      <Suspense fallback={<TabLoadingFallback />}>
        {/* --- Tab 1: Dashboard Overview (Command Center View) --- */}
        {activeTab === 'dashboard' && <CommandCenterView lang={lang} />}

        {/* --- Tab 2: Operations Center Map --- */}
        {activeTab === 'operations' && <OperationsCenter lang={lang} />}

        {/* --- Tab 3: Pending Verification Queue (KYC) --- */}
        {activeTab === 'verification' && <PendingVerificationsTable lang={lang} />}

        {/* --- Tab 3.5: Drivers Fleet Management --- */}
        {activeTab === 'drivers' && <DriversManagementTable lang={lang} />}

        {/* --- Tab 4: Audit Center --- */}
        {activeTab === 'audit' && <AuditCenter />}

        {/* --- Tab 5: Passengers Management --- */}
        {(activeTab === 'passengers' || activeTab === 'users') && <PassengersManagementTable lang={lang} />}

        {/* --- Tab 6: Rides Center & Negotiation Inspector --- */}
        {activeTab === 'rides' && <RidesCenterTable lang={lang} />}

        {/* --- Tab 7: Financial Ledger & Driver RIB Payouts --- */}
        {activeTab === 'financial' && <FinancialLedgerCenter lang={lang} />}

        {/* --- Tab 8: Support & AI Helpdesk --- */}
        {activeTab === 'support' && <SupportCenterTable lang={lang} />}

        {/* --- Tab 9: Integrity Monitoring & Anomaly Detection --- */}
        {activeTab === 'integrity' && <IntegrityCenterTable lang={lang} />}

        {/* --- Tab 10: System Settings --- */}
        {activeTab === 'settings' && <SettingsCenterForm lang={lang} />}

        {/* --- Tab 11: Homepage Builder --- */}
        {activeTab === 'website' && <HomepageBuilderShell lang={lang} />}

        {/* --- Tab 12: Control Center Builder --- */}
        {activeTab === 'builder' && <ControlCenterBuilderShell lang={lang} />}

        {/* --- Tab 13: Trash Bin Management --- */}
        {activeTab === 'trash' && <TrashBinManagement lang={lang} />}
      </Suspense>
    </ControlCenterShell>
  );
}
