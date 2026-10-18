import type { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';
import type { User } from '../types';
import { isAdminEmail } from '../config/admin';
import { usedEmailOtp } from './session';
import {
  AUTH_MESSAGES,
  interpretSignUpResponse,
  translateAuthError,
  type AuthErrorLike,
  type AuthMessage,
  type SignUpResult,
} from './authErrors';

export type { AuthMessage, SignUpResult };
/**
 * Step 1 result. Admin accounts get `otpRequired`: they are NOT signed in yet, a one-time code was emailed
 * and must be entered (step 2) before the session is granted.
 */
export type SignInResult =
  | { ok: true; user: User }
  | { ok: true; otpRequired: true; email: string }
  | { ok: false; message: AuthMessage };
export type OtpResult = { ok: true; user: User } | { ok: false; message: AuthMessage };
export type ResendResult = { ok: true } | { ok: false; message: AuthMessage };

/**
 * Where Supabase sends the user after they click the confirmation link.
 * The app uses HashRouter, so we redirect to the site root (without a "#/route" part):
 * Supabase appends the session tokens to the URL hash, and supabase-js reads and clears them on load.
 * This URL must be listed under Authentication > URL Configuration > Redirect URLs in the Supabase dashboard.
 */
const confirmationRedirectUrl = () => `${window.location.origin}${window.location.pathname}`;

const normalizeEmail = (email: string) => email.trim().toLowerCase();

/**
 * Maps a Supabase auth user to the app's User.
 *
 * The role is 'admin' only for a confirmed email that is either in the approved admin list or carries
 * role 'admin' in app_metadata. app_metadata can only be written server-side (service role / dashboard),
 * unlike user_metadata which the user can edit, so user_metadata must never decide privileges.
 */
export function toAppUser(su: SupabaseUser): User {
  const email = su.email ?? '';
  const metaName = su.user_metadata?.full_name;
  const emailConfirmed = !!su.email_confirmed_at;
  const isAdmin = emailConfirmed && (su.app_metadata?.role === 'admin' || isAdminEmail(email));
  return {
    id: su.id,
    email,
    name: typeof metaName === 'string' && metaName.trim() ? metaName.trim() : email.split('@')[0],
    role: isAdmin ? 'admin' : 'customer',
    createdAt: su.created_at,
    isVerified: emailConfirmed,
  };
}

/** Creates the account in Supabase. The user must confirm their email (link sent by Supabase) before signing in. */
export async function signUpWithEmail(input: {
  name: string;
  email: string;
  password: string;
  accountType: 'customer' | 'agency';
}): Promise<SignUpResult> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: normalizeEmail(input.email),
      password: input.password,
      options: {
        emailRedirectTo: confirmationRedirectUrl(),
        // Stored only as a request flag for the agency review; it does not grant any role
        data: { full_name: input.name.trim(), requested_account_type: input.accountType },
      },
    });

    // If the project does not require email confirmation Supabase returns a live session: end it,
    // because the account must not be usable before the email is confirmed.
    if (!error && data?.session) {
      await supabase.auth.signOut({ scope: 'local' });
    }

    return interpretSignUpResponse(error, data);
  } catch (err) {
    return { ok: false, message: translateAuthError(err as AuthErrorLike) };
  }
}

/** Is this (password-authenticated) account an admin? The database answers; the client list is a fallback. */
async function isAdminAccount(su: SupabaseUser): Promise<boolean> {
  const clientSide = su.app_metadata?.role === 'admin' || isAdminEmail(su.email);
  try {
    const { data, error } = await supabase.rpc('is_admin_account');
    if (!error && typeof data === 'boolean') return data || clientSide;
  } catch {
    // fall through to the client-side answer
  }
  return clientSide;
}

/** Emails a fresh 6-digit code. Never creates an account (shouldCreateUser: false). */
export async function sendAdminOtp(email: string): Promise<ResendResult> {
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email: normalizeEmail(email),
      options: { shouldCreateUser: false },
    });
    if (error) return { ok: false, message: translateAuthError(error) };
    return { ok: true };
  } catch (err) {
    return { ok: false, message: translateAuthError(err as AuthErrorLike) };
  }
}

/**
 * Step 1: email + password.
 * Regular users are signed in right away. For admins the password session is discarded and a fresh email
 * code is sent: access is granted only by verifyAdminOtp (step 2), on every login.
 */
export async function signInWithEmail(email: string, password: string): Promise<SignInResult> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizeEmail(email),
      password,
    });
    if (error) return { ok: false, message: translateAuthError(error) };

    // Belt and braces: never keep a session for an unconfirmed email
    if (!data.user?.email_confirmed_at) {
      await supabase.auth.signOut({ scope: 'local' });
      return { ok: false, message: AUTH_MESSAGES.emailNotConfirmed };
    }

    if (await isAdminAccount(data.user)) {
      const adminEmail = data.user.email ?? normalizeEmail(email);
      // Drop the password-only session: it must not unlock anything on its own
      await supabase.auth.signOut({ scope: 'local' });
      const sent = await sendAdminOtp(adminEmail);
      if (!sent.ok) return sent;
      return { ok: true, otpRequired: true, email: adminEmail };
    }

    return { ok: true, user: toAppUser(data.user) };
  } catch (err) {
    return { ok: false, message: translateAuthError(err as AuthErrorLike) };
  }
}

/** Step 2: checks the emailed code. The resulting session is the one the admin dashboard accepts. */
export async function verifyAdminOtp(email: string, code: string): Promise<OtpResult> {
  const token = code.replace(/\s+/g, '');
  if (!/^\d{6,8}$/.test(token)) return { ok: false, message: AUTH_MESSAGES.otpFormat };

  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email: normalizeEmail(email),
      token,
      type: 'email',
    });
    if (error) return { ok: false, message: translateAuthError(error) };

    const user = data.user;
    const accessToken = data.session?.access_token;
    if (!user || !accessToken || !usedEmailOtp(accessToken)) {
      await supabase.auth.signOut({ scope: 'local' });
      return { ok: false, message: AUTH_MESSAGES.otpSessionMissing };
    }
    if (!(await isAdminAccount(user))) {
      await supabase.auth.signOut({ scope: 'local' });
      return { ok: false, message: AUTH_MESSAGES.notAdmin };
    }

    return { ok: true, user: { ...toAppUser(user), role: 'admin' } };
  } catch (err) {
    return { ok: false, message: translateAuthError(err as AuthErrorLike) };
  }
}

/** Sends the confirmation email again (used by the "Resend" button after sign-up). */
export async function resendConfirmationEmail(email: string): Promise<ResendResult> {
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: normalizeEmail(email),
      options: { emailRedirectTo: confirmationRedirectUrl() },
    });
    if (error) return { ok: false, message: translateAuthError(error) };
    return { ok: true };
  } catch (err) {
    return { ok: false, message: translateAuthError(err as AuthErrorLike) };
  }
}

export async function signOutLocal(): Promise<void> {
  try {
    await supabase.auth.signOut({ scope: 'local' });
  } catch {
    // Nothing else to do: the UI is already logged out
  }
}
