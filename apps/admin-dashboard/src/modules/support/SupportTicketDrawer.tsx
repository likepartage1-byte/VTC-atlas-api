import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Phone,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  Bot
} from 'lucide-react';
import api from '../../lib/api';

export interface LocalMessageItem {
  id: string;
  conversationId: string;
  senderType: 'DRIVER' | 'AI' | 'HUMAN_AGENT';
  senderName?: string;
  content: string;
  createdAt: string;
}

export interface SupportTicketItem {
  id: string;
  driverId: string;
  driverName?: string;
  driverPhone?: string;
  language?: string;
  status: 'AI_ACTIVE' | 'WAITING_HUMAN' | 'HUMAN_RESPONDED' | 'CLOSED' | string;
  category?: string;
  subject?: string;
  lastMessageText?: string;
  lastMessageAt?: string;
  createdAt?: string;
  messages?: LocalMessageItem[];
}

export interface SupportTicketDrawerProps {
  ticket: SupportTicketItem | null;
  onClose: () => void;
  onRefresh?: () => void;
  lang?: string;
}

export const SupportTicketDrawer: React.FC<SupportTicketDrawerProps> = ({
  ticket,
  onClose,
  onRefresh,
  lang = 'AR',
}) => {
  const [detail, setDetail] = useState<SupportTicketItem | null>(ticket);
  const [messageInput, setMessageInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isAr = lang === 'AR';

  useEffect(() => {
    if (ticket?.id) {
      setDetail(ticket);
      fetchTicketDetails(ticket.id);
    }
  }, [ticket]);

  const fetchTicketDetails = async (id: string) => {
    try {
      const res = await api.get(`/support/conversations/${id}`);
      if (res.data) {
        setDetail(res.data);
      }
    } catch (err) {
      console.warn('Could not fetch ticket conversation detail', err);
    }
  };

  if (!ticket) return null;

  const currentDetail = detail || ticket;

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim()) {
      setError(isAr ? 'يرجى كتابة نص الرسالة قبل الإرسال' : 'Message text cannot be empty.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await api.post(`/support/conversations/${currentDetail.id}/messages`, {
        senderType: 'HUMAN_AGENT',
        senderName: 'الدعم الفني المباشر',
        content: messageInput.trim(),
      });
      setMessageInput('');
      setSuccess(isAr ? 'تم إرسال الرد بنجاح!' : 'Agent reply sent successfully!');
      fetchTicketDetails(currentDetail.id);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      console.error('Failed to send support message', err);
      setError(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseTicket = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await api.post(`/support/conversations/${currentDetail.id}/close`);
      setSuccess(isAr ? 'تم إغلاق تذكرة الدعم بنجاح.' : 'Support ticket closed.');
      fetchTicketDetails(currentDetail.id);
      setTimeout(() => {
        if (onRefresh) onRefresh();
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error('Failed to close support ticket', err);
      setError(err.response?.data?.message || 'Failed to close support ticket.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusColors: Record<string, string> = {
    AI_ACTIVE: '#3B82F6',
    WAITING_HUMAN: '#F59E0B',
    HUMAN_RESPONDED: '#8B5CF6',
    CLOSED: '#64748B',
  };

  const statusBg = statusColors[currentDetail.status] || '#64748B';

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-800 w-full max-w-xl h-full flex flex-col shadow-2xl text-gray-900 dark:text-white">
        {/* Drawer Header */}
        <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/10 text-purple-600 dark:text-purple-400 font-black flex items-center justify-center text-sm">
              <MessageSquare size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm tracking-tight">{currentDetail.driverName || 'Unnamed Driver'}</h3>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase"
                  style={{
                    backgroundColor: `${statusBg}20`,
                    color: statusBg,
                  }}
                >
                  {currentDetail.status}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-mono">
                {currentDetail.driverPhone ? `${currentDetail.driverPhone} • ` : ''}ID: {currentDetail.id}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCloseTicket}
              disabled={isSubmitting || currentDetail.status === 'CLOSED'}
              className="px-3 py-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
            >
              {isAr ? 'إغلاق التذكرة' : 'Close Ticket'}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 flex items-center justify-center text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Feedback Banners */}
        {success && (
          <div className="mx-6 mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Message Conversation Transcript Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30 dark:bg-slate-950/30">
          {currentDetail.messages && currentDetail.messages.length > 0 ? (
            currentDetail.messages.map((msg) => {
              const isAgent = msg.senderType === 'HUMAN_AGENT';
              const isAI = msg.senderType === 'AI';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isAgent ? 'items-end' : 'items-start'} space-y-1`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                    {isAI ? <Bot size={12} className="text-blue-500" /> : isAgent ? <User size={12} className="text-purple-500" /> : <Phone size={12} />}
                    <span>{msg.senderName || msg.senderType}</span>
                    <span>•</span>
                    <span className="font-mono">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed font-medium shadow-sm ${
                      isAgent
                        ? 'bg-purple-600 text-white rounded-br-none'
                        : isAI
                        ? 'bg-blue-500/10 text-blue-600 dark:text-blue-300 border border-blue-500/20 rounded-bl-none'
                        : 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-100 dark:border-slate-700 rounded-bl-none'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2 py-12">
              <MessageSquare size={32} className="opacity-30" />
              <p className="text-xs font-bold">{isAr ? 'لا توجد رسائل سابقة في هذه التذكرة.' : 'No messages in this transcript.'}</p>
            </div>
          )}
        </div>

        {/* Human Agent Reply Box */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-3">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            disabled={isSubmitting || currentDetail.status === 'CLOSED'}
            placeholder={
              currentDetail.status === 'CLOSED'
                ? (isAr ? 'التذكرة مغلقة — لا يمكن إرسال رسائل جديدة' : 'Ticket is closed')
                : (isAr ? 'اكتب رد الدعم الفني البشري هنا...' : 'Type human agent reply...')
            }
            className="flex-1 p-3 bg-gray-100 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={isSubmitting || !messageInput.trim() || currentDetail.status === 'CLOSED'}
            className="flex items-center gap-2 px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs shadow-md shadow-purple-600/20 transition-all disabled:opacity-50 shrink-0"
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            <span>{isAr ? 'إرسال' : 'Send'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
