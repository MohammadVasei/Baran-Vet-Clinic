"use client";

import { useEffect, useState } from 'react';
import { useNavigation, useShow, useUpdate } from '@refinedev/core';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface SpeciesData {
  id: string;
  name: string;
  code: string;
  description: string | null;
  active: boolean;
}

export default function SpeciesEditPage() {
  const { result, query } = useShow<SpeciesData>({
    resource: 'species',
    meta: { select: 'id,name,code,description,active' },
  });
  const { mutateAsync: updateSpecies, mutation } = useUpdate();
  const navigation = useNavigation();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!result) return;
    setName(result.name);
    setCode(result.code);
    setDescription(result.description || '');
    setIsActive(result.active);
  }, [result]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!result) return;
    await updateSpecies({
      resource: 'species',
      id: result.id,
      values: {
        name: name.trim(),
        code: code.trim().toLowerCase().replace(/\s+/g, '-'),
        description: description.trim() || null,
        active: isActive,
      },
    });
    navigation.list('species');
  };

  if (query.isLoading) return <div className="p-8 text-center">در حال بارگذاری...</div>;
  if (!result) return <div className="p-8 text-center text-destructive">گونه یافت نشد.</div>;

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">ویرایش گونه</h1>
        <p className="mt-1 text-muted-foreground">اطلاعات این گونه را به‌روزرسانی کنید.</p>
      </div>

      <div className="space-y-5 rounded-app-lg border border-border bg-surface p-6">
        <div>
          <Label htmlFor="species-name">نام گونه <span className="text-destructive">*</span></Label>
          <Input id="species-name" value={name} onChange={(event) => setName(event.target.value)} required className="mt-2" />
        </div>
        <div>
          <Label htmlFor="species-code">کد یکتا <span className="text-destructive">*</span></Label>
          <Input id="species-code" value={code} onChange={(event) => setCode(event.target.value)} required className="mt-2" dir="ltr" />
        </div>
        <div>
          <Label htmlFor="species-description">توضیحات</Label>
          <Textarea id="species-description" value={description} onChange={(event) => setDescription(event.target.value)} rows={3} className="mt-2" />
        </div>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
          <span>این گونه فعال باشد</span>
        </label>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'در حال ذخیره...' : 'ذخیره تغییرات'}</Button>
        <Button type="button" variant="outline" onClick={() => navigation.list('species')}>انصراف</Button>
      </div>
    </form>
  );
}