"use client";

import { useDelete, useList, useNavigation, useCan } from '@refinedev/core';
import { AdminTable } from '@/components/admin/AdminTable';
import { EditIcon, TrashIcon } from '@/components/icons';
import { PageHelp } from "@/components/admin/PageHelp";

const ANIMAL_LABELS: Record<string, string> = {
  dog: 'سگ',
  cat: 'گربه',
  bird: 'پرنده',
  exotic: 'حیوانات عجیب‌وغریب',
  other: 'سایر',
};

const CATEGORY_LABELS: Record<string, string> = {
  infectious: 'عفونی',
  chronic: 'مزمن',
};

interface DiseaseRow {
  id: string;
  animal_type: string;
  category: string;
  name: string;
  symptoms: string;
  care: string;
  display_order: number;
  is_published: boolean;
}

export default function DiseasesList() {
  const { result, query } = useList<DiseaseRow>({
    resource: 'diseases',
    sorters: [{ field: 'animal_type', order: 'asc' }, { field: 'display_order', order: 'asc' }],
    meta: { select: 'id,animal_type,category,name,symptoms,care,display_order,is_published' },
    pagination: { mode: 'off' },
  });
  const navigation = useNavigation();
  const { mutate: deleteItem } = useDelete();
  const canEdit = useCan({ resource: 'diseases', action: 'edit' });
  const canDelete = useCan({ resource: 'diseases', action: 'delete' });

  const rows = (result?.data || []) as DiseaseRow[];

  const handleDelete = (id: string) => {
    if (confirm('آیا از حذف این بیماری اطمینان دارید؟')) {
      deleteItem({ id, resource: 'diseases' });
    }
  };

  const columns = [
    {
      accessorKey: 'animal_type' as keyof DiseaseRow,
      header: 'حیوان',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => (
        <span className="px-2 py-1 text-xs rounded-full bg-muted">{ANIMAL_LABELS[getValue('animal_type') as string] || ''}</span>
      ),
    },
    {
      accessorKey: 'category' as keyof DiseaseRow,
      header: 'دسته‌بندی',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => {
        const cat = getValue('category') as string;
        return <span className="px-2 py-1 text-xs rounded-full bg-primary-soft text-primary-text">{CATEGORY_LABELS[cat] || cat}</span>;
      },
    },
    {
      accessorKey: 'name' as keyof DiseaseRow,
      header: 'نام بیماری',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => <span className="font-medium">{getValue('name') as string}</span>,
    },
    {
      accessorKey: 'display_order' as keyof DiseaseRow,
      header: 'ترتیب',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => <span>{getValue('display_order') as number}</span>,
    },
    {
      accessorKey: 'is_published' as keyof DiseaseRow,
      header: 'وضعیت',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => {
        const published = getValue('is_published') as boolean;
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${published ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {published ? 'منتشر شده' : 'پیش‌نویس'}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: 'عملیات',
      cellWithMeta: ({ original }: { original: DiseaseRow }) => (
        <div className="flex items-center gap-2">
          {canEdit.data && (
            <button onClick={() => navigation.edit('diseases', original.id)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" aria-label="ویرایش">
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
      <div>
        <div className="flex items-center gap-3"><h1 className="font-display text-2xl font-bold text-foreground">مدیریت بیماری‌ها</h1><PageHelp id="diseases-list" /></div>
        <p className="text-muted-foreground mt-1">مقالات آموزشی دایرةالمعارف بیماری‌های حیوانات</p>
      </div>

      <AdminTable
        columns={columns}
        data={rows}
        isLoading={query.isLoading}
        onCreate={() => navigation.create('diseases')}
        createLabel="افزودن بیماری"
      />

      {query.isError && (
        <div className="rounded-app border border-destructive bg-destructive/10 p-4 text-center text-destructive">
          خطا در بارگذاری بیماری‌ها
        </div>
      )}
    </div>
  );
}