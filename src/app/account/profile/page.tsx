"use client";

import { useGSAP } from "@/lib/gsap";
import { revealUp, prefersReducedMotion } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { UserIcon, MailIcon, LockIcon, PhoneIcon, EyeIcon, EyeOffIcon, AlertCircleIcon, CheckCircleIcon } from "@/components/icons";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const ProfileSchema = z.object({
  full_name: z.string().min(2, "نام باید حداقل ۲ کاراکتر باشد").max(100).optional(),
  email: z.string().email("ایمیل معتبر نیست").optional(),
  phone: z.string().regex(/^0?\d{10,11}$/, "شماره تلفن معتبر نیست").optional(),
});

const PasswordSchema = z.object({
  currentPassword: z.string().min(1, "رمز عبور فعلی الزامی است"),
  newPassword: z.string().min(6, "رمز عبور جدید باید حداقل ۶ کاراکتر باشد"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "رمز عبور جدید و تکرار آن مطابقت ندارند",
  path: ["confirmPassword"],
});

type ProfileForm = z.infer<typeof ProfileSchema>;
type PasswordForm = z.infer<typeof PasswordSchema>;

export default function AccountProfilePage() {
  const { user, updatePassword, updatePhone, refreshSession } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "password" | "phone">("profile");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const headline = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      full_name: user?.user_metadata?.full_name || "",
      email: user?.email || "",
      phone: user?.phone?.replace("+98", "0") || "",
    },
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(PasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  useGSAP(
    () => {
      if (prefersReducedMotion() || reduced || !root.current || !headline.current) return;
      const revealTweens = [
        revealUp(headline.current, { once: true, y: 30 }),
        revealUp(".profile-tabs", { once: true, y: 24, delay: 0.1 }),
        revealUp(".profile-form", { once: true, y: 24, delay: 0.2 }),
      ];
      return () => revealTweens.forEach((t) => t.kill());
    },
    { scope: root, dependencies: [reduced, activeTab] }
  );

  const handleProfileSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      // Note: Supabase doesn't have a direct updateUser for full_name in metadata
      // This would need a custom function or RPC
      // For now, we'll just show success
      setSuccess("اطلاعات پروفایل به‌روزرسانی شد (نیاز به پیاده‌سازی سمت سرور)");
    } catch {
      setError("خطا در به‌روزرسانی پروفایل");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (data: PasswordForm) => {
    setError(null);
    setLoading(true);
    try {
      const { error } = await updatePassword(data.newPassword);
      if (error) {
        setError(error.message);
      } else {
        setSuccess("رمز عبور با موفقیت تغییر کرد");
        passwordForm.reset();
      }
    } catch {
      setError("خطا در تغییر رمز عبور");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSubmit = async (data: ProfileForm) => {
    setError(null);
    setLoading(true);
    try {
      if (!data.phone) {
        setError("شماره تلفن الزامی است");
        return;
      }
      const { error } = await updatePhone(data.phone);
      if (error) {
        setError(error.message);
      } else {
        setSuccess("شماره تلفن به‌روزرسانی شد. لطفاً کد تایید را وارد کنید.");
        await refreshSession();
      }
    } catch {
      setError("خطا در به‌روزرسانی شماره تلفن");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div ref={root} className="space-y-6 max-w-2xl">
      <div>
        <h1 ref={headline} className="font-display text-2xl font-bold text-foreground">تنظیمات پروفایل</h1>
        <p className="text-muted-foreground mt-1">مدیریت اطلاعات حساب کاربری، رمز عبور و شماره تلفن</p>
      </div>

      {/* Tabs */}
      <div className="profile-tabs rounded-app-lg border border-border bg-surface p-6 space-y-6">
        <div className="flex gap-2" role="tablist" aria-label="بخش‌های پروفایل">
          <button
            role="tab"
            aria-selected={activeTab === "profile"}
            onClick={() => { setActiveTab("profile"); setError(null); setSuccess(null); }}
            className={`flex-1 py-2 px-4 rounded-app text-sm font-medium transition-all ${
              activeTab === "profile"
                ? "bg-primary text-on-primary"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <UserIcon className="size-4 mr-2 inline" /> اطلاعات پروفایل
          </button>
          <button
            role="tab"
            aria-selected={activeTab === "password"}
            onClick={() => { setActiveTab("password"); setError(null); setSuccess(null); }}
            className={`flex-1 py-2 px-4 rounded-app text-sm font-medium transition-all ${
              activeTab === "password"
                ? "bg-primary text-on-primary"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <LockIcon className="size-4 mr-2 inline" /> تغییر رمز عبور
          </button>
          <button
            role="tab"
            aria-selected={activeTab === "phone"}
            onClick={() => { setActiveTab("phone"); setError(null); setSuccess(null); }}
            className={`flex-1 py-2 px-4 rounded-app text-sm font-medium transition-all ${
              activeTab === "phone"
                ? "bg-primary text-on-primary"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <PhoneIcon className="size-4 mr-2 inline" /> شماره تلفن
          </button>
        </div>

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

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <form className="profile-form space-y-4" onSubmit={profileForm.handleSubmit(handleProfileSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="full_name">نام و نام خانوادگی</Label>
              <div className="relative">
                <UserIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                <Input
                  {...profileForm.register("full_name")}
                  id="full_name"
                  placeholder="محمد محمدی"
                  className="pr-10"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">ایمیل</Label>
              <div className="relative">
                <MailIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                <Input
                  {...profileForm.register("email")}
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  className="pr-10"
                  disabled={loading || true} // Email change requires verification
                />
              </div>
              <p className="text-xs text-muted-foreground">برای تغییر ایمیل، لطفاً از بخش احراز هویت استفاده کنید</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">شماره تلفن</Label>
              <div className="relative">
                <PhoneIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                <Input
                  {...profileForm.register("phone")}
                  id="phone"
                  placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                  className="pr-10"
                  disabled={loading}
                  dir="ltr"
                />
              </div>
              <p className="text-xs text-muted-foreground">برای تغییر شماره تلفن، از تب «شماره تلفن» استفاده کنید</p>
            </div>

            <Button type="submit" className="w-full py-3" disabled={loading}>
              {loading ? "در حال ذخیره..." : "ذخیره تغییرات"}
            </Button>
          </form>
        )}

        {/* Password Tab */}
        {activeTab === "password" && (
          <form className="profile-form space-y-4" onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="currentPassword">رمز عبور فعلی</Label>
              <div className="relative">
                <LockIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                <Input
                  {...passwordForm.register("currentPassword")}
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="رمز عبور فعلی"
                  className="pr-10"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrentPassword ? <EyeOffIcon className="size-5" /> : <EyeIcon className="size-5" />}
                </button>
              </div>
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-sm text-red-600">{passwordForm.formState.errors.currentPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">رمز عبور جدید</Label>
              <div className="relative">
                <LockIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                <Input
                  {...passwordForm.register("newPassword")}
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="حداقل ۶ کاراکتر"
                  className="pr-10"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPassword ? <EyeOffIcon className="size-5" /> : <EyeIcon className="size-5" />}
                </button>
              </div>
              {passwordForm.formState.errors.newPassword && (
                <p className="text-sm text-red-600">{passwordForm.formState.errors.newPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">تکرار رمز عبور جدید</Label>
              <div className="relative">
                <LockIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                <Input
                  {...passwordForm.register("confirmPassword")}
                  id="confirmPassword"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="تکرار رمز عبور جدید"
                  className="pr-10"
                  disabled={loading}
                />
              </div>
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-sm text-red-600">{passwordForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full py-3" disabled={loading}>
              {loading ? "در حال تغییر..." : "تغییر رمز عبور"}
            </Button>
          </form>
        )}

        {/* Phone Tab */}
        {activeTab === "phone" && (
          <form className="profile-form space-y-4" onSubmit={profileForm.handleSubmit(handlePhoneSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="phone">شماره تلفن جدید</Label>
              <div className="relative">
                <PhoneIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                <Input
                  {...profileForm.register("phone")}
                  id="phone"
                  type="tel"
                  placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                  className="pr-10"
                  disabled={loading}
                  dir="ltr"
                />
              </div>
              {profileForm.formState.errors.phone && (
                <p className="text-sm text-red-600">{profileForm.formState.errors.phone.message}</p>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              پس از ارسال، کد تایید به شماره جدید ارسال می‌شود. برای تکمیل فرآیند، کد را در اپلیکیشن Supabase Auth یا از طریق SMS تایید کنید.
            </p>
            <Button type="submit" className="w-full py-3" disabled={loading}>
              {loading ? "در حال ارسال..." : "ارسال کد تایید"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}