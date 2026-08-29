"use client";

import { useGSAP } from "@/lib/gsap";
import { revealUp, prefersReducedMotion } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { PackageIcon, ClockIcon, CheckCircleIcon, XCircleIcon, PackageCheckIcon, ArrowIcon } from "@/components/icons";
import { formatPrice } from "@/lib/products";
import { supabaseClient } from "@/lib/supabase-client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Order {
  id: string;
  status: string;
  total_rial: number;
  created_at: string;
  zarinpal_ref_id: string | null;
  customer_address: string | null;
}

export default function AccountOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 10;
  const root = useRef<HTMLDivElement>(null);
  const headline = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (prefersReducedMotion() || reduced || !root.current || !headline.current) return;
      const revealTweens = [
        revealUp(headline.current, { once: true, y: 30 }),
        revealUp(".orders-table", { once: true, y: 24, delay: 0.1 }),
        revealUp(".pagination", { once: true, y: 24, delay: 0.2 }),
      ];
      return () => revealTweens.forEach((t) => t.kill());
    },
    { scope: root, dependencies: [reduced, orders, page] }
  );

  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      setLoading(true);
      try {
        let query = supabaseClient
          .from("orders")
          .select("id, status, total_rial, created_at, zarinpal_ref_id, customer_address")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1);

        if (statusFilter) {
          query = query.eq("status", statusFilter);
        }

        const { data, error } = await query;
        if (!error && data) {
          setOrders(data);
          setHasMore(data.length === PAGE_SIZE);
        }
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user, page, statusFilter]);

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
      pending: { label: "در انتظار پرداخت", className: "bg-yellow-100 text-yellow-700", icon: <ClockIcon className="size-3" /> },
      paid: { label: "پرداخت شده", className: "bg-green-100 text-green-700", icon: <CheckCircleIcon className="size-3" /> },
      failed: { label: "پرداخت ناموفق", className: "bg-red-100 text-red-700", icon: <XCircleIcon className="size-3" /> },
      fulfilled: { label: "تحویل داده شده", className: "bg-blue-100 text-blue-700", icon: <PackageCheckIcon className="size-3" /> },
      cancelled: { label: "لغو شده", className: "bg-gray-100 text-gray-700", icon: <XCircleIcon className="size-3" /> },
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
    <div ref={root} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 ref={headline} className="font-display text-2xl font-bold text-foreground">سفارشات من</h1>
          <p className="text-muted-foreground mt-1">تاریخچه خریدهای شما در پت‌شاپ باران</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="همه وضعیت‌ها" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">همه وضعیت‌ها</SelectItem>
              <SelectItem value="pending">در انتظار پرداخت</SelectItem>
              <SelectItem value="paid">پرداخت شده</SelectItem>
              <SelectItem value="failed">ناموفق</SelectItem>
              <SelectItem value="fulfilled">تحویل داده شده</SelectItem>
              <SelectItem value="cancelled">لغو شده</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="orders-table rounded-app-lg border border-border bg-surface overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">در حال بارگذاری سفارشات...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center">
            <PackageIcon className="size-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-lg font-bold text-foreground mb-2">سفارشی یافت نشد</h3>
            <p className="text-muted-foreground mb-4">
              {statusFilter ? "سفارشی با این وضعیت وجود ندارد" : "هنوز سفارشی ثبت نکرده‌اید"}
            </p>
            {!statusFilter && (
              <Link
                href="/services/petshop"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-app bg-primary text-on-primary font-bold hover:opacity-90 transition-opacity"
              >
                <PackageIcon className="size-4" />
                خرید از پت‌شاپ
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full" role="table">
                <thead>
                  <tr className="text-right text-sm text-muted-foreground border-b border-border">
                    <th className="px-4 py-3 font-medium">کد سفارش</th>
                    <th className="px-4 py-3 font-medium">تاریخ</th>
                    <th className="px-4 py-3 font-medium">مبلغ</th>
                    <th className="px-4 py-3 font-medium">وضعیت</th>
                    <th className="px-4 py-3 font-medium">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-4 font-mono text-sm font-medium text-primary-text">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="px-4 py-4 text-sm">{formatDate(order.created_at)}</td>
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

            {/* Pagination */}
            <div className="pagination px-4 py-4 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                صفحه {page} از {page + (hasMore ? 1 : 0)}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                >
                  <ArrowIcon direction="forward" className="size-4" />
                  قبلی
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!hasMore || loading}
                >
                  بعدی
                  <ArrowIcon direction="back" className="size-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}