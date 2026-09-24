"use client";

import DatePicker, { DateObject } from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';

interface JalaliDateInputProps {
  value?: string;
  onChange: (value: string) => void;
  id?: string;
  name?: string;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
  containerClassName?: string;
  required?: boolean;
}

export function JalaliDateInput({
  value,
  onChange,
  id,
  name,
  placeholder,
  ariaLabel,
  className = '',
  containerClassName = 'w-full',
  required,
}: JalaliDateInputProps) {
  const selectedDate = value
    ? new Date(`${value}T12:00:00.000Z`)
    : undefined;

  const handleChange = (date: DateObject | null) => {
    onChange(date ? date.toDate().toISOString().slice(0, 10) : '');
  };

  return (
    <DatePicker
      value={selectedDate}
      onChange={handleChange}
      calendar={persian}
      locale={persian_fa}
      format="YYYY/MM/DD"
      inputClass={`flex h-10 w-full rounded-app border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring ${className}`}
      containerClassName={containerClassName}
      id={id}
      name={name}
      placeholder={placeholder}
      aria-label={ariaLabel}
      required={required}
    />
  );
}
