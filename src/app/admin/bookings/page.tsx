"use client";

import { useList, useUpdate, useNavigation, useCan } from '@refinedev/core';
import { AdminTable } from '@/components/admin/AdminTable';
import { JalaliCalendar } from '@/components/admin/JalaliCalendar';
import { EyeIcon, CalendarIcon, XIcon } from '@/components/icons';
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BookingRow {
  id: string;
  reference_code: string;
  booking_date: string;
  booking_time: string;
  customer_name: string;
  customer_phone: string;
  pet_name: string | null;
  pet_type: string | null;
  status: string;
  service_id: string;
  doctor_id: string;
  service_name?: string;
  doctor_name?: string;
  created_at: string;
}

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

export function BookingsList() {
  const { result, query } = useList<BookingRow>({
    resource: 'bookings',
    sorters: [
      { field: 'booking_date', order: 'desc' },
      { field: 'booking_time', order: 'asc' },
    ],
    meta: {
      select: 'id,service_id,doctor_id,booking_date,booking_time,customer_name,customer_phone,pet_name,pet_type,status,reference_code,created_at,service_name,doctor_name',
    },
  });
  const navigation = useNavigation();
  const { mutate: updateBooking } = useUpdate();
  const refetch = query.refetch;
  const { data: canData } = useCan({ resource: 'bookings', action: 'edit' });
  const can = canData?.can ?? false;

  const [filterDate, setFilterDate] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterDoctor, setFilterDoctor] = useState<string>('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>('');
  const [calendarBookedDates, setCalendarBookedDates] = useState<string[]>([]);
  const [calendarBlockedDates, setCalendarBlockedDates] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState<string>('');

  // Fetch calendar data when date filter changes
  useEffect(() => {
    if (!filterDate) return;
    const startOfMonth = new Date(filterDate);
    startOfMonth.setDate(1);
    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);

    const params = new URLSearchParams({
      date_gte: startOfMonth.toISOString().slice(0, 10),
      date_lte: endOfMonth.toISOString().slice(0, 10),
    });

    fetch(`/api/admin/bookings/calendar?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (data.booked) setCalendarBookedDates(data.booked);
        if (data.blocked) setCalendarBlockedDates(data.blocked);
      })
      .catch(console.error);
  }, [filterDate]);

  const handleEdit = (id: string) => navigation.edit('bookings', id);

  const handleStatusChange = (id: string, newStatus: string) => {
    setEditingId(id);
    setEditStatus(newStatus);
    updateBooking(
      { resource: 'bookings', id, values: { status: newStatus } },
      {
        onSuccess: () => {
          setEditingId(null);
          setEditStatus('');
          refetch();
        },
        onError: (error) => {
          setEditingId(null);
          setEditStatus('');
          alert('خطا در به‌روزرسانی: ' + (error instanceof Error ? error.message : String(error)));
        },
      });
  };

  const handleCalendarDateSelect = (date: string) => {
    setFilterDate(date);
    setSelectedCalendarDate(date);
    setShowCalendar(false);
  };

  const handleClearFilters = () => {
    setFilterDate('');
    setFilterStatus('');
    setFilterDoctor('');
  };

  const filteredData = useMemo(() => {
    let dataArray = result?.data || [];
    
    if (filterDate) {
      dataArray = dataArray.filter((b) => b.booking_date === filterDate);
    }
    if (filterStatus) {
      dataArray = dataArray.filter((b) => b.status === filterStatus);
    }
    if (filterDoctor) {
      dataArray = dataArray.filter((b) => b.doctor_id === filterDoctor);
    }
    
    return dataArray;
  }, [result?.data, filterDate, filterStatus, filterDoctor]);

  const today = new Date().toISOString().slice(0, 10);

  const columns = [
    {
      accessorKey: 'reference_code' as keyof BookingRow,
      header: 'کد پیگیری',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => <span className="font-mono font-medium text-sm">{getValue('reference_code') as string}</span>,
    },
    {
      accessorKey: 'booking_date' as keyof BookingRow,
      header: 'تاریخ',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => {
        const date = getValue('booking_date') as string;
        return new Date(date).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' });
      },
    },
    {
      accessorKey: 'booking_time' as keyof BookingRow,
      header: 'ساعت',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => <span className="font-mono">{getValue('booking_time') as string}</span>,
    },
    {
      accessorKey: 'customer_name' as keyof BookingRow,
      header: 'نام مشتری',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => <span>{getValue('customer_name') as string}</span>,
    },
    {
      accessorKey: 'customer_phone' as keyof BookingRow,
      header: 'تلفن',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => <span dir="ltr" className="font-mono text-sm">{getValue('customer_phone') as string}</span>,
    },
    {
      accessorKey: 'pet_type' as keyof BookingRow,
      header: 'حیوان',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => {
        const type = getValue('pet_type') as string | null;
        return type ? <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">{petTypeLabels[type] || type}</span> : <span className="text-muted-foreground">—</span>;
      },
    },
    {
      accessorKey: 'status' as keyof BookingRow,
      header: 'وضعیت',
      cellWithMeta: ({ getValue, original }: { getValue: (key: string) => unknown; original: BookingRow }) => {
        const status = getValue('status') as string;
        const config = statusLabels[status] || { label: status, class: 'bg-gray-100 text-gray-700' };
        
        if (editingId === original.id) {
          return (
            <Select value={editStatus} onValueChange={setEditStatus}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="وضعیت" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        }
        
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${config.class}`}>{config.label}</span>
        );
      },
    },
    {
      id: 'actions',
      header: 'عملیات',
      cellWithMeta: ({ original }: { original: BookingRow }) => (
        <div className="flex items-center gap-2">
          <button onClick={() => handleEdit(original.id)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" aria-label="مشاهده/ویرایش"><EyeIcon className="size-4" /></button>
          {can && (
            <div className="flex items-center gap-1">
              {statusOptions.map(opt => (
                original.status !== opt.value && (
                  <button
                    key={opt.value}
                    onClick={() => handleStatusChange(original.id, opt.value)}
                    disabled={editingId === original.id}
                    className={`p-1.5 rounded text-xs transition-colors ${
                      opt.value === 'confirmed' ? 'text-blue-600 hover:bg-blue-50' :
                      opt.value === 'completed' ? 'text-green-600 hover:bg-green-50' :
                      opt.value === 'cancelled' ? 'text-red-600 hover:bg-red-50' :
                      'text-yellow-600 hover:bg-yellow-50'
                    }`}
                    title={opt.label}
                  >
                    {opt.label.slice(0, 2)}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">مدیریت نوبت‌ها</h1>
          <p className="text-muted-foreground mt-1">لیست تمام نوبت‌های رزرو شده</p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-app-lg border border-border bg-surface p-4 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <JalaliCalendar
                selectedDate={filterDate}
                onDateSelect={handleCalendarDateSelect}
                bookedDates={calendarBookedDates}
                blockedDates={calendarBlockedDates}
                today={today}
                className="w-64"
              />
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="وضعیت" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">همه</SelectItem>
                {statusOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterDoctor} onValueChange={setFilterDoctor}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="پزشک" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">همه پزشکان</SelectItem>
                {(result?.data || []).map((d) => (
                  <SelectItem key={d.doctor_id} value={d.doctor_id}>{d.doctor_name || d.doctor_id}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(filterDate || filterStatus || filterDoctor) && (
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                <XIcon className="size-4" />
                پاک کردن فیلترها
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={showCalendar ? 'primary' : 'outline'}
              onClick={() => setShowCalendar(!showCalendar)}
            >
              <CalendarIcon className="size-4" />
              {showCalendar ? 'مخفی کردن تقویم' : 'نمایش تقویم'}
            </Button>
          </div>
        </div>

        {showCalendar && (
          <div className="mt-4 rounded-app border border-border bg-surface/50 p-4">
            <JalaliCalendar
              selectedDate={selectedCalendarDate}
              onDateSelect={handleCalendarDateSelect}
              bookedDates={calendarBookedDates}
              blockedDates={calendarBlockedDates}
              today={today}
            />
          </div>
        )}
      </div>

      <AdminTable
        columns={columns}
        data={filteredData as BookingRow[]}
        isLoading={query.isLoading}
      />

      {query.isError && <div className="rounded-app border border-destructive bg-destructive/10 p-4 text-center text-destructive">خطا در بارگذاری نوبت‌ها</div>}
    </div>
  );
}

export default BookingsList;