"use client";

import { useDelete, useList, useNavigation, useCan } from '@refinedev/core';
import { AdminTable } from '@/components/admin/AdminTable';
import { EditIcon, TrashIcon } from '@/components/icons';
import { PageHelp } from "@/components/admin/PageHelp";

const ANIMAL_LABELS: Record<string, string> = {
  dog: 'سگ',
  cat: 'گربه',
  bird: 'پرنده',
  exotic: 'حیوانات عجیب‌وغریب',
  other: 'سایر',
};

interface TestimonialRow {
  id: string;
  name: string;
  quote: string;
  rating: number;
  animal_type: string | null;
  service_type: string | null;
  pet_note: string | null;
  display_order: number;
  is_published: boolean;
}

export default function TestimonialsList() {
  const { result, query } = useList<TestimonialRow>({
    resource: 'testimonials',
    sorters: [{ field: 'display_order', order: 'asc' }],
    meta: { select: 'id,name,quote,rating,animal_type,service_type,pet_note,display_order,is_published' },
    pagination: { mode: 'off' },
  });
  const navigation = useNavigation();
  const { mutate: deleteItem } = useDelete();
  const canEdit = useCan({ resource: 'testimonials', action: 'edit' });
  const canDelete = useCan({ resource: 'testimonials', action: 'delete' });

  const rows = (result?.data || []) as TestimonialRow[];

  const handleDelete = (id: string) => {
    if (confirm('آیا از حذف این بازخورد اطمینان دارید؟')) {
      deleteItem({ id, resource: 'testimonials' });
    }
  };

  const columns = [
    {
      accessorKey: 'name' as keyof TestimonialRow,
      header: 'نام',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => <span className="font-medium">{getValue('name') as string}</span>,
    },
    {
      accessorKey: 'rating' as keyof TestimonialRow,
      header: 'امتیاز',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => <span>{'★'.repeat(getValue('rating') as number)}</span>,
    },
    {
      accessorKey: 'animal_type' as keyof TestimonialRow,
      header: 'حیوان',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => {
        const t = getValue('animal_type') as string | null;
        return t ? <span className="px-2 py-1 text-xs rounded-full bg-muted">{ANIMAL_LABELS[t] || t}</span> : <span className="text-muted-foreground">—</span>;
      },
    },
    {
      accessorKey: 'pet_note' as keyof TestimonialRow,
      header: 'نکته حیوان',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => <span className="text-sm">{(getValue('pet_note') as string | null) || '—'}</span>,
    },
    {
      accessorKey: 'quote' as keyof TestimonialRow,
      header: 'متن بازخورد',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => {
        const quote = getValue('quote') as string;
        return <span className="line-clamp-2 max-w-xs text-muted-foreground">{quote}</span>;
      },
    },
    {
      accessorKey: 'is_published' as keyof TestimonialRow,
      header: 'وضعیت',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => {
        const published = getValue('is_published') as boolean;
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${published ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {published ? 'منتشر شده' : 'پیش‌نویس'}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: 'عملیات',
      cellWithMeta: ({ original }: { original: TestimonialRow }) => (
        <div className="flex items-center gap-2">
          {canEdit.data && (
            <button onClick={() => navigation.edit('testimonials', original.id)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" aria-label="ویرایش">
              <EditIcon className="size-4" />
            </button>
          )}
          {canDelete.data && (
            <button onClick={() => handleDelete(original.id)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-destructive transition-colors" aria-label="حذف">
              <TrashIcon className="size-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3"><h1 className="font-display text-2xl font-bold text-foreground">مدیریت بازخوردها</h1><PageHelp id="testimonials-list" /></div>
        <p className="text-muted-foreground mt-1">بازخوردهای مراجعین که در بخش معرفی سایت نمایش داده می‌شوند</p>
      </div>

      <AdminTable
        columns={columns}
        data={rows}
        isLoading={query.isLoading}
        onCreate={() => navigation.create('testimonials')}
        createLabel="افزودن بازخورد"
      />

      {query.isError && (
        <div className="rounded-app border border-destructive bg-destructive/10 p-4 text-center text-destructive">
          خطا در بارگذاری بازخوردها
        </div>
      )}
    </div>
  );
}