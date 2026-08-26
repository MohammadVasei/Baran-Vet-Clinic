"use client";

import { useShow, useUpdate, useNavigation } from '@refinedev/core';
import { useState } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { prefersReducedMotion, duration, ease } from '@/lib/motion';
import { ArrowIcon, CalendarIcon, ClockIcon, PhoneIcon, UserIcon, PawIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const statusLabels: Record<string, { label: string; class: string }> = {
  pending: { label: 'در انتظار', class: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'تأیید شده', class: 'bg-blue-100 text-blue-700' },
  completed: { label: 'انجام شده', class: 'bg-green-100 text-green-700' },
  cancelled: { label: 'لغو شده', class: 'bg-red-100 text-red-700' },
};

const statusOptions = [
  { value: 'pending', label: 'در انتظار' },
  { value: 'confirmed', label: 'تأیید شده' },
  { value: 'completed', label: 'انجام شده' },
  { value: 'cancelled', label: 'لغو شده' },
];

const petTypeLabels: Record<string, string> = {
  dog: 'سگ',
  cat: 'گربه',
  bird: 'پرنده',
  exotic: 'اگزوتیک',
  other: 'سایر',
};

export function BookingEdit() {
  const { result, query } = useShow({
    resource: 'bookings',
    meta: {
      select: 'id,service_id,doctor_id,booking_date,booking_time,customer_name,customer_phone,pet_name,pet_type,status,reference_code,created_at',
    },
  });
  const { mutate: updateBooking, mutation } = useUpdate();
  const isPending = mutation.isPending;
  const { list } = useNavigation();
  const booking = result;
  const [status, setStatus] = useState(() => booking?.status || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking) return;

    updateBooking(
      { resource: 'bookings', id: booking.id, values: { status } },
      {
        onSuccess: () => {
          list('/admin/bookings');
        },
        onError: (error) => {
          alert('خطا در به‌روزرسانی: ' + (error instanceof Error ? error.message : String(error)));
        },
      });
  };

  const handleCancel = () => {
    list('/admin/bookings');
  };

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        '.booking-edit-card',
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
    { dependencies: [booking] }
  );

  if (query.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="rounded-app border border-destructive bg-destructive/10 p-4 text-center text-destructive">
        خطا در بارگذاری نوبت
      </div>
    );
  }

  if (!booking) return null;

  const config = statusLabels[booking.status] || { label: booking.status, class: 'bg-gray-100 text-gray-700' };
  const dayLabel = new Date(booking.booking_date).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-6 booking-edit-card">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">ویرایش نوبت</h1>
          <p className="text-muted-foreground mt-1">کد پیگیری: {booking.reference_code}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => list('/admin/bookings')}>
            <ArrowIcon direction="forward" className="size-4" />
            بازگشت
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Booking Info Card */}
        <Card className="booking-edit-card">
          <CardHeader>
            <CardTitle className="font-display text-xl">اطلاعات نوبت</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">کد پیگیری</label>
                <div className="font-mono font-medium text-lg text-foreground">{booking.reference_code}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">وضعیت فعلی</label>
                <span className={`inline-flex items-center gap-1 px-2 py-1 text-sm rounded-full ${config.class}`}>{config.label}</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">تاریخ</label>
                <div className="flex items-center gap-2 text-foreground">
                  <CalendarIcon className="size-4 text-muted-foreground" />
                  <span>{dayLabel}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">ساعت</label>
                <div className="flex items-center gap-2 text-foreground">
                  <ClockIcon className="size-4 text-muted-foreground" />
                  <span className="font-mono">{booking.booking_time}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">خدمت</label>
                <div className="flex items-center gap-2 text-foreground">
                  <PawIcon className="size-4 text-muted-foreground" />
                  <span>{booking.service_name || '—'}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">پزشک</label>
                <div className="flex items-center gap-2 text-foreground">
                  <UserIcon className="size-4 text-muted-foreground" />
                  <span>{booking.doctor_name || '—'}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Info Card */}
        <Card className="booking-edit-card">
          <CardHeader>
            <CardTitle className="font-display text-xl">اطلاعات مشتری و حیوان</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">نام مشتری</label>
                <div className="flex items-center gap-2 text-foreground">
                  <UserIcon className="size-4 text-muted-foreground" />
                  <span>{booking.customer_name}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">تلفن</label>
                <div className="flex items-center gap-2 text-foreground">
                  <PhoneIcon className="size-4 text-muted-foreground" />
                  <span dir="ltr" className="font-mono">{booking.customer_phone}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">نام حیوان</label>
                <div className="flex items-center gap-2 text-foreground">
                  <PawIcon className="size-4 text-muted-foreground" />
                  <span>{booking.pet_name || '—'}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">نوع حیوان</label>
                {booking.pet_type && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-sm rounded-full bg-blue-100 text-blue-700">
                    {petTypeLabels[booking.pet_type] || booking.pet_type}
                  </span>
                )}
              </div>
            </div>
            <div className="pt-4 border-t border-border">
              <label className="block text-sm font-medium text-muted-foreground mb-1">تاریخ ایجاد</label>
              <div className="text-foreground">
                {new Date(booking.created_at).toLocaleString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Update Card */}
        <Card className="booking-edit-card">
          <CardHeader>
            <CardTitle className="font-display text-xl">تغییر وضعیت</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">وضعیت جدید</label>
              <Select value={status} onValueChange={setStatus} disabled={isPending}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="انتخاب وضعیت" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <span className={`flex items-center gap-2 ${opt.value === booking.status ? 'text-muted-foreground' : ''}`}>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
                          opt.value === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          opt.value === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                          opt.value === 'completed' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {opt.label}
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4 border-t border-border flex gap-3">
              <Button type="submit" disabled={isPending || status === booking.status} className="flex-1">
                {isPending ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">
                انصراف
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

export default BookingEdit;