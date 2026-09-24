"use client";

import { useList } from '@refinedev/core';
import Link from 'next/link';
import { AdminTable } from '@/components/admin/AdminTable';
import { EditIcon } from '@/components/icons';
import { PageHelp } from "@/components/admin/PageHelp";

const KEY_LABELS: Record<string, string> = {
  clinic: 'اطلاعات کلینیک',
  about: 'درباره ما',
  why: 'چرا باران',
  animals: 'حیوانات',
  marquee: 'نوار متحرک',
  emergency: 'اضطراری',
  appointment: 'رزرو نوبت',
  contact: 'تماس با ما',
  facilities: 'امکانات',
  services_section: 'بخش خدمات',
  doctors_section: 'بخش پزشکان',
  testimonials_section: 'بخش بازخوردها',
  diseases_groups: 'گروه‌های بیماری‌ها',
  general_advice: 'توصیه‌های عمومی',
  disclaimer: 'سلب مسئولیت',
};

interface SiteContentRow {
  id: string;
  key: string;
  updated_at: string;
}

export default function SiteContentList() {
  const { result, query } = useList<SiteContentRow>({
    resource: 'site_content',
    sorters: [{ field: 'key', order: 'asc' }],
    meta: { select: 'id,key,updated_at' },
    pagination: { mode: 'off' },
  });

  const rows = (result?.data || []) as SiteContentRow[];

  const columns = [
    {
      accessorKey: 'key' as keyof SiteContentRow,
      header: 'کلید',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => (
        <span className="font-mono text-xs">{getValue('key') as string}</span>
      ),
    },
    {
      accessorKey: 'key' as keyof SiteContentRow,
      header: 'عنوان',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => (
        <span className="font-medium">{KEY_LABELS[getValue('key') as string] || (getValue('key') as string)}</span>
      ),
    },
    {
      accessorKey: 'updated_at' as keyof SiteContentRow,
      header: 'آخرین به‌روزرسانی',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => (
        <span className="text-muted-foreground">{new Date(getValue('updated_at') as string).toLocaleString('fa-IR')}</span>
      ),
    },
    {
      id: 'actions',
      header: 'عملیات',
      cellWithMeta: ({ original }: { original: SiteContentRow }) => (
        <Link
          href={`/admin/site-content/edit/${encodeURIComponent(original.key)}`}
          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors inline-flex"
          aria-label="ویرایش"
        >
          <EditIcon className="size-4" />
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3"><h1 className="font-display text-2xl font-bold text-foreground">محتوا و اطلاعات کلینیک</h1><PageHelp id="site-content-list" /></div>
        <p className="text-muted-foreground mt-1">
          بخش‌ای که اطلاعات روی سایت از آن خوانده می‌شود. «اطلاعات کلینیک» فرم اختصاصی و بقیه با ویرایشگر JSON دارند.
        </p>
      </div>

      <AdminTable
        columns={columns}
        data={rows}
        isLoading={query.isLoading}
      />

      {query.isError && (
        <div className="rounded-app border border-destructive bg-destructive/10 p-4 text-center text-destructive">
          خطا در بارگذاری محتوا
        </div>
      )}
    </div>
  );
}