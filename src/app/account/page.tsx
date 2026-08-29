"use client";

import { useGSAP } from "@/lib/gsap";
import { revealUp, prefersReducedMotion } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { PackageIcon, MapPinIcon, SettingsIcon, PackageCheckIcon, ClockIcon, CheckCircleIcon } from "@/components/icons";
import { formatPrice } from "@/lib/products";
import { supabaseClient } from "@/lib/supabase-client";
import { useEffect, useState } from "react";

interface RecentOrder {
  id: string;
  status: string;
  total_rial: number;
  created_at: string;
  zarinpal_ref_id: string | null;
}

export default function AccountDashboard() {
  const { user } = useAuth();
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const root = useRef<HTMLDivElement>(null);
  const headline = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (prefersReducedMotion() || reduced || !root.current || !headline.current) return;
      const revealTweens = [
        revealUp(headline.current, { once: true, y: 30 }),
        revealUp(".welcome-card", { once: true, y: 24, delay: 0.1 }),
        revealUp(".stats-grid", { once: true, y: 24, delay: 0.2 }),
        revealUp(".recent-orders", { once: true, y: 24, delay: 0.3 }),
        revealUp(".quick-actions", { once: true, y: 24, delay: 0.4 }),
      ];
      return () => revealTweens.forEach((t) => t.kill());
    },
    { scope: root, dependencies: [reduced] }
  );

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      try {
        const { data, error } = await supabaseClient
          .from("orders")
          .select("id, status, total_rial, created_at, zarinpal_ref_id")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5);
        if (!error && data) {
          setRecentOrders(data);
        }
      } catch (err) {
        console.error("Failed to fetch recent orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
      pending: { label: "در انتظار پرداخت", className: "bg-yellow-100 text-yellow-700", icon: <ClockIcon className="size-3" /> },
      paid: { label: "پرداخت شده", className: "bg-green-100 text-green-700", icon: <CheckCircleIcon className="size-3" /> },
      failed: { label: "پرداخت ناموفق", className: "bg-red-100 text-red-700", icon: <CheckCircleIcon className="size-3" /> },
      fulfilled: { label: "تحویل داده شده", className: "bg-blue-100 text-blue-700", icon: <PackageCheckIcon className="size-3" /> },
      cancelled: { label: "لغو شده", className: "bg-gray-100 text-gray-700", icon: <CheckCircleIcon className="size-3" /> },
    };
    const c = configs[status] || { label: status, className: "bg-gray-100 text-gray-700", icon: <ClockIcon className="size-3" /> };
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${c.className}`}>
        {c.icon} {c.label}
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div ref={root} className="space-y-8">
      {/* Welcome Card */}
      <div className="welcome-card rounded-app-lg border border-border bg-surface p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 ref={headline} className="font-display text-2xl lg:text-3xl font-bold text-foreground">
              خوش آمدید، {user?.user_metadata?.full_name || user?.email?.split("@")[0] || "کاربر عزیز"}!
            </h1>
            <p className="mt-2 text-muted-foreground">
              به داشبورد حساب کاربری خود در کلینیک باران خوش آمدید. از اینجا می‌توانید سفارشات، آدرس‌ها و تنظیمات خود را مدیریت کنید.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/account/orders" className="px-4 py-2 rounded-app bg-primary text-on-primary font-bold hover:opacity-90 transition-opacity">
              مشاهده سفارشات
            </Link>
            <Link href="/account/addresses" className="px-4 py-2 rounded-app border border-border bg-surface font-bold hover:bg-muted transition-colors">
              مدیریت آدرس‌ها
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/account/orders" className="rounded-app-lg border border-border bg-surface p-6 hover:shadow-lg transition-shadow group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-app bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <PackageIcon className="size-6 text-primary-text" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">کل سفارشات</p>
              <p className="font-display text-2xl font-bold text-foreground">—</p>
            </div>
          </div>
        </Link>
        <Link href="/account/orders" className="rounded-app-lg border border-border bg-surface p-6 hover:shadow-lg transition-shadow group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-app bg-green-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircleIcon className="size-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">سفارشات تحویل شده</p>
              <p className="font-display text-2xl font-bold text-foreground">—</p>
            </div>
          </div>
        </Link>
        <Link href="/account/orders" className="rounded-app-lg border border-border bg-surface p-6 hover:shadow-lg transition-shadow group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-app bg-yellow-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ClockIcon className="size-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">در انتظار پرداخت</p>
              <p className="font-display text-2xl font-bold text-foreground">—</p>
            </div>
          </div>
        </Link>
        <Link href="/account/addresses" className="rounded-app-lg border border-border bg-surface p-6 hover:shadow-lg transition-shadow group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-app bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <MapPinIcon className="size-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">آدرس‌های ذخیره شده</p>
              <p className="font-display text-2xl font-bold text-foreground">—</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Orders */}
      <div className="recent-orders rounded-app-lg border border-border bg-surface">
        <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="font-display text-xl font-bold text-foreground">سفارشات اخیر</h2>
          <Link href="/account/orders" className="text-sm text-primary-text hover:underline font-medium">
            مشاهده همه
          </Link>
        </div>
        <div className="divide-y divide-border">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
              در حال بارگذاری...
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="p-12 text-center">
              <PackageIcon className="size-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-lg font-bold text-foreground mb-2">سفارشی یافت نشد</h3>
              <p className="text-muted-foreground mb-4">هنوز سفارشی ثبت نکرده‌اید</p>
              <Link href="/services/petshop" className="inline-flex items-center gap-2 px-4 py-2 rounded-app bg-primary text-on-primary font-bold hover:opacity-90 transition-opacity">
                خرید از پت‌شاپ
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full" role="table">
                <thead>
                  <tr className="text-right text-sm text-muted-foreground">
                    <th className="px-4 py-3 font-medium">سفارش</th>
                    <th className="px-4 py-3 font-medium hidden sm:table-cell">تاریخ</th>
                    <th className="px-4 py-3 font-medium">مبلغ</th>
                    <th className="px-4 py-3 font-medium">وضعیت</th>
                    <th className="px-4 py-3 font-medium">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-4 font-mono text-sm font-medium text-primary-text">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="px-4 py-4 text-sm hidden sm:table-cell">{formatDate(order.created_at)}</td>
                      <td className="px-4 py-4 font-display font-bold">{formatPrice(order.total_rial)} <span className="font-body text-xs">ریال</span></td>
                      <td className="px-4 py-4">{getStatusBadge(order.status)}</td>
                      <td className="px-4 py-4">
                        <Link
                          href={`/account/orders/${order.id}`}
                          className="text-sm text-primary-text hover:underline font-medium"
                        >
                          جزئیات
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions rounded-app-lg border border-border bg-surface p-6">
        <h2 className="font-display text-lg font-bold text-foreground mb-6">دسترسی سریع</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/services/petshop" className="rounded-app border border-border bg-background p-6 hover:border-primary hover:bg-primary/5 transition-all group">
            <div className="w-12 h-12 rounded-app bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <PackageIcon className="size-6 text-primary-text" />
            </div>
            <p className="font-medium text-center text-foreground">خرید از پت‌شاپ</p>
          </Link>
          <Link href="/account/orders" className="rounded-app border border-border bg-background p-6 hover:border-primary hover:bg-primary/5 transition-all group">
            <div className="w-12 h-12 rounded-app bg-green-100 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <PackageCheckIcon className="size-6 text-green-600" />
            </div>
            <p className="font-medium text-center text-foreground">سفارشات من</p>
          </Link>
          <Link href="/account/addresses" className="rounded-app border border-border bg-background p-6 hover:border-primary hover:bg-primary/5 transition-all group">
            <div className="w-12 h-12 rounded-app bg-purple-100 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <MapPinIcon className="size-6 text-purple-600" />
            </div>
            <p className="font-medium text-center text-foreground">آدرس‌ها</p>
          </Link>
          <Link href="/account/profile" className="rounded-app border border-border bg-background p-6 hover:border-primary hover:bg-primary/5 transition-all group">
            <div className="w-12 h-12 rounded-app bg-blue-100 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <SettingsIcon className="size-6 text-blue-600" />
            </div>
            <p className="font-medium text-center text-foreground">تنظیمات پروفایل</p>
          </Link>
        </div>
      </div>
    </div>
  );
}