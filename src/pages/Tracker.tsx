import React, { useState } from 'react';
import { useApp } from '../store';
import { Card, Button, Input, StatusBadge } from '../components/Layout';
import { Search, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { getStatusLabel } from '../data';
import { convertCurrency, formatCurrency } from '../preferences';

export default function TrackerPage() {
  const { state, t } = useApp();
  const lang = state.lang;
  const currency = state.preferences.currency;
  const [refCode, setRefCode] = useState('');
  const [searched, setSearched] = useState(false);

  const handleSearch = () => setSearched(true);
  const foundApp = state.applications.find(a => a.referenceCode === refCode.trim());
  const found = !!foundApp;

  const statusSteps = ['submitted', 'document_review', 'processing', 'verified', 'completed'];
  const getStepIndex = (status: string) => statusSteps.indexOf(status);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('تتبع طلبك', 'Track Application')}</h1>
        <p className="text-sm text-slate-500">{t('أدخل رقم المرجع لمعرفة الحالة', 'Enter reference to check status')}</p>
      </div>

      <Card className="p-4 mb-6">
        <div className="flex gap-2">
          <Input placeholder={t('رقم المرجع', 'Reference code')} value={refCode} onChange={e => setRefCode(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
          <Button onClick={handleSearch}><Search size={14} />{t('بحث', 'Search')}</Button>
        </div>
        <p className="text-[10px] text-slate-400 mt-2">{t('💡 للتجربة: VSA-2024-001 أو VSA-2024-002', '💡 Demo: VSA-2024-001 or VSA-2024-002')}</p>
      </Card>

      {searched && !found && (
        <Card className="p-6 text-center">
          <AlertCircle size={32} className="mx-auto text-amber-500 mb-2" />
          <h3 className="font-bold text-slate-900 dark:text-white">{t('لم يتم العثور', 'Not Found')}</h3>
          <p className="text-xs text-slate-500 mt-1">{t('تأكد من الرقم', 'Check the number')}</p>
        </Card>
      )}

      {searched && found && foundApp && (
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div><h3 className="font-bold text-sm text-slate-900 dark:text-white">{t('حالة الطلب', 'Status')}</h3><p className="text-[10px] text-slate-500" dir="ltr">{foundApp.referenceCode}</p></div>
              <StatusBadge status={foundApp.status} lang={lang} />
            </div>
            <div className="relative mt-4">
              <div className="absolute top-3 start-3 end-3 h-0.5 bg-slate-200 dark:bg-slate-700">
                <div className="h-full bg-emerald-500 transition-all" style={{ width: `${(getStepIndex(foundApp.status) / (statusSteps.length - 1)) * 100}%` }} />
              </div>
              <div className="relative flex justify-between">
                {statusSteps.map((s, idx) => {
                  const isActive = idx <= getStepIndex(foundApp.status);
                  const labels: Record<string, { ar: string; en: string }> = {
                    submitted: { ar: 'مُقدَّم', en: 'Submitted' }, document_review: { ar: 'مراجعة', en: 'Review' },
                    processing: { ar: 'معالجة', en: 'Processing' }, verified: { ar: 'تحقق', en: 'Verified' }, completed: { ar: 'مكتمل', en: 'Done' },
                  };
                  return (
                    <div key={s} className="flex flex-col items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold z-10 ${isActive ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                        {isActive ? <CheckCircle2 size={10} /> : idx + 1}
                      </div>
                      <span className={`text-[8px] mt-0.5 ${isActive ? 'text-emerald-700 dark:text-emerald-400 font-medium' : 'text-slate-400'}`}>{labels[s][lang]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h4 className="font-semibold text-xs text-slate-900 dark:text-white mb-3">{t('التفاصيل', 'Details')}</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-slate-500">{t('الخدمة', 'Service')}:</span> <span className="font-medium">{foundApp.serviceType.replace('_', ' ')}</span></div>
              <div><span className="text-slate-500">{t('متقدمين', 'Applicants')}:</span> <span className="font-medium">{foundApp.applicants.length}</span></div>
              <div><span className="text-slate-500">{t('التاريخ', 'Date')}:</span> <span className="font-medium">{foundApp.createdAt}</span></div>
              <div><span className="text-slate-500">{t('التكلفة', 'Cost')}:</span> <span className="font-medium">{formatCurrency(convertCurrency(foundApp.totalCost, currency), currency, lang)}</span></div>
            </div>
          </Card>

          <Card className="p-4">
            <h4 className="font-semibold text-xs text-slate-900 dark:text-white mb-3">{t('السجل', 'Timeline')}</h4>
            <div className="space-y-2">
              {[...foundApp.statusHistory].reverse().map(ev => (
                <div key={ev.id} className="flex gap-2">
                  <div className="flex flex-col items-center"><div className="w-2 h-2 rounded-full bg-emerald-500" /><div className="w-0.5 flex-1 bg-slate-200 dark:bg-slate-700" /></div>
                  <div className="pb-2">
                    <p className="text-xs font-medium text-slate-900 dark:text-white">{getStatusLabel(ev.toStatus, lang)}</p>
                    {ev.note && <p className="text-[10px] text-slate-500">{ev.note}</p>}
                    <p className="text-[10px] text-slate-400">{new Date(ev.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <h4 className="font-semibold text-xs text-slate-900 dark:text-white mb-2">{t('المتقدمون', 'Applicants')}</h4>
            {foundApp.applicants.map(a => (
              <div key={a.id} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded text-xs">
                <div><p className="font-medium text-slate-900 dark:text-white">{a.fullName}</p><p className="text-[10px] text-slate-500">{a.nationality} | {a.passportNumber}</p></div>
                <div className="flex items-center gap-1 text-[10px] text-slate-500"><FileText size={10} />{foundApp.documents.filter(d => d.applicantId === a.id).length}</div>
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}
