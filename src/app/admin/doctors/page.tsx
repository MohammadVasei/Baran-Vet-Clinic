"use client";
export const dynamic = 'force-dynamic';

import { useList, useDelete, useNavigation, useCan } from '@refinedev/core';
import { AdminTable } from '@/components/admin/AdminTable';
import { EditIcon, TrashIcon, EyeIcon } from '@/components/icons';

export function ServicesList() {
  const listResult = useList({
    resource: 'services',
    sorters: [{ field: 'display_order', order: 'asc' }],
    meta: {
      select: 'id,name,description,duration_minutes,price_rial,category,display_order,is_active,created_at',
    },
  });
  const { result, query } = listResult;
  const navigation = useNavigation();
  const { mutate: deleteItem } = useDelete();

  const canEdit = useCan({ resource: 'services', action: 'edit' });
  const canDelete = useCan({ resource: 'services', action: 'delete' });

  const handleEdit = (id: string) => navigation.edit('services', id);
  const handleShow = (id: string) => navigation.show('services', id);
  const handleDelete = (id: string) => {
    if (confirm('آیا از حذف این خدمت اطمینان دارید؟')) {
      deleteItem({ id, resource: 'services' });
    }
  };
  const handleCreate = () => navigation.create('services');

  interface ServiceRow {
    id: string;
    name: string;
    category: string;
    duration_minutes: number;
    price_rial: number | null;
    display_order: number;
    is_active: boolean;
  }

  const columns = [
    {
      accessorKey: 'name' as keyof ServiceRow,
      header: 'نام',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => <span className="font-medium">{getValue('name') as string}</span>,
    },
    {
      accessorKey: 'category' as keyof ServiceRow,
      header: 'دسته‌بندی',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => {
        const cat = getValue('category') as string;
        const labels: Record<string, string> = {
          darman: 'درمان',
          shenasname: 'شناسنامه',
          grooming: 'شستشو و اصلاح',
          petshop: 'پت‌شاپ',
        };
        return <span className="px-2 py-1 text-xs rounded-full bg-muted">{labels[cat] || cat}</span>;
      },
    },
    {
      accessorKey: 'duration_minutes' as keyof ServiceRow,
      header: 'مدت (دقیقه)',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => <span>{getValue('duration_minutes') as number} دقیقه</span>,
    },
    {
      accessorKey: 'price_rial' as keyof ServiceRow,
      header: 'قیمت (ریال)',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => {
        const price = getValue('price_rial') as number | null;
        return price ? new Intl.NumberFormat('fa-IR').format(price) : '—';
      },
    },
    {
      accessorKey: 'display_order' as keyof ServiceRow,
      header: 'ترتیب',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => <span>{getValue('display_order') as number}</span>,
    },
    {
      accessorKey: 'is_active' as keyof ServiceRow,
      header: 'وضعیت',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => {
        const active = getValue('is_active') as boolean;
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
      cellWithMeta: ({ original }: { original: ServiceRow }) => (
        <div className="flex items-center gap-2">
          <button onClick={() => handleShow(original.id)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" aria-label="مشاهده"><EyeIcon className="size-4" /></button>
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
          <h1 className="font-display text-2xl font-bold text-foreground">مدیریت خدمات</h1>
          <p className="text-muted-foreground mt-1">لیست تمام خدمات کلینیک</p>
        </div>
      </div>

      <AdminTable
        columns={columns}
        data={(result?.data as ServiceRow[]) || []}
        isLoading={query.isLoading}
        onCreate={handleCreate}
        createLabel="افزودن خدمت"
      />

      {query.isError && (
        <div className="rounded-app border border-destructive bg-destructive/10 p-4 text-center text-destructive">
          خطا در بارگذاری خدمات
        </div>
      )}
    </div>
  );
}

export default ServicesList;
