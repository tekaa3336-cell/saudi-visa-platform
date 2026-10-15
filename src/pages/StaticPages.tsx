import React, { useState } from 'react';
import { useApp } from '../store';
import { MOCK_FAQS } from '../data';
import { Card, Button, Input, Textarea } from '../components/Layout';
import { ChevronDown, ChevronUp, Phone, Mail, MessageCircle, Send, CheckCircle2, Building2 } from 'lucide-react';

export function FAQPage() {
  const { state, t } = useApp();
  const lang = state.lang;
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 animate-fade-in">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-6">{t('الأسئلة الشائعة', 'FAQ')}</h1>
      <div className="space-y-2">
        {MOCK_FAQS.map(faq => (
          <Card key={faq.id} className="overflow-hidden">
            <button onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)} className="w-full flex items-center justify-between p-4 text-start">
              <span className="font-medium text-sm text-slate-900 dark:text-white">{faq.question[lang]}</span>
              {openFaq === faq.id ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
            </button>
            {openFaq === faq.id && <div className="px-4 pb-4 text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">{faq.answer[lang]}</div>}
          </Card>
        ))}
      </div>
    </div>
  );
}

export function ContactPage() {
  const { t } = useApp();
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); setSent(true); };

  if (sent) return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <CheckCircle2 size={48} className="mx-auto text-emerald-500 mb-4" />
      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('تم الإرسال!', 'Sent!')}</h2>
      <p className="text-sm text-slate-500">{t('سنرد عليك قريباً', 'We will respond soon')}</p>
      <Button variant="ghost" className="mt-4" onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }}>{t('إرسال آخر', 'Send Another')}</Button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 animate-fade-in">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white text-center mb-6">{t('تواصل معنا', 'Contact Us')}</h1>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="space-y-3">
          <Card className="p-4"><div className="flex items-center gap-2"><Phone size={14} className="text-emerald-600" /><div><p className="text-xs font-medium text-slate-900 dark:text-white">{t('الهاتف', 'Phone')}</p><p className="text-[10px] text-slate-500" dir="ltr">+971 4 XXX XXXX</p></div></div></Card>
          <Card className="p-4"><div className="flex items-center gap-2"><Mail size={14} className="text-emerald-600" /><div><p className="text-xs font-medium text-slate-900 dark:text-white">{t('البريد', 'Email')}</p><p className="text-[10px] text-slate-500">info@elitevisa.demo</p></div></div></Card>
          <Card className="p-4"><div className="flex items-center gap-2"><MessageCircle size={14} className="text-green-600" /><div><p className="text-xs font-medium text-slate-900 dark:text-white">{t('واتساب', 'WhatsApp')}</p><p className="text-[10px] text-slate-500" dir="ltr">+971 50 XXX XXXX</p></div></div></Card>
        </div>
        <Card className="p-5 lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <Input label={t('الاسم', 'Name')} value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              <Input label={t('البريد', 'Email')} type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
            </div>
            <Input label={t('الموضوع', 'Subject')} value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} required />
            <Textarea label={t('الرسالة', 'Message')} value={form.message} onChange={e => setForm({...form, message: e.target.value})} rows={4} required />
            <Button type="submit"><Send size={14} />{t('إرسال', 'Send')}</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

export function PrivacyPage() {
  const { t } = useApp();
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 animate-fade-in">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{t('سياسة الخصوصية', 'Privacy Policy')}</h1>
      <Card className="p-6">
        <div className="space-y-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <p>{t('آخر تحديث: يناير 2024', 'Last updated: January 2024')}</p>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('جمع المعلومات', 'Information Collection')}</h3>
          <p>{t('نجمع المعلومات التي تقدمها عند إنشاء حساب أو تقديم طلب، بما في ذلك الاسم، البريد، بيانات جواز السفر، والمستندات.', 'We collect information you provide when creating an account or submitting an application.')}</p>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('حماية البيانات', 'Data Protection')}</h3>
          <p>{t('نتخذ إجراءات أمنية لحماية بياناتك. يتم تخزين المستندات في بيئة مشفرة.', 'We take security measures to protect your data. Documents are stored in an encrypted environment.')}</p>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('حقوقك', 'Your Rights')}</h3>
          <p>{t('لديك الحق في الوصول إلى بياناتك أو طلب حذفها.', 'You have the right to access or request deletion of your data.')}</p>
        </div>
      </Card>
    </div>
  );
}

export function TermsPage() {
  const { t } = useApp();
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 animate-fade-in">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{t('الشروط والأحكام', 'Terms & Conditions')}</h1>
      <Card className="p-6">
        <div className="space-y-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('طبيعة الخدمة', 'Nature of Service')}</h3>
          <p>{t('منصة خدمات مستقلة تساعد في إعداد طلبات التأشيرات. لسنا جهة حكومية. القرار النهائي للجهات الرسمية.', 'Independent service platform. Not a government entity. Final decisions rest with official authorities.')}</p>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('الرسوم', 'Fees')}</h3>
          <p>{t('الرسوم الحكومية غير قابلة للاسترداد بعد التقديم. رسوم الخدمة قد تُسترد حسب حالة الطلب.', 'Government fees non-refundable after submission. Service fees may be refunded based on status.')}</p>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('ضمانات', 'Guarantees')}</h3>
          <p>{t('لا نضمن الموافقة على أي طلب. القرار النهائي بيد الجهات الرسمية.', 'We do not guarantee approval. Final decision is with official authorities.')}</p>
        </div>
      </Card>
    </div>
  );
}

export function AgencyInfoPage() {
  const { t } = useApp();
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 animate-fade-in">
      <div className="text-center mb-8">
        <div className="w-14 h-14 mx-auto bg-gradient-to-br from-amber-500 to-amber-700 rounded-xl flex items-center justify-center mb-3"><Building2 size={24} className="text-white" /></div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{t('انضم كوكالة', 'Join as Agency')}</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">{t('احصل على أسعار الجملة وأدوات متقدمة', 'Get wholesale pricing and advanced tools')}</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {[
          { title: t('أسعار الجملة', 'Wholesale'), desc: t('خصم حتى 15%', 'Up to 15% off') },
          { title: t('إدارة متعددة', 'Multi-manage'), desc: t('طلبات وفريق', 'Apps & team') },
          { title: t('لوحة مخصصة', 'Dashboard'), desc: t('تقارير مفصلة', 'Detailed reports') },
        ].map((item, idx) => (
          <Card key={idx} className="p-4 text-center">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{item.title}</h3>
            <p className="text-xs text-slate-500">{item.desc}</p>
          </Card>
        ))}
      </div>

      <Card className="p-6 mb-6">
        <h2 className="text-base font-bold text-slate-900 dark:text-white text-center mb-4">{t('المستويات', 'Tiers')}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { name: t('برونزي', 'Bronze'), discount: '5%', min: '10', color: 'border-amber-700' },
            { name: t('فضي', 'Silver'), discount: '10%', min: '25', color: 'border-slate-400' },
            { name: t('ذهبي', 'Gold'), discount: '15%', min: '50', color: 'border-amber-500' },
            { name: t('بلاتيني', 'Platinum'), discount: t('مخصص', 'Custom'), min: '100+', color: 'border-purple-500' },
          ].map((tier, idx) => (
            <div key={idx} className={`p-3 rounded-lg border-2 ${tier.color} text-center`}>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">{tier.name}</h4>
              <p className="text-lg font-bold text-emerald-600 my-1">{tier.discount}</p>
              <p className="text-[10px] text-slate-500">{tier.min}+</p>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6 text-center bg-slate-900 text-white">
        <h3 className="text-base font-bold mb-2">{t('مستعد للانضمام؟', 'Ready to Join?')}</h3>
        <p className="text-xs text-slate-300 mb-4">{t('سجّل وكالتك وسيتم مراجعتها خلال 48 ساعة', 'Register and we will review within 48 hours')}</p>
        <a href="#/register"><Button className="bg-amber-600 hover:bg-amber-700">{t('تسجيل وكالة', 'Register Agency')}</Button></a>
      </Card>
    </div>
  );
}

export function ComingSoonPage({ type }: { type: 'hotels' | 'flights' }) {
  const { t } = useApp();
  const [email, setEmail] = useState('');
  const [registered, setRegistered] = useState(false);

  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center animate-fade-in">
      <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4">
        <Building2 size={28} className="text-white" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
        {type === 'hotels' ? t('حجز الفنادق قريباً', 'Hotels Coming Soon') : t('حجز الطيران قريباً', 'Flights Coming Soon')}
      </h1>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
        {type === 'hotels' ? t('نعمل على إضافة خدمة حجز الفنادق', 'Working on hotel booking service') : t('نعمل على إضافة خدمة حجز الطيران', 'Working on flight booking service')}
      </p>
      {registered ? (
        <div className="flex items-center justify-center gap-2 text-emerald-600"><CheckCircle2 size={16} /><span className="text-sm">{t('تم التسجيل!', 'Registered!')}</span></div>
      ) : (
        <div className="flex gap-2 max-w-sm mx-auto">
          <Input type="email" placeholder={t('بريدك', 'Your email')} value={email} onChange={e => setEmail(e.target.value)} />
          <Button onClick={() => email && setRegistered(true)}>{t('سجّل', 'Register')}</Button>
        </div>
      )}
    </div>
  );
}
