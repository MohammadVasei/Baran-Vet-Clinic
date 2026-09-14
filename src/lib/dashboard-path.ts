import { supabaseClient } from "@/lib/supabase-client";

export const ACCOUNT_PATH = "/account";
export const ADMIN_PATH = "/admin";
export const STAFF_PATH = "/admin/services";

export function dashboardPathForRole(role: string | null | undefined): string {
  if (role === "owner") return ADMIN_PATH;
  if (role === "staff") return STAFF_PATH;
  return ACCOUNT_PATH;
}

/**
 * Resolves where a signed-in user should land. Staff/owner only override the
 * default customer dashboard; an explicit callbackUrl (e.g. checkout resume)
 * is honored for everyone.
 */
export async function resolvePostLoginUrl(
  userId: string | undefined,
  callbackUrl: string
): Promise<string> {
  if (callbackUrl !== ACCOUNT_PATH || !userId) return callbackUrl;

  const { data: staff } = await supabaseClient
    .from("staff_users")
    .select("role")
    .eq("id", userId)
    .single();

  return dashboardPathForRole(staff?.role ?? null);
}
