"use client";

import { useState } from 'react';
import { useCreate, useNavigation, useSelect } from '@refinedev/core';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ServiceCreatePage() {
  const { mutateAsync: createService, mutation } = useCreate();
  const navigation = useNavigation();
  const { options: doctors } = useSelect({ resource: 'doctors', optionLabel: 'name', optionValue: 'id', meta: { select: 'id,name', filters: [{ field: 'is_active', operator: 'eq', value: true }] } });
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [isActive, setIsActive] = useState(true);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    await createService({
      resource: 'services',
      values: { name: name.trim(), price_rial: price ? Number(price) : null, doctor_id: doctorId || null, is_active: isActive },
    });
    navigation.list('services');
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl space-y-6">
      <div><h1 className="font-display text-2xl font-bold">افزودن خدمت</h1><p className="mt-1 text-muted-foreground">عنوان، قیمت، وضعیت و پزشک مسئول را تنظیم کنید.</p></div>
      <div className="space-y-5 rounded-app-lg border border-border bg-surface p-6">
        <div><Label htmlFor="service-name">عنوان خدمت</Label><Input id="service-name" value={name} onChange={(event) => setName(event.target.value)} required className="mt-2" /></div>
        <div><Label htmlFor="service-price">قیمت (ریال)</Label><Input id="service-price" type="number" min="0" value={price} onChange={(event) => setPrice(event.target.value)} className="mt-2" /></div>
        <div><Label>پزشک مسئول</Label><Select value={doctorId} onValueChange={setDoctorId}><SelectTrigger className="mt-2"><SelectValue placeholder="پزشک را انتخاب کنید" /></SelectTrigger><SelectContent>{doctors.map((doctor) => <SelectItem key={doctor.value} value={doctor.value}>{doctor.label}</SelectItem>)}</SelectContent></Select></div>
        <label className="flex items-center gap-2"><input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} /> <span>این خدمت در سایت قابل رزرو باشد</span></label>
      </div>
      <div className="flex gap-3"><Button type="submit" disabled={mutation.isPending}>افزودن خدمت</Button><Button type="button" variant="outline" onClick={() => navigation.list('services')}>انصراف</Button></div>
    </form>
  );
}