"use client";
export const dynamic = 'force-dynamic';

import { useList, useDelete, useNavigation, useCan, useUpdate } from '@refinedev/core';
import { AdminTable } from '@/components/admin/AdminTable';
import { EditIcon, TrashIcon, CheckIcon, XIcon } from '@/components/icons';
import { PageHelp } from "@/components/admin/PageHelp";

interface ServiceCategoryRow {
  id: string;
  name: string;
  label: string;
  display_order: number;
  is_active: boolean;
}

export default function ServiceCategoryList() {
  const { result, query } = useList({
    resource: 'service_categories',
    sorters: [{ field: 'display_order', order: 'asc' }],
    meta: {
      select: 'id,name,label,display_order,is_active',
    },
  });
  const navigation = useNavigation();
  const { mutate: deleteItem } = useDelete();
  const { mutate: updateCategory, mutation: updateMutation } = useUpdate();
  const canEdit = useCan({ resource: 'service_categories', action: 'edit' });
  const canDelete = useCan({ resource: 'service_categories', action: 'delete' });

  const handleEdit = (id: string) => navigation.edit('service_categories', id);
  const handleDelete = (id: string) => {
    if (confirm('آیا از حذف این دسته‌بندی اطمینان دارید؟')) {
      deleteItem({ id, resource: 'service_categories' });
    }
  };
  const handleToggleActive = (id: string, currentActive: boolean) => {
    updateCategory({
      resource: 'service_categories',
      id,
      values: { is_active: !currentActive },
    });
  };
  const handleCreate = () => navigation.create('service_categories');

  const columns = [
    {
      accessorKey: 'name' as keyof ServiceCategoryRow,
      header: 'نام دسته‌بندی',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => (
        <span className="font-medium">{getValue('name') as string}</span>
      ),
    },
    {
      accessorKey: 'label' as keyof ServiceCategoryRow,
      header: 'عنوان نمایش',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => (
        <span>{getValue('label') as string}</span>
      ),
    },
    {
      accessorKey: 'display_order' as keyof ServiceCategoryRow,
      header: 'ترتیب نمایش',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => (
        <span>{getValue('display_order') as number}</span>
      ),
    },
    {
      accessorKey: 'is_active' as keyof ServiceCategoryRow,
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
      cellWithMeta: ({ original }: { original: ServiceCategoryRow }) => (
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
          <button
            onClick={() => handleToggleActive(original.id, original.is_active)}
            disabled={updateMutation.isPending}
            className={`p-1.5 rounded hover:bg-muted transition-colors ${original.is_active ? 'text-green-600 hover:text-green-700' : 'text-gray-400 hover:text-gray-600'}`}
            aria-label={original.is_active ? 'غیرفعال کردن' : 'فعال کردن'}
          >
            {original.is_active ? <CheckIcon className="size-4" /> : <XIcon className="size-4" />}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3"><h1 className="font-display text-2xl font-bold text-foreground">دسته‌بندی‌های خدمت</h1><PageHelp id="service-categories-list" /></div>
          <p className="text-muted-foreground mt-1">مدیریت دسته‌بندی‌های خدمات در کلینیک</p>
        </div>
      </div>

      <AdminTable
        columns={columns}
        data={(result?.data as ServiceCategoryRow[]) || []}
        isLoading={query.isLoading}
        onCreate={handleCreate}
        createLabel="افزودن دسته‌بندی"
      />

      {query.isError && (
        <div className="rounded-app border border-destructive bg-destructive/10 p-4 text-center text-destructive">
          خطا در بارگذاری دسته‌بندی‌های خدمت
        </div>
      )}
    </div>
  );
}
