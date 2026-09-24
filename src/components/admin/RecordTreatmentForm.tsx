"use client";

import { useMemo, useState } from 'react';
import { useList, useNavigation, useSelect, useShow } from '@refinedev/core';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { formatReminderDue, calculateNextReminderDate, REMINDER_INTERVAL_UNIT_LABELS } from '@/lib/animals';
import { supabaseClient } from '@/lib/supabase-client';
import { PageHelp } from "@/components/admin/PageHelp";
import { JalaliDateInput } from '@/components/admin/JalaliDateInput';

interface AnimalData {
  id: string;
  name: string;
  species_id: string;
}

interface VaccineOption {
  id: string;
  name: string;
  manufacturer: string | null;
  is_periodic: boolean;
  reminder_interval_value: number | null;
  reminder_interval_unit: string | null;
}

interface TreatmentOption {
  id: string;
  name: string;
  category: string;
  is_periodic: boolean;
  reminder_interval_value: number | null;
  reminder_interval_unit: string | null;
}

interface RecordTreatmentFormProps {
  animalId: string;
}

function formatIntervalPreview(value: number | null, unit: string | null): string {
  if (value == null) return '';
  return `${new Intl.NumberFormat('fa-IR').format(value)} ${REMINDER_INTERVAL_UNIT_LABELS[(unit as 'days' | 'weeks' | 'months' | 'years') || 'months'] || unit}`;
}

export function RecordTreatmentForm({ animalId }: RecordTreatmentFormProps) {
  const { result: animal } = useShow<AnimalData>({
    resource: 'animals',
    id: animalId,
    meta: { select: 'id,name,species_id' },
  });
  const navigation = useNavigation();

  const { result: vaccinesResult, query: vaccinesQuery } = useList<VaccineOption>({
    resource: 'vaccines',
    pagination: { pageSize: 200 },
    filters: [
      { field: 'active', operator: 'eq', value: true },
      { field: 'species_id', operator: 'eq', value: animal?.species_id },
    ],
    queryOptions: { enabled: Boolean(animal?.species_id) },
    meta: { select: 'id,name,manufacturer,is_periodic,reminder_interval_value,reminder_interval_unit' },
  });

  const { result: treatmentsResult, query: treatmentsQuery } = useList<TreatmentOption>({
    resource: 'treatment_types',
    pagination: { pageSize: 200 },
    filters: [
      { field: 'active', operator: 'eq', value: true },
      { field: 'species_id', operator: 'eq', value: animal?.species_id },
    ],
    queryOptions: { enabled: Boolean(animal?.species_id) },
    meta: { select: 'id,name,category,is_periodic,reminder_interval_value,reminder_interval_unit' },
  });

const { options: doctors } = useSelect({
   resource: 'doctors',
   optionLabel: 'name',
   optionValue: 'id',
   filters: [{ field: 'is_active', operator: 'eq', value: true }],
   meta: { select: 'id,name,role' },
});

  const [definitionType, setDefinitionType] = useState<'vaccine' | 'treatment'>('vaccine');
  const [definitionId, setDefinitionId] = useState('');
  const [performedDate, setPerformedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [reminderTime, setReminderTime] = useState('09:00');
  const [doctorId, setDoctorId] = useState('');
  const [notes, setNotes] = useState('');
  const [batch, setBatch] = useState('');
  const [dosage, setDosage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{ message: string; nextReminder: string | null } | null>(null);

  const vaccines = (vaccinesResult?.data as VaccineOption[]) || [];
  const treatments = (treatmentsResult?.data as TreatmentOption[]) || [];

  const isLoading = !animal || vaccinesQuery.isLoading || treatmentsQuery.isLoading;

  const options = definitionType === 'vaccine' ? vaccines : treatments;

  const selectedDefinition = useMemo(
    () => options.find((opt) => opt.id === definitionId) || null,
    [options, definitionId]
  );

  const nextDatePreview = useMemo(() => {
    if (!selectedDefinition?.is_periodic || !performedDate) return null;
    return calculateNextReminderDate(
      performedDate,
      selectedDefinition.reminder_interval_value,
      selectedDefinition.reminder_interval_unit
    );
  }, [selectedDefinition, performedDate]);

  const selectDefinitionType = (value: string) => {
    setDefinitionType(value as 'vaccine' | 'treatment');
    setDefinitionId('');
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!definitionId) {
      setError('لطفاً نوع درمان/واکسن را انتخاب کنید.');
      return;
    }
    setError('');
    setSubmitting(true);
    setSuccess(null);

    const details: Record<string, string> = {};
    if (batch.trim()) details.batch = batch.trim();
    if (dosage.trim()) details.dosage = dosage.trim();

    const { data, error: rpcError } = await supabaseClient.rpc('record_treatment', {
      p_animal_id: animalId,
      p_definition_type: definitionType,
      p_definition_id: definitionId,
      p_performed_date: performedDate,
      p_doctor_id: doctorId || null,
      p_notes: notes.trim() || null,
      p_details: Object.keys(details).length ? details : null,
      p_due_time: reminderTime || '09:00',
    });

    setSubmitting(false);

    if (rpcError) {
      setError(`ثبت ناموفق بود: ${rpcError.message}`);
      return;
    }

    const resultData = (data as { next_reminder_date: string | null; next_reminder_time: string | null; title: string }) || {};
    const nextReminder = resultData.next_reminder_date
      ? formatReminderDue(resultData.next_reminder_date, resultData.next_reminder_time)
      : null;
    setSuccess({
      message: `«${resultData.title || selectedDefinition?.name}» با موفقیت ثبت شد.`,
      nextReminder,
    });
  };

  if (success) {
    return (
      <div className="space-y-6">
        <div className="rounded-app-lg border border-green-200 bg-green-50 p-6 text-center space-y-2">
          <p className="text-lg font-bold text-green-700">✓ {success.message}</p>
          {success.nextReminder && (
            <p className="text-green-700">یادآوری بعدی: <span className="font-bold">{success.nextReminder}</span></p>
          )}
          <div className="pt-2">
            <Button type="button" variant="outline" onClick={() => navigation.show('animals', animalId)}>
              مشاهده سابقه درمان حیوان
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <div className="p-8 text-center">در حال بارگذاری...</div>;
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-2xl space-y-6">
      <div>
        <div className="flex items-center gap-3"><h1 className="font-display text-2xl font-bold text-foreground">ثبت درمان / واکسیناسیون</h1><PageHelp id="animals-record-treatment" /></div>
        <p className="mt-1 text-muted-foreground">
          ثبت درمان انجام‌شده برای: <span className="font-medium text-foreground">{animal?.name}</span>
        </p>
      </div>

      <div className="space-y-5 rounded-app-lg border border-border bg-surface p-6">
        <div>
          <Label>نوع درمان <span className="text-destructive">*</span></Label>
          <Select value={definitionType} onValueChange={selectDefinitionType}>
            <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="vaccine">واکسیناسیون</SelectItem>
              <SelectItem value="treatment">درمان / سایر</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>
            {definitionType === 'vaccine' ? 'واکسن' : 'نوع درمان'} <span className="text-destructive">*</span>
          </Label>
          <Select value={definitionId} onValueChange={setDefinitionId}>
            <SelectTrigger className="mt-2"><SelectValue placeholder="انتخاب کنید..." /></SelectTrigger>
            <SelectContent>
              {options.length === 0 && (
                <div className="px-3 py-2 text-sm text-muted-foreground">موردی برای این گونه تعریف نشده است.</div>
              )}
              {options.map((opt) => (
                <SelectItem key={opt.id} value={opt.id}>
                  {opt.name}
                  {opt.is_periodic ? ` — هر ${formatIntervalPreview(opt.reminder_interval_value, opt.reminder_interval_unit)}` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedDefinition?.is_periodic && (
            <p className="mt-2 text-xs text-muted-foreground">
              این درمان دوره‌ای است؛ یادآوری اجرای مجدد هر {formatIntervalPreview(selectedDefinition.reminder_interval_value, selectedDefinition.reminder_interval_unit)} ارسال خواهد شد.
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="performed-date">تاریخ انجام <span className="text-destructive">*</span></Label>
            <JalaliDateInput id="performed-date" value={performedDate} onChange={setPerformedDate} ariaLabel="تاریخ انجام" required className="mt-2" />
          </div>
          <div>
            <Label>پزشک</Label>
            <Select value={doctorId} onValueChange={setDoctorId}>
              <SelectTrigger className="mt-2"><SelectValue placeholder="انتخاب پزشک..." /></SelectTrigger>
              <SelectContent>
                {doctors.map((d) => <SelectItem key={d.value} value={d.value}>{d.label} { (d as { role?: string }).role && `- ${ (d as { role?: string }).role }` }</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="reminder-time">ساعت یادآوری</Label>
            <Input
              id="reminder-time"
              type="time"
              value={reminderTime}
              onChange={(event) => setReminderTime(event.target.value)}
              className="mt-2"
              aria-label="ساعت یادآوری"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              اگر درمان دوره‌ای باشد، یادآوری در این ساعت فعال می‌شود (پیش‌فرض: ۰۹:۰۰).
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="batch-number">شماره سری / بچ</Label>
            <Input id="batch-number" value={batch} onChange={(event) => setBatch(event.target.value)} className="mt-2" dir="ltr" />
          </div>
          <div>
            <Label htmlFor="dosage">دوز / مقدار</Label>
            <Input id="dosage" value={dosage} onChange={(event) => setDosage(event.target.value)} className="mt-2" />
          </div>
        </div>

        <div>
          <Label htmlFor="treatment-notes">توضیحات</Label>
          <Textarea id="treatment-notes" value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} className="mt-2" />
        </div>

        {nextDatePreview && (
          <div className="rounded-app-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">
            یادآوری بعدی برای «{selectedDefinition?.name}»: <span className="font-bold">{formatReminderDue(nextDatePreview, reminderTime)}</span>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-app border border-destructive bg-destructive/10 p-4 text-center text-destructive">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={submitting || !definitionId}>
          {submitting ? 'در حال ثبت...' : 'ثبت درمان'}
        </Button>
        <Button type="button" variant="outline" onClick={() => navigation.show('animals', animalId)}>انصراف</Button>
      </div>
    </form>
  );
}