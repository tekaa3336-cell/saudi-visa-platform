import type { User } from '../types';

/**
 * Emails allowed to open the admin dashboard.
 *
 * Set VITE_ADMIN_EMAILS (comma separated) in .env to change them without touching the code.
 * When it is set it REPLACES the default list below.
 *
 * NOTE: this only decides what the UI shows. Real protection of the data has to be enforced on the
 * server (Supabase RLS policies), because anything that runs in the browser can be tampered with.
 */
const DEFAULT_ADMIN_EMAILS = ['tekaa3336@gmail.com'];

const parseEmails = (raw: unknown): string[] =>
  typeof raw === 'string'
    ? raw.split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
    : [];

const fromEnv = parseEmails(import.meta.env?.VITE_ADMIN_EMAILS);

export const ADMIN_EMAILS: string[] = fromEnv.length > 0 ? fromEnv : DEFAULT_ADMIN_EMAILS;

export const isAdminEmail = (email?: string | null): boolean =>
  !!email && ADMIN_EMAILS.includes(email.trim().toLowerCase());

/**
 * Admin = a user whose email is confirmed AND who either has role 'admin'
 * or signed in with one of the approved admin emails.
 */
export const isAdminUser = (
  user: Pick<User, 'email' | 'role' | 'isVerified'> | null | undefined,
): boolean => {
  if (!user || !user.isVerified) return false;
  return user.role === 'admin' || isAdminEmail(user.email);
};
