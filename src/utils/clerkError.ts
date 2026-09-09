interface ClerkLikeError {
  errors?: { message?: string; longMessage?: string }[];
  longMessage?: string;
  message?: string;
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
