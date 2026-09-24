"use client";

import { useState } from 'react';
import { useCreate, useNavigation } from '@refinedev/core';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PageHelp } from "@/components/admin/PageHelp";

export default function SpeciesCreatePage() {
  const { mutateAsync: createSpecies, mutation } = useCreate();
  const navigation = useNavigation();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

const submit = async (event: React.FormEvent) => {
     event.preventDefault();
     await createSpecies({
       resource: 'species',
       values: {
         name: name.trim(),
         code: code.trim().toLowerCase().replace(/\s+/g, '-'),
         description: description.trim() || null,
         active: isActive,
       },
     });
     navigation.list('species-and-breeds');
   };

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl space-y-6">
      <div>
        <div className="flex items-center gap-3"><h1 className="font-display text-2xl font-bold text-foreground">افزودن گونه</h1><PageHelp id="species-create" /></div>
        <p className="mt-1 text-muted-foreground">گونه جدیدی از حیوانات را به کلینیک اضافه کنید.</p>
      </div>

      <div className="space-y-5 rounded-app-lg border border-border bg-surface p-6">
        <div>
          <Label htmlFor="species-name">نام گونه <span className="text-destructive">*</span></Label>
          <Input id="species-name" value={name} onChange={(event) => setName(event.target.value)} required className="mt-2" placeholder="سگ" />
        </div>
        <div>
          <Label htmlFor="species-code">کد یکتا <span className="text-destructive">*</span></Label>
          <Input id="species-code" value={code} onChange={(event) => setCode(event.target.value)} required className="mt-2" dir="ltr" placeholder="dog" />
          <p className="mt-1 text-xs text-muted-foreground">برای ارجاع در کد و نمایش؛ به‌صورت خودکار بدون فاصله ذخیره می‌شود.</p>
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
         <Button type="submit" disabled={mutation.isPending}>افزودن گونه</Button>
         <Button type="button" variant="outline" onClick={() => navigation.list('species-and-breeds')}>انصراف</Button>
       </div>
    </form>
  );
}