import { Session } from "@supabase/supabase-js";

const projectRef = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "")
  .replace("https://", "")
  .split(".")[0];

export const AUTH_COOKIE_NAME = `sb-${projectRef}-auth-token`;

function encodeBase64Url(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function setAuthCookie(session: Session | null): void {
  if (typeof document === "undefined") return;
  if (!session || !session.access_token) {
    document.cookie = `${AUTH_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
    return;
  }
  // @supabase/ssr expects `base64-` + base64url(JSON) so its storage adapter
  // decodes the cookie back to a JSON string before parsing.
  const payload = "base64-" + encodeBase64Url(JSON.stringify(session));
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${AUTH_COOKIE_NAME}=${payload}; Path=/; Max-Age=${session.expires_in}; SameSite=Lax${secure}`;
}