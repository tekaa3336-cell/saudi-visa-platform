// Reads the claims of the Supabase access token (a JWT). Pure functions, no browser or Supabase imports.
//
// The token's "amr" claim lists HOW the session was authenticated, e.g. [{ method: 'otp', timestamp: 1700000000 }].
// The admin dashboard requires an email one-time-code login, and the database policies check the same claim.
// The payload is only decoded (not verified) here: the UI uses it to decide what to show, while the real
// enforcement happens server-side in Postgres (RLS), which receives the verified token.

export interface AmrEntry {
  method: string;
  timestamp?: number;
}

export function decodeJwtPayload(token: string | null | undefined): Record<string, unknown> | null {
  if (!token) return null;
  const part = token.split('.')[1];
  if (!part) return null;
  try {
    const b64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
    const binary = atob(padded); // available in browsers and Node 16+
    const json = decodeURIComponent(
      Array.from(binary, c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join(''),
    );
    const parsed = JSON.parse(json);
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

export function getAuthMethods(token: string | null | undefined): string[] {
  const amr = decodeJwtPayload(token)?.amr;
  if (!Array.isArray(amr)) return [];
  return amr
    .map(entry => (typeof entry === 'string' ? entry : (entry as AmrEntry | null)?.method))
    .filter((m): m is string => typeof m === 'string');
}

/** True when the session came from an email one-time code (or magic link), not only from a password. */
export const usedEmailOtp = (token: string | null | undefined): boolean =>
  getAuthMethods(token).some(m => m === 'otp' || m === 'magiclink');
