export function digitsOnly(value: string | null | undefined): string {
  return (value || "").replace(/\D/g, "");
}

/**
 * Canonicalizes any dialing style (0-prefixed, +98, 98-prefixed, or bare
 * 10-digit) into the local Iranian form: `0` + last 10 digits.
 *
 * Examples:
 *   "09151135878" -> "09151135878"
 *   "+989151135878" -> "09151135878"
 *   "989151135878" -> "09151135878"
 *   "9151135878" -> "09151135878"
 */
export function canonicalIranianPhone(value: string | null | undefined): string {
  let d = digitsOnly(value);
  if (d.startsWith("98")) d = d.slice(2);
  if (d.startsWith("0")) d = d.slice(1);
  return "0" + d.slice(-10);
}