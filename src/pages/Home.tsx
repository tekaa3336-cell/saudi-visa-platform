import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../store';
import { SERVICES } from '../data';
import { Card, Button, Input } from '../components/Layout';
import {
  Plane, Users, UserCheck, Briefcase, HardHat, Moon, Settings,
  Shield, Clock, FileCheck, ArrowLeft, ArrowRight, CheckCircle2,
  Search, Building2, ChevronDown, ChevronUp, Lock, Zap
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = { Plane, Users, UserCheck, Briefcase, HardHat, Moon, Settings };

export default function HomePage() {
  const { state, t } = useApp();
  const lang = state.lang;
  const [trackCode, setTrackCode] = useState('');
  const [trackResult, setTrackResult] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleTrack = () => {
    if (trackCode.trim().length >= 5) {
      setTrackResult(t('طلبك قيد المعالجة حالياً.', 'Your application is being processed.'));
    } else {
      setTrackResult(t('يرجى إدخال رقم مرجعي صحيح', 'Please enter a valid reference number'));
    }
  };

  const faqs = [
    { q: t('ما مدة معالجة التأشيرة السياحية؟', 'Tourist visa processing time?'), a: t('3-5 أيام عمل بعد استكمال المستندات.', '3-5 business days after document completion.') },
    { q: t('هل أنتم جهة حكومية؟', 'Are you a government entity?'), a: t('لا، نحن منصة خدمات مستقلة. القرار النهائي للجهات الرسمية.', 'No, we are independent. Final decisions rest with official authorities.') },
    { q: t('هل يمكنني التقديم لعائلتي؟', 'Can I apply for my family?'), a: t('نعم، يمكنك إضافة عدة أفراد في طلب واحد.', 'Yes, you can add multiple members in one application.') },
    { q: t('ما سياسة الاسترداد؟', 'Refund policy?'), a: t('الرسوم الحكومية غير قابلة للاسترداد بعد التقديم.', 'Government fees are non-refundable after submission.') },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-20">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full px-3 py-1 mb-5">
                <Shield size={13} className="text-emerald-400" />
                <span className="text-xs text-emerald-300">{t('منصة خدمات موثوقة', 'Trusted Service Platform')}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
                {t('خدمات التأشيرة والسفر', 'Saudi Visa & Travel')}
                <br />
                <span className="text-emerald-400">{t('إلى المملكة العربية السعودية', 'Services to Saudi Arabia')}</span>
              </h1>
              <p className="text-base text-slate-300 mb-6 leading-relaxed">
                {t('نساعدك في إعداد طلبات التأشيرة بكل سهولة وشفافية. نتولى التفاصيل وأنت تركز على رحلتك.', 'We help you prepare visa applications with ease and transparency. We handle the details while you focus on your journey.')}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/services"><Button size="lg">{t('استعرض الخدمات', 'Browse Services')}{lang === 'ar' ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}</Button></Link>
                <Link to="/track"><Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">{t('تتبع طلبك', 'Track')}</Button></Link>
              </div>
              <div className="flex items-center gap-4 mt-6 text-xs text-slate-400">
                <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-emerald-400" />{t('شفافية', 'Transparent')}</span>
                <span className="flex items-center gap-1"><Lock size={12} className="text-emerald-400" />{t('آمن', 'Secure')}</span>
                <span className="flex items-center gap-1"><Clock size={12} className="text-emerald-400" />{t('متابعة', 'Tracking')}</span>
              </div>
            </div>
            {/* Quick Track */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-5">
              <h3 className="text-lg font-bold mb-3">{t('تتبع سريع', 'Quick Track')}</h3>
              <p className="text-xs text-slate-300 mb-3">{t('أدخل رقم المرجع لمتابعة حالة طلبك', 'Enter reference to check status')}</p>
              <div className="space-y-3">
                <Input placeholder={t('رقم المرجع', 'Reference code')} value={trackCode} onChange={(e) => setTrackCode(e.target.value)} className="bg-white/10 border-white/20 text-white placeholder:text-slate-400" />
                <Button onClick={handleTrack} className="w-full"><Search size={14} />{t('بحث', 'Search')}</Button>
                {trackResult && <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-lg p-2 text-xs text-emerald-200">{trackResult}</div>}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('خدماتنا', 'Our Services')}</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">{t('مجموعة شاملة من خدمات التأشيرات والسفر', 'Comprehensive visa and travel services')}</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SERVICES.map((service) => {
            const Icon = iconMap[service.icon] || Plane;
            return (
              <Link key={service.id} to={`/services/${service.id}`}>
                <Card className="p-5 hover:shadow-lg hover:border-emerald-200 dark:hover:border-emerald-800 transition-all cursor-pointer group h-full">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${service.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <Icon size={18} className="text-white" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">{service.name[lang]}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">{service.shortDesc[lang]}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500 flex items-center gap-1"><Clock size={10} />{service.processingTime[lang]}</span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{service.pricing.serviceFee + service.pricing.governmentFee} {service.pricing.currency}</span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Coming Soon */}
        <div className="mt-6 grid sm:grid-cols-2 gap-4">
          <Link to="/hotels">
            <Card className="p-4 border-dashed border-2 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 hover:border-emerald-300 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center"><Building2 size={16} className="text-slate-500" /></div>
                <div>
                  <h4 className="font-semibold text-slate-700 dark:text-slate-300 text-sm">{t('حجز الفنادق', 'Hotels')}</h4>
                  <span className="text-[10px] text-amber-600">{t('قريباً', 'Coming Soon')}</span>
                </div>
              </div>
            </Card>
          </Link>
          <Link to="/flights">
            <Card className="p-4 border-dashed border-2 border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 hover:border-emerald-300 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center"><Plane size={16} className="text-slate-500" /></div>
                <div>
                  <h4 className="font-semibold text-slate-700 dark:text-slate-300 text-sm">{t('حجز الطيران', 'Flights')}</h4>
                  <span className="text-[10px] text-amber-600">{t('قريباً', 'Coming Soon')}</span>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-slate-100 dark:bg-slate-900/50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-8">{t('كيف يعمل؟', 'How It Works')}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: FileCheck, title: t('اختر الخدمة', 'Choose'), desc: t('استعرض خدماتنا', 'Browse services') },
              { icon: Users, title: t('أدخل البيانات', 'Details'), desc: t('أكمل بياناتك', 'Complete details') },
              { icon: Shield, title: t('المراجعة', 'Review'), desc: t('نراجع طلبك', 'We review') },
              { icon: Zap, title: t('الإصدار', 'Issue'), desc: t('متابعة حتى النتيجة', 'Follow-up') },
            ].map((step, idx) => (
              <Card key={idx} className="p-5 text-center">
                <div className="w-10 h-10 mx-auto rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center mb-3">
                  <step.icon size={20} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{step.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">{step.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{t('لماذا تختارنا؟', 'Why Choose Us?')}</h2>
            <div className="space-y-3">
              {[
                { icon: Shield, title: t('شفافية كاملة', 'Transparent'), desc: t('نفصل الرسوم بوضوح', 'Clear fee separation') },
                { icon: Lock, title: t('أمان البيانات', 'Data Security'), desc: t('مستنداتك محمية ومشفرة', 'Encrypted documents') },
                { icon: Zap, title: t('سرعة المعالجة', 'Fast Processing'), desc: t('إنجاز بأسرع وقت', 'Quick processing') },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="w-9 h-9 shrink-0 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                    <item.icon size={16} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white text-sm">{item.title}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Card className="p-6 bg-gradient-to-br from-emerald-50 to-slate-50 dark:from-emerald-900/20 dark:to-slate-900">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mb-3">
                <Shield size={22} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{t('التزامنا', 'Our Commitment')}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {t('نحن منصة مستقلة. لا نمثل أي جهة حكومية. دورنا مساعدتك في الإعداد والتنسيق. القرار النهائي للجهات الرسمية.', 'We are independent. We do not represent any government entity. Our role is assistance. Final decisions rest with official authorities.')}
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* B2B */}
      <section className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 rounded-full px-3 py-1 mb-3">
                <Building2 size={13} className="text-amber-400" />
                <span className="text-xs text-amber-300">{t('للوكالات', 'For Agencies')}</span>
              </div>
              <h2 className="text-xl font-bold mb-3">{t('انضم كوكالة معتمدة', 'Join as Agency')}</h2>
              <p className="text-slate-300 text-sm mb-4">{t('احصل على أسعار الجملة ولوحة تحكم مخصصة', 'Get wholesale pricing and custom dashboard')}</p>
              <Link to="/agency-info"><Button variant="outline" className="border-amber-500 text-amber-400 hover:bg-amber-500/10">{t('تسجيل وكالة', 'Register Agency')}{lang === 'ar' ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}</Button></Link>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h4 className="font-bold text-sm mb-3">{t('المستويات', 'Tiers')}</h4>
              <div className="space-y-2">
                {[
                  { tier: t('برونزي', 'Bronze'), discount: '5%', min: '10', color: 'bg-amber-700' },
                  { tier: t('فضي', 'Silver'), discount: '10%', min: '25', color: 'bg-slate-400' },
                  { tier: t('ذهبي', 'Gold'), discount: '15%', min: '50', color: 'bg-amber-500' },
                  { tier: t('بلاتيني', 'Platinum'), discount: t('مخصص', 'Custom'), min: '100+', color: 'bg-purple-500' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                      <span className="text-xs font-medium">{item.tier}</span>
                    </div>
                    <div className="text-xs">
                      <span className="text-emerald-400 font-bold">{item.discount}</span>
                      <span className="text-slate-400 ms-1">({item.min}+)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-6">{t('الأسئلة الشائعة', 'FAQ')}</h2>
        <div className="space-y-2">
          {faqs.map((faq, idx) => (
            <Card key={idx} className="overflow-hidden">
              <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)} className="w-full flex items-center justify-between p-4 text-start">
                <span className="font-medium text-sm text-slate-900 dark:text-white">{faq.q}</span>
                {openFaq === idx ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
              </button>
              {openFaq === idx && <div className="px-4 pb-4 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">{faq.a}</div>}
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-xl font-bold mb-3">{t('جاهز لبدء طلبك؟', 'Ready to Start?')}</h2>
          <p className="text-emerald-100 text-sm mb-5">{t('سجّل الآن واحصل على مساعدة متخصصة', 'Register now for specialized assistance')}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/register"><Button size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50">{t('إنشاء حساب', 'Register')}</Button></Link>
            <Link to="/contact"><Button variant="ghost" size="lg" className="text-white hover:bg-white/10">{t('تواصل معنا', 'Contact')}</Button></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
