"use client";

import { useEffect, useState } from 'react';
import { useNavigation, useSelect, useShow, useUpdate } from '@refinedev/core';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { TREATMENT_CATEGORIES, TREATMENT_CATEGORY_LABELS } from '@/lib/animals';

interface TreatmentData {
  id: string;
  name: string;
  species_id: string;
  category: string;
  description: string | null;
  active: boolean;
}

export default function TreatmentEditPage() {
  const { result, query } = useShow<TreatmentData>({
    resource: 'treatment_types',
    meta: { select: 'id,name,species_id,category,description,active' },
  });
  const { mutateAsync: updateTreatment, mutation } = useUpdate();
  const navigation = useNavigation();
  const { options: species } = useSelect({
    resource: 'species',
    optionLabel: 'name',
    optionValue: 'id',
    filters: [{ field: 'active', operator: 'eq', value: true }],
    meta: { select: 'id,name' },
  });

  const [name, setName] = useState('');
  const [speciesId, setSpeciesId] = useState('');
  const [category, setCategory] = useState('other');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!result) return;
    setName(result.name);
    setSpeciesId(result.species_id);
    setCategory(result.category || 'other');
    setDescription(result.description || '');
    setIsActive(result.active);
  }, [result]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!result) return;
    await updateTreatment({
      resource: 'treatment_types',
      id: result.id,
      values: {
        name: name.trim(),
        species_id: speciesId,
        category,
        description: description.trim() || null,
        active: isActive,
      },
    });
    navigation.list('treatment_types');
  };

  if (query.isLoading) return <div className="p-8 text-center">در حال بارگذاری...</div>;
  if (!result) return <div className="p-8 text-center text-destructive">نوع درمان یافت نشد.</div>;

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">ویرایش نوع درمان</h1>
        <p className="mt-1 text-muted-foreground">اطلاعات این نوع درمان را به‌روزرسانی کنید.</p>
      </div>

      <div className="space-y-5 rounded-app-lg border border-border bg-surface p-6">
        <div>
          <Label>گونه <span className="text-destructive">*</span></Label>
          <Select value={speciesId} onValueChange={setSpeciesId}>
            <SelectTrigger className="mt-2"><SelectValue placeholder="گونه را انتخاب کنید" /></SelectTrigger>
            <SelectContent>
              {species.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>دسته‌بندی <span className="text-destructive">*</span></Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
            <SelectContent>
              {TREATMENT_CATEGORIES.map((cat) => <SelectItem key={cat} value={cat}>{TREATMENT_CATEGORY_LABELS[cat]}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="treatment-name">نام <span className="text-destructive">*</span></Label>
          <Input id="treatment-name" value={name} onChange={(event) => setName(event.target.value)} required className="mt-2" />
        </div>
        <div>
          <Label htmlFor="treatment-description">توضیحات</Label>
          <Textarea id="treatment-description" value={description} onChange={(event) => setDescription(event.target.value)} rows={3} className="mt-2" />
        </div>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
          <span>این نوع درمان فعال باشد</span>
        </label>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'در حال ذخیره...' : 'ذخیره تغییرات'}</Button>
        <Button type="button" variant="outline" onClick={() => navigation.list('treatment_types')}>انصراف</Button>
      </div>
    </form>
  );
}