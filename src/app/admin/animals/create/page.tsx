"use client";

import { useState } from 'react';
import { useCreate, useList, useNavigation, useSelect } from '@refinedev/core';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ANIMAL_SEXES, ANIMAL_SEX_LABELS, normalizeDigits } from '@/lib/animals';
import { PageHelp } from "@/components/admin/PageHelp";
import { JalaliDateInput } from '@/components/admin/JalaliDateInput';

export default function AnimalCreatePage() {
  const { mutateAsync: createAnimal, mutation } = useCreate();
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
  const [breedId, setBreedId] = useState('');
  const [sex, setSex] = useState('unknown');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [weight, setWeight] = useState('');
  const [color, setColor] = useState('');
  const [microchip, setMicrochip] = useState('');
  const [neutered, setNeutered] = useState(false);
  const [allergies, setAllergies] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [status, setStatus] = useState('active');

  const { result: breeds } = useList({
    resource: 'breeds',
    pagination: { pageSize: 100 },
    filters: speciesId ? [{ field: 'species_id', operator: 'eq', value: speciesId }] : [],
    queryOptions: { enabled: Boolean(speciesId) },
    meta: { select: 'id,name' },
  });

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!speciesId) {
      alert('گونه را انتخاب کنید.');
      return;
    }
    await createAnimal({
      resource: 'animals',
      values: {
        name: name.trim(),
        species_id: speciesId,
        breed_id: breedId || null,
        sex,
        date_of_birth: dateOfBirth || null,
        weight: weight ? Number(weight) : null,
        color: color.trim() || null,
        microchip_number: normalizeDigits(microchip) || null,
        neutered,
        allergies: allergies.trim() || null,
        medical_notes: medicalNotes.trim() || null,
        owner_phone: ownerPhone.trim() || null,
        status,
      },
    });
    navigation.list('animals');
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-3xl space-y-6">
      <div>
        <div className="flex items-center gap-3"><h1 className="font-display text-2xl font-bold text-foreground">افزودن حیوان</h1><PageHelp id="animals-create" /></div>
        <p className="mt-1 text-muted-foreground">
          پرونده پزشکی جدید برای یک حیوان بسازید. تلفن صاحب برای مشتری‌های بدون حساب کاربری الزامی است.
        </p>
      </div>

      <div className="space-y-5 rounded-app-lg border border-border bg-surface p-6">
        <p className="font-medium text-foreground">اطلاعات مالک</p>
        <div>
          <Label htmlFor="animal-owner-phone">تلفن صاحب <span className="text-destructive">*</span></Label>
          <Input id="animal-owner-phone" value={ownerPhone} onChange={(event) => setOwnerPhone(event.target.value)} required className="mt-2" dir="ltr" placeholder="0912xxxxxxx" />
          <p className="mt-1 text-xs text-muted-foreground">با اطلاعات تماس مشتری‌های بدون حساب کاربری ثبت می‌شود.</p>
        </div>
      </div>

      <div className="space-y-5 rounded-app-lg border border-border bg-surface p-6">
        <p className="font-medium text-foreground">مشخصات حیوان</p>
        <div>
          <Label htmlFor="animal-name">نام <span className="text-destructive">*</span></Label>
          <Input id="animal-name" value={name} onChange={(event) => setName(event.target.value)} required className="mt-2" placeholder="میلو" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>گونه <span className="text-destructive">*</span></Label>
            <Select value={speciesId} onValueChange={(value) => { setSpeciesId(value); setBreedId(''); }}>
              <SelectTrigger className="mt-2"><SelectValue placeholder="گونه را انتخاب کنید" /></SelectTrigger>
              <SelectContent>
                {species.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>نژاد</Label>
            <Select value={breedId} onValueChange={setBreedId}>
              <SelectTrigger className="mt-2"><SelectValue placeholder="نامشخص" /></SelectTrigger>
              <SelectContent>
                {(breeds?.data as { id: string; name: string }[] | undefined)?.map((b) => (
                  <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>جنسیت</Label>
            <Select value={sex} onValueChange={setSex}>
              <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ANIMAL_SEXES.map((s) => <SelectItem key={s} value={s}>{ANIMAL_SEX_LABELS[s]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="animal-dob">تاریخ تولد</Label>
            <JalaliDateInput id="animal-dob" value={dateOfBirth} onChange={setDateOfBirth} ariaLabel="تاریخ تولد" className="mt-2" />
            <p className="mt-1 text-xs text-muted-foreground">در صورت نامشخص بودن، خالی بگذارید.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="animal-weight">وزن (کیلوگرم)</Label>
            <Input id="animal-weight" type="number" min="0" step="0.1" value={weight} onChange={(event) => setWeight(event.target.value)} className="mt-2" />
          </div>
          <div>
            <Label htmlFor="animal-color">رنگ</Label>
            <Input id="animal-color" value={color} onChange={(event) => setColor(event.target.value)} className="mt-2" />
          </div>
          <div>
            <Label htmlFor="animal-microchip">شماره میکروچیپ</Label>
            <Input id="animal-microchip" value={microchip} onChange={(event) => setMicrochip(event.target.value)} className="mt-2" dir="ltr" />
          </div>
        </div>

        <label className="flex items-center gap-2">
          <input type="checkbox" checked={neutered} onChange={(event) => setNeutered(event.target.checked)} />
          <span>عقیم‌شده (نوتر شده)</span>
        </label>

        <div>
          <Label htmlFor="animal-allergies">حساسیت‌ها</Label>
          <Textarea id="animal-allergies" value={allergies} onChange={(event) => setAllergies(event.target.value)} rows={2} className="mt-2" />
        </div>
        <div>
          <Label htmlFor="animal-notes">یادداشت پزشکی</Label>
          <Textarea id="animal-notes" value={medicalNotes} onChange={(event) => setMedicalNotes(event.target.value)} rows={3} className="mt-2" />
        </div>
        <div>
          <Label>وضعیت</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="active">فعال</SelectItem>
              <SelectItem value="deceased">درگذشته</SelectItem>
              <SelectItem value="transferred">انتقال‌یافته</SelectItem>
              <SelectItem value="archived">بایگانی‌شده</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={mutation.isPending}>افزودن حیوان</Button>
        <Button type="button" variant="outline" onClick={() => navigation.list('animals')}>انصراف</Button>
      </div>
    </form>
  );
}