import type { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';
import type { User } from '../types';
import { isAdminEmail } from '../config/admin';
import {
  AUTH_MESSAGES,
  interpretSignUpResponse,
  translateAuthError,
  type AuthErrorLike,
  type AuthMessage,
  type SignUpResult,
} from './authErrors';

export type { AuthMessage, SignUpResult };
export type SignInResult = { ok: true; user: User } | { ok: false; message: AuthMessage };
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

    return { ok: true, user: toAppUser(data.user) };
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
