"use client";
export const dynamic = 'force-dynamic';

import { useList, useNavigation, useCan } from '@refinedev/core';
import { AdminTable } from '@/components/admin/AdminTable';
import { EditIcon, AlertCircleIcon, CheckCircleIcon } from '@/components/icons';

export function StockLevelsList() {
  const listResult = useList({
    resource: 'stock_levels',
    sorters: [{ field: 'quantity_on_hand', order: 'asc' }],
    meta: {
      select: 'product_id,quantity_on_hand,low_stock_threshold,updated_at,products(name,price_rial,category,is_active)',
    },
  });
  const { result, query } = listResult;
  const navigation = useNavigation();
  const canEdit = useCan({ resource: 'stock_levels', action: 'edit' });

  const handleEdit = (productId: string) => navigation.edit('stock_levels', productId);
  const handleCreate = () => navigation.create('products');

  interface StockLevelRow {
    id: string;
    product_id: string;
    quantity_on_hand: number;
    low_stock_threshold: number;
    updated_at: string;
    products: { name: string; price_rial: number; category: string | null; is_active: boolean } | null;
  }

  const columns = [
    {
      accessorKey: 'products' as keyof StockLevelRow,
      header: 'محصول',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => {
        const product = getValue('products') as { name: string; is_active: boolean; price_rial: number } | null;
        if (!product) return <span className="text-muted-foreground">—</span>;
        return (
          <div>
            <span className="font-medium">{product.name}</span>
            {!product.is_active && <span className="ml-2 text-xs text-destructive">(غیرفعال)</span>}
          </div>
        );
      },
    },
    {
      accessorKey: 'products' as keyof StockLevelRow,
      header: 'دسته‌بندی',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => {
        const product = getValue('products') as { category: string | null } | null;
        const cat = product?.category;
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
      accessorKey: 'quantity_on_hand' as keyof StockLevelRow,
      header: 'موجودی انبار',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => {
        const qty = getValue('quantity_on_hand') as number;
        return <span className="font-mono font-medium">{qty}</span>;
      },
    },
    {
      accessorKey: 'low_stock_threshold' as keyof StockLevelRow,
      header: 'حد کمبود',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => {
        const threshold = getValue('low_stock_threshold') as number;
        return <span className="font-mono">{threshold}</span>;
      },
    },
    {
      accessorKey: 'quantity_on_hand' as keyof StockLevelRow,
      header: 'وضعیت',
      cellWithMeta: ({ original }: { original: StockLevelRow }) => {
        const { quantity_on_hand, low_stock_threshold } = original;
        if (quantity_on_hand === 0) {
          return (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">
              <AlertCircleIcon className="size-3" /> ناموجود
            </span>
          );
        }
        if (quantity_on_hand <= low_stock_threshold) {
          return (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
              <AlertCircleIcon className="size-3" /> کم ({quantity_on_hand})
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
            <CheckCircleIcon className="size-3" /> موجود ({quantity_on_hand})
          </span>
        );
      },
    },
    {
      accessorKey: 'updated_at' as keyof StockLevelRow,
      header: 'آخرین بروزرسانی',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => {
        const date = getValue('updated_at') as string;
        return new Date(date).toLocaleDateString('fa-IR', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      },
    },
    {
      id: 'actions',
      header: 'عملیات',
      cellWithMeta: ({ original }: { original: StockLevelRow }) => (
        <div className="flex items-center gap-2">
          {canEdit.data && (
            <button
              onClick={() => handleEdit(original.product_id)}
              className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              aria-label="ویرایش موجودی"
            >
              <EditIcon className="size-4" />
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
          <h1 className="font-display text-2xl font-bold text-foreground">موجودی انبار</h1>
          <p className="text-muted-foreground mt-1">مدیریت موجودی محصولات پت‌شاپ</p>
        </div>
        <div className="w-full sm:w-auto">
          <button
            onClick={handleCreate}
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-app bg-primary px-4 py-2 font-bold text-on-primary transition-opacity hover:opacity-90"
          >
            <span className="text-lg">+</span>
            افزودن محصول جدید
          </button>
        </div>
      </div>

      <AdminTable
        columns={columns}
        data={((result?.data as StockLevelRow[]) || []).map((row) => ({ ...row, id: row.product_id }))}
        isLoading={query.isLoading}
        onCreate={handleCreate}
        createLabel="افزودن محصول"
      />

      {query.isError && (
        <div className="rounded-app border border-destructive bg-destructive/10 p-4 text-center text-destructive">
          خطا در بارگذاری موجودی انبار
        </div>
      )}
    </div>
  );
}

export default StockLevelsList;