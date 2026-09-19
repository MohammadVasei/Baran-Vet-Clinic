"use client";

import { useGSAP } from "@/lib/gsap";
import { revealUp, prefersReducedMotion } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { CalendarIcon, ClockIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatJalaliDate } from "@/lib/animals";

interface Booking {
  id: string;
  status: string;
  booking_date: string;
  booking_time: string;
  reference_code: string;
  pet_name: string | null;
  notes: string | null;
  service?: { id: string; name: string } | null;
  doctor?: { id: string; name: string } | null;
}

function isUpcoming(booking: Booking): boolean {
  if (booking.status === "cancelled" || booking.status === "completed") return false;
  const today = new Date();
  const dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const bookingDay = new Date(`${booking.booking_date}T00:00:00Z`);
  return bookingDay.getTime() >= dayStart.getTime();
}

export default function AccountAppointmentsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"upcoming" | "history">("upcoming");
  const root = useRef<HTMLDivElement>(null);
  const headline = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (prefersReducedMotion() || reduced || !root.current || !headline.current) return;
      const revealTweens = [
        revealUp(headline.current, { once: true, y: 30 }),
        revealUp(".appointments-tabs", { once: true, y: 24, delay: 0.1 }),
        revealUp(".appointments-list", { once: true, y: 24, delay: 0.2 }),
      ];
      return () => revealTweens.forEach((t) => t.kill());
    },
    { scope: root, dependencies: [reduced, bookings, tab] }
  );

  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();
    const fetchBookings = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/account/bookings", { signal: controller.signal });
        if (!res.ok) throw new Error("failed");
        const data = await res.json();
        setBookings(data.bookings || []);
      } catch (err) {
        if ((err as Error).name !== "AbortError") setError("خطا در بارگذاری نوبت‌ها");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
    return () => controller.abort();
  }, [user]);

  const upcoming = bookings.filter(isUpcoming);
  const history = bookings.filter((b) => !isUpcoming(b));
  const visible = tab === "upcoming" ? upcoming : history;

  return (
    <div ref={root} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 ref={headline} className="font-display text-2xl font-bold text-foreground">نوبت‌های من</h1>
          <p className="text-muted-foreground mt-1">مدیریت رزروها، تاریخچه و رزرو نوبت جدید</p>
        </div>
        <Link href="/account/appointments/book">
          <Button>
            <CalendarIcon className="size-4" />
            رزرو نوبت جدید
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="appointments-tabs flex gap-2" role="tablist" aria-label="بخش نوبت‌ها">
        <button
          role="tab"
          aria-selected={tab === "upcoming"}
          onClick={() => setTab("upcoming")}
          className={`flex-1 py-2.5 px-4 rounded-app text-sm font-medium transition-all sm:flex-none sm:px-8 ${
            tab === "upcoming" ? "bg-primary text-on-primary" : "text-muted-foreground hover:bg-muted"
          }`}
        >
          نوبت‌های پیش رو ({upcoming.length})
        </button>
        <button
          role="tab"
          aria-selected={tab === "history"}
          onClick={() => setTab("history")}
          className={`flex-1 py-2.5 px-4 rounded-app text-sm font-medium transition-all sm:flex-none sm:px-8 ${
            tab === "history" ? "bg-primary text-on-primary" : "text-muted-foreground hover:bg-muted"
          }`}
        >
          تاریخچه نوبت‌ها ({history.length})
        </button>
      </div>

      <div className="appointments-list rounded-app-lg border border-border bg-surface overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">در حال بارگذاری نوبت‌ها...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-destructive">{error}</div>
        ) : visible.length === 0 ? (
          <div className="p-12 text-center">
            <CalendarIcon className="size-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-display text-lg font-bold text-foreground mb-2">
              {tab === "upcoming" ? "نوبتی در پیش ندارید" : "هنوز نوبتی ثبت نشده"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {tab === "upcoming"
                ? "از طریق دکمه «رزرو نوبت جدید» اولین نوبت خود را ثبت کنید."
                : "نوبت‌های ثبت‌شده شما اینجا نمایش داده می‌شوند."}
            </p>
            {tab === "upcoming" && (
              <Link
                href="/account/appointments/book"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-app bg-primary text-on-primary font-bold hover:opacity-90 transition-opacity"
              >
                <CalendarIcon className="size-4" />
                رزرو نوبت جدید
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {visible.map((booking) => (
              <Link
                key={booking.id}
                href={`/account/appointments/${booking.id}`}
                className="block px-4 py-4 sm:px-6 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="font-medium text-foreground">
                        {booking.service?.name || "خدمت"}
                      </span>
                      {booking.doctor?.name && (
                        <span className="text-sm text-muted-foreground">— {booking.doctor.name}</span>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarIcon className="size-4" />
                        {formatJalaliDate(booking.booking_date)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <ClockIcon className="size-4" />
                        {booking.booking_time}
                      </span>
                      {booking.pet_name && <span>حیوان: {booking.pet_name}</span>}
                      <span className="font-mono" dir="ltr">{booking.reference_code}</span>
                    </div>
                    {booking.notes && (
                      <p className="mt-1 truncate text-sm text-muted-foreground">{booking.notes}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <StatusBadge status={booking.status} />
                    <span className="text-xs text-primary hover:underline">جزییات</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}