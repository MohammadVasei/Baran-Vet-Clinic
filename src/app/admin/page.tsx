"use client";

import { useList, useNavigation } from "@refinedev/core";
import {
  FilterIcon,
  CalendarIcon,
  ChevronDownIcon,
  AlertCircleIcon,
  ArrowIcon,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { subDays, format } from "date-fns";
import clsx from "clsx";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Title, Filler } from "chart.js";
import { Line, Bar, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  Filler
);

const formatDateAgo = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
  if (diffMinutes < 1) return "همین الان";
  if (diffMinutes < 60) return `${diffMinutes} دقیقه پیش`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} ساعت پیش`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} روز پیش`;
  return new Date(dateStr).toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

interface AlertItem {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "warning" | "info";
  created_at: string;
  resource: string;
  itemId: string;
}

const severityColors = {
  critical: { bg: "bg-red-500/20", border: "border-red-500/30", icon: "text-red-500" },
  warning: { bg: "bg-yellow-500/20", border: "border-yellow-500/30", icon: "text-yellow-500" },
  info: { bg: "bg-blue-500/20", border: "border-blue-500/30", icon: "text-blue-500" },
};

export default function AdminDashboard() {
  const navigation = useNavigation();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(null);

  // Metric data
  const pendingBookingsListResult = useList({
    resource: "bookings",
    sorters: [{ field: "created_at", order: "desc" }],
    filters: [{ field: "status", operator: "eq", value: "pending" }],
    meta: { select: "id,status,created_at" },
  });

  // Stock levels (all) for distribution chart and low stock count
  const lowStockListResult = useList({
    resource: "stock_levels",
    sorters: [{ field: "quantity_on_hand", order: "asc" }],
    meta: {
      select:
        "product_id,quantity_on_hand,low_stock_threshold,updated_at,products(name,price_rial,category,is_active)",
    },
  });

  // Unpaid orders (for metric) and all orders for paid vs unpaid pie
  const unpaidOrdersListResult = useList({
    resource: "orders",
    sorters: [{ field: "created_at", order: "desc" }],
    filters: [{ field: "status", operator: "eq", value: "pending" }],
    meta: { select: "id,total_rial,status,created_at" },
  });

  // All orders for paid count
  const ordersOverviewListResult = useList({
    resource: "orders",
    sorters: [{ field: "created_at", order: "desc" }],
    meta: { select: "id,total_rial,status,created_at" },
  });

  // Bookings trend for last 7 days
  const sevenDaysAgo = subDays(new Date(), 7);
  const bookingsTrendListResult = useList({
    resource: "bookings",
    sorters: [{ field: "booking_date", order: "asc" }],
    filters: [
      { field: "booking_date", operator: "gte", value: sevenDaysAgo.toISOString() },
    ],
    meta: { select: "id,booking_date,status,created_at" },
  });

  const todayBookingsListResult = useList({
    resource: "bookings",
    sorters: [{ field: "created_at", order: "desc" }],
    meta: { select: "id,booking_date,status,created_at" },
  });

  const {
    result: pendingBookingsResult,
  } = pendingBookingsListResult;
  const {
    result: lowStockResult,
  } = lowStockListResult;
  const {
    result: unpaidOrdersResult,
  } = unpaidOrdersListResult;
  const {
    result: ordersOverviewResult,
  } = ordersOverviewListResult;
  const {
    result: bookingsTrendResult,
  } = bookingsTrendListResult;
  const {
    result: todayBookingsResult,
  } = todayBookingsListResult;

  const pendingCount = pendingBookingsResult?.data?.length || 0;
  const lowStockItems = lowStockResult?.data || [];
  const lowStockCount = lowStockItems.filter((s: any) => s.quantity_on_hand !== null && s.low_stock_threshold !== null && s.quantity_on_hand <= s.low_stock_threshold).length || 0;
  const unpaidCount = unpaidOrdersResult?.data?.length || 0;
  const allOrders = ordersOverviewResult?.data || [];
  const paidCount = allOrders.filter((o: any) => o.status !== "pending").length || 0;
  const todayBookings = todayBookingsResult?.data || [];
  const todayCount = todayBookings.filter((b: any) => {
    const bookingDate = new Date(b.booking_date);
    const today = new Date();
    return bookingDate.toDateString() === today.toDateString();
  }).length || 0;

  // Chart data states
  const [bookingsChartData, setBookingsChartData] = useState<any>(null);
  const [stockChartData, setStockChartData] = useState<any>(null);
  const [unpaidChartData, setUnpaidChartData] = useState<any>(null);

  useEffect(() => {
    try {
      const alerts: AlertItem[] = [];

      if (pendingCount > 0) {
        alerts.push({
          id: "1",
          title: "نوبت‌های منتظر تأیید",
          description: `${pendingCount} نوبت در انتظار بررسی`,
          severity: "critical",
          created_at: new Date().toISOString(),
          resource: "bookings",
          itemId: "",
        });
      }

      if (lowStockCount > 0) {
        alerts.push({
          id: "2",
          title: "موجودی انبار کم",
          description: `${lowStockCount} محصول تحت حد موجودی`,
          severity: "warning",
          created_at: new Date().toISOString(),
          resource: "stock-levels",
          itemId: "",
        });
      }

      if (unpaidCount > 0) {
        alerts.push({
          id: "3",
          title: "سفارشات پرداخت نشده",
          description: `${unpaidCount} سفارش مبلغ قابل دریافت`,
          severity: "warning",
          created_at: new Date().toISOString(),
          resource: "orders",
          itemId: "",
        });
      }

      if (todayCount >= 5) {
        alerts.push({
          id: "4",
          title: "حجم نوبت‌های امروز بالا",
          description: `${todayCount} نوبت برای امروز رزرو شده`,
          severity: "info",
          created_at: new Date().toISOString(),
          resource: "bookings",
          itemId: "",
        });
      }

      setAlerts(alerts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      setLoading(false);
    }
  }, [pendingCount, lowStockCount, unpaidCount, todayCount]);

  useEffect(() => {
    // Bookings trend chart (last 7 days)
    if (bookingsTrendResult?.data) {
      const trendData = bookingsTrendResult.data;
      const dayCounts: Record<string, number> = {};
      trendData.forEach((booking) => {
        const date = new Date(booking.booking_date);
        const dayIndex = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        const persianDayNames = ["شنبه", "یک‌شنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه"];
        const dayName = persianDayNames[(dayIndex + 1) % 7];
        dayCounts[dayName] = (dayCounts[dayName] || 0) + 1;
      });
      const labels = ["شنبه", "یک‌شنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه"];
      const data = labels.map((label) => dayCounts[label] || 0);
      setBookingsChartData({
        labels,
        datasets: [
          {
            label: "نوبت‌ها",
            data,
            tension: 0.4,
            borderColor: "rgb(59 130 246)", // blue-500
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            fill: true,
            borderWidth: 2,
          },
        ],
      });
    } else {
      setBookingsChartData(null);
    }

    // Stock levels distribution chart
    if (lowStockResult?.data) {
      const items = lowStockResult.data;
      const categories = ["بسیار کم", "کم", "متوسط", "بسیار", "بیش از حد"];
      const counts = [0, 0, 0, 0, 0];
      items.forEach((item) => {
        const qty = item.quantity_on_hand ?? 0;
        const thr = item.low_stock_threshold ?? 0;
        if (thr <= 0) {
          counts[2]++; // متوسط
          return;
        }
        const ratio = qty / thr;
        let index;
        if (ratio < 0.25) index = 0;
        else if (ratio < 0.5) index = 1;
        else if (ratio < 0.75) index = 2;
        else if (ratio < 1.0) index = 3;
        else index = 4;
        counts[index]++;
      });
      setStockChartData({
        labels: categories,
        datasets: [
          {
            label: "میزان انبار",
            data: counts,
            backgroundColor: [
              "rgb(239 68 68)",   // red-500: بسیار کم
              "rgb(245 158 11)",  // orange-500: کم
              "rgb(212 175 55)",  // yellow-500: متوسط
              "rgb(34 197 94)",   // green-500: بسیار
              "rgb(139 92 246)",  // blue-500: بیش از حد
            ],
            borderColor: [
              "rgb(239 68 68)",
              "rgb(245 158 11)",
              "rgb(212 175 55)",
              "rgb(34 197 94)",
              "rgb(139 92 246)",
            ],
            borderWidth: 1,
          },
        ],
      });
    } else {
      setStockChartData(null);
    }

    // Unpaid orders donut chart
    if (ordersOverviewResult?.data) {
      const orders = ordersOverviewResult.data;
      const paid = orders.filter((o) => o.status !== "pending").length;
      const unpaid = orders.filter((o) => o.status === "pending").length;
      setUnpaidChartData({
        labels: ["پرداخت شده", "پeding"],
        datasets: [
          {
            label: "وضعیت مالی سفارشات",
            data: [paid, unpaid],
            backgroundColor: [
              "rgb(34 197 94)",   // green-500: پرداخت شده
              "rgb(239 68 68)",   // red-500: پending
            ],
            hoverBackgroundColor: [
              "rgba(34, 197, 94, 0.8)",
              "rgba(239, 68, 68, 0.8)",
            ],
          },
        ],
      });
    } else {
      setUnpaidChartData(null);
    }
}, [bookingsTrendResult?.data, lowStockResult?.data, ordersOverviewResult?.data]);

   const handleNavigate = (resource: string, id?: string) => {
    if (resource === "bookings") {
      if (id) navigation.show("bookings", id);
      else navigation.list("bookings");
    } else if (resource === "stock-levels") {
      navigation.list("stock-levels");
    } else if (resource === "orders") {
      navigation.list("orders");
    }
  };

  const toggleAlertExpand = (id: string) => {
    setExpandedAlertId(id === expandedAlertId ? null : id);
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="min-h-screen">
        <div className="space-y-6">
          {/* Metric Cards Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* Card 1: Pending Bookings */}
            <div
              key="1"
              className={clsx(
                "rounded-xl border border-card bg-card p-4 hover:bg-primary/5 transition-colors cursor-pointer select-none",
                pendingCount > 0 && "border-primary/30 hover:ring-2 hover:ring-primary/20"
              )}
              onClick={() => handleNavigate("bookings")}
              aria-label={`نوبت‌های pending: ${pendingCount}`}
              tabIndex={0}
              role="button"
              onKeyDown={(e) => e.key === "Enter" && handleNavigate("bookings")}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-muted-foreground text-sm mb-1">نوبت‌های منتظر تأیید</h3>
                  <p className="font-display text-3xl font-bold text-foreground">
                    {pendingCount}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {pendingCount > 0 ? `${pendingCount} نوبت نیاز به بررسی` : 'همه نوبت‌ها تأیید شده'}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <AlertCircleIcon className="size-5 text-primary" />
                </div>
              </div>
            </div>

            {/* Card 2: Low Stock */}
            <div
              key="2"
              className={clsx(
                "rounded-xl border border-card bg-card p-4 hover:bg-primary/5 transition-colors cursor-pointer select-none",
                lowStockCount > 0 && "border-primary/30 hover:ring-2 hover:ring-primary/20"
              )}
              onClick={() => handleNavigate("stock-levels")}
              aria-label={`موجودی کم: ${lowStockCount}`}
              tabIndex={0}
              role="button"
              onKeyDown={(e) => e.key === "Enter" && handleNavigate("stock-levels")}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-muted-foreground text-sm mb-1">موجودی انبار کم</h3>
                  <p className="font-display text-3xl font-bold text-foreground">
                    {lowStockCount}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {lowStockCount > 0 ? `${lowStockCount} محصول تحت حد موجودی` : 'موجودی انبار در شرایط مناسب'}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ChevronDownIcon className="size-5 text-primary" />
                </div>
              </div>
            </div>

            {/* Card 3: Unpaid Orders */}
            <div
              key="3"
              className={clsx(
                "rounded-xl border border-card bg-card p-4 hover:bg-primary/5 transition-colors cursor-pointer select-none",
                unpaidCount > 0 && "border-primary/30 hover:ring-2 hover:ring-primary/20"
              )}
              onClick={() => handleNavigate("orders")}
              aria-label={`سفارشات پرداخت نشده: ${unpaidCount}`}
              tabIndex={0}
              role="button"
              onKeyDown={(e) => e.key === "Enter" && handleNavigate("orders")}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-muted-foreground text-sm mb-1">سفارشات پرداخت نشده</h3>
                  <p className="font-display text-3xl font-bold text-foreground">
                    {unpaidCount}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {unpaidCount > 0 ? `${unpaidCount} سفارش مبلغ قابل دریافت` : 'تمامی‌ها پرداخت شده'}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FilterIcon className="size-5 text-primary" />
                </div>
              </div>
            </div>

            {/* Card 4: Today's Bookings */}
            <div
              key="4"
              className={clsx(
                "rounded-xl border border-card bg-card p-4 hover:bg-primary/5 transition-colors cursor-pointer select-none",
                todayCount > 0 && "border-primary/30 hover:ring-2 hover:ring-primary/20"
              )}
              onClick={() => handleNavigate("bookings")}
              aria-label={`نوبت‌های امروز: ${todayCount}`}
              tabIndex={0}
              role="button"
              onKeyDown={(e) => e.key === "Enter" && handleNavigate("bookings")}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-muted-foreground text-sm mb-1">نوبت‌های امروز</h3>
                  <p className="font-display text-3xl font-bold text-foreground">
                    {todayCount}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {todayCount > 0 ? `${todayCount} نوبت برای امروز` : 'هیچ نوبت برای امروز ثبت نشده'}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CalendarIcon className="size-5 text-primary" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            <div className="rounded-xl border bg-card p-4">
              <h3 className="font-medium text-muted-foreground mb-3">روند نوبت‌های هفته جاری</h3>
              <div className="h-48">
                {bookingsChartData ? (
                  <Line data={bookingsChartData} options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: { enabled: true, mode: 'index', callbacks: {
                        label: ({ raw }) => `${raw} نوبت`,
                        title: (context) => `روز ${context[0].label}`
                      }},
                    },
                    scales: {
                      y: { display: false, grid: { display: false } },
                      x: { display: false, grid: { display: false } },
                    },
                  }} />
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    می‌آماده می‌شود...
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl border bg-card p-4">
              <h3 className="font-medium text-muted-foreground mb-3">تحلیل موجودی انبار</h3>
              <div className="h-48">
                {stockChartData ? (
                  <Bar data={stockChartData} options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: { enabled: true, callbacks: {
                        label: ({ raw }) => `${raw} محصول`
                      }},
                    },
                    scales: {
                      y: { display: false, grid: { display: false } },
                      x: { display: false, grid: { display: false } },
                    },
                  }} />
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    می‌آماده می‌شود...
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl border bg-card p-4">
              <h3 className="font-medium text-muted-foreground mb-3">تحلیل وضعیت مالی سفارشات</h3>
              <div className="h-48">
                {unpaidChartData ? (
                  <Pie data={unpaidChartData} options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'bottom' },
                      tooltip: { enabled: true, callbacks: {
                        label: ({ raw }) => `${raw}% سفارشات`
                      }},
                    },
                  }} />
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    می‌آماده می‌شود...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Alerts Feed */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h2 className="font-display font-bold text-foreground">هشدارهای مهم</h2>
              <span className="text-xs text-muted-foreground">مشاهده همه({alerts.length})</span>
            </div>
            {loading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto my-6" />
            ) : alerts.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground rounded-app">
                هیچ هشدار فعال وجود ندارد
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    onClick={() => toggleAlertExpand(alert.id)}
                    className={clsx(
                      "rounded-xl border p-4 transition-colors cursor-pointer hover:bg-primary/5",
                      alert.severity === "critical" && "border-red-500/20",
                      alert.severity === "warning" && "border-yellow-500/20",
                      alert.severity === "info" && "border-blue-500/20"
                    )}
                    aria-label={alert.title}
                    tabIndex={0}
                    role="button"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleAlertExpand(alert.id);
                      }
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div className={clsx(
                        "w-10 h-10 rounded flex items-center justify-center",
                        severityColors[alert.severity].bg,
                        severityColors[alert.severity].icon
      )}>
                        {alert.severity === "critical"
                          ? <AlertCircleIcon className="size-4" />
                          : alert.severity === "warning"
                          ? <FilterIcon className="size-4" />
                          : <CalendarIcon className="size-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{alert.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{alert.description}</p>
                      </div>
                      <div className="mt-1 flex-shrink-0">
                        <ArrowIcon
                          className={clsx(
                            "size-4",
                            expandedAlertId === alert.id && "rotate-180"
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleAlertExpand(alert.id);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
<Button
  variant="outline"
  size="sm"
  onClick={() => {
    setAlerts([]);
    alert("همه هشدارها با موفقیت پاک شد");
  }}
  className="mt-2 w-full"
>
  پاک کردن
</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}