"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useGSAP } from "@/lib/gsap";
import { revealUp, prefersReducedMotion } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useRef } from "react";
import { MailIcon, LockIcon, EyeIcon, EyeOffIcon, AlertCircleIcon, CheckCircleIcon, ArrowIcon } from "@/components/icons";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const ResetSchema = z.object({
  password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "رمز عبور و تکرار آن مطابقت ندارند",
  path: ["confirmPassword"],
});

type ResetForm = z.infer<typeof ResetSchema>;

const RequestSchema = z.object({
  email: z.string().email("ایمیل معتبر نیست"),
});

type RequestForm = z.infer<typeof RequestSchema>;

export function ResetPasswordClient({ type }: { type?: string | null }) {
  const router = useRouter();
  const { resetPassword, updatePassword } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<"request" | "reset">(type === "recovery" ? "reset" : "request");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const root = useRef<HTMLDivElement>(null);
  const headline = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();

  const requestForm = useForm<RequestForm>({
    resolver: zodResolver(RequestSchema),
    defaultValues: { email: "" },
  });

  const resetForm = useForm<ResetForm>({
    resolver: zodResolver(ResetSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  useGSAP(
    () => {
      if (prefersReducedMotion() || reduced || !root.current || !headline.current) return;
      const revealTweens = [
        revealUp(headline.current, { once: true, y: 30 }),
        revealUp(".reset-form", { once: true, y: 24, delay: 0.1 }),
      ];
      return () => revealTweens.forEach((t) => t.kill());
    },
    { scope: root, dependencies: [reduced, step] }
  );

  const handleRequest = async (data: RequestForm) => {
    setError(null);
    setLoading(true);
    const { error } = await resetPassword(data.email);
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess("لینک بازیابی رمز عبور به ایمیل شما ارسال شد");
      setTimeout(() => setStep("request"), 3000);
    }
  };

  const handleReset = async (data: ResetForm) => {
    setError(null);
    setLoading(true);
    const { error } = await updatePassword(data.password);
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess("رمز عبور با موفقیت تغییر کرد");
      setTimeout(() => router.push("/auth/login"), 2000);
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
            {step === "request" ? "بازیابی رمز عبور" : "تنظیم رمز عبور جدید"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {step === "request"
              ? "ایمیل خود را وارد کنید تا لینک بازیابی ارسال شود"
              : "رمز عبور جدید خود را وارد کنید"}
          </p>
        </div>

        <div className="rounded-app-lg border border-border bg-surface p-6 space-y-6">
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

          {step === "request" && (
            <form className="reset-form space-y-4" onSubmit={requestForm.handleSubmit(handleRequest)}>
              <div className="space-y-2">
                <Label htmlFor="email">ایمیل</Label>
                <div className="relative">
                  <MailIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                  <Input
                    {...requestForm.register("email")}
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    className="pr-10"
                    disabled={loading}
                  />
                  {requestForm.formState.errors.email && (
                    <p className="text-sm text-red-600">{requestForm.formState.errors.email.message}</p>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full py-3" disabled={loading}>
                {loading ? "در حال ارسال..." : "ارسال لینک بازیابی"}
              </Button>
            </form>
          )}

          {step === "reset" && (
            <form className="reset-form space-y-4" onSubmit={resetForm.handleSubmit(handleReset)}>
              <div className="space-y-2">
                <Label htmlFor="password">رمز عبور جدید</Label>
                <div className="relative">
                  <LockIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                  <Input
                    {...resetForm.register("password")}
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
                  {resetForm.formState.errors.password && (
                    <p className="text-sm text-red-600">{resetForm.formState.errors.password.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">تکرار رمز عبور جدید</Label>
                <div className="relative">
                  <LockIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                  <Input
                    {...resetForm.register("confirmPassword")}
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="تکرار رمز عبور"
                    className="pr-10"
                    disabled={loading}
                  />
                  {resetForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-600">{resetForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full py-3" disabled={loading}>
                {loading ? "در حال تغییر..." : "تغییر رمز عبور"}
              </Button>
            </form>
          )}

          <div className="pt-4 border-t border-border text-center">
            <p className="text-muted-foreground">
              به یاد رمز عبور خود آمدید؟{" "}
              <Link href="/auth/login" className="text-primary-text hover:underline font-medium">
                ورود
              </Link>
            </p>
          </div>
        </div>

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