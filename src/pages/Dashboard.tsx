import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../store';
import { SERVICES, getStatusLabel } from '../data';
import { convertCurrency, formatCurrency } from '../preferences';
import { Card, Button, Badge, StatusBadge, Modal } from '../components/Layout';
import { FileText, Clock, CheckCircle2, Bell, Plus, Building2, BarChart3, Upload, Download, ChevronRight } from 'lucide-react';
import type { ApplicationStatus } from '../types';

// Customer Dashboard
export function CustomerDashboard() {
  const { state, t } = useApp();
  const lang = state.lang;
  const currency = state.preferences.currency;
  const navigate = useNavigate();
  const [selectedApp, setSelectedApp] = useState<string | null>(null);

  if (!state.isAuthenticated) { navigate('/login'); return null; }

  const myApps = state.applications.filter(a => a.userId === state.currentUser?.id);
  const unreadNotifs = state.notifications.filter(n => n.userId === state.currentUser?.id && !n.read);
  const selectedApplication = myApps.find(a => a.id === selectedApp);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">{t('مرحباً', 'Welcome')}, {state.currentUser?.name}</h1>
          <p className="text-xs text-slate-500">{t('إدارة طلباتك', 'Manage applications')}</p>
        </div>
        <Link to="/apply/tourist_visa"><Button size="sm"><Plus size={14} />{t('طلب جديد', 'New')}</Button></Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: t('نشطة', 'Active'), count: myApps.filter(a => ['submitted', 'document_review', 'processing'].includes(a.status)).length, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
          { label: t('تحقق', 'Verified'), count: myApps.filter(a => a.status === 'verified').length, color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30' },
          { label: t('مكتملة', 'Completed'), count: myApps.filter(a => a.status === 'completed').length, color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
          { label: t('إشعارات', 'Alerts'), count: unreadNotifs.length, color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30' },
        ].map((stat, idx) => (
          <Card key={idx} className="p-3">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.color}`}><BarChart3 size={14} /></div>
              <div><p className="text-lg font-bold text-slate-900 dark:text-white">{stat.count}</p><p className="text-[10px] text-slate-500">{stat.label}</p></div>
            </div>
          </Card>
        ))}
      </div>

      {/* Notifications */}
      {unreadNotifs.length > 0 && (
        <Card className="p-3 mb-4 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10">
          <div className="flex items-center gap-2 mb-1"><Bell size={14} className="text-amber-600" /><span className="font-medium text-xs text-amber-800 dark:text-amber-300">{t('إشعارات', 'Notifications')}</span></div>
          {unreadNotifs.map(n => <div key={n.id} className="text-xs text-amber-700 dark:text-amber-400">{n.message[lang]}</div>)}
        </Card>
      )}

      {/* Applications */}
      <Card className="p-4">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-3">{t('طلباتي', 'My Applications')}</h3>
        {myApps.length === 0 ? (
          <div className="text-center py-6">
            <FileText size={24} className="mx-auto text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-xs text-slate-500">{t('لا توجد طلبات', 'No applications')}</p>
            <Link to="/services" className="text-emerald-600 text-xs hover:underline">{t('استعرض الخدمات', 'Browse')}</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {myApps.map(app => {
              const service = SERVICES.find(s => s.id === app.serviceType);
              return (
                <div key={app.id} onClick={() => setSelectedApp(app.id)} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${service?.color || 'from-slate-400 to-slate-600'} flex items-center justify-center`}><FileText size={14} className="text-white" /></div>
                    <div>
                      <p className="text-xs font-medium text-slate-900 dark:text-white">{service?.name[lang]}</p>
                      <p className="text-[10px] text-slate-500" dir="ltr">{app.referenceCode}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2"><StatusBadge status={app.status} lang={lang} /><ChevronRight size={14} className="text-slate-400" /></div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Detail Modal */}
      <Modal isOpen={!!selectedApp} onClose={() => setSelectedApp(null)} title={t('تفاصيل الطلب', 'Details')}>
        {selectedApplication && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500" dir="ltr">{selectedApplication.referenceCode}</span>
              <StatusBadge status={selectedApplication.status} lang={lang} />
            </div>
            <div className="flex gap-1">
              {['submitted', 'document_review', 'processing', 'verified', 'completed'].map((s, idx) => {
                const isActive = ['submitted', 'document_review', 'processing', 'verified', 'completed'].indexOf(selectedApplication.status) >= idx;
                return <div key={s} className={`flex-1 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`} />;
              })}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-slate-500">{t('متقدمين', 'Applicants')}:</span> <span className="font-medium">{selectedApplication.applicants.length}</span></div>
              <div><span className="text-slate-500">{t('التكلفة', 'Cost')}:</span> <span className="font-medium">{formatCurrency(convertCurrency(selectedApplication.totalCost, currency), currency, lang)}</span></div>
            </div>
            <div>
              <h4 className="text-xs font-semibold mb-1">{t('السجل', 'Timeline')}</h4>
              <div className="space-y-1">
                {[...selectedApplication.statusHistory].reverse().map(ev => (
                  <div key={ev.id} className="text-[10px] text-slate-500 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
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

// Agency Dashboard
export function AgencyDashboard() {
  const { state, t } = useApp();
  const lang = state.lang;
  const currency = state.preferences.currency;
  const navigate = useNavigate();
  const [showImport, setShowImport] = useState(false);

  if (!state.isAuthenticated || state.currentUser?.role !== 'agency_owner') { navigate('/login'); return null; }

  const agencyApps = state.applications.filter(a => a.agencyId === state.currentUser?.agencyId);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">{t('لوحة الوكالة', 'Agency Dashboard')}</h1>
          <p className="text-xs text-slate-500">{t('إدارة طلبات وكالتك', 'Manage agency applications')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowImport(true)}><Upload size={12} />{t('استيراد', 'Import')}</Button>
          <Link to="/apply/tourist_visa"><Button size="sm"><Plus size={12} />{t('جديد', 'New')}</Button></Link>
        </div>
      </div>

      {/* Agency Info */}
      <Card className="p-4 mb-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border-amber-200 dark:border-amber-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center"><Building2 size={16} className="text-white" /></div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">{t('وكالة الذهبية', 'Golden Agency')}</h3>
              <div className="flex gap-1 mt-0.5"><Badge color="success">{t('معتمدة', 'Verified')}</Badge><Badge color="warning">{t('ذهبي', 'Gold')}</Badge></div>
            </div>
          </div>
          <div className="text-end"><p className="text-xl font-bold text-emerald-600">15%</p><p className="text-[10px] text-slate-500">{t('خصم', 'Discount')}</p></div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: t('إجمالي', 'Total'), value: agencyApps.length },
          { label: t('معالجة', 'Processing'), value: agencyApps.filter(a => a.status === 'processing').length },
          { label: t('مكتملة', 'Done'), value: agencyApps.filter(a => a.status === 'completed').length },
          { label: t('إيرادات', 'Revenue'), value: formatCurrency(convertCurrency(agencyApps.reduce((s, a) => s + a.totalCost, 0), currency), currency, lang) },
        ].map((stat, idx) => (
          <Card key={idx} className="p-3"><p className="text-lg font-bold text-slate-900 dark:text-white">{stat.value}</p><p className="text-[10px] text-slate-500">{stat.label}</p></Card>
        ))}
      </div>

      {/* Table */}
      <Card className="p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">{t('الطلبات', 'Applications')}</h3>
          <Button variant="ghost" size="sm"><Download size={12} />{t('تصدير', 'Export')}</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="text-start py-2 px-1 font-medium text-slate-500">{t('المرجع', 'Ref')}</th>
              <th className="text-start py-2 px-1 font-medium text-slate-500">{t('الخدمة', 'Service')}</th>
              <th className="text-start py-2 px-1 font-medium text-slate-500">{t('الحالة', 'Status')}</th>
              <th className="text-start py-2 px-1 font-medium text-slate-500">{t('المبلغ', 'Amount')}</th>
            </tr></thead>
            <tbody>
              {agencyApps.map(app => {
                const service = SERVICES.find(s => s.id === app.serviceType);
                return (
                  <tr key={app.id} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-2 px-1 font-medium text-slate-900 dark:text-white" dir="ltr">{app.referenceCode}</td>
                    <td className="py-2 px-1 text-slate-600 dark:text-slate-400">{service?.name[lang]}</td>
                    <td className="py-2 px-1"><StatusBadge status={app.status} lang={lang} /></td>
                    <td className="py-2 px-1 font-medium">{formatCurrency(convertCurrency(app.totalCost, currency), currency, lang)}</td>
                  </tr>
                );
              })}
              {agencyApps.length === 0 && <tr><td colSpan={4} className="py-6 text-center text-slate-400">{t('لا توجد طلبات', 'No applications')}</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={showImport} onClose={() => setShowImport(false)} title={t('استيراد CSV', 'Import CSV')}>
        <div className="space-y-3">
          <p className="text-xs text-slate-600 dark:text-slate-400">{t('ارفع ملف CSV ببيانات المتقدمين', 'Upload CSV with applicant data')}</p>
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-6 text-center">
            <Upload size={24} className="mx-auto text-slate-400 mb-2" />
            <p className="text-xs text-slate-500">{t('اسحب الملف هنا', 'Drop file here')}</p>
          </div>
          <div className="flex gap-2 justify-end"><Button variant="ghost" onClick={() => setShowImport(false)}>{t('إلغاء', 'Cancel')}</Button><Button>{t('معاينة', 'Preview')}</Button></div>
        </div>
      </Modal>
    </div>
  );
}

// Admin Dashboard
export function AdminDashboard() {
  const { state, t, updateApplicationStatus } = useApp();
  const lang = state.lang;
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedApp, setSelectedApp] = useState<string | null>(null);

  if (!state.isAuthenticated || state.currentUser?.role !== 'admin') { navigate('/login'); return null; }

  const allApps = state.applications;
  const filteredApps = filterStatus === 'all' ? allApps : allApps.filter(a => a.status === filterStatus);
  const selectedApplication = allApps.find(a => a.id === selectedApp);

  const handleStatusChange = (appId: string, newStatus: ApplicationStatus) => {
    updateApplicationStatus(appId, newStatus, t('تم التحديث', 'Updated'));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">{t('لوحة الإدارة', 'Admin Dashboard')}</h1>
          <p className="text-xs text-slate-500">{t('إدارة الطلبات والخدمات', 'Manage applications')}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        {[
          { label: t('إجمالي', 'Total'), value: allApps.length },
          { label: t('مُقدَّم', 'Submitted'), value: allApps.filter(a => a.status === 'submitted').length },
          { label: t('معالجة', 'Processing'), value: allApps.filter(a => a.status === 'processing').length },
          { label: t('تحقق', 'Verified'), value: allApps.filter(a => a.status === 'verified').length },
          { label: t('مكتمل', 'Done'), value: allApps.filter(a => a.status === 'completed').length },
        ].map((stat, idx) => (
          <Card key={idx} className="p-3"><p className="text-lg font-bold text-slate-900 dark:text-white">{stat.value}</p><p className="text-[10px] text-slate-500">{stat.label}</p></Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="p-3 mb-4">
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          <option value="all">{t('جميع الحالات', 'All')}</option>
          <option value="submitted">{t('مُقدَّم', 'Submitted')}</option>
          <option value="document_review">{t('مراجعة', 'Review')}</option>
          <option value="processing">{t('معالجة', 'Processing')}</option>
          <option value="verified">{t('تحقق', 'Verified')}</option>
          <option value="completed">{t('مكتمل', 'Completed')}</option>
          <option value="rejected">{t('مرفوض', 'Rejected')}</option>
        </select>
      </Card>

      {/* Table */}
      <Card className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="text-start py-2 px-1 font-medium text-slate-500">{t('المرجع', 'Ref')}</th>
              <th className="text-start py-2 px-1 font-medium text-slate-500">{t('الخدمة', 'Service')}</th>
              <th className="text-start py-2 px-1 font-medium text-slate-500">{t('النوع', 'Type')}</th>
              <th className="text-start py-2 px-1 font-medium text-slate-500">{t('الحالة', 'Status')}</th>
              <th className="text-start py-2 px-1 font-medium text-slate-500">{t('إجراء', 'Action')}</th>
            </tr></thead>
            <tbody>
              {filteredApps.map(app => {
                const service = SERVICES.find(s => s.id === app.serviceType);
                return (
                  <tr key={app.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800">
                    <td className="py-2 px-1 font-medium" dir="ltr">{app.referenceCode}</td>
                    <td className="py-2 px-1 text-slate-600 dark:text-slate-400">{service?.name[lang]}</td>
                    <td className="py-2 px-1"><Badge color={app.agencyId ? 'purple' : 'info'}>{app.agencyId ? 'B2B' : 'B2C'}</Badge></td>
                    <td className="py-2 px-1"><StatusBadge status={app.status} lang={lang} /></td>
                    <td className="py-2 px-1"><button onClick={() => setSelectedApp(app.id)} className="text-emerald-600 hover:underline">{t('عرض', 'View')}</button></td>
                  </tr>
                );
              })}
              {filteredApps.length === 0 && <tr><td colSpan={5} className="py-6 text-center text-slate-400">{t('لا نتائج', 'No results')}</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Detail Modal */}
      <Modal isOpen={!!selectedApp} onClose={() => setSelectedApp(null)} title={t('تفاصيل الطلب', 'Details')}>
        {selectedApplication && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span dir="ltr" className="font-mono text-xs">{selectedApplication.referenceCode}</span>
              <StatusBadge status={selectedApplication.status} lang={lang} />
            </div>
            <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <h4 className="text-xs font-semibold mb-1">{t('المتقدم', 'Applicant')}</h4>
              {selectedApplication.applicants.map(a => (
                <div key={a.id} className="text-[10px] text-slate-600 dark:text-slate-400">
                  <p className="font-medium text-slate-900 dark:text-white">{a.fullName}</p>
                  <p>{a.nationality} | {a.passportNumber}</p>
                </div>
              ))}
            </div>
            <div>
              <h4 className="text-xs font-semibold mb-1">{t('المستندات', 'Documents')}</h4>
              {selectedApplication.documents.map(d => (
                <div key={d.id} className="flex items-center justify-between text-[10px] p-1.5 bg-slate-50 dark:bg-slate-800 rounded mb-1">
                  <span>{d.fileName}</span>
                  <Badge color={d.status === 'approved' ? 'success' : d.status === 'rejected' ? 'error' : 'warning'}>{d.status}</Badge>
                </div>
              ))}
            </div>
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
              <h4 className="text-xs font-semibold mb-2">{t('إجراءات', 'Actions')}</h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedApplication.status === 'submitted' && <Button size="sm" onClick={() => handleStatusChange(selectedApplication.id, 'document_review')}>{t('بدء المراجعة', 'Review')}</Button>}
                {selectedApplication.status === 'document_review' && <>
                  <Button size="sm" onClick={() => handleStatusChange(selectedApplication.id, 'processing')}>{t('قبول', 'Accept')}</Button>
                  <Button size="sm" variant="danger" onClick={() => handleStatusChange(selectedApplication.id, 'rejected')}>{t('رفض', 'Reject')}</Button>
                </>}
                {selectedApplication.status === 'processing' && <Button size="sm" onClick={() => handleStatusChange(selectedApplication.id, 'verified')}>{t('تحقق', 'Verify')}</Button>}
                {selectedApplication.status === 'verified' && <Button size="sm" onClick={() => handleStatusChange(selectedApplication.id, 'approved_for_payment')}>{t('اعتماد دفع', 'Approve Pay')}</Button>}
                {selectedApplication.status === 'approved_for_payment' && <Button size="sm" onClick={() => handleStatusChange(selectedApplication.id, 'completed')}>{t('إكمال', 'Complete')}</Button>}
              </div>
            </div>
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
              <h4 className="text-xs font-semibold mb-1">{t('السجل', 'Audit')}</h4>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {[...selectedApplication.statusHistory].reverse().map(ev => (
                  <div key={ev.id} className="text-[10px] text-slate-500 flex items-center gap-1">
                    <div className="w-1 h-1 rounded-full bg-emerald-500" />
                    <span>{getStatusLabel(ev.toStatus, lang)}</span>
                    <span className="text-slate-400">{new Date(ev.timestamp).toLocaleString()}</span>
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
