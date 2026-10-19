// Pure helpers: convert Supabase rows to the app's types and database error codes to messages.
// No React or Supabase imports, so they are easy to test.

import type {
  Application, ApplicationStatus, Applicant, DocumentRecord, PaymentStatus, ServiceType, StatusEvent, UserRole,
} from '../types';

export interface ApplicantRow {
  id: string;
  application_id: string;
  full_name: string;
  nationality: string;
  passport_number: string;
  passport_expiry: string;
  date_of_birth: string;
  country_of_residence: string | null;
  phone: string | null;
  email: string | null;
  created_at?: string | null;
}

export interface DocumentRow {
  id: string;
  application_id: string;
  applicant_id: string | null;
  document_type: string;
  file_name: string;
  storage_key: string;
  status: 'pending' | 'approved' | 'rejected' | null;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  created_at?: string | null;
}

export interface StatusEventRow {
  id: string;
  application_id: string;
  from_status: string | null;
  to_status: string;
  actor_id: string | null;
  actor_role: string;
  note: string | null;
  created_at: string;
}

export interface ApplicationRow {
  id: string;
  reference_code: string;
  service_id: string;
  user_id: string | null;
  agency_id?: string | null;
  status: string | null;
  payment_status: string | null;
  total_cost: number | string | null;
  service_fee: number | string | null;
  government_fee: number | string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  applicants?: ApplicantRow[] | null;
  documents?: DocumentRow[] | null;
  status_events?: StatusEventRow[] | null;
}

/** The select list used for every read: an application with its applicants, documents and history */
export const APPLICATION_SELECT = '*, applicants(*), documents(*), status_events(*)';

const byDate = (a?: string | null, b?: string | null) => (a ?? '').localeCompare(b ?? '');

export const mapApplicant = (r: ApplicantRow): Applicant => ({
  id: r.id,
  fullName: r.full_name,
  nationality: r.nationality,
  passportNumber: r.passport_number,
  passportExpiry: r.passport_expiry,
  dateOfBirth: r.date_of_birth,
  countryOfResidence: r.country_of_residence ?? '',
  phone: r.phone ?? '',
  email: r.email ?? '',
});

export const mapDocument = (r: DocumentRow): DocumentRecord => ({
  id: r.id,
  applicantId: r.applicant_id ?? '',
  type: r.document_type,
  fileName: r.file_name,
  storageKey: r.storage_key,
  status: r.status ?? 'pending',
  uploadedAt: r.created_at ?? '',
  reviewedAt: r.reviewed_at ?? undefined,
  reviewedBy: r.reviewed_by ?? undefined,
});

export const mapStatusEvent = (r: StatusEventRow): StatusEvent => ({
  id: r.id,
  applicationId: r.application_id,
  fromStatus: (r.from_status as ApplicationStatus | null) ?? null,
  toStatus: r.to_status as ApplicationStatus,
  actorId: r.actor_id ?? '',
  actorRole: r.actor_role as UserRole,
  note: r.note ?? undefined,
  timestamp: r.created_at,
});

export function mapApplication(r: ApplicationRow): Application {
  return {
    id: r.id,
    referenceCode: r.reference_code,
    serviceType: r.service_id as ServiceType,
    userId: r.user_id ?? '',
    agencyId: r.agency_id ?? undefined,
    status: (r.status ?? 'draft') as ApplicationStatus,
    paymentStatus: (r.payment_status ?? 'not_due') as PaymentStatus,
    applicants: [...(r.applicants ?? [])].sort((a, b) => byDate(a.created_at, b.created_at)).map(mapApplicant),
    documents: (r.documents ?? []).map(mapDocument),
    statusHistory: [...(r.status_events ?? [])].sort((a, b) => byDate(a.created_at, b.created_at)).map(mapStatusEvent),
    totalCost: Number(r.total_cost ?? 0),
    serviceFee: Number(r.service_fee ?? 0),
    governmentFee: Number(r.government_fee ?? 0),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    notes: r.notes ?? undefined,
  };
}

/** The latest review note that asked the customer for changes (what the applicant must read and fix) */
export function latestRevisionNote(app: Pick<Application, 'status' | 'statusHistory'>): StatusEvent | null {
  if (app.status !== 'needs_revision') return null;
  for (let i = app.statusHistory.length - 1; i >= 0; i--) {
    const ev = app.statusHistory[i];
    if (ev.toStatus === 'needs_revision') return ev;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Payloads sent to the database functions
// ---------------------------------------------------------------------------

export interface ApplicantInput {
  id?: string;
  fullName: string;
  nationality: string;
  passportNumber: string;
  passportExpiry: string;
  dateOfBirth: string;
  countryOfResidence: string;
  phone?: string;
  email?: string;
}

export interface UploadedFile {
  documentType: string;
  fileName: string;
  /** Path inside the private bucket: <user id>/... */
  storageKey: string;
  mimeType?: string;
  fileSize?: number;
}

export const toApplicantPayload = (a: ApplicantInput) => ({
  ...(a.id ? { id: a.id } : {}),
  fullName: a.fullName.trim(),
  nationality: a.nationality,
  passportNumber: a.passportNumber.trim(),
  passportExpiry: a.passportExpiry,
  dateOfBirth: a.dateOfBirth,
  countryOfResidence: a.countryOfResidence,
  phone: a.phone?.trim() ?? '',
  email: a.email?.trim() ?? '',
});

export const toDocumentPayload = (d: UploadedFile & { applicantIndex?: number; applicantId?: string }) => ({
  ...(d.applicantIndex !== undefined ? { applicant_index: d.applicantIndex } : {}),
  ...(d.applicantId ? { applicant_id: d.applicantId } : {}),
  document_type: d.documentType,
  file_name: d.fileName,
  storage_key: d.storageKey,
  mime_type: d.mimeType ?? null,
  file_size: d.fileSize ?? null,
});

// ---------------------------------------------------------------------------
// Database errors -> messages
// ---------------------------------------------------------------------------

export interface DbMessage {
  ar: string;
  en: string;
}

const DB_MESSAGES: Record<string, DbMessage> = {
  AUTH_REQUIRED: { ar: 'سجّل الدخول أولاً للمتابعة', en: 'Please sign in to continue' },
  EMAIL_NOT_CONFIRMED: { ar: 'يجب تأكيد بريدك الإلكتروني أولاً', en: 'Please confirm your email first' },
  FORBIDDEN: {
    ar: 'ليست لديك صلاحية لتنفيذ هذا الإجراء',
    en: 'You are not allowed to do this',
  },
  NOT_FOUND: { ar: 'الطلب غير موجود', en: 'Application not found' },
  NOT_EDITABLE: { ar: 'لا يمكن تعديل هذا الطلب في حالته الحالية', en: 'This application cannot be edited in its current status' },
  NOTE_TOO_LONG: { ar: 'الملاحظة طويلة جداً (الحد الأقصى 500 حرف)', en: 'The note is too long (max 500 characters)' },
  INVALID_SERVICE: { ar: 'الخدمة غير صالحة', en: 'Invalid service' },
  INVALID_APPLICANTS: { ar: 'بيانات المتقدمين غير صالحة', en: 'Invalid applicant data' },
  INVALID_DOCUMENTS: { ar: 'المستندات المرفوعة غير صالحة. أعد رفعها وحاول مرة أخرى', en: 'The uploaded documents are not valid. Upload them again and retry' },
  INVALID_FEES: { ar: 'الرسوم غير صالحة', en: 'Invalid fees' },
  INVALID_NAME: { ar: 'الاسم الكامل غير صالح (اسمان على الأقل بحروف فقط)', en: 'Invalid full name (at least two names, letters only)' },
  INVALID_NATIONALITY: { ar: 'الجنسية مطلوبة', en: 'Nationality is required' },
  INVALID_PASSPORT_NUMBER: { ar: 'رقم الجواز غير صالح', en: 'Invalid passport number' },
  INVALID_RESIDENCE: { ar: 'بلد الإقامة مطلوب', en: 'Country of residence is required' },
  INVALID_DOB: { ar: 'تاريخ الميلاد غير صالح', en: 'Invalid date of birth' },
  INVALID_PASSPORT_EXPIRY: { ar: 'تاريخ انتهاء الجواز غير صالح أو منتهٍ', en: 'Invalid or expired passport expiry date' },
  INVALID_PHONE: { ar: 'رقم الهاتف غير صالح', en: 'Invalid phone number' },
  INVALID_EMAIL: { ar: 'البريد الإلكتروني غير صالح', en: 'Invalid email address' },
};

const NOT_SET_UP: DbMessage = {
  ar: 'قاعدة البيانات غير مهيأة بعد. شغّل ملف supabase/fix_applications_rpc.sql في Supabase ثم أعد المحاولة',
  en: 'The database is not set up yet. Run supabase/fix_applications_rpc.sql in Supabase, then try again',
};

const GENERIC: DbMessage = {
  ar: 'تعذّر إكمال العملية. حاول مرة أخرى',
  en: 'The operation could not be completed. Please try again',
};
const NETWORK: DbMessage = {
  ar: 'تعذّر الاتصال بالخادم. تحقق من اتصالك بالإنترنت',
  en: 'Could not reach the server. Check your internet connection',
};

/** Finds the known error code in a Postgres/PostgREST error and returns a bilingual message. */
export function mapDbError(err: { message?: string; code?: string } | null | undefined): DbMessage {
  const text = `${err?.message ?? ''}`;
  for (const code of Object.keys(DB_MESSAGES)) {
    if (text.includes(code)) return DB_MESSAGES[code];
  }
  // PGRST202/PGRST203: function not found / ambiguous; PGRST200/PGRST205 and 42P01/42703: missing relation or column
  if (/^PGRST20[0235]$/.test(err?.code ?? '') || err?.code === '42P01' || err?.code === '42703'
      || /schema cache|does not exist/i.test(text)) return NOT_SET_UP;
  if (err?.code === '42501' || /permission denied|row-level security/i.test(text)) return DB_MESSAGES.FORBIDDEN;
  if (/failed to fetch|network/i.test(text)) return NETWORK;
  return GENERIC;
}
