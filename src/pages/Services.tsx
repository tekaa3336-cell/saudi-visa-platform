import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../store';
import { SERVICES } from '../data';
import { Card, Button } from '../components/Layout';
import { Plane, Users, UserCheck, Briefcase, HardHat, Moon, Settings, ArrowLeft, ArrowRight, Clock, DollarSign } from 'lucide-react';

const iconMap: Record<string, React.ElementType> = { Plane, Users, UserCheck, Briefcase, HardHat, Moon, Settings };

export function ServicesCatalog() {
  const { state, t } = useApp();
  const lang = state.lang;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-fade-in">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
          {t('دليل الخدمات', 'Services Catalog')}
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          {t('اختر الخدمة المناسبة لاحتياجاتك من مجموعتنا الشاملة', 'Choose the service that fits your needs from our comprehensive collection')}
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {SERVICES.map((service) => {
          const Icon = iconMap[service.icon] || Plane;
          return (
            <Link key={service.id} to={`/services/${service.id}`} className="group">
              <Card className="p-6 h-full hover:shadow-lg hover:border-emerald-200 dark:hover:border-emerald-800 transition-all">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {service.name[lang]}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed line-clamp-2">
                  {service.shortDesc[lang]}
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-4">
                  <span className="flex items-center gap-1"><Clock size={12} />{service.processingTime[lang]}</span>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-navy-800">
                  <div className="flex items-center gap-1 text-sm">
                    <DollarSign size={14} className="text-emerald-600" />
                    <span className="font-bold text-slate-900 dark:text-white">{service.pricing.serviceFee + service.pricing.governmentFee}</span>
                    <span className="text-xs text-slate-500">{service.pricing.currency}</span>
                  </div>
                  <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                    {t('التفاصيل', 'Details')}
                    {lang === 'ar' ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
                  </span>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Comparison Note */}
      <Card className="mt-12 p-6 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
            <DollarSign size={16} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h4 className="font-semibold text-emerald-800 dark:text-emerald-300 mb-1">
              {t('ملاحظة حول التسعير', 'Pricing Note')}
            </h4>
            <p className="text-sm text-emerald-700 dark:text-emerald-400 leading-relaxed">
              {t(
                'الأسعار المعروضة هي تقديرية وقد تختلف حسب الجنسية ونوع الطلب. يتم تقسيم التكلفة بوضوح إلى رسوم خدمة ورسوم حكومية. الأسعار النهائية تُؤكد قبل الدفع.',
                'Displayed prices are estimates and may vary based on nationality and application type. Costs are clearly split into service fees and government fees. Final prices are confirmed before payment.'
              )}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export function ServiceDetail({ serviceId }: { serviceId: string }) {
  const { state, t } = useApp();
  const lang = state.lang;
  const service = SERVICES.find(s => s.id === serviceId);

  if (!service) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t('الخدمة غير موجودة', 'Service Not Found')}</h2>
        <Link to="/services" className="text-emerald-600 hover:underline mt-4 inline-block">{t('العودة للخدمات', 'Back to Services')}</Link>
      </div>
    );
  }

  const Icon = iconMap[service.icon] || Plane;
  const totalCost = service.pricing.serviceFee + service.pricing.governmentFee;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <Link to="/services" className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 mb-4">
          {lang === 'ar' ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
          {t('جميع الخدمات', 'All Services')}
        </Link>
        <div className="flex items-start gap-4">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center shrink-0`}>
            <Icon size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
              {service.name[lang]}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">{service.shortDesc[lang]}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card className="p-6">
            <h3 className="font-bold text-slate-900 dark:text-white mb-3">{t('عن الخدمة', 'About This Service')}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{service.description[lang]}</p>
          </Card>

          {/* Eligibility */}
          <Card className="p-6">
            <h3 className="font-bold text-slate-900 dark:text-white mb-3">{t('الشروط والأهلية', 'Eligibility')}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{service.eligibility[lang]}</p>
          </Card>

          {/* Required Documents */}
          <Card className="p-6">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">{t('المستندات المطلوبة', 'Required Documents')}</h3>
            <ul className="space-y-2">
              {service.requiredDocuments.map((doc, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">{idx + 1}</span>
                  </span>
                  {doc[lang]}
                </li>
              ))}
            </ul>
          </Card>

          {/* Steps */}
          <Card className="p-6">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">{t('خطوات الإجراءات', 'Process Steps')}</h3>
            <div className="space-y-3">
              {service.steps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 text-sm font-bold">
                    {idx + 1}
                  </div>
                  <div className="pt-1">
                    <p className="text-sm text-slate-700 dark:text-slate-300">{step[lang]}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing Card */}
          <Card className="p-6 sticky top-20">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">{t('التكلفة التقديرية', 'Estimated Cost')}</h3>
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">{t('رسوم الخدمة', 'Service Fee')}</span>
                <span className="font-medium text-slate-900 dark:text-white">{service.pricing.serviceFee} {service.pricing.currency}</span>
              </div>
              {service.pricing.governmentFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">{t('رسوم حكومية', 'Government Fee')}</span>
                  <span className="font-medium text-slate-900 dark:text-white">{service.pricing.governmentFee} {service.pricing.currency}</span>
                </div>
              )}
              <div className="border-t border-slate-200 dark:border-navy-700 pt-3 flex justify-between">
                <span className="font-bold text-slate-900 dark:text-white">{t('الإجمالي', 'Total')}</span>
                <span className="font-bold text-lg text-emerald-600 dark:text-emerald-400">{totalCost} {service.pricing.currency}</span>
              </div>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-4 bg-slate-50 dark:bg-navy-800 rounded-lg p-2">
              {t('⚡ الأسعار تقديرية وتُؤكد قبل الدفع', '⚡ Prices are estimates and confirmed before payment')}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-4">
              <Clock size={12} />
              <span>{t('وقت المعالجة', 'Processing time')}: {service.processingTime[lang]}</span>
            </div>
            <Link to={`/apply/${service.id}`}>
              <Button className="w-full">{t('ابدأ الطلب', 'Start Application')}</Button>
            </Link>
            <Link to="/contact">
              <Button variant="ghost" className="w-full mt-2">{t('استفسار', 'Inquiry')}</Button>
            </Link>

            {/* Wholesale Tiers */}
            {service.wholesaleTiers && service.wholesaleTiers.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-navy-700">
                <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-2">{t('أسعار الوكالات', 'Agency Pricing')}</h4>
                <div className="space-y-1.5">
                  {service.wholesaleTiers.map((tier, idx) => (
                    <div key={idx} className="flex justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-400">{tier.name[lang]} ({tier.minApplications}+)</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">-{tier.discountPercent}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
