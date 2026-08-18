import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Search,
  RefreshCw,
  Eye,
  AlertCircle,
  Clock,
  Bot
} from 'lucide-react';
import api from '../../lib/api';
import { SupportTicketDrawer } from './SupportTicketDrawer';
import type { SupportTicketItem } from './SupportTicketDrawer';

export const SupportCenterTable: React.FC<{ lang?: string }> = ({ lang = 'AR' }) => {
  const [tickets, setTickets] = useState<SupportTicketItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'AI_ACTIVE' | 'WAITING_HUMAN' | 'CLOSED'>('ALL');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketItem | null>(null);

  const isAr = lang === 'AR';

  useEffect(() => {
    fetchTicketsList();
  }, []);

  const fetchTicketsList = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/support/conversations');
      if (Array.isArray(res.data)) {
        setTickets(res.data);
      } else if (res.data && Array.isArray(res.data.conversations)) {
        setTickets(res.data.conversations);
      } else {
        setTickets([]);
      }
    } catch (err: any) {
      console.warn('Failed to fetch support conversations', err);
      setError(err.response?.data?.message || 'Unable to load support helpdesk queue.');
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      (t.driverName && t.driverName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.driverPhone && t.driverPhone.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.id && t.id.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black tracking-tight flex items-center gap-2 text-gray-900 dark:text-white">
            <MessageSquare className="text-purple-600 dark:text-purple-400" size={22} />
            {isAr ? 'مركز الدعم الفني وتذاكر المحادثات (Support Helpdesk)' : 'Support & AI Helpdesk Center'}
          </h3>
          <p className="text-gray-500 dark:text-slate-400 text-xs md:text-sm mt-1">
            {isAr
              ? 'متابعة استفسارات السائقين والتفاعل المباشر بين المساعد الذكي والوكلاء البشريين.'
              : 'Monitor driver support conversations and provide human agent assistance.'}
          </p>
        </div>

        <button
          onClick={fetchTicketsList}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs shadow-md shadow-purple-600/20 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          {loading ? (isAr ? 'جاري التحديث...' : 'Refreshing...') : (isAr ? 'تحديث التذاكر' : 'Refresh Tickets')}
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              statusFilter === 'ALL'
                ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 border-transparent hover:bg-gray-200 dark:hover:bg-slate-700'
            }`}
          >
            {isAr ? 'الكل' : 'All Tickets'} ({tickets.length})
          </button>

          <button
            onClick={() => setStatusFilter('WAITING_HUMAN')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              statusFilter === 'WAITING_HUMAN'
                ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                : 'bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20'
            }`}
          >
            {isAr ? 'في انتظار وكيل بشري' : 'Waiting Human Agent'}
          </button>

          <button
            onClick={() => setStatusFilter('AI_ACTIVE')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              statusFilter === 'AI_ACTIVE'
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20'
            }`}
          >
            {isAr ? 'مساعد ذكي نشط' : 'AI Active'}
          </button>
        </div>

        <div className="relative min-w-[240px]">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
            <Search size={16} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isAr ? 'بحث باسم السائق أو الهاتف...' : 'Search driver, phone...'}
            className="w-full pl-9 pr-3 py-1.5 bg-gray-100 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
      </div>

      {/* Error Feedback Alert */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 flex items-center justify-between gap-3 text-xs font-bold">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchTicketsList}
            className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Tickets Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="text-gray-400 text-[10px] uppercase font-black tracking-widest border-b border-gray-100 dark:border-slate-800">
            <tr>
              <th className="pb-4 font-bold">{isAr ? 'اسم السائق' : 'Driver Name'}</th>
              <th className="pb-4 font-bold">{isAr ? 'رقم الهاتف' : 'Phone Number'}</th>
              <th className="pb-4 font-bold">{isAr ? 'حالة التذكرة' : 'Status'}</th>
              <th className="pb-4 font-bold">{isAr ? 'آخر رسالة' : 'Last Message'}</th>
              <th className="pb-4 font-bold text-right">{isAr ? 'محادثة التذكرة' : 'Open Ticket'}</th>
            </tr>
          </thead>

          <tbody className="text-sm divide-y divide-gray-100 dark:divide-slate-800/60">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-16 text-center text-gray-400">
                  <div className="flex flex-col items-center gap-3">
                    <RefreshCw className="animate-spin text-purple-500" size={28} />
                    <span className="text-xs font-bold uppercase tracking-widest">{isAr ? 'جاري تحميل التذاكر...' : 'Loading support tickets...'}</span>
                  </div>
                </td>
              </tr>
            ) : filteredTickets.length > 0 ? (
              filteredTickets.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => setSelectedTicket(item)}
                  className="hover:bg-purple-50/50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                >
                  <td className="py-4 font-bold">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-purple-600/10 text-purple-600 dark:text-purple-400 font-black flex items-center justify-center text-xs">
                        {item.driverName ? item.driverName.charAt(0).toUpperCase() : 'D'}
                      </div>
                      <div>
                        <span className="block font-bold group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {item.driverName || '—'}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">ID: {item.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 font-mono text-xs font-medium text-gray-600 dark:text-slate-300">
                    {item.driverPhone || '—'}
                  </td>
                  <td className="py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black border bg-purple-500/10 border-purple-500/20 text-purple-500">
                      {item.status === 'AI_ACTIVE' ? <Bot size={12} /> : <Clock size={12} />}
                      {item.status}
                    </span>
                  </td>
                  <td className="py-4 text-xs max-w-xs truncate text-gray-500 dark:text-slate-400">
                    {item.lastMessageText || '—'}
                  </td>
                  <td className="py-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTicket(item);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-slate-800 hover:bg-purple-600 hover:text-white dark:hover:bg-purple-600 rounded-xl font-bold text-xs transition-colors"
                    >
                      <Eye size={14} />
                      <span>{isAr ? 'فتح المحادثة' : 'Open Ticket'}</span>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="py-16 text-center text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <MessageSquare size={36} className="opacity-30 mb-1" />
                    <p className="font-bold text-sm">{isAr ? 'لا توجد تذاكر دعم فني حالياً.' : 'No support tickets.'}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Support Ticket Drawer */}
      <SupportTicketDrawer
        ticket={selectedTicket}
        onClose={() => setSelectedTicket(null)}
        onRefresh={fetchTicketsList}
        lang={lang}
      />
    </div>
  );
};
