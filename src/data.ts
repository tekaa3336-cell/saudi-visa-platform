import { Service, Application, User, Agency, FAQ, Notification, ApplicationStatus } from './types';

export const SERVICES: Service[] = [
  {
    id: 'tourist_visa',
    name: { ar: 'تأشيرة سياحية', en: 'Tourist Visa' },
    shortDesc: { ar: 'مساعدة في الحصول على تأشيرة سياحية للسعودية', en: 'Assistance with Saudi tourist visa application' },
    description: { 
      ar: 'نقدم مساعدة شاملة في إعداد وتقديم طلب التأشيرة السياحية للمملكة العربية السعودية. نساعدك في جمع المستندات، ملء النماذج، ومتابعة طلبك حتى الحصول على النتيجة.',
      en: 'We provide comprehensive assistance in preparing and submitting your Saudi tourist visa application. We help you gather documents, fill forms, and track your application until a decision is reached.'
    },
    icon: 'Plane',
    eligibility: { 
      ar: 'متاحة لمواطني الدول المؤهلة للسياحة في السعودية. يجب أن يكون جواز السفر ساري المفعول لمدة 6 أشهر على الأقل.',
      en: 'Available for nationals of countries eligible for Saudi tourism. Passport must be valid for at least 6 months.'
    },
    requiredDocuments: [
      { ar: 'صورة جواز السفر (صفحة المعلومات)', en: 'Passport copy (information page)' },
      { ar: 'صورة شخصية حديثة بخلفية بيضاء', en: 'Recent personal photo with white background' },
      { ar: 'إثبات الإقامة أو العنوان', en: 'Proof of residence or address' },
      { ar: 'حجز فندقي أو خطاب دعوة', en: 'Hotel booking or invitation letter' },
      { ar: 'تأمين سفر ساري', en: 'Valid travel insurance' },
    ],
    processingTime: { ar: '3-5 أيام عمل', en: '3-5 business days' },
    pricing: { serviceFee: 250, governmentFee: 300, currency: 'AED' },
    wholesaleTiers: [
      { name: { ar: 'برونزي', en: 'Bronze' }, minApplications: 10, discountPercent: 5 },
      { name: { ar: 'فضي', en: 'Silver' }, minApplications: 25, discountPercent: 10 },
      { name: { ar: 'ذهبي', en: 'Gold' }, minApplications: 50, discountPercent: 15 },
    ],
    steps: [
      { ar: 'تقديم الطلب والمعلومات الأساسية', en: 'Submit application and basic information' },
      { ar: 'رفع المستندات المطلوبة', en: 'Upload required documents' },
      { ar: 'مراجعة المستندات والتحقق', en: 'Document review and verification' },
      { ar: 'تقديم الطلب للجهات الرسمية', en: 'Submit to official authorities' },
      { ar: 'استلام التأشيرة', en: 'Receive visa' },
    ],
    color: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'family_visit',
    name: { ar: 'تأشيرة زيارة عائلية', en: 'Family Visit Visa' },
    shortDesc: { ar: 'مساعدة في تأشيرة زيارة الأقارب في السعودية', en: 'Assistance with family visit visa to Saudi Arabia' },
    description: {
      ar: 'نساعدك في إجراءات تأشيرة الزيارة العائلية لزيارة أقاربك المقيمين في المملكة العربية السعودية. نتولى متابعة الطلب والتنسيق مع الجهات المعنية.',
      en: 'We assist with family visit visa procedures to visit your relatives residing in the Kingdom of Saudi Arabia. We handle application follow-up and coordination with relevant authorities.'
    },
    icon: 'Users',
    eligibility: {
      ar: 'للمقيمين في السعودية الذين يرغبون في زيارة أقاربهم من الدرجة الأولى. يحتاج المتقدم إلى كفيل أو مضيف في السعودية.',
      en: 'For residents in Saudi Arabia who wish to visit first-degree relatives. Applicant needs a sponsor or host in Saudi Arabia.'
    },
    requiredDocuments: [
      { ar: 'صورة جواز السفر', en: 'Passport copy' },
      { ar: 'صورة شخصية', en: 'Personal photo' },
      { ar: 'شهادة_relation (ميلاد، زواج)', en: 'Relationship certificate (birth, marriage)' },
      { ar: 'خطاب دعوة من المضيف في السعودية', en: 'Invitation letter from host in Saudi' },
      { ar: 'صورة هوية المضيف (إقامة)', en: 'Host ID copy (Iqama)' },
    ],
    processingTime: { ar: '5-10 أيام عمل', en: '5-10 business days' },
    pricing: { serviceFee: 300, governmentFee: 200, currency: 'AED' },
    steps: [
      { ar: 'تقديم بيانات الزائر والمضيف', en: 'Submit visitor and host details' },
      { ar: 'رفع إثبات القرابة والمستندات', en: 'Upload relationship proof and documents' },
      { ar: 'مراجعة وتقديم للجهات المختصة', en: 'Review and submit to authorities' },
      { ar: 'متابعة حالة الطلب', en: 'Track application status' },
      { ar: 'إصدار التأشيرة', en: 'Visa issuance' },
    ],
    color: 'from-rose-500 to-pink-600',
  },
  {
    id: 'personal_visit',
    name: { ar: 'تأشيرة زيارة شخصية', en: 'Personal Visit Visa' },
    shortDesc: { ar: 'تأشيرة زيارة شخصية للأغراض العامة', en: 'Personal visit visa for general purposes' },
    description: {
      ar: 'خدمة مساعدة في الحصول على تأشيرة الزيارة الشخصية للأغراض العامة مثل زيارة الأصدقاء أو حضور مناسبات خاصة.',
      en: 'Assistance service for obtaining personal visit visas for general purposes such as visiting friends or attending special events.'
    },
    icon: 'UserCheck',
    eligibility: {
      ar: 'متاحة لجميع الجنسيات المؤهلة. يحتاج إلى دعوة من مقيم أو مواطن سعودي.',
      en: 'Available for all eligible nationalities. Requires invitation from a Saudi resident or citizen.'
    },
    requiredDocuments: [
      { ar: 'جواز سفر ساري', en: 'Valid passport' },
      { ar: 'صورة شخصية', en: 'Personal photo' },
      { ar: 'خطاب دعوة معتمد', en: 'Certified invitation letter' },
      { ar: 'إثبات الغرض من الزيارة', en: 'Proof of visit purpose' },
    ],
    processingTime: { ar: '5-7 أيام عمل', en: '5-7 business days' },
    pricing: { serviceFee: 280, governmentFee: 200, currency: 'AED' },
    steps: [
      { ar: 'تقديم الطلب والمستندات', en: 'Submit application and documents' },
      { ar: 'مراجعة الطلب', en: 'Application review' },
      { ar: 'التقديم للجهات الرسمية', en: 'Submit to official authorities' },
      { ar: 'المتابعة والإصدار', en: 'Follow-up and issuance' },
    ],
    color: 'from-teal-500 to-cyan-600',
  },
  {
    id: 'business_visit',
    name: { ar: 'تأشيرة زيارة أعمال', en: 'Business Visit Visa' },
    shortDesc: { ar: 'تأشيرة زيارة لأغراض الأعمال والمؤتمرات', en: 'Visit visa for business and conference purposes' },
    description: {
      ar: 'نساعد الشركات والأفراد في الحصول على تأشيرة زيارة الأعمال لحضور المؤتمرات، الاجتماعات، أو استكشاف فرص تجارية في المملكة.',
      en: 'We assist companies and individuals in obtaining business visit visas for attending conferences, meetings, or exploring business opportunities in the Kingdom.'
    },
    icon: 'Briefcase',
    eligibility: {
      ar: 'لرجال الأعمال والموظفين المدعوين من شركات سعودية أو لحضور فعاليات تجارية معتمدة.',
      en: 'For business people and employees invited by Saudi companies or to attend approved business events.'
    },
    requiredDocuments: [
      { ar: 'جواز سفر ساري', en: 'Valid passport' },
      { ar: 'خطاب من جهة العمل', en: 'Letter from employer' },
      { ar: 'دعوة من شركة سعودية', en: 'Invitation from Saudi company' },
      { ar: 'سجل تجاري (لأصحاب الأعمال)', en: 'Commercial registration (for business owners)' },
      { ar: 'صورة شخصية', en: 'Personal photo' },
    ],
    processingTime: { ar: '3-7 أيام عمل', en: '3-7 business days' },
    pricing: { serviceFee: 350, governmentFee: 250, currency: 'AED' },
    steps: [
      { ar: 'تقديم بيانات الشركة والدعوة', en: 'Submit company details and invitation' },
      { ar: 'رفع المستندات التجارية', en: 'Upload business documents' },
      { ar: 'مراجعة وتقديم', en: 'Review and submit' },
      { ar: 'إصدار التأشيرة', en: 'Visa issuance' },
    ],
    color: 'from-amber-500 to-orange-600',
  },
  {
    id: 'work_guidance',
    name: { ar: 'إرشادات تأشيرة العمل', en: 'Work Visa Guidance' },
    shortDesc: { ar: 'إرشاد وتوجيه بشأن إجراءات تأشيرة العمل', en: 'Guidance and direction regarding work visa procedures' },
    description: {
      ar: 'خدمة إرشادية تساعدك في فهم متطلبات وإجراءات تأشيرة العمل في السعودية. نوضح الخطوات والمستندات المطلوبة ونساعد في التنسيق مع صاحب العمل. ملاحظة: الإصدار الفعلي للتأشيرة يتم عبر الجهات الرسمية فقط.',
      en: 'A guidance service that helps you understand work visa requirements and procedures in Saudi Arabia. We clarify steps and required documents and assist in coordination with the employer. Note: Actual visa issuance is done by official authorities only.'
    },
    icon: 'HardHat',
    eligibility: {
      ar: 'للأشخاص الذين حصلوا على عرض عمل من شركة سعودية أو يرغبون في العمل في المملكة.',
      en: 'For individuals who have received a job offer from a Saudi company or wish to work in the Kingdom.'
    },
    requiredDocuments: [
      { ar: 'جواز سفر ساري', en: 'Valid passport' },
      { ar: 'عقد عمل معتمد', en: 'Certified employment contract' },
      { ar: 'شهادات مؤهلات', en: 'Qualification certificates' },
      { ar: 'شهادة طبية', en: 'Medical certificate' },
      { ar: 'صحيفة سيرة ذاتية', en: 'CV / Resume' },
      { ar: 'صورة شخصية', en: 'Personal photo' },
    ],
    processingTime: { ar: '10-20 يوم عمل (حسب الإجراءات)', en: '10-20 business days (depending on procedures)' },
    pricing: { serviceFee: 500, governmentFee: 0, currency: 'AED' },
    steps: [
      { ar: 'استشارة أولية وتقييم', en: 'Initial consultation and assessment' },
      { ar: 'تجهيز المستندات', en: 'Document preparation' },
      { ar: 'التنسيق مع صاحب العمل', en: 'Coordination with employer' },
      { ar: 'متابعة الإجراءات', en: 'Procedure follow-up' },
      { ar: 'التوجيه حتى الإصدار', en: 'Guidance until issuance' },
    ],
    color: 'from-slate-600 to-gray-800',
  },
  {
    id: 'umrah_assistance',
    name: { ar: 'خدمات العمرة والروضة', en: 'Umrah & Rawdah Services' },
    shortDesc: { ar: 'مساعدة في ترتيبات العمرة وزيارة المسجد النبوي', en: 'Assistance with Umrah arrangements and Prophet\'s Mosque visit' },
    description: {
      ar: 'نقدم مساعدة في ترتيبات العمرة بما في ذلك إرشادات حول حجز التصاريح عبر تطبيق توكلنا، والتنسيق مع الفنادق القريبة من الحرمين الشريفين، وجدولة زيارة الروضة الشريفة.',
      en: 'We provide assistance with Umrah arrangements including guidance on permit booking via Tawakkalna app, coordination with hotels near the Two Holy Mosques, and scheduling visits to the Rawdah Sharifah.'
    },
    icon: 'Moon',
    eligibility: {
      ar: 'لجميع المسلمين الحاصلين على تأشيرة سارية أو مواطني دول مجلس التعاون.',
      en: 'For all Muslims with a valid visa or GCC nationals.'
    },
    requiredDocuments: [
      { ar: 'جواز سفر ساري أو هوية لدول الخليج', en: 'Valid passport or GCC ID' },
      { ar: 'تأشيرة سارية (إن وجدت)', en: 'Valid visa (if applicable)' },
      { ar: 'تسجيل في تطبيق توكلنا', en: 'Tawakkalna app registration' },
    ],
    processingTime: { ar: '24-48 ساعة لترتيب التصاريح', en: '24-48 hours for permit arrangements' },
    pricing: { serviceFee: 150, governmentFee: 0, currency: 'AED' },
    steps: [
      { ar: 'تسجيل البيانات وتحديد التواريخ', en: 'Register details and select dates' },
      { ar: 'حجز التصاريح عبر توكلنا', en: 'Book permits via Tawakkalna' },
      { ar: 'تنسيق النقل والإقامة', en: 'Coordinate transport and accommodation' },
      { ar: 'جدولة زيارة الروضة', en: 'Schedule Rawdah visit' },
    ],
    color: 'from-emerald-500 to-green-700',
  },
  {
    id: 'visa_facilitation',
    name: { ar: 'تسهيل خدمات التأشيرات', en: 'Visa Facilitation Services' },
    shortDesc: { ar: 'خدمات تسهيل ودعم مخصصة لحالات التأشيرة الخاصة', en: 'Customized facilitation and support services for special visa cases' },
    description: {
      ar: 'خدمات مخصصة لتسهيل إجراءات التأشيرات للحالات الخاصة والمعقدة. نقدم استشارة فردية ومتابعة شخصية لضمان أفضل نتيجة.',
      en: 'Customized services for facilitating visa procedures for special and complex cases. We provide individual consultation and personal follow-up to ensure the best outcome.'
    },
    icon: 'Settings',
    eligibility: {
      ar: 'لجميع الحالات التي تحتاج مساعدة متخصصة في إجراءات التأشيرات.',
      en: 'For all cases requiring specialized assistance with visa procedures.'
    },
    requiredDocuments: [
      { ar: 'جواز سفر ساري', en: 'Valid passport' },
      { ar: 'المستندات المتعلقة بالحالة', en: 'Case-related documents' },
    ],
    processingTime: { ar: 'حسب نوع الخدمة', en: 'Depends on service type' },
    pricing: { serviceFee: 200, governmentFee: 0, currency: 'AED' },
    steps: [
      { ar: 'استشارة وتقييم الحالة', en: 'Consultation and case assessment' },
      { ar: 'خطة مخصصة', en: 'Custom plan' },
      { ar: 'تنفيذ ومتابعة', en: 'Execution and follow-up' },
    ],
    color: 'from-violet-500 to-purple-700',
  },
];

export const MOCK_USERS: Record<string, User> = {
  'user-1': { id: 'user-1', email: 'customer@demo.com', name: 'أحمد محمد', role: 'customer', phone: '+971501234567', nationality: 'EG', createdAt: '2024-01-15', isVerified: true },
  'user-2': { id: 'user-2', email: 'agency@demo.com', name: 'خالد العلي', role: 'agency_owner', agencyId: 'agency-1', phone: '+971509876543', createdAt: '2024-01-10', isVerified: true },
  'user-3': { id: 'user-3', email: 'admin@demo.com', name: 'مدير النظام', role: 'admin', createdAt: '2024-01-01', isVerified: true },
};

export const MOCK_AGENCY: Agency = {
  id: 'agency-1',
  name: 'وكالة السفر الذهبية',
  ownerId: 'user-2',
  status: 'verified',
  tier: 'gold',
  createdAt: '2024-01-10',
  members: ['user-2'],
};

export const MOCK_APPLICATIONS: Application[] = [
  {
    id: 'app-1',
    referenceCode: 'VSA-2024-001',
    serviceType: 'tourist_visa',
    userId: 'user-1',
    applicants: [{
      id: 'appl-1',
      fullName: 'أحمد محمد علي',
      nationality: 'Egyptian',
      passportNumber: 'A12345678',
      passportExpiry: '2026-05-15',
      dateOfBirth: '1990-03-20',
      countryOfResidence: 'UAE',
      phone: '+971501234567',
      email: 'ahmed@demo.com',
    }],
    status: 'processing',
    paymentStatus: 'not_due',
    documents: [
      { id: 'doc-1', applicantId: 'appl-1', type: 'passport', fileName: 'passport.pdf', storageKey: 'docs/app-1/passport.pdf', status: 'approved', uploadedAt: '2024-02-01' },
      { id: 'doc-2', applicantId: 'appl-1', type: 'photo', fileName: 'photo.jpg', storageKey: 'docs/app-1/photo.jpg', status: 'approved', uploadedAt: '2024-02-01' },
    ],
    statusHistory: [
      { id: 'ev-1', applicationId: 'app-1', fromStatus: null, toStatus: 'submitted', actorId: 'user-1', actorRole: 'customer', timestamp: '2024-02-01T10:00:00Z' },
      { id: 'ev-2', applicationId: 'app-1', fromStatus: 'submitted', toStatus: 'document_review', actorId: 'user-3', actorRole: 'admin', note: 'تم استلام المستندات', timestamp: '2024-02-02T09:00:00Z' },
      { id: 'ev-3', applicationId: 'app-1', fromStatus: 'document_review', toStatus: 'processing', actorId: 'user-3', actorRole: 'admin', note: 'المستندات مكتملة - جاري المعالجة', timestamp: '2024-02-03T14:00:00Z' },
    ],
    totalCost: 550,
    serviceFee: 250,
    governmentFee: 300,
    createdAt: '2024-02-01',
    updatedAt: '2024-02-03',
  },
  {
    id: 'app-2',
    referenceCode: 'VSA-2024-002',
    serviceType: 'family_visit',
    userId: 'user-1',
    applicants: [{
      id: 'appl-2',
      fullName: 'فاطمة أحمد',
      nationality: 'Egyptian',
      passportNumber: 'B87654321',
      passportExpiry: '2027-08-20',
      dateOfBirth: '1992-07-15',
      countryOfResidence: 'UAE',
      phone: '+971501234568',
      email: 'fatima@demo.com',
    }],
    status: 'document_review',
    paymentStatus: 'not_due',
    documents: [
      { id: 'doc-3', applicantId: 'appl-2', type: 'passport', fileName: 'passport_f.pdf', storageKey: 'docs/app-2/passport.pdf', status: 'pending', uploadedAt: '2024-02-05' },
    ],
    statusHistory: [
      { id: 'ev-4', applicationId: 'app-2', fromStatus: null, toStatus: 'submitted', actorId: 'user-1', actorRole: 'customer', timestamp: '2024-02-05T11:00:00Z' },
      { id: 'ev-5', applicationId: 'app-2', fromStatus: 'submitted', toStatus: 'document_review', actorId: 'user-3', actorRole: 'admin', timestamp: '2024-02-06T08:00:00Z' },
    ],
    totalCost: 500,
    serviceFee: 300,
    governmentFee: 200,
    createdAt: '2024-02-05',
    updatedAt: '2024-02-06',
  },
];

export const MOCK_FAQS: FAQ[] = [
  { id: 'faq-1', question: { ar: 'ما هي مدة معالجة تأشيرة السياحة؟', en: 'What is the tourist visa processing time?' }, answer: { ar: 'عادةً تستغرق المعالجة من 3 إلى 5 أيام عمل بعد استكمال جميع المستندات المطلوبة.', en: 'Processing typically takes 3 to 5 business days after all required documents are completed.' }, category: 'visas', order: 1 },
  { id: 'faq-2', question: { ar: 'هل أنتم جهة رسمية؟', en: 'Are you an official authority?' }, answer: { ar: 'لا، نحن منصة خدمات مستقلة نساعد في إعداد وتنسيق وتقديم الطلبات. القرار النهائي يعود للجهات الرسمية المختصة في المملكة العربية السعودية.', en: 'No, we are an independent service platform that assists with preparation, coordination, and submission. The final decision rests with the competent official authorities in Saudi Arabia.' }, category: 'general', order: 2 },
  { id: 'faq-3', question: { ar: 'ما هي رسوم الخدمة؟', en: 'What are the service fees?' }, answer: { ar: 'تنقسم التكلفة إلى رسوم خدمة المنصة ورسوم حكومية. يتم عرض التفاصيل بشكل شفاف قبل تأكيد الطلب.', en: 'Costs are divided into platform service fees and government fees. Details are displayed transparently before confirming the application.' }, category: 'pricing', order: 3 },
  { id: 'faq-4', question: { ar: 'كيف يمكنني تتبع طلبي؟', en: 'How can I track my application?' }, answer: { ar: 'يمكنك تتبع طلبك عبر رقم المرجع الذي تحصل عليه عند التقديم، أو عبر لوحة التحكم الخاصة بك بعد تسجيل الدخول.', en: 'You can track your application via the reference number you receive upon submission, or through your dashboard after logging in.' }, category: 'general', order: 4 },
  { id: 'faq-5', question: { ar: 'هل يمكنني تقديم طلب لمجموعة؟', en: 'Can I apply for a group?' }, answer: { ar: 'نعم، يمكنك إضافة عدة أشخاص في طلب واحد (عائلة أو مجموعة) مع مستندات منفصلة لكل مسافر.', en: 'Yes, you can add multiple people in one application (family or group) with separate documents for each traveler.' }, category: 'visas', order: 5 },
  { id: 'faq-6', question: { ar: 'ما هي سياسة الاسترداد؟', en: 'What is the refund policy?' }, answer: { ar: 'رسوم الخدمة الحكومية غير قابلة للاسترداد بعد التقديم. رسوم الخدمة قد تكون قابلة للاسترداد حسب حالة الطلب. راجع سياسة الاسترداد للتفاصيل.', en: 'Government service fees are non-refundable after submission. Service fees may be refundable depending on application status. See refund policy for details.' }, category: 'pricing', order: 6 },
];

export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'notif-1', userId: 'user-1', title: { ar: 'تحديث حالة الطلب', en: 'Application Status Update' }, message: { ar: 'تم نقل طلبك VSA-2024-001 إلى مرحلة المعالجة', en: 'Your application VSA-2024-001 has been moved to processing stage' }, type: 'info', read: false, createdAt: '2024-02-03T14:00:00Z' },
  { id: 'notif-2', userId: 'user-1', title: { ar: 'مطلوب مستندات إضافية', en: 'Additional Documents Required' }, message: { ar: 'يرجى رفع شهادة الميلاد للطلب VSA-2024-002', en: 'Please upload birth certificate for application VSA-2024-002' }, type: 'warning', read: false, createdAt: '2024-02-06T08:30:00Z' },
];

export const getStatusLabel = (status: ApplicationStatus, lang: 'ar' | 'en'): string => {
  const labels: Record<ApplicationStatus, { ar: string; en: string }> = {
    draft: { ar: 'مسودة', en: 'Draft' },
    submitted: { ar: 'مُقدَّم', en: 'Submitted' },
    document_review: { ar: 'مراجعة المستندات', en: 'Document Review' },
    processing: { ar: 'قيد المعالجة', en: 'Processing' },
    verified: { ar: 'تم التحقق', en: 'Verified' },
    approved_for_payment: { ar: 'معتمد للدفع', en: 'Approved for Payment' },
    payment_pending: { ar: 'بانتظار الدفع', en: 'Payment Pending' },
    completed: { ar: 'مكتمل', en: 'Completed' },
    rejected: { ar: 'مرفوض', en: 'Rejected' },
    cancelled: { ar: 'ملغي', en: 'Cancelled' },
  };
  return labels[status][lang];
};

export const getServiceById = (id: string): Service | undefined => {
  return SERVICES.find(s => s.id === id);
};
