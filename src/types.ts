// ============================================
// Core Type Definitions for Visa Service Platform
// ============================================

export type Lang = 'ar' | 'en';
export type Theme = 'light' | 'dark';
export type UserRole = 'visitor' | 'customer' | 'agency_owner' | 'agency_staff' | 'admin';

export type ServiceType = 
  | 'tourist_visa'
  | 'family_visit'
  | 'personal_visit'
  | 'business_visit'
  | 'work_guidance'
  | 'umrah_assistance'
  | 'visa_facilitation';

export type ApplicationStatus = 
  | 'draft'
  | 'submitted'
  | 'document_review'
  | 'processing'
  | 'verified'
  | 'approved_for_payment'
  | 'payment_pending'
  | 'completed'
  | 'rejected'
  | 'cancelled';

export type PaymentStatus = 'not_due' | 'due' | 'paid' | 'refunded';

export interface LocalizedText {
  ar: string;
  en: string;
}

export interface Service {
  id: ServiceType;
  name: LocalizedText;
  shortDesc: LocalizedText;
  description: LocalizedText;
  icon: string;
  eligibility: LocalizedText;
  requiredDocuments: LocalizedText[];
  processingTime: LocalizedText;
  pricing: {
    serviceFee: number;
    governmentFee: number;
    currency: string;
  };
  wholesaleTiers?: WholesaleTier[];
  steps: LocalizedText[];
  color: string;
}

export interface WholesaleTier {
  name: LocalizedText;
  minApplications: number;
  discountPercent: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  agencyId?: string;
  phone?: string;
  nationality?: string;
  createdAt: string;
  isVerified: boolean;
}

export interface Agency {
  id: string;
  name: string;
  ownerId: string;
  status: 'pending' | 'verified' | 'suspended';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  createdAt: string;
  members: string[];
}

export interface Applicant {
  id: string;
  fullName: string;
  nationality: string;
  passportNumber: string;
  passportExpiry: string;
  dateOfBirth: string;
  countryOfResidence: string;
  phone: string;
  email: string;
  photo?: string;
}

export interface Application {
  id: string;
  referenceCode: string;
  serviceType: ServiceType;
  userId: string;
  agencyId?: string;
  applicants: Applicant[];
  status: ApplicationStatus;
  paymentStatus: PaymentStatus;
  documents: DocumentRecord[];
  statusHistory: StatusEvent[];
  verificationRecord?: VerificationRecord;
  totalCost: number;
  serviceFee: number;
  governmentFee: number;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface DocumentRecord {
  id: string;
  applicantId: string;
  type: string;
  fileName: string;
  storageKey: string;
  status: 'pending' | 'approved' | 'rejected';
  uploadedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface StatusEvent {
  id: string;
  applicationId: string;
  fromStatus: ApplicationStatus | null;
  toStatus: ApplicationStatus;
  actorId: string;
  actorRole: UserRole;
  note?: string;
  timestamp: string;
}

export interface VerificationRecord {
  id: string;
  applicationId: string;
  verifiedBy: string;
  verifiedAt: string;
  officialRefNumber?: string;
  notes?: string;
  documentsChecked: string[];
}

export interface PaymentRecord {
  id: string;
  applicationId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  dueAt?: string;
  paidAt?: string;
  method?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: LocalizedText;
  message: LocalizedText;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface FAQ {
  id: string;
  question: LocalizedText;
  answer: LocalizedText;
  category: string;
  order: number;
}

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

// Status transition rules
export const STATUS_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  draft: ['submitted', 'cancelled'],
  submitted: ['document_review', 'rejected', 'cancelled'],
  document_review: ['processing', 'submitted', 'rejected'],
  processing: ['verified', 'rejected'],
  verified: ['approved_for_payment', 'processing'],
  approved_for_payment: ['payment_pending', 'completed'],
  payment_pending: ['completed', 'cancelled'],
  completed: [],
  rejected: ['submitted'],
  cancelled: ['draft'],
};

export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  draft: 'bg-gray-100 text-gray-700',
  submitted: 'bg-blue-100 text-blue-700',
  document_review: 'bg-yellow-100 text-yellow-700',
  processing: 'bg-purple-100 text-purple-700',
  verified: 'bg-emerald-100 text-emerald-700',
  approved_for_payment: 'bg-green-100 text-green-700',
  payment_pending: 'bg-orange-100 text-orange-700',
  completed: 'bg-emerald-600 text-white',
  rejected: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-200 text-gray-600',
};
