import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import { Card, Button, Badge, StatusBadge, Modal, Select, Button as Btn } from '../components/Layout';
import { SERVICES, getStatusLabel } from '../data';
import {
  FileText, Clock, CheckCircle2, AlertCircle, Bell, User,
  ChevronRight, Eye, Upload, DollarSign, BarChart3, Plus,
  Building2, Users, TrendingUp, Download, Filter
} from 'lucide-react';
import type { ApplicationStatus } from '../types';

// ============================================
// Customer Dashboard
// ============================================
export function CustomerDashboard() {
  const { state, t } = useApp();
  const lang = state.lang;
  const navigate = useNavigate();
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');

  if (!state.isAuthenticated) {
    navigate('/login');
    return null;
  }

  const myApps = state.applications.filter(a => a.userId === state.currentUser?.id);
  const unreadNotifs = state.notifications.filter(n => n.userId === state.currentUser?.id && !n.read);

  const statusCounts = {
    draft: myApps.filter(a => a.status === 'draft').length,
    active: myApps.filter(a => ['submitted', 'document_review', 'processing'].includes(a.status)).length,
    verified: myApps.filter(a => a.status === 'verified').length,
    completed: myApps.filter(a => a.status === 'completed').length,
  };

  const filteredApps = filterStatus === 'all' ? myApps : myApps.filter(a => a.status === filterStatus);
  const selectedApplication = myApps.find(a => a.id === selectedApp);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t('مرحباً', 'Welcome')}, {state.currentUser?.name}
          </h1>
          <p className="text-sm text-slate-500">{t('إدارة طلباتك ومتابعة حالاتها', 'Manage your applications and track their status')}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell size={20} className="text-slate-500" />
            {unreadNotifs.length > 0 && (
              <span className="absolute -top-1 -end-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                {unreadNotifs.length}
              </span>
            )}
          </div>
          <Link to={`/apply/tourist_visa`}>
            <Button size="sm"><Plus size={14} />{t('طلب جديد', 'New Application')}</Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: t('مسودات', 'Drafts'), count: statusCounts.draft, icon: FileText, color: 'text-slate-500 bg-slate-100 dark:bg-navy-800' },
          { label: t('نشطة', 'Active'), count: statusCounts.active, icon: Clock, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
          { label: t('تم التحقق', 'Verified'), count: statusCounts.verified, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30' },
          { label: t('مكتملة', 'Completed'), count: statusCounts.completed, icon: CheckCircle2, color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
        ].map((stat, idx) => (
          <Card key={idx} className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon size={18} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.count}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Notifications */}
      {unreadNotifs.length > 0 && (
        <Card className="p-4 mb-6 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10">
          <div className="flex items-center gap-2 mb-2">
            <Bell size={16} className="text-amber-600" />
            <span className="font-medium text-sm text-amber-800 dark:text-amber-300">{t('إشعارات جديدة', 'New Notifications')}</span>
          </div>
          {unreadNotifs.map(n => (
            <div key={n.id} className="text-sm text-amber-700 dark:text-amber-400 py-1">
              {n.message[lang]}
            </div>
          ))}
        </Card>
      )}

      {/* Applications List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 dark:text-white">{t('طلباتي', 'My Applications')}</h3>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-sm border border-slate-200 dark:border-navy-700 rounded-lg px-3 py-1.5 bg-white dark:bg-navy-800 text-slate-700 dark:text-slate-300"
          >
            <option value="all">{t('الكل', 'All')}</option>
            <option value="submitted">{t('مُقدَّم', 'Submitted')}</option>
            <option value="document_review">{t('مراجعة', 'Review')}</option>
            <option value="processing">{t('معالجة', 'Processing')}</option>
            <option value="verified">{t('تحقق', 'Verified')}</option>
            <option value="completed">{t('مكتمل', 'Completed')}</option>
          </select>
        </div>

        {filteredApps.length === 0 ? (
          <div className="text-center py-8">
            <FileText size={32} className="mx-auto text-slate-300 dark:text-navy-700 mb-2" />
            <p className="text-sm text-slate-500">{t('لا توجد طلبات', 'No applications found')}</p>
            <Link to="/services" className="text-emerald-600 text-sm hover:underline mt-2 inline-block">
              {t('استعرض الخدمات', 'Browse Services')}
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredApps.map(app => {
              const service = SERVICES.find(s => s.id === app.serviceType);
              return (
                <div
                  key={app.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-navy-700 hover:bg-slate-50 dark:hover:bg-navy-800 cursor-pointer transition-colors"
                  onClick={() => setSelectedApp(app.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${service?.color || 'from-slate-400 to-slate-600'} flex items-center justify-center`}>
                      <FileText size={16} className="text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-slate-900 dark:text-white">{service?.name[lang] || app.serviceType}</p>
                      <p className="text-xs text-slate-500" dir="ltr">{app.referenceCode} • {app.createdAt}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={app.status} lang={lang} />
                    <ChevronRight size={16} className="text-slate-400" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Application Detail Modal */}
      <Modal isOpen={!!selectedApp} onClose={() => setSelectedApp(null)} title={t('تفاصيل الطلب', 'Application Details')}>
        {selectedApplication && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500" dir="ltr">{selectedApplication.referenceCode}</span>
              <StatusBadge status={selectedApplication.status} lang={lang} />
            </div>
            {/* Status Steps */}
            <div className="flex items-center gap-1">
              {['submitted', 'document_review', 'processing', 'verified', 'completed'].map((s, idx) => {
                const isActive = ['submitted', 'document_review', 'processing', 'verified', 'completed'].indexOf(selectedApplication.status) >= idx;
                return (
                  <div key={s} className={`flex-1 h-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-navy-700'}`} />
                );
              })}
            </div>
            {/* Info */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-slate-500">{t('المتقدمون', 'Applicants')}:</span> <span className="font-medium">{selectedApplication.applicants.length}</span></div>
              <div><span className="text-slate-500">{t('التكلفة', 'Cost')}:</span> <span className="font-medium">{selectedApplication.totalCost} AED</span></div>
              <div><span className="text-slate-500">{t('المستندات', 'Documents')}:</span> <span className="font-medium">{selectedApplication.documents.length}</span></div>
              <div><span className="text-slate-500">{t('الدفع', 'Payment')}:</span> <Badge color={selectedApplication.paymentStatus === 'paid' ? 'success' : 'default'}>{selectedApplication.paymentStatus}</Badge></div>
            </div>
            {/* Timeline */}
            <div>
              <h4 className="text-sm font-semibold mb-2">{t('السجل', 'Timeline')}</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {[...selectedApplication.statusHistory].reverse().map(ev => (
                  <div key={ev.id} className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>{getStatusLabel(ev.toStatus, lang)}</span>
                    <span className="text-slate-400">{new Date(ev.timestamp).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ============================================
// Agency Dashboard
// ============================================
export function AgencyDashboard() {
  const { state, t } = useApp();
  const lang = state.lang;
  const navigate = useNavigate();
  const [showBulkImport, setShowBulkImport] = useState(false);

  if (!state.isAuthenticated || state.currentUser?.role !== 'agency_owner') {
    navigate('/login');
    return null;
  }

  const agencyApps = state.applications.filter(a => a.agencyId === state.currentUser?.agencyId);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('لوحة الوكالة', 'Agency Dashboard')}</h1>
          <p className="text-sm text-slate-500">{t('إدارة طلبات وكالتك', 'Manage your agency applications')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowBulkImport(true)}>
            <Upload size={14} />{t('استيراد CSV', 'Import CSV')}
          </Button>
          <Link to="/apply/tourist_visa">
            <Button size="sm"><Plus size={14} />{t('طلب جديد', 'New Application')}</Button>
          </Link>
        </div>
      </div>

      {/* Agency Info */}
      <Card className="p-6 mb-6 bg-gradient-to-r from-gold-50 to-amber-50 dark:from-gold-900/10 dark:to-amber-900/10 border-gold-200 dark:border-gold-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gold-500 flex items-center justify-center">
              <Building2 size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">{t('وكالة السفر الذهبية', 'Golden Travel Agency')}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge color="success">{t('معتمدة', 'Verified')}</Badge>
                <Badge color="warning">{t('ذهبي', 'Gold Tier')}</Badge>
              </div>
            </div>
          </div>
          <div className="text-end">
            <p className="text-2xl font-bold text-emerald-600">15%</p>
            <p className="text-xs text-slate-500">{t('خصم الوكالة', 'Agency Discount')}</p>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: t('إجمالي الطلبات', 'Total Apps'), value: agencyApps.length, icon: BarChart3 },
          { label: t('قيد المعالجة', 'Processing'), value: agencyApps.filter(a => a.status === 'processing').length, icon: Clock },
          { label: t('مكتملة', 'Completed'), value: agencyApps.filter(a => a.status === 'completed').length, icon: CheckCircle2 },
          { label: t('الإيرادات', 'Revenue'), value: `${agencyApps.reduce((sum, a) => sum + a.totalCost, 0)} AED`, icon: DollarSign },
        ].map((stat, idx) => (
          <Card key={idx} className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                <stat.icon size={18} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Applications Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 dark:text-white">{t('طلبات الوكالة', 'Agency Applications')}</h3>
          <Button variant="ghost" size="sm"><Download size={14} />{t('تصدير', 'Export')}</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-navy-700">
                <th className="text-start py-3 px-2 font-medium text-slate-500">{t('المرجع', 'Reference')}</th>
                <th className="text-start py-3 px-2 font-medium text-slate-500">{t('الخدمة', 'Service')}</th>
                <th className="text-start py-3 px-2 font-medium text-slate-500">{t('الحالة', 'Status')}</th>
                <th className="text-start py-3 px-2 font-medium text-slate-500">{t('التاريخ', 'Date')}</th>
                <th className="text-start py-3 px-2 font-medium text-slate-500">{t('المبلغ', 'Amount')}</th>
              </tr>
            </thead>
            <tbody>
              {agencyApps.map(app => {
                const service = SERVICES.find(s => s.id === app.serviceType);
                return (
                  <tr key={app.id} className="border-b border-slate-100 dark:border-navy-800 hover:bg-slate-50 dark:hover:bg-navy-800">
                    <td className="py-3 px-2 font-medium text-slate-900 dark:text-white" dir="ltr">{app.referenceCode}</td>
                    <td className="py-3 px-2 text-slate-600 dark:text-slate-400">{service?.name[lang]}</td>
                    <td className="py-3 px-2"><StatusBadge status={app.status} lang={lang} /></td>
                    <td className="py-3 px-2 text-slate-500">{app.createdAt}</td>
                    <td className="py-3 px-2 font-medium text-slate-900 dark:text-white">{app.totalCost} AED</td>
                  </tr>
                );
              })}
              {agencyApps.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-slate-400">{t('لا توجد طلبات', 'No applications')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Bulk Import Modal */}
      <Modal isOpen={showBulkImport} onClose={() => setShowBulkImport(false)} title={t('استيراد طلبات من CSV', 'Import Applications from CSV')}>
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t('ارفع ملف CSV يحتوي على بيانات المتقدمين. سيتم معاينة البيانات قبل الحفظ.', 'Upload a CSV file with applicant data. Data will be previewed before saving.')}
          </p>
          <div className="border-2 border-dashed border-slate-300 dark:border-navy-700 rounded-xl p-8 text-center">
            <Upload size={32} className="mx-auto text-slate-400 mb-2" />
            <p className="text-sm text-slate-500">{t('اسحب الملف هنا أو انقر للرفع', 'Drag file here or click to upload')}</p>
            <p className="text-xs text-slate-400 mt-1">CSV, XLSX</p>
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShowBulkImport(false)}>{t('إلغاء', 'Cancel')}</Button>
            <Button>{t('معاينة', 'Preview')}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ============================================
// Admin Dashboard
// ============================================
export function AdminDashboard() {
  const { state, t, updateApplicationStatus } = useApp();
  const lang = state.lang;
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterService, setFilterService] = useState('all');
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [showCatalogEditor, setShowCatalogEditor] = useState(false);

  if (!state.isAuthenticated || state.currentUser?.role !== 'admin') {
    navigate('/login');
    return null;
  }

  const allApps = state.applications;
  const filteredApps = allApps.filter(a => {
    if (filterStatus !== 'all' && a.status !== filterStatus) return false;
    if (filterService !== 'all' && a.serviceType !== filterService) return false;
    return true;
  });

  const selectedApplication = allApps.find(a => a.id === selectedApp);

  const handleStatusChange = (appId: string, newStatus: ApplicationStatus) => {
    updateApplicationStatus(appId, newStatus, t('تم التحديث بواسطة المدير', 'Updated by admin'));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('لوحة الإدارة', 'Admin Dashboard')}</h1>
          <p className="text-sm text-slate-500">{t('إدارة الطلبات والخدمات والمستخدمين', 'Manage applications, services, and users')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowCatalogEditor(true)}>
            <FileText size={14} />{t('تحرير الخدمات', 'Edit Services')}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[
          { label: t('إجمالي', 'Total'), value: allApps.length, color: 'bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300' },
          { label: t('مُقدَّم', 'Submitted'), value: allApps.filter(a => a.status === 'submitted').length, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' },
          { label: t('قيد المعالجة', 'Processing'), value: allApps.filter(a => a.status === 'processing').length, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' },
          { label: t('تم التحقق', 'Verified'), value: allApps.filter(a => a.status === 'verified').length, color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' },
          { label: t('مكتمل', 'Completed'), value: allApps.filter(a => a.status === 'completed').length, color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' },
        ].map((stat, idx) => (
          <Card key={idx} className="p-4">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${stat.color}`}>
              <BarChart3 size={14} />
            </div>
            <p className="text-xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
            <p className="text-xs text-slate-500">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <Filter size={16} className="text-slate-400" />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="text-sm border border-slate-200 dark:border-navy-700 rounded-lg px-3 py-1.5 bg-white dark:bg-navy-800 text-slate-700 dark:text-slate-300">
            <option value="all">{t('جميع الحالات', 'All Statuses')}</option>
            <option value="submitted">{t('مُقدَّم', 'Submitted')}</option>
            <option value="document_review">{t('مراجعة', 'Review')}</option>
            <option value="processing">{t('معالجة', 'Processing')}</option>
            <option value="verified">{t('تحقق', 'Verified')}</option>
            <option value="completed">{t('مكتمل', 'Completed')}</option>
            <option value="rejected">{t('مرفوض', 'Rejected')}</option>
          </select>
          <select value={filterService} onChange={e => setFilterService(e.target.value)} className="text-sm border border-slate-200 dark:border-navy-700 rounded-lg px-3 py-1.5 bg-white dark:bg-navy-800 text-slate-700 dark:text-slate-300">
            <option value="all">{t('جميع الخدمات', 'All Services')}</option>
            {SERVICES.map(s => <option key={s.id} value={s.id}>{s.name[lang]}</option>)}
          </select>
        </div>
      </Card>

      {/* Applications Table */}
      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-navy-700">
                <th className="text-start py-3 px-2 font-medium text-slate-500">{t('المرجع', 'Ref')}</th>
                <th className="text-start py-3 px-2 font-medium text-slate-500">{t('الخدمة', 'Service')}</th>
                <th className="text-start py-3 px-2 font-medium text-slate-500">{t('النوع', 'Type')}</th>
                <th className="text-start py-3 px-2 font-medium text-slate-500">{t('الحالة', 'Status')}</th>
                <th className="text-start py-3 px-2 font-medium text-slate-500">{t('الدفع', 'Payment')}</th>
                <th className="text-start py-3 px-2 font-medium text-slate-500">{t('إجراءات', 'Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredApps.map(app => {
                const service = SERVICES.find(s => s.id === app.serviceType);
                return (
                  <tr key={app.id} className="border-b border-slate-100 dark:border-navy-800 hover:bg-slate-50 dark:hover:bg-navy-800">
                    <td className="py-3 px-2 font-medium text-slate-900 dark:text-white" dir="ltr">{app.referenceCode}</td>
                    <td className="py-3 px-2 text-slate-600 dark:text-slate-400">{service?.name[lang]}</td>
                    <td className="py-3 px-2"><Badge color={app.agencyId ? 'purple' : 'info'}>{app.agencyId ? 'B2B' : 'B2C'}</Badge></td>
                    <td className="py-3 px-2"><StatusBadge status={app.status} lang={lang} /></td>
                    <td className="py-3 px-2"><Badge color={app.paymentStatus === 'paid' ? 'success' : 'default'}>{app.paymentStatus}</Badge></td>
                    <td className="py-3 px-2">
                      <button onClick={() => setSelectedApp(app.id)} className="text-emerald-600 hover:underline text-xs">
                        {t('عرض', 'View')}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredApps.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-slate-400">{t('لا توجد نتائج', 'No results')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Application Detail Modal */}
      <Modal isOpen={!!selectedApp} onClose={() => setSelectedApp(null)} title={t('تفاصيل الطلب', 'Application Details')}>
        {selectedApplication && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span dir="ltr" className="font-mono text-sm">{selectedApplication.referenceCode}</span>
              <StatusBadge status={selectedApplication.status} lang={lang} />
            </div>

            {/* Applicant Info */}
            <div className="p-3 bg-slate-50 dark:bg-navy-800 rounded-lg">
              <h4 className="text-sm font-semibold mb-2">{t('المتقدم', 'Applicant')}</h4>
              {selectedApplication.applicants.map(a => (
                <div key={a.id} className="text-xs text-slate-600 dark:text-slate-400">
                  <p className="font-medium text-slate-900 dark:text-white">{a.fullName}</p>
                  <p>{a.nationality} | {a.passportNumber} | {a.countryOfResidence}</p>
                </div>
              ))}
            </div>

            {/* Documents */}
            <div>
              <h4 className="text-sm font-semibold mb-2">{t('المستندات', 'Documents')}</h4>
              <div className="space-y-1">
                {selectedApplication.documents.map(d => (
                  <div key={d.id} className="flex items-center justify-between text-xs p-2 bg-slate-50 dark:bg-navy-800 rounded">
                    <span>{d.fileName}</span>
                    <Badge color={d.status === 'approved' ? 'success' : d.status === 'rejected' ? 'error' : 'warning'}>{d.status}</Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Admin Actions */}
            <div className="pt-4 border-t border-slate-200 dark:border-navy-700">
              <h4 className="text-sm font-semibold mb-3">{t('إجراءات', 'Actions')}</h4>
              <div className="flex flex-wrap gap-2">
                {selectedApplication.status === 'submitted' && (
                  <Button size="sm" onClick={() => handleStatusChange(selectedApplication.id, 'document_review')}>
                    {t('بدء المراجعة', 'Start Review')}
                  </Button>
                )}
                {selectedApplication.status === 'document_review' && (
                  <>
                    <Button size="sm" onClick={() => handleStatusChange(selectedApplication.id, 'processing')}>
                      {t('قبول وبدء المعالجة', 'Accept & Process')}
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleStatusChange(selectedApplication.id, 'rejected')}>
                      {t('رفض', 'Reject')}
                    </Button>
                  </>
                )}
                {selectedApplication.status === 'processing' && (
                  <Button size="sm" onClick={() => handleStatusChange(selectedApplication.id, 'verified')}>
                    {t('تحقق وإصدار', 'Verify & Issue')}
                  </Button>
                )}
                {selectedApplication.status === 'verified' && (
                  <Button size="sm" onClick={() => handleStatusChange(selectedApplication.id, 'approved_for_payment')}>
                    {t('اعتماد للدفع', 'Approve for Payment')}
                  </Button>
                )}
                {selectedApplication.status === 'approved_for_payment' && (
                  <Button size="sm" onClick={() => handleStatusChange(selectedApplication.id, 'completed')}>
                    {t('إكمال', 'Complete')}
                  </Button>
                )}
              </div>
            </div>

            {/* Audit Log */}
            <div className="pt-4 border-t border-slate-200 dark:border-navy-700">
              <h4 className="text-sm font-semibold mb-2">{t('سجل التدقيق', 'Audit Log')}</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {[...selectedApplication.statusHistory].reverse().map(ev => (
                  <div key={ev.id} className="text-xs text-slate-500 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>{getStatusLabel(ev.toStatus, lang)}</span>
                    <span className="text-slate-400">by {ev.actorRole}</span>
                    <span className="text-slate-400">{new Date(ev.timestamp).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Catalog Editor Modal */}
      <Modal isOpen={showCatalogEditor} onClose={() => setShowCatalogEditor(false)} title={t('محرر الخدمات', 'Service Catalog Editor')}>
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {t('يمكنك هنا تعديل متطلبات الخدمات، الأسعار، والجنسيات المدعومة.', 'Here you can edit service requirements, pricing, and supported nationalities.')}
          </p>
          <div className="space-y-3">
            {SERVICES.map(service => (
              <div key={service.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-navy-800 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{service.name[lang]}</p>
                  <p className="text-xs text-slate-500">{service.pricing.serviceFee + service.pricing.governmentFee} {service.pricing.currency}</p>
                </div>
                <Button size="sm" variant="ghost">{t('تعديل', 'Edit')}</Button>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
}
