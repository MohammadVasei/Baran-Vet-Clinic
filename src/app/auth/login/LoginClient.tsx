"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useGSAP } from "@/lib/gsap";
import { revealUp, prefersReducedMotion } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useRef } from "react";
import { EyeIcon, EyeOffIcon, MailIcon, LockIcon, PhoneIcon, ArrowIcon, AlertCircleIcon, CheckCircleIcon } from "@/components/icons";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const LoginSchema = z.object({
  email: z.string().email("ایمیل معتبر نیست"),
  password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد"),
});

type LoginForm = z.infer<typeof LoginSchema>;

export function LoginClient({ callbackUrl = "/account" }: { callbackUrl?: string }) {
  const router = useRouter();
  const { signIn, signInWithPhone, verifyOtp } = useAuth();

  const [activeTab, setActiveTab] = useState<"email" | "phone">("email");
  const [showPassword, setShowPassword] = useState(false);
  const [phoneStep, setPhoneStep] = useState<"request" | "verify">("request");
  const [sentPhone, setSentPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const root = useRef<HTMLDivElement>(null);
  const headline = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();

  const emailForm = useForm<LoginForm>({
    resolver: zodResolver(LoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const phoneForm = useForm<{ phone: string; otp: string }>({
    defaultValues: { phone: "", otp: "" },
  });

  useGSAP(
    () => {
      if (prefersReducedMotion() || reduced || !root.current || !headline.current) return;
      const revealTweens = [
        revealUp(headline.current, { once: true, y: 30 }),
        revealUp(".auth-tabs", { once: true, y: 24, delay: 0.1 }),
        revealUp(".auth-form", { once: true, y: 24, delay: 0.2 }),
      ];
      return () => revealTweens.forEach((t) => t.kill());
    },
    { scope: root, dependencies: [reduced, activeTab, phoneStep] }
  );

  const handleEmailSubmit = async (data: LoginForm) => {
    setError(null);
    setLoading(true);
    const { error } = await signIn(data.email, data.password);
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      router.push(callbackUrl);
      router.refresh();
    }
  };

  const handlePhoneRequest = async (data: { phone: string }) => {
    setError(null);
    setLoading(true);
    const { error } = await signInWithPhone(data.phone);
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSentPhone(data.phone);
      setPhoneStep("verify");
      setSuccess("کد تایید به شماره شما ارسال شد");
    }
  };

  const handlePhoneVerify = async (data: { phone: string; otp: string }) => {
    setError(null);
    setLoading(true);
    const { error } = await verifyOtp(sentPhone, data.otp, "sms");
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      router.push(callbackUrl);
      router.refresh();
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
            ورود به حساب کاربری
          </h1>
          <p className="mt-2 text-muted-foreground">
            برای دسترسی به سفارشات، آدرس‌ها و تنظیمات وارد شوید
          </p>
        </div>

        <div className="auth-tabs rounded-app-lg border border-border bg-surface p-6 space-y-6">
          {/* Tabs */}
          <div className="flex gap-2" role="tablist" aria-label="روش ورود">
            <button
              role="tab"
              aria-selected={activeTab === "email"}
              onClick={() => { setActiveTab("email"); setPhoneStep("request"); setError(null); setSuccess(null); }}
              className={`flex-1 py-2 px-4 rounded-app text-sm font-medium transition-all ${
                activeTab === "email"
                  ? "bg-primary text-on-primary"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <MailIcon className="size-4 mr-2 inline" /> ایمیل و رمز
            </button>
            <button
              role="tab"
              aria-selected={activeTab === "phone"}
              onClick={() => { setActiveTab("phone"); setPhoneStep("request"); setError(null); setSuccess(null); }}
              className={`flex-1 py-2 px-4 rounded-app text-sm font-medium transition-all ${
                activeTab === "phone"
                  ? "bg-primary text-on-primary"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <PhoneIcon className="size-4 mr-2 inline" /> پیامک (OTP)
            </button>
          </div>

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

          {/* Email Form */}
          {activeTab === "email" && (
            <form className="auth-form space-y-4" onSubmit={emailForm.handleSubmit(handleEmailSubmit)}>
              <div className="space-y-2">
                <Label htmlFor="email">ایمیل</Label>
                <div className="relative">
                  <MailIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                  <Input
                    {...emailForm.register("email")}
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    className="pr-10"
                    disabled={loading}
                  />
                  {emailForm.formState.errors.email && (
                    <p className="text-sm text-red-600">{emailForm.formState.errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">رمز عبور</Label>
                  <Link
                    href="/auth/reset-password"
                    className="text-sm text-primary-text hover:underline"
                  >
                    فراموشی رمز عبور؟
                  </Link>
                </div>
                <div className="relative">
                  <LockIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                  <Input
                    {...emailForm.register("password")}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="******"
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
                  {emailForm.formState.errors.password && (
                    <p className="text-sm text-red-600">{emailForm.formState.errors.password.message}</p>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full py-3" disabled={loading}>
                {loading ? "در حال ورود..." : "ورود"}
              </Button>
            </form>
          )}

          {/* Phone Form - Request OTP */}
          {activeTab === "phone" && phoneStep === "request" && (
            <form className="auth-form space-y-4" onSubmit={phoneForm.handleSubmit(handlePhoneRequest)}>
              <div className="space-y-2">
                <Label htmlFor="phone">شماره موبایل</Label>
                <div className="relative">
                  <PhoneIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                  <Input
                    {...phoneForm.register("phone", { required: "شماره موبایل الزامی است", minLength: 11 })}
                    id="phone"
                    type="tel"
                    placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                    className="pr-10"
                    disabled={loading}
                    dir="ltr"
                  />
                  {phoneForm.formState.errors.phone && (
                    <p className="text-sm text-red-600">{phoneForm.formState.errors.phone.message}</p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  کد تایید به این شماره ارسال می‌شود
                </p>
              </div>

              <Button type="submit" className="w-full py-3" disabled={loading}>
                {loading ? "در حال ارسال..." : "ارسال کد تایید"}
              </Button>
            </form>
          )}

          {/* Phone Form - Verify OTP */}
          {activeTab === "phone" && phoneStep === "verify" && (
            <form className="auth-form space-y-4" onSubmit={phoneForm.handleSubmit(handlePhoneVerify)}>
              <div className="space-y-2">
                <Label>شماره موبایل</Label>
                <p className="text-sm text-foreground font-medium dir-ltr">{sentPhone}</p>
                <button
                  type="button"
                  onClick={() => { setPhoneStep("request"); phoneForm.reset(); }}
                  className="text-sm text-primary-text hover:underline"
                >
                  تغییر شماره
                </button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp">کد تایید</Label>
                <div className="relative">
                  <LockIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                  <Input
                    {...phoneForm.register("otp", { required: "کد تایید الزامی است", minLength: 5, maxLength: 6 })}
                    id="otp"
                    type="text"
                    placeholder="۱۲۳۴۵"
                    className="pr-10 text-center tracking-widest text-2xl"
                    disabled={loading}
                    dir="ltr"
                    autoComplete="one-time-code"
                  />
                  {phoneForm.formState.errors.otp && (
                    <p className="text-sm text-red-600">{phoneForm.formState.errors.otp.message}</p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  کد ۶ رقمی را وارد کنید
                </p>
              </div>

              <Button type="submit" className="w-full py-3" disabled={loading}>
                {loading ? "در حال تایید..." : "تایید و ورود"}
              </Button>
            </form>
          )}

          {/* Register Link */}
          <div className="pt-4 border-t border-border text-center">
            <p className="text-muted-foreground">
              حساب کاربری ندارید؟{" "}
              <Link href={`/auth/register?callbackUrl=${callbackUrl}`} className="text-primary-text hover:underline font-medium">
                ثبت‌نام
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