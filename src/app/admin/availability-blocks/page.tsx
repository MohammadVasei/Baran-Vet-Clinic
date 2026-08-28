"use client";
export const dynamic = 'force-dynamic';

import { useList, useDelete, useNavigation, useCan } from '@refinedev/core';
import { useMemo } from 'react';
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
  const doctorsQuery = useList({
    resource: 'doctors',
    sorters: [{ field: 'display_order', order: 'asc' }],
    meta: { select: 'id,name,key,is_active' },
    pagination: { mode: 'off' },
  });
  const listResult = useList({
    resource: 'availability_blocks',
    sorters: [{ field: 'start_at', order: 'desc' }],
    meta: {
      select: 'id,doctor_id,start_at,end_at,reason,created_at,doctor:doctors(name)',
    },
    pagination: { mode: 'off' },
  });
  const { result, query } = listResult;
  const navigation = useNavigation();
  const { mutate: deleteItem } = useDelete();

  const canEdit = useCan({ resource: 'availability-blocks', action: 'edit' });
  const canDelete = useCan({ resource: 'availability-blocks', action: 'delete' });

  const handleEdit = (id: string) => navigation.edit('availability-blocks', id);
  const handleDelete = (id: string) => {
    if (confirm('آیا از حذف این بازه غیرفعال اطمینان دارید؟')) {
      deleteItem({ id, resource: 'availability_blocks' });
    }
  };
  const handleCreate = () => navigation.create('availability-blocks');

  const doctors = (doctorsQuery.result?.data || []) as Array<{
    id: string;
    name: string;
    key: string | null;
    is_active: boolean;
  }>;
  const blocks = (result?.data || []) as Array<{
    id: string;
    doctor_id: string;
    start_at: string;
    end_at: string;
    reason: string;
  }>;
  const blocksByDoctor = useMemo(() => {
    return blocks.reduce<Record<string, typeof blocks>>((grouped, block) => {
      grouped[block.doctor_id] = [...(grouped[block.doctor_id] || []), block];
      return grouped;
    }, {});
  }, [blocks]);

  const formatDateTime = (value: string) => {
    const date = new Date(value);
    return `${date.toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' })}، ${date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
  };

  interface AvailabilityBlockRow {
    id: string;
    doctor_id: string;
    doctor?: { name: string } | null;
    start_at: string;
    end_at: string;
    reason: string;
    created_at: string;
  }

  const columns = [
    {
      accessorKey: 'doctor_id' as keyof AvailabilityBlockRow,
      header: 'پزشک',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-medium">{(getValue('doctor') as { name?: string } | null)?.name || 'پزشک نامشخص'}</span>
          <span className="font-mono text-xs text-muted-foreground">{getValue('doctor_id') as string}</span>
        </div>
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

      <section className="space-y-4" aria-labelledby="doctor-availability-heading">
        <div>
          <h2 id="doctor-availability-heading" className="font-display text-xl font-bold text-foreground">برنامه دسترسی پزشکان</h2>
          <p className="mt-1 text-sm text-muted-foreground">ساعت عادی پذیرش: ۹ صبح تا ۲۰:۳۰؛ بازه‌های قرمز در دسترس نیستند.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {doctors.filter((doctor) => doctor.is_active).map((doctor) => {
            const doctorBlocks = blocksByDoctor[doctor.id] || [];
            return (
              <article key={doctor.id} className="rounded-app-lg border border-border bg-surface p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display font-bold text-foreground">{doctor.name}</h3>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">{doctor.key || doctor.id}</p>
                  </div>
                  <span className="rounded-full bg-accent-green-soft px-2 py-1 text-xs font-medium text-accent-green-fg">پذیرش فعال</span>
                </div>
                <div className="mt-4 rounded-app border border-border bg-background/60 p-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">ساعات عادی</span>
                    <span className="font-mono font-medium text-foreground" dir="ltr">09:00 تا 20:30</span>
                  </div>
                  <div className="mt-3 border-t border-border pt-3">
                    <div className="mb-2 text-xs font-medium text-muted-foreground">زمان‌های مسدود شده</div>
                    {doctorBlocks.length > 0 ? (
                      <div className="space-y-2">
                        {doctorBlocks.map((block) => (
                          <div key={block.id} className="rounded-app border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
                            <div className="font-medium">{formatDateTime(block.start_at)}</div>
                            <div className="mt-0.5">تا {formatDateTime(block.end_at)} · {reasonLabels[block.reason] || block.reason}</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">هیچ زمان مسدودی ثبت نشده است.</span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

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