"use client";
export const dynamic = "force-dynamic";

import { useList, useNavigation, useCan } from "@refinedev/core";
import { AdminTable } from "@/components/admin/AdminTable";
import { EditIcon, EyeIcon, TruckIcon, CheckCircleIcon, XCircleIcon, ClockIcon, CreditCardIcon } from "@/components/icons";
import { formatPrice } from "@/lib/products";
import { useState } from "react";

export function OrdersList() {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [dateRange, setDateRange] = useState<{ from?: string; to?: string }>({});

  const listResult = useList({
    resource: "orders",
    sorters: [{ field: "created_at", order: "desc" }],
    filters: [
      ...(filters.status ? [{ field: "status", operator: "eq" as const, value: filters.status }] : []),
      ...(dateRange.from ? [{ field: "created_at", operator: "gte" as const, value: dateRange.from }] : []),
      ...(dateRange.to ? [{ field: "created_at", operator: "lte" as const, value: dateRange.to }] : []),
    ],
    meta: {
      select: "id,customer_name,customer_phone,customer_address,status,zarinpal_authority,zarinpal_ref_id,total_rial,created_at,order_items(quantity,unit_price_rial,product_id,products(name))",
    },
  });
  const { result, query } = listResult;
  const navigation = useNavigation();
  const canShow = useCan({ resource: "orders", action: "show" });
  const canEdit = useCan({ resource: "orders", action: "edit" });

  const handleShow = (id: string) => navigation.show("orders", id);
  const handleEdit = (id: string) => navigation.edit("orders", id);

  interface OrderRow {
    id: string;
    customer_name: string;
    customer_phone: string;
    customer_address: string | null;
    status: "pending" | "paid" | "failed" | "fulfilled" | "cancelled";
    zarinpal_authority: string | null;
    zarinpal_ref_id: string | null;
    total_rial: number;
    created_at: string;
    order_items: Array<{
      quantity: number;
      unit_price_rial: number;
      product_id: string;
      products: { name: string } | null;
    }>;
  }

  const getStatusBadge = (status: OrderRow["status"]) => {
    const config: Record<OrderRow["status"], { label: string; className: string; icon: React.ReactNode }> = {
      pending: { label: "در انتظار پرداخت", className: "bg-yellow-100 text-yellow-700", icon: <ClockIcon className="size-3" /> },
      paid: { label: "پرداخت شده", className: "bg-green-100 text-green-700", icon: <CheckCircleIcon className="size-3" /> },
      failed: { label: "پرداخت ناموفق", className: "bg-red-100 text-red-700", icon: <XCircleIcon className="size-3" /> },
      fulfilled: { label: "تحویل داده شده", className: "bg-blue-100 text-blue-700", icon: <TruckIcon className="size-3" /> },
      cancelled: { label: "لغو شده", className: "bg-gray-100 text-gray-700", icon: <XCircleIcon className="size-3" /> },
    };
    const c = config[status];
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${c.className}`}>
        {c.icon} {c.label}
      </span>
    );
  };

  const columns = [
    {
      accessorKey: "id" as keyof OrderRow,
      header: "کد سفارش",
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => {
        const id = getValue("id") as string;
        return <span className="font-mono text-xs">{id.slice(0, 8)}…</span>;
      },
    },
    {
      accessorKey: "customer_name" as keyof OrderRow,
      header: "مشتری",
      cellWithMeta: ({ original }: { original: OrderRow }) => (
        <div>
          <span className="font-medium">{original.customer_name}</span>
          <div className="text-xs text-muted-foreground">{original.customer_phone}</div>
        </div>
      ),
    },
    {
      accessorKey: "total_rial" as keyof OrderRow,
      header: "مبلغ",
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => (
        <span className="font-display font-bold">{formatPrice(getValue("total_rial") as number)}</span>
      ),
    },
    {
      accessorKey: "status" as keyof OrderRow,
      header: "وضعیت سفارش",
      cellWithMeta: ({ original }: { original: OrderRow }) => getStatusBadge(original.status),
    },
    {
      accessorKey: "zarinpal_ref_id" as keyof OrderRow,
      header: "وضعیت پرداخت",
      cellWithMeta: ({ original }: { original: OrderRow }) => {
        if (!original.zarinpal_authority) return <span className="text-muted-foreground">—</span>;
        if (original.zarinpal_ref_id) {
          return (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
              <CreditCardIcon className="size-3" /> تایید شده
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
            <ClockIcon className="size-3" /> در انتظار تایید
          </span>
        );
      },
    },
    {
      accessorKey: "created_at" as keyof OrderRow,
      header: "تاریخ ایجاد",
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => {
        const date = getValue("created_at") as string;
        return new Date(date).toLocaleDateString("fa-IR", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      },
    },
    {
      id: "items",
      header: "اقلام",
      cellWithMeta: ({ original }: { original: OrderRow }) => {
        const count = original.order_items?.length || 0;
        return <span className="text-sm text-muted-foreground">{count} مورد</span>;
      },
    },
    {
      id: "actions",
      header: "عملیات",
      cellWithMeta: ({ original }: { original: OrderRow }) => (
        <div className="flex items-center gap-2">
          {canShow.data && (
            <button
              onClick={() => handleShow(original.id)}
              className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              aria-label="مشاهده جزئیات"
            >
              <EyeIcon className="size-4" />
            </button>
          )}
          {canEdit.data && original.status === "pending" && (
            <button
              onClick={() => handleEdit(original.id)}
              className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              aria-label="ویرایش"
            >
              <EditIcon className="size-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">مدیریت سفارشات</h1>
          <p className="text-muted-foreground mt-1">لیست تمام سفارشات پت‌شاپ</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-app border border-border bg-surface">
        <div className="flex flex-wrap gap-3">
          <select
            value={filters.status || ""}
            onChange={(e) => setFilters({ ...filters, status: e.target.value || "" })}
            className="px-3 py-2 rounded-app border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">همه وضعیت‌ها</option>
            <option value="pending">در انتظار پرداخت</option>
            <option value="paid">پرداخت شده</option>
            <option value="failed">ناموفق</option>
            <option value="fulfilled">تحویل داده شده</option>
            <option value="cancelled">لغو شده</option>
          </select>

          <input
            type="date"
            value={dateRange.from || ""}
            onChange={(e) => setDateRange({ ...dateRange, from: e.target.value || undefined })}
            className="px-3 py-2 rounded-app border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="از تاریخ"
          />
          <input
            type="date"
            value={dateRange.to || ""}
            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value || undefined })}
            className="px-3 py-2 rounded-app border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="تا تاریخ"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setFilters({});
              setDateRange({});
              query.refetch();
            }}
            className="px-3 py-2 rounded-app border border-border text-sm hover:bg-muted transition-colors"
          >
            پاک کردن فیلترها
          </button>
        </div>
      </div>

      <AdminTable
        columns={columns}
        data={(result?.data as OrderRow[]) || []}
        isLoading={query.isLoading}
      />

      {query.isError && (
        <div className="rounded-app border border-destructive bg-destructive/10 p-4 text-center text-destructive">
          خطا در بارگذاری سفارشات
        </div>
      )}
    </div>
  );
}

export default OrdersList;