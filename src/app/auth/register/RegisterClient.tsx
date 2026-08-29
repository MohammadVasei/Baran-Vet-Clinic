"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useGSAP } from "@/lib/gsap";
import { revealUp, prefersReducedMotion } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useRef } from "react";
import { MailIcon, LockIcon, UserIcon, EyeIcon, EyeOffIcon, AlertCircleIcon, CheckCircleIcon, ArrowIcon } from "@/components/icons";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const RegisterSchema = z.object({
  name: z.string().min(2, "نام باید حداقل ۲ کاراکتر باشد").max(100),
  email: z.string().email("ایمیل معتبر نیست"),
  password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "رمز عبور و تکرار آن مطابقت ندارند",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof RegisterSchema>;

export function RegisterClient({ callbackUrl = "/account" }: { callbackUrl?: string }) {
  const router = useRouter();
  const { signUp } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const root = useRef<HTMLDivElement>(null);
  const headline = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();

  const form = useForm<RegisterForm>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  useGSAP(
    () => {
      if (prefersReducedMotion() || reduced || !root.current || !headline.current) return;
      const revealTweens = [
        revealUp(headline.current, { once: true, y: 30 }),
        revealUp(".register-form", { once: true, y: 24, delay: 0.1 }),
      ];
      return () => revealTweens.forEach((t) => t.kill());
    },
    { scope: root, dependencies: [reduced] }
  );

  const handleSubmit = async (data: RegisterForm) => {
    setError(null);
    setLoading(true);
    const { error } = await signUp(data.email, data.password, {
      data: { full_name: data.name },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess("حساب کاربری با موفقیت ایجاد شد. لطفاً ایمیل خود را تایید کنید.");
      setTimeout(() => router.push(`/auth/login?callbackUrl=${callbackUrl}`), 2000);
    }
  };

  return (
    <div ref={root} className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link href="/" className="inline-block mb-6" aria-label="باران کلینیک - خانه">
            <img src="/baran-logo-navbar.png" alt="باران کلینیک" width={80} height={80} className="mx-auto" />
          </Link>
          <h1 ref={headline} className="font-display text-3xl font-bold text-foreground">
            ایجاد حساب کاربری
          </h1>
          <p className="mt-2 text-muted-foreground">
            برای خرید، رزرو نوبت و مدیریت سفارشات عضو شوید
          </p>
        </div>

        <div className="rounded-app-lg border border-border bg-surface p-6 space-y-6">
          {/* Error/Success Messages */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-app bg-red-50 border border-red-100 text-red-700 text-sm">
              <AlertCircleIcon className="size-4" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 p-3 rounded-app bg-green-50 border border-green-100 text-green-700 text-sm">
              <CheckCircleIcon className="size-4" />
              <span>{success}</span>
            </div>
          )}

          <form className="register-form space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="name">نام و نام خانوادگی</Label>
              <div className="relative">
                <UserIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                <Input
                  {...form.register("name")}
                  id="name"
                  type="text"
                  placeholder="محمد محمدی"
                  className="pr-10"
                  disabled={loading}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">ایمیل</Label>
              <div className="relative">
                <MailIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                <Input
                  {...form.register("email")}
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  className="pr-10"
                  disabled={loading}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">رمز عبور</Label>
              <div className="relative">
                <LockIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                <Input
                  {...form.register("password")}
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="حداقل ۶ کاراکتر"
                  className="pr-10"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "مخفی کردن رمز" : "نمایش رمز"}
                >
                  {showPassword ? <EyeOffIcon className="size-5" /> : <EyeIcon className="size-5" />}
                </button>
                {form.formState.errors.password && (
                  <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">تکرار رمز عبور</Label>
              <div className="relative">
                <LockIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                <Input
                  {...form.register("confirmPassword")}
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="تکرار رمز عبور"
                  className="pr-10"
                  disabled={loading}
                />
                {form.formState.errors.confirmPassword && (
                  <p className="text-sm text-red-600">{form.formState.errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full py-3" disabled={loading}>
              {loading ? "در حال ثبت‌نام..." : "ثبت‌نام"}
            </Button>
          </form>

          <div className="pt-4 border-t border-border text-center">
            <p className="text-muted-foreground">
              قبلاً ثبت‌نام کرده‌اید؟{" "}
              <Link href={`/auth/login?callbackUrl=${callbackUrl}`} className="text-primary-text hover:underline font-medium">
                ورود
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="link-reveal inline-flex items-center gap-1.5 font-label text-sm font-medium text-muted-foreground hover:text-primary-text"
          >
            <ArrowIcon direction="back" className="size-4" />
            بازگشت به صفحه اصلی
          </Link>
        </div>
      </div>
    </div>
  );
}