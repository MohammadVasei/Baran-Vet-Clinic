"use client";

import { useEffect, useState } from 'react';
import { useNavigation, useSelect, useShow, useUpdate } from '@refinedev/core';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PeriodicConfigFields } from '@/components/admin/PeriodicConfigFields';
import type { ReminderIntervalUnit } from '@/lib/animals';
import { PageHelp } from "@/components/admin/PageHelp";

interface VaccineData {
  id: string;
  name: string;
  species_id: string;
  description: string | null;
  manufacturer: string | null;
  active: boolean;
  is_periodic: boolean;
  reminder_interval_value: number | null;
  reminder_interval_unit: ReminderIntervalUnit | null;
}

export default function VaccineEditPage() {
  const [initialLoad, setInitialLoad] = useState(true);
  const { result, query } = useShow<VaccineData>({
    resource: 'vaccines',
    meta: { select: 'id,name,species_id,description,manufacturer,active,is_periodic,reminder_interval_value,reminder_interval_unit' },
  });
  const { mutateAsync: updateVaccine, mutation } = useUpdate();
  const navigation = useNavigation();
  const { options: species } = useSelect({
    resource: 'species',
    optionLabel: 'name',
    optionValue: 'id',
    filters: [{ field: 'active', operator: 'eq', value: true }],
    meta: { select: 'id,name' },
  });
  const router = useRouter();

  const [name, setName] = useState('');
  const [speciesId, setSpeciesId] = useState('');
  const [description, setDescription] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isPeriodic, setIsPeriodic] = useState(false);
  const [intervalValue, setIntervalValue] = useState('');
  const [intervalUnit, setIntervalUnit] = useState<ReminderIntervalUnit>('months');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!result) return;
    setName(result.name);
    setSpeciesId(result.species_id);
    setDescription(result.description || '');
    setManufacturer(result.manufacturer || '');
    setIsActive(result.active);
    setIsPeriodic(result.is_periodic);
    setIntervalValue(result.reminder_interval_value != null ? String(result.reminder_interval_value) : '');
    setIntervalUnit(result.reminder_interval_unit || 'months');
    setInitialLoad(false);
  }, [result]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!result) return;
    
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);
    
    try {
      await updateVaccine({
        resource: 'vaccines',
        id: result.id,
        values: {
          name: name.trim(),
          species_id: speciesId,
          description: description.trim() || null,
          manufacturer: manufacturer.trim() || null,
          active: isActive,
          is_periodic: isPeriodic,
          reminder_interval_value: isPeriodic ? Number(intervalValue) : null,
          reminder_interval_unit: isPeriodic ? intervalUnit : null,
        },
      });
      setSubmitSuccess(true);
      
      // Redirect after a brief delay to show success state
      setTimeout(() => {
        router.push('/admin/medical-items');
      }, 1500);
    } catch (error: any) {
      setSubmitError(error.message || 'خطا در به‌روزرسانی واکسن. لطفاً دوباره امتحان کنید.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (query.isLoading || initialLoad) return <div className="p-8 text-center">در حال بارگذاری...</div>;
  if (!result) return <div className="p-8 text-center text-destructive">واکسن یافت نشد.</div>;

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      <div>
        <div className="flex items-center gap-3"><h1 className="font-display text-2xl font-bold text-foreground">ویرایش واکسن</h1><PageHelp id="vaccines-edit" /></div>
        <p className="mt-1 text-muted-foreground">اطلاعات این واکسن را به‌روزرسانی کنید.</p>
      </div>

      {submitSuccess && (
        <div className="rounded-app border border-primary bg-primary/10 p-4 text-center text-primary">
          واکسن با موفقیت به‌روزرسانی شد!
        </div>
      )}

      {submitError && (
        <div className="rounded-app border border-destructive bg-destructive/10 p-4 text-center text-destructive">
          {submitError}
        </div>
      )}

      <div className="space-y-5 rounded-app-lg border border-border bg-surface p-6">
        <div>
          <Label>گونه <span className="text-destructive">*</span></Label>
          <Select 
            value={speciesId} 
            onValueChange={setSpeciesId}
            disabled={isSubmitting}
          >
            <SelectTrigger className="mt-2"><SelectValue placeholder="گونه را انتخاب کنید" /></SelectTrigger>
            <SelectContent>
              {species.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="vaccine-name">نام واکسن <span className="text-destructive">*</span></Label>
          <Input 
            id="vaccine-name" 
            value={name} 
            onChange={(event) => setName(event.target.value)} 
            required 
            className="mt-2"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <Label htmlFor="vaccine-manufacturer">سازنده</Label>
          <Input 
            id="vaccine-manufacturer" 
            value={manufacturer} 
            onChange={(event) => setManufacturer(event.target.value)} 
            className="mt-2"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <Label htmlFor="vaccine-description">توضیحات</Label>
<Textarea 
            id="vaccine-description" 
            value={description} 
            onChange={(event) => setDescription(event.target.value)} 
            rows={3} 
            className="mt-2"
            disabled={isSubmitting}
          />
        </div>
        <label className="flex items-center gap-2">
          <input 
            type="checkbox" 
            checked={isActive} 
            onChange={(event) => setIsActive(event.target.checked)} 
            disabled={isSubmitting}
          />
          <span>این واکسن فعال باشد</span>
        </label>
      </div>

      <PeriodicConfigFields
        isPeriodic={isPeriodic}
        onIsPeriodicChange={setIsPeriodic}
        intervalValue={intervalValue}
        onIntervalValueChange={setIntervalValue}
        intervalUnit={intervalUnit}
        onIntervalUnitChange={setIntervalUnit}
        title="یادآوری مجدد این واکسن (دوره‌ای)"
        disabled={isSubmitting}
      />

      <div className="flex gap-3">
        <Button 
          type="submit" 
          disabled={mutation.isPending || isSubmitting}
          isLoading={mutation.isPending || isSubmitting}
        >
          {isSubmitting ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => router.push('/admin/medical-items')}
          disabled={isSubmitting}
        >
          انصراف
        </Button>
      </div>
    </form>
  );
}