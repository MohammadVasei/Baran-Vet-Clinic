"use client";
export const dynamic = 'force-dynamic';

import { useList, useDelete, useNavigation, useCan } from '@refinedev/core';
import { AdminTable } from '@/components/admin/AdminTable';
import { EditIcon, TrashIcon } from '@/components/icons';

export function ProductsList() {
  const listResult = useList({
    resource: 'products',
    sorters: [{ field: 'display_order', order: 'asc' }],
    meta: {
      select: 'id,name,description,price_rial,category,images,display_order,is_active,is_featured,created_at,stock_levels(quantity_on_hand,low_stock_threshold)',
    },
  });
  const { result, query } = listResult;
  const navigation = useNavigation();
  const { mutate: deleteItem } = useDelete();

  const canEdit = useCan({ resource: 'products', action: 'edit' });
  const canDelete = useCan({ resource: 'products', action: 'delete' });

  const handleEdit = (id: string) => navigation.edit('products', id);
  const handleDelete = (id: string) => {
    if (confirm('آیا از حذف این محصول اطمینان دارید؟')) {
      deleteItem({ id, resource: 'products' });
    }
  };
  const handleCreate = () => navigation.create('products');

  interface ProductRow {
    id: string;
    name: string;
    description: string | null;
    price_rial: number;
    category: string | null;
    images: string[] | null;
    display_order: number;
    is_active: boolean;
    is_featured: boolean;
    stock_levels?: { quantity_on_hand: number; low_stock_threshold: number } | null;
  }

  const columns = [
    {
      accessorKey: 'name' as keyof ProductRow,
      header: 'نام محصول',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => <span className="font-medium">{getValue('name') as string}</span>,
    },
    {
      accessorKey: 'category' as keyof ProductRow,
      header: 'دسته‌بندی',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => {
        const cat = getValue('category') as string | null;
        const labels: Record<string, string> = {
          food: 'غذا',
          medicine: 'دارو',
          accessories: 'لوازم جانبی',
          grooming: 'شستشو و اصلاح',
        };
        return cat ? <span className="px-2 py-1 text-xs rounded-full bg-muted">{labels[cat] || cat}</span> : <span className="text-muted-foreground">—</span>;
      },
    },
    {
      accessorKey: 'price_rial' as keyof ProductRow,
      header: 'قیمت (ریال)',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => {
        const price = getValue('price_rial') as number;
        return new Intl.NumberFormat('fa-IR').format(price);
      },
    },
    {
      accessorKey: 'images' as keyof ProductRow,
      header: 'تصاویر',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => {
        const imgs = getValue('images') as string[] | null;
        return imgs && imgs.length > 0 ? (
          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">{imgs.length} تصویر</span>
        ) : (
          <span className="text-muted-foreground">بدون تصویر</span>
        );
      },
    },
    {
      accessorKey: 'stock_levels' as keyof ProductRow,
      header: 'موجودی',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => {
        const stock = getValue('stock_levels') as { quantity_on_hand: number; low_stock_threshold: number } | null;
        if (!stock) return <span className="text-muted-foreground">—</span>;
        const { quantity_on_hand, low_stock_threshold } = stock;
        if (quantity_on_hand === 0) {
          return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">ناموجود</span>;
        }
        if (quantity_on_hand <= low_stock_threshold) {
          return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">کم ({quantity_on_hand})</span>;
        }
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">موجود ({quantity_on_hand})</span>;
      },
    },
    {
      accessorKey: 'display_order' as keyof ProductRow,
      header: 'ترتیب',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => <span>{getValue('display_order') as number}</span>,
    },
    {
      accessorKey: 'is_active' as keyof ProductRow,
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
      accessorKey: 'is_featured' as keyof ProductRow,
      header: 'ویژه',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => {
        const featured = getValue('is_featured') as boolean;
        return featured ? (
          <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">ویژه</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    },
    {
      id: 'actions',
      header: 'عملیات',
      cellWithMeta: ({ original }: { original: ProductRow }) => (
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
          <h1 className="font-display text-2xl font-bold text-foreground">مدیریت محصولات</h1>
          <p className="text-muted-foreground mt-1">لیست تمام محصولات پت‌شاپ</p>
        </div>
      </div>

      <AdminTable
        columns={columns}
        data={(result?.data as ProductRow[]) || []}
        isLoading={query.isLoading}
        onCreate={handleCreate}
        createLabel="افزودن محصول"
      />

      {query.isError && (
        <div className="rounded-app border border-destructive bg-destructive/10 p-4 text-center text-destructive">
          خطا در بارگذاری محصولات
        </div>
      )}
    </div>
  );
}

export default ProductsList;