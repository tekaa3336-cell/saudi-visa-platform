import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useApp } from '../store';
import { SERVICES } from '../data';
import { Card, Button, Input, Select, Stepper, Badge } from '../components/Layout';
import { Upload, CheckCircle2, FileText, User, Users, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import type { Applicant, Application } from '../types';

export default function ApplicationWizard() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const { state, t, addApplication } = useApp();
  const navigate = useNavigate();
  const lang = state.lang;

  const service = SERVICES.find(s => s.id === serviceId);
  const [step, setStep] = useState(0);
  const [applyForGroup, setApplyForGroup] = useState(false);
  const [applicants, setApplicants] = useState<Applicant[]>([{
    id: uuidv4(), fullName: '', nationality: '', passportNumber: '', passportExpiry: '',
    dateOfBirth: '', countryOfResidence: '', phone: '', email: '',
  }]);
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, { name: string; status: string }[]>>({});
  const [submitted, setSubmitted] = useState(false);
  const [referenceCode, setReferenceCode] = useState('');

  if (!service) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">{t('الخدمة غير متاحة', 'Service Not Available')}</h2>
        <Link to="/services" className="text-emerald-600 hover:underline">{t('العودة للخدمات', 'Back to Services')}</Link>
      </div>
    );
  }

  const steps = [
    t('نوع الطلب', 'Application Type'),
    t('بيانات المتقدم', 'Applicant Details'),
    t('المستندات', 'Documents'),
    t('المراجعة', 'Review'),
    t('التأكيد', 'Confirmation'),
  ];

  const addApplicant = () => {
    setApplicants([...applicants, {
      id: uuidv4(), fullName: '', nationality: '', passportNumber: '', passportExpiry: '',
      dateOfBirth: '', countryOfResidence: '', phone: '', email: '',
    }]);
  };

  const removeApplicant = (idx: number) => {
    if (applicants.length > 1) {
      setApplicants(applicants.filter((_, i) => i !== idx));
    }
  };

  const updateApplicant = (idx: number, field: keyof Applicant, value: string) => {
    const updated = [...applicants];
    updated[idx] = { ...updated[idx], [field]: value };
    setApplicants(updated);
  };

  const handleFileUpload = (applicantId: string) => {
    // Simulate file upload
    const existing = uploadedDocs[applicantId] || [];
    setUploadedDocs({
      ...uploadedDocs,
      [applicantId]: [...existing, { name: `document_${existing.length + 1}.pdf`, status: 'uploaded' }],
    });
  };

  const handleSubmit = () => {
    const code = `VSA-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}`;
    setReferenceCode(code);

    const application: Application = {
      id: uuidv4(),
      referenceCode: code,
      serviceType: service.id,
      userId: state.currentUser?.id || 'guest',
      applicants,
      status: 'submitted',
      paymentStatus: 'not_due',
      documents: applicants.flatMap(a => 
        (uploadedDocs[a.id] || []).map((doc, idx) => ({
          id: uuidv4(),
          applicantId: a.id,
          type: `doc_${idx}`,
          fileName: doc.name,
          storageKey: `docs/${code}/${doc.name}`,
          status: 'pending' as const,
          uploadedAt: new Date().toISOString(),
        }))
      ),
      statusHistory: [{
        id: uuidv4(),
        applicationId: '',
        fromStatus: null,
        toStatus: 'submitted',
        actorId: state.currentUser?.id || 'guest',
        actorRole: state.currentUser?.role || 'visitor',
        timestamp: new Date().toISOString(),
      }],
      totalCost: service.pricing.serviceFee + service.pricing.governmentFee,
      serviceFee: service.pricing.serviceFee,
      governmentFee: service.pricing.governmentFee,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addApplication(application);
    setSubmitted(true);
    setStep(4);
  };

  const totalCost = (service.pricing.serviceFee + service.pricing.governmentFee) * applicants.length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <Link to={`/services/${service.id}`} className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 mb-4">
          {lang === 'ar' ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
          {service.name[lang]}
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {t('طلب', 'Application')}: {service.name[lang]}
        </h1>
      </div>

      {/* Stepper */}
      <Stepper steps={steps} currentStep={step} lang={lang} />

      {/* Step 1: Application Type */}
      {step === 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            {t('نوع التقديم', 'Application Type')}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            {t('هل تقدم لنفسك أم لمجموعة/عائلة؟', 'Are you applying for yourself or for a group/family?')}
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <button
              onClick={() => { setApplyForGroup(false); setApplicants([applicants[0]]); }}
              className={`p-6 rounded-xl border-2 text-start transition-all ${
                !applyForGroup ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-200 dark:border-navy-700 hover:border-slate-300'
              }`}
            >
              <User size={24} className={!applyForGroup ? 'text-emerald-600' : 'text-slate-400'} />
              <h4 className="font-bold text-slate-900 dark:text-white mt-3">{t('تقديم فردي', 'Individual')}</h4>
              <p className="text-sm text-slate-500 mt-1">{t('طلب لشخص واحد', 'Application for one person')}</p>
            </button>
            <button
              onClick={() => setApplyForGroup(true)}
              className={`p-6 rounded-xl border-2 text-start transition-all ${
                applyForGroup ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-200 dark:border-navy-700 hover:border-slate-300'
              }`}
            >
              <Users size={24} className={applyForGroup ? 'text-emerald-600' : 'text-slate-400'} />
              <h4 className="font-bold text-slate-900 dark:text-white mt-3">{t('عائلة / مجموعة', 'Family / Group')}</h4>
              <p className="text-sm text-slate-500 mt-1">{t('إضافة عدة أشخاص', 'Add multiple people')}</p>
            </button>
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={() => setStep(1)}>
              {t('التالي', 'Next')}
              {lang === 'ar' ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
            </Button>
          </div>
        </Card>
      )}

      {/* Step 2: Applicant Details */}
      {step === 1 && (
        <div className="space-y-6">
          {applicants.map((applicant, idx) => (
            <Card key={applicant.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 dark:text-white">
                  {t('المتقدم', 'Applicant')} {idx + 1}
                </h3>
                {applicants.length > 1 && (
                  <button onClick={() => removeApplicant(idx)} className="text-sm text-red-500 hover:underline">
                    {t('حذف', 'Remove')}
                  </button>
                )}
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label={t('الاسم الكامل', 'Full Name')} value={applicant.fullName} onChange={e => updateApplicant(idx, 'fullName', e.target.value)} placeholder={t('كما في جواز السفر', 'As in passport')} />
                <Select label={t('الجنسية', 'Nationality')} value={applicant.nationality} onChange={e => updateApplicant(idx, 'nationality', e.target.value)} options={[
                  { value: '', label: t('اختر', 'Select') },
                  { value: 'Egyptian', label: t('مصري', 'Egyptian') },
                  { value: 'Pakistani', label: t('باكستاني', 'Pakistani') },
                  { value: 'Indian', label: t('هندي', 'Indian') },
                  { value: 'Filipino', label: t('فلبيني', 'Filipino') },
                  { value: 'Jordanian', label: t('أردني', 'Jordanian') },
                  { value: 'Other', label: t('أخرى', 'Other') },
                ]} />
                <Input label={t('رقم جواز السفر', 'Passport Number')} value={applicant.passportNumber} onChange={e => updateApplicant(idx, 'passportNumber', e.target.value)} placeholder="A12345678" />
                <Input label={t('تاريخ انتهاء الجواز', 'Passport Expiry')} type="date" value={applicant.passportExpiry} onChange={e => updateApplicant(idx, 'passportExpiry', e.target.value)} />
                <Input label={t('تاريخ الميلاد', 'Date of Birth')} type="date" value={applicant.dateOfBirth} onChange={e => updateApplicant(idx, 'dateOfBirth', e.target.value)} />
                <Select label={t('بلد الإقامة', 'Country of Residence')} value={applicant.countryOfResidence} onChange={e => updateApplicant(idx, 'countryOfResidence', e.target.value)} options={[
                  { value: '', label: t('اختر', 'Select') },
                  { value: 'UAE', label: 'UAE' },
                  { value: 'Saudi Arabia', label: t('السعودية', 'Saudi Arabia') },
                  { value: 'Kuwait', label: t('الكويت', 'Kuwait') },
                  { value: 'Qatar', label: t('قطر', 'Qatar') },
                  { value: 'Bahrain', label: t('البحرين', 'Bahrain') },
                  { value: 'Oman', label: t('عمان', 'Oman') },
                  { value: 'Other', label: t('أخرى', 'Other') },
                ]} />
                <Input label={t('الهاتف', 'Phone')} type="tel" value={applicant.phone} onChange={e => updateApplicant(idx, 'phone', e.target.value)} placeholder="+971..." />
                <Input label={t('البريد الإلكتروني', 'Email')} type="email" value={applicant.email} onChange={e => updateApplicant(idx, 'email', e.target.value)} placeholder="email@example.com" />
              </div>
            </Card>
          ))}
          {applyForGroup && (
            <Button variant="outline" onClick={addApplicant} className="w-full">
              <Users size={16} />
              {t('إضافة متقدم آخر', 'Add Another Applicant')}
            </Button>
          )}
          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(0)}>{t('السابق', 'Previous')}</Button>
            <Button onClick={() => setStep(2)}>
              {t('التالي', 'Next')}
              {lang === 'ar' ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Documents */}
      {step === 2 && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">{t('المستندات المطلوبة', 'Required Documents')}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              {t('يرجى رفع المستندات التالية لكل متقدم', 'Please upload the following documents for each applicant')}
            </p>
            <div className="space-y-3 mb-6">
              {service.requiredDocuments.map((doc, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <FileText size={14} className="text-emerald-600" />
                  {doc[lang]}
                </div>
              ))}
            </div>
          </Card>

          {applicants.map((applicant, idx) => (
            <Card key={applicant.id} className="p-6">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-3">
                {t('مستندات', 'Documents for')} {applicant.fullName || `${t('المتقدم', 'Applicant')} ${idx + 1}`}
              </h4>
              {/* Drop Zone */}
              <div
                className="border-2 border-dashed border-slate-300 dark:border-navy-700 rounded-xl p-8 text-center hover:border-emerald-400 transition-colors cursor-pointer"
                onClick={() => handleFileUpload(applicant.id)}
              >
                <Upload size={32} className="mx-auto text-slate-400 mb-2" />
                <p className="text-sm text-slate-600 dark:text-slate-400">{t('اسحب الملفات هنا أو انقر للرفع', 'Drag files here or click to upload')}</p>
                <p className="text-xs text-slate-400 mt-1">{t('PDF, JPG, PNG - حد أقصى 5MB', 'PDF, JPG, PNG - Max 5MB')}</p>
              </div>
              {/* Uploaded Files */}
              {uploadedDocs[applicant.id]?.length > 0 && (
                <div className="mt-4 space-y-2">
                  {uploadedDocs[applicant.id].map((doc, dIdx) => (
                    <div key={dIdx} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-navy-800 rounded-lg">
                      <div className="flex items-center gap-2">
                        <FileText size={14} className="text-emerald-600" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">{doc.name}</span>
                      </div>
                      <Badge color="success">{t('مرفوع', 'Uploaded')}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}

          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(1)}>{t('السابق', 'Previous')}</Button>
            <Button onClick={() => setStep(3)}>
              {t('التالي', 'Next')}
              {lang === 'ar' ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Review */}
      {step === 3 && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">{t('مراجعة الطلب', 'Review Application')}</h3>
            
            {/* Service Info */}
            <div className="mb-6 p-4 bg-slate-50 dark:bg-navy-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Badge color="info">{service.name[lang]}</Badge>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">{service.processingTime[lang]}</p>
            </div>

            {/* Applicants Summary */}
            <div className="mb-6">
              <h4 className="font-semibold text-slate-900 dark:text-white mb-3">{t('المتقدمون', 'Applicants')} ({applicants.length})</h4>
              {applicants.map((a, idx) => (
                <div key={a.id} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-navy-800 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{a.fullName || `${t('متقدم', 'Applicant')} ${idx + 1}`}</p>
                    <p className="text-xs text-slate-500">{a.nationality} | {a.passportNumber || '---'}</p>
                  </div>
                  <div className="text-xs text-slate-500">
                    {uploadedDocs[a.id]?.length || 0} {t('مستندات', 'docs')}
                  </div>
                </div>
              ))}
            </div>

            {/* Pricing */}
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <h4 className="font-semibold text-emerald-800 dark:text-emerald-300 mb-3">{t('ملخص التكلفة', 'Cost Summary')}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">{t('رسوم الخدمة', 'Service Fee')} ({applicants.length}x)</span>
                  <span className="font-medium">{service.pricing.serviceFee * applicants.length} {service.pricing.currency}</span>
                </div>
                {service.pricing.governmentFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">{t('رسوم حكومية', 'Government Fee')} ({applicants.length}x)</span>
                    <span className="font-medium">{service.pricing.governmentFee * applicants.length} {service.pricing.currency}</span>
                  </div>
                )}
                <div className="border-t border-emerald-200 dark:border-emerald-800 pt-2 flex justify-between font-bold">
                  <span className="text-emerald-800 dark:text-emerald-300">{t('الإجمالي', 'Total')}</span>
                  <span className="text-emerald-700 dark:text-emerald-400 text-lg">{totalCost} {service.pricing.currency}</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
                {t('⚠️ لن يتم تحصيل أي مبلغ الآن. سيتم تأكيد المبلغ النهائي قبل الدفع بعد مراجعة الطلب.', '⚠️ No payment is collected now. Final amount will be confirmed before payment after application review.')}
              </p>
            </div>
          </Card>

          <div className="flex items-start gap-2 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-400">
              {t(
                'بتقديم هذا الطلب، أنت توافق على أن هذه المنصة خدمة مستقلة وليست جهة حكومية. القرار النهائي بشأن التأشيرة يعود للجهات الرسمية المختصة.',
                'By submitting this application, you agree that this platform is an independent service and not a government entity. The final visa decision rests with the competent official authorities.'
              )}
            </p>
          </div>

          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(2)}>{t('السابق', 'Previous')}</Button>
            <Button onClick={handleSubmit} size="lg">
              <CheckCircle2 size={16} />
              {t('تقديم الطلب', 'Submit Application')}
            </Button>
          </div>
        </div>
      )}

      {/* Step 5: Confirmation */}
      {step === 4 && submitted && (
        <Card className="p-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
            <CheckCircle2 size={32} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            {t('تم تقديم طلبك بنجاح!', 'Application Submitted Successfully!')}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {t('سيتم مراجعة طلبك من قبل فريقنا. سنقوم بإبلاغك بأي تحديثات.', 'Your application will be reviewed by our team. We will notify you of any updates.')}
          </p>
          <div className="inline-flex items-center gap-2 bg-slate-100 dark:bg-navy-800 rounded-lg px-6 py-3 mb-6">
            <span className="text-sm text-slate-500">{t('رقم المرجع:', 'Reference:')}</span>
            <span className="font-bold text-lg text-emerald-600 dark:text-emerald-400" dir="ltr">{referenceCode}</span>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/track">
              <Button variant="outline">{t('تتبع الطلب', 'Track Application')}</Button>
            </Link>
            {state.isAuthenticated && (
              <Link to="/dashboard">
                <Button>{t('لوحة التحكم', 'Dashboard')}</Button>
              </Link>
            )}
            <Link to="/">
              <Button variant="ghost">{t('الرئيسية', 'Home')}</Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
