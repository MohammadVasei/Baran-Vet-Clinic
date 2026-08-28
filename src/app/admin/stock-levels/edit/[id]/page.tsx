"use client";

import { useEffect, useState } from 'react';
import { useNavigation, useShow, useUpdate } from '@refinedev/core';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface StockLevelData {
  product_id: string;
  quantity_on_hand: number;
  low_stock_threshold: number;
  products: { name: string } | null;
}

export default function StockLevelEditPage() {
  const { result, query } = useShow<StockLevelData>({
    resource: 'stock_levels',
    meta: { idColumnName: 'product_id', select: 'product_id,quantity_on_hand,low_stock_threshold,products(name)' },
  });
  const { mutateAsync: updateStock, mutation } = useUpdate();
  const navigation = useNavigation();

  const [quantity, setQuantity] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState('');

  useEffect(() => {
    if (!result) return;
    setQuantity(String(result.quantity_on_hand));
    setLowStockThreshold(String(result.low_stock_threshold));
  }, [result]);

  if (query.isLoading) return <div className="p-8 text-center">در حال بارگذاری...</div>;
  if (!result) return <div className="p-8 text-center text-destructive">موجودی یافت نشد.</div>;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    await updateStock({
      resource: 'stock_levels',
      id: result.product_id,
      meta: { idColumnName: 'product_id' },
      values: {
        quantity_on_hand: Number(quantity) || 0,
        low_stock_threshold: Number(lowStockThreshold) || 5,
      },
    });
    navigation.list('stock_levels');
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">ویرایش موجودی</h1>
        <p className="mt-1 text-muted-foreground">محصول: <span className="font-medium text-foreground">{result.products?.name || '—'}</span></p>
      </div>

      <div className="space-y-5 rounded-app-lg border border-border bg-surface p-6">
        <div>
          <Label htmlFor="stock-quantity">موجودی انبار <span className="text-destructive">*</span></Label>
          <Input
            id="stock-quantity"
            type="number"
            min="0"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="stock-threshold">حد کمبود (آستانه هشدار)</Label>
          <Input
            id="stock-threshold"
            type="number"
            min="1"
            value={lowStockThreshold}
            onChange={(e) => setLowStockThreshold(e.target.value)}
            className="mt-2"
          />
          <p className="mt-1 text-sm text-muted-foreground">وقتی موجودی به این عدد یا کمتر برسد، در لیست به عنوان «کم» نشان داده می‌شود.</p>
        </div>

        <div className="pt-4 border-t border-border">
          <div className="rounded-app bg-muted p-4">
            <p className="font-medium text-foreground">نمایش در سایت:</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {Number(quantity) === 0
                ? '🔴 <strong className="text-destructive">ناموجود</strong> — دکمه خرید غیرفعال خواهد بود'
                : Number(quantity) <= Number(lowStockThreshold || 5)
                ? '🟡 <strong className="text-yellow-700">موجودی کم</strong> — با هشدار نمایش داده می‌شود'
                : '🟢 <strong className="text-green-700">موجود</strong> — بدون محدودیت'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
        </Button>
        <Button type="button" variant="outline" onClick={() => navigation.list('stock_levels')}>
          انصراف
        </Button>
      </div>
    </form>
  );
}