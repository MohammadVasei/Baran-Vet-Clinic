import { toJalaali } from 'jalaali-js';
import { addDays, addMonths, addWeeks, addYears } from 'date-fns';

/**
 * Animal medical log — domain helpers shared by the admin and user panels.
 * Pure functions only (no supabase imports) so they are safe in any context.
 */

export const ANIMAL_STATUSES = ['active', 'deceased', 'transferred', 'archived'] as const;
export type AnimalStatus = (typeof ANIMAL_STATUSES)[number];

export const ANIMAL_SEXES = ['male', 'female', 'unknown'] as const;
export type AnimalSex = (typeof ANIMAL_SEXES)[number];

export const ANIMAL_STATUS_LABELS: Record<AnimalStatus, string> = {
  active: 'فعال',
  deceased: 'درگذشته',
  transferred: 'انتقال‌یافته',
  archived: 'بایگانی‌شده',
};

export const ANIMAL_STATUS_STYLES: Record<AnimalStatus, string> = {
  active: 'bg-green-100 text-green-700',
  deceased: 'bg-gray-100 text-gray-700',
  transferred: 'bg-blue-100 text-blue-700',
  archived: 'bg-yellow-100 text-yellow-700',
};

export const ANIMAL_SEX_LABELS: Record<AnimalSex, string> = {
  male: 'نر',
  female: 'ماده',
  unknown: 'نامشخص',
};

const JALALI_MONTHS = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند',
];

/** Format a Date as a Jalali date, e.g. «۳۰ مرداد ۱۴۰۵». */
export function formatJalaliDate(date: Date | string | null): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return '—';
  const { jy, jm, jd } = toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate());
  return `${jd} ${JALALI_MONTHS[jm - 1]} ${jy}`;
}

/** Human age from a birth date; returns '—' when the birth date is unknown. */
export function getAnimalAge(dateOfBirth: string | null): string {
  if (!dateOfBirth) return 'نامشخص';
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return 'نامشخص';
  const now = new Date();
  let years = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
    years -= 1;
  }
  if (years < 0) years = 0;
  if (years >= 1) return `${new Intl.NumberFormat('fa-IR').format(years)} سال`;
  const months = Math.max(0, Math.floor((now.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24 * 30)));
  if (months >= 1) return `${new Intl.NumberFormat('fa-IR').format(months)} ماه`;
  const days = Math.max(0, Math.floor((now.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24)));
  return `${new Intl.NumberFormat('fa-IR').format(days)} روز`;
}

/** Normalize a microchip number / phone to digits (used for lookups). */
export function normalizeDigits(value: string | null | undefined): string {
  return (value || '').replace(/\D/g, '');
}

export const MEDICAL_RECORD_TYPES = [
  'examination', 'vaccination', 'treatment', 'procedure', 'surgery',
  'medication', 'deworming', 'diagnosis', 'laboratory', 'dental', 'other',
] as const;

export const MEDICAL_RECORD_TYPE_LABELS: Record<string, string> = {
  examination: 'معاینه',
  vaccination: 'واکسیناسیون',
  treatment: 'درمان',
  procedure: 'انجام پروسیجر',
  surgery: 'جراحی',
  medication: 'دارو',
  deworming: 'ضد انگل',
  diagnosis: 'تشخیص',
  laboratory: 'آزمایشگاه',
  dental: 'دندان‌پزشکی',
  other: 'سایر',
};

export const TREATMENT_CATEGORIES = [
  'preventive', 'vaccination', 'deworming', 'dental', 'dermatology',
  'surgery', 'diagnostic', 'routine', 'other',
] as const;

export const TREATMENT_CATEGORY_LABELS: Record<string, string> = {
  preventive: 'پیشگیری',
  vaccination: 'واکسیناسیون',
  deworming: 'ضد انگل',
  dental: 'دندان‌پزشکی',
  dermatology: 'پوست',
  surgery: 'جراحی',
  diagnostic: 'تشخیص',
  routine: 'معاینه روتین',
  other: 'سایر',
};

export const VISIT_STATUSES = ['scheduled', 'in_progress', 'completed', 'cancelled', 'no_show'] as const;

export const VISIT_STATUS_LABELS: Record<string, string> = {
  scheduled: 'برنامه‌ریزی‌شده',
  in_progress: 'در حال انجام',
  completed: 'تکمیل‌شده',
  cancelled: 'لغوشده',
  no_show: 'عدم مراجعه',
};

export const REMINDER_TYPES = ['vaccination', 'deworming', 'checkup', 'medication', 'treatment', 'other'] as const;

export const REMINDER_TYPE_LABELS: Record<string, string> = {
  vaccination: 'واکسیناسیون',
  deworming: 'ضد انگل',
  checkup: 'معاینه دوره‌ای',
  medication: 'دارو',
  treatment: 'درمان',
  other: 'سایر',
};

export const REMINDER_STATUSES = ['pending', 'due', 'overdue', 'completed', 'cancelled'] as const;

export const REMINDER_STATUS_LABELS: Record<string, string> = {
  pending: 'در انتظار',
  due: 'نزدیک موعد',
  overdue: 'گذشته از موعد',
  completed: 'تکمیل‌شده',
  cancelled: 'لغوشده',
};

export const REMINDER_PRIORITY_LABELS: Record<string, string> = {
  normal: 'عادی',
  important: 'مهم',
  urgent: 'فوری',
};

export const REMINDER_INTERVAL_UNITS = ['days', 'weeks', 'months', 'years'] as const;
export type ReminderIntervalUnit = (typeof REMINDER_INTERVAL_UNITS)[number];

export const REMINDER_INTERVAL_UNIT_LABELS: Record<ReminderIntervalUnit, string> = {
  days: 'روز',
  weeks: 'هفته',
  months: 'ماه',
  years: 'سال',
};

/** Quick-pick presets for the config form. */
export const REMINDER_INTERVAL_PRESETS: { value: number; unit: ReminderIntervalUnit; label: string }[] = [
  { value: 1, unit: 'months', label: '۱ ماه' },
  { value: 3, unit: 'months', label: '۳ ماه' },
  { value: 6, unit: 'months', label: '۶ ماه' },
  { value: 12, unit: 'months', label: '۱۲ ماه' },
  { value: 21, unit: 'days', label: '۲۱ روز' },
  { value: 1, unit: 'years', label: '۱ سال' },
  { value: 2, unit: 'years', label: '۲ سال' },
];

/** Human-readable interval, e.g. { value: 3, unit: 'months' } → «۳ ماه». */
export function formatReminderInterval(
  value: number | null | undefined,
  unit: ReminderIntervalUnit | string | null | undefined
): string {
  if (value == null || value <= 0) return '—';
  const unitLabel = REMINDER_INTERVAL_UNIT_LABELS[unit as ReminderIntervalUnit] || String(unit);
  return `${new Intl.NumberFormat('fa-IR').format(value)} ${unitLabel}`;
}

/**
 * Calculate the next reminder/due date for a periodic treatment.
 *
 * Uses the actual administration date and the configured interval, applying
 * proper calendar arithmetic so month/year arithmetic keeps "same day" instead
 * of fixed day-counts. Month-end edge cases (Jan 31 + 1 month → Feb 28/29),
 * leap years and year boundaries are handled by date-fns.
 *
 * Returns a Date (midnight UTC) or null when the interval is invalid.
 */
export function calculateNextReminderDate(
  administeredDate: Date | string,
  intervalValue: number | null | undefined,
  intervalUnit: ReminderIntervalUnit | string | null | undefined
): Date | null {
  const base =
    typeof administeredDate === 'string' ? new Date(`${administeredDate}T00:00:00.000Z`) : administeredDate;
  if (Number.isNaN(base.getTime())) return null;
  if (intervalValue == null || intervalValue <= 0) return null;

  switch (intervalUnit) {
    case 'days':
      return addDays(base, intervalValue);
    case 'weeks':
      return addWeeks(base, intervalValue);
    case 'months':
      return addMonths(base, intervalValue);
    case 'years':
      return addYears(base, intervalValue);
    default:
      return null;
  }
}