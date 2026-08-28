"use client";

import Link from 'next/link';
import { useNavigation, useShow } from '@refinedev/core';
import { Button } from '@/components/ui/button';

interface ServiceData {
  id: string;
  name: string;
  description: string | null;
  price_rial: number | null;
  category: string | null;
  duration_minutes: number;
  is_active: boolean;
  doctor_id: string | null;
  doctor?: { name: string } | null;
}

export default function ServiceShowPage() {
  const { result, query } = useShow<ServiceData>({ resource: 'services', meta: { select: 'id,name,description,price_rial,category,duration_minutes,is_active,doctor_id,doctor:doctors(name)' } });
  const navigation = useNavigation();
  if (query.isLoading) return <div className="p-8 text-center">در حال بارگذاری...</div>;
  if (!result) return <div className="p-8 text-center text-destructive">خدمت یافت نشد.</div>;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-start justify-between gap-4"><div><h1 className="font-display text-2xl font-bold">{result.name}</h1><p className="mt-1 text-muted-foreground">جزئیات و تنظیمات خدمت</p></div><Button onClick={() => navigation.edit('services', result.id)}>ویرایش</Button></div>
      <div className="grid gap-4 rounded-app-lg border border-border bg-surface p-6 sm:grid-cols-2">
        <div><span className="text-sm text-muted-foreground">پزشک مسئول</span><p className="mt-1 font-medium">{result.doctor?.name || 'تعیین نشده'}</p></div>
        <div><span className="text-sm text-muted-foreground">وضعیت رزرو</span><p className="mt-1 font-medium">{result.is_active ? 'فعال' : 'غیرفعال'}</p></div>
        <div><span className="text-sm text-muted-foreground">قیمت</span><p className="mt-1 font-medium">{result.price_rial == null ? 'رایگان/تعیین نشده' : `${new Intl.NumberFormat('fa-IR').format(result.price_rial)} ریال`}</p></div>
        <div><span className="text-sm text-muted-foreground">مدت</span><p className="mt-1 font-medium">{result.duration_minutes} دقیقه</p></div>
        <div className="sm:col-span-2"><span className="text-sm text-muted-foreground">توضیحات</span><p className="mt-1">{result.description || 'توضیحی ثبت نشده است.'}</p></div>
      </div>
      <Link href="/admin/services" className="text-primary hover:underline">بازگشت به خدمات</Link>
    </div>
  );
}
