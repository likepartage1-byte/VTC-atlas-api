import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  User, 
  Activity, 
  Clock, 
  ArrowRight,
  Database
} from 'lucide-react';
import api from '../../lib/api';

interface AuditLog {
  id: string;
  actorId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  oldValue: any;
  newValue: any;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export const AuditCenter: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      // Note: We'll need to create this endpoint in the backend or use a generic admin query
      const response = await api.get('/admin/audit/logs');
      setLogs(response.data);
    } catch (error) {
      console.error("Failed to fetch audit logs", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.entityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.actorId && log.actorId.includes(searchTerm))
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      {/* Search and Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
          <input 
            type="text" 
            placeholder="Search by action, entity, or actor..."
            className="w-full bg-bg-card border border-gray-200 dark:border-gray-800 rounded-2xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-3 bg-bg-card border border-gray-200 dark:border-gray-800 rounded-2xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
            <Filter size={18} />
            Filter
          </button>
          <button 
            onClick={fetchLogs}
            className="flex items-center gap-2 px-4 py-3 bg-primary text-white rounded-2xl font-bold text-sm premium-shadow hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Activity size={18} />
            Refresh Feed
          </button>
        </div>
      </div>

      {/* Audit Table */}
      <div className="bg-bg-card rounded-3xl premium-shadow overflow-hidden dark:border dark:border-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 dark:bg-gray-800/50 text-text-muted text-[10px] uppercase font-black tracking-widest border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="px-6 py-4">Event Type</th>
                <th className="px-6 py-4">Actor</th>
                <th className="px-6 py-4">Entity Affected</th>
                <th className="px-6 py-4">Changes</th>
                <th className="px-6 py-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="text-text-muted font-bold text-sm tracking-widest uppercase">Deciphering logs...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-6 font-black text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          <History size={16} />
                        </div>
                        {log.action}
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold flex items-center gap-2 text-sm">
                          <User size={14} className="text-text-muted" />
                          {log.actorId ? `ID: ${log.actorId.slice(0, 8)}...` : 'System'}
                        </span>
                        <span className="text-[10px] text-text-muted font-mono">{log.ipAddress || 'Internal'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm flex items-center gap-2">
                          <Database size={14} className="text-text-muted" />
                          {log.entityType}
                        </span>
                        <span className="text-[10px] text-text-muted font-mono">{log.entityId || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3 max-w-xs">
                         <div className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-[10px] font-mono text-text-muted truncate">
                            {JSON.stringify(log.oldValue || '∅')}
                         </div>
                         <ArrowRight size={12} className="text-text-muted shrink-0" />
                         <div className="px-2 py-1 bg-green-500/10 dark:bg-green-500/5 text-green-600 dark:text-green-400 rounded text-[10px] font-mono truncate">
                            {JSON.stringify(log.newValue || '∅')}
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-right">
                       <div className="flex flex-col items-end">
                         <span className="font-bold text-sm">{new Date(log.createdAt).toLocaleDateString()}</span>
                         <span className="text-xs text-text-muted flex items-center gap-1">
                           <Clock size={12} />
                           {new Date(log.createdAt).toLocaleTimeString()}
                         </span>
                       </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-text-muted font-bold">
                    No forensic records found matching your query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
