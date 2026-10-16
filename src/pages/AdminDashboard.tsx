import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import { SERVICES, getStatusLabel } from '../data';
import { Card, Button, Badge, StatusBadge, Modal, Input } from '../components/Layout';
import { supabase } from '../lib/supabaseClient';
import {
  BarChart3, FileText, Users, DollarSign, Eye, Download,
  CheckCircle2, Clock, XCircle, AlertCircle, RefreshCw,
  TrendingUp, Package, Settings
} from 'lucide-react';
import type { Application, ApplicationStatus } from '../types';

export default function AdminDashboard() {
  const { state, t, updateApplicationStatus } = useApp();
  const navigate = useNavigate();
  const lang = state.lang;
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showDocViewer, setShowDocViewer] = useState(false);
  const [selectedDocUrl, setSelectedDocUrl] = useState<string>('');
  const [selectedDocName, setSelectedDocName] = useState<string>('');

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        setApplications(data as Application[]);
      }
    } catch (err) {
      console.error('Error loading applications:', err);
      // Fallback to local state
      setApplications(state.applications);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (appId: string, newStatus: ApplicationStatus) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', appId);

      if (error) throw error;

      updateApplicationStatus(appId, newStatus, t('تم التحديث بواسطة المدير', 'Updated by admin'));
      await loadApplications();
    } catch (err) {
      console.error('Error updating status:', err);
      // Fallback to local update
      updateApplicationStatus(appId, newStatus, t('تم التحديث', 'Updated'));
    }
  };

  const handleViewDocument = (url: string, name: string) => {
    setSelectedDocUrl(url);
    setSelectedDocName(name);
    setShowDocViewer(true);
  };

  const filteredApps = statusFilter === 'all'
    ? applications
    : applications.filter(a => a.status === statusFilter);

  const stats = {
    total: applications.length,
    pending: applications.filter(a => ['submitted', 'document_review'].includes(a.status)).length,
    processing: applications.filter(a => a.status === 'processing').length,
    verified: applications.filter(a => ['verified', 'approved_for_payment'].includes(a.status)).length,
    completed: applications.filter(a => a.status === 'completed').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
    revenue: applications
      .filter(a => a.status === 'completed')
      .reduce((sum, a) => sum + a.totalCost, 0),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t('لوحة الإدارة', 'Admin Dashboard')}
          </h1>
          <p className="text-sm text-slate-500">
            {t('إدارة الطلبات والخدمات', 'Manage applications and services')}
          </p>
        </div>
        <Button onClick={loadApplications} variant="outline" size="sm">
          <RefreshCw size={14} />
          {t('تحديث', 'Refresh')}
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <StatCard
          icon={Package}
          label={t('الإجمالي', 'Total')}
          value={stats.total}
          color="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
        />
        <StatCard
          icon={Clock}
          label={t('قيد المراجعة', 'Pending')}
          value={stats.pending}
          color="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
        />
        <StatCard
          icon={RefreshCw}
          label={t('معالجة', 'Processing')}
          value={stats.processing}
          color="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400"
        />
        <StatCard
          icon={CheckCircle2}
          label={t('معتمد', 'Verified')}
          value={stats.verified}
          color="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
        />
        <StatCard
          icon={TrendingUp}
          label={t('مكتمل', 'Completed')}
          value={stats.completed}
          color="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
        />
        <StatCard
          icon={DollarSign}
          label={t('الإيرادات', 'Revenue')}
          value={`${stats.revenue} AED`}
          color="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400"
        />
      </div>

      {/* Filters */}
      <Card className="p-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
            {t('تصفية حسب الحالة:', 'Filter by status:')}
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <option value="all">{t('الكل', 'All')}</option>
            <option value="submitted">{t('مُقدَّم', 'Submitted')}</option>
            <option value="document_review">{t('مراجعة', 'Review')}</option>
            <option value="processing">{t('معالجة', 'Processing')}</option>
            <option value="verified">{t('تحقق', 'Verified')}</option>
            <option value="completed">{t('مكتمل', 'Completed')}</option>
            <option value="rejected">{t('مرفوض', 'Rejected')}</option>
          </select>
        </div>
      </Card>

      {/* Applications Table */}
      <Card className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-start py-3 px-2 font-medium text-slate-500">{t('المرجع', 'Ref')}</th>
                <th className="text-start py-3 px-2 font-medium text-slate-500">{t('الخدمة', 'Service')}</th>
                <th className="text-start py-3 px-2 font-medium text-slate-500">{t('المتقدم', 'Applicant')}</th>
                <th className="text-start py-3 px-2 font-medium text-slate-500">{t('الحالة', 'Status')}</th>
                <th className="text-start py-3 px-2 font-medium text-slate-500">{t('التاريخ', 'Date')}</th>
                <th className="text-start py-3 px-2 font-medium text-slate-500">{t('إجراءات', 'Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    <RefreshCw size={20} className="animate-spin mx-auto mb-2" />
                    {t('جاري التحميل...', 'Loading...')}
                  </td>
                </tr>
              ) : filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    {t('لا توجد طلبات', 'No applications found')}
                  </td>
                </tr>
              ) : (
                filteredApps.map(app => {
                  const service = SERVICES.find(s => s.id === app.serviceType);
                  const applicant = app.applicants[0];
                  return (
                    <tr key={app.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-2 font-mono text-xs text-slate-900 dark:text-white" dir="ltr">
                        {app.referenceCode}
                      </td>
                      <td className="py-3 px-2 text-slate-600 dark:text-slate-400">
                        {service?.name[lang] || app.serviceType}
                      </td>
                      <td className="py-3 px-2">
                        <div className="text-xs">
                          <p className="font-medium text-slate-900 dark:text-white">
                            {applicant?.fullName || 'N/A'}
                          </p>
                          <p className="text-slate-500">{applicant?.nationality}</p>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <StatusBadge status={app.status} lang={lang} />
                      </td>
                      <td className="py-3 px-2 text-xs text-slate-500">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setSelectedApp(app)}
                            className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
                            title={t('عرض', 'View')}
                          >
                            <Eye size={14} />
                          </button>
                          {app.documents && app.documents.length > 0 && (
                            <button
                              onClick={() => {
                                const doc = app.documents[0];
                                handleViewDocument(doc.storageKey, doc.fileName);
                              }}
                              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400"
                              title={t('عرض المستندات', 'View Documents')}
                            >
                              <FileText size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Application Detail Modal */}
      <Modal
        isOpen={!!selectedApp}
        onClose={() => setSelectedApp(null)}
        title={t('تفاصيل الطلب', 'Application Details')}
      >
        {selectedApp && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm text-slate-500" dir="ltr">
                {selectedApp.referenceCode}
              </span>
              <StatusBadge status={selectedApp.status} lang={lang} />
            </div>

            {/* Applicant Info */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <h4 className="text-xs font-semibold mb-2">{t('المتقدم', 'Applicant')}</h4>
              {selectedApp.applicants.map(a => (
                <div key={a.id} className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  <p className="font-medium text-slate-900 dark:text-white">{a.fullName}</p>
                  <p>{a.nationality} | {a.passportNumber}</p>
                  <p>{a.countryOfResidence} | {a.phone}</p>
                </div>
              ))}
            </div>

            {/* Documents */}
            <div>
              <h4 className="text-xs font-semibold mb-2">{t('المستندات', 'Documents')}</h4>
              <div className="space-y-1">
                {selectedApp.documents.map(d => (
                  <div key={d.id} className="flex items-center justify-between text-xs p-2 bg-slate-50 dark:bg-slate-800 rounded">
                    <span className="truncate">{d.fileName}</span>
                    <div className="flex items-center gap-1">
                      <Badge color={d.status === 'approved' ? 'success' : d.status === 'rejected' ? 'error' : 'warning'}>
                        {d.status}
                      </Badge>
                      <button
                        onClick={() => handleViewDocument(d.storageKey, d.fileName)}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                      >
                        <Eye size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Actions */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
              <h4 className="text-xs font-semibold mb-2">{t('تغيير الحالة', 'Change Status')}</h4>
              <div className="flex flex-wrap gap-2">
                {selectedApp.status === 'submitted' && (
                  <Button size="sm" onClick={() => handleStatusChange(selectedApp.id, 'document_review')}>
                    {t('بدء المراجعة', 'Start Review')}
                  </Button>
                )}
                {selectedApp.status === 'document_review' && (
                  <>
                    <Button size="sm" onClick={() => handleStatusChange(selectedApp.id, 'processing')}>
                      {t('قبول', 'Accept')}
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleStatusChange(selectedApp.id, 'rejected')}>
                      {t('رفض', 'Reject')}
                    </Button>
                  </>
                )}
                {selectedApp.status === 'processing' && (
                  <Button size="sm" onClick={() => handleStatusChange(selectedApp.id, 'verified')}>
                    {t('تحقق', 'Verify')}
                  </Button>
                )}
                {selectedApp.status === 'verified' && (
                  <Button size="sm" onClick={() => handleStatusChange(selectedApp.id, 'approved_for_payment')}>
                    {t('اعتماد دفع', 'Approve Payment')}
                  </Button>
                )}
                {selectedApp.status === 'approved_for_payment' && (
                  <Button size="sm" onClick={() => handleStatusChange(selectedApp.id, 'completed')}>
                    {t('إكمال', 'Complete')}
                  </Button>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
              <h4 className="text-xs font-semibold mb-2">{t('السجل', 'Timeline')}</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {[...selectedApp.statusHistory].reverse().map(ev => (
                  <div key={ev.id} className="text-[10px] text-slate-500 flex items-center gap-1">
                    <div className="w-1 h-1 rounded-full bg-emerald-500" />
                    <span>{getStatusLabel(ev.toStatus, lang)}</span>
                    <span className="text-slate-400">
                      {new Date(ev.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Document Viewer Modal */}
      <Modal
        isOpen={showDocViewer}
        onClose={() => setShowDocViewer(false)}
        title={selectedDocName}
      >
        <div className="space-y-3">
          {selectedDocUrl && (
            <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 text-center">
              {selectedDocUrl.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                <img
                  src={selectedDocUrl}
                  alt={selectedDocName}
                  className="max-w-full max-h-96 mx-auto rounded"
                />
              ) : (
                <div className="py-8">
                  <FileText size={48} className="mx-auto text-slate-400 mb-2" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">{selectedDocName}</p>
                  <a
                    href={selectedDocUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-3 text-sm text-emerald-600 hover:underline"
                  >
                    <Download size={14} />
                    {t('تحميل', 'Download')}
                  </a>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end">
            <Button variant="ghost" onClick={() => setShowDocViewer(false)}>
              {t('إغلاق', 'Close')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <Card className="p-3">
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={14} />
        </div>
        <div>
          <p className="text-lg font-bold text-slate-900 dark:text-white">{value}</p>
          <p className="text-[10px] text-slate-500">{label}</p>
        </div>
      </div>
    </Card>
  );
}
