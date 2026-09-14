"use client";
export const dynamic = 'force-dynamic';

import { useList, useDelete, useNavigation, useCan } from '@refinedev/core';
import { AdminTable } from '@/components/admin/AdminTable';
import { EditIcon, TrashIcon } from '@/components/icons';

interface VaccineRow {
  id: string;
  name: string;
  species_id: string;
  species?: { name: string } | null;
  manufacturer: string | null;
  active: boolean;
}

export default function VaccinesList() {
  const { result, query } = useList({
    resource: 'vaccines',
    sorters: [{ field: 'name', order: 'asc' }],
    pagination: { pageSize: 200 },
    meta: { select: 'id,name,species_id,manufacturer,species:species(name),active' },
  });
  const navigation = useNavigation();
  const { mutate: deleteItem } = useDelete();
  const canEdit = useCan({ resource: 'vaccines', action: 'edit' });
  const canDelete = useCan({ resource: 'vaccines', action: 'delete' });

  const handleEdit = (id: string) => navigation.edit('vaccines', id);
  const handleDelete = (id: string) => {
    if (confirm('آیا از حذف این واکسن اطمینان دارید؟')) {
      deleteItem({ id, resource: 'vaccines' });
    }
  };
  const handleCreate = () => navigation.create('vaccines');

  const columns = [
    {
      accessorKey: 'name' as keyof VaccineRow,
      header: 'نام',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => (
        <span className="font-medium">{getValue('name') as string}</span>
      ),
    },
    {
      accessorKey: 'species_id' as keyof VaccineRow,
      header: 'گونه',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => (
        <span className="px-2 py-1 text-xs rounded-full bg-muted">{(getValue('species') as { name?: string } | null)?.name || '—'}</span>
      ),
    },
    {
      accessorKey: 'manufacturer' as keyof VaccineRow,
      header: 'سازنده',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => (
        <span>{(getValue('manufacturer') as string | null) || '—'}</span>
      ),
    },
    {
      accessorKey: 'active' as keyof VaccineRow,
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
      cellWithMeta: ({ original }: { original: VaccineRow }) => (
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
          <h1 className="font-display text-2xl font-bold text-foreground">مدیریت واکسن‌ها</h1>
          <p className="text-muted-foreground mt-1">کاتالوگ واکسن‌های موجود در کلینیک به تفکیک گونه</p>
        </div>
      </div>

      <AdminTable
        columns={columns}
        data={(result?.data as VaccineRow[]) || []}
        isLoading={query.isLoading}
        onCreate={handleCreate}
        createLabel="افزودن واکسن"
      />

      {query.isError && (
        <div className="rounded-app border border-destructive bg-destructive/10 p-4 text-center text-destructive">
          خطا در بارگذاری واکسن‌ها
        </div>
      )}
    </div>
  );
}