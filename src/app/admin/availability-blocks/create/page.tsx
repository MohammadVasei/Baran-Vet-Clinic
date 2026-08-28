"use client";

import { useForm } from '@refinedev/react-hook-form';
import { useCreate, useNavigation, useSelect } from '@refinedev/core';
import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { prefersReducedMotion, duration, ease } from '@/lib/motion';
import { ArrowIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { JalaliDateInput } from '@/components/admin/JalaliDateInput';

interface FormValues {
  doctor_id: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  reason: string;
}

const reasonOptions = [
  { value: 'holiday', label: 'تعطیلی' },
  { value: 'absence', label: 'مرخصی/غیبت' },
  { value: 'maintenance', label: 'تعمیرات' },
  { value: 'other', label: 'سایر' },
];

export function AvailabilityBlockCreate() {
  const { mutateAsync: createBlock } = useCreate<FormValues>();
  const navigate = useNavigation();
  const formRef = useRef<HTMLFormElement>(null);

  const { options: doctorOptions } = useSelect({
    resource: 'doctors',
    optionLabel: 'name',
    optionValue: 'id',
    meta: {
      select: 'id,name',
      filters: [{ field: 'is_active', operator: 'eq', value: true }],
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      doctor_id: '',
      start_date: '',
      end_date: '',
      start_time: '09:00',
      end_time: '17:00',
      reason: 'absence',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const startDateTime = `${values.start_date}T${values.start_time}:00.000Z`;
      const endDateTime = `${values.end_date}T${values.end_time}:00.000Z`;

      await createBlock(
        {
            resource: 'availability_blocks',
          values: {
            doctor_id: values.doctor_id,
            start_at: startDateTime,
            end_at: endDateTime,
            reason: values.reason,
          },
        },
      );
      navigate.list('availability-blocks');
    } catch (error) {
      console.error('Create error:', error);
      alert('خطا در ایجاد: ' + (error as Error).message);
    }
  });

  useGSAP(
    () => {
      if (prefersReducedMotion() || !formRef.current) return;
      gsap.fromTo(
        formRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: duration('--duration-normal'),
          ease: ease(),
          overwrite: 'auto',
        }
      );
    },
    { dependencies: [] }
  );

  const reasonSelectItems = reasonOptions.map(opt => (
    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
  ));

  const doctorSelectItems = doctorOptions.map((opt) => (
    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
  ));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">افزودن بازه غیرفعال</h1>
          <p className="text-muted-foreground mt-1">مسدود کردن بازه زمانی برای پزشک</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate.list('availability-blocks')}>
            <ArrowIcon direction="forward" className="size-4" />
            جدید
          </Button>
        </div>
      </div>

      <form ref={formRef} onSubmit={onSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-display text-xl">اطلاعات بازه غیرفعال</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="doctor_id" className="block text-sm font-medium text-muted-foreground mb-2">
                  پزشک <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={watch('doctor_id')}
                  onValueChange={(value) => setValue('doctor_id', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="پزشک را انتخاب کنید" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">پزشک را انتخاب کنید</SelectItem>
                    {doctorSelectItems}
                  </SelectContent>
                </Select>
                {errors.doctor_id && (
                  <p className="mt-1.5 text-sm text-destructive" role="alert">{String(errors.doctor_id.message)}</p>
                )}
              </div>

              <div>
                <Label htmlFor="reason" className="block text-sm font-medium text-muted-foreground mb-2">
                  دلیل <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={watch('reason')}
                  onValueChange={(value) => setValue('reason', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="دلیل را انتخاب کنید" />
                  </SelectTrigger>
                  <SelectContent>
                    {reasonSelectItems}
                  </SelectContent>
                </Select>
                {errors.reason && (
                  <p className="mt-1.5 text-sm text-destructive" role="alert">{String(errors.reason.message)}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date" className="block text-sm font-medium text-muted-foreground mb-2">
                  تاریخ شروع <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="hidden"
                  {...register('start_date', { required: 'تاریخ شروع الزامی است' })}
                  value={watch('start_date')}
                  readOnly
                />
                <JalaliDateInput
                  value={watch('start_date')}
                  onChange={(value) => setValue('start_date', value, { shouldValidate: true })}
                  id="start_date"
                />
                {errors.start_date && (
                  <p className="mt-1.5 text-sm text-destructive" role="alert">{String(errors.start_date.message)}</p>
                )}
              </div>

              <div>
                <Label htmlFor="end_date" className="block text-sm font-medium text-muted-foreground mb-2">
                  تاریخ پایان <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="hidden"
                  {...register('end_date', { required: 'تاریخ پایان الزامی است' })}
                  value={watch('end_date')}
                  readOnly
                />
                <JalaliDateInput
                  value={watch('end_date')}
                  onChange={(value) => setValue('end_date', value, { shouldValidate: true })}
                  id="end_date"
                />
                {errors.end_date && (
                  <p className="mt-1.5 text-sm text-destructive" role="alert">{String(errors.end_date.message)}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_time" className="block text-sm font-medium text-muted-foreground mb-2">
                  ساعت شروع <span className="text-destructive">*</span>
                </Label>
                <Input
                  {...register('start_time', { required: 'ساعت شروع الزامی است' })}
                  type="time"
                  className="w-full"
                />
                {errors.start_time && (
                  <p className="mt-1.5 text-sm text-destructive" role="alert">{String(errors.start_time.message)}</p>
                )}
              </div>

              <div>
                <Label htmlFor="end_time" className="block text-sm font-medium text-muted-foreground mb-2">
                  ساعت پایان <span className="text-destructive">*</span>
                </Label>
                <Input
                  {...register('end_time', { required: 'ساعت پایان الزامی است' })}
                  type="time"
                  className="w-full"
                />
                {errors.end_time && (
                  <p className="mt-1.5 text-sm text-destructive" role="alert">{String(errors.end_time.message)}</p>
                )}
              </div>
            </div>

          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" className="flex-1">
            ایجاد بازه غیرفعال
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate.list('availability-blocks')} className="flex-1">
            انصراف
          </Button>
        </div>
      </form>
    </div>
  );
}

export default AvailabilityBlockCreate;