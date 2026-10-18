import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../store';
import { SERVICES } from '../data';
import { Card, Button, Input } from '../components/Layout';
import { SearchableSelect } from '../components/SearchableSelect';
import { DocumentUpload, type UploadedFileData } from '../components/DocumentUpload';
import { RESIDENCE_COUNTRIES } from '../data/countries';
import { NATIONALITIES } from '../data/nationalities';
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import type { Application } from '../types';
import { getMyApplication, resubmitApplication } from '../lib/applicationsApi';
import { latestRevisionNote } from '../lib/applicationMapper';
import {
  maxBirthDateISO, minBirthDateISO, tomorrowISO, validateDateOfBirth, validateEmail, validateFullName,
  validatePassportExpiry, validatePassportNumber, validatePhone,
} from '../utils/validation';

type Field = 'fullName' | 'nationality' | 'passportNumber' | 'passportExpiry' | 'dateOfBirth' | 'countryOfResidence' | 'phone' | 'email';

/** The applicant fixes what the admin asked for ("Action required") and sends the application back for review. */
export default function ResubmitApplication() {
  const { id } = useParams<{ id: string }>();
  const { state, t } = useApp();
  const lang = state.lang;
  const navigate = useNavigate();

  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [applicants, setApplicants] = useState<Application['applicants']>([]);
  const [newDocs, setNewDocs] = useState<Record<string, Record<string, UploadedFileData>>>({});
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!id) return;
      const res = await getMyApplication(id);
      if (cancelled) return;
      if (!res.ok) setLoadError(t(res.message.ar, res.message.en));
      else if (!res.data) setLoadError(t('الطلب غير موجود', 'Application not found'));
      else { setApp(res.data); setApplicants(res.data.applicants); }
      setLoading(false);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const service = app ? SERVICES.find(s => s.id === app.serviceType) : undefined;
  const revision = app ? latestRevisionNote(app) : null;

  const update = (idx: number, field: Field, value: string) => {
    setApplicants(prev => prev.map((a, i) => (i === idx ? { ...a, [field]: value } : a)));
    setErrors(prev => { const next = { ...prev }; delete next[`${idx}.${field}`]; return next; });
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    applicants.forEach((a, i) => {
      const fail = (f: Field, msg?: string) => { if (msg) next[`${i}.${f}`] = msg; };
      const name = validateFullName(a.fullName); if (!name.valid) fail('fullName', name.message);
      if (!a.nationality) fail('nationality', t('الجنسية مطلوبة', 'Nationality is required'));
      const pn = validatePassportNumber(a.passportNumber); if (!pn.valid) fail('passportNumber', pn.message);
      const exp = validatePassportExpiry(a.passportExpiry); if (!exp.valid) fail('passportExpiry', t(exp.message!, exp.messageEn!));
      const dob = validateDateOfBirth(a.dateOfBirth); if (!dob.valid) fail('dateOfBirth', t(dob.message!, dob.messageEn!));
      if (!a.countryOfResidence) fail('countryOfResidence', t('بلد الإقامة مطلوب', 'Country of residence is required'));
      const ph = validatePhone(a.phone); if (!ph.valid) fail('phone', ph.message);
      const em = validateEmail(a.email); if (!em.valid) fail('email', em.message);
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!app || submitting) return;
    setSubmitError('');
    if (!validate()) {
      setSubmitError(t('صحّح الحقول المظللة ثم أعد المحاولة', 'Fix the highlighted fields and try again'));
      return;
    }

    setSubmitting(true);
    const res = await resubmitApplication({
      applicationId: app.id,
      applicants,
      documents: applicants.flatMap(a =>
        Object.entries(newDocs[a.id] || {}).map(([docType, doc]) => ({
          applicantId: a.id,
          documentType: docType,
          fileName: doc.name,
          storageKey: doc.storageKey,
          mimeType: doc.mimeType,
          fileSize: doc.size,
        }))),
      note,
    });
    setSubmitting(false);

    if (!res.ok) {
      setSubmitError(t(res.message.ar, res.message.en));
      return;
    }
    setDone(true);
  };

  const Back = lang === 'ar' ? ArrowRight : ArrowLeft;

  if (loading) {
    return <div className="max-w-3xl mx-auto px-4 py-10 text-center text-sm text-slate-500" role="status">{t('جارٍ التحميل...', 'Loading...')}</div>;
  }

  if (loadError || !app) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 text-center">
        <p role="alert" className="text-sm text-red-600 mb-3">{loadError || t('الطلب غير موجود', 'Application not found')}</p>
        <Link to="/dashboard" className="text-emerald-600 text-sm hover:underline">{t('العودة إلى طلباتي', 'Back to my applications')}</Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="max-w-md mx-auto px-4 py-12 text-center animate-fade-in">
        <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-3"><CheckCircle2 size={28} className="text-emerald-600" /></div>
        <h1 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{t('تمت إعادة إرسال الطلب', 'Application resubmitted')}</h1>
        <p className="text-sm text-slate-500 mb-4">{t('سيراجع فريقنا التعديلات قريباً. رقم المرجع:', 'Our team will review your changes soon. Reference:')} <span className="font-mono" dir="ltr">{app.referenceCode}</span></p>
        <Button onClick={() => navigate('/dashboard')}>{t('العودة إلى طلباتي', 'Back to my applications')}</Button>
      </div>
    );
  }

  if (app.status !== 'needs_revision') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 text-center">
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">{t('لا يمكن تعديل هذا الطلب في حالته الحالية.', 'This application cannot be edited in its current status.')}</p>
        <Link to="/dashboard" className="text-emerald-600 text-sm hover:underline">{t('العودة إلى طلباتي', 'Back to my applications')}</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 animate-fade-in">
      <Link to="/dashboard" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 mb-3">
        <Back size={12} />{t('طلباتي', 'My applications')}
      </Link>
      <h1 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{t('تعديل الطلب', 'Edit application')}</h1>
      <p className="text-xs text-slate-500 mb-4">{service?.name[lang]} · <span className="font-mono" dir="ltr">{app.referenceCode}</span></p>

      <Card className="p-4 mb-4 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/10">
        <div className="flex items-start gap-2">
          <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-300">{t('ملاحظة من فريق المراجعة', 'Note from the review team')}</p>
            <p className="mt-1 text-sm text-amber-800 dark:text-amber-400 whitespace-pre-wrap break-words">
              {revision?.note || t('يرجى مراجعة بياناتك ومستنداتك ثم إعادة الإرسال.', 'Please review your details and documents, then resubmit.')}
            </p>
          </div>
        </div>
      </Card>

      {applicants.map((a, idx) => (
        <Card key={a.id} className="p-4 mb-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-3">{t('المتقدم', 'Applicant')} {idx + 1}</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <Input label={t('الاسم', 'Name')} value={a.fullName} onChange={e => update(idx, 'fullName', e.target.value)} error={errors[`${idx}.fullName`]} required />
            <SearchableSelect
              label={t('الجنسية', 'Nationality')} value={a.nationality} onChange={v => update(idx, 'nationality', v)}
              error={errors[`${idx}.nationality`]} placeholder={t('اختر الجنسية', 'Select nationality')} required
              options={NATIONALITIES.map(n => ({ value: n.code, label: n.name[lang] }))}
            />
            <Input label={t('الجواز', 'Passport')} value={a.passportNumber} onChange={e => update(idx, 'passportNumber', e.target.value)} error={errors[`${idx}.passportNumber`]} required />
            <Input label={t('انتهاء الجواز', 'Expiry')} type="date" min={tomorrowISO()} max="9999-12-31" value={a.passportExpiry} onChange={e => update(idx, 'passportExpiry', e.target.value)} error={errors[`${idx}.passportExpiry`]} required />
            <Input label={t('الميلاد', 'DOB')} type="date" min={minBirthDateISO()} max={maxBirthDateISO()} value={a.dateOfBirth} onChange={e => update(idx, 'dateOfBirth', e.target.value)} error={errors[`${idx}.dateOfBirth`]} required />
            <SearchableSelect
              label={t('بلد الإقامة', 'Country of Residence')} value={a.countryOfResidence} onChange={v => update(idx, 'countryOfResidence', v)}
              error={errors[`${idx}.countryOfResidence`]} placeholder={t('اختر بلد الإقامة', 'Select country of residence')} required
              options={RESIDENCE_COUNTRIES.map(c => ({ value: c.code, label: c.name[lang] }))}
            />
            <Input label={t('الهاتف', 'Phone')} value={a.phone} onChange={e => update(idx, 'phone', e.target.value)} error={errors[`${idx}.phone`]} dir="ltr" />
            <Input label={t('البريد', 'Email')} type="email" value={a.email} onChange={e => update(idx, 'email', e.target.value)} error={errors[`${idx}.email`]} dir="ltr" />
          </div>

          {service && (
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <p className="text-xs text-slate-500">{t('ارفع ملفاً جديداً فقط للمستندات التي تريد استبدالها', 'Upload a new file only for the documents you want to replace')}</p>
              {service.requiredDocuments.map((doc, docIdx) => {
                const type = `doc_${docIdx}`;
                const current = app.documents.find(d => d.applicantId === a.id && d.type === type);
                return (
                  <div key={type}>
                    <DocumentUpload
                      label={doc[lang]}
                      applicantId={a.id}
                      documentType={type}
                      lang={lang}
                      uploadedFile={newDocs[a.id]?.[type] ?? null}
                      onUpload={(aid, dt, file) => setNewDocs(prev => ({ ...prev, [aid]: { ...prev[aid], [dt]: file } }))}
                      onRemove={(aid, dt) => setNewDocs(prev => { const m = { ...prev[aid] }; delete m[dt]; return { ...prev, [aid]: m }; })}
                    />
                    {current && !newDocs[a.id]?.[type] && (
                      <p className="text-[11px] text-slate-500 mt-1">{t('الملف الحالي:', 'Current file:')} {current.fileName}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      ))}

      <Card className="p-4 mb-4">
        <label htmlFor="resubmit-note" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
          {t('ملاحظة للمراجع', 'Note for the reviewer')} <span className="text-slate-400 text-xs">{t('(اختياري)', '(optional)')}</span>
        </label>
        <textarea
          id="resubmit-note" rows={3} maxLength={500} value={note} onChange={e => setNote(e.target.value)}
          placeholder={t('اذكر ما قمت بتعديله...', 'Describe what you changed...')}
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 resize-y"
        />
      </Card>

      {submitError && (
        <div role="alert" className="mb-4 flex items-start gap-1.5 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg text-sm text-red-600">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />{submitError}
        </div>
      )}
      <Button className="w-full" onClick={() => void handleSubmit()} disabled={submitting}>
        <CheckCircle2 size={14} />{submitting ? t('جارٍ الإرسال...', 'Submitting...') : t('إعادة إرسال الطلب', 'Resubmit application')}
      </Button>
    </div>
  );
}
