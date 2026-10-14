import React, { useState } from 'react';
import { useApp } from '../store';
import { MOCK_FAQS } from '../data';
import { Card, Button, Input, Textarea } from '../components/Layout';
import { ChevronDown, ChevronUp, Phone, Mail, MapPin, MessageCircle, Send, CheckCircle2, Building2, Shield, Users } from 'lucide-react';

export function FAQPage() {
  const { state, t } = useApp();
  const lang = state.lang;
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState('all');

  const categories = [
    { key: 'all', label: t('الكل', 'All') },
    { key: 'general', label: t('عام', 'General') },
    { key: 'visas', label: t('التأشيرات', 'Visas') },
    { key: 'pricing', label: t('الأسعار', 'Pricing') },
  ];

  const filteredFaqs = filterCategory === 'all' ? MOCK_FAQS : MOCK_FAQS.filter(f => f.category === filterCategory);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">{t('الأسئلة الشائعة', 'Frequently Asked Questions')}</h1>
        <p className="text-slate-600 dark:text-slate-400">{t('إجابات على أكثر الأسئلة شيوعاً حول خدماتنا', 'Answers to the most common questions about our services')}</p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map(cat => (
          <button
            key={cat.key}
            onClick={() => setFilterCategory(cat.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              filterCategory === cat.key ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-navy-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* FAQ List */}
      <div className="space-y-3">
        {filteredFaqs.map(faq => (
          <Card key={faq.id} className="overflow-hidden">
            <button
              onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
              className="w-full flex items-center justify-between p-5 text-start"
            >
              <span className="font-medium text-slate-900 dark:text-white">{faq.question[lang]}</span>
              {openFaq === faq.id ? <ChevronUp size={18} className="text-slate-400 shrink-0" /> : <ChevronDown size={18} className="text-slate-400 shrink-0" />}
            </button>
            {openFaq === faq.id && (
              <div className="px-5 pb-5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-navy-800 pt-4">
                {faq.answer[lang]}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Still have questions */}
      <Card className="mt-10 p-8 text-center bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{t('لم تجد إجابتك؟', "Didn't find your answer?")}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{t('تواصل معنا وسنساعدك', 'Contact us and we will help you')}</p>
        <a href="/contact">
          <Button>{t('تواصل معنا', 'Contact Us')}</Button>
        </a>
      </Card>
    </div>
  );
}

export function ContactPage() {
  const { t } = useApp();
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">{t('تواصل معنا', 'Contact Us')}</h1>
        <p className="text-slate-600 dark:text-slate-400">{t('نحن هنا لمساعدتك. اختر طريقة التواصل المناسبة لك', 'We are here to help. Choose your preferred contact method')}</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Contact Info */}
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                <Phone size={18} className="text-emerald-600" />
              </div>
              <div>
                <h4 className="font-medium text-slate-900 dark:text-white text-sm">{t('الهاتف', 'Phone')}</h4>
                <p className="text-sm text-slate-500" dir="ltr">+971 4 XXX XXXX</p>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                <Mail size={18} className="text-emerald-600" />
              </div>
              <div>
                <h4 className="font-medium text-slate-900 dark:text-white text-sm">{t('البريد', 'Email')}</h4>
                <p className="text-sm text-slate-500">info@elitevisa.demo</p>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
                <MessageCircle size={18} className="text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-slate-900 dark:text-white text-sm">{t('واتساب', 'WhatsApp')}</h4>
                <p className="text-sm text-slate-500" dir="ltr">+971 50 XXX XXXX</p>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                <MapPin size={18} className="text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-slate-900 dark:text-white text-sm">{t('العنوان', 'Address')}</h4>
                <p className="text-sm text-slate-500">{t('دبي، الإمارات العربية المتحدة', 'Dubai, UAE')}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            {sent ? (
              <div className="text-center py-8">
                <CheckCircle2 size={48} className="mx-auto text-emerald-500 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{t('تم الإرسال بنجاح!', 'Sent Successfully!')}</h3>
                <p className="text-sm text-slate-500">{t('سنرد عليك في أقرب وقت ممكن', 'We will respond as soon as possible')}</p>
                <Button variant="ghost" className="mt-4" onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }); }}>
                  {t('إرسال رسالة أخرى', 'Send Another Message')}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label={t('الاسم', 'Name')} value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                  <Input label={t('البريد الإلكتروني', 'Email')} type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label={t('الهاتف', 'Phone')} type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                  <Input label={t('الموضوع', 'Subject')} value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} required />
                </div>
                <Textarea label={t('الرسالة', 'Message')} value={form.message} onChange={e => setForm({...form, message: e.target.value})} rows={5} required />
                <Button type="submit" size="lg">
                  <Send size={16} />
                  {t('إرسال', 'Send')}
                </Button>
              </form>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export function PrivacyPage() {
  const { t } = useApp();
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">{t('سياسة الخصوصية', 'Privacy Policy')}</h1>
      <Card className="p-8 prose dark:prose-invert max-w-none">
        <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          <p>{t('آخر تحديث: يناير 2024', 'Last updated: January 2024')}</p>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('1. جمع المعلومات', '1. Information Collection')}</h3>
          <p>{t('نجمع المعلومات التي تقدمها مباشرة عند إنشاء حساب أو تقديم طلب، بما في ذلك الاسم، البريد الإلكتروني، رقم الهاتف، بيانات جواز السفر، والمستندات المطلوبة.', 'We collect information you provide directly when creating an account or submitting an application, including name, email, phone number, passport details, and required documents.')}</p>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('2. استخدام المعلومات', '2. Use of Information')}</h3>
          <p>{t('نستخدم معلوماتك فقط لمعالجة طلباتك، التواصل معك بشأن حالة طلبك، وتحسين خدماتنا. لا نبيع أو نشارك بياناتك مع أطراف ثالثة إلا عند الضرورة لمعالجة طلبك.', 'We use your information only to process your applications, communicate about your application status, and improve our services. We do not sell or share your data with third parties except when necessary to process your application.')}</p>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('3. حماية البيانات', '3. Data Protection')}</h3>
          <p>{t('نتخذ إجراءات أمنية تقنية وتنظيمية لحماية بياناتك الشخصية ومستنداتك. يتم تخزين المستندات في بيئة مشفرة ولا يمكن الوصول إليها إلا من قبل المصرح لهم.', 'We take technical and organizational security measures to protect your personal data and documents. Documents are stored in an encrypted environment and can only be accessed by authorized personnel.')}</p>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('4. حقوقك', '4. Your Rights')}</h3>
          <p>{t('لديك الحق في الوصول إلى بياناتك، تصحيحها، أو طلب حذفها. يمكنك التواصل معنا في أي وقت لممارسة حقوقك.', 'You have the right to access, correct, or request deletion of your data. You can contact us at any time to exercise your rights.')}</p>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('5. الاحتفاظ بالبيانات', '5. Data Retention')}</h3>
          <p>{t('نحتفظ ببياناتك طالما كان حسابك نشطاً أو حسب ما هو مطلوب قانونياً. بعد إغلاق الحساب، يتم حذف البيانات الشخصية خلال 30 يوماً.', 'We retain your data as long as your account is active or as required by law. After account closure, personal data is deleted within 30 days.')}</p>
        </div>
      </Card>
    </div>
  );
}

export function TermsPage() {
  const { t } = useApp();
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">{t('الشروط والأحكام', 'Terms & Conditions')}</h1>
      <Card className="p-8">
        <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          <p>{t('آخر تحديث: يناير 2024', 'Last updated: January 2024')}</p>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('1. طبيعة الخدمة', '1. Nature of Service')}</h3>
          <p>{t('منصة سفريات النخبة هي منصة خدمات مستقلة تساعد في إعداد وتنسيق وتقديم طلبات التأشيرات. نحن لسنا جهة حكومية رسمية ولا نمثل أي وزارة أو هيئة حكومية. القرار النهائي بشأن التأشيرات يعود حصرياً للجهات الرسمية المختصة.', 'Elite Visa platform is an independent service platform that assists with preparing, coordinating, and submitting visa applications. We are not an official government entity and do not represent any ministry or government body. The final decision regarding visas rests exclusively with the competent official authorities.')}</p>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('2. الرسوم والاسترداد', '2. Fees and Refunds')}</h3>
          <p>{t('الرسوم الحكومية غير قابلة للاسترداد بعد التقديم للجهات الرسمية. رسوم الخدمة قد تكون قابلة للاسترداد الجزئي حسب حالة الطلب وسياسة الاسترداد المعتمدة.', 'Government fees are non-refundable after submission to official authorities. Service fees may be partially refundable depending on application status and the approved refund policy.')}</p>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('3. مسؤولية المستخدم', '3. User Responsibility')}</h3>
          <p>{t('يتحمل المستخدم مسؤولية صحة المعلومات والمستندات المقدمة. أي معلومات خاطبة أو مستندات مزورة قد تؤدي إلى رفض الطلب دون استرداد.', 'The user is responsible for the accuracy of provided information and documents. Any false information or forged documents may result in application rejection without refund.')}</p>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('4. ضمانات', '4. Guarantees')}</h3>
          <p>{t('لا نضمن الموافقة على أي طلب تأشيرة. نحن نبذل قصارى جهدنا في إعداد وتقديم الطلبات بشكل صحيح، لكن القرار النهائي بيد الجهات الرسمية.', 'We do not guarantee approval of any visa application. We make our best effort in preparing and submitting applications correctly, but the final decision is with the official authorities.')}</p>
        </div>
      </Card>
    </div>
  );
}

export function AgencyInfoPage() {
  const { t, state } = useApp();
  const lang = state.lang;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 animate-fade-in">
      <div className="text-center mb-10">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-gold-500 to-gold-700 rounded-2xl flex items-center justify-center mb-4">
          <Building2 size={28} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">{t('انضم كوكالة معتمدة', 'Join as an Approved Agency')}</h1>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          {t('احصل على أسعار الجملة وأدوات إدارة متقدمة لوكالتك', 'Get wholesale pricing and advanced management tools for your agency')}
        </p>
      </div>

      {/* Benefits */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {[
          { icon: Shield, title: t('أسعار الجملة', 'Wholesale Pricing'), desc: t('خصومات تصل إلى 15% حسب المستوى', 'Discounts up to 15% based on tier') },
          { icon: Users, title: t('إدارة متعددة', 'Multi Management'), desc: t('إدارة طلبات متعددة وفريق عمل', 'Manage multiple applications and team') },
          { icon: Building2, title: t('لوحة مخصصة', 'Custom Dashboard'), desc: t('تقارير وإحصائيات مفصلة', 'Detailed reports and statistics') },
        ].map((item, idx) => (
          <Card key={idx} className="p-6 text-center">
            <div className="w-12 h-12 mx-auto rounded-xl bg-gold-50 dark:bg-gold-900/20 flex items-center justify-center mb-3">
              <item.icon size={22} className="text-gold-600 dark:text-gold-400" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white mb-1">{item.title}</h3>
            <p className="text-sm text-slate-500">{item.desc}</p>
          </Card>
        ))}
      </div>

      {/* Tiers */}
      <Card className="p-8 mb-8">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 text-center">{t('مستويات الوكالات', 'Agency Tiers')}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: t('برونزي', 'Bronze'), discount: '5%', min: '10', color: 'border-amber-700', bg: 'bg-amber-50 dark:bg-amber-900/10' },
            { name: t('فضي', 'Silver'), discount: '10%', min: '25', color: 'border-slate-400', bg: 'bg-slate-50 dark:bg-slate-900/30' },
            { name: t('ذهبي', 'Gold'), discount: '15%', min: '50', color: 'border-gold-500', bg: 'bg-gold-50 dark:bg-gold-900/10' },
            { name: t('بلاتيني', 'Platinum'), discount: t('مخصص', 'Custom'), min: '100+', color: 'border-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/10' },
          ].map((tier, idx) => (
            <div key={idx} className={`p-4 rounded-xl border-2 ${tier.color} ${tier.bg} text-center`}>
              <h4 className="font-bold text-slate-900 dark:text-white">{tier.name}</h4>
              <p className="text-2xl font-bold text-emerald-600 my-2">{tier.discount}</p>
              <p className="text-xs text-slate-500">{tier.min}+ {t('طلب شهري', 'monthly apps')}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Registration CTA */}
      <Card className="p-8 text-center bg-gradient-to-br from-navy-900 to-navy-800 text-white">
        <h3 className="text-xl font-bold mb-3">{t('مستعد للانضمام؟', 'Ready to Join?')}</h3>
        <p className="text-slate-300 mb-6 text-sm max-w-lg mx-auto">
          {t('سجّل وكالتك الآن وسيتم مراجعة طلبك من قبل فريقنا خلال 48 ساعة', 'Register your agency now and our team will review your application within 48 hours')}
        </p>
        <a href="/register">
          <Button size="lg" className="bg-gold-600 hover:bg-gold-700">{t('تسجيل وكالة', 'Register Agency')}</Button>
        </a>
      </Card>
    </div>
  );
}

export function ComingSoonPage({ type }: { type: 'hotels' | 'flights' }) {
  const { t } = useApp();
  const [email, setEmail] = useState('');
  const [registered, setRegistered] = useState(false);

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center animate-fade-in">
      <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6">
        {type === 'hotels' ? <Building2 size={32} className="text-white" /> : <MessageCircle size={32} className="text-white" />}
      </div>
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
        {type === 'hotels' ? t('حجز الفنادق قريباً', 'Hotel Booking Coming Soon') : t('حجز الطيران قريباً', 'Flight Booking Coming Soon')}
      </h1>
      <p className="text-slate-600 dark:text-slate-400 mb-8">
        {type === 'hotels' 
          ? t('نعمل على إضافة خدمة حجز الفنادق بالقرب من الحرمين والمدن السعودية الرئيسية. سجّل بريدك ليصلك إشعار عند الإطلاق.', 'We are working on adding hotel booking services near the Holy Mosques and major Saudi cities. Register your email to be notified at launch.')
          : t('نعمل على إضافة خدمة حجز تذاكر الطيران بأسعار تنافسية. سجّل بريدك ليصلك إشعار عند الإطلاق.', 'We are working on adding flight ticket booking at competitive prices. Register your email to be notified at launch.')
        }
      </p>
      {registered ? (
        <div className="flex items-center justify-center gap-2 text-emerald-600">
          <CheckCircle2 size={20} />
          <span>{t('تم التسجيل! سنبلغك قريباً', 'Registered! We will notify you soon')}</span>
        </div>
      ) : (
        <div className="flex gap-3 max-w-md mx-auto">
          <Input
            type="email"
            placeholder={t('بريدك الإلكتروني', 'Your email')}
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <Button onClick={() => email && setRegistered(true)}>{t('سجّل', 'Register')}</Button>
        </div>
      )}
    </div>
  );
}
