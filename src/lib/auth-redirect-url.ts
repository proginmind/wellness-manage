/**
 * Canonical public origin for auth-related redirects (password reset, OAuth, etc.).
 *
 * Prefer `NEXT_PUBLIC_APP_URL` so emails and Supabase redirects use the deployment’s
 * public URL (staging vs production). If unset, falls back to the browser origin
 * (local dev).
 *
 * Supabase must allowlist the full redirect URL (e.g. `https://staging.example.com/reset-password`).
 */
export function getPasswordResetRedirectUrl(): string {
  const envBase = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");
  if (envBase) {
    return `${envBase}/reset-password`;
  }
  if (typeof window !== "undefined") {
    return `${window.location.origin}/reset-password`;
  }
  return "/reset-password";
}
