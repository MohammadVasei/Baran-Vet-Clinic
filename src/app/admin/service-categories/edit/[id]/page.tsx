"use client";

import { useEffect, useState } from 'react';
import { useNavigation, useShow, useUpdate } from '@refinedev/core';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHelp } from "@/components/admin/PageHelp";

interface ServiceCategoryData {
  id: string;
  name: string;
  label: string;
  display_order: number;
  is_active: boolean;
}

export default function ServiceCategoryEditPage() {
  const { result, query } = useShow<ServiceCategoryData>({
    resource: 'service_categories',
    meta: { select: 'id,name,label,display_order,is_active' },
  });
  const { mutateAsync: updateServiceCategory, mutation } = useUpdate();
  const navigation = useNavigation();

  const [name, setName] = useState('');
  const [label, setLabel] = useState('');
  const [displayOrder, setDisplayOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!result) return;
    setName(result.name);
    setLabel(result.label);
    setDisplayOrder(String(result.display_order));
    setIsActive(result.is_active);
  }, [result]);

  if (query.isLoading) return <div className="p-8 text-center">در حال بارگذاری...</div>;
  if (!result) return <div className="p-8 text-center text-destructive">دسته‌بندی یافت نشد.</div>;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    await updateServiceCategory({
      resource: 'service_categories',
      id: result.id,
      values: {
        name: name.trim(),
        label: label.trim(),
        display_order: Number(displayOrder) || 0,
        is_active: isActive,
      },
    });
    navigation.list('service_categories');
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-xl space-y-6">
      <div>
        <div className="flex items-center gap-3"><h1 className="font-display text-2xl font-bold text-foreground">ویرایش دسته‌بندی خدمت</h1><PageHelp id="service-categories-edit" /></div>
        <p className="mt-1 text-muted-foreground">دسته‌بندی خدمت را ویرایش کنید.</p>
      </div>

      <div className="space-y-5 rounded-app-lg border border-border bg-surface p-6">
        <div>
          <Label htmlFor="category-name">نام دسته‌بندی (انگلیسی)</Label>
          <Input
            id="category-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            className="mt-2"
            dir="ltr"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            برای استفاده در سیستم و API (مثال: darman, shenasname, grooming, petshop)
          </p>
        </div>

        <div>
          <Label htmlFor="category-label">عنوان نمایش (فارسی)</Label>
          <Input
            id="category-label"
            value={label}
            onChange={(event) => setLabel(event.target.value)}
            required
            className="mt-2"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            عنوانی که در ظاهر کاربر نشان داده می‌شود
          </p>
        </div>

        <div>
          <Label htmlFor="category-order">ترتیب نمایش</Label>
          <Input
            id="category-order"
            type="number"
            min="0"
            value={displayOrder}
            onChange={(event) => setDisplayOrder(event.target.value)}
            className="mt-2"
          />
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
          />
          <span>این دسته‌بندی فعال باشد</span>
        </label>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={mutation.isPending}>
          ذخیره تغییرات
        </Button>
        <Button type="button" variant="outline" onClick={() => navigation.list('service_categories')}>
          انصراف
        </Button>
      </div>
    </form>
  );
}
