import React, { useState, useEffect } from 'react';
import {
  X,
  Eye,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RefreshCw,
  FileText,
  CheckCircle2,
  Clock,
  Car,
  User,
  AlertCircle,
  Check,
  XCircle,
  Send,
  Loader2,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import api from '../../lib/api';

export interface DriverInspectionTarget {
  id: string;
  driverId: string;
  name: string;
  phone: string;
  status: string;
  documentCount: number;
  updatedAt: string;
  vehicleInfo?: {
    make?: string;
    model?: string;
    year?: string;
    plate?: string;
    color?: string;
  };
}

export interface DocumentInspectionModalProps {
  driver: DriverInspectionTarget | null;
  onClose: () => void;
  onRefresh?: () => void;
  lang?: string;
}

export interface InspectionDocumentItem {
  id: string;
  type: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  url?: string;
  updatedAt?: string;
  rejectionReason?: string;
}

export const DocumentInspectionModal: React.FC<DocumentInspectionModalProps> = ({
  driver,
  onClose,
  onRefresh,
  lang = 'AR',
}) => {
  const [activeDocType, setActiveDocType] = useState<'LICENSE' | 'CIN' | 'CARTE_GRISE'>('LICENSE');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);

  // Review & Action state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Rejection Dialog state
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [rejectTarget, setRejectTarget] = useState<'OVERALL' | 'DOCUMENT'>('OVERALL');
  const [rejectionReason, setRejectionReason] = useState<string>('');

  // Remote loaded documents array & verification ID
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [remoteDocs, setRemoteDocs] = useState<InspectionDocumentItem[]>([]);
  const [overallStatus, setOverallStatus] = useState<string>('PENDING');

  const isAr = lang === 'AR';

  useEffect(() => {
    if (driver) {
      setOverallStatus(driver.status || 'PENDING');
      fetchDriverVerificationSummary();
    }
  }, [driver]);

  const fetchDriverVerificationSummary = async () => {
    if (!driver) return;
    try {
      const targetId = driver.driverId || driver.id;
      const res = await api.get(`/driver/verification/summary`, {
        headers: { 'x-driver-id': targetId }
      });
      if (res.data) {
        if (res.data.id) setVerificationId(res.data.id);
        if (res.data.status) setOverallStatus(res.data.status);
        if (Array.isArray(res.data.documents)) {
          setRemoteDocs(res.data.documents);
        }
      }
    } catch (err) {
      console.warn('Could not fetch detailed verification summary', err);
    }
  };

  if (!driver) return null;

  // 3 Mandatory Basic Documents
  const mandatoryDocs = [
    {
      id: 'LICENSE',
      type: 'DRIVING_LICENSE',
      titleAr: 'رخصة السياقة (Permis)',
      titleEn: 'Driving License (Permis)',
      icon: FileText,
    },
    {
      id: 'CIN',
      type: 'IDENTITY_CARD',
      titleAr: 'البطاقة الوطنية / جواز السفر (CIN)',
      titleEn: 'National ID / Passport (CIN)',
      icon: User,
    },
    {
      id: 'CARTE_GRISE',
      type: 'CARTE_GRISE',
      titleAr: 'البطاقة الرمادية (Carte Grise)',
      titleEn: 'Vehicle Registration (Carte Grise)',
      icon: Car,
    },
  ];

  const activeDocConfig = mandatoryDocs.find((d) => d.id === activeDocType) || mandatoryDocs[0];
  const activeRemoteDoc = remoteDocs.find(
    (d) => d.type === activeDocConfig.type || d.type.includes(activeDocType)
  );

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetImage = () => {
    setZoomLevel(1);
    setRotation(0);
  };
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  // 1. Action: Approve Driver Overall
  const handleApproveDriver = async () => {
    const targetVerificationId = verificationId || driver.id;
    setIsSubmitting(true);
    setActionError(null);
    try {
      await api.post(`/admin/verification/${targetVerificationId}/review`, {
        status: 'APPROVED',
      });
      setActionSuccess(isAr ? 'تم قبول السائق واعتماده بنجاح!' : 'Driver verification approved successfully!');
      setOverallStatus('APPROVED');
      setTimeout(() => {
        if (onRefresh) onRefresh();
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error('Approve driver failed', err);
      setActionError(err.response?.data?.message || 'Failed to approve driver verification. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Action: Prompt Reject Driver Modal
  const openRejectPrompt = (target: 'OVERALL' | 'DOCUMENT') => {
    setRejectTarget(target);
    setRejectionReason('');
    setActionError(null);
    setShowRejectModal(true);
  };

  // 3. Action: Submit Rejection with Mandatory Reason
  const handleSubmitRejection = async () => {
    if (!rejectionReason.trim()) {
      setActionError(isAr ? 'يرجى كتابة سبب الرفض الإجباري' : 'Rejection reason is mandatory.');
      return;
    }

    setIsSubmitting(true);
    setActionError(null);

    try {
      if (rejectTarget === 'OVERALL') {
        const targetVerificationId = verificationId || driver.id;
        await api.post(`/admin/verification/${targetVerificationId}/review`, {
          status: 'REJECTED',
          reason: rejectionReason.trim(),
        });
        setActionSuccess(isAr ? 'تم رفض ملف السائق بنجاح.' : 'Driver application rejected.');
        setOverallStatus('REJECTED');
      } else if (rejectTarget === 'DOCUMENT' && activeRemoteDoc?.id) {
        await api.post(`/admin/verification/documents/${activeRemoteDoc.id}/review`, {
          status: 'REJECTED',
          reason: rejectionReason.trim(),
        });
        setActionSuccess(isAr ? 'تم رفض الوثيقة الفردية بنجاح.' : 'Document rejected.');
        fetchDriverVerificationSummary();
      }

      setShowRejectModal(false);
      setTimeout(() => {
        if (onRefresh) onRefresh();
        if (rejectTarget === 'OVERALL') onClose();
      }, 1200);
    } catch (err: any) {
      console.error('Reject submission failed', err);
      setActionError(err.response?.data?.message || 'Failed to submit rejection. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Action: Approve Individual Document
  const handleApproveDocument = async () => {
    if (!activeRemoteDoc?.id) {
      setActionError(isAr ? 'لم يتم العثور على المعرف الفرعي للوثيقة' : 'Document ID not found.');
      return;
    }

    setIsSubmitting(true);
    setActionError(null);
    try {
      await api.post(`/admin/verification/documents/${activeRemoteDoc.id}/review`, {
        status: 'APPROVED',
      });
      setActionSuccess(isAr ? 'تم اعتماد الوثيقة بنجاح!' : 'Document approved!');
      fetchDriverVerificationSummary();
    } catch (err: any) {
      console.error('Document approval failed', err);
      setActionError(err.response?.data?.message || 'Failed to approve document.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sample document preview images
  const sampleImageUrls: Record<string, string> = {
    LICENSE: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop&q=80',
    CIN: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
    CARTE_GRISE: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&auto=format&fit=crop&q=80',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden text-gray-900 dark:text-white">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gray-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <Eye size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight">{driver.name || 'Unnamed Driver'}</h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                    overallStatus === 'APPROVED'
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                      : overallStatus === 'REJECTED'
                      ? 'bg-red-500/10 text-red-500 border-red-500/20'
                      : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                  }`}
                >
                  {overallStatus}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400 font-mono">
                Driver ID: {driver.driverId || driver.id} • {driver.phone}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 flex items-center justify-center text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Feedback Banners */}
        {actionSuccess && (
          <div className="mx-6 mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{actionSuccess}</span>
          </div>
        )}

        {actionError && (
          <div className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-bold flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{actionError}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left / Info Side Panel (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* 3 Basic Required Documents Progress Scale */}
            <div className="p-4 bg-gray-50 dark:bg-slate-950 rounded-2xl border border-gray-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 dark:text-slate-400">
                  {isAr ? 'نسبة الوثائق الأساسية (3)' : 'Basic Docs Completion (3)'}
                </span>
                <span className="text-sm font-black text-purple-600 dark:text-purple-400">
                  {driver.documentCount >= 3 ? '100%' : driver.documentCount === 2 ? '67%' : driver.documentCount === 1 ? '33%' : '0%'}
                </span>
              </div>

              <div className="w-full h-2 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 transition-all duration-500"
                  style={{
                    width: `${
                      driver.documentCount >= 3 ? 100 : driver.documentCount === 2 ? 67 : driver.documentCount === 1 ? 33 : 0
                    }%`,
                  }}
                />
              </div>

              <div className="space-y-2 pt-2 text-xs font-semibold">
                {mandatoryDocs.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between text-gray-600 dark:text-slate-300">
                    <span className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-500" />
                      {isAr ? doc.titleAr : doc.titleEn}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500">
                      {isAr ? 'مرفوع' : 'Uploaded'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Driver Vehicle Specs */}
            <div className="p-4 bg-gray-50 dark:bg-slate-950 rounded-2xl border border-gray-100 dark:border-slate-800 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
                <Car size={16} className="text-purple-500" />
                {isAr ? 'معلومات المركبة المسجلة' : 'Registered Vehicle Details'}
              </h4>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800">
                  <span className="text-[10px] text-gray-400 block">{isAr ? 'الشركة المصنعة' : 'Make'}</span>
                  <span className="font-bold">{driver.vehicleInfo?.make || 'Dacia'}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800">
                  <span className="text-[10px] text-gray-400 block">{isAr ? 'الموديل' : 'Model'}</span>
                  <span className="font-bold">{driver.vehicleInfo?.model || 'Logan'}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800">
                  <span className="text-[10px] text-gray-400 block">{isAr ? 'سنة الصنع' : 'Year'}</span>
                  <span className="font-bold">{driver.vehicleInfo?.year || '2021'}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800">
                  <span className="text-[10px] text-gray-400 block">{isAr ? 'رقم اللوحة' : 'Plate Number'}</span>
                  <span className="font-mono font-extrabold text-purple-500">{driver.vehicleInfo?.plate || '24591-أ-6'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right / Document Preview Panel (8 cols) */}
          <div className="lg:col-span-8 flex flex-col space-y-4">
            {/* Document Selector Tabs & Individual Document Review Trigger */}
            <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
              <div className="flex items-center gap-2">
                {mandatoryDocs.map((doc) => {
                  const isActive = activeDocType === doc.id;
                  const Icon = doc.icon;
                  return (
                    <button
                      key={doc.id}
                      onClick={() => {
                        setActiveDocType(doc.id as any);
                        handleResetImage();
                      }}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                        isActive
                          ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/20'
                          : 'bg-gray-50 dark:bg-slate-950 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-800 hover:bg-gray-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon size={14} />
                      <span>{isAr ? doc.titleAr : doc.titleEn}</span>
                    </button>
                  );
                })}
              </div>

              {/* Per-Document Approve/Reject Action Buttons */}
              {activeRemoteDoc?.id && (
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleApproveDocument}
                    disabled={isSubmitting}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-colors disabled:opacity-50"
                    title="Approve single document"
                  >
                    <Check size={14} />
                    <span>{isAr ? 'اعتماد الوثيقة' : 'Approve Doc'}</span>
                  </button>
                  <button
                    onClick={() => openRejectPrompt('DOCUMENT')}
                    disabled={isSubmitting}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/20 font-bold text-xs rounded-xl transition-colors disabled:opacity-50"
                    title="Reject single document"
                  >
                    <XCircle size={14} />
                    <span>{isAr ? 'رفض الوثيقة' : 'Reject Doc'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Interactive Image Viewer Workspace */}
            <div className="flex-1 min-h-[380px] bg-slate-950 rounded-2xl border border-slate-800 relative flex items-center justify-center overflow-hidden group">
              {/* Image Toolbar Controls */}
              <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-800">
                <button
                  onClick={handleZoomIn}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  title="Zoom In (+)"
                >
                  <ZoomIn size={16} />
                </button>
                <button
                  onClick={handleZoomOut}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  title="Zoom Out (-)"
                >
                  <ZoomOut size={16} />
                </button>
                <button
                  onClick={handleRotate}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  title="Rotate Clockwise (90°)"
                >
                  <RotateCw size={16} />
                </button>
                <button
                  onClick={handleResetImage}
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  title="Reset View"
                >
                  <RefreshCw size={16} />
                </button>
              </div>

              {/* Document Image Element */}
              <div className="w-full h-full flex items-center justify-center p-6 cursor-grab active:cursor-grabbing overflow-auto">
                <img
                  src={activeRemoteDoc?.url || sampleImageUrls[activeDocType]}
                  alt={activeDocConfig.titleEn}
                  className="max-h-80 object-contain rounded-xl shadow-2xl transition-transform duration-200 select-none"
                  style={{
                    transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                  }}
                />
              </div>

              {/* Bottom Image Metadata Overlay */}
              <div className="absolute bottom-4 left-4 right-4 z-20 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-purple-400" />
                  <span className="font-bold">{activeDocConfig.titleEn}</span>
                  {activeRemoteDoc?.status && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-extrabold uppercase">
                      {activeRemoteDoc.status}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                  <span>Zoom: {(zoomLevel * 100).toFixed(0)}%</span>
                  <span>Rotation: {rotation}°</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Review Actions */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 bg-gray-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-slate-400">
            <Clock size={14} />
            <span>{isAr ? 'تم الرفع:' : 'Uploaded:'} {new Date(driver.updatedAt || Date.now()).toLocaleDateString()}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700 text-gray-800 dark:text-white font-bold text-xs rounded-xl transition-colors disabled:opacity-50"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>

            {/* Overall Driver Rejection Action Button */}
            <button
              onClick={() => openRejectPrompt('OVERALL')}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/20 font-bold text-xs rounded-xl transition-all shadow-sm disabled:opacity-50"
            >
              <XCircle size={16} />
              <span>{isAr ? 'رفض السائق' : 'Reject Driver'}</span>
            </button>

            {/* Overall Driver Approval Action Button */}
            <button
              onClick={handleApproveDriver}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <ShieldCheck size={16} />
              )}
              <span>{isAr ? 'اعتماد وحظر قبول السائق (Approve)' : 'Approve Driver'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mandatory Rejection Reason Input Sub-Modal Prompt */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 text-gray-900 dark:text-white">
            <div className="flex items-center gap-3 text-red-500">
              <ShieldAlert size={24} />
              <h4 className="text-lg font-black tracking-tight">
                {rejectTarget === 'OVERALL'
                  ? (isAr ? 'سبب رفض طلب السائق الإجباري' : 'Mandatory Driver Rejection Reason')
                  : (isAr ? 'سبب رفض الوثيقة الإجباري' : 'Mandatory Document Rejection Reason')}
              </h4>
            </div>

            <p className="text-xs text-gray-500 dark:text-slate-400">
              {isAr
                ? 'سيتم إرسال هذا السبب إلى السائق في التطبيق لتمكينه من إعادة رفع الوثيقة الصحيحة.'
                : 'This reason will be logged and communicated to the driver to request correct document re-upload.'}
            </p>

            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder={
                isAr
                  ? 'اكتب سبب الرفض هنا (مثال: رخصة السياقة منتهية الصلاحية / الصورة غير واضحة)...'
                  : 'Enter mandatory rejection reason (e.g., License expired / Blurry photo)...'
              }
              rows={4}
              className="w-full p-3 bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl text-xs font-medium focus:outline-none focus:border-red-500 transition-all resize-none"
            />

            {actionError && (
              <p className="text-xs font-bold text-red-500 flex items-center gap-1.5">
                <AlertCircle size={14} />
                <span>{actionError}</span>
              </p>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowRejectModal(false)}
                disabled={isSubmitting}
                className="px-4 py-2 bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 dark:hover:bg-slate-700 text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={handleSubmitRejection}
                disabled={isSubmitting || !rejectionReason.trim()}
                className="flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow shadow-red-600/30 transition-all disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                <span>{isAr ? 'تأكيد الرفض والإرسال' : 'Confirm Rejection'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
