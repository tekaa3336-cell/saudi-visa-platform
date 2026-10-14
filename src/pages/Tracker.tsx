import React, { useState } from 'react';
import { useApp } from '../store';
import { Card, Button, Input, Badge, StatusBadge } from '../components/Layout';
import { Search, Clock, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { getStatusLabel } from '../data';

export default function TrackerPage() {
  const { state, t } = useApp();
  const lang = state.lang;
  const [refCode, setRefCode] = useState('');
  const [searched, setSearched] = useState(false);
  const [found, setFound] = useState(false);

  const handleSearch = () => {
    setSearched(true);
    const app = state.applications.find(a => a.referenceCode === refCode.trim());
    setFound(!!app);
  };

  const foundApp = state.applications.find(a => a.referenceCode === refCode.trim());

  const statusSteps = [
    { key: 'submitted', label: t('مُقدَّم', 'Submitted') },
    { key: 'document_review', label: t('مراجعة المستندات', 'Document Review') },
    { key: 'processing', label: t('قيد المعالجة', 'Processing') },
    { key: 'verified', label: t('تم التحقق', 'Verified') },
    { key: 'completed', label: t('مكتمل', 'Completed') },
  ];

  const getStepIndex = (status: string) => {
    const keys = ['submitted', 'document_review', 'processing', 'verified', 'completed'];
    return keys.indexOf(status);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3">
          {t('تتبع طلبك', 'Track Your Application')}
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          {t('أدخل رقم المرجع الخاص بطلبك لمعرفة حالته الحالية', 'Enter your reference number to check your application status')}
        </p>
      </div>

      <Card className="p-6 mb-8">
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              placeholder={t('رقم المرجع (مثال: VSA-2024-001)', 'Reference code (e.g., VSA-2024-001)')}
              value={refCode}
              onChange={(e) => setRefCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch}>
            <Search size={16} />
            {t('بحث', 'Search')}
          </Button>
        </div>
        <p className="text-xs text-slate-400 mt-2">
          {t('💡 للتجربة استخدم: VSA-2024-001 أو VSA-2024-002', '💡 For demo try: VSA-2024-001 or VSA-2024-002')}
        </p>
      </Card>

      {searched && !found && (
        <Card className="p-8 text-center">
          <AlertCircle size={40} className="mx-auto text-amber-500 mb-3" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            {t('لم يتم العثور على الطلب', 'Application Not Found')}
          </h3>
          <p className="text-sm text-slate-500">
            {t('تأكد من رقم المرجع وحاول مرة أخرى', 'Please verify your reference number and try again')}
          </p>
        </Card>
      )}

      {searched && found && foundApp && (
        <div className="space-y-6 animate-fade-in">
          {/* Status Card */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">{t('حالة الطلب', 'Application Status')}</h3>
                <p className="text-sm text-slate-500" dir="ltr">{foundApp.referenceCode}</p>
              </div>
              <StatusBadge status={foundApp.status} lang={lang} />
            </div>

            {/* Progress Steps */}
            <div className="relative mt-6">
              <div className="absolute top-4 start-4 end-4 h-0.5 bg-slate-200 dark:bg-navy-700">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${(getStepIndex(foundApp.status) / (statusSteps.length - 1)) * 100}%` }}
                />
              </div>
              <div className="relative flex justify-between">
                {statusSteps.map((step, idx) => {
                  const isActive = idx <= getStepIndex(foundApp.status);
                  const isCurrent = idx === getStepIndex(foundApp.status);
                  return (
                    <div key={step.key} className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 ${
                        isActive ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-navy-700 text-slate-500'
                      } ${isCurrent ? 'ring-4 ring-emerald-100 dark:ring-emerald-900' : ''}`}>
                        {isActive ? <CheckCircle2 size={14} /> : idx + 1}
                      </div>
                      <span className={`text-[10px] mt-1 text-center max-w-[60px] ${isActive ? 'text-emerald-700 dark:text-emerald-400 font-medium' : 'text-slate-400'}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Details */}
          <Card className="p-6">
            <h4 className="font-semibold text-slate-900 dark:text-white mb-4">{t('تفاصيل الطلب', 'Application Details')}</h4>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500">{t('نوع الخدمة', 'Service Type')}</span>
                <p className="font-medium text-slate-900 dark:text-white">{foundApp.serviceType.replace('_', ' ')}</p>
              </div>
              <div>
                <span className="text-slate-500">{t('عدد المتقدمين', 'Applicants')}</span>
                <p className="font-medium text-slate-900 dark:text-white">{foundApp.applicants.length}</p>
              </div>
              <div>
                <span className="text-slate-500">{t('تاريخ التقديم', 'Submitted')}</span>
                <p className="font-medium text-slate-900 dark:text-white">{foundApp.createdAt}</p>
              </div>
              <div>
                <span className="text-slate-500">{t('آخر تحديث', 'Last Updated')}</span>
                <p className="font-medium text-slate-900 dark:text-white">{foundApp.updatedAt}</p>
              </div>
            </div>
          </Card>

          {/* Timeline */}
          <Card className="p-6">
            <h4 className="font-semibold text-slate-900 dark:text-white mb-4">{t('سجل التحديثات', 'Status Timeline')}</h4>
            <div className="space-y-4">
              {[...foundApp.statusHistory].reverse().map((event) => (
                <div key={event.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <div className="w-0.5 flex-1 bg-slate-200 dark:bg-navy-700" />
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {getStatusLabel(event.toStatus, lang)}
                    </p>
                    {event.note && <p className="text-xs text-slate-500 mt-0.5">{event.note}</p>}
                    <p className="text-xs text-slate-400 mt-0.5">{new Date(event.timestamp).toLocaleString(lang === 'ar' ? 'ar-SA' : 'en-US')}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Applicants */}
          <Card className="p-6">
            <h4 className="font-semibold text-slate-900 dark:text-white mb-4">{t('المتقدمون', 'Applicants')}</h4>
            <div className="space-y-3">
              {foundApp.applicants.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-navy-800 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{a.fullName}</p>
                    <p className="text-xs text-slate-500">{a.nationality} | {a.passportNumber}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <FileText size={12} />
                    {foundApp.documents.filter(d => d.applicantId === a.id).length} {t('مستندات', 'docs')}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
