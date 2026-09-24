"use client";
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useList, useNavigation, useCan, useUpdate } from '@refinedev/core';
import Link from 'next/link';
import { AdminTable } from '@/components/admin/AdminTable';
import { StockQtyCell } from '@/components/admin/StockQtyCell';
import { Button } from '@/components/ui/button';
import { EditIcon, SettingsIcon, PackageIcon, EyeIcon, EyeOffIcon, CheckCircleIcon, AlertCircleIcon, DownloadIcon, LoaderIcon } from '@/components/icons';
import { UNIT_LABELS, isWeightUnit, formatQuantity, type SellingUnit } from '@/lib/products';
import { PageHelp } from "@/components/admin/PageHelp";

type StockStatus = 'all' | 'out_of_stock' | 'low_stock' | 'in_stock';

interface StockLevelRow {
  id: string;
  product_id: string;
  quantity_on_hand: number;
  low_stock_threshold: number;
  updated_at: string;
  products: { name: string; price_rial: number; category: string | null; is_active: boolean; selling_unit: SellingUnit | null } | null;
}

export function StockLevelsList() {
  const [statusFilter, setStatusFilter] = useState<StockStatus>('all');
  const [exporting, setExporting] = useState(false);

  const listResult = useList({
    resource: 'stock_levels',
    sorters: [{ field: 'quantity_on_hand', order: 'asc' }],
    pagination: { pageSize: 500 },
    meta: {
      select: 'product_id,quantity_on_hand,low_stock_threshold,updated_at,products(name,price_rial,category,is_active,selling_unit)',
    },
  });
  const { result, query } = listResult;
  const navigation = useNavigation();
  const canEdit = useCan({ resource: 'stock_levels', action: 'edit' });
  const canEditProduct = useCan({ resource: 'products', action: 'edit' });
  const { mutateAsync: updateProductActive } = useUpdate();
  const { mutateAsync: saveStockQty } = useUpdate();

  const rows: StockLevelRow[] = ((result?.data as StockLevelRow[]) || []).map((row) => ({
    ...row,
    id: row.product_id,
  }));

  const getStatus = (row: StockLevelRow): Exclude<StockStatus, 'all'> => {
    const { quantity_on_hand, low_stock_threshold } = row;
    if (quantity_on_hand === 0) return 'out_of_stock';
    if (quantity_on_hand <= low_stock_threshold) return 'low_stock';
    return 'in_stock';
  };

  const filteredRows = statusFilter === 'all' ? rows : rows.filter((row) => getStatus(row) === statusFilter);

  const countByStatus = (status: Exclude<StockStatus, 'all'>) =>
    rows.filter((row) => getStatus(row) === status).length;

  const handleEditStock = (productId: string) => navigation.edit('stock_levels', productId);
  const handleEditProduct = (productId: string) => navigation.edit('products', productId);
  const handleCreate = () => navigation.create('products');

  const handleToggleActive = async (productId: string, currentActive: boolean) => {
    await updateProductActive({
      resource: 'products',
      id: productId,
      values: { is_active: !currentActive },
    });
    query.refetch();
  };

  const handleSaveStock = async (productId: string, quantity: number) => {
    await saveStockQty({
      resource: 'stock_levels',
      id: productId,
      meta: { idColumnName: 'product_id' },
      values: { quantity_on_hand: quantity },
    });
    query.refetch();
  };

  const handleExportExcel = async () => {
    if (exporting || rows.length === 0) return;
    setExporting(true);
    try {
      const { exportInventoryToExcel } = await import('@/lib/export/inventory-excel');
      await exportInventoryToExcel(filteredRows, rows);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  const statusFilters: { value: StockStatus; label: string }[] = [
    { value: 'all', label: `همه (${rows.length})` },
    { value: 'out_of_stock', label: `ناموجود (${countByStatus('out_of_stock')})` },
    { value: 'low_stock', label: `کم (${countByStatus('low_stock')})` },
    { value: 'in_stock', label: `موجود (${countByStatus('in_stock')})` },
  ];

  const columns = [
    {
      accessorKey: 'products' as keyof StockLevelRow,
      header: 'محصول',
      cellWithMeta: ({ getValue, original }: { getValue: (key: string) => unknown; original: StockLevelRow }) => {
        const product = getValue('products') as { name: string; is_active: boolean; price_rial: number } | null;
        if (!product) return <span className="text-muted-foreground">—</span>;
        return (
          <div>
            <Link
              href={`/admin/products/edit/${original.product_id}`}
              className="font-medium text-foreground hover:text-primary hover:underline transition-colors"
            >
              {product.name}
            </Link>
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
      accessorKey: 'products' as keyof StockLevelRow,
      header: 'واحد فروش',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => {
        const unit = (getValue('products') as { selling_unit?: SellingUnit | null } | null)?.selling_unit;
        if (!unit) return <span className="text-muted-foreground">—</span>;
        return (
          <span className={`px-2 py-1 text-xs rounded-full ${isWeightUnit(unit) ? 'bg-blue-100 text-blue-700' : 'bg-muted'}`}>
            {UNIT_LABELS[unit] || unit}
          </span>
        );
      },
    },
    {
      accessorKey: 'quantity_on_hand' as keyof StockLevelRow,
      header: 'موجودی انبار',
      cellWithMeta: ({ getValue, original }: { getValue: (key: string) => unknown; original: StockLevelRow }) => {
        const qty = getValue('quantity_on_hand') as number;
        const unit = original.products?.selling_unit ?? ('PIECE' as SellingUnit);
        if (!canEdit.data) return <span className="font-mono font-medium">{formatQuantity(qty, unit)}</span>;
        return (
          <div className="flex items-center gap-2">
            <StockQtyCell
              productId={original.product_id}
              quantity={qty}
              onSave={handleSaveStock}
            />
            <span className="text-xs text-muted-foreground">{UNIT_LABELS[unit]}</span>
          </div>
        );
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
        const status = getStatus(original);
        const unit = original.products?.selling_unit ?? ('PIECE' as SellingUnit);
        if (status === 'out_of_stock') {
          return (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">
              <AlertCircleIcon className="size-3" /> ناموجود
            </span>
          );
        }
        if (status === 'low_stock') {
          return (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
              <AlertCircleIcon className="size-3" /> کم ({formatQuantity(original.quantity_on_hand, unit)})
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
            <CheckCircleIcon className="size-3" /> موجود ({formatQuantity(original.quantity_on_hand, unit)})
          </span>
        );
      },
    },
    {
      accessorKey: 'products' as keyof StockLevelRow,
      header: 'نمایش در سایت',
      cellWithMeta: ({ getValue, original }: { getValue: (key: string) => unknown; original: StockLevelRow }) => {
        const active = (getValue('products') as { is_active: boolean } | null)?.is_active ?? false;
        if (canEditProduct.data) {
          return (
            <button
              onClick={() => handleToggleActive(original.product_id, active)}
              className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full transition-colors ${active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-muted text-muted-foreground hover:bg-red-100 hover:text-red-700'}`}
              aria-label={active ? 'پنهان کردن از سایت' : 'نمایش در سایت'}
              title={active ? 'پنهان کردن از سایت' : 'نمایش در سایت'}
            >
              {active ? <EyeIcon className="size-3" /> : <EyeOffIcon className="size-3" />}
              {active ? 'فعال' : 'غیرفعال'}
            </button>
          );
        }
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${active ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
            {active ? <EyeIcon className="size-3" /> : <EyeOffIcon className="size-3" />}
            {active ? 'فعال' : 'غیرفعال'}
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
              onClick={() => handleEditStock(original.product_id)}
              className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              aria-label="ویرایش موجودی و حد کمبود"
            >
              <SettingsIcon className="size-4" />
            </button>
          )}
          {canEditProduct.data && (
            <button
              onClick={() => handleEditProduct(original.product_id)}
              className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              aria-label="ویرایش محصول"
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
          <div className="flex items-center gap-3"><h1 className="font-display text-2xl font-bold text-foreground">موجودی انبار</h1><PageHelp id="stock-levels-list" /></div>
          <p className="text-muted-foreground mt-1">مدیریت موجودی و نمایش محصولات در پت‌شاپ</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {statusFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setStatusFilter(filter.value)}
            className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
              statusFilter === filter.value
                ? 'bg-primary text-on-primary'
                : 'bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <AdminTable
        columns={columns}
        data={filteredRows}
        isLoading={query.isLoading}
        onCreate={handleCreate}
        createLabel="افزودن محصول"
        searchKey={(row) =>
          [
            row.products?.name ?? '',
            row.products?.selling_unit ? UNIT_LABELS[row.products.selling_unit] : '',
            String(row.quantity_on_hand),
          ].join(' ')
        }
        toolbar={
          <>
            <Button
              variant="outline"
              onClick={handleExportExcel}
              disabled={exporting || rows.length === 0}
              aria-label="خروجی اکسل"
            >
              {exporting ? <LoaderIcon className="size-4" /> : <DownloadIcon className="size-4" />}
              {exporting ? 'در حال ساخت…' : 'خروجی اکسل'}
            </Button>
            <Link
              href="/admin/products"
              className="inline-flex items-center justify-center gap-2 rounded-app border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              <PackageIcon className="size-4" />
              مدیریت محصولات
            </Link>
          </>
        }
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