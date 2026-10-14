import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../store';
import { SERVICES } from '../data';
import { Card, Button, Input } from '../components/Layout';
import {
  Plane, Users, UserCheck, Briefcase, HardHat, Moon, Settings,
  Shield, Clock, FileCheck, ArrowLeft, ArrowRight, CheckCircle2,
  Search, Building2, Star, ChevronDown, ChevronUp, Globe, Lock,
  Headphones, Award, Zap
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  Plane, Users, UserCheck, Briefcase, HardHat, Moon, Settings
};

export default function HomePage() {
  const { state, t } = useApp();
  const lang = state.lang;
  const [trackCode, setTrackCode] = useState('');
  const [trackResult, setTrackResult] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleTrack = () => {
    if (trackCode.trim().length >= 5) {
      setTrackResult(t('طلبك قيد المعالجة حالياً. سيتم تحديثك قريباً.', 'Your application is currently being processed. You will be updated soon.'));
    } else {
      setTrackResult(t('يرجى إدخال رقم مرجعي صحيح', 'Please enter a valid reference number'));
    }
  };

  const faqs = [
    { q: t('ما هي مدة معالجة التأشيرة السياحية؟', 'What is the tourist visa processing time?'), a: t('عادةً 3-5 أيام عمل بعد استكمال المستندات.', 'Typically 3-5 business days after document completion.') },
    { q: t('هل أنتم جهة حكومية؟', 'Are you a government entity?'), a: t('لا، نحن منصة خدمات مستقلة نساعد في التنسيق والإعداد. القرار النهائي للجهات الرسمية.', 'No, we are an independent service platform. Final decisions rest with official authorities.') },
    { q: t('هل يمكنني التقديم لعائلتي؟', 'Can I apply for my family?'), a: t('نعم، يمكنك إضافة عدة أفراد في طلب واحد مع مستندات منفصلة لكل شخص.', 'Yes, you can add multiple members in one application with separate documents per person.') },
    { q: t('ما هي سياسة الاسترداد؟', 'What is the refund policy?'), a: t('الرسوم الحكومية غير قابلة للاسترداد بعد التقديم. رسوم الخدمة قد تُسترد حسب حالة الطلب.', 'Government fees are non-refundable after submission. Service fees may be refunded based on application status.') },
  ];

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold-500 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full px-4 py-1.5 mb-6">
                <Shield size={14} className="text-emerald-400" />
                <span className="text-sm text-emerald-300">{t('منصة خدمات موثوقة ومستقلة', 'Trusted Independent Service Platform')}</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-6">
                {t('خدمات التأشيرة والسفر', 'Saudi Visa & Travel')}
                <br />
                <span className="text-emerald-400">{t('إلى المملكة العربية السعودية', 'Services to Saudi Arabia')}</span>
              </h1>
              <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                {t(
                  'نساعدك في تنظيم وإعداد طلبات التأشيرة والسفر بكل سهولة وشفافية. من التأشيرة السياحية إلى العمرة، نتولى التفاصيل وأنت تركز على رحلتك.',
                  'We help you organize and prepare visa and travel applications with ease and transparency. From tourist visas to Umrah, we handle the details while you focus on your journey.'
                )}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/services">
                  <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                    {t('استعرض الخدمات', 'Browse Services')}
                    {lang === 'ar' ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
                  </Button>
                </Link>
                <Link to="/track">
                  <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                    {t('تتبع طلبك', 'Track Application')}
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-6 mt-8 text-sm text-slate-400">
                <div className="flex items-center gap-1"><CheckCircle2 size={14} className="text-emerald-400" />{t('شفافية كاملة', 'Full Transparency')}</div>
                <div className="flex items-center gap-1"><Lock size={14} className="text-emerald-400" />{t('بيانات آمنة', 'Secure Data')}</div>
                <div className="flex items-center gap-1"><Clock size={14} className="text-emerald-400" />{t('متابعة مستمرة', 'Continuous Tracking')}</div>
              </div>
            </div>
            {/* Quick Track Card */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4">{t('تتبع سريع', 'Quick Track')}</h3>
              <p className="text-sm text-slate-300 mb-4">{t('أدخل رقم المرجع الخاص بطلبك لمتابعة حالته', 'Enter your reference number to check application status')}</p>
              <div className="space-y-3">
                <Input
                  placeholder={t('رقم المرجع (مثال: VSA-2024-001)', 'Reference code (e.g., VSA-2024-001)')}
                  value={trackCode}
                  onChange={(e) => setTrackCode(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                />
                <Button onClick={handleTrack} className="w-full bg-emerald-600 hover:bg-emerald-700">
                  <Search size={16} />
                  {t('بحث', 'Search')}
                </Button>
                {trackResult && (
                  <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-lg p-3 text-sm text-emerald-200">
                    {trackResult}
                  </div>
                )}
              </div>
              <div className="mt-4 pt-4 border-t border-white/10 text-xs text-slate-400">
                {t('ملاحظة: هذه الخدمة للعرض التوضيحي فقط', 'Note: This is for demo purposes only')}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3">
            {t('خدماتنا', 'Our Services')}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            {t('مجموعة شاملة من خدمات التأشيرات والسفر لمساعدتك في كل خطوة', 'A comprehensive range of visa and travel services to assist you every step of the way')}
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((service) => {
            const Icon = iconMap[service.icon] || Plane;
            return (
              <Link key={service.id} to={`/services/${service.id}`}>
                <Card className="p-6 hover:shadow-lg hover:border-emerald-200 dark:hover:border-emerald-800 transition-all cursor-pointer group h-full">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon size={22} className="text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    {service.name[lang]}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                    {service.shortDesc[lang]}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {service.processingTime[lang]}
                    </span>
                    <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      {service.pricing.serviceFee + service.pricing.governmentFee} {service.pricing.currency}
                      <span className="text-xs font-normal text-slate-400">+</span>
                    </span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Future Services */}
        <div className="mt-8 grid sm:grid-cols-2 gap-6">
          <Card className="p-6 border-dashed border-2 border-slate-300 dark:border-navy-700 bg-slate-50 dark:bg-navy-900/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-navy-700 flex items-center justify-center">
                <Globe size={20} className="text-slate-500" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-700 dark:text-slate-300">{t('حجز الفنادق', 'Hotel Booking')}</h4>
                <span className="text-xs text-amber-600 dark:text-amber-400">{t('قريباً', 'Coming Soon')}</span>
              </div>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('خدمة حجز الفنادق القريبة من الحرمين والمدن الرئيسية', 'Hotel booking service near holy sites and major cities')}</p>
            <Link to="/contact" className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline mt-2 inline-block">
              {t('سجّل اهتمامك', 'Register your interest')} →
            </Link>
          </Card>
          <Card className="p-6 border-dashed border-2 border-slate-300 dark:border-navy-700 bg-slate-50 dark:bg-navy-900/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-navy-700 flex items-center justify-center">
                <Plane size={20} className="text-slate-500" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-700 dark:text-slate-300">{t('حجز الطيران', 'Flight Booking')}</h4>
                <span className="text-xs text-amber-600 dark:text-amber-400">{t('قريباً', 'Coming Soon')}</span>
              </div>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t('خدمة حجز تذاكر الطيران بأسعار تنافسية', 'Flight ticket booking service at competitive prices')}</p>
            <Link to="/contact" className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline mt-2 inline-block">
              {t('سجّل اهتمامك', 'Register your interest')} →
            </Link>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-slate-100 dark:bg-navy-900/50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3">
              {t('كيف يعمل؟', 'How It Works')}
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              {t('خطوات بسيطة للحصول على تأشيرتك', 'Simple steps to get your visa')}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: FileCheck, title: t('اختر الخدمة', 'Choose Service'), desc: t('استعرض خدماتنا واختر المناسبة لك', 'Browse our services and choose the right one') },
              { icon: Users, title: t('أدخل البيانات', 'Enter Details'), desc: t('أكمل بياناتك وارفع المستندات المطلوبة', 'Complete your details and upload required documents') },
              { icon: Shield, title: t('المراجعة والتحقق', 'Review & Verify'), desc: t('فريقنا يراجع طلبك ويتحقق من المستندات', 'Our team reviews your application and verifies documents') },
              { icon: Award, title: t('الإصدار والمتابعة', 'Issuance & Follow-up'), desc: t('متابعة حتى الحصول على النتيجة', 'Follow-up until you receive the result') },
            ].map((step, idx) => (
              <div key={idx} className="relative">
                <Card className="p-6 text-center h-full">
                  <div className="absolute -top-3 start-4 w-7 h-7 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </div>
                  <div className="w-14 h-14 mx-auto rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                    <step.icon size={24} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-2">{step.title}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{step.desc}</p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-6">
              {t('لماذا تختارنا؟', 'Why Choose Us?')}
            </h2>
            <div className="space-y-4">
              {[
                { icon: Shield, title: t('شفافية كاملة', 'Full Transparency'), desc: t('نفصل رسوم الخدمة عن الرسوم الحكومية بوضوح', 'We clearly separate service fees from government fees') },
                { icon: Lock, title: t('أمان البيانات', 'Data Security'), desc: t('مستنداتك محمية ومشفرة ولا نشاركها إلا عند الضرورة', 'Your documents are protected and encrypted, shared only when necessary') },
                { icon: Headphones, title: t('دعم متواصل', 'Continuous Support'), desc: t('فريق دعم متاح عبر الواتساب والبريد الإلكتروني', 'Support team available via WhatsApp and email') },
                { icon: Zap, title: t('سرعة المعالجة', 'Fast Processing'), desc: t('نسعى لإنجاز معاملاتك بأسرع وقت ممكن', 'We strive to process your transactions as quickly as possible') },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-10 h-10 shrink-0 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                    <item.icon size={18} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">{item.title}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Card className="p-8 bg-gradient-to-br from-emerald-50 to-slate-50 dark:from-emerald-900/20 dark:to-navy-900">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mb-4">
                <Shield size={28} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                {t('التزامنا بالخصوصية', 'Our Privacy Commitment')}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                {t(
                  'نحن منصة خدمات مستقلة. لا نمثل أي جهة حكومية رسمية. دورنا هو مساعدتك في إعداد وتنسيق وتقديم الطلبات. القرار النهائي بشأن التأشيرات يعود حصرياً للجهات الرسمية المختصة في المملكة العربية السعودية.',
                  'We are an independent service platform. We do not represent any official government entity. Our role is to assist you in preparing, coordinating, and submitting applications. The final decision regarding visas rests exclusively with the competent official authorities in Saudi Arabia.'
                )}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <span className="px-3 py-1 bg-white dark:bg-navy-800 rounded-full text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-navy-700">
                  {t('تشفير SSL', 'SSL Encryption')}
                </span>
                <span className="px-3 py-1 bg-white dark:bg-navy-800 rounded-full text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-navy-700">
                  {t('حماية البيانات', 'Data Protection')}
                </span>
                <span className="px-3 py-1 bg-white dark:bg-navy-800 rounded-full text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-navy-700">
                  {t('وصول محدود', 'Limited Access')}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* B2B Section */}
      <section className="bg-navy-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-gold-500/20 border border-gold-500/30 rounded-full px-4 py-1.5 mb-4">
                <Building2 size={14} className="text-gold-400" />
                <span className="text-sm text-gold-300">{t('للوكلاء والوكالات', 'For Agents & Agencies')}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                {t('انضم كوكالة معتمدة', 'Join as an Approved Agency')}
              </h2>
              <p className="text-slate-300 mb-6 leading-relaxed">
                {t(
                  'احصل على أسعار الجملة، إدارة متعددة الطلبات، لوحة تحكم مخصصة، ودعم مخصص لوكالتك. مستويات متعددة حسب حجم أعمالك.',
                  'Get wholesale pricing, multi-application management, custom dashboard, and dedicated support for your agency. Multiple tiers based on your business volume.'
                )}
              </p>
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: t('خصم حتى', 'Up to'), value: '15%' },
                  { label: t('طلبات شهرية', 'Monthly apps'), value: '500+' },
                  { label: t('مستويات', 'Tiers'), value: '4' },
                ].map((stat, idx) => (
                  <div key={idx} className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
                    <div className="text-xl font-bold text-emerald-400">{stat.value}</div>
                    <div className="text-xs text-slate-400">{stat.label}</div>
                  </div>
                ))}
              </div>
              <Link to="/agency-info">
                <Button variant="outline" className="border-gold-500 text-gold-400 hover:bg-gold-500/10">
                  {t('تسجيل وكالة', 'Register Agency')}
                  {lang === 'ar' ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                </Button>
              </Link>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h4 className="font-bold mb-4">{t('مستويات الوكالات', 'Agency Tiers')}</h4>
              <div className="space-y-3">
                {[
                  { tier: t('برونزي', 'Bronze'), discount: '5%', min: '10', color: 'bg-amber-700' },
                  { tier: t('فضي', 'Silver'), discount: '10%', min: '25', color: 'bg-slate-400' },
                  { tier: t('ذهبي', 'Gold'), discount: '15%', min: '50', color: 'bg-gold-500' },
                  { tier: t('بلاتيني', 'Platinum'), discount: t('مخصص', 'Custom'), min: '100+', color: 'bg-purple-500' },
                ].map((t_item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${t_item.color}`} />
                      <span className="text-sm font-medium">{t_item.tier}</span>
                    </div>
                    <div className="text-end">
                      <span className="text-emerald-400 font-bold text-sm">{t_item.discount}</span>
                      <span className="text-xs text-slate-400 ms-2">({t_item.min}+ {t('طلب', 'apps')})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-3">
            {t('الأسئلة الشائعة', 'Frequently Asked Questions')}
          </h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <Card key={idx} className="overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-4 text-start"
              >
                <span className="font-medium text-slate-900 dark:text-white">{faq.q}</span>
                {openFaq === idx ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-navy-800 pt-3">
                  {faq.a}
                </div>
              )}
            </Card>
          ))}
        </div>
        <div className="text-center mt-6">
          <Link to="/faq" className="text-emerald-600 dark:text-emerald-400 text-sm font-medium hover:underline">
            {t('عرض جميع الأسئلة', 'View all FAQs')} →
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            {t('جاهز لبدء طلبك؟', 'Ready to Start Your Application?')}
          </h2>
          <p className="text-emerald-100 mb-6 max-w-2xl mx-auto">
            {t('سجّل الآن واحصل على مساعدة متخصصة في إجراءات تأشيرتك', 'Register now and get specialized assistance with your visa procedures')}
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/register">
              <Button size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50">
                {t('إنشاء حساب مجاني', 'Create Free Account')}
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="ghost" size="lg" className="text-white hover:bg-white/10">
                {t('تواصل معنا', 'Contact Us')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
