"use client";

import { useNavigation, useShow } from '@refinedev/core';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TreatmentHistory } from '@/components/admin/TreatmentHistory';
import { UpcomingReminders } from '@/components/admin/UpcomingReminders';
import {
  ANIMAL_SEX_LABELS,
  ANIMAL_STATUS_LABELS,
  ANIMAL_STATUS_STYLES,
  getAnimalAge,
} from '@/lib/animals';

interface AnimalData {
  id: string;
  name: string;
  owner_id: string | null;
  owner_phone: string | null;
  species_id: string;
  species?: { id: string; name: string } | null;
  breed?: { id: string; name: string } | null;
  sex: string;
  date_of_birth: string | null;
  weight: number | null;
  color: string | null;
  microchip_number: string | null;
  neutered: boolean;
  allergies: string | null;
  medical_notes: string | null;
  status: string;
}

export default function AnimalShowPage() {
  const { result, query } = useShow<AnimalData>({
    resource: 'animals',
    meta: {
      select: 'id,name,owner_id,owner_phone,species_id,species:species(id,name),breed:breeds(id,name),sex,date_of_birth,weight,color,microchip_number,neutered,allergies,medical_notes,status',
    },
  });
  const navigation = useNavigation();

  if (query.isLoading) return <div className="p-8 text-center">در حال بارگذاری...</div>;
  if (!result) return <div className="p-8 text-center text-destructive">حیوان یافت نشد.</div>;

  const statusStyle = ANIMAL_STATUS_STYLES[result.status as keyof typeof ANIMAL_STATUS_STYLES] || 'bg-gray-100 text-gray-700';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">{result.name}</h1>
          <p className="mt-1 text-muted-foreground">
            {result.species?.name}
            {result.breed?.name && ` · ${result.breed.name}`} — {getAnimalAge(result.date_of_birth)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/admin/animals/record-treatment/${result.id}`}>
            <Button>ثبت درمان / واکسیناسیون</Button>
          </Link>
          <Button variant="outline" onClick={() => navigation.edit('animals', result.id)}>ویرایش</Button>
        </div>
      </div>

      {/* Animal info */}
      <div className="grid gap-4 rounded-app-lg border border-border bg-surface p-6 sm:grid-cols-3">
        <div>
          <span className="text-sm text-muted-foreground">وضعیت</span>
          <p className="mt-1">
            <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${statusStyle}`}>
              {ANIMAL_STATUS_LABELS[result.status as keyof typeof ANIMAL_STATUS_LABELS] || result.status}
            </span>
          </p>
        </div>
        <div>
          <span className="text-sm text-muted-foreground">جنسیت</span>
          <p className="mt-1 font-medium">{ANIMAL_SEX_LABELS[result.sex as keyof typeof ANIMAL_SEX_LABELS] || '—'}</p>
        </div>
        <div>
          <span className="text-sm text-muted-foreground">وزن</span>
          <p className="mt-1 font-medium">{result.weight != null ? `${result.weight} کیلوگرم` : '—'}</p>
        </div>
        <div>
          <span className="text-sm text-muted-foreground">صاحب</span>
          <p className="mt-1 font-medium">
            {result.owner_id ? 'حساب کاربری' : result.owner_phone ? <span dir="ltr">{result.owner_phone}</span> : '—'}
          </p>
        </div>
        <div>
          <span className="text-sm text-muted-foreground">میکروچیپ</span>
          <p className="mt-1 font-medium" dir="ltr">{result.microchip_number || '—'}</p>
        </div>
        <div>
          <span className="text-sm text-muted-foreground">عقیم‌سازی</span>
          <p className="mt-1 font-medium">{result.neutered ? 'انجام شده' : 'انجام نشده'}</p>
        </div>
        {result.allergies && (
          <div className="sm:col-span-2">
            <span className="text-sm text-muted-foreground">حساسیت‌ها</span>
            <p className="mt-1">{result.allergies}</p>
          </div>
        )}
        {result.medical_notes && (
          <div className="sm:col-span-3">
            <span className="text-sm text-muted-foreground">یادداشت پزشکی</span>
            <p className="mt-1">{result.medical_notes}</p>
          </div>
        )}
      </div>

      {/* Treatment history */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-foreground">سابقه درمان و واکسیناسیون</h2>
          <Link href={`/admin/animals/record-treatment/${result.id}`} className="text-sm text-primary hover:underline">
            ثبت مورد جدید
          </Link>
        </div>
        <TreatmentHistory animalId={result.id} />
      </div>

      {/* Upcoming reminders */}
      <div className="space-y-3">
        <h2 className="font-display text-xl font-bold text-foreground">یادآوری‌های این حیوان</h2>
        <UpcomingReminders animalId={result.id} />
      </div>
    </div>
  );
}