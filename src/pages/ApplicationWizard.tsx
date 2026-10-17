import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useApp } from '../store';
import { SERVICES } from '../data';
import { convertCurrency, formatCurrency } from '../preferences';
import { Card, Button, Input, Select, Stepper } from '../components/Layout';
import { SearchableSelect } from '../components/SearchableSelect';
import { DocumentUpload } from '../components/DocumentUpload';
import { RESIDENCE_COUNTRIES } from '../data/countries';
import { NATIONALITIES } from '../data/nationalities';
import { DIAL_CODES, DEFAULT_DIAL_CODE } from '../data/dialCodes';
import { Upload, CheckCircle2, FileText, User, Users, ArrowRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import type { Applicant, Application } from '../types';
import {
  validateDateOfBirth,
  validatePassportExpiry,
  validatePhone,
  validateEmail,
  buildInternationalPhone,
  minBirthDateISO,
  maxBirthDateISO,
  tomorrowISO,
} from '../utils/validation';

export default function ApplicationWizard() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const { state, t, addApplication } = useApp();
  const navigate = useNavigate();
  const lang = state.lang;
  const currency = state.preferences.currency;
  const service = SERVICES.find(s => s.id === serviceId);

  const [step, setStep] = useState(0);
  const [applyForGroup, setApplyForGroup] = useState(false);
  const [applicants, setApplicants] = useState<Applicant[]>([{
    id: uuidv4(), fullName: '', nationality: '', passportNumber: '', passportExpiry: '',
    dateOfBirth: '', countryOfResidence: '', phone: '', email: '',
  }]);
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, Record<string, { name: string; url: string; size: number }>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [referenceCode, setReferenceCode] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  // Raw phone inputs per applicant: the dial code comes from the dropdown, the national number is typed.
  // The combined international number (e.g. +971501234567) is what gets stored in applicant.phone.
  const [phoneInputs, setPhoneInputs] = useState<Record<string, { dial: string; national: string }>>({});

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [step]);

  if (!service) return (
    <div className="max-w-4xl mx-auto px-4 py-10 text-center">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{t('الخدمة غير متاحة', 'Service Not Available')}</h2>
      <Link to="/services" className="text-emerald-600 hover:underline text-sm">{t('العودة', 'Back')}</Link>
    </div>
  );

  const steps = [t('النوع', 'Type'), t('البيانات', 'Details'), t('المستندات', 'Docs'), t('المراجعة', 'Review'), t('التأكيد', 'Confirm')];

  const addApplicant = () => setApplicants([...applicants, {
    id: uuidv4(), fullName: '', nationality: '', passportNumber: '', passportExpiry: '',
    dateOfBirth: '', countryOfResidence: '', phone: '', email: '',
  }]);

  const removeApplicant = (idx: number) => { if (applicants.length > 1) setApplicants(applicants.filter((_, i) => i !== idx)); };

  const updateApplicant = (idx: number, field: keyof Applicant, value: string) => {
    const updated = [...applicants];
    updated[idx] = { ...updated[idx], [field]: value };
    setApplicants(updated);
  };

  const getPhoneInput = (applicantId: string) =>
    phoneInputs[applicantId] ?? { dial: DEFAULT_DIAL_CODE, national: '' };

  const updatePhone = (idx: number, changes: Partial<{ dial: string; national: string }>) => {
    const id = applicants[idx].id;
    const next = { ...getPhoneInput(id), ...changes };
    setPhoneInputs(prev => ({ ...prev, [id]: next }));
    updateApplicant(idx, 'phone', buildInternationalPhone(next.dial, next.national));
  };

  const markFieldTouched = (applicantId: string, field: string) => {
    setTouchedFields({ ...touchedFields, [`${applicantId}_${field}`]: true });
  };

  const isFieldTouched = (applicantId: string, field: string) => {
    return touchedFields[`${applicantId}_${field}`] || false;
  };

  const markAllFieldsTouched = () => {
    const allTouched: Record<string, boolean> = {};
    applicants.forEach(applicant => {
      ['fullName', 'nationality', 'passportNumber', 'passportExpiry', 'dateOfBirth', 'countryOfResidence', 'phone', 'email'].forEach(field => {
        allTouched[`${applicant.id}_${field}`] = true;
      });
    });
    setTouchedFields(allTouched);
  };

  const validatePassport = (passport: string): boolean => {
    if (!passport.trim()) return false;
    const passportRegex = /^[A-Z0-9]{6,9}$/i;
    return passportRegex.test(passport);
  };

  const validateFullName = (name: string): boolean => {
    if (!name.trim()) return false;
    const nameRegex = /^[\u0600-\u06FFa-zA-Z\s]+$/;
    if (!nameRegex.test(name)) return false;
    const words = name.trim().split(/\s+/);
    return words.length >= 2;
  };

  const validateStep1 = (): boolean => {
    let isValid = true;
    const errors: string[] = [];

    applicants.forEach((applicant, idx) => {
      const applicantNum = idx + 1;
      
      if (!applicant.fullName.trim()) {
        errors.push(t(`الاسم مطلوب للمتقدم ${applicantNum}`, `Full name is required for applicant ${applicantNum}`));
        isValid = false;
      } else if (!validateFullName(applicant.fullName)) {
        errors.push(t(`اسم غير صحيح للمتقدم ${applicantNum}`, `Invalid name for applicant ${applicantNum}`));
        isValid = false;
      }
      
      if (!applicant.nationality) {
        errors.push(t(`الجنسية مطلوبة للمتقدم ${applicantNum}`, `Nationality is required for applicant ${applicantNum}`));
        isValid = false;
      }
      
      if (!applicant.passportNumber.trim()) {
        errors.push(t(`رقم الجواز مطلوب للمتقدم ${applicantNum}`, `Passport number is required for applicant ${applicantNum}`));
        isValid = false;
      } else if (!validatePassport(applicant.passportNumber)) {
        errors.push(t(`رقم جواز غير صحيح للمتقدم ${applicantNum}`, `Invalid passport number for applicant ${applicantNum}`));
        isValid = false;
      }
      
      const expiryCheck = validatePassportExpiry(applicant.passportExpiry);
      if (!expiryCheck.valid) {
        errors.push(t(`${expiryCheck.message} (المتقدم ${applicantNum})`, `${expiryCheck.messageEn} (applicant ${applicantNum})`));
        isValid = false;
      }

      const dobCheck = validateDateOfBirth(applicant.dateOfBirth);
      if (!dobCheck.valid) {
        errors.push(t(`${dobCheck.message} (المتقدم ${applicantNum})`, `${dobCheck.messageEn} (applicant ${applicantNum})`));
        isValid = false;
      }
      
      if (!applicant.countryOfResidence) {
        errors.push(t(`بلد الإقامة مطلوب للمتقدم ${applicantNum}`, `Country of residence is required for applicant ${applicantNum}`));
        isValid = false;
      }

      const phoneInput = getPhoneInput(applicant.id);
      const phoneCheck = validatePhone(phoneInput.dial, phoneInput.national);
      if (!phoneCheck.valid) {
        errors.push(t(`${phoneCheck.message} (المتقدم ${applicantNum})`, `${phoneCheck.messageEn} (applicant ${applicantNum})`));
        isValid = false;
      }

      const emailCheck = validateEmail(applicant.email);
      if (!emailCheck.valid) {
        errors.push(t(`${emailCheck.message} (المتقدم ${applicantNum})`, `${emailCheck.messageEn} (applicant ${applicantNum})`));
        isValid = false;
      }
    });

    if (!isValid) {
      setValidationError(errors[0]);
      markAllFieldsTouched();
    } else {
      setValidationError(null);
    }

    return isValid;
  };

  const handleNext = (targetStep: number) => {
    if (step === 1) {
      const isValid = validateStep1();
      if (!isValid) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }
    setStep(targetStep);
    setValidationError(null);
  };

  const handleDocumentUpload = (applicantId: string, documentType: string, fileData: { name: string; url: string; size: number }) => {
    setUploadedDocs(prev => ({
      ...prev,
      [applicantId]: {
        ...prev[applicantId],
        [documentType]: fileData
      }
    }));
  };

  const handleDocumentRemove = (applicantId: string, documentType: string) => {
    setUploadedDocs(prev => {
      const applicantDocs = { ...prev[applicantId] };
      delete applicantDocs[documentType];
      return {
        ...prev,
        [applicantId]: applicantDocs
      };
    });
  };

  const validateDocuments = (): boolean => {
    let isValid = true;
    const errors: string[] = [];

    applicants.forEach((applicant, idx) => {
      const applicantNum = idx + 1;
      const applicantDocs = uploadedDocs[applicant.id] || {};
      
      service.requiredDocuments.forEach((doc, docIdx) => {
        const docType = `doc_${docIdx}`;
        if (!applicantDocs[docType]) {
          errors.push(t(`المستند "${doc[lang]}" مطلوب للمتقدم ${applicantNum}`, `Document "${doc[lang]}" is required for applicant ${applicantNum}`));
          isValid = false;
        }
      });
    });

    if (!isValid) {
      setValidationError(errors[0]);
    } else {
      setValidationError(null);
    }

    return isValid;
  };

  const handleSubmit = () => {
    const code = `VSA-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}`;
    setReferenceCode(code);
    const application: Application = {
      id: uuidv4(), referenceCode: code, serviceType: service.id,
      userId: state.currentUser?.id || 'guest', applicants,
      status: 'submitted', paymentStatus: 'not_due',
      documents: applicants.flatMap(a => {
        const applicantDocs = uploadedDocs[a.id] || {};
        return Object.entries(applicantDocs).map(([docType, docData]) => ({
          id: uuidv4(),
          applicantId: a.id,
          type: docType,
          fileName: docData.name,
          storageKey: `docs/${code}/${docData.name}`,
          status: 'pending' as const,
          uploadedAt: new Date().toISOString(),
        }));
      }),
      statusHistory: [{ id: uuidv4(), applicationId: '', fromStatus: null, toStatus: 'submitted',
        actorId: state.currentUser?.id || 'guest', actorRole: state.currentUser?.role || 'visitor', timestamp: new Date().toISOString() }],
      totalCost: service.pricing.serviceFee + service.pricing.governmentFee,
      serviceFee: service.pricing.serviceFee, governmentFee: service.pricing.governmentFee,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    addApplication(application);
    setSubmitted(true);
    setStep(4);
  };

  const totalCostAED = (service.pricing.serviceFee + service.pricing.governmentFee) * applicants.length;
  const totalCost = convertCurrency(totalCostAED, currency);
  const serviceFeeConverted = convertCurrency(service.pricing.serviceFee * applicants.length, currency);
  const govFeeConverted = convertCurrency(service.pricing.governmentFee * applicants.length, currency);

  const getFieldError = (applicant: Applicant, field: string): string | undefined => {
    if (!isFieldTouched(applicant.id, field)) return undefined;
    
    switch (field) {
      case 'fullName':
        return !applicant.fullName.trim() ? t('الاسم مطلوب', 'Full name is required') : undefined;
      case 'nationality':
        return !applicant.nationality ? t('الجنسية مطلوبة', 'Nationality is required') : undefined;
      case 'passportNumber':
        return !applicant.passportNumber.trim() ? t('رقم الجواز مطلوب', 'Passport number is required') : undefined;
      case 'passportExpiry': {
        const result = validatePassportExpiry(applicant.passportExpiry);
        return result.valid ? undefined : t(result.message!, result.messageEn!);
      }
      case 'dateOfBirth': {
        const result = validateDateOfBirth(applicant.dateOfBirth);
        return result.valid ? undefined : t(result.message!, result.messageEn!);
      }
      case 'phone': {
        const { dial, national } = getPhoneInput(applicant.id);
        const result = validatePhone(dial, national);
        return result.valid ? undefined : t(result.message!, result.messageEn!);
      }
      case 'email': {
        const result = validateEmail(applicant.email);
        return result.valid ? undefined : t(result.message!, result.messageEn!);
      }
      case 'countryOfResidence':
        return !applicant.countryOfResidence ? t('بلد الإقامة مطلوب', 'Country of residence is required') : undefined;
      default:
        return undefined;
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 animate-fade-in">
      <Link to={`/services/${service.id}`} className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 mb-3">
        {lang === 'ar' ? <ArrowRight size={12} /> : <ArrowLeft size={12} />}{service.name[lang]}
      </Link>
      <h1 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{t('طلب', 'Application')}: {service.name[lang]}</h1>
      <Stepper steps={steps} currentStep={step} />

      {validationError && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
          <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 dark:text-red-400 font-medium">{validationError}</p>
        </div>
      )}

      {step === 0 && (
        <Card className="p-5">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-3">{t('نوع التقديم', 'Application Type')}</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <button onClick={() => { setApplyForGroup(false); setApplicants([applicants[0]]); }}
              className={`p-4 rounded-lg border-2 text-start ${!applyForGroup ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-200 dark:border-slate-700'}`}>
              <User size={20} className={!applyForGroup ? 'text-emerald-600' : 'text-slate-400'} />
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-2">{t('فردي', 'Individual')}</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">{t('شخص واحد', 'One person')}</p>
            </button>
            <button onClick={() => setApplyForGroup(true)}
              className={`p-4 rounded-lg border-2 text-start ${applyForGroup ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-200 dark:border-slate-700'}`}>
              <Users size={20} className={applyForGroup ? 'text-emerald-600' : 'text-slate-400'} />
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-2">{t('عائلة/مجموعة', 'Family/Group')}</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">{t('عدة أشخاص', 'Multiple people')}</p>
            </button>
          </div>
          <div className="mt-4 flex justify-end"><Button onClick={() => handleNext(1)}>{t('التالي', 'Next')}{lang === 'ar' ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}</Button></div>
        </Card>
      )}

      {step === 1 && (
        <div className="space-y-4">
          {applicants.map((applicant, idx) => (
            <Card key={applicant.id} className="p-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{t('متقدم', 'Applicant')} {idx + 1}</h4>
                {applicants.length > 1 && <button onClick={() => removeApplicant(idx)} className="text-xs text-red-500">{t('حذف', 'Remove')}</button>}
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <Input 
                  label={t('الاسم', 'Name')} 
                  value={applicant.fullName} 
                  onChange={e => updateApplicant(idx, 'fullName', e.target.value)}
                  onBlur={() => markFieldTouched(applicant.id, 'fullName')}
                  error={getFieldError(applicant, 'fullName')}
                  required
                />
                <SearchableSelect
                  label={t('الجنسية', 'Nationality')}
                  value={applicant.nationality}
                  onChange={(value) => {
                    updateApplicant(idx, 'nationality', value);
                    markFieldTouched(applicant.id, 'nationality');
                  }}
                  error={getFieldError(applicant, 'nationality')}
                  placeholder={t('اختر الجنسية', 'Select nationality')}
                  required
                  options={NATIONALITIES.map(nat => ({
                    value: nat.code,
                    label: nat.name[lang]
                  }))}
                />
                <Input 
                  label={t('الجواز', 'Passport')} 
                  value={applicant.passportNumber} 
                  onChange={e => updateApplicant(idx, 'passportNumber', e.target.value)}
                  onBlur={() => markFieldTouched(applicant.id, 'passportNumber')}
                  error={getFieldError(applicant, 'passportNumber')}
                  required
                />
                <Input 
                  label={t('انتهاء الجواز', 'Expiry')} 
                  type="date"
                  min={tomorrowISO()}
                  max="9999-12-31"
                  value={applicant.passportExpiry}
                  onChange={e => updateApplicant(idx, 'passportExpiry', e.target.value)}
                  onBlur={() => markFieldTouched(applicant.id, 'passportExpiry')}
                  error={getFieldError(applicant, 'passportExpiry')}
                  required
                />
                <Input 
                  label={t('الميلاد', 'DOB')} 
                  type="date"
                  min={minBirthDateISO()}
                  max={maxBirthDateISO()}
                  value={applicant.dateOfBirth}
                  onChange={e => updateApplicant(idx, 'dateOfBirth', e.target.value)}
                  onBlur={() => markFieldTouched(applicant.id, 'dateOfBirth')}
                  error={getFieldError(applicant, 'dateOfBirth')}
                  required
                />
                <SearchableSelect
                  label={t('بلد الإقامة', 'Country of Residence')}
                  value={applicant.countryOfResidence}
                  onChange={(value) => {
                    updateApplicant(idx, 'countryOfResidence', value);
                    markFieldTouched(applicant.id, 'countryOfResidence');
                  }}
                  error={getFieldError(applicant, 'countryOfResidence')}
                  placeholder={t('اختر بلد الإقامة', 'Select country of residence')}
                  required
                  options={RESIDENCE_COUNTRIES.map(country => ({
                    value: country.code,
                    label: country.name[lang]
                  }))}
                />
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('الهاتف', 'Phone')}</label>
                  <div className="flex gap-2" dir="ltr">
                    <select
                      aria-label={t('كود الدولة', 'Country dial code')}
                      value={getPhoneInput(applicant.id).dial}
                      onChange={e => updatePhone(idx, { dial: e.target.value })}
                      onBlur={() => markFieldTouched(applicant.id, 'phone')}
                      className={`w-32 shrink-0 px-2 py-2 rounded-lg border ${getFieldError(applicant, 'phone') ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'} bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                    >
                      {DIAL_CODES.map(c => (
                        <option key={c.dial} value={c.dial}>{c.dial} {c.name[lang]}</option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel-national"
                      placeholder="501234567"
                      value={getPhoneInput(applicant.id).national}
                      onChange={e => updatePhone(idx, { national: e.target.value })}
                      onBlur={() => markFieldTouched(applicant.id, 'phone')}
                      required
                      className={`w-full min-w-0 px-3 py-2 rounded-lg border ${getFieldError(applicant, 'phone') ? 'border-red-500' : 'border-slate-300 dark:border-slate-700'} bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500`}
                    />
                  </div>
                  {getFieldError(applicant, 'phone') && <p className="text-xs text-red-500">{getFieldError(applicant, 'phone')}</p>}
                </div>
                <Input
                  label={t('البريد', 'Email')}
                  type="email"
                  autoComplete="email"
                  dir="ltr"
                  value={applicant.email}
                  onChange={e => updateApplicant(idx, 'email', e.target.value)}
                  onBlur={() => markFieldTouched(applicant.id, 'email')}
                  error={getFieldError(applicant, 'email')}
                  required
                />
              </div>
            </Card>
          ))}
          {applyForGroup && <Button variant="outline" onClick={addApplicant} className="w-full"><Users size={14} />{t('إضافة', 'Add')}</Button>}
          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(0)}>{t('السابق', 'Back')}</Button>
            <Button onClick={() => handleNext(2)}>{t('التالي', 'Next')}{lang === 'ar' ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}</Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          {applicants.map((applicant, applicantIdx) => (
            <Card key={applicant.id} className="p-4">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-4">
                {applicant.fullName || `${t('متقدم', 'Applicant')} ${applicantIdx + 1}`}
              </h4>
              <div className="space-y-4">
                {service.requiredDocuments.map((doc, docIdx) => {
                  const docType = `doc_${docIdx}`;
                  const uploadedFile = uploadedDocs[applicant.id]?.[docType];
                  
                  return (
                    <DocumentUpload
                      key={docType}
                      label={doc[lang]}
                      applicantId={applicant.id}
                      documentType={docType}
                      onUpload={handleDocumentUpload}
                      onRemove={handleDocumentRemove}
                      uploadedFile={uploadedFile}
                      required={true}
                      lang={lang}
                    />
                  );
                })}
              </div>
            </Card>
          ))}
          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(1)}>{t('السابق', 'Back')}</Button>
            <Button 
              onClick={() => {
                if (validateDocuments()) {
                  handleNext(3);
                }
              }}
            >
              {t('التالي', 'Next')}{lang === 'ar' ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3">{t('المراجعة', 'Review')}</h3>
            <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <p className="text-xs text-slate-600 dark:text-slate-400">{service.name[lang]} • {service.processingTime[lang]}</p>
            </div>
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-slate-900 dark:text-white mb-2">{t('المتقدمون', 'Applicants')} ({applicants.length})</h4>
              {applicants.map((a, idx) => (
                <div key={a.id} className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800 last:border-0 text-xs">
                  <div><p className="font-medium text-slate-900 dark:text-white">{a.fullName || `${t('متقدم', 'Applicant')} ${idx + 1}`}</p><p className="text-[10px] text-slate-500">{a.nationality}</p></div>
                  <span className="text-slate-500">{Object.keys(uploadedDocs[a.id] || {}).length} {t('مستندات', 'docs')}</span>
                </div>
              ))}
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-400">{t('رسوم خدمة', 'Service')} ({applicants.length}x)</span><span className="font-medium">{formatCurrency(serviceFeeConverted, currency, lang)}</span></div>
                {service.pricing.governmentFee > 0 && <div className="flex justify-between"><span className="text-slate-600 dark:text-slate-400">{t('حكومي', 'Govt')} ({applicants.length}x)</span><span className="font-medium">{formatCurrency(govFeeConverted, currency, lang)}</span></div>}
                <div className="border-t border-emerald-200 dark:border-emerald-800 pt-1 flex justify-between font-bold"><span className="text-emerald-800 dark:text-emerald-300">{t('الإجمالي', 'Total')}</span><span className="text-emerald-700 dark:text-emerald-400">{formatCurrency(totalCost, currency, lang)}</span></div>
              </div>
              <p className="text-[10px] text-slate-500 mt-2">{t('⚠️ لا يتم التحصيل الآن. يُؤكد المبلغ قبل الدفع.', '⚠️ No payment now. Amount confirmed before payment.')}</p>
            </div>
          </Card>
          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <AlertCircle size={14} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[10px] text-amber-700 dark:text-amber-400">{t('بتقديمك، توافق أن هذه المنصة مستقلة وليست حكومية. القرار النهائي للجهات الرسمية.', 'By submitting, you agree this is independent, not government. Final decision with authorities.')}</p>
          </div>
          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep(2)}>{t('السابق', 'Back')}</Button>
            <Button onClick={handleSubmit}><CheckCircle2 size={14} />{t('تقديم', 'Submit')}</Button>
          </div>
        </div>
      )}

      {step === 4 && submitted && (
        <Card className="p-6 text-center">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-3"><CheckCircle2 size={28} className="text-emerald-600" /></div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{t('تم التقديم!', 'Submitted!')}</h2>
          <p className="text-xs text-slate-500 mb-4">{t('سيتم مراجعة طلبك', 'Your application will be reviewed')}</p>
          <div className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg px-4 py-2 mb-4">
            <span className="text-xs text-slate-500">{t('المرجع:', 'Ref:')}</span>
            <span className="font-bold text-emerald-600" dir="ltr">{referenceCode}</span>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Link to="/track"><Button variant="outline" size="sm">{t('تتبع', 'Track')}</Button></Link>
            {state.isAuthenticated && <Link to="/dashboard"><Button size="sm">{t('لوحتي', 'Dashboard')}</Button></Link>}
            <Link to="/"><Button variant="ghost" size="sm">{t('الرئيسية', 'Home')}</Button></Link>
          </div>
        </Card>
      )}
    </div>
  );
}
