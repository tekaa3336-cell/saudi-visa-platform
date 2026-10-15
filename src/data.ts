import type { Service, Application, User, Agency, FAQ, Notification, ApplicationStatus } from './types';

export const SERVICES: Service[] = [
  {
    id: 'tourist_visa', name: { ar: 'تأشيرة سياحية', en: 'Tourist Visa' },
    shortDesc: { ar: 'مساعدة في التأشيرة السياحية', en: 'Tourist visa assistance' },
    description: { ar: 'نقدم مساعدة شاملة في إعداد وتقديم طلب التأشيرة السياحية.', en: 'Comprehensive assistance with tourist visa preparation and submission.' },
    icon: 'Plane',
    eligibility: { ar: 'لمواطني الدول المؤهلة. جواز سفر ساري 6 أشهر.', en: 'For eligible nationals. Passport valid 6+ months.' },
    requiredDocuments: [
      { ar: 'صورة جواز السفر', en: 'Passport copy' }, { ar: 'صورة شخصية', en: 'Personal photo' },
      { ar: 'إثبات الإقامة', en: 'Proof of residence' }, { ar: 'حجز فندقي', en: 'Hotel booking' }, { ar: 'تأمين سفر', en: 'Travel insurance' },
    ],
    processingTime: { ar: '3-5 أيام عمل', en: '3-5 business days' },
    pricing: { serviceFee: 250, governmentFee: 300, currency: 'AED' },
    wholesaleTiers: [
      { name: { ar: 'برونزي', en: 'Bronze' }, minApplications: 10, discountPercent: 5 },
      { name: { ar: 'فضي', en: 'Silver' }, minApplications: 25, discountPercent: 10 },
      { name: { ar: 'ذهبي', en: 'Gold' }, minApplications: 50, discountPercent: 15 },
    ],
    steps: [
      { ar: 'تقديم الطلب', en: 'Submit application' }, { ar: 'رفع المستندات', en: 'Upload documents' },
      { ar: 'المراجعة', en: 'Review' }, { ar: 'التقديم للجهات الرسمية', en: 'Submit to authorities' }, { ar: 'الاستلام', en: 'Receive' },
    ],
    color: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'family_visit', name: { ar: 'تأشيرة زيارة عائلية', en: 'Family Visit Visa' },
    shortDesc: { ar: 'تأشيرة زيارة الأقارب', en: 'Family visit visa' },
    description: { ar: 'نساعد في إجراءات تأشيرة الزيارة العائلية.', en: 'Assistance with family visit visa procedures.' },
    icon: 'Users',
    eligibility: { ar: 'للمقيمين الراغبين في زيارة أقاربهم.', en: 'For residents visiting relatives.' },
    requiredDocuments: [
      { ar: 'جواز سفر', en: 'Passport' }, { ar: 'صورة شخصية', en: 'Photo' },
      { ar: 'شهادة قرابة', en: 'Relationship proof' }, { ar: 'خطاب دعوة', en: 'Invitation letter' }, { ar: 'هوية المضيف', en: 'Host ID' },
    ],
    processingTime: { ar: '5-10 أيام عمل', en: '5-10 business days' },
    pricing: { serviceFee: 300, governmentFee: 200, currency: 'AED' },
    steps: [
      { ar: 'تقديم البيانات', en: 'Submit details' }, { ar: 'رفع إثبات القرابة', en: 'Upload proof' },
      { ar: 'المراجعة', en: 'Review' }, { ar: 'الإصدار', en: 'Issuance' },
    ],
    color: 'from-rose-500 to-pink-600',
  },
  {
    id: 'personal_visit', name: { ar: 'تأشيرة زيارة شخصية', en: 'Personal Visit Visa' },
    shortDesc: { ar: 'زيارة شخصية للأغراض العامة', en: 'Personal visit for general purposes' },
    description: { ar: 'مساعدة في تأشيرة الزيارة الشخصية.', en: 'Assistance with personal visit visa.' },
    icon: 'UserCheck',
    eligibility: { ar: 'لجميع الجنسيات المؤهلة مع دعوة.', en: 'All eligible nationalities with invitation.' },
    requiredDocuments: [
      { ar: 'جواز سفر', en: 'Passport' }, { ar: 'صورة شخصية', en: 'Photo' },
      { ar: 'خطاب دعوة', en: 'Invitation letter' }, { ar: 'إثبات الغرض', en: 'Purpose proof' },
    ],
    processingTime: { ar: '5-7 أيام عمل', en: '5-7 business days' },
    pricing: { serviceFee: 280, governmentFee: 200, currency: 'AED' },
    steps: [
      { ar: 'تقديم الطلب', en: 'Submit' }, { ar: 'المراجعة', en: 'Review' },
      { ar: 'التقديم', en: 'Submit to authorities' }, { ar: 'الإصدار', en: 'Issuance' },
    ],
    color: 'from-teal-500 to-cyan-600',
  },
  {
    id: 'business_visit', name: { ar: 'تأشيرة زيارة أعمال', en: 'Business Visit Visa' },
    shortDesc: { ar: 'لأغراض الأعمال والمؤتمرات', en: 'For business and conferences' },
    description: { ar: 'نساعد في تأشيرة زيارة الأعمال.', en: 'Assistance with business visit visa.' },
    icon: 'Briefcase',
    eligibility: { ar: 'لرجال الأعمال والمدعوين.', en: 'For business people and invitees.' },
    requiredDocuments: [
      { ar: 'جواز سفر', en: 'Passport' }, { ar: 'خطاب جهة العمل', en: 'Employer letter' },
      { ar: 'دعوة شركة سعودية', en: 'Saudi company invitation' }, { ar: 'صورة شخصية', en: 'Photo' },
    ],
    processingTime: { ar: '3-7 أيام عمل', en: '3-7 business days' },
    pricing: { serviceFee: 350, governmentFee: 250, currency: 'AED' },
    steps: [
      { ar: 'تقديم بيانات الشركة', en: 'Submit company details' }, { ar: 'رفع المستندات', en: 'Upload docs' },
      { ar: 'المراجعة', en: 'Review' }, { ar: 'الإصدار', en: 'Issuance' },
    ],
    color: 'from-amber-500 to-orange-600',
  },
  {
    id: 'work_guidance', name: { ar: 'إرشادات تأشيرة العمل', en: 'Work Visa Guidance' },
    shortDesc: { ar: 'إرشاد بشأن إجراءات العمل', en: 'Work visa guidance' },
    description: { ar: 'خدمة إرشادية حول تأشيرة العمل. الإصدار من الجهات الرسمية.', en: 'Guidance service for work visa. Issuance by official authorities.' },
    icon: 'HardHat',
    eligibility: { ar: 'لحاصلين على عرض عمل.', en: 'For those with job offers.' },
    requiredDocuments: [
      { ar: 'جواز سفر', en: 'Passport' }, { ar: 'عقد عمل', en: 'Employment contract' },
      { ar: 'شهادات', en: 'Certificates' }, { ar: 'شهادة طبية', en: 'Medical cert' }, { ar: 'صورة شخصية', en: 'Photo' },
    ],
    processingTime: { ar: '10-20 يوم عمل', en: '10-20 business days' },
    pricing: { serviceFee: 500, governmentFee: 0, currency: 'AED' },
    steps: [
      { ar: 'استشارة', en: 'Consultation' }, { ar: 'تجهيز', en: 'Preparation' },
      { ar: 'تنسيق', en: 'Coordination' }, { ar: 'متابعة', en: 'Follow-up' },
    ],
    color: 'from-slate-600 to-gray-800',
  },
  {
    id: 'umrah_assistance', name: { ar: 'خدمات العمرة والروضة', en: 'Umrah & Rawdah' },
    shortDesc: { ar: 'ترتيبات العمرة والروضة', en: 'Umrah and Rawdah arrangements' },
    description: { ar: 'مساعدة في ترتيبات العمرة وزيارة الروضة الشريفة.', en: 'Assistance with Umrah and Rawdah visit arrangements.' },
    icon: 'Moon',
    eligibility: { ar: 'لجميع المسلمين بتأشيرة سارية.', en: 'For all Muslims with valid visa.' },
    requiredDocuments: [
      { ar: 'جواز سفر أو هوية', en: 'Passport or ID' }, { ar: 'تأشيرة سارية', en: 'Valid visa' }, { ar: 'تسجيل توكلنا', en: 'Tawakkalna registration' },
    ],
    processingTime: { ar: '24-48 ساعة', en: '24-48 hours' },
    pricing: { serviceFee: 150, governmentFee: 0, currency: 'AED' },
    steps: [
      { ar: 'تسجيل البيانات', en: 'Register details' }, { ar: 'حجز التصاريح', en: 'Book permits' },
      { ar: 'تنسيق', en: 'Coordination' }, { ar: 'جدولة', en: 'Schedule' },
    ],
    color: 'from-emerald-500 to-green-700',
  },
  {
    id: 'visa_facilitation', name: { ar: 'تسهيل التأشيرات', en: 'Visa Facilitation' },
    shortDesc: { ar: 'تسهيل لحالات خاصة', en: 'Facilitation for special cases' },
    description: { ar: 'خدمات مخصصة للحالات الخاصة.', en: 'Customized services for special cases.' },
    icon: 'Settings',
    eligibility: { ar: 'لجميع الحالات الخاصة.', en: 'For all special cases.' },
    requiredDocuments: [{ ar: 'جواز سفر', en: 'Passport' }, { ar: 'مستندات الحالة', en: 'Case documents' }],
    processingTime: { ar: 'حسب الحالة', en: 'Case-dependent' },
    pricing: { serviceFee: 200, governmentFee: 0, currency: 'AED' },
    steps: [
      { ar: 'استشارة', en: 'Consultation' }, { ar: 'خطة', en: 'Plan' }, { ar: 'تنفيذ', en: 'Execution' },
    ],
    color: 'from-violet-500 to-purple-700',
  },
];

export const MOCK_USERS: Record<string, User> = {
  'user-1': { id: 'user-1', email: 'customer@demo.com', name: 'أحمد محمد', role: 'customer', phone: '+971501234567', nationality: 'EG', createdAt: '2024-01-15', isVerified: true },
  'user-2': { id: 'user-2', email: 'agency@demo.com', name: 'خالد العلي', role: 'agency_owner', agencyId: 'agency-1', phone: '+971509876543', createdAt: '2024-01-10', isVerified: true },
  'user-3': { id: 'user-3', email: 'admin@demo.com', name: 'مدير النظام', role: 'admin', createdAt: '2024-01-01', isVerified: true },
};

export const MOCK_APPLICATIONS: Application[] = [
  {
    id: 'app-1', referenceCode: 'VSA-2024-001', serviceType: 'tourist_visa', userId: 'user-1',
    applicants: [{ id: 'appl-1', fullName: 'أحمد محمد علي', nationality: 'Egyptian', passportNumber: 'A12345678', passportExpiry: '2026-05-15', dateOfBirth: '1990-03-20', countryOfResidence: 'UAE', phone: '+971501234567', email: 'ahmed@demo.com' }],
    status: 'processing', paymentStatus: 'not_due',
    documents: [{ id: 'doc-1', applicantId: 'appl-1', type: 'passport', fileName: 'passport.pdf', storageKey: 'docs/app-1/passport.pdf', status: 'approved', uploadedAt: '2024-02-01' }],
    statusHistory: [
      { id: 'ev-1', applicationId: 'app-1', fromStatus: null, toStatus: 'submitted', actorId: 'user-1', actorRole: 'customer', timestamp: '2024-02-01T10:00:00Z' },
      { id: 'ev-2', applicationId: 'app-1', fromStatus: 'submitted', toStatus: 'document_review', actorId: 'user-3', actorRole: 'admin', note: 'تم الاستلام', timestamp: '2024-02-02T09:00:00Z' },
      { id: 'ev-3', applicationId: 'app-1', fromStatus: 'document_review', toStatus: 'processing', actorId: 'user-3', actorRole: 'admin', note: 'جاري المعالجة', timestamp: '2024-02-03T14:00:00Z' },
    ],
    totalCost: 550, serviceFee: 250, governmentFee: 300, createdAt: '2024-02-01', updatedAt: '2024-02-03',
  },
  {
    id: 'app-2', referenceCode: 'VSA-2024-002', serviceType: 'family_visit', userId: 'user-1',
    applicants: [{ id: 'appl-2', fullName: 'فاطمة أحمد', nationality: 'Egyptian', passportNumber: 'B87654321', passportExpiry: '2027-08-20', dateOfBirth: '1992-07-15', countryOfResidence: 'UAE', phone: '+971501234568', email: 'fatima@demo.com' }],
    status: 'document_review', paymentStatus: 'not_due',
    documents: [{ id: 'doc-2', applicantId: 'appl-2', type: 'passport', fileName: 'passport_f.pdf', storageKey: 'docs/app-2/passport.pdf', status: 'pending', uploadedAt: '2024-02-05' }],
    statusHistory: [
      { id: 'ev-4', applicationId: 'app-2', fromStatus: null, toStatus: 'submitted', actorId: 'user-1', actorRole: 'customer', timestamp: '2024-02-05T11:00:00Z' },
      { id: 'ev-5', applicationId: 'app-2', fromStatus: 'submitted', toStatus: 'document_review', actorId: 'user-3', actorRole: 'admin', timestamp: '2024-02-06T08:00:00Z' },
    ],
    totalCost: 500, serviceFee: 300, governmentFee: 200, createdAt: '2024-02-05', updatedAt: '2024-02-06',
  },
];

export const MOCK_FAQS: FAQ[] = [
  { id: 'faq-1', question: { ar: 'ما مدة معالجة التأشيرة السياحية؟', en: 'Tourist visa processing time?' }, answer: { ar: '3-5 أيام عمل بعد استكمال المستندات.', en: '3-5 business days after completion.' }, category: 'visas', order: 1 },
  { id: 'faq-2', question: { ar: 'هل أنتم جهة رسمية؟', en: 'Are you official?' }, answer: { ar: 'لا، نحن منصة مستقلة. القرار النهائي للجهات الرسمية.', en: 'No, we are independent. Final decisions with authorities.' }, category: 'general', order: 2 },
  { id: 'faq-3', question: { ar: 'ما رسوم الخدمة؟', en: 'Service fees?' }, answer: { ar: 'تنقسم لرسوم خدمة ورسوم حكومية. تُعرض بشفافية.', en: 'Split into service and government fees. Transparently displayed.' }, category: 'pricing', order: 3 },
  { id: 'faq-4', question: { ar: 'كيف أتتبع طلبي؟', en: 'How to track?' }, answer: { ar: 'عبر رقم المرجع أو لوحة التحكم.', en: 'Via reference number or dashboard.' }, category: 'general', order: 4 },
  { id: 'faq-5', question: { ar: 'هل يمكن التقديم لمجموعة؟', en: 'Group application?' }, answer: { ar: 'نعم، مع مستندات منفصلة لكل شخص.', en: 'Yes, with separate documents per person.' }, category: 'visas', order: 5 },
  { id: 'faq-6', question: { ar: 'سياسة الاسترداد؟', en: 'Refund policy?' }, answer: { ar: 'الرسوم الحكومية غير قابلة للاسترداد.', en: 'Government fees non-refundable.' }, category: 'pricing', order: 6 },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'notif-1', userId: 'user-1', title: { ar: 'تحديث', en: 'Update' }, message: { ar: 'طلبك VSA-2024-001 في المعالجة', en: 'Application VSA-2024-001 is processing' }, type: 'info', read: false, createdAt: '2024-02-03T14:00:00Z' },
  { id: 'notif-2', userId: 'user-1', title: { ar: 'مطلوب', en: 'Required' }, message: { ar: 'يرجى رفع شهادة الميلاد', en: 'Please upload birth certificate' }, type: 'warning', read: false, createdAt: '2024-02-06T08:30:00Z' },
];

export const getStatusLabel = (status: ApplicationStatus, lang: 'ar' | 'en'): string => {
  const labels: Record<ApplicationStatus, { ar: string; en: string }> = {
    draft: { ar: 'مسودة', en: 'Draft' }, submitted: { ar: 'مُقدَّم', en: 'Submitted' },
    document_review: { ar: 'مراجعة', en: 'Review' }, processing: { ar: 'معالجة', en: 'Processing' },
    verified: { ar: 'تحقق', en: 'Verified' }, approved_for_payment: { ar: 'معتمد', en: 'Approved' },
    payment_pending: { ar: 'دفع', en: 'Payment' }, completed: { ar: 'مكتمل', en: 'Completed' },
    rejected: { ar: 'مرفوض', en: 'Rejected' }, cancelled: { ar: 'ملغي', en: 'Cancelled' },
  };
  return labels[status][lang];
};
