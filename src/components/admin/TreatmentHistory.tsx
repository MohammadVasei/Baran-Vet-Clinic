"use client";

import { useList } from '@refinedev/core';
import { AdminTable } from '@/components/admin/AdminTable';
import {
  MEDICAL_RECORD_TYPE_LABELS,
  REMINDER_STATUS_LABELS,
  REMINDER_STATUSES,
  formatJalaliDate,
} from '@/lib/animals';

interface TreatmentHistoryRecord {
  id: string;
  type: string;
  title: string;
  performed_at: string;
  next_reminder_date: string | null;
  vaccine?: { id: string; name: string } | null;
  treatment_type?: { id: string; name: string } | null;
  doctor?: { id: string; name: string } | null;
  reminders?: { id: string; status: string }[] | null;
}

interface TreatmentHistoryProps {
  animalId: string;
}

const REMINDER_STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  due: 'bg-blue-100 text-blue-700',
  overdue: 'bg-red-100 text-red-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-700',
};

/**
 * The animal's treatment/vaccination history. Rows are medical_records
 * belonging to the animal, showing the linked treatment definition, the
 * doctor, the performed date and the auto-calculated next reminder date.
 */
export function TreatmentHistory({ animalId }: TreatmentHistoryProps) {
  const { result, query } = useList<TreatmentHistoryRecord>({
    resource: 'medical_records',
    filters: [
      { field: 'animal_id', operator: 'eq', value: animalId },
    ],
    sorters: [{ field: 'performed_at', order: 'desc' }],
    pagination: { pageSize: 200 },
    meta: {
      select: 'id,type,title,performed_at,next_reminder_date,vaccine:vaccines(id,name),treatment_type:treatment_types(id,name),doctor:doctors(id,name),reminders:reminders(id,status)',
    },
  });

  const records = (result?.data as TreatmentHistoryRecord[]) || [];

  const columns = [
    {
      accessorKey: 'performed_at' as keyof TreatmentHistoryRecord,
      header: 'تاریخ',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => (
        <span className="whitespace-nowrap">{formatJalaliDate(getValue('performed_at') as string)}</span>
      ),
    },
    {
      accessorKey: 'type' as keyof TreatmentHistoryRecord,
      header: 'نوع',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => (
        <span className="px-2 py-1 text-xs rounded-full bg-muted">
          {MEDICAL_RECORD_TYPE_LABELS[getValue('type') as string] || getValue('type') as string}
        </span>
      ),
    },
    {
      accessorKey: 'title' as keyof TreatmentHistoryRecord,
      header: 'درمان / واکسن',
      cellWithMeta: ({ getValue, original }: { getValue: (key: string) => unknown; original: TreatmentHistoryRecord }) => {
        const vaccineName = original.vaccine?.name;
        const treatmentName = original.treatment_type?.name;
        const definitionName = vaccineName || treatmentName;
        return (
          <span className="font-medium">
            {definitionName || (getValue('title') as string) || '—'}
          </span>
        );
      },
    },
    {
      accessorKey: 'doctor' as keyof TreatmentHistoryRecord,
      header: 'پزشک',
      cellWithMeta: ({ original }: { original: TreatmentHistoryRecord }) => (
        <span>{original.doctor?.name || '—'}</span>
      ),
    },
    {
      accessorKey: 'reminders' as keyof TreatmentHistoryRecord,
      header: 'وضعیت',
      cellWithMeta: ({ original }: { original: TreatmentHistoryRecord }) => {
        const reminder = original.reminders?.[0];
        if (!reminder) return <span className="text-muted-foreground">—</span>;
        const style = REMINDER_STATUS_STYLES[reminder.status];
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${style || 'bg-gray-100 text-gray-700'}`}>
            {REMINDER_STATUS_LABELS[reminder.status] || reminder.status}
          </span>
        );
      },
    },
    {
      accessorKey: 'next_reminder_date' as keyof TreatmentHistoryRecord,
      header: 'یادآوری بعدی',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => {
        const date = getValue('next_reminder_date') as string | null;
        if (!date) return <span className="text-muted-foreground">—</span>;
        return <span className="whitespace-nowrap font-medium">{formatJalaliDate(date)}</span>;
      },
    },
  ];

  return (
    <AdminTable
      columns={columns}
      data={records}
      isLoading={query.isLoading}
    />
  );
}

export { REMINDER_STATUSES, REMINDER_STATUS_LABELS, REMINDER_STATUS_STYLES };