"use client";

import { useForm } from '@refinedev/react-hook-form';
import { useShow, useUpdate, useNavigation, useSelect } from '@refinedev/core';
import { useMemo } from 'react';
import { useGSAP } from '@/lib/gsap';
import { prefersReducedMotion, duration, ease } from '@/lib/motion';
import { ArrowIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface FormValues {
  doctor_id: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  reason: string;
  description: string;
}

interface BlockData {
  id: string;
  doctor_id: string;
  start_at: string;
  end_at: string;
  reason: string;
  description: string | null;
  created_at: string;
}

const reasonOptions = [
  { value: 'holiday', label: 'تعطیلی' },
  { value: 'absence', label: 'مرخصی/غیبت' },
  { value: 'maintenance', label: 'تعمیرات' },
  { value: 'other', label: 'سایر' },
];

export function AvailabilityBlockEdit() {
  const { result, query } = useShow<BlockData>({
    resource: 'availability-blocks',
    meta: {
      select: 'id,doctor_id,start_at,end_at,reason,description,created_at',
    },
  });

  const { mutate: updateBlock } = useUpdate();
  const navigate = useNavigation();

  const { options: doctorOptions } = useSelect({
    resource: 'doctors',
    optionLabel: 'name',
    optionValue: 'id',
    meta: {
      select: 'id,name',
      filters: [{ field: 'is_active', operator: 'eq', value: true }],
    },
  });

  const block = result;

  const defaultValues = useMemo<FormValues>(() => {
    if (!block) {
      return {
        doctor_id: '',
        start_date: '',
        end_date: '',
        start_time: '09:00',
        end_time: '17:00',
        reason: 'absence',
        description: '',
      };
    }
    const start = new Date(block.start_at);
    const end = new Date(block.end_at);
    return {
      doctor_id: block.doctor_id,
      start_date: start.toISOString().slice(0, 10),
      end_date: end.toISOString().slice(0, 10),
      start_time: start.toTimeString().slice(0, 5),
      end_time: end.toTimeString().slice(0, 5),
      reason: block.reason,
      description: block.description || '',
    };
  }, [block]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues,
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const startDateTime = `${values.start_date}T${values.start_time}:00.000Z`;
      const endDateTime = `${values.end_date}T${values.end_time}:00.000Z`;

      await updateBlock(
        {
          id: block!.id,
          resource: 'availability-blocks',
          values: {
            doctor_id: values.doctor_id || block!.doctor_id,
            start_at: startDateTime,
            end_at: endDateTime,
            reason: values.reason,
            description: values.description,
          },
        },
      );
      navigate.list('availability-blocks');
    } catch (error) {
      alert('خطا در به‌روزرسانی: ' + (error as Error).message);
    }
  });

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        '.block-edit-card',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: duration('--duration-normal'),
          ease: ease(),
          stagger: 0.1,
          overwrite: 'auto',
        }
      );
    },
    { dependencies: [block] }
  );

  if (query.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (query.isError || !block) {
    return (
      <div className="rounded-app border border-destructive bg-destructive/10 p-4 text-center text-destructive">
        خطا در بارگذاری بازه غیرفعال
      </div>
    );
  }

  const reasonSelectItems = reasonOptions.map(opt => (
    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
  ));

  const doctorSelectItems = doctorOptions.map((opt) => (
    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
  ));

  return (
    <div className="space-y-6 block-edit-card">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">ویرایش بازه غیرفعال</h1>
          <p className="text-muted-foreground mt-1">شناسه: {block.id.slice(0, 8)}...</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate.list('availability-blocks')}>
            <ArrowIcon direction="forward" className="size-4" />
            بازگشت
          </Button>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <Card className="block-edit-card">
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
                  {...register('doctor_id')}
                  defaultValue={block.doctor_id}
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
                  {...register('reason')}
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
                  {...register('start_date', { required: 'تاریخ شروع الزامی است' })}
                  type="date"
                  className="w-full"
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
                  {...register('end_date', { required: 'تاریخ پایان الزامی است' })}
                  type="date"
                  className="w-full"
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

            <div>
              <Label htmlFor="description" className="block text-sm font-medium text-muted-foreground mb-2">
                توضیحات
              </Label>
              <Textarea
                {...register('description')}
                placeholder="توضیحات اضافه (اختیاری)"
                rows={3}
                className="w-full"
              />
            </div>

            <div className="pt-4 border-t border-border flex gap-3">
              <Button type="submit" className="flex-1">
                ذخیره تغییرات
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate.list('availability-blocks')} className="flex-1">
                انصراف
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

export default AvailabilityBlockEdit;