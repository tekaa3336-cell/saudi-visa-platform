// Pure helpers (no imports) for turning Supabase Auth responses into clear Arabic/English messages.

export interface AuthMessage {
  ar: string;
  en: string;
}

export interface AuthErrorLike {
  message?: string;
  code?: string;
  status?: number;
  name?: string;
}

export const AUTH_MESSAGES = {
  invalidCredentials: {
    ar: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
    en: 'Incorrect email or password',
  },
  emailNotConfirmed: {
    ar: 'لم يتم تأكيد بريدك الإلكتروني بعد. انتقل إلى بريدك واضغط على رابط التأكيد ثم سجّل الدخول',
    en: 'Your email is not confirmed yet. Open your inbox, click the confirmation link, then sign in',
  },
  alreadyRegistered: {
    ar: 'هذا البريد الإلكتروني مسجّل بالفعل. جرّب تسجيل الدخول',
    en: 'This email is already registered. Try signing in',
  },
  weakPassword: {
    ar: 'كلمة المرور ضعيفة. استخدم 6 أحرف على الأقل مع مزيج من الأحرف والأرقام',
    en: 'Password is too weak. Use at least 6 characters mixing letters and numbers',
  },
  invalidEmail: {
    ar: 'البريد الإلكتروني غير صحيح',
    en: 'Invalid email address',
  },
  emailRateLimit: {
    ar: 'تم إرسال عدد كبير من رسائل التأكيد. حاول مرة أخرى بعد قليل',
    en: 'Too many emails were sent. Please try again in a little while',
  },
  rateLimit: {
    ar: 'تم تجاوز عدد المحاولات المسموح بها. حاول مرة أخرى بعد قليل',
    en: 'Too many attempts. Please try again in a little while',
  },
  emailNotAuthorized: {
    ar: 'لا يمكن إرسال رسالة التأكيد إلى هذا البريد حالياً. جرّب بريداً آخر أو تواصل مع الدعم',
    en: 'We cannot send a confirmation email to this address right now. Try another email or contact support',
  },
  signupDisabled: {
    ar: 'التسجيل غير متاح حالياً. حاول لاحقاً',
    en: 'Sign-up is currently unavailable. Please try again later',
  },
  userBanned: {
    ar: 'هذا الحساب موقوف. يرجى التواصل مع الدعم',
    en: 'This account is suspended. Please contact support',
  },
  network: {
    ar: 'تعذّر الاتصال بالخادم. تحقق من اتصالك بالإنترنت وحاول مرة أخرى',
    en: 'Could not reach the server. Check your internet connection and try again',
  },
  server: {
    ar: 'حدث خطأ في الخادم. حاول مرة أخرى لاحقاً',
    en: 'A server error occurred. Please try again later',
  },
  emailConfirmationDisabled: {
    ar: 'تم إنشاء الحساب لكن تأكيد البريد الإلكتروني غير مفعّل في إعدادات المنصة، لذلك لم يُرسل رابط التأكيد. يرجى التواصل مع الدعم',
    en: 'The account was created but email confirmation is not enabled on the platform, so no confirmation link was sent. Please contact support',
  },
  unknown: {
    ar: 'حدث خطأ غير متوقع. حاول مرة أخرى',
    en: 'An unexpected error occurred. Please try again',
  },
} satisfies Record<string, AuthMessage>;

/** Converts a Supabase Auth error (or any thrown error) into a bilingual message. */
export function translateAuthError(error: AuthErrorLike | null | undefined): AuthMessage {
  if (!error) return AUTH_MESSAGES.unknown;

  const code = (error.code ?? '').toLowerCase();
  const message = (error.message ?? '').toLowerCase();

  // 1) Stable error codes returned by Supabase Auth
  switch (code) {
    case 'invalid_credentials':
      return AUTH_MESSAGES.invalidCredentials;
    case 'email_not_confirmed':
      return AUTH_MESSAGES.emailNotConfirmed;
    case 'user_already_exists':
    case 'email_exists':
      return AUTH_MESSAGES.alreadyRegistered;
    case 'weak_password':
      return AUTH_MESSAGES.weakPassword;
    case 'email_address_invalid':
    case 'validation_failed':
      return AUTH_MESSAGES.invalidEmail;
    case 'over_email_send_rate_limit':
      return AUTH_MESSAGES.emailRateLimit;
    case 'over_request_rate_limit':
      return AUTH_MESSAGES.rateLimit;
    case 'email_address_not_authorized':
      return AUTH_MESSAGES.emailNotAuthorized;
    case 'signup_disabled':
    case 'email_provider_disabled':
      return AUTH_MESSAGES.signupDisabled;
    case 'user_banned':
      return AUTH_MESSAGES.userBanned;
  }

  // 2) Network failures (supabase-js throws these when the request never reaches the server)
  if (
    error.name === 'AuthRetryableFetchError' ||
    message.includes('failed to fetch') ||
    message.includes('networkerror') ||
    message.includes('network request failed')
  ) {
    return AUTH_MESSAGES.network;
  }

  // 3) Message fallbacks for older Supabase versions that do not send a code
  if (message.includes('invalid login credentials')) return AUTH_MESSAGES.invalidCredentials;
  if (message.includes('email not confirmed')) return AUTH_MESSAGES.emailNotConfirmed;
  if (message.includes('already registered') || message.includes('already been registered')) {
    return AUTH_MESSAGES.alreadyRegistered;
  }
  if (message.includes('password should be at least') || message.includes('weak password')) {
    return AUTH_MESSAGES.weakPassword;
  }
  if (message.includes('email rate limit')) return AUTH_MESSAGES.emailRateLimit;
  if (message.includes('rate limit') || message.includes('too many requests')) return AUTH_MESSAGES.rateLimit;
  if (message.includes('unable to validate email') || message.includes('invalid email')) {
    return AUTH_MESSAGES.invalidEmail;
  }
  if (message.includes('signups not allowed') || message.includes('signup is disabled')) {
    return AUTH_MESSAGES.signupDisabled;
  }

  // 4) HTTP status fallbacks
  if (error.status === 429) return AUTH_MESSAGES.rateLimit;
  if (error.status && error.status >= 500) return AUTH_MESSAGES.server;

  return AUTH_MESSAGES.unknown;
}

export type SignUpResult = { ok: true } | { ok: false; message: AuthMessage };

/**
 * Decides what a Supabase signUp() response means.
 *
 * With "Confirm email" enabled in Supabase, a successful sign-up returns a user but NO session
 * (the session only exists after the user clicks the link in the email).
 */
export function interpretSignUpResponse(
  error: AuthErrorLike | null | undefined,
  data: { user?: { identities?: unknown[] | null } | null; session?: unknown | null } | null | undefined,
): SignUpResult {
  if (error) return { ok: false, message: translateAuthError(error) };

  // With "Confirm email" on, Supabase hides "already registered" by returning a fake user with no identities
  if (data?.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    return { ok: false, message: AUTH_MESSAGES.alreadyRegistered };
  }

  // A session right after sign-up means email confirmation is switched off in the Supabase project
  if (data?.session) {
    return { ok: false, message: AUTH_MESSAGES.emailConfirmationDisabled };
  }

  return { ok: true };
}
