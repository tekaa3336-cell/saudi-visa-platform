// Pure logic for the admin dashboard (no React / browser imports, so it is easy to test).

import type { Application, ApplicationStatus } from '../types';
import { STATUS_TRANSITIONS } from '../types';
import type { ValidationResult } from '../utils/validation';

// ---------------------------------------------------------------------------
// Status filters
// ---------------------------------------------------------------------------

export type AdminFilter = 'all' | 'review' | 'accepted' | 'rejected' | 'needs_revision';

/** Which application statuses belong to each filter tab */
export const FILTER_GROUPS: Record<Exclude<AdminFilter, 'all'>, ApplicationStatus[]> = {
  // قيد المراجعة
  review: ['submitted', 'document_review', 'processing'],
  // مقبول
  accepted: ['verified', 'approved_for_payment', 'payment_pending', 'completed'],
  // مرفوض
  rejected: ['rejected'],
  // يتطلب تعديل
  needs_revision: ['needs_revision'],
};

export const FILTER_ORDER: AdminFilter[] = ['all', 'review', 'accepted', 'rejected', 'needs_revision'];

export const FILTER_LABELS: Record<AdminFilter, { ar: string; en: string }> = {
  all: { ar: 'الكل', en: 'All' },
  review: { ar: 'قيد المراجعة', en: 'Under review' },
  accepted: { ar: 'مقبول', en: 'Accepted' },
  rejected: { ar: 'مرفوض', en: 'Rejected' },
  needs_revision: { ar: 'يتطلب تعديل', en: 'Needs changes' },
};

const matchesFilter = (status: ApplicationStatus, filter: AdminFilter): boolean =>
  filter === 'all' || FILTER_GROUPS[filter].includes(status);

export function countByFilter(apps: Application[]): Record<AdminFilter, number> {
  const counts = { all: apps.length, review: 0, accepted: 0, rejected: 0, needs_revision: 0 };
  for (const app of apps) {
    for (const key of Object.keys(FILTER_GROUPS) as Exclude<AdminFilter, 'all'>[]) {
      if (FILTER_GROUPS[key].includes(app.status)) counts[key] += 1;
    }
  }
  return counts;
}

export interface AdminStats {
  total: number;
  /** Applications that were just submitted and not picked up yet */
  newCount: number;
  completed: number;
}

export function computeStats(apps: Application[]): AdminStats {
  return {
    total: apps.length,
    newCount: apps.filter(a => a.status === 'submitted').length,
    completed: apps.filter(a => a.status === 'completed').length,
  };
}

const normalize = (s: string) => s.trim().toLowerCase();

/** Filters by status group and a free-text query (reference, applicant name, passport, email, phone) */
export function filterApplications(apps: Application[], filter: AdminFilter, query: string): Application[] {
  const q = normalize(query);
  return apps
    .filter(app => matchesFilter(app.status, filter))
    .filter(app => {
      if (!q) return true;
      const haystack = [
        app.referenceCode,
        ...app.applicants.flatMap(a => [a.fullName, a.passportNumber, a.email, a.phone]),
      ].join(' ').toLowerCase();
      return haystack.includes(q);
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

// ---------------------------------------------------------------------------
// Changing a status
// ---------------------------------------------------------------------------

/** Statuses the admin may move an application to from its current status */
export const getNextStatuses = (current: ApplicationStatus): ApplicationStatus[] =>
  STATUS_TRANSITIONS[current] ?? [];

const NOTE_MAX_LENGTH = 500;
const NOTE_MIN_LENGTH = 5;

/** The customer must be told why a request was rejected or what needs to change */
export function validateStatusChange(
  newStatus: ApplicationStatus | '',
  note: string,
): ValidationResult {
  if (!newStatus) {
    return { valid: false, message: 'اختر الحالة الجديدة', messageEn: 'Select the new status' };
  }

  const text = note.trim();

  if (text.length > NOTE_MAX_LENGTH) {
    return {
      valid: false,
      message: `الملاحظة طويلة جداً (الحد الأقصى ${NOTE_MAX_LENGTH} حرف)`,
      messageEn: `The note is too long (max ${NOTE_MAX_LENGTH} characters)`,
    };
  }

  if (newStatus === 'rejected' && text.length < NOTE_MIN_LENGTH) {
    return {
      valid: false,
      message: 'اكتب ملاحظة للعميل توضّح سبب الرفض',
      messageEn: 'Write a note for the customer explaining why the request was rejected',
    };
  }

  if (newStatus === 'needs_revision' && text.length < NOTE_MIN_LENGTH) {
    return {
      valid: false,
      message: 'اكتب ملاحظة للعميل توضّح التعديلات المطلوبة',
      messageEn: 'Write a note for the customer describing the changes needed',
    };
  }

  return { valid: true };
}

// ---------------------------------------------------------------------------
// Customers (derived from the submitted applications)
// ---------------------------------------------------------------------------

export interface CustomerSummary {
  key: string;
  name: string;
  email: string;
  phone: string;
  applications: number;
  lastActivity: string;
  hasOpenRequest: boolean;
}

/** One row per customer: grouped by account, or by email for guest applications */
export function deriveCustomers(apps: Application[]): CustomerSummary[] {
  const map = new Map<string, CustomerSummary>();

  for (const app of apps) {
    const lead = app.applicants[0];
    const email = lead?.email?.trim().toLowerCase() ?? '';
    const key = app.userId && app.userId !== 'guest' ? `user:${app.userId}` : `guest:${email || app.id}`;
    const open = FILTER_GROUPS.review.includes(app.status) || app.status === 'needs_revision';

    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        key,
        name: lead?.fullName ?? '',
        email: lead?.email ?? '',
        phone: lead?.phone ?? '',
        applications: 1,
        lastActivity: app.updatedAt,
        hasOpenRequest: open,
      });
    } else {
      existing.applications += 1;
      existing.hasOpenRequest = existing.hasOpenRequest || open;
      if (app.updatedAt > existing.lastActivity) existing.lastActivity = app.updatedAt;
    }
  }

  return [...map.values()].sort((a, b) => b.lastActivity.localeCompare(a.lastActivity));
}

export function filterCustomers(customers: CustomerSummary[], query: string): CustomerSummary[] {
  const q = normalize(query);
  if (!q) return customers;
  return customers.filter(c => `${c.name} ${c.email} ${c.phone}`.toLowerCase().includes(q));
}
