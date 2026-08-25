"use client";

import { Button } from '@/components/ui/button';

export function ErrorComponent({
  error,
  reset,
}: {
  error: Error & { status?: number; digest?: string };
  reset: () => void;
}) {
  const getErrorMessage = () => {
    if (error.status === 401 || error.status === 403) {
      return 'شما مجاز به دسترسی به این بخش نیستید. لطفاً وارد شوید.';
    }
    if (error.status === 404) {
      return 'صفحه مورد نظر یافت نشد.';
    }
    if (error.status && error.status >= 500) {
      return 'خطای سرور رخ داده است. لطفاً بعداً تلاش کنید.';
    }
    return error.message || 'خطای ناشناخته‌ای رخ داده است.';
  };

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center rounded-app-lg border border-border bg-surface p-8 shadow-lg max-w-md w-full">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <svg className="size-8 text-destructive" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" x2="12" y1="8" y2="16" />
            <line x1="12" x2="12.01" y1="16" y2="16" />
          </svg>
        </div>
        <h1 className="font-display text-2xl font-bold text-foreground mb-2">
          {error.status ? `خطا ${error.status}` : 'خطا'}
        </h1>
        <p className="text-muted-foreground mb-6">{getErrorMessage()}</p>
        <div className="flex flex-col gap-3">
          <Button onClick={reset} className="w-full">
            تلاش مجدد
          </Button>
          <Button variant="outline" onClick={() => window.history.back()} className="w-full">
            بازگشت
          </Button>
        </div>
      </div>
    </div>
  );
}