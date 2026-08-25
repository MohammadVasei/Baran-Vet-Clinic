"use client";

import { useForm } from '@refinedev/react-hook-form';
import { useLogin } from '@refinedev/core';
import { useState, useRef } from 'react';
import { useGSAP } from '@/lib/gsap';
import { revealLines, revealUp, prefersReducedMotion, duration, ease } from '@/lib/motion';
import { LockIcon, MailIcon, EyeIcon, EyeOffIcon } from '@/components/icons';

export function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { mutate: login, isPending } = useLogin();
  const formRef = useRef<HTMLFormElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
      remember: false,
    },
  });

  const email = watch('email');

  const submit = handleSubmit(async (values) => {
    try {
      await login(
        { email: values.email, password: values.password },
        {
          onSuccess: () => {},
          onError: (error) => {
            console.error('Login failed:', error);
          },
        }
      );
    } catch (error) {
      console.error('Login error:', error);
    }
  });

  useGSAP(
    () => {
      if (prefersReducedMotion() || !formRef.current) return;
      const { split } = revealLines(formRef.current.querySelector('h1') as HTMLHeadingElement, {
        mask: true,
        stagger: 0.1,
        start: 'top 90%',
        once: true,
      });
      revealUp('.login-field', { delay: 0.2, once: true });
      revealUp('.login-submit', { delay: 0.4, once: true });
      revealUp('.login-footer', { delay: 0.5, once: true });
      return () => split.revert();
    },
    { scope: formRef }
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4" dir="rtl">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-6">
            <svg className="w-8 h-8 text-on-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M12 21s-6.5-5.4-6.5-10A6.5 6.5 0 0 1 12 4.5 6.5 6.5 0 0 1 18.5 11c0 4.6-6.5 10-6.5 10Z" />
              <circle cx="12" cy="11" r="2.4" />
            </svg>
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground">ورود به پنل مدیریت</h1>
          <p className="mt-2 text-muted-foreground">کد کاربری و رمز عبور خود را وارد کنید</p>
        </div>

        <form
          ref={formRef}
          onSubmit={submit}
          className="rounded-app-lg border border-border bg-surface p-6 sm:p-8 shadow-lg space-y-6"
        >
          <div className="space-y-4">
            <div className="login-field">
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                ایمیل
              </label>
              <div className="relative">
                <MailIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" aria-hidden />
                <input
                  {...register('email', {
                    required: 'ایمیل الزامی است',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'فرمت ایمیل معتبر نیست',
                    },
                  })}
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 rounded-app border border-border bg-surface text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="admin@baran-clinic.ir"
                  aria-invalid={!!errors.email}
                  disabled={isPending}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-sm text-destructive" role="alert">{errors.email.message}</p>
              )}
            </div>

            <div className="login-field">
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                رمز عبور
              </label>
              <div className="relative">
                <LockIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" aria-hidden />
                <input
                  {...register('password', {
                    required: 'رمز عبور الزامی است',
                    minLength: {
                      value: 6,
                      message: 'رمز عبور باید حداقل ۶ کاراکتر باشد',
                    },
                  })}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="w-full pl-10 pr-12 py-3 rounded-app border border-border bg-surface text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="••••••••"
                  aria-invalid={!!errors.password}
                  disabled={isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? 'مخفی کردن رمز' : 'نمایش رمز'}
                >
                  {showPassword ? <EyeOffIcon className="size-5" /> : <EyeIcon className="size-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-sm text-destructive" role="alert">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  {...register('remember')}
                  type="checkbox"
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-2"
                />
                <span className="text-sm text-muted-foreground">مرا به خاطر بسپار</span>
              </label>
              <a
                href="/admin/forgot-password"
                className="text-sm text-primary hover:underline"
              >
                فراموشی رمز عبور؟
              </a>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="login-submit w-full btn btn-primary py-3 text-base font-semibold"
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" />
                  <path className="opacity-75" d="M12 2a10 10 0 0 1 10 10" />
                </svg>
                در حال ورود...
              </span>
            ) : (
              'ورود'
            )}
          </button>

          <div className="login-footer text-center">
            <p className="text-sm text-muted-foreground">
              فقط کارکنان کلینیک مجاز به ورود هستند
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}