"use client";

import { useGSAP } from "@/lib/gsap";
import { revealUp, prefersReducedMotion } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { PackageIcon, ClockIcon, CheckCircleIcon, XCircleIcon, TruckIcon, MapPinIcon, PhoneIcon, UserIcon, ArrowIcon } from "@/components/icons";
import { formatPrice, formatQuantity, CATEGORY_LABELS, UNIT_LABELS, type SellingUnit } from "@/lib/products";
import { supabaseClient } from "@/lib/supabase-client";
import { useEffect, useState } from "react";

interface OrderItem {
  quantity: number;
  unit_price_rial: number;
  product_id: string;
  product_name: string | null;
  selling_unit: SellingUnit | null;
  products: { name: string; images: string[] | null; category: string | null } | null;
}

interface Order {
  id: string;
  status: string;
  total_rial: number;
  created_at: string;
  updated_at: string;
  zarinpal_authority: string | null;
  zarinpal_ref_id: string | null;
  customer_address: string | null;
  customer_name: string;
  customer_phone: string;
  shipping_method: string | null;
  tracking_number: string | null;
  courier: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  order_items: OrderItem[];
}

function OrderTrackingShowClient({ order }: { order: Order }) {
  const root = useRef<HTMLDivElement>(null);
  const headline = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (prefersReducedMotion() || reduced || !root.current || !headline.current) return;
      const revealTweens = [
        revealUp(headline.current, { once: true, y: 30 }),
        revealUp(".order-header", { once: true, y: 24, delay: 0.1 }),
        revealUp(".order-grid", { once: true, y: 24, delay: 0.2 }),
      ];
      return () => revealTweens.forEach((t) => t.kill());
    },
    { scope: root, dependencies: [reduced] }
  );

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
      pending: { label: "در انتظار پرداخت", className: "bg-yellow-100 text-yellow-700", icon: <ClockIcon className="size-4" /> },
      paid: { label: "پرداخت شده", className: "bg-green-100 text-green-700", icon: <CheckCircleIcon className="size-4" /> },
      failed: { label: "پرداخت ناموفق", className: "bg-red-100 text-red-700", icon: <XCircleIcon className="size-4" /> },
      shipped: { label: "ارسال شده", className: "bg-blue-100 text-blue-700", icon: <TruckIcon className="size-4" /> },
      delivered: { label: "تحویل داده شده", className: "bg-lime-100 text-lime-700", icon: <TruckIcon className="size-4" /> },
      fulfilled: { label: "تحویل داده شده", className: "bg-lime-100 text-lime-700", icon: <TruckIcon className="size-4" /> },
      cancelled: { label: "لغو شده", className: "bg-gray-100 text-gray-700", icon: <XCircleIcon className="size-4" /> },
    };
    return configs[status] || { label: status, className: "bg-gray-100 text-gray-700", icon: <ClockIcon className="size-4" /> };
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div ref={root} className="space-y-6">
      {/* Header */}
      <div className="order-header flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/account/orders"
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="بازگشت به لیست سفارشات"
          >
            <ArrowIcon direction="back" className="size-5" />
          </Link>
          <div>
            <h1 ref={headline} className="font-display text-2xl font-bold text-foreground">سفارش #{order.id.slice(0, 8)}</h1>
            <p className="text-muted-foreground">تاریخ ثبت: {formatDate(order.created_at)}</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${getStatusConfig(order.status).className}`}>
          {getStatusConfig(order.status).icon} {getStatusConfig(order.status).label}
        </span>
      </div>

      <div className="order-grid grid gap-6 lg:grid-cols-3">
        {/* Order Info + Items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <div className="rounded-app-lg border border-border bg-surface p-6">
            <h2 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <UserIcon className="size-5 text-primary-text" />
              اطلاعات مشتری
            </h2>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-muted-foreground">نام</dt>
                <dd className="font-medium mt-1">{order.customer_name}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">تلفن</dt>
                <dd className="font-medium mt-1 flex items-center gap-1">
                  <PhoneIcon className="size-4 text-muted-foreground" />
                  {order.customer_phone}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm text-muted-foreground">آدرس تحویل</dt>
                <dd className="font-medium mt-1 flex items-start gap-1">
                  <MapPinIcon className="size-4 text-muted-foreground mt-0.5" />
                  <span className="whitespace-pre-wrap">{order.customer_address || "ثبت نشده"}</span>
                </dd>
              </div>
            </dl>
          </div>

          {/* Order Items */}
          <div className="rounded-app-lg border border-border bg-surface p-6">
            <h2 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <PackageIcon className="size-5 text-primary-text" />
              اقلام سفارش
            </h2>
            <div className="space-y-3">
              {order.order_items?.map((item, idx) => {
                const product = item.products;
                const unit = item.selling_unit ?? ('PIECE' as SellingUnit);
                const itemName = item.product_name ?? product?.name ?? "محصول نامشخص";
                const lineTotal = item.unit_price_rial * item.quantity;
                const unitDenominator = UNIT_LABELS[unit] ? ` / ${UNIT_LABELS[unit]}` : "";
                return (
                  <div key={idx} className="flex gap-4 p-4 rounded-app border border-border bg-background">
                    <div className="relative w-16 h-16 flex-shrink-0 rounded-app overflow-hidden bg-muted">
                      {product?.images?.[0] ? (
                        <img src={product.images[0]} alt={itemName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <PackageIcon className="size-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="font-medium text-foreground truncate">{itemName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {product?.category ? CATEGORY_LABELS[product.category] || product.category : "—"}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">مقدار: {formatQuantity(item.quantity, unit)}</span>
                        <span className="font-display font-bold text-primary-text">
                          {formatPrice(lineTotal)} <span className="font-body text-xs">ریال{unitDenominator}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Shipping & Tracking Sidebar */}
        <div className="space-y-6">
          {/* Shipping Info */}
          <div className="rounded-app-lg border border-border bg-surface p-6 sticky top-24">
            <h2 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <TruckIcon className="size-5 text-primary-text" />
              جزئیات ارسال
            </h2>
            {order.shipping_method || order.tracking_number ? (
              <dl className="grid gap-4 text-sm">
                {order.shipping_method && (
                  <div>
                    <dt className="text-muted-foreground">روش ارسال</dt>
                    <dd className="font-medium">
                      {order.shipping_method === 'flat_rate'
                      ? 'ارسال با پیک'
                      : order.shipping_method === 'pickup_at_clinic'
                        ? 'تحویل در کلینیک'
                        : 'ارسال رایگان'}
                    </dd>
                  </div>
                )}
                {order.tracking_number && (
                  <div>
                    <dt className="text-muted-foreground">شماره پیگیری</dt>
                    <dd className="font-medium text-primary-text whitespace-pre-wrap">{order.tracking_number}</dd>
                  </div>
                )}
                {order.courier && (
                  <div>
                    <dt className="text-muted-foreground">kurir</dt>
                    <dd className="font-medium">{order.courier}</dd>
                  </div>
                )}
                {order.shipped_at && (
                  <div>
                    <dt className="text-muted-foreground">تاریخ ارسال</dt>
                    <dd className="font-medium">{formatDate(order.shipped_at)}</dd>
                  </div>
                )}
                {order.delivered_at && (
                  <div>
                    <dt className="text-muted-foreground">تاریخ تحویل</dt>
                    <dd className="font-medium">{formatDate(order.delivered_at)}</dd>
                  </div>
                )}
              </dl>
            ) : (
              <p className="text-muted-foreground text-sm">
                اطلاعات ارسال هنوز ثبت نشده است
              </p>
            )}
          </div>

          {/* Timeline */}
          <div className="rounded-app-lg border border-border bg-surface p-6 sticky top-24" style={{ top: "calc(24rem + 2rem)" }}>
            <h2 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <ClockIcon className="size-5 text-primary-text" />
              تاریخچه وضعیت
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3 relative before:content-[''] before:absolute before:left-[9px] before:top-0 before:h-full before:w-0.5 before:bg-border last:before:hidden">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500 border-2 border-background flex items-center justify-center">
                  <CheckCircleIcon className="size-3 text-white" />
                </div>
                <div>
                  <p className="font-medium text-foreground">سفارش ثبت شد</p>
                  <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
                </div>
              </div>
              {order.zarinpal_ref_id && (
                <div className="flex items-start gap-3 relative before:content-[''] before:absolute before:left-[9px] before:top-0 before:h-full before:w-0.5 before:bg-border last:before:hidden">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500 border-2 border-background flex items-center justify-center">
                    <CheckCircleIcon className="size-3 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">پرداخت تایید شد</p>
                    <p className="text-sm text-muted-foreground">مرجع: {order.zarinpal_ref_id}</p>
                  </div>
                </div>
              )}
              {(order.shipped_at || order.status === "shipped" || order.status === "delivered" || order.status === "fulfilled") && (
                <div className="flex items-start gap-3 relative before:content-[''] before:absolute before:left-[9px] before:top-0 before:h-full before:w-0.5 before:bg-border last:before:hidden">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500 border-2 border-background flex items-center justify-center">
                    <TruckIcon className="size-3 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">ارسال شده</p>
                    <p className="text-sm text-muted-foreground">{formatDate(order.shipped_at || order.updated_at)}</p>
                    {order.tracking_number && (
                      <p className="text-sm text-muted-foreground">
                        شماره پیگیری: <span className="font-medium text-foreground">{order.tracking_number}</span>
                      </p>
                    )}
                  </div>
                </div>
              )}
              {(order.delivered_at || order.status === "delivered" || order.status === "fulfilled") && (
                <div className="flex items-start gap-3 relative before:content-[''] before:absolute before:left-[9px] before:top-0 before:h-full before:w-0.5 before:bg-border last:before:hidden">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-lime-500 border-2 border-background flex items-center justify-center">
                    <TruckIcon className="size-3 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">تحویل داده شده</p>
                    <p className="text-sm text-muted-foreground">{formatDate(order.delivered_at || order.updated_at)}</p>
                  </div>
                </div>
              )}
              {order.status === "cancelled" && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-500 border-2 border-background flex items-center justify-center">
                    <XCircleIcon className="size-3 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">لغو شده</p>
                    <p className="text-sm text-muted-foreground">{formatDate(order.updated_at)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AccountOrderTrackingPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { user } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchOrder = async () => {
      try {
        const { data, error } = await supabaseClient
          .from("orders")
          .select("id, status, total_rial, created_at, updated_at, zarinpal_authority, zarinpal_ref_id, customer_address, customer_name, customer_phone, shipping_method, tracking_number, courier, shipped_at, delivered_at, order_items(quantity, unit_price_rial, product_id, product_name, selling_unit, products(name, price_rial, category, images))")
          .eq("id", id)
          .eq("user_id", user.id)
          .single();

        if (!error && data) {
          setOrder(data as unknown as Order);
        }
      } catch (err) {
        console.error("Failed to fetch order:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        <p className="text-muted-foreground ml-2">در حال بارگذاری...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <PackageIcon className="size-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-display text-xl font-bold text-foreground">سفارش یافت نشد</h2>
        <Link href="/account/orders" className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-app bg-primary text-on-primary font-bold hover:opacity-90">
          بازگشت به سفارشات
        </Link>
      </div>
    );
  }

  return <OrderTrackingShowClient order={order} />;
}