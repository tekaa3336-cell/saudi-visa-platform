import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../store';
import { SERVICES } from '../data';
import { convertCurrency, formatCurrency } from '../preferences';
import { Card, Button } from '../components/Layout';
import { Plane, Users, UserCheck, Briefcase, HardHat, Moon, Settings, ArrowLeft, ArrowRight, Clock, DollarSign } from 'lucide-react';

const iconMap: Record<string, React.ElementType> = { Plane, Users, UserCheck, Briefcase, HardHat, Moon, Settings };

export function ServicesCatalog() {
  const { state, t } = useApp();
  const lang = state.lang;
  const currency = state.preferences.currency;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('دليل الخدمات', 'Services')}</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">{t('اختر الخدمة المناسبة', 'Choose your service')}</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SERVICES.map((service) => {
          const Icon = iconMap[service.icon] || Plane;
          const totalAED = service.pricing.serviceFee + service.pricing.governmentFee;
          const convertedTotal = convertCurrency(totalAED, currency);
          return (
            <Link key={service.id} to={`/services/${service.id}`}>
              <Card className="p-5 hover:shadow-lg hover:border-emerald-200 dark:hover:border-emerald-800 transition-all h-full">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${service.color} flex items-center justify-center mb-3`}>
                  <Icon size={18} className="text-white" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">{service.name[lang]}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">{service.shortDesc[lang]}</p>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-500 flex items-center gap-1"><Clock size={10} />{service.processingTime[lang]}</span>
                  <span className="text-xs font-bold text-emerald-600">{formatCurrency(convertedTotal, currency, lang)}</span>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
      <Card className="mt-8 p-4 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
        <div className="flex items-start gap-2">
          <DollarSign size={14} className="text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-xs text-emerald-700 dark:text-emerald-400">{t('الأسعار تقديرية. تُقسم إلى رسوم خدمة ورسوم حكومية. تُؤكد قبل الدفع.', 'Prices are estimates. Split into service and government fees. Confirmed before payment.')}</p>
        </div>
      </Card>
    </div>
  );
}

export function ServiceDetail({ serviceId }: { serviceId: string }) {
  const { state, t } = useApp();
  const lang = state.lang;
  const currency = state.preferences.currency;
  const service = SERVICES.find(s => s.id === serviceId);

  if (!service) return (
    <div className="max-w-4xl mx-auto px-4 py-10 text-center">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white">{t('غير موجودة', 'Not Found')}</h2>
      <Link to="/services" className="text-emerald-600 text-sm hover:underline mt-2 inline-block">{t('العودة', 'Back')}</Link>
    </div>
  );

  const Icon = iconMap[service.icon] || Plane;
  const totalCostAED = service.pricing.serviceFee + service.pricing.governmentFee;
  const convertedServiceFee = convertCurrency(service.pricing.serviceFee, currency);
  const convertedGovFee = convertCurrency(service.pricing.governmentFee, currency);
  const totalCost = convertCurrency(totalCostAED, currency);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link to="/services" className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 mb-4">
        {lang === 'ar' ? <ArrowRight size={12} /> : <ArrowLeft size={12} />}{t('الخدمات', 'Services')}
      </Link>
      <div className="flex items-start gap-3 mb-6">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center shrink-0`}><Icon size={22} className="text-white" /></div>
        <div><h1 className="text-xl font-bold text-slate-900 dark:text-white">{service.name[lang]}</h1><p className="text-xs text-slate-600 dark:text-slate-400">{service.shortDesc[lang]}</p></div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-2">{t('عن الخدمة', 'About')}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{service.description[lang]}</p>
          </Card>
          <Card className="p-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-2">{t('الشروط', 'Eligibility')}</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">{service.eligibility[lang]}</p>
          </Card>
          <Card className="p-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3">{t('المستندات المطلوبة', 'Documents')}</h3>
            <ul className="space-y-1.5">
              {service.requiredDocuments.map((doc, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 text-[10px] text-emerald-600 font-bold">{idx + 1}</span>
                  {doc[lang]}
                </li>
              ))}
            </ul>
          </Card>
          <Card className="p-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3">{t('الخطوات', 'Steps')}</h3>
            <div className="space-y-2">
              {service.steps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 text-[10px] font-bold">{idx + 1}</div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 pt-1">{step[lang]}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div>
          <Card className="p-4 sticky top-20">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3">{t('التكلفة', 'Cost')}</h3>
            <div className="space-y-2 mb-3">
              <div className="flex justify-between text-xs"><span className="text-slate-600 dark:text-slate-400">{t('رسوم خدمة', 'Service')}</span><span className="font-medium">{formatCurrency(convertedServiceFee, currency, lang)}</span></div>
              {service.pricing.governmentFee > 0 && <div className="flex justify-between text-xs"><span className="text-slate-600 dark:text-slate-400">{t('حكومي', 'Govt')}</span><span className="font-medium">{formatCurrency(convertedGovFee, currency, lang)}</span></div>}
              <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between"><span className="font-bold text-sm">{t('الإجمالي', 'Total')}</span><span className="font-bold text-emerald-600">{formatCurrency(totalCost, currency, lang)}</span></div>
            </div>
            <p className="text-[10px] text-slate-500 mb-3 bg-slate-50 dark:bg-slate-800 rounded p-1.5">{t('⚡ تُؤكد قبل الدفع', '⚡ Confirmed before payment')}</p>
            <div className="flex items-center gap-1 text-[10px] text-slate-500 mb-3"><Clock size={10} /><span>{service.processingTime[lang]}</span></div>
            <Link to={`/apply/${service.id}`}><Button className="w-full">{t('ابدأ الطلب', 'Start')}</Button></Link>
            <Link to="/contact"><Button variant="ghost" className="w-full mt-1">{t('استفسار', 'Inquiry')}</Button></Link>
            {service.wholesaleTiers && service.wholesaleTiers.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                <h4 className="text-[10px] font-semibold text-slate-500 uppercase mb-1.5">{t('وكالات', 'Agencies')}</h4>
                {service.wholesaleTiers.map((tier, idx) => (
                  <div key={idx} className="flex justify-between text-[10px]">
                    <span className="text-slate-600 dark:text-slate-400">{tier.name[lang]} ({tier.minApplications}+)</span>
                    <span className="text-emerald-600 font-medium">-{tier.discountPercent}%</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
