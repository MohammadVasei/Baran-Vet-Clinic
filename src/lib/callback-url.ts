export function safeCallbackUrl(url: string | undefined | null, fallback = "/account"): string {
  if (!url || url.length === 0 || url.length > 1000) return fallback;
  if (!url.startsWith("/")) return fallback;
  if (url.startsWith("//") || url.startsWith("/\\")) return fallback;
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(url)) return fallback;
  return url;
}