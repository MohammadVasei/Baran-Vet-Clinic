"use client";

import { useRef, useMemo } from 'react';
import { gsap, useGSAP } from '@/lib/gsap';
import { prefersReducedMotion, duration, ease } from '@/lib/motion';
import { Calendar, DateObject } from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';

interface JalaliCalendarProps {
  selectedDate?: string;
  onDateSelect: (date: string) => void;
  bookedDates?: string[];
  blockedDates?: string[];
  today?: string;
  className?: string;
}

export function JalaliCalendar({
  selectedDate,
  onDateSelect,
  bookedDates = [],
  blockedDates = [],
  today,
  className = '',
}: JalaliCalendarProps) {
  const calendarRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion() || !calendarRef.current) return;
      gsap.fromTo(
        calendarRef.current,
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
    {}
  );

  const handleDateChange = (date: DateObject | null) => {
    if (!date) return;
    const iso = date.toDate().toISOString().slice(0, 10);
    onDateSelect(iso);
  };

  const isBooked = useMemo(() => new Set(bookedDates), [bookedDates]);
  const isBlocked = useMemo(() => new Set(blockedDates), [blockedDates]);

  const isBookedDate = (date: string) => isBooked.has(date);
  const isBlockedDate = (date: string) => isBlocked.has(date);
  const isTodayDate = (date: string) => date === today;
  const isSelectedDate = (date: string) => date === selectedDate;
  const minimumDate = today
    ? new DateObject({
        date: new Date(`${today}T12:00:00.000Z`),
        calendar: persian,
        locale: persian_fa,
      })
    : undefined;
  const initialMonth = today
    ? new DateObject({
        date: new Date(`${today}T12:00:00.000Z`),
        calendar: persian,
        locale: persian_fa,
      })
    : undefined;

  const handleTodayClick = () => {
    if (!today) return;
    onDateSelect(today);
  };

  return (
    <div ref={calendarRef} className={`rounded-app-lg border border-border bg-surface p-4 ${className}`} dir="rtl">
      <div className="flex justify-end mb-2">
        <button
          type="button"
          onClick={handleTodayClick}
          className="rounded-app px-2 py-1 text-xs font-medium text-primary hover:bg-muted transition-colors"
        >
          امروز
        </button>
      </div>

      {/* Calendar Grid */}
      <Calendar
        value={selectedDate ? new Date(`${selectedDate}T12:00:00.000Z`) : undefined}
        onChange={handleDateChange}
        minDate={minimumDate}
        currentDate={initialMonth}
        calendar={persian}
        locale={persian_fa}
        format="YYYY/MM/DD"
        mapDays={({ date, selectedDate: sel }) => {
          const dayDate = date.toDate().toISOString().slice(0, 10);
          const booked = isBookedDate(dayDate);
          const blocked = isBlockedDate(dayDate);
          const todayMatch = isTodayDate(dayDate);
          const selectedMatch = sel != null && isSelectedDate(dayDate);
          const disabled = booked || blocked || dayDate < (today || '');

          const classes: string[] = ['relative flex items-center justify-center h-10 w-full rounded-lg text-sm font-medium transition-all'];
          if (disabled) classes.push('opacity-40 cursor-not-allowed');
          if (selectedMatch) classes.push('!bg-primary !text-primary-foreground');
          else if (booked) classes.push('bg-yellow-100 text-yellow-800');
          else if (blocked) classes.push('bg-red-100 text-red-800');
          else if (todayMatch) classes.push('ring-2 ring-primary');

          return { disabled, className: classes.join(' ') };
        }}
      />

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-primary" />
          <span>انتخاب شده</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-300" />
          <span>رزرو شده</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-100 border border-red-300" />
          <span>مسدود</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded ring-2 ring-primary ring-offset-2 ring-offset-surface" />
          <span>امروز</span>
        </div>
      </div>
    </div>
  );
}