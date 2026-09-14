"use client";

import { useState } from 'react';
import { useCreate, useNavigation, useSelect } from '@refinedev/core';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { PeriodicConfigFields } from '@/components/admin/PeriodicConfigFields';
import { TREATMENT_CATEGORIES, TREATMENT_CATEGORY_LABELS, type ReminderIntervalUnit } from '@/lib/animals';

export default function TreatmentCreatePage() {
  const { mutateAsync: createTreatment, mutation } = useCreate();
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
  const [category, setCategory] = useState('other');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isPeriodic, setIsPeriodic] = useState(false);
  const [intervalValue, setIntervalValue] = useState('');
  const [intervalUnit, setIntervalUnit] = useState<ReminderIntervalUnit>('months');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);
    
    try {
      await createTreatment({
        resource: 'treatment_types',
        values: {
          name: name.trim(),
          species_id: speciesId,
          category,
          description: description.trim() || null,
          active: isActive,
          is_periodic: isPeriodic,
          reminder_interval_value: isPeriodic ? Number(intervalValue) : null,
          reminder_interval_unit: isPeriodic ? intervalUnit : null,
        },
      });
      setSubmitSuccess(true);
      // Reset form after successful submission
      setName('');
      setSpeciesId('');
      setCategory('other');
      setDescription('');
      setIsActive(true);
      setIsPeriodic(false);
      setIntervalValue('');
      setIntervalUnit('months');
      
      // Redirect after a brief delay to show success state
      setTimeout(() => {
        router.push('/admin/medical-items');
      }, 1500);
    } catch (error: any) {
      setSubmitError(error.message || 'خطا در افزودن نوع درمان. لطفاً دوباره امتحان کنید.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">افزودن نوع درمان</h1>
        <p className="mt-1 text-muted-foreground">نوع درمان جدیدی را به کاتالوگ یک گونه اضافه کنید.</p>
      </div>

      {submitSuccess && (
        <div className="rounded-app border border-primary bg-primary/10 p-4 text-center text-primary">
          نوع درمان با موفقیت اضافه شد!
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
          <Label>دسته‌بندی <span className="text-destructive">*</span></Label>
          <Select 
            value={category} 
            onValueChange={setCategory}
            disabled={isSubmitting}
          >
            <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
            <SelectContent>
              {TREATMENT_CATEGORIES.map((cat) => <SelectItem key={cat} value={cat}>{TREATMENT_CATEGORY_LABELS[cat]}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="treatment-name">نام <span className="text-destructive">*</span></Label>
          <Input 
            id="treatment-name" 
            value={name} 
            onChange={(event) => setName(event.target.value)} 
            required 
            className="mt-2"
            placeholder="درمان پوست"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <Label htmlFor="treatment-description">توضیحات</Label>
          <Textarea 
            id="treatment-description" 
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
          <span>این نوع درمان فعال باشد</span>
        </label>
      </div>

      <PeriodicConfigFields
        isPeriodic={isPeriodic}
        onIsPeriodicChange={setIsPeriodic}
        intervalValue={intervalValue}
        onIntervalValueChange={setIntervalValue}
        intervalUnit={intervalUnit}
        onIntervalUnitChange={setIntervalUnit}
        title="انجام دوره‌ای این درمان (یادآوری خودکار)"
        disabled={isSubmitting}
      />

      <div className="flex gap-3">
        <Button 
          type="submit" 
          disabled={mutation.isPending || isSubmitting}
          isLoading={mutation.isPending || isSubmitting}
        >
          {isSubmitting ? 'در حال افزودن...' : 'افزودن نوع درمان'}
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