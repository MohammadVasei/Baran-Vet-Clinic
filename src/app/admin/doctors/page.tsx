"use client";

import Link from 'next/link';
import { useList } from '@refinedev/core';
import { CalendarIcon, EditIcon } from '@/components/icons';

interface Doctor {
  id: string;
  name: string;
  key: string | null;
  bio: string | null;
  is_active: boolean;
}

interface Service {
  id: string;
  name: string;
  doctor_id: string | null;
  is_active: boolean;
}

export default function DoctorsList() {
  const { result: doctorResult, query: doctorQuery } = useList<Doctor>({
    resource: 'doctors',
    sorters: [{ field: 'display_order', order: 'asc' }],
    meta: { select: 'id,name,key,bio,is_active' },
    pagination: { mode: 'off' },
  });
  const { result: serviceResult } = useList<Service>({
    resource: 'services',
    meta: { select: 'id,name,doctor_id,is_active' },
    pagination: { mode: 'off' },
  });
  const doctors = doctorResult?.data || [];
  const services = serviceResult?.data || [];

  if (doctorQuery.isLoading) return <div className="p-8 text-center">در حال بارگذاری پزشکان...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">مدیریت پزشکان</h1>
        <p className="mt-1 text-muted-foreground">پزشکان، خدمات مسئول و زمان‌های غیرفعال را مدیریت کنید.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {doctors.map((doctor) => {
          const assignedServices = services.filter((service) => service.doctor_id === doctor.id);
          return (
            <article key={doctor.id} className="rounded-app-lg border border-border bg-surface p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">{doctor.name}</h2>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">{doctor.key || doctor.id}</p>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs ${doctor.is_active ? 'bg-accent-green-soft text-accent-green-fg' : 'bg-muted text-muted-foreground'}`}>
                  {doctor.is_active ? 'فعال' : 'غیرفعال'}
                </span>
              </div>
              {doctor.bio && <p className="mt-4 text-sm text-muted-foreground">{doctor.bio}</p>}
              <div className="mt-4 border-t border-border pt-4">
                <p className="text-sm font-medium text-foreground">خدمات مسئول</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {assignedServices.length > 0 ? assignedServices.map((service) => (
                    <Link key={service.id} href={`/admin/services/show/${service.id}`} className="rounded-full bg-primary-soft px-2.5 py-1 text-xs text-primary-text hover:underline">
                      {service.name}
                    </Link>
                  )) : <span className="text-xs text-muted-foreground">خدمتی تعیین نشده است.</span>}
                </div>
              </div>
              <div className="mt-5 flex gap-2">
                <Link href="/admin/availability-blocks" className="btn btn-outline text-sm"><CalendarIcon className="size-4" /> زمان‌های غیرفعال</Link>
                <Link href={`/admin/doctors/edit/${doctor.id}`} className="btn btn-outline text-sm"><EditIcon className="size-4" /> ویرایش پزشک</Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
