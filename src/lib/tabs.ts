/**
 * Roving-tabindex arrow-key movement for horizontal tablists.
 * RTL-aware: in RTL the DOM order mirrors the visual reading direction, so
 * ArrowLeft/ArrowRight map to next/prev accordingly.
 */
export function moveTabFocus<T extends string>(
  keys: readonly T[],
  active: T,
  key: string
): T | null {
  if (keys.length === 0) return null;
  const rtl = typeof document !== "undefined" && document.documentElement.dir === "rtl";
  const dir = (k: string) => {
    if (k === "Home") return keys.length;
    if (k === "End") return -1;
    if (k === "ArrowLeft") return rtl ? 1 : -1;
    if (k === "ArrowRight") return rtl ? -1 : 1;
    return 0;
  };
  const step = dir(key);
  if (step === 0) return null;
  const idx = keys.indexOf(active);
  const next = (idx + step + keys.length) % keys.length;
  return keys[next];
}