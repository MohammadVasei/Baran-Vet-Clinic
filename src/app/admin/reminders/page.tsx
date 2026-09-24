"use client";

import { UpcomingReminders } from '@/components/admin/UpcomingReminders';
import { useCan } from '@refinedev/core';
import { PageHelp } from "@/components/admin/PageHelp";

export default function RemindersPage() {
  const canList = useCan({ resource: 'reminders', action: 'list' });

  if (canList.isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  if (!canList.data) {
    return <div className="p-6 text-center text-muted-foreground">دسترسی به این بخش برای شما مجاز نیست.</div>;
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3"><h1 className="text-2xl font-bold text-foreground">یادآوری‌های در انتظار</h1><PageHelp id="reminders-list" /></div>
        <div className="text-sm text-muted-foreground">
          لیست تمام یادآوری‌های واکسیناسیون، ضدانگل، دندان‌پزشکی و سایر موارد پاراکلینیک
        </div>
      </div>
      <UpcomingReminders />
    </div>
  );
}