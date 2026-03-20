import { redirect } from "next/navigation";

import { buildRoute } from "@/lib/routes";

type HomeProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** Supabase may redirect PKCE recovery to Site URL root (`/?code=...`); forward to reset page. */
export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const code = params.code;
  const hasCode =
    typeof code === "string" ? code.length > 0 : Array.isArray(code) && code.some(Boolean);

  if (hasCode) {
    const q = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined) continue;
      if (Array.isArray(value)) {
        for (const v of value) {
          if (v !== undefined) q.append(key, v);
        }
      } else {
        q.set(key, value);
      }
    }
    redirect(`/reset-password?${q.toString()}`);
  }

  redirect(buildRoute.login());
}
