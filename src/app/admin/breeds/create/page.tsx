"use client";

import { useState } from 'react';
import { useCreate, useNavigation, useSelect } from '@refinedev/core';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHelp } from "@/components/admin/PageHelp";

export default function BreedCreatePage() {
  const { mutateAsync: createBreed, mutation } = useCreate();
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
  const [isActive, setIsActive] = useState(true);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    await createBreed({
      resource: 'breeds',
      values: {
        name: name.trim(),
        species_id: speciesId,
        active: isActive,
      },
    });
    navigation.list('breeds');
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl space-y-6">
      <div>
        <div className="flex items-center gap-3"><h1 className="font-display text-2xl font-bold text-foreground">افزودن نژاد</h1><PageHelp id="breeds-create" /></div>
        <p className="mt-1 text-muted-foreground">نژاد جدیدی را به یک گونه اضافه کنید.</p>
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
          <Label htmlFor="breed-name">نام نژاد <span className="text-destructive">*</span></Label>
          <Input id="breed-name" value={name} onChange={(event) => setName(event.target.value)} required className="mt-2" placeholder="گلدن رتریور" />
        </div>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
          <span>این نژاد فعال باشد</span>
        </label>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={mutation.isPending}>افزودن نژاد</Button>
        <Button type="button" variant="outline" onClick={() => navigation.list('breeds')}>انصراف</Button>
      </div>
    </form>
  );
}