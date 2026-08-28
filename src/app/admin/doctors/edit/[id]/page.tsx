"use client";

import { useEffect, useState } from 'react';
import { useNavigation, useShow, useUpdate } from '@refinedev/core';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface DoctorData {
  id: string;
  name: string;
  bio: string | null;
  is_active: boolean;
}

export default function DoctorEditPage() {
  const { result, query } = useShow<DoctorData>({ resource: 'doctors', meta: { select: 'id,name,bio,is_active' } });
  const { mutateAsync: updateDoctor, mutation } = useUpdate();
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!result) return;
    setName(result.name);
    setBio(result.bio || '');
    setIsActive(result.is_active);
  }, [result]);

  if (query.isLoading) return <div className="p-8 text-center">در حال بارگذاری...</div>;
  if (!result) return <div className="p-8 text-center text-destructive">پزشک یافت نشد.</div>;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    await updateDoctor({ resource: 'doctors', id: result.id, values: { name: name.trim(), bio: bio.trim() || null, is_active: isActive } });
    navigation.list('doctors');
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl space-y-6">
      <div><h1 className="font-display text-2xl font-bold">ویرایش پزشک</h1><p className="mt-1 text-muted-foreground">اطلاعات پزشک و وضعیت نمایش را تنظیم کنید.</p></div>
      <div className="space-y-5 rounded-app-lg border border-border bg-surface p-6">
        <div><Label htmlFor="doctor-name">نام پزشک</Label><Input id="doctor-name" value={name} onChange={(event) => setName(event.target.value)} required className="mt-2" /></div>
        <div><Label htmlFor="doctor-bio">معرفی</Label><Textarea id="doctor-bio" value={bio} onChange={(event) => setBio(event.target.value)} rows={4} className="mt-2" /></div>
        <label className="flex items-center gap-2"><input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} /> <span>پزشک فعال باشد</span></label>
      </div>
      <div className="flex gap-3"><Button type="submit" disabled={mutation.isPending}>ذخیره تغییرات</Button><Button type="button" variant="outline" onClick={() => navigation.list('doctors')}>انصراف</Button></div>
    </form>
  );
}
