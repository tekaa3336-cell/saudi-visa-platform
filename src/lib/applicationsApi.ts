// Everything the app reads from / writes to Supabase for visa applications.
// Reads rely on Row Level Security: a customer only receives their own rows.
// Writes go through database functions (see schema.sql) that validate the data and the status rules.

import { supabase } from './supabaseClient';
import type { Application, ApplicationStatus, ServiceType } from '../types';
import {
  APPLICATION_SELECT, mapApplication, mapDbError, toApplicantPayload, toDocumentPayload,
  type ApplicationRow, type ApplicantInput, type DbMessage, type UploadedFile,
} from './applicationMapper';

export type ApiResult<T> = { ok: true; data: T } | { ok: false; message: DbMessage };

async function guard<T>(run: () => PromiseLike<{ data: T | null; error: { message?: string; code?: string } | null }>): Promise<ApiResult<T>> {
  try {
    const { data, error } = await run();
    if (error) {
      // Keep the raw error visible in the browser console: the user-facing message is deliberately short
      console.error('[supabase]', error);
      return { ok: false, message: mapDbError(error) };
    }
    return { ok: true, data: data as T };
  } catch (err) {
    console.error('[supabase]', err);
    return { ok: false, message: mapDbError(err as Error) };
  }
}

/** Applications of the signed-in customer (RLS filters to their own rows; the filter is just explicit). */
export async function listMyApplications(userId: string): Promise<ApiResult<Application[]>> {
  const res = await guard<ApplicationRow[]>(() =>
    supabase.from('applications').select(APPLICATION_SELECT).eq('user_id', userId).order('created_at', { ascending: false }));
  return res.ok ? { ok: true, data: res.data.map(mapApplication) } : res;
}

export async function getMyApplication(id: string): Promise<ApiResult<Application | null>> {
  const res = await guard<ApplicationRow | null>(() =>
    supabase.from('applications').select(APPLICATION_SELECT).eq('id', id).maybeSingle());
  return res.ok ? { ok: true, data: res.data ? mapApplication(res.data) : null } : res;
}

export async function submitApplication(input: {
  serviceId: ServiceType;
  applicants: ApplicantInput[];
  documents: (UploadedFile & { applicantIndex: number })[];
  serviceFee: number;
  governmentFee: number;
}): Promise<ApiResult<{ id: string; referenceCode: string }>> {
  const res = await guard<{ id: string; reference_code: string }>(() =>
    supabase.rpc('submit_application', {
      p_service_id: input.serviceId,
      p_applicants: input.applicants.map(toApplicantPayload),
      p_documents: input.documents.map(toDocumentPayload),
      p_service_fee: input.serviceFee,
      p_government_fee: input.governmentFee,
    }));
  return res.ok ? { ok: true, data: { id: res.data.id, referenceCode: res.data.reference_code } } : res;
}

export async function resubmitApplication(input: {
  applicationId: string;
  applicants: (ApplicantInput & { id: string })[];
  documents: (UploadedFile & { applicantId: string })[];
  note?: string;
}): Promise<ApiResult<{ id: string; status: ApplicationStatus }>> {
  return guard(() =>
    supabase.rpc('resubmit_application', {
      p_application_id: input.applicationId,
      p_applicants: input.applicants.map(toApplicantPayload),
      p_documents: input.documents.map(toDocumentPayload),
      p_note: input.note?.trim() || null,
    }));
}

export interface PublicTracking {
  referenceCode: string;
  serviceId: ServiceType;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
  history: { toStatus: ApplicationStatus; createdAt: string }[];
}

/** Public lookup by reference code: status and dates only (no personal data, no review notes). */
export async function trackByReference(reference: string): Promise<ApiResult<PublicTracking | null>> {
  const res = await guard<{
    reference_code: string; service_id: ServiceType; status: ApplicationStatus; created_at: string; updated_at: string;
    history: { to_status: ApplicationStatus; created_at: string }[];
  } | null>(() => supabase.rpc('track_application', { p_reference: reference }));
  if (!res.ok) return res;
  if (!res.data) return { ok: true, data: null };
  const d = res.data;
  return {
    ok: true,
    data: {
      referenceCode: d.reference_code, serviceId: d.service_id, status: d.status,
      createdAt: d.created_at, updatedAt: d.updated_at,
      history: (d.history ?? []).map(h => ({ toStatus: h.to_status, createdAt: h.created_at })),
    },
  };
}

/** Short-lived link to view one of your own private documents (storage policy: owner only). */
export async function getDocumentUrl(storageKey: string, expiresInSeconds = 300): Promise<ApiResult<string>> {
  const res = await guard<{ signedUrl: string }>(() =>
    supabase.storage.from('visa-documents').createSignedUrl(storageKey, expiresInSeconds));
  return res.ok ? { ok: true, data: res.data.signedUrl } : res;
}
