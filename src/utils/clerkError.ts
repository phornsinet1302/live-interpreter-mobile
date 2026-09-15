interface ClerkLikeError {
  errors?: { message?: string; longMessage?: string; code?: string }[];
  longMessage?: string;
  message?: string;
  code?: string;
}

/**
 * Clerk's classic APIs throw `{ errors: [{ message, longMessage }] }`; the
 * newer signals-based "future" APIs (`signIn.password()`, etc.) instead
 * resolve `{ error: ClerkError }` where `ClerkError` has its own
 * `message`/`longMessage`. This handles both shapes.
 */
export function clerkErrorMessage(err: unknown, fallback = 'Something went wrong.'): string {
  if (!err) return fallback;
  const e = err as ClerkLikeError;
  return e?.errors?.[0]?.longMessage || e?.errors?.[0]?.message || e?.longMessage || e?.message || fallback;
}

/**
 * Detects Clerk's "you're already signed in" rejection. This happens when
 * the device holds a session Clerk's API still considers valid, but this
 * app's own reactive auth state (useAuth().isAuthenticated) hasn't picked it
 * up — a genuinely stuck/orphaned local session, not just a UI bug. There's
 * no dedicated error code exposed for it across Clerk's SDKs, so this
 * matches on the message text Clerk itself uses for the condition.
 */
export function isAlreadySignedInError(message: string): boolean {
  return /already signed in/i.test(message);
}

// Clerk's own wording for these varies ("Password is incorrect", "Couldn't
// find your account", etc.) and can name which field was wrong — a minor
// username-enumeration leak, and inconsistent copy either way. Matching on
// the stable `code` (not the message text) lets a wrong email and a wrong
// password both collapse to one plain "wrong email or password" message.
const INVALID_CREDENTIALS_CODES = new Set(['form_password_incorrect', 'form_identifier_not_found']);

export function isInvalidCredentialsError(err: unknown): boolean {
  if (!err) return false;
  const e = err as ClerkLikeError;
  const code = e?.code || e?.errors?.[0]?.code;
  return !!code && INVALID_CREDENTIALS_CODES.has(code);
}
