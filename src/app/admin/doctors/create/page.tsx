"use client";

import { useState } from 'react';
import { useCreate, useList, useNavigation, useUpdate } from '@refinedev/core';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ServiceOption {
  id: string;
  name: string;
  is_active: boolean;
}

export default function DoctorCreatePage() {
  const { mutateAsync: createDoctor, mutation } = useCreate();
  const { mutateAsync: updateService } = useUpdate();
  const navigation = useNavigation();

  const { result: servicesResult } = useList<ServiceOption>({
    resource: 'services',
    meta: { select: 'id,name,is_active' },
    pagination: { mode: 'off' },
  });
  const services = servicesResult?.data || [];

  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [role, setRole] = useState('');
  const [bio, setBio] = useState('');
  const [experience, setExperience] = useState('');
  const [clinicRole, setClinicRole] = useState('');
  const [image, setImage] = useState('');
  const [alt, setAlt] = useState('');
  const [slug, setSlug] = useState('');
  const [education, setEducation] = useState('');
  const [focusAreas, setFocusAreas] = useState('');
  const [displayOrder, setDisplayOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [selectedServices, setSelectedServices] = useState<Record<string, boolean>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const activeServices = services.filter((s) => s.is_active);

  const toggleService = (id: string) => {
    setSelectedServices((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError(null);
    try {
      const { data } = await createDoctor({
        resource: 'doctors',
        values: {
          name: name.trim(),
          key: key.trim() || null,
          role: role.trim() || null,
          bio: bio.trim() || null,
          experience: experience.trim() || null,
          clinic_role: clinicRole.trim() || null,
          image: image.trim() || null,
          alt: alt.trim() || null,
          slug: slug.trim() || null,
          education: education.split('\n').map((s) => s.trim()).filter(Boolean).length ? education.split('\n').map((s) => s.trim()).filter(Boolean) : null,
          focus_areas: focusAreas.split('\n').map((s) => s.trim()).filter(Boolean).length ? focusAreas.split('\n').map((s) => s.trim()).filter(Boolean) : null,
          display_order: Number(displayOrder) || 0,
          is_active: isActive,
        },
      });

      const newId = (data as unknown as { id: string })?.id;
      if (newId) {
        for (const service of activeServices) {
          if (selectedServices[service.id]) {
            await updateService({ resource: 'services', id: service.id, values: { doctor_id: newId } });
          }
        }
      }

      navigation.list('doctors');
    } catch (err) {
      console.error('Doctor create error:', err);
      setSubmitError('افزودن پزشک ناموفق بود. فقط مسئول کلینیک می‌تواند پزشک افزوده و تخصیص خدمات را ویرایش کند.');
    }
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">افزودن پزشک</h1>
        <p className="mt-1 text-muted-foreground">مشخصات پزشک، اطلاعات نمایش در سایت و خدمات مسئول را تنظیم کنید.</p>
      </div>

      {submitError && (
        <div role="alert" className="rounded-app border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
          {submitError}
        </div>
      )}

      <div className="space-y-5 rounded-app-lg border border-border bg-surface p-6">
        <p className="font-medium text-foreground">مشخصات پایه</p>
        <div>
          <Label htmlFor="doctor-name">نام پزشک</Label>
          <Input id="doctor-name" value={name} onChange={(event) => setName(event.target.value)} required className="mt-2" />
        </div>
        <div>
          <Label htmlFor="doctor-key">کلید یکتا</Label>
          <Input id="doctor-key" value={key} onChange={(event) => setKey(event.target.value)} className="mt-2" dir="ltr" placeholder="dr-tazik" />
          <p className="mt-1 text-xs text-muted-foreground">برای نمایش در سایت لازم است.</p>
        </div>
        <div>
          <Label htmlFor="doctor-slug">اسلاگ صفحه</Label>
          <Input id="doctor-slug" value={slug} onChange={(event) => setSlug(event.target.value)} className="mt-2" dir="ltr" placeholder="tazik" />
        </div>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />
          <span>پزشک فعال باشد</span>
        </label>
      </div>

      <div className="space-y-5 rounded-app-lg border border-border bg-surface p-6">
        <p className="font-medium text-foreground">نمایش در سایت</p>
        <div>
          <Label htmlFor="doctor-role">نقش</Label>
          <Input id="doctor-role" value={role} onChange={(event) => setRole(event.target.value)} className="mt-2" />
        </div>
        <div>
          <Label htmlFor="doctor-clinic-role">جایگاه در کلینیک</Label>
          <Input id="doctor-clinic-role" value={clinicRole} onChange={(event) => setClinicRole(event.target.value)} className="mt-2" />
        </div>
        <div>
          <Label htmlFor="doctor-bio">معرفی</Label>
          <Textarea id="doctor-bio" value={bio} onChange={(event) => setBio(event.target.value)} rows={4} className="mt-2" />
        </div>
        <div>
          <Label htmlFor="doctor-experience">سوابق</Label>
          <Textarea id="doctor-experience" value={experience} onChange={(event) => setExperience(event.target.value)} rows={3} className="mt-2" />
        </div>
        <div>
          <Label htmlFor="doctor-education">تحصیلات (هر مورد در یک خط)</Label>
          <Textarea id="doctor-education" value={education} onChange={(event) => setEducation(event.target.value)} rows={3} className="mt-2" />
        </div>
        <div>
          <Label htmlFor="doctor-focus">حیطه‌های تخصصی (هر مورد در یک خط)</Label>
          <Textarea id="doctor-focus" value={focusAreas} onChange={(event) => setFocusAreas(event.target.value)} rows={3} className="mt-2" />
        </div>
        <div>
          <Label htmlFor="doctor-image">آدرس تصویر</Label>
          <Input id="doctor-image" value={image} onChange={(event) => setImage(event.target.value)} className="mt-2" dir="ltr" placeholder="/images/..." />
        </div>
        <div>
          <Label htmlFor="doctor-alt">متن جایگزین تصویر</Label>
          <Input id="doctor-alt" value={alt} onChange={(event) => setAlt(event.target.value)} className="mt-2" />
        </div>
        <div>
          <Label htmlFor="doctor-order">ترتیب نمایش</Label>
          <Input id="doctor-order" type="number" min="0" value={displayOrder} onChange={(event) => setDisplayOrder(event.target.value)} className="mt-2" />
        </div>
      </div>

      <div className="space-y-4 rounded-app-lg border border-border bg-surface p-6">
        <div>
          <Label>خدمات این پزشک</Label>
          <p className="mt-1 text-sm text-muted-foreground">خدماتی که این پزشک مسئول نوبت‌دهی آن‌هاست را انتخاب کنید. هر خدمت تنها یک پزشک مسئول دارد.</p>
        </div>
        {activeServices.length === 0 ? (
          <p className="text-sm text-muted-foreground">هیچ خدمت فعالی وجود ندارد.</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {activeServices.map((service) => {
              const checked = !!selectedServices[service.id];
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
        <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'در حال ذخیره…' : 'افزودن پزشک'}</Button>
        <Button type="button" variant="outline" onClick={() => navigation.list('doctors')}>انصراف</Button>
      </div>
    </form>
  );
}