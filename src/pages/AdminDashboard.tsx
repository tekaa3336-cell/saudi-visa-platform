import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useApp } from '../store';
import { SERVICES, getStatusLabel } from '../data';
import { Card, Button, Badge, StatusBadge, Modal } from '../components/Layout';
import {
  ShieldCheck, ClipboardList, Inbox, CheckCircle2, Users, Search, Settings,
  MessageSquare, AlertCircle, FileText, Phone, Mail, RefreshCw, Eye,
} from 'lucide-react';
import type { Application, ApplicationStatus } from '../types';
import { getDocumentUrl, listAllApplications, setApplicationStatus, subscribeToApplications } from '../lib/applicationsApi';
import {
  FILTER_LABELS, FILTER_ORDER, computeStats, countByFilter, deriveCustomers,
  filterApplications, filterCustomers, getNextStatuses, validateStatusChange,
  type AdminFilter,
} from '../lib/adminData';

type Tab = 'requests' | 'customers';

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-GB');
};

const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' });
};

export default function AdminDashboard() {
  const { state, t } = useApp();
  const lang = state.lang;

  // Live data from Supabase (RLS only returns rows to a verified admin session)
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const mounted = useRef(true);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const res = await listAllApplications();
    if (!mounted.current) return;
    if (res.ok) {
      setApplications(res.data);
      setLoadError('');
    } else {
      setLoadError(t(res.message.ar, res.message.en));
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    mounted.current = true;
    void load();
    // Refresh when any application changes (new submission, status change by another admin, resubmission)
    let timer: ReturnType<typeof setTimeout> | undefined;
    const unsubscribe = subscribeToApplications(() => {
      clearTimeout(timer);
      timer = setTimeout(() => void load(true), 400);
    });
    return () => {
      mounted.current = false;
      clearTimeout(timer);
      unsubscribe();
    };
  }, [load]);

  const [tab, setTab] = useState<Tab>('requests');
  const [filter, setFilter] = useState<AdminFilter>('all');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<ApplicationStatus | ''>('');
  const [note, setNote] = useState('');
  const [formError, setFormError] = useState('');
  const [flash, setFlash] = useState('');

  const stats = useMemo(() => computeStats(applications), [applications]);
  const counts = useMemo(() => countByFilter(applications), [applications]);
  const visibleApps = useMemo(() => filterApplications(applications, filter, query), [applications, filter, query]);
  const customers = useMemo(() => filterCustomers(deriveCustomers(applications), query), [applications, query]);

  // Always read the live application from the store so the modal shows the new status right after saving
  const selectedApp: Application | null = selectedId
    ? applications.find(a => a.id === selectedId) ?? null
    : null;
  const nextStatuses = selectedApp ? getNextStatuses(selectedApp.status) : [];
  const noteRequired = newStatus === 'rejected' || newStatus === 'needs_revision';

  const openApp = (id: string) => {
    setSelectedId(id);
    setNewStatus('');
    setNote('');
    setFormError('');
    setFlash('');
  };

  const closeApp = () => setSelectedId(null);

  const handleSave = async () => {
    if (!selectedApp || saving) return;
    setFlash('');

    const check = validateStatusChange(newStatus, note);
    if (!check.valid) {
      setFormError(t(check.message ?? '', check.messageEn ?? ''));
      return;
    }
    if (!newStatus || !nextStatuses.includes(newStatus)) {
      setFormError(t('هذا الانتقال غير مسموح من الحالة الحالية', 'This change is not allowed from the current status'));
      return;
    }

    setSaving(true);
    const res = await setApplicationStatus(selectedApp.id, newStatus, note.trim());
    setSaving(false);
    if (!res.ok) {
      setFormError(t(res.message.ar, res.message.en));
      return;
    }

    setFormError('');
    setNewStatus('');
    setNote('');
    await load(true); // pick up the saved status and history from the database
    setFlash(
      t(
        'تم حفظ الحالة في قاعدة البيانات، والملاحظة ستظهر للعميل في حسابه',
        'Status saved to the database. The note will be visible to the customer in their account',
      ),
    );
  };

  const openDocument = async (storageKey: string) => {
    const res = await getDocumentUrl(storageKey);
    if (res.ok) window.open(res.data, '_blank', 'noopener,noreferrer');
    else setFormError(t(res.message.ar, res.message.en));
  };

  const serviceName = (app: Application) =>
    SERVICES.find(s => s.id === app.serviceType)?.name[lang] ?? app.serviceType;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shrink-0">
          <ShieldCheck size={20} className="text-white" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{t('لوحة تحكم مدير النظام', 'Admin Dashboard')}</h1>
          <p className="text-xs sm:text-sm text-slate-500 truncate">
            {t('إدارة الطلبات والعملاء', 'Manage applications and customers')}
            {state.currentUser?.email ? <span dir="ltr"> · {state.currentUser.email}</span> : null}
          </p>
        </div>
        <Button size="sm" variant="outline" className="ms-auto shrink-0" onClick={() => void load()} disabled={loading}>
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />{t('تحديث', 'Refresh')}
        </Button>
      </div>

      {loadError && (
        <div role="alert" className="mb-4 flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <div>
            <p>{loadError}</p>
            <p className="text-xs mt-1 opacity-80">{t('تأكد من تشغيل schema.sql في Supabase ومن تسجيل الدخول برمز التحقق.', 'Make sure schema.sql was run in Supabase and that you signed in with the verification code.')}</p>
          </div>
        </div>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <StatCard icon={ClipboardList} label={t('إجمالي الطلبات', 'Total applications')} value={stats.total}
          tone="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300" />
        <StatCard icon={Inbox} label={t('الطلبات الجديدة', 'New applications')} value={stats.newCount}
          tone="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" highlight={stats.newCount > 0} />
        <StatCard icon={CheckCircle2} label={t('الطلبات المكتملة', 'Completed applications')} value={stats.completed}
          tone="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400" />
      </div>

      {/* Tabs */}
      <div className="inline-flex p-1 mb-4 rounded-xl bg-slate-100 dark:bg-slate-800" role="tablist">
        <TabButton active={tab === 'requests'} onClick={() => setTab('requests')} icon={ClipboardList}
          label={t('الطلبات', 'Applications')} badge={applications.length} />
        <TabButton active={tab === 'customers'} onClick={() => setTab('customers')} icon={Users}
          label={t('العملاء', 'Customers')} badge={deriveCustomers(applications).length} />
      </div>

      {/* Search + filters */}
      <Card className="p-3 sm:p-4 mb-4">
        <div className="relative">
          <Search size={15} className="absolute top-1/2 -translate-y-1/2 start-3 text-slate-400 pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={tab === 'requests'
              ? t('ابحث برقم المرجع أو اسم المتقدم أو رقم الجواز', 'Search by reference, applicant name or passport')
              : t('ابحث بالاسم أو البريد أو الهاتف', 'Search by name, email or phone')}
            className="w-full ps-9 pe-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        {tab === 'requests' && (
          <div className="flex flex-wrap gap-2 mt-3" role="group" aria-label={t('تصفية حسب الحالة', 'Filter by status')}>
            {FILTER_ORDER.map(key => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                aria-pressed={filter === key}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  filter === key
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {FILTER_LABELS[key][lang]}
                <span className={`min-w-[1.25rem] px-1 rounded-full text-[10px] leading-5 text-center ${
                  filter === key ? 'bg-white/25 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}>{counts[key]}</span>
              </button>
            ))}
          </div>
        )}
      </Card>

      {/* Requests */}
      {tab === 'requests' && (
        <>
          {loading && applications.length === 0 ? (
            <EmptyState text={t('جارٍ تحميل الطلبات...', 'Loading applications...')} />
          ) : visibleApps.length === 0 ? (
            <EmptyState text={applications.length === 0
              ? t('لا توجد طلبات مقدّمة بعد', 'No applications submitted yet')
              : t('لا توجد طلبات مطابقة للتصفية', 'No applications match the filter')} />
          ) : (
            <>
              {/* Phones: cards */}
              <div className="space-y-3 md:hidden">
                {visibleApps.map(app => (
                  <Card key={app.id} className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="font-mono text-xs text-slate-500" dir="ltr">{app.referenceCode}</span>
                      <StatusBadge status={app.status} lang={lang} />
                    </div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{app.applicants[0]?.fullName ?? '—'}
                      {app.applicants.length > 1 && <span className="text-xs font-normal text-slate-500"> (+{app.applicants.length - 1})</span>}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{serviceName(app)} · {formatDate(app.createdAt)}</p>
                    <Button size="sm" variant="outline" className="w-full mt-3" onClick={() => openApp(app.id)}>
                      <Settings size={14} />{t('إدارة الطلب', 'Manage')}
                    </Button>
                  </Card>
                ))}
              </div>

              {/* Tablets and desktops: table */}
              <Card className="hidden md:block p-2 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700 text-xs text-slate-500">
                        <th className="text-start font-medium py-3 px-3">{t('المرجع', 'Reference')}</th>
                        <th className="text-start font-medium py-3 px-3">{t('الخدمة', 'Service')}</th>
                        <th className="text-start font-medium py-3 px-3">{t('المتقدم', 'Applicant')}</th>
                        <th className="text-start font-medium py-3 px-3">{t('الحالة', 'Status')}</th>
                        <th className="text-start font-medium py-3 px-3">{t('التاريخ', 'Date')}</th>
                        <th className="py-3 px-3"><span className="sr-only">{t('إجراءات', 'Actions')}</span></th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleApps.map(app => (
                        <tr key={app.id} className="border-b last:border-0 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="py-3 px-3 font-mono text-xs text-slate-900 dark:text-white" dir="ltr">{app.referenceCode}</td>
                          <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{serviceName(app)}</td>
                          <td className="py-3 px-3">
                            <p className="font-medium text-slate-900 dark:text-white">{app.applicants[0]?.fullName ?? '—'}
                              {app.applicants.length > 1 && <span className="text-xs font-normal text-slate-500"> (+{app.applicants.length - 1})</span>}
                            </p>
                            <p className="text-xs text-slate-500">{app.applicants[0]?.nationality}</p>
                          </td>
                          <td className="py-3 px-3"><StatusBadge status={app.status} lang={lang} /></td>
                          <td className="py-3 px-3 text-xs text-slate-500 whitespace-nowrap">{formatDate(app.createdAt)}</td>
                          <td className="py-3 px-3 text-end">
                            <Button size="sm" variant="outline" onClick={() => openApp(app.id)}>
                              <Settings size={13} />{t('إدارة', 'Manage')}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}
        </>
      )}

      {/* Customers */}
      {tab === 'customers' && (
        <>
          <p className="text-[11px] text-slate-500 mb-2">
            {t('قائمة العملاء مأخوذة من الطلبات المقدّمة.', 'The customer list is built from the submitted applications.')}
          </p>
          {customers.length === 0 ? (
            <EmptyState text={t('لا يوجد عملاء مطابقون', 'No matching customers')} />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {customers.map(c => (
                <Card key={c.key} className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{c.name || '—'}</p>
                    {c.hasOpenRequest && <Badge color="info">{t('طلب مفتوح', 'Open request')}</Badge>}
                  </div>
                  <div className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                    <p className="flex items-center gap-1.5 min-w-0"><Mail size={12} className="shrink-0" /><span className="truncate" dir="ltr">{c.email || '—'}</span></p>
                    <p className="flex items-center gap-1.5"><Phone size={12} className="shrink-0" /><span dir="ltr">{c.phone || '—'}</span></p>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between text-[11px] text-slate-500">
                    <span>{t('عدد الطلبات', 'Applications')}: <b className="text-slate-900 dark:text-white">{c.applications}</b></span>
                    <span>{formatDate(c.lastActivity)}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Manage application */}
      <Modal isOpen={!!selectedApp} onClose={closeApp} title={t('إدارة الطلب', 'Manage application')}>
        {selectedApp && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-sm text-slate-500" dir="ltr">{selectedApp.referenceCode}</span>
              <StatusBadge status={selectedApp.status} lang={lang} />
            </div>
            <p className="text-xs text-slate-500 -mt-2">{serviceName(selectedApp)} · {formatDate(selectedApp.createdAt)}</p>

            {/* Applicants */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-3">
              {selectedApp.applicants.map(a => (
                <div key={a.id} className="text-xs text-slate-600 dark:text-slate-400 space-y-0.5">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{a.fullName}</p>
                  <p>{a.nationality} · <span dir="ltr">{a.passportNumber}</span></p>
                  <p>{a.countryOfResidence} · <span dir="ltr">{a.phone || '—'}</span></p>
                  <p dir="ltr" className="text-start">{a.email || '—'}</p>
                </div>
              ))}
            </div>

            {/* Documents */}
            {selectedApp.documents.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold mb-2 text-slate-900 dark:text-white">{t('المستندات', 'Documents')}</h4>
                <div className="space-y-1">
                  {selectedApp.documents.map(d => (
                    <div key={d.id} className="flex items-center justify-between gap-2 text-xs p-2 bg-slate-50 dark:bg-slate-800 rounded">
                      <span className="flex items-center gap-1.5 min-w-0"><FileText size={12} className="shrink-0 text-slate-400" /><span className="truncate">{d.fileName}</span></span>
                      <span className="flex items-center gap-1.5 shrink-0">
                        <button type="button" onClick={() => void openDocument(d.storageKey)} className="inline-flex items-center gap-1 text-emerald-600 hover:underline">
                          <Eye size={12} />{t('عرض', 'View')}
                        </button>
                        <Badge color={d.status === 'approved' ? 'success' : d.status === 'rejected' ? 'error' : 'warning'}>
                          {d.status === 'approved' ? t('مقبول', 'Approved') : d.status === 'rejected' ? t('مرفوض', 'Rejected') : t('قيد المراجعة', 'Pending')}
                        </Badge>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Change status + note */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
              <h4 className="text-xs font-semibold mb-2 text-slate-900 dark:text-white">{t('تغيير الحالة وإضافة ملاحظة للعميل', 'Change status and add a note for the customer')}</h4>

              {nextStatuses.length === 0 ? (
                <p className="text-xs text-slate-500">{t('لا يمكن تغيير حالة هذا الطلب.', 'The status of this application cannot be changed.')}</p>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label htmlFor="admin-new-status" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">{t('الحالة الجديدة', 'New status')}</label>
                    <select
                      id="admin-new-status"
                      value={newStatus}
                      onChange={e => { setNewStatus(e.target.value as ApplicationStatus | ''); setFormError(''); }}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">{t('اختر الحالة...', 'Select a status...')}</option>
                      {nextStatuses.map(s => <option key={s} value={s}>{getStatusLabel(s, lang)}</option>)}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="admin-note" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                      {t('ملاحظة للعميل', 'Note for the customer')}{noteRequired ? <span className="text-red-500"> *</span> : <span className="text-slate-400"> {t('(اختياري)', '(optional)')}</span>}
                    </label>
                    <textarea
                      id="admin-note"
                      rows={3}
                      maxLength={500}
                      value={note}
                      onChange={e => { setNote(e.target.value); setFormError(''); }}
                      placeholder={newStatus === 'needs_revision'
                        ? t('اكتب التعديلات المطلوبة من العميل...', 'Describe the changes the customer must make...')
                        : newStatus === 'rejected'
                          ? t('اكتب سبب الرفض...', 'Write the reason for rejection...')
                          : t('اكتب ملاحظة تظهر للعميل...', 'Write a note the customer will see...')}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 resize-y"
                    />
                    <p className="text-[10px] text-slate-400 mt-0.5 text-end" dir="ltr">{note.length}/500</p>
                  </div>

                  {formError && (
                    <div role="alert" className="flex items-start gap-1.5 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs text-red-600">
                      <AlertCircle size={12} className="mt-0.5 shrink-0" />{formError}
                    </div>
                  )}

                  <Button className="w-full" onClick={() => void handleSave()} disabled={!newStatus || saving}>
                    <MessageSquare size={14} />{saving ? t('جارٍ الحفظ...', 'Saving...') : t('حفظ التغيير', 'Save change')}
                  </Button>
                </div>
              )}

              {flash && (
                <div role="status" className="flex items-start gap-1.5 mt-3 p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded text-xs text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 size={12} className="mt-0.5 shrink-0" />{flash}
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
              <h4 className="text-xs font-semibold mb-2 text-slate-900 dark:text-white">{t('السجل', 'History')}</h4>
              <ol className="space-y-2 max-h-52 overflow-y-auto">
                {[...selectedApp.statusHistory].reverse().map(ev => (
                  <li key={ev.id} className="flex gap-2 text-xs">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-slate-900 dark:text-white font-medium">
                        {ev.fromStatus ? `${getStatusLabel(ev.fromStatus, lang)} ← ` : ''}{getStatusLabel(ev.toStatus, lang)}
                      </p>
                      {ev.note && <p className="mt-0.5 p-1.5 rounded bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 break-words">{ev.note}</p>}
                      <p className="text-[10px] text-slate-400 mt-0.5">{formatDateTime(ev.timestamp)}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone, highlight = false }: {
  icon: React.ElementType;
  label: string;
  value: number;
  tone: string;
  highlight?: boolean;
}) {
  return (
    <Card className={`p-4 ${highlight ? 'ring-2 ring-blue-400/60' : ''}`}>
      <div className="flex items-center gap-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${tone}`}>
          <Icon size={20} />
        </div>
        <div>
          <p className="text-2xl font-bold leading-none text-slate-900 dark:text-white">{value}</p>
          <p className="text-xs text-slate-500 mt-1">{label}</p>
        </div>
      </div>
    </Card>
  );
}

function TabButton({ active, onClick, icon: Icon, label, badge }: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  badge: number;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
          : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
      }`}
    >
      <Icon size={14} />{label}
      <span className="text-[10px] px-1.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">{badge}</span>
    </button>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <Card className="p-8 text-center">
      <Inbox size={28} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
      <p className="text-sm text-slate-500">{text}</p>
    </Card>
  );
}
