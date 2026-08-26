"use client";
export const dynamic = 'force-dynamic';

import { useList, useDelete, useNavigation, useCan } from '@refinedev/core';
import { AdminTable } from '@/components/admin/AdminTable';
import { EditIcon, TrashIcon } from '@/components/icons';

const reasonLabels: Record<string, string> = {
  holiday: 'تعطیلی',
  absence: 'مرخصی/غیبت',
  maintenance: 'تعمیرات',
  other: 'سایر',
};

const reasonColors: Record<string, string> = {
  holiday: 'bg-blue-100 text-blue-700',
  absence: 'bg-yellow-100 text-yellow-700',
  maintenance: 'bg-gray-100 text-gray-700',
  other: 'bg-purple-100 text-purple-700',
};

export function AvailabilityBlocksList() {
  const listResult = useList({
    resource: 'availability-blocks',
    sorters: [{ field: 'start_at', order: 'desc' }],
    meta: {
      select: 'id,doctor_id,start_at,end_at,reason,description,created_at',
    },
  });
  const { result, query } = listResult;
  const navigation = useNavigation();
  const { mutate: deleteItem } = useDelete();

  const canEdit = useCan({ resource: 'availability-blocks', action: 'edit' });
  const canDelete = useCan({ resource: 'availability-blocks', action: 'delete' });

  const handleEdit = (id: string) => navigation.edit('availability-blocks', id);
  const handleDelete = (id: string) => {
    if (confirm('آیا از حذف این بازه غیرفعال اطمینان دارید؟')) {
      deleteItem({ id, resource: 'availability-blocks' });
    }
  };
  const handleCreate = () => navigation.create('availability-blocks');

  interface AvailabilityBlockRow {
    id: string;
    doctor_id: string;
    start_at: string;
    end_at: string;
    reason: string;
    description: string | null;
    created_at: string;
  }

  const columns = [
    {
      accessorKey: 'doctor_id' as keyof AvailabilityBlockRow,
      header: 'پزشک',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => (
        <span className="font-medium text-muted-foreground">{getValue('doctor_id') as string}</span>
      ),
    },
    {
      accessorKey: 'start_at' as keyof AvailabilityBlockRow,
      header: 'از تاریخ/ساعت',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => {
        const date = getValue('start_at') as string;
        const d = new Date(date);
        return (
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-sm">
              {d.toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              {d.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', hour12: false })}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'end_at' as keyof AvailabilityBlockRow,
      header: 'تا تاریخ/ساعت',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => {
        const date = getValue('end_at') as string;
        const d = new Date(date);
        return (
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-sm">
              {d.toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              {d.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', hour12: false })}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'reason' as keyof AvailabilityBlockRow,
      header: 'دلیل',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => {
        const reason = getValue('reason') as string;
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${reasonColors[reason] || 'bg-gray-100 text-gray-700'}`}>
            {reasonLabels[reason] || reason}
          </span>
        );
      },
    },
    {
      accessorKey: 'description' as keyof AvailabilityBlockRow,
      header: 'توضیحات',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => {
        const desc = getValue('description') as string | null;
        if (!desc) return <span className="text-muted-foreground">—</span>;
        return <span className="max-w-xs truncate block">{desc}</span>;
      },
    },
    {
      accessorKey: 'created_at' as keyof AvailabilityBlockRow,
      header: 'ایجاد شده',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => {
        const date = getValue('created_at') as string;
        return new Date(date).toLocaleDateString('fa-IR', { year: 'numeric', month: 'short', day: 'numeric' });
      },
    },
    {
      id: 'actions',
      header: 'عملیات',
      cellWithMeta: ({ original }: { original: AvailabilityBlockRow }) => (
        <div className="flex items-center gap-2">
          {canEdit.data && <button onClick={() => handleEdit(original.id)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" aria-label="ویرایش"><EditIcon className="size-4" /></button>}
          {canDelete.data && <button onClick={() => handleDelete(original.id)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-destructive transition-colors" aria-label="حذف"><TrashIcon className="size-4" /></button>}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">مدیریت بازه‌های غیرفعال</h1>
          <p className="text-muted-foreground mt-1">لیست تمام بازه‌های زمانی مسدود شده برای پزشکان</p>
        </div>
      </div>

      <AdminTable
        columns={columns}
        data={(result?.data as AvailabilityBlockRow[]) || []}
        isLoading={query.isLoading}
        onCreate={handleCreate}
        createLabel="افزودن بازه غیرفعال"
      />

      {query.isError && (
        <div className="rounded-app border border-destructive bg-destructive/10 p-4 text-center text-destructive">
          خطا در بارگذاری بازه‌های غیرفعال
        </div>
      )}
    </div>
  );
}

export default AvailabilityBlocksList;