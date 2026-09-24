"use client";
export const dynamic = "force-dynamic";

import { useShow, useNavigation } from "@refinedev/core";
import { supabaseClient } from "@/lib/supabase-client";
import { sendShippingSMS } from "@/lib/sms";
import { ArrowIcon, UserIcon, MapPinIcon, PhoneIcon, CreditCardIcon, PackageIcon, ClockIcon, CheckCircleIcon, XCircleIcon, TruckIcon } from "@/components/icons";
import Image from "next/image";
import { formatPrice, formatQuantity, UNIT_LABELS, type SellingUnit } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { PageHelp } from "@/components/admin/PageHelp";

interface OrderItem {
  quantity: number;
  unit_price_rial: number;
  product_id: string;
  product_name: string | null;
  selling_unit: SellingUnit | null;
  products: {
    name: string;
    price_rial: number;
    category: string | null;
    images: string[] | null;
  } | null;
}

type OrderStatus =
  | "pending"
  | "paid"
  | "failed"
  | "shipped"
  | "delivered"
  | "fulfilled"
  | "cancelled";

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string | null;
  status: OrderStatus;
  shipping_method: "flat_rate" | "free_over_threshold" | "pickup_at_clinic";
  tracking_number: string | null;
  courier: string | null;
  zarinpal_authority: string | null;
  zarinpal_ref_id: string | null;
  total_rial: number;
  created_at: string;
  updated_at: string;
  shipped_at: string | null;
  delivered_at: string | null;
  order_items: OrderItem[];
}

export function OrderShow() {
  const navigation = useNavigation();
  const [courier, setCourier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [prevOrderId, setPrevOrderId] = useState<string | undefined>(undefined);

  const { query, result: order } = useShow<Order>({
    resource: "orders",
    meta: {
      select: "id,customer_name,customer_phone,customer_address,status,shipping_method,tracking_number,courier,shipped_at,delivered_at,zarinpal_authority,zarinpal_ref_id,total_rial,created_at,updated_at,order_items(quantity,unit_price_rial,product_id,product_name,selling_unit,products(name,price_rial,category,images))",
    },
  });
  const isLoading = query.isLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <PackageIcon className="size-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="font-display text-xl font-bold text-foreground">سفارش یافت نشد</h2>
      </div>
    );
  }

  // Sync inputs when the order loads/refreshes (avoids an effect-triggered set).
  if (order.id !== prevOrderId) {
    setPrevOrderId(order.id);
    setCourier(order.courier ?? "");
    setTrackingNumber(order.tracking_number ?? "");
  }

  const handleBack = () => navigation.list("orders");

  const refreshOrder = async () => {
    const { data: refreshed, error: refreshError } = await supabaseClient
      .from("orders")
      .select("id,customer_name,customer_phone,customer_address,status,shipping_method,tracking_number,courier,shipped_at,delivered_at,zarinpal_authority,zarinpal_ref_id,total_rial,created_at,updated_at,order_items(quantity,unit_price_rial,product_id,product_name,selling_unit,products(name,price_rial,category,images))")
      .eq("id", order.id)
      .single();

    if (!refreshError && refreshed) {
      if (process.env.NEXT_PUBLIC_SMS_NOTIFICATIONS !== "false" && refreshed.customer_phone) {
        await sendShippingSMS({
          phone: refreshed.customer_phone,
          orderId: refreshed.id,
          status: refreshed.status,
          trackingNumber: refreshed.tracking_number,
          courier: refreshed.courier,
        });
      }
    }

    navigation.show("orders", order.id);
  };

  const handleShip = async () => {
    if (order.status !== "paid") return;
    try {
      const { error } = await supabaseClient
        .from("orders")
        .update({
          courier: courier.trim() ? courier.trim() : null,
          tracking_number: trackingNumber.trim() ? trackingNumber.trim() : null,
          status: "shipped",
          shipped_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      if (error) throw error;
      await refreshOrder();
    } catch (err) {
      console.error("Failed to ship order:", err);
    }
  };

  const handleUpdateStatus = async (newStatus: Extract<OrderStatus, "delivered">) => {
    if (order.status === newStatus) return;

    let updateData: Partial<Order> = { status: newStatus };

    if (newStatus === "delivered") {
      updateData = { ...updateData, delivered_at: new Date().toISOString() };
    }

    try {
      const { error } = await supabaseClient
        .from("orders")
        .update(updateData)
        .eq("id", order.id);

      if (error) throw error;
      await refreshOrder();
    } catch (err) {
      console.error("Failed to update order status:", err);
    }
  };

  const getStatusConfig = (status: Order["status"]) => {
    const configs: Record<OrderStatus, { label: string; className: string; icon: React.ReactNode }> = {
      pending: { label: "در انتظار پرداخت", className: "bg-yellow-100 text-yellow-700", icon: <ClockIcon className="size-4" /> },
      paid: { label: "پرداخت شده", className: "bg-green-100 text-green-700", icon: <CheckCircleIcon className="size-4" /> },
      failed: { label: "پرداخت ناموفق", className: "bg-red-100 text-red-700", icon: <XCircleIcon className="size-4" /> },
      shipped: { label: "ارسال شده", className: "bg-blue-100 text-blue-700", icon: <TruckIcon className="size-4" /> },
      delivered: { label: "تحویل داده شده", className: "bg-lime-100 text-lime-700", icon: <TruckIcon className="size-4" /> },
      fulfilled: { label: "تحویل داده شده", className: "bg-lime-100 text-lime-700", icon: <TruckIcon className="size-4" /> },
      cancelled: { label: "لغو شده", className: "bg-gray-100 text-gray-700", icon: <XCircleIcon className="size-4" /> },
    };
    return configs[status];
  };

  const statusConfig = getStatusConfig(order.status);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Determine if status can be updated
  const canUpdate = order.status !== "delivered" && order.status !== "fulfilled" && order.status !== "cancelled";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="بازگشت به لیست سفارشات"
          >
            <ArrowIcon direction="back" className="size-5" />
          </button>
          <div>
            <div className="flex items-center gap-3"><h1 className="font-display text-2xl font-bold text-foreground">سفارش #{order.id.slice(0, 8)}</h1><PageHelp id="orders-show" /></div>
            <p className="text-muted-foreground">تاریخ ثبت: {formatDate(order.created_at)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${statusConfig.className}`}>
            {statusConfig.icon} {statusConfig.label}
          </span>
          {order.status === "shipped" && canUpdate && (
            <Button
              variant="outline"
              onClick={() => handleUpdateStatus("delivered")}
              className="hidden sm:inline-flex"
            >
              <TruckIcon className="size-4" />
              تحویل داده شد
            </Button>
          )}
        </div>
      </div>

      {order.status === "paid" && (
        <div className="rounded-app-lg border border-border bg-surface p-6">
          <div className="flex items-center gap-2 mb-4">
            <TruckIcon className="size-5 text-primary-text" />
            <h2 className="font-display text-lg font-bold text-foreground">ثبت ارسال سفارش</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="courier">پیک / شرکت ارسال</Label>
              <Input
                id="courier"
                value={courier}
                onChange={(e) => setCourier(e.target.value)}
                placeholder="مثلاً پیک موتوری، تیپاکس"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="tracking-number">شماره پیگیری</Label>
              <Input
                id="tracking-number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="کد رهگیری پستی یا پیک"
                className="mt-1"
              />
            </div>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Button onClick={handleShip}>
              <TruckIcon className="size-4" />
              ثبت ارسال
            </Button>
            <p className="text-sm text-muted-foreground">
              با ثبت ارسال، وضعیت سفارش به «ارسال شده» تغییر می‌کند و پیامک حاوی شماره پیگیری برای مشتری ارسال می‌شود.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
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
              {order.shipped_at && (
                <div className="sm:col-span-2">
                  <dt className="text-sm text-muted-foreground">روش ارسال</dt>
                  <dd className="font-medium mt-1">
<span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${order.shipping_method === 'flat_rate' ? 'bg-yellow-100 text-yellow-700' : order.shipping_method === 'pickup_at_clinic' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
  {order.shipping_method === 'flat_rate' ? 'ارسال با پیک' : order.shipping_method === 'pickup_at_clinic' ? 'تحویل در کلینیک' : 'ارسال رایگان'}
</span>
                  </dd>
                </div>
              )}
              {order.tracking_number && (
                <div className="sm:col-span-2">
                  <dt className="text-sm text-muted-foreground">شماره پیگیری</dt>
                  <dd className="font-medium mt-1">
                    <span className="whitespace-pre-wrap">{order.tracking_number}</span>
                  </dd>
                  <dt className="text-sm text-muted-foreground"> kurir</dt>
                  <dd className="font-medium mt-1">
                    <span className="whitespace-pre-wrap">{order.courier || "—"}</span>
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Order Items */}
          <div className="rounded-app-lg border border-border bg-surface p-6">
            <h2 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <PackageIcon className="size-5 text-primary-text" />
              اقلام سفارش
            </h2>
            <div className="space-y-3">
              {order.order_items?.map((item: OrderItem, idx: number) => {
                const product = item.products;
                const unit = item.selling_unit ?? ('PIECE' as SellingUnit);
                const itemName = item.product_name ?? product?.name ?? "محصول نامشخص";
                const lineTotal = item.unit_price_rial * item.quantity;
                const unitDenominator = UNIT_LABELS[unit] ? ` / ${UNIT_LABELS[unit]}` : "";
                return (
                  <div key={idx} className="flex gap-4 p-4 rounded-app border border-border bg-background">
                    <div className="relative w-16 h-16 flex-shrink-0 rounded-app overflow-hidden bg-muted">
                      {product?.images?.[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={itemName}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <PackageIcon className="size-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <h4 className="font-medium text-foreground truncate">{itemName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {product?.category ? ["غذا", "دارو", "لوازم جانبی", "شستشو و اصلاح"][["food", "medicine", "accessories", "grooming"].indexOf(product.category)] || product.category : "—"}
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

        {/* Payment & Totals Sidebar */}
        <div className="space-y-6">
          {/* Payment Info */}
          <div className="rounded-app-lg border border-border bg-surface p-6 sticky top-24">
            <h2 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <CreditCardIcon className="size-5 text-primary-text" />
              اطلاعات پرداخت
            </h2>
            <dl className="space-y-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">مبلغ کل</dt>
                <dd className="font-display font-bold text-foreground">{formatPrice(order.total_rial)} <span className="font-body text-xs">ریال</span></dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">مرجع زرین‌پال</dt>
                <dd className="font-mono text-xs text-muted-foreground">{order.zarinpal_ref_id || "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Authority</dt>
                <dd className="font-mono text-xs text-muted-foreground truncate max-w-[150px]">{order.zarinpal_authority || "—"}</dd>
              </div>
              <div className="pt-4 border-t border-border flex justify-between">
                <dt className="text-muted-foreground">وضعیت پرداخت</dt>
                <dd className="font-medium">
                  {order.zarinpal_ref_id ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                      <CheckCircleIcon className="size-3" /> تایید شده
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
                      <ClockIcon className="size-3" /> در انتظار
                    </span>
                  )}
                </dd>
              </div>
            </dl>
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
              {order.shipped_at && (
                <div className="flex items-start gap-3 relative before:content-[''] before:absolute before:left-[9px] before:top-0 before:h-full before:w-0.5 before:bg-border last:before:hidden">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500 border-2 border-background flex items-center justify-center">
                    <TruckIcon className="size-3 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">ارسال شده</p>
                    <p className="text-sm text-muted-foreground">{formatDate(order.shipped_at)}</p>
                  </div>
                </div>
              )}
              {order.delivered_at && (
                <div className="flex items-start gap-3 relative before:content-[''] before:absolute before:left-[9px] before:top-0 before:h-full before:w-0.5 before:bg-border last:before:hidden">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-lime-500 border-2 border-background flex items-center justify-center">
                    <TruckIcon className="size-3 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">تحویل داده شده</p>
                    <p className="text-sm text-muted-foreground">{formatDate(order.delivered_at)}</p>
                  </div>
                </div>
              )}
              {!order.delivered_at && ["fulfilled", "cancelled"].includes(order.status) && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-background flex items-center justify-center"
                    style={{ backgroundColor: order.status === "fulfilled" ? "#3b82f6" : "#ef4444" }}>
                    {order.status === "fulfilled" ? (
                      <TruckIcon className="size-3 text-white" />
                    ) : (
                      <XCircleIcon className="size-3 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {order.status === "fulfilled" ? "تحویل داده شده" : "لغو شده"}
                    </p>
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

export default OrderShow;