import React from 'react';
import {
  LayoutDashboard,
  Activity,
  Users,
  Car,
  FileCheck2,
  Wallet,
  Headphones,
  ShieldAlert,
  Settings,
  History,
  ChevronLeft,
  ChevronRight,
  Shield,
  Navigation
} from 'lucide-react';

export interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isRTL: boolean;
  lang: string;
}

const getSidebarTranslations = (lang: string) => {
  const isAr = lang === 'AR';
  const isFr = lang === 'FR';
  const isEs = lang === 'ES';

  return {
    overview: isAr ? 'نظرة عامة' : isFr ? 'Vue d’ensemble' : isEs ? 'Visión general' : 'Overview',
    management: isAr ? 'إدارة المنصة' : isFr ? 'Gestion' : isEs ? 'Gestión' : 'Management',
    financial: isAr ? 'الماليات والدعم' : isFr ? 'Finances & Support' : isEs ? 'Finanzas y Soporte' : 'Financial & Support',
    governance: isAr ? 'الحوكمة والأمان' : isFr ? 'Gouvernance & Sécurité' : isEs ? 'Gobernanza y Seguridad' : 'Governance & Security',
    
    dashboard: isAr ? 'لوحة التحكم' : isFr ? 'Tableau de bord' : isEs ? 'Panel' : 'Dashboard',
    operations: isAr ? 'العمليات المباشرة' : isFr ? 'Opérations en direct' : isEs ? 'Operaciones en vivo' : 'Live Operations',
    drivers: isAr ? 'إدارة السائقين' : isFr ? 'Chauffeurs' : isEs ? 'Conductores' : 'Drivers',
    passengers: isAr ? 'إدارة الركاب' : isFr ? 'Passagers' : isEs ? 'Pasajeros' : 'Passengers',
    rides: isAr ? 'إدارة الرحلات' : isFr ? 'Courses' : isEs ? 'Viajes' : 'Rides',
    verification: isAr ? 'قائمة التوثيق (KYC)' : isFr ? 'Vérification (KYC)' : isEs ? 'Verificación (KYC)' : 'Verification Queue',
    financials: isAr ? 'الماليات والسحب' : isFr ? 'Finances & Retraits' : isEs ? 'Finanzas y Retiros' : 'Financials & Payouts',
    support: isAr ? 'الدعم والدعم الذكي' : isFr ? 'Support & IA' : isEs ? 'Soporte e IA' : 'Support & AI Helpdesk',
    integrity: isAr ? 'مركز التدقيق والاحتيال' : isFr ? 'Audit & Fraude' : isEs ? 'Auditoría y Fraude' : 'Integrity Audit',
    securityAlerts: isAr ? 'تنبيهات الأمان' : isFr ? 'Alerte Sécurité' : isEs ? 'Alertas de Seguridad' : 'Security Alerts',
    settings: isAr ? 'إعدادات المنصة' : isFr ? 'Paramètres' : isEs ? 'Configuración' : 'Settings',
  };
};

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  isRTL,
  lang,
}) => {
  const t = getSidebarTranslations(lang);

  const categories = [
    {
      title: t.overview,
      items: [
        { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard, badge: null },
        { id: 'operations', label: t.operations, icon: Activity, badge: 'LIVE' },
      ],
    },
    {
      title: t.management,
      items: [
        { id: 'drivers', label: t.drivers, icon: Car, badge: null },
        { id: 'passengers', label: t.passengers, icon: Users, badge: null },
        { id: 'rides', label: t.rides, icon: Navigation, badge: null },
        { id: 'verification', label: t.verification, icon: FileCheck2, badge: 'KYC' },
      ],
    },
    {
      title: t.financial,
      items: [
        { id: 'financial', label: t.financials, icon: Wallet, badge: null },
        { id: 'support', label: t.support, icon: Headphones, badge: null },
      ],
    },
    {
      title: t.governance,
      items: [
        { id: 'audit', label: t.integrity, icon: History, badge: null },
        { id: 'integrity', label: t.securityAlerts, icon: ShieldAlert, badge: 'NEW' },
        { id: 'settings', label: t.settings, icon: Settings, badge: null },
      ],
    },
  ];

  const CollapseChevron = isRTL
    ? (isCollapsed ? ChevronLeft : ChevronRight)
    : (isCollapsed ? ChevronRight : ChevronLeft);

  return (
    <aside
      className={`relative h-screen bg-[#0E131F] text-white border-r border-slate-800/80 flex flex-col transition-all duration-300 z-30 select-none ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}
    >
      {/* Brand Header */}
      <div className="h-20 px-5 flex items-center justify-between border-b border-slate-800/60">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 min-w-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-900/30">
            <Shield size={22} className="text-white" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-black text-lg tracking-tight text-white italic">
                YALLA <span className="text-purple-400 not-italic">VTC</span>
              </span>
              <span className="text-[10px] font-bold tracking-[0.25em] text-purple-400/80 uppercase">
                Control Center
              </span>
            </div>
          )}
        </div>

        {/* Collapse Button */}
        <button
          onClick={onToggleCollapse}
          className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <CollapseChevron size={18} />
        </button>
      </div>

      {/* Navigation Group Items */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar">
        {categories.map((cat, idx) => (
          <div key={idx} className="space-y-1">
            {!isCollapsed && (
              <h4 className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">
                {cat.title}
              </h4>
            )}
            {cat.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 font-bold'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon
                    size={20}
                    className={`transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-purple-400'
                    }`}
                  />

                  {!isCollapsed && (
                    <span className="flex-1 text-start truncate">{item.label}</span>
                  )}

                  {!isCollapsed && item.badge && (
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        item.badge === 'LIVE'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse'
                          : item.badge === 'KYC'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {/* Tooltip on Collapsed Mode */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 border border-slate-800">
                      {item.label}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer System Status */}
      {!isCollapsed && (
        <div className="p-4 m-3 rounded-2xl bg-slate-900/90 border border-slate-800/80 flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-200">API Status: Operational</span>
            <span className="text-[10px] text-slate-500">v1.0.4 • NestJS Backend</span>
          </div>
        </div>
      )}
    </aside>
  );
};
