"use client";

import { useEffect, useState } from 'react';
import { useNavigation, useSelect, useShow, useUpdate } from '@refinedev/core';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ServiceData {
  id: string;
  name: string;
  price_rial: number | null;
  is_active: boolean;
  doctor_id: string | null;
}

export default function ServiceEditPage() {
  const { result, query } = useShow<ServiceData>({
    resource: 'services',
    meta: { select: 'id,name,price_rial,is_active,doctor_id' },
  });
  const { mutateAsync: updateService, mutation } = useUpdate();
  const navigation = useNavigation();
  const { options: doctors } = useSelect({ resource: 'doctors', optionLabel: 'name', optionValue: 'id', meta: { select: 'id,name', filters: [{ field: 'is_active', operator: 'eq', value: true }] } });
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!result) return;
    setName(result.name);
    setPrice(result.price_rial == null ? '' : String(result.price_rial));
    setDoctorId(result.doctor_id || '');
    setIsActive(result.is_active);
  }, [result]);

  if (query.isLoading) return <div className="p-8 text-center">در حال بارگذاری...</div>;
  if (!result) return <div className="p-8 text-center text-destructive">خدمت یافت نشد.</div>;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    await updateService({ resource: 'services', id: result.id, values: { name: name.trim(), price_rial: price ? Number(price) : null, doctor_id: doctorId || null, is_active: isActive } });
    navigation.show('services', result.id);
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl space-y-6">
      <div><h1 className="font-display text-2xl font-bold">ویرایش خدمت</h1><p className="mt-1 text-muted-foreground">عنوان، قیمت، وضعیت و پزشک مسئول را تنظیم کنید.</p></div>
      <div className="space-y-5 rounded-app-lg border border-border bg-surface p-6">
        <div><Label htmlFor="service-name">عنوان خدمت</Label><Input id="service-name" value={name} onChange={(event) => setName(event.target.value)} required className="mt-2" /></div>
        <div><Label htmlFor="service-price">قیمت (ریال)</Label><Input id="service-price" type="number" min="0" value={price} onChange={(event) => setPrice(event.target.value)} className="mt-2" /></div>
        <div><Label>پزشک مسئول</Label><Select value={doctorId} onValueChange={setDoctorId}><SelectTrigger className="mt-2"><SelectValue placeholder="پزشک را انتخاب کنید" /></SelectTrigger><SelectContent>{doctors.map((doctor) => <SelectItem key={doctor.value} value={doctor.value}>{doctor.label}</SelectItem>)}</SelectContent></Select></div>
        <label className="flex items-center gap-2"><input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} /> <span>این خدمت در سایت قابل رزرو باشد</span></label>
      </div>
      <div className="flex gap-3"><Button type="submit" disabled={mutation.isPending}>ذخیره تغییرات</Button><Button type="button" variant="outline" onClick={() => navigation.list('services')}>انصراف</Button></div>
    </form>
  );
}
