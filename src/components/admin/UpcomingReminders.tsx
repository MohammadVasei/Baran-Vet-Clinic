"use client";

import { useList } from '@refinedev/core';
import {
  formatJalaliDate,
  formatJalaliTime,
  REMINDER_PRIORITY_LABELS,
  REMINDER_STATUS_LABELS,
  REMINDER_TYPE_LABELS,
} from '@/lib/animals';
import { canonicalIranianPhone } from '@/lib/phone';

interface ReminderRow {
  id: string;
  animal_id: string;
  type: string;
  title: string;
  due_date: string;
  due_time: string | null;
  status: string;
  priority: string;
  animal_name: string | null;
  species_name: string | null;
  breed_name: string | null;
  animal_sex: string | null;
  owner_name: string | null;
  owner_phone: string | null;
  vaccine_name: string | null;
  treatment_name: string | null;
}

interface UpcomingRemindersProps {
  animalId?: string;
  limit?: number;
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  due: 'bg-blue-100 text-blue-700',
  overdue: 'bg-red-100 text-red-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-700',
};

const PRIORITY_STYLES: Record<string, string> = {
  normal: 'bg-muted text-muted-foreground',
  important: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

function telHref(phone: string | null | undefined): string {
  if (!phone) return '';
  let d = String(phone).replace(/\D/g, '');
  if (d.startsWith('98')) d = d.slice(2);
  if (d.startsWith('0')) d = d.slice(1);
  return `tel:+98${d}`;
}

/**
 * Shows upcoming/due/overdue care reminders as a table with the owner
 * (customer), their phone, the animal, the treatment/vaccine and the exact
 * due date + time. When `animalId` is given it shows only that animal's
 * reminders (used on the animal detail page); otherwise it lists reminders
 * for all animals (used on the clinic reminders page).
 *
 * Reads the staff-only `reminders_with_details` view, which resolves the
 * owner's name/phone and the animal's species/breed in a single query.
 */
export function UpcomingReminders({ animalId, limit }: UpcomingRemindersProps) {
  const filters: Array<{ field: string; operator: 'eq' | 'ne'; value: unknown }> = [];
  if (animalId) filters.push({ field: 'animal_id', operator: 'eq', value: animalId });
  filters.push({ field: 'status', operator: 'ne', value: 'completed' });
  filters.push({ field: 'status', operator: 'ne', value: 'cancelled' });

  const { result, query } = useList<ReminderRow>({
    resource: 'reminders_with_details',
    filters,
    sorters: [
      { field: 'due_date', order: 'asc' },
      { field: 'due_time', order: 'asc' },
    ],
    pagination: { pageSize: limit || 100 },
  });

  const reminders = (result?.data as unknown as ReminderRow[]) || [];

  if (query.isLoading) {
    return <div className="p-6 text-center text-muted-foreground">در حال بارگذاری یادآوری‌ها...</div>;
  }

  if (reminders.length === 0) {
    return (
      <div className="rounded-app-lg border border-border bg-surface p-6 text-center text-muted-foreground">
        یادآوری در انتظاری وجود ندارد.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-app-lg border border-border bg-surface">
      <table className="w-full" role="table">
        <thead className="bg-muted/50">
          <tr className="border-b border-border">
            <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">صاحب / تلفن</th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">حیوان</th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">درمان / واکسن</th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">نوع</th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">موعد</th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">اولویت</th>
            <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">وضعیت</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {reminders.map((reminder) => {
            const definitionName = reminder.vaccine_name || reminder.treatment_name || reminder.title;
            const statusStyle = STATUS_STYLES[reminder.status] || 'bg-gray-100 text-gray-700';
            const priorityStyle = PRIORITY_STYLES[reminder.priority] || 'bg-muted text-muted-foreground';
            const displayPhone = canonicalIranianPhone(reminder.owner_phone);
            return (
              <tr key={reminder.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-4 py-3">
                  {reminder.owner_name ? (
                    <div className="font-medium text-foreground">{reminder.owner_name}</div>
                  ) : null}
                  {displayPhone && (
                    <a
                      href={telHref(reminder.owner_phone)}
                      dir="ltr"
                      className={
                        reminder.owner_name
                          ? "mt-0.5 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                          : "font-medium text-foreground hover:underline"
                      }
                    >
                      {displayPhone}
                    </a>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-foreground">{reminder.animal_name || 'حیوان'}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {[reminder.species_name, reminder.breed_name].filter(Boolean).join(' · ') || '—'}
                  </div>
                </td>
                <td className="px-4 py-3 font-medium">{definitionName}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 text-xs rounded-full bg-muted">
                    {REMINDER_TYPE_LABELS[reminder.type] || reminder.type}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <div className="font-medium text-foreground">
                    {formatJalaliDate(reminder.due_date)}
                  </div>
                  {reminder.due_time && (
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      ساعت {formatJalaliTime(reminder.due_time)}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full whitespace-nowrap ${priorityStyle}`}>
                    {REMINDER_PRIORITY_LABELS[reminder.priority] || reminder.priority}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full whitespace-nowrap ${statusStyle}`}>
                    {REMINDER_STATUS_LABELS[reminder.status] || reminder.status}
                    <span className="sr-only">{reminder.status}</span>
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}