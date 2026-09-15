"use client";

import { useList } from '@refinedev/core';
import { formatJalaliDate, REMINDER_STATUS_LABELS, REMINDER_TYPE_LABELS } from '@/lib/animals';

interface ReminderRow {
  id: string;
  animal_id: string;
  type: string;
  title: string;
  due_date: string;
  status: string;
  priority: string;
  animals?: { id: string; name: string } | null;
  vaccine?: { id: string; name: string } | null;
  treatment_type?: { id: string; name: string } | null;
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

/**
 * Shows upcoming/due/overdue care reminders. When `animalId` is given it shows
 * only that animal's reminders (used on the animal detail page); otherwise it
 * lists reminders for all animals (used on the clinic reminders page).
 */
export function UpcomingReminders({ animalId, limit }: UpcomingRemindersProps) {
  const filters: Array<{ field: string; operator: 'eq' | 'ne' | 'in'; value: unknown }> = [];
  if (animalId) filters.push({ field: 'animal_id', operator: 'eq', value: animalId });
  filters.push({ field: 'status', operator: 'ne', value: 'completed' });
  filters.push({ field: 'status', operator: 'ne', value: 'cancelled' });

  const { result, query } = useList<ReminderRow>({
    resource: 'reminders',
    filters,
    sorters: [{ field: 'due_date', order: 'asc' }],
    pagination: { pageSize: limit || 50 },
    meta: {
      select: 'id,animal_id,type,title,due_date,status,priority,animals:animals(id,name),vaccine:vaccines(id,name),treatment_type:treatment_types(id,name)',
    },
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
    <div className="space-y-2">
      {reminders.map((reminder) => {
        const definitionName = reminder.vaccine?.name || reminder.treatment_type?.name || reminder.title;
        const animalName = reminder.animals?.name || 'حیوان';
        const statusStyle = STATUS_STYLES[reminder.status] || 'bg-gray-100 text-gray-700';
        return (
          <div
            key={reminder.id}
            className="flex items-center justify-between gap-4 rounded-app-lg border border-border bg-surface px-4 py-3"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">{animalName}</span>
                <span className="text-muted-foreground">—</span>
                <span className="font-medium">{definitionName}</span>
                <span className="px-2 py-0.5 text-xs rounded-full bg-muted">
                  {REMINDER_TYPE_LABELS[reminder.type] || reminder.type}
                </span>
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                موعد: <span className="font-medium text-foreground">{formatJalaliDate(reminder.due_date)}</span>
              </div>
            </div>
            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full whitespace-nowrap ${statusStyle}`}>
              {REMINDER_STATUS_LABELS[reminder.status] || reminder.status}
            </span>
          </div>
        );
      })}
    </div>
  );
}