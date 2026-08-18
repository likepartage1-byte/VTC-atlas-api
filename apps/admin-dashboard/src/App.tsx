import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { AuthPage } from './components/auth/AuthPage';
import api from './lib/api';
import { OperationsCenter } from './modules/operations/OperationsCenter';
import { AuditCenter } from './modules/audit/AuditCenter';
import { PendingVerificationsTable } from './modules/drivers/PendingVerificationsTable';
import { DriversManagementTable } from './modules/drivers/DriversManagementTable';
import { PassengersManagementTable } from './modules/passengers/PassengersManagementTable';
import { RidesCenterTable } from './modules/rides/RidesCenterTable';
import { FinancialLedgerCenter } from './modules/financial/FinancialLedgerCenter';
import { SupportCenterTable } from './modules/support/SupportCenterTable';
import { IntegrityCenterTable } from './modules/integrity/IntegrityCenterTable';
import { SettingsCenterForm } from './modules/settings/SettingsCenterForm';
import { ControlCenterShell } from './components/layout/ControlCenterShell';
import { CommandCenterView } from './components/dashboard/CommandCenterView';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [lang, setLang] = useState('AR'); // Default language AR for Moroccan market
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setIsAuthenticated(false);
  };

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
      onSelectTab={setActiveTab}
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
             activeTab === 'users' ? (lang === 'AR' ? 'إدارة حسابات الركاب' : 'Passengers Management') :
             activeTab === 'drivers' ? (lang === 'AR' ? 'إدارة السائقين والأسطول' : 'Drivers Management') :
             activeTab === 'verification' ? (lang === 'AR' ? 'قائمة توثيق السائقين (KYC)' : 'Verification Queue (KYC)') :
             activeTab === 'rides' ? (lang === 'AR' ? 'مركز متابعة الرحلات' : 'Rides Center') :
             activeTab === 'support' ? (lang === 'AR' ? 'مركز الدعم والذكاء الاصطناعي' : 'Support & AI Center') :
             activeTab === 'settings' ? (lang === 'AR' ? 'إعدادات المنصة' : 'System Settings') : (lang === 'AR' ? 'مراقبة النزاهة والاحتيال' : 'Integrity Monitor')}
          </h2>
          <p className="text-gray-500 dark:text-slate-400 text-xs md:text-sm mt-1">
            {activeTab === 'dashboard' ? (lang === 'AR' ? 'نظرة عامة على مؤشرات المنصة والرحلات النشطة والأرباح.' : 'Real-time platform metrics and operational insights.') : 
             activeTab === 'operations' ? (lang === 'AR' ? 'تتبع فوري لمواقع السائقين وحالة التغطية الجغرافية.' : 'Real-time tracking of drivers and active trip statuses.') :
             activeTab === 'audit' ? (lang === 'AR' ? 'سجل عمليات النظير وتتبع الإجراءات الإدارية.' : 'Centralized ledger of system actions and administrative changes.') :
             activeTab === 'financial' ? (lang === 'AR' ? 'متابعة نسبة عمولة المنصة وحسابات سحب الأرباح.' : 'Manage global commission rates and financial policies.') : 
             activeTab === 'users' ? (lang === 'AR' ? 'إدارة حسابات الركاب والملفات الشخصية.' : 'User profiles, passenger records, and account management.') :
             activeTab === 'drivers' ? (lang === 'AR' ? 'فحص السائقين وتحديد حالة العمل وتراخيص المركبة.' : 'Driver verification, document review, and fleet management.') :
             activeTab === 'verification' ? (lang === 'AR' ? 'جدول توثيق ملفات السائقين الجدد ومراجعة الوثائق.' : 'Review queue for pending driver verification and documents.') :
             activeTab === 'rides' ? (lang === 'AR' ? 'متابعة الرحلات الجارية والمكتملة وإلغاء الرحلات.' : 'Live ride dispatch overview and ride lifecycle management.') :
             activeTab === 'support' ? (lang === 'AR' ? 'مركز الدعم المباشر ومحادثات المساعد الذكي.' : 'Helpdesk tickets and AI support conversations.') :
             activeTab === 'settings' ? (lang === 'AR' ? 'إعدادات النظام العامة وتغيير عمولة المنصة.' : 'Global configuration and system preferences.') :
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
      {activeTab === 'users' && <PassengersManagementTable lang={lang} />}

      {/* --- Tab 6: Rides Center & Negotiation Inspector --- */}
      {activeTab === 'rides' && <RidesCenterTable lang={lang} />}

      {/* --- Tab 7: Financial Ledger & Driver RIB Payouts --- */}
      {activeTab === 'financial' && <FinancialLedgerCenter lang={lang} />}

      {/* --- Tab 8: Support & AI Helpdesk --- */}
      {activeTab === 'support' && <SupportCenterTable lang={lang} />}

      {/* --- Tab 9: Integrity Monitoring & Anomaly Detection --- */}
      {activeTab === 'integrity' && <IntegrityCenterTable lang={lang} />}

      {/* --- Tab 10: System Settings & Platform Commission --- */}
      {activeTab === 'settings' && <SettingsCenterForm lang={lang} />}
    </ControlCenterShell>
  );
}
