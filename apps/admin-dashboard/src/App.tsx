import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  Wallet, 
  Settings, 
  Moon, 
  Sun, 
  TrendingUp, 
  ShieldCheck,
  ShieldAlert,
  ChevronRight,
  AlertTriangle,
  ArrowUpRight,
  RefreshCw,
  History,
  Activity
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active = false }: { icon: any, label: string, active?: boolean }) => (
  <div className={cn(
    "flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200",
    active ? "bg-primary text-white premium-shadow" : "text-text-muted hover:bg-gray-100 dark:hover:bg-gray-800"
  )}>
    <Icon size={20} />
    <span className="font-medium">{label}</span>
    {active && <ChevronRight className="ml-auto" size={16} />}
  </div>
);

const Card = ({ children, title, subtitle }: { children: React.ReactNode, title?: string, subtitle?: string }) => (
  <div className="bg-bg-card rounded-2xl p-6 premium-shadow dark:border dark:border-gray-800">
    {title && (
      <div className="mb-6">
        <h3 className="text-xl font-bold">{title}</h3>
        {subtitle && <p className="text-text-muted text-sm mt-1">{subtitle}</p>}
      </div>
    )}
    {children}
  </div>
);

import { AuthPage } from './components/auth/AuthPage';
import api from './lib/api';
import { OperationsCenter } from './modules/operations/OperationsCenter';
import { AuditCenter } from './modules/audit/AuditCenter';

// --- Main App ---

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, financial, integrity, etc.
  const [commission, setCommission] = useState(0.08);
  const [isSaving, setIsSaving] = useState(false);
  const [rideSampleAmount] = useState(100);
  const [securityEvents, setSecurityEvents] = useState<any[]>([]);
  const [insights, setInsights] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchInitialData();
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setIsAuthenticated(false);
    setSecurityEvents([]);
  }

  const fetchInitialData = async () => {
    try {
      // Fetch Current Commission
      const settingsRes = await api.get('/admin/settings');
      if (settingsRes.data?.commission) {
         setCommission(settingsRes.data.commission);
      }

      // Fetch Integrity events
      const integrityRes = await api.get('/admin/integrity/events');
      setSecurityEvents(integrityRes.data || []);

      // Fetch Dashboard Insights
      const insightsRes = await api.get('/admin/dashboard/insights');
      setInsights(insightsRes.data);
    } catch (error) {
      console.error("Failed to load admin data", error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.patch('/admin/settings/commission', {
        rate: commission,
      });
      alert('Commission rate updated globally.');
    } catch (error) {
      alert('Failed to update settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const driverEarnings = rideSampleAmount * (1 - commission);
  const companyFee = rideSampleAmount * commission;

  if (!isAuthenticated) {
    return <AuthPage onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen flex bg-bg-main text-text-main">
      {/* Sidebar */}
      <aside className="w-72 bg-bg-card border-r border-gray-200 dark:border-gray-800 p-6 flex flex-col gap-2">
        <div className="flex items-center gap-3 mb-10 px-4">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl">A</div>
          <h1 className="text-2xl font-black tracking-tight">ATLAS</h1>
        </div>
        
        <nav className="flex-1 flex flex-col gap-2">
          <div onClick={() => setActiveTab('dashboard')}><SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'dashboard'} /></div>
          <div onClick={() => setActiveTab('operations')}><SidebarItem icon={Activity} label="Live Operations" active={activeTab === 'operations'} /></div>
          <div onClick={() => setActiveTab('audit')}><SidebarItem icon={History} label="Audit Center" active={activeTab === 'audit'} /></div>
          <div onClick={() => setActiveTab('users')}><SidebarItem icon={Users} label="Users" active={activeTab === 'users'} /></div>
          <div onClick={() => setActiveTab('drivers')}><SidebarItem icon={Car} label="Drivers" active={activeTab === 'drivers'} /></div>
          <div onClick={() => setActiveTab('financial')}><SidebarItem icon={Wallet} label="Financials" active={activeTab === 'financial'} /></div>
          <div onClick={() => setActiveTab('integrity')}><SidebarItem icon={ShieldAlert} label="Integrity" active={activeTab === 'integrity'} /></div>
          <SidebarItem icon={Settings} label="Settings" />
        </nav>

        <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-800">
          <div 
            onClick={() => setIsDark(!isDark)}
            className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          >
            {isDark ? <Sun size={20} className="text-yellow-500" /> : <Moon size={20} />}
            <span className="font-medium">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 max-w-6xl">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-black">
              {activeTab === 'dashboard' ? 'Operations Dashboard' : 
               activeTab === 'operations' ? 'Live Operations' :
               activeTab === 'audit' ? 'Forensic Audit Center' :
               activeTab === 'financial' ? 'Financial Control' : 'Integrity Monitor'}
            </h2>
            <p className="text-text-muted mt-1">
              {activeTab === 'dashboard' ? 'Real-time platform metrics and operational insights.' : 
               activeTab === 'operations' ? 'Real-time tracking of drivers and active trip statuses.' :
               activeTab === 'audit' ? 'Centralized ledger of system actions and administrative changes.' :
               activeTab === 'financial' ? 'Manage global commission rates and financial policies.' : 
               'Real-time fraud detection and security events feed.'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="font-bold">Admin #001</span>
              <span className="text-xs text-green-500 flex items-center gap-1"><ShieldCheck size={12}/> Verified Session</span>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-bold text-text-main bg-gray-100 dark:bg-gray-800 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
            >
              Logout
            </button>
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden border-2 border-white">
               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />
            </div>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="space-y-10">
             {/* KPI Cards */}
             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <span className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em] block mb-3">Gross Revenue</span>
                  <div className="flex items-end justify-between">
                    <span className="text-3xl font-black">{insights ? Number(insights.totalRevenue).toLocaleString('fr-MA') : '—'} MAD</span>
                    <div className="bg-green-500/10 text-green-500 px-2 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 mb-1">
                      <ArrowUpRight size={12} /> LIVE
                    </div>
                  </div>
                </Card>
                <Card>
                  <span className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em] block mb-3">Active Rides</span>
                  <div className="flex items-end justify-between">
                    <span className="text-3xl font-black">{insights ? insights.activeRidesCount : '—'}</span>
                    <div className="bg-primary/10 text-primary px-2 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 mb-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> LIVE
                    </div>
                  </div>
                </Card>
                <Card>
                  <span className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em] block mb-3">Drivers</span>
                  <div className="flex items-end justify-between">
                    <span className="text-3xl font-black">{insights ? insights.totalDriversCount : '—'}</span>
                    <div className="bg-blue-500/10 text-blue-500 px-2 py-1 rounded-lg text-[10px] font-black mb-1">
                      <Car size={12} />
                    </div>
                  </div>
                </Card>
                <Card>
                  <span className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em] block mb-3">Passengers</span>
                  <div className="flex items-end justify-between">
                    <span className="text-3xl font-black">{insights ? insights.totalPassengersCount : '—'}</span>
                    <div className="bg-purple-500/10 text-purple-500 px-2 py-1 rounded-lg text-[10px] font-black mb-1">
                      <Users size={12} />
                    </div>
                  </div>
                </Card>
             </div>

             {/* Status Badges */}
             {insights && (
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="bg-bg-card rounded-2xl p-4 border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                     <ShieldCheck size={20} />
                   </div>
                   <div>
                     <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">Platform Status</p>
                     <p className="font-black text-green-500">{insights.health}</p>
                   </div>
                 </div>
                 <div className="bg-bg-card rounded-2xl p-4 border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                     <TrendingUp size={20} />
                   </div>
                   <div>
                     <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">Growth</p>
                     <p className="font-black text-primary">+{insights.kpi?.growth}%</p>
                   </div>
                 </div>
                 <div className="bg-bg-card rounded-2xl p-4 border border-gray-100 dark:border-gray-800 flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-500">
                     <ShieldAlert size={20} />
                   </div>
                   <div>
                     <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">Reliability</p>
                     <p className="font-black text-teal-500">{insights.kpi?.reliability}%</p>
                   </div>
                 </div>
               </div>
             )}

             {!insights && (
               <div className="flex items-center justify-center h-40 text-text-muted">
                 <div className="flex flex-col items-center gap-3">
                   <RefreshCw className="animate-spin" size={24} />
                   <span className="text-sm font-medium">Loading live data...</span>
                 </div>
               </div>
             )}
          </div>
        )}

        {activeTab === 'financial' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="lg:col-span-2">
              <Card 
                title="Global Commission Rate" 
                subtitle="This percentage is deducted from the total fare of every completed ride."
              >
                <div className="space-y-10">
                  <div className="flex justify-between items-end">
                    <div className="text-5xl font-black text-primary">
                      {(commission * 100).toFixed(0)}%
                    </div>
                    <div className="text-right">
                      <span className="text-text-muted text-sm block">Current Base</span>
                      <span className="font-bold text-lg">8%</span>
                    </div>
                  </div>

                  <div className="relative pt-1">
                    <input
                      type="range"
                      min="0"
                      max="0.5"
                      step="0.01"
                      value={commission}
                      onChange={(e) => setCommission(parseFloat(e.target.value))}
                      className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                    <div className="flex justify-between text-xs text-text-muted mt-4 font-medium uppercase tracking-wider">
                      <span>0% (Minimum)</span>
                      <span>25% (Standard)</span>
                      <span>50% (Max)</span>
                    </div>
                  </div>

                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-2xl transition-all premium-shadow active:scale-[0.98] disabled:opacity-50"
                  >
                    {isSaving ? 'Synchronizing with Ledger...' : 'Save & Propagate Changes'}
                  </button>
                </div>
              </Card>
            </div>

            {/* Live Preview Card */}
            <div>
              <Card title="Live Impact Preview">
                <div className="space-y-6">
                  <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                    <span className="text-text-muted text-sm uppercase tracking-widest font-bold">Sample Ride Value</span>
                    <div className="text-3xl font-black mt-1">100.00 MAD</div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center group">
                      <span className="text-text-muted group-hover:text-text-main transition-colors">Platform Fee</span>
                      <span className="font-bold text-red-500">-{companyFee.toFixed(2)} MAD</span>
                    </div>
                    <div className="flex justify-between items-center group">
                      <span className="text-text-muted group-hover:text-text-main transition-colors">Tax Estimate (20%)</span>
                      <span className="font-bold text-gray-400">Included</span>
                    </div>
                    <div className="h-px bg-gray-200 dark:bg-gray-800 my-4" />
                    <div className="flex justify-between items-center p-4 rounded-xl bg-green-500/10 text-green-600 dark:text-green-400">
                      <span className="font-bold">Driver Net Earnings</span>
                      <span className="text-xl font-black">{driverEarnings.toFixed(2)} MAD</span>
                    </div>
                  </div>

                  <div className="mt-6 flex items-start gap-3 p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl text-amber-600 dark:text-amber-500 text-xs">
                    <TrendingUp size={16} className="shrink-0 mt-0.5" />
                    <p>Increasing the commission by 1% can result in an estimated 2.4% decrease in driver retention over 30 days.</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <Card>
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
                     <AlertTriangle size={24} />
                   </div>
                   <div>
                     <span className="text-text-muted text-sm font-bold block">Critical Events</span>
                     <span className="text-2xl font-black">12 Today</span>
                   </div>
                 </div>
               </Card>
               <Card>
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                     <ShieldAlert size={24} />
                   </div>
                   <div>
                     <span className="text-text-muted text-sm font-bold block">GPS Spoofing</span>
                     <span className="text-2xl font-black">45 Attempts</span>
                   </div>
                 </div>
               </Card>
               <Card>
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                     <ShieldCheck size={24} />
                   </div>
                   <div>
                     <span className="text-text-muted text-sm font-bold block">Platform Integrity</span>
                     <span className="text-2xl font-black">98.4% Secure</span>
                   </div>
                 </div>
               </Card>
            </div>

            <Card title="Real-time Security Feed" subtitle="List of recent suspicious activities across the platform.">
               <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                   <thead className="text-text-muted text-xs uppercase tracking-widest border-b border-gray-100 dark:border-gray-800">
                     <tr>
                       <th className="pb-4 font-bold">Event Type & Entity</th>
                       <th className="pb-4 font-bold">Risk Score</th>
                       <th className="pb-4 font-bold">Severity</th>
                       <th className="pb-4 font-bold">Time</th>
                       <th className="pb-4 font-bold">Action</th>
                     </tr>
                   </thead>
                   <tbody className="text-sm">
                     {securityEvents.length > 0 ? securityEvents.map((event, i) => {
                       const score = event.metadata?.riskScore ?? 50;
                       const severity = event.severity || 'LOW';
                       const time = new Date(event.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                       return (
                         <tr key={event.id ?? i} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                           <td className="py-4">
                             <div className="font-bold">{event.eventType}</div>
                             <div className="text-[10px] text-text-muted font-mono">{event.entityType || event.userId || 'unknown'}</div>
                           </td>
                           <td className="py-4">
                             <div className="flex items-center gap-2">
                               <div className="w-16 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                 <div 
                                   className={cn("h-full", 
                                     score >= 80 ? "bg-red-500" : 
                                     score >= 50 ? "bg-orange-500" : "bg-yellow-500"
                                   )} 
                                   style={{ width: `${score}%` }} 
                                 />
                               </div>
                               <span className="font-black text-xs">{score}</span>
                             </div>
                           </td>
                           <td className="py-4">
                             <span className={cn("px-2 py-1 rounded-md text-[10px] font-black border", 
                               severity === 'CRITICAL' ? "bg-red-500/10 border-red-500/20 text-red-500" :
                               severity === 'HIGH' ? "bg-orange-500/10 border-orange-500/20 text-orange-500" :
                               "bg-yellow-500/10 border-yellow-500/20 text-yellow-500"
                             )}>
                               {severity}
                             </span>
                           </td>
                           <td className="py-4 text-text-muted text-xs">{time}</td>
                           <td className="py-4">
                              <div className="flex gap-2">
                                <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg font-bold text-[10px] transition-all">BLOCK</button>
                                <button className="bg-gray-100 dark:bg-gray-800 text-text-main px-3 py-1 rounded-lg font-bold text-[10px] transition-all">REVIEW</button>
                              </div>
                           </td>
                         </tr>
                       );
                     }) : (
                       <tr>
                         <td className="py-6 text-center text-text-muted" colSpan={5}>
                           No security events loaded yet.
                         </td>
                       </tr>
                     )}
                   </tbody>
                 </table>
               </div>
            </Card>
          </div>
        )}

        {activeTab === 'operations' && <OperationsCenter />}
        {activeTab === 'audit' && <AuditCenter />}
      </main>
    </div>
  );
}
