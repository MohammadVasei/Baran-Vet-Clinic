"use client";

import { useEffect, useState, useCallback } from 'react';
import { useList, useUpdate, useNavigation } from '@refinedev/core';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PlusIcon, XIcon } from '@/components/icons';

interface SiteContentRow {
  id: string;
  key: string;
  data: Record<string, unknown>;
  updated_at: string;
}

interface HourRow {
  days: string;
  time: string;
}

const CLINIC_FIELDS: { key: string; label: string; hint?: string }[] = [
  { key: 'name', label: 'نام کلینیک' },
  { key: 'brand', label: 'برند' },
  { key: 'tagline', label: 'شعار' },
  { key: 'phone', label: 'تلفن' },
  { key: 'phoneHref', label: 'پیوند تلفن', hint: 'مثلاً tel:+982100000000' },
  { key: 'mobile1', label: 'موبایل ۱' },
  { key: 'mobile1Href', label: 'پیوند موبایل ۱' },
  { key: 'mobile1WhatsApp', label: 'واتس‌اپ موبایل ۱' },
  { key: 'mobile2', label: 'موبایل ۲' },
  { key: 'mobile2Href', label: 'پیوند موبایل ۲' },
  { key: 'mobile2WhatsApp', label: 'واتس‌اپ موبایل ۲' },
  { key: 'email', label: 'ایمیل' },
  { key: 'address', label: 'نشانی' },
  { key: 'addressShort', label: 'نشانی کوتاه' },
  { key: 'hoursNote', label: 'توضیح ساعات کار' },
  { key: 'instagram', label: 'اینستاگرام' },
  { key: 'instagramUrl', label: 'پیوند اینستاگرام' },
  { key: 'threads', label: 'تردز' },
  { key: 'threadsUrl', label: 'پیوند تردز' },
];

export default function SiteContentEditPage() {
  const params = useParams<{ key: string }>();
  const contentKey = params?.key as string | undefined;

  const { result: rowsResult, query } = useList<SiteContentRow>({
    resource: 'site_content',
    filters: [{ field: 'key', operator: 'eq', value: (contentKey as string) || '' }],
    meta: { select: 'id,key,data,updated_at' },
    pagination: { mode: 'off' },
    queryOptions: {
      enabled: !!contentKey,
    },
  });
  const { mutateAsync: updateContent, mutation } = useUpdate();
  const navigation = useNavigation();

  const row = rowsResult?.data?.find((r) => r.key === contentKey);

  const [formData, setFormData] = useState<Record<string, string>>({});
  const [hours, setHours] = useState<HourRow[]>([]);
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isClinic = contentKey === 'clinic';

  useEffect(() => {
    if (!row || !row.data) return;
    const data = row.data;
    if (isClinic) {
      const next: Record<string, string> = {};
      for (const field of CLINIC_FIELDS) {
        next[field.key] = String(data[field.key] ?? '');
      }
      setFormData(next);
      const hrs = Array.isArray(data.hours) ? data.hours : [];
      setHours((hrs as HourRow[]).map((h) => ({ days: String(h.days ?? ''), time: String(h.time ?? '') })));
    } else {
      setJsonText(JSON.stringify(data, null, 2));
    }
  }, [row, isClinic]);

  const setField = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const setHour = (index: number, field: keyof HourRow, value: string) => {
    setHours((prev) => prev.map((h, i) => (i === index ? { ...h, [field]: value } : h)));
  };

  const addHour = () => setHours((prev) => [...prev, { days: '', time: '' }]);
  const removeHour = (index: number) => setHours((prev) => prev.filter((_, i) => i !== index));

  const handleSaveClinic = useCallback(async (id: string) => {
    const data: Record<string, unknown> = {};
    for (const field of CLINIC_FIELDS) {
      data[field.key] = formData[field.key] ?? '';
    }
    data.hours = hours
      .filter((h) => h.days.trim() || h.time.trim())
      .map((h) => ({ days: h.days.trim(), time: h.time.trim() }));
    await updateContent({ resource: 'site_content', id, values: { data } });
    navigation.list('site_content');
  }, [formData, hours, updateContent, navigation]);

  const handleSaveJson = useCallback(async (id: string) => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      setError('JSON نامعتبر است. خروجی ویرایشگر را بررسی کنید.');
      return;
    }
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      setError('مقدار JSON باید یک شیء (object) باشد.');
      return;
    }
    setError(null);
    await updateContent({ resource: 'site_content', id, values: { data: parsed } });
    navigation.list('site_content');
  }, [jsonText, updateContent, navigation]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!row) return;
    if (row.key !== contentKey) return;
    if (isClinic) {
      void handleSaveClinic(row.id);
    } else {
      void handleSaveJson(row.id);
    }
  };

  if (query.isLoading) return <div className="p-8 text-center">در حال بارگذاری...</div>;
  if (!contentKey) return <div className="p-8 text-center text-destructive">کلید محتوا مشخص نشده است.</div>;

  return (
    <form onSubmit={submit} className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">ویرایش محتوا</h1>
        <p className="mt-1 font-mono text-sm text-muted-foreground">{contentKey}</p>
        <p className="mt-1 text-muted-foreground">
          {isClinic
            ? 'اطلاعات تماس و آدرس کلینیک. پس از ذخیره، سایت با بروزرسانی کش به‌روز می‌شود.'
            : 'ویرایشگر JSON — ساختار داده را متناسب با مصرف‌کننده کامپوننت حفظ کنید.'}
        </p>
      </div>

      {error && (
        <div role="alert" className="rounded-app border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {isClinic ? (
        <div className="space-y-4 rounded-app-lg border border-border bg-surface p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {CLINIC_FIELDS.map((field) => (
              <div key={field.key}>
                <Label htmlFor={`clinic-${field.key}`}>{field.label}</Label>
                {field.hint && <p className="mt-1 text-xs text-muted-foreground">{field.hint}</p>}
                <Input
                  id={`clinic-${field.key}`}
                  value={formData[field.key] ?? ''}
                  onChange={(event) => setField(field.key, event.target.value)}
                  className="mt-2"
                  dir="ltr"
                />
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">ساعات کاری</p>
                <p className="mt-1 text-xs text-muted-foreground">روزها و ساعت هر شیفت</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addHour}>
                <PlusIcon className="size-4" /> افزودن شیفت
              </Button>
            </div>
            <div className="mt-3 space-y-3">
              {hours.map((hour, index) => (
                <div key={index} className="flex items-end gap-3">
                  <div className="flex-1">
                    <Label htmlFor={`hour-days-${index}`}>روزها</Label>
                    <Input
                      id={`hour-days-${index}`}
                      value={hour.days}
                      onChange={(event) => setHour(index, 'days', event.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor={`hour-time-${index}`}>ساعت</Label>
                    <Input
                      id={`hour-time-${index}`}
                      value={hour.time}
                      onChange={(event) => setHour(index, 'time', event.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeHour(index)}
                    className="p-2 rounded hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"
                    aria-label="حذف شیفت"
                  >
                    <XIcon className="size-4" />
                  </button>
                </div>
              ))}
              {hours.length === 0 && <p className="text-sm text-muted-foreground">هنوز شیفتی ثبت نشده است.</p>}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-5 rounded-app-lg border border-border bg-surface p-6">
          <div>
            <Label htmlFor="json-editor">داده (JSON)</Label>
            <Textarea
              id="json-editor"
              value={jsonText}
              onChange={(event) => setJsonText(event.target.value)}
              rows={24}
              className="mt-2 font-mono text-xs"
              dir="ltr"
            />
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={mutation.isPending || !row}>
          {mutation.isPending ? 'در حال ذخیره…' : 'ذخیره تغییرات'}
        </Button>
        <Button type="button" variant="outline" onClick={() => navigation.list('site_content')}>انصراف</Button>
      </div>
    </form>
  );
}