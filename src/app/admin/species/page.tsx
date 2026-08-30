"use client";
export const dynamic = 'force-dynamic';

import { useList, useDelete, useNavigation, useCan } from '@refinedev/core';
import { AdminTable } from '@/components/admin/AdminTable';
import { EditIcon, TrashIcon } from '@/components/icons';

interface SpeciesRow {
  id: string;
  name: string;
  code: string;
  description: string | null;
  active: boolean;
}

export default function SpeciesList() {
  const { result, query } = useList({
    resource: 'species',
    sorters: [{ field: 'name', order: 'asc' }],
    meta: { select: 'id,name,code,description,active' },
  });
  const navigation = useNavigation();
  const { mutate: deleteItem } = useDelete();
  const canEdit = useCan({ resource: 'species', action: 'edit' });
  const canDelete = useCan({ resource: 'species', action: 'delete' });

  const handleEdit = (id: string) => navigation.edit('species', id);
  const handleDelete = (id: string) => {
    if (confirm('آیا از حذف این گونه اطمینان دارید؟ در صورت وجود نژاد یا حیوان برای این گونه، حذف ممکن نیست.')) {
      deleteItem({ id, resource: 'species' });
    }
  };
  const handleCreate = () => navigation.create('species');

  const columns = [
    {
      accessorKey: 'name' as keyof SpeciesRow,
      header: 'نام',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => (
        <span className="font-medium">{getValue('name') as string}</span>
      ),
    },
    {
      accessorKey: 'code' as keyof SpeciesRow,
      header: 'کد',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => (
        <span dir="ltr" className="text-muted-foreground">{getValue('code') as string}</span>
      ),
    },
    {
      accessorKey: 'description' as keyof SpeciesRow,
      header: 'توضیحات',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => (
        <span>{(getValue('description') as string | null) || '—'}</span>
      ),
    },
    {
      accessorKey: 'active' as keyof SpeciesRow,
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
      cellWithMeta: ({ original }: { original: SpeciesRow }) => (
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
          <h1 className="font-display text-2xl font-bold text-foreground">مدیریت گونه‌ها</h1>
          <p className="text-muted-foreground mt-1">گونه‌های حیوانات حمایت‌شده در کلینیک</p>
        </div>
      </div>

      <AdminTable
        columns={columns}
        data={(result?.data as SpeciesRow[]) || []}
        isLoading={query.isLoading}
        onCreate={handleCreate}
        createLabel="افزودن گونه"
      />

      {query.isError && (
        <div className="rounded-app border border-destructive bg-destructive/10 p-4 text-center text-destructive">
          خطا در بارگذاری گونه‌ها
        </div>
      )}
    </div>
  );
}