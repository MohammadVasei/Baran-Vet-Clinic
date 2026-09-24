"use client";
export const dynamic = 'force-dynamic';

import { useList, useDelete, useNavigation, useCan, useUpdate, useSelect } from '@refinedev/core';
import { AdminTable } from '@/components/admin/AdminTable';
import { EditIcon, TrashIcon, EyeIcon, CheckIcon, XIcon } from '@/components/icons';
import { PageHelp } from "@/components/admin/PageHelp";

export function ServicesList() {
const listResult = useList({
     resource: 'services',
     sorters: [{ field: 'display_order', order: 'asc' }],
     meta: {
       select: 'id,name,description,duration_minutes,price_rial,category,display_order,is_active,created_at,doctor_id,doctor:doctors(*)',
     },
   });
  const { options: serviceCategoryOptions } = useSelect({
    resource: 'service_categories',
    optionLabel: 'label',
    optionValue: 'name',
    filters: [{ field: 'is_active', operator: 'eq', value: true }],
    meta: { select: 'id,name,label,display_order' },
  });
  const categoryLabelMap = new Map<string, string>(serviceCategoryOptions.map((o) => [o.value as string, o.label as string]));
  const { result, query } = listResult;
  const navigation = useNavigation();
  const { mutate: deleteItem } = useDelete();
  const { mutate: updateService, mutation: updateMutation } = useUpdate();

  const canEdit = useCan({ resource: 'services', action: 'edit' });
  const canDelete = useCan({ resource: 'services', action: 'delete' });

  const handleEdit = (id: string) => navigation.edit('services', id);
  const handleShow = (id: string) => navigation.show('services', id);
  const handleDelete = (id: string) => {
    if (confirm('آیا از حذف این خدمت اطمینان دارید؟')) {
      deleteItem({ id, resource: 'services' });
    }
  };
  const handleToggleActive = (id: string, currentActive: boolean) => {
    updateService({
      resource: 'services',
      id,
      values: { is_active: !currentActive },
    });
  };
  const handleCreate = () => navigation.create('services');

interface ServiceRow {
    id: string;
    name: string;
    category: string;
    category_label: string | null; // New field for category label from joined table
    duration_minutes: number;
    price_rial: number | null;
    display_order: number;
    is_active: boolean;
    doctor_id: string | null;
    doctor?: { name: string; role: string } | null;
  }

  const columns = [
    {
      accessorKey: 'name' as keyof ServiceRow,
      header: 'نام',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => <span className="font-medium">{getValue('name') as string}</span>,
    },
    {
      accessorKey: 'category_label' as keyof ServiceRow,
      header: 'دسته‌بندی',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => {
        const label = getValue('category_label') as string | null;
        // Fallback to the category value if label is not available (for backward compatibility)
        const category = getValue('category') as string;
        return <span className="px-2 py-1 text-xs rounded-full bg-muted">{label || category}</span>;
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
      accessorKey: 'doctor_id' as keyof ServiceRow,
      header: 'پزشک مسئول',
cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => (
         <span>
           {(getValue('doctor') as { name?: string; role?: string } | null)?.name || 'تعیین نشده'}
           {(getValue('doctor') as { name?: string; role?: string } | null)?.role && ` - ${(getValue('doctor') as { name?: string; role?: string } | null)?.role}`}
         </span>
       ),
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
          <div className="flex items-center gap-3"><h1 className="font-display text-2xl font-bold text-foreground">مدیریت خدمات</h1><PageHelp id="services-list" /></div>
          <p className="text-muted-foreground mt-1">لیست تمام خدمات کلینیک</p>
        </div>
      </div>

      <AdminTable
        columns={columns}
        data={(result?.data as ServiceRow[])?.map((row) => ({
          ...row,
          category_label: row.category ? (categoryLabelMap.get(row.category) ?? null) : null,
        })) || []}
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
