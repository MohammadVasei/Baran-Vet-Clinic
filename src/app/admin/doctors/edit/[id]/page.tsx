"use client";

import { useEffect, useState } from 'react';
import { useList, useNavigation, useShow, useUpdate } from '@refinedev/core';
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

interface ServiceOption {
  id: string;
  name: string;
  doctor_id: string | null;
  is_active: boolean;
}

export default function DoctorEditPage() {
  const { result, query } = useShow<DoctorData>({ resource: 'doctors', meta: { select: 'id,name,bio,is_active' } });
  const { mutateAsync: updateDoctor } = useUpdate();
  const { mutateAsync: updateService } = useUpdate();
  const navigation = useNavigation();
  const { result: servicesResult, query: servicesQuery } = useList<ServiceOption>({
    resource: 'services',
    meta: { select: 'id,name,doctor_id,is_active' },
    pagination: { mode: 'off' },
  });
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [toggledServices, setToggledServices] = useState<Record<string, boolean>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const services = servicesResult?.data || [];

  useEffect(() => {
    if (!result) return;
    setName(result.name);
    setBio(result.bio || '');
    setIsActive(result.is_active);
  }, [result]);

  if (query.isLoading || servicesQuery.isLoading) return <div className="p-8 text-center">در حال بارگذاری...</div>;
  if (!result) return <div className="p-8 text-center text-destructive">پزشک یافت نشد.</div>;

  const activeServices = services.filter((s) => s.is_active);

  const isServiceSelected = (id: string): boolean => {
    if (id in toggledServices) return toggledServices[id];
    const service = services.find((s) => s.id === id);
    return service?.is_active === true && service.doctor_id === result.id;
  };

  const toggleService = (id: string) => {
    setToggledServices((prev) => ({ ...prev, [id]: !isServiceSelected(id) }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError(null);
    setSaving(true);
    try {
      await updateDoctor({
        resource: 'doctors',
        id: result.id,
        values: { name: name.trim(), bio: bio.trim() || null, is_active: isActive },
      });

      const currentAssignments = new Map<string, string | null>(services.map((s) => [s.id, s.doctor_id]));
      const changed = services.filter((s) => {
        const wasAssigned = currentAssignments.get(s.id) === result.id;
        const nowSelected = isServiceSelected(s.id);
        return s.is_active && nowSelected !== wasAssigned;
      });

      for (const service of changed) {
        await updateService({
          resource: 'services',
          id: service.id,
          values: { doctor_id: isServiceSelected(service.id) ? result.id : null },
        });
      }

      navigation.list('doctors');
    } catch (err) {
      console.error('Doctor save error:', err);
      setSubmitError(
        'ذخیره تغییرات ناموفق بود. فقط مسئول کلینیک می‌تواند پزشک و تخصیص خدمات را ویرایش کند.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">ویرایش پزشک</h1>
        <p className="mt-1 text-muted-foreground">اطلاعات پزشک، وضعیت نمایش و خدمات مسئول را تنظیم کنید.</p>
      </div>

      {submitError && (
        <div role="alert" className="rounded-app border border-destructive bg-destructive/10 p-4 text-sm text-destructive flex items-start gap-3">
          <p>{submitError}</p>
        </div>
      )}

      <div className="space-y-5 rounded-app-lg border border-border bg-surface p-6">
        <div><Label htmlFor="doctor-name">نام پزشک</Label><Input id="doctor-name" value={name} onChange={(event) => setName(event.target.value)} required className="mt-2" /></div>
        <div><Label htmlFor="doctor-bio">معرفی</Label><Textarea id="doctor-bio" value={bio} onChange={(event) => setBio(event.target.value)} rows={4} className="mt-2" /></div>
        <label className="flex items-center gap-2"><input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} /> <span>پزشک فعال باشد</span></label>
      </div>

      <div className="space-y-4 rounded-app-lg border border-border bg-surface p-6">
        <div>
          <Label>خدمات این پزشک</Label>
          <p className="mt-1 text-sm text-muted-foreground">
            خدماتی که این پزشک مسئول نوبت‌دهی آن‌هاست را انتخاب کنید. هر خدمت تنها یک پزشک مسئول دارد.
          </p>
        </div>
        {activeServices.length === 0 ? (
          <p className="text-sm text-muted-foreground">هیچ خدمت فعالی وجود ندارد.</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {activeServices.map((service) => {
              const checked = isServiceSelected(service.id);
              return (
                <label
                  key={service.id}
                  className={`flex items-center gap-2 rounded-app border px-3 py-2.5 text-sm cursor-pointer transition-colors ${
                    checked ? 'border-primary bg-primary-soft' : 'border-border hover:bg-muted'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleService(service.id)}
                    className="size-4 accent-primary"
                  />
                  <span>{service.name}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>{saving ? 'در حال ذخیره…' : 'ذخیره تغییرات'}</Button>
        <Button type="button" variant="outline" onClick={() => navigation.list('doctors')}>انصراف</Button>
      </div>
    </form>
  );
}
