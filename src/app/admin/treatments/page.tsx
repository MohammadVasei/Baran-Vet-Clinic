"use client";
export const dynamic = 'force-dynamic';

import { useList, useDelete, useNavigation, useCan } from '@refinedev/core';
import { AdminTable } from '@/components/admin/AdminTable';
import { EditIcon, TrashIcon } from '@/components/icons';
import { TREATMENT_CATEGORY_LABELS, formatReminderInterval } from '@/lib/animals';
import { PageHelp } from "@/components/admin/PageHelp";

interface TreatmentRow {
  id: string;
  name: string;
  species_id: string;
  species?: { name: string } | null;
  category: string;
  active: boolean;
  is_periodic: boolean;
  reminder_interval_value: number | null;
  reminder_interval_unit: string | null;
}

export default function TreatmentsList() {
  const { result, query } = useList({
    resource: 'treatment_types',
    sorters: [{ field: 'name', order: 'asc' }],
    pagination: { pageSize: 200 },
    meta: {
      select: 'id,name,species_id,category,species:species(name),active,is_periodic,reminder_interval_value,reminder_interval_unit',
    },
  });
  const navigation = useNavigation();
  const { mutate: deleteItem } = useDelete();
  const canEdit = useCan({ resource: 'treatment_types', action: 'edit' });
  const canDelete = useCan({ resource: 'treatment_types', action: 'delete' });

  const handleEdit = (id: string) => navigation.edit('treatment_types', id);
  const handleDelete = (id: string) => {
    if (confirm('آیا از حذف این نوع درمان اطمینان دارید؟')) {
      deleteItem({ id, resource: 'treatment_types' });
    }
  };
  const handleCreate = () => navigation.create('treatment_types');

  const columns = [
    {
      accessorKey: 'name' as keyof TreatmentRow,
      header: 'نام',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => (
        <span className="font-medium">{getValue('name') as string}</span>
      ),
    },
    {
      accessorKey: 'species_id' as keyof TreatmentRow,
      header: 'گونه',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => (
        <span className="px-2 py-1 text-xs rounded-full bg-muted">{(getValue('species') as { name?: string } | null)?.name || '—'}</span>
      ),
    },
    {
      accessorKey: 'category' as keyof TreatmentRow,
      header: 'دسته‌بندی',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => {
        const category = getValue('category') as string;
        return <span className="px-2 py-1 text-xs rounded-full bg-muted">{TREATMENT_CATEGORY_LABELS[category] || category}</span>;
      },
    },
    {
      accessorKey: 'is_periodic' as keyof TreatmentRow,
      header: 'دوره‌ای',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => {
        const periodic = getValue('is_periodic') as boolean;
        if (!periodic) return <span className="text-muted-foreground">—</span>;
        const value = getValue('reminder_interval_value') as number | null;
        const unit = getValue('reminder_interval_unit') as string | null;
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
            هر {formatReminderInterval(value, unit)}
          </span>
        );
      },
    },
    {
      accessorKey: 'active' as keyof TreatmentRow,
      header: 'وضعیت',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => {
        const active = getValue('active') as boolean;
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {active ? 'فعال' : 'غیرفعال'}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: 'عملیات',
      cellWithMeta: ({ original }: { original: TreatmentRow }) => (
        <div className="flex items-center gap-2">
          {canEdit.data && (
            <button onClick={() => handleEdit(original.id)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" aria-label="ویرایش">
              <EditIcon className="size-4" />
            </button>
          )}
          {canDelete.data && (
            <button onClick={() => handleDelete(original.id)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-destructive transition-colors" aria-label="حذف">
              <TrashIcon className="size-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3"><h1 className="font-display text-2xl font-bold text-foreground">انواع درمان</h1><PageHelp id="treatments-list" /></div>
          <p className="text-muted-foreground mt-1">کاتالوگ انواع درمان و خدمات پزشکی قابل انجام در کلینیک</p>
        </div>
      </div>

      <AdminTable
        columns={columns}
        data={(result?.data as TreatmentRow[]) || []}
        isLoading={query.isLoading}
        onCreate={handleCreate}
        createLabel="افزودن نوع درمان"
      />

      {query.isError && (
        <div className="rounded-app border border-destructive bg-destructive/10 p-4 text-center text-destructive">
          خطا در بارگذاری انواع درمان
        </div>
      )}
    </div>
  );
}