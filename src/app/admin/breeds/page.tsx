"use client";
export const dynamic = 'force-dynamic';

import { useList, useDelete, useNavigation, useCan } from '@refinedev/core';
import { AdminTable } from '@/components/admin/AdminTable';
import { EditIcon, TrashIcon } from '@/components/icons';

interface BreedRow {
  id: string;
  name: string;
  species_id: string;
  species?: { name: string } | null;
  active: boolean;
}

export default function BreedsList() {
  const { result, query } = useList({
    resource: 'breeds',
    sorters: [{ field: 'name', order: 'asc' }],
    pagination: { pageSize: 100 },
    meta: { select: 'id,name,species_id,species:species(name),active' },
  });
  const navigation = useNavigation();
  const { mutate: deleteItem } = useDelete();
  const canEdit = useCan({ resource: 'breeds', action: 'edit' });
  const canDelete = useCan({ resource: 'breeds', action: 'delete' });

  const handleEdit = (id: string) => navigation.edit('breeds', id);
  const handleDelete = (id: string) => {
    if (confirm('آیا از حذف این نژاد اطمینان دارید؟ در صورت وجود حیوان با این نژاد، حذف ممکن نیست.')) {
      deleteItem({ id, resource: 'breeds' });
    }
  };
  const handleCreate = () => navigation.create('breeds');

  const columns = [
    {
      accessorKey: 'name' as keyof BreedRow,
      header: 'نام',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => (
        <span className="font-medium">{getValue('name') as string}</span>
      ),
    },
    {
      accessorKey: 'species_id' as keyof BreedRow,
      header: 'گونه',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => (
        <span className="px-2 py-1 text-xs rounded-full bg-muted">{(getValue('species') as { name?: string } | null)?.name || '—'}</span>
      ),
    },
    {
      accessorKey: 'active' as keyof BreedRow,
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
      cellWithMeta: ({ original }: { original: BreedRow }) => (
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
          <h1 className="font-display text-2xl font-bold text-foreground">مدیریت نژادها</h1>
          <p className="text-muted-foreground mt-1">نژادهای هر گونه؛ بدون نیاز به تغییر کد قابل افزودن هستند.</p>
        </div>
      </div>

      <AdminTable
        columns={columns}
        data={(result?.data as BreedRow[]) || []}
        isLoading={query.isLoading}
        onCreate={handleCreate}
        createLabel="افزودن نژاد"
      />

      {query.isError && (
        <div className="rounded-app border border-destructive bg-destructive/10 p-4 text-center text-destructive">
          خطا در بارگذاری نژادها
        </div>
      )}
    </div>
  );
}