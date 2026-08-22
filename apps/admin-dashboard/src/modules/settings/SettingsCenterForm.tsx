import React, { useState, useEffect } from 'react';
import {
  Settings,
  Percent,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Save,
  Loader2,
  Sliders
} from 'lucide-react';
import api from '../../lib/api';

export interface SystemSettingsData {
  commission?: number;
  theme?: any;
  featureFlags?: any;
}

export const SettingsCenterForm: React.FC<{ lang?: string }> = ({ lang = 'AR' }) => {
  const [settingsData, setSettingsData] = useState<SystemSettingsData | null>(null);
  const [commissionInput, setCommissionInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isAr = lang === 'AR';

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/admin/settings');
      if (res.data) {
        setSettingsData(res.data);
        if (res.data.commission !== undefined && res.data.commission !== null) {
          // Convert decimal 0.08 to 8% or raw number
          const percentageValue = res.data.commission <= 1 ? res.data.commission * 100 : res.data.commission;
          setCommissionInput(percentageValue.toString());
        }
      }
    } catch (err: any) {
      console.warn('Failed to fetch system settings', err);
      setError(err.response?.data?.message || 'Unable to load platform system settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCommission = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const parsedRate = parseFloat(commissionInput);
    if (isNaN(parsedRate) || parsedRate < 0 || parsedRate > 50) {
      setError(isAr ? 'يرجى إدخال نسبة عمولة صحيحة بين 0% و 50%' : 'Please enter a valid commission rate between 0% and 50%.');
      return;
    }

    // Convert 8% to decimal 0.08 expected by backend validation rate <= 0.5
    const decimalRate = parsedRate > 1 ? parsedRate / 100 : parsedRate;

    setIsSubmitting(true);
    try {
      await api.patch('/admin/settings/commission', { rate: decimalRate });
      setSuccess(isAr ? 'تم تحديث نسبة عمولة المنصة وحفظها بنجاح!' : 'Platform commission rate updated successfully!');
      
      // Re-fetch to verify stored value from server
      await fetchSettings();
    } catch (err: any) {
      console.error('Failed to update commission rate', err);
      setError(err.response?.data?.message || 'Failed to update commission rate. Please check input.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Main Settings Header */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-black tracking-tight flex items-center gap-2 text-gray-900 dark:text-white">
            <Settings className="text-purple-600 dark:text-purple-400" size={22} />
            {isAr ? 'إعدادات المنصة وعمولة الخدمة (Platform Settings & Commission)' : 'Platform Commission & System Settings'}
          </h3>
          <p className="text-gray-500 dark:text-slate-400 text-xs md:text-sm mt-1">
            {isAr
              ? 'التحكم المالي المباشر في نسبة اقتطاع عمولة المنصة ومفاتيح التبديل التشغيلية.'
              : 'Configure platform commission rate and global operational settings.'}
          </p>
        </div>

        <button
          onClick={fetchSettings}
          disabled={loading || isSubmitting}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs shadow-md shadow-purple-600/20 transition-all active:scale-[0.98] disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          {loading ? (isAr ? 'جاري التحميل...' : 'Refreshing...') : (isAr ? 'تحديث الإعدادات' : 'Refresh Settings')}
        </button>
      </div>

      {/* Feedback Banners */}
      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 flex items-center justify-between gap-3 text-xs font-bold">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchSettings}
            className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Commission Settings Form Card */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-3 border-b border-gray-100 dark:border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-purple-600/10 text-purple-600 dark:text-purple-400 font-black flex items-center justify-center">
            <Percent size={20} />
          </div>
          <div>
            <h4 className="font-black text-sm tracking-tight text-gray-900 dark:text-white">
              {isAr ? 'نسبة اقتطاع عمولة المنصة (Platform Commission Rate)' : 'Platform Commission Fee Rate'}
            </h4>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              {isAr ? 'النسبة المئوية التي يتم اقتطاعها تلقائياً من قيمة كل رحلة مكتملة.' : 'Percentage deducted automatically from every completed ride.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleUpdateCommission} className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative flex-1 w-full max-w-xs">
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-purple-600 dark:text-purple-400 font-bold text-xs">
                %
              </div>
              <input
                type="number"
                step="0.1"
                min="0"
                max="50"
                value={commissionInput}
                onChange={(e) => setCommissionInput(e.target.value)}
                disabled={loading || isSubmitting}
                placeholder={isAr ? 'مثال: 8' : 'e.g. 8'}
                className="w-full pl-3 pr-8 py-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-sm font-mono font-bold focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={loading || isSubmitting || !commissionInput.trim()}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 w-full sm:w-auto shrink-0"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              <span>{isAr ? 'حفظ وتطبيق العمولة' : 'Save Commission Rate'}</span>
            </button>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-slate-950 rounded-xl border border-gray-100 dark:border-slate-800 text-xs font-mono text-gray-500 flex justify-between">
            <span>{isAr ? 'النسبة المئوية الحالية المخزنة في الخادم:' : 'Current Server Stored Commission:'}</span>
            <span className="font-bold text-purple-600 dark:text-purple-400">
              {settingsData?.commission !== undefined && settingsData?.commission !== null
                ? `${(settingsData.commission <= 1 ? settingsData.commission * 100 : settingsData.commission).toFixed(1)}%`
                : '—'}
            </span>
          </div>
        </form>
      </div>

      {/* Homepage Builder & Visual Customization Card */}
      <div className="bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-900/50 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-4 border-b border-gray-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Sliders size={20} />
            </div>
            <div>
              <h4 className="font-black text-sm text-gray-900 dark:text-white">
                {isAr ? 'محرر ومخصص الصفحة الرئيسية (Homepage Builder)' : 'Homepage Visual Builder Integration'}
              </h4>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                {isAr ? 'إدارة الهوية البصرية، المسودات والنشر المباشر لموقع Yalla VTC الرسمي' : 'Manage official landing site visual themes, draft configs, and live publishing.'}
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full border border-emerald-200 dark:border-emerald-800">
            {isAr ? 'متصل بالداتابيز' : 'Database Active'}
          </span>
        </div>

        <div className="p-4 bg-purple-50/50 dark:bg-purple-950/20 rounded-2xl border border-purple-100 dark:border-purple-900/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-900 dark:text-white">
              {isAr ? 'تحرير وتخصيص محتوى الموقع البصري' : 'Visual Homepage Customization'}
            </span>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              {isAr ? 'استخدم محرر الصفحة الرئيسية من السايدبار للتعديل على العناوين، الصور، الألوان ومسودات النشر.' : 'Use the Homepage Builder tab from the sidebar to edit titles, colors, images, and publish live configs.'}
            </p>
          </div>
        </div>
      </div>

      {/* Raw Configuration Dump Card (Strict Zero Fake Data) */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3 border-b border-gray-100 dark:border-slate-800 pb-3">
          <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 flex items-center justify-center">
            <Sliders size={18} />
          </div>
          <div>
            <h4 className="font-black text-sm text-gray-900 dark:text-white">
              {isAr ? 'الإعدادات العامة المسترجعة من العقد' : 'System Configuration Overview'}
            </h4>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              {isAr ? 'عرض الإعدادات الفعلية كما تعود من GET /admin/settings' : 'Direct payload inspection from GET /admin/settings'}
            </p>
          </div>
        </div>

        <div className="p-4 bg-slate-950 text-slate-200 rounded-2xl border border-slate-800">
          {settingsData ? (
            <pre className="p-3 bg-slate-900 rounded-xl text-[11px] font-mono overflow-x-auto text-emerald-400 max-h-48">
              {JSON.stringify(settingsData, null, 2)}
            </pre>
          ) : (
            <p className="text-xs font-mono text-slate-500 py-2">—</p>
          )}
        </div>
      </div>
    </div>
  );
};
