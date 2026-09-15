"use client";

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  REMINDER_INTERVAL_PRESETS,
  REMINDER_INTERVAL_UNITS,
  REMINDER_INTERVAL_UNIT_LABELS,
  type ReminderIntervalUnit,
} from '@/lib/animals';

interface PeriodicConfigFieldsProps {
  isPeriodic: boolean;
  onIsPeriodicChange: (value: boolean) => void;
  intervalValue: string;
  onIntervalValueChange: (value: string) => void;
  intervalUnit: ReminderIntervalUnit;
  onIntervalUnitChange: (value: ReminderIntervalUnit) => void;
  title?: string;
}

/**
 * Reusable reminder-interval configuration fields used by both the vaccine and
 * treatment-type catalog forms. When "periodic" is unchecked, no interval is
 * required and the item behaves exactly as a one-off treatment.
 */
export function PeriodicConfigFields({
  isPeriodic,
  onIsPeriodicChange,
  intervalValue,
  onIntervalValueChange,
  intervalUnit,
  onIntervalUnitChange,
  title = 'یادآوری دوره‌ای',
}: PeriodicConfigFieldsProps) {
  return (
    <div className="space-y-4 rounded-app-lg border border-border bg-surface p-5">
      <label className="flex items-center gap-2">
        <input type="checkbox" checked={isPeriodic} onChange={(event) => onIsPeriodicChange(event.target.checked)} />
        <span className="font-medium">{title}</span>
      </label>

      {isPeriodic && (
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">
            پس از ثبت‌شدن هر دوره‌ی این درمان، به‌صورت خودکار یادآوری اجرای مجدد برای صاحب حیوان و کلینیک ارسال می‌شود.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="reminder-interval-value">فاصله‌ی یادآوری <span className="text-destructive">*</span></Label>
              <Input
                id="reminder-interval-value"
                type="number"
                min="1"
                required={isPeriodic}
                value={intervalValue}
                onChange={(event) => onIntervalValueChange(event.target.value)}
                className="mt-2"
                placeholder="۱"
              />
            </div>
            <div>
              <Label>واحد فاصله <span className="text-destructive">*</span></Label>
              <Select value={intervalUnit} onValueChange={(value) => onIntervalUnitChange(value as ReminderIntervalUnit)}>
                <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {REMINDER_INTERVAL_UNITS.map((unit) => (
                    <SelectItem key={unit} value={unit}>{REMINDER_INTERVAL_UNIT_LABELS[unit]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-muted-foreground self-center">انتخاب سریع:</span>
            {REMINDER_INTERVAL_PRESETS.map((preset) => {
              const active = Number(intervalValue) === preset.value && intervalUnit === preset.unit;
              return (
                <button
                  key={`${preset.value}-${preset.unit}`}
                  type="button"
                  onClick={() => {
                    onIntervalValueChange(String(preset.value));
                    onIntervalUnitChange(preset.unit);
                  }}
                  className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                    active
                      ? 'bg-primary text-on-primary border-primary'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}