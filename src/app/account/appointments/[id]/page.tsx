"use client";

import { useGSAP } from "@/lib/gsap";
import { revealUp, prefersReducedMotion } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { CalendarIcon, ClockIcon, CheckCircleIcon, XCircleIcon, AlertCircleIcon, ArrowIcon, EditIcon, PawIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatJalaliDate } from "@/lib/animals";

interface Booking {
  id: string;
  status: string;
  booking_date: string;
  booking_time: string;
  reference_code: string;
  customer_name: string;
  customer_phone: string;
  pet_name: string | null;
  pet_type: string | null;
  notes: string | null;
  payment_status: string;
  amount_rial: number | null;
  service?: { id: string; name: string } | null;
  doctor?: { id: string; name: string } | null;
}

interface NotesHistory {
  id: string;
  entity_type: string;
  author_id: string;
  content: string;
  created_at: string;
}

export default function AccountAppointmentDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { user } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [notesHistory, setNotesHistory] = useState<NotesHistory[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const headline = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (prefersReducedMotion() || reduced || !root.current || !headline.current) return;
      const revealTweens = [
        revealUp(headline.current, { once: true, y: 30 }),
        revealUp(".booking-summary", { once: true, y: 24, delay: 0.1 }),
        revealUp(".booking-notes", { once: true, y: 24, delay: 0.2 }),
      ];
      return () => revealTweens.forEach((t) => t.kill());
    },
    { scope: root, dependencies: [reduced, booking] }
  );

  useEffect(() => {
    if (!user || !id) return;
    const controller = new AbortController();
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [bookingRes, historyRes] = await Promise.all([
          fetch(`/api/account/bookings/${id}`, { signal: controller.signal }),
          fetch(`/api/account/bookings/${id}/notes-history`, { signal: controller.signal }),
        ]);
        if (!bookingRes.ok) {
          if (bookingRes.status === 404) setError("نوبت یافت نشد");
          else setError("خطا در بارگذاری نوبت");
          return;
        }
        const data = await bookingRes.json();
        const historyData = historyRes.ok ? await historyRes.json() : { history: [] };
        setBooking(data.booking);
        setNotes(data.booking.notes || "");
        setNotesHistory(historyData.history || []);
      } catch (err) {
        if ((err as Error).name !== "AbortError") setError("خطا در بارگذاری نوبت");
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [user, id]);

  const handleSaveNotes = async () => {
    if (!booking) return;
    setSaving(true);
    setSaved(false);
    setMessage(null);
    try {
      const res = await fetch(`/api/account/bookings/${booking.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      if (!res.ok) throw new Error("failed");
      setSaved(true);
      setMessage("یادداشت برای پزشک ذخیره شد.");
      setBooking((b) => (b ? { ...b, notes: notes || null } : b));
      const historyRes = await fetch(`/api/account/bookings/${booking.id}/notes-history`);
      if (historyRes.ok) {
        const historyData = await historyRes.json();
        setNotesHistory(historyData.history || []);
      }
    } catch {
      setMessage("خطا در ذخیره یادداشت");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    if (!booking) return;
    if (!confirm("آیا از لغو این نوبت مطمئن هستید؟")) return;
    setCancelling(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/account/bookings/${booking.id}`, { method: "POST" });
      if (!res.ok) throw new Error("failed");
      setMessage("نوبت با موفقیت لغو شد.");
      setBooking((b) => (b ? { ...b, status: "cancelled" } : b));
    } catch {
      setMessage("خطا در لغو نوبت");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-2xl font-bold text-foreground">جزئیات نوبت</h1>
        <div className="rounded-app-lg border border-border bg-surface p-12 text-center">
          <AlertCircleIcon className="size-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-foreground mb-4">{error || "نوبت یافت نشد"}</p>
          <Link href="/account/appointments">
            <Button variant="outline">
              <ArrowIcon direction="forward" className="size-4" />
              بازگشت به نوبت‌ها
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const cancellable = booking.status === "pending" || booking.status === "confirmed";
  const completed = booking.status === "completed";
  const cancelled = booking.status === "cancelled";

  return (
    <div ref={root} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 ref={headline} className="font-display text-2xl font-bold text-foreground">جزئیات نوبت</h1>
          <p className="text-muted-foreground mt-1" dir="ltr">{booking.reference_code}</p>
        </div>
        <Link href="/account/appointments">
          <Button variant="outline">
            <ArrowIcon direction="forward" className="size-4" />
            بازگشت
          </Button>
        </Link>
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 p-3 rounded-app border text-sm ${
            saved || cancelled
              ? "bg-accent-green-soft border-accent-green text-accent-green-fg"
              : "bg-destructive-soft border-destructive text-destructive-soft-fg"
          }`}
        >
          <CheckCircleIcon className="size-4" />
          <span>{message}</span>
        </div>
      )}

      <div className="booking-summary rounded-app-lg border border-border bg-surface p-6 grid gap-6 sm:grid-cols-3">
        <div className="col-span-full flex items-center justify-between gap-4">
          <h2 className="font-display text-lg font-bold text-foreground">{booking.service?.name || "خدمت"}</h2>
          <StatusBadge
            status={booking.status}
            labels={{ pending: "در انتظار تأیید" }}
          />
        </div>
        <div className="flex items-center gap-3">
          <CalendarIcon className="size-5 text-primary shrink-0" />
          <div>
            <span className="block text-xs text-muted-foreground">تاریخ</span>
            <span className="font-medium">{formatJalaliDate(booking.booking_date)}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ClockIcon className="size-5 text-primary shrink-0" />
          <div>
            <span className="block text-xs text-muted-foreground">زمان</span>
            <span className="font-medium">{booking.booking_time}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <PawIcon className="size-5 text-primary shrink-0" />
          <div>
            <span className="block text-xs text-muted-foreground">حیوان</span>
            <span className="font-medium">{booking.pet_name || "—"}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="size-5 text-primary shrink-0 grid place-items-center font-bold">{booking.doctor?.name?.charAt(0) || "پ"}</span>
          <div>
            <span className="block text-xs text-muted-foreground">پزشک</span>
            <span className="font-medium">{booking.doctor?.name || "—"}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <PawIcon className="size-5 text-primary shrink-0" />
          <div>
            <span className="block text-xs text-muted-foreground">نام شما</span>
            <span className="font-medium">{booking.customer_name}</span>
          </div>
        </div>
        {booking.amount_rial != null && (
          <div className="flex items-center gap-3">
            <span className="size-5 text-primary shrink-0 grid place-items-center font-bold">م</span>
            <div>
              <span className="block text-xs text-muted-foreground">مبلغ</span>
              <span className="font-medium">{new Intl.NumberFormat("fa-IR").format(booking.amount_rial)} ریال</span>
            </div>
          </div>
        )}
      </div>

      <div className="booking-notes rounded-app-lg border border-border bg-surface p-6">
        <div className="flex items-center gap-2 mb-4">
          <EditIcon className="size-5 text-primary" />
          <h2 className="font-display text-lg font-bold text-foreground">یادداشت برای پزشک</h2>
        </div>
        {completed ? (
          <p className="text-sm text-muted-foreground">این نوبت انجام شده است.</p>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="booking-notes">پیام یا توضیحات خود برای پزشک (مثلاً علائم، سوالات)</Label>
              <textarea
                id="booking-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full rounded-app border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="مثلاً: دو روز است اشتها ندارد و کم‌حوصله است..."
                disabled={cancelled}
              />
            </div>
            <div className="mt-4 flex items-center gap-3">
              <Button onClick={handleSaveNotes} disabled={saving || cancelled}>
                {saving ? "در حال ذخیره..." : "ذخیره یادداشت"}
              </Button>
              {cancellable && (
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="text-destructive border-destructive/40 hover:bg-red-50"
                >
                  <XCircleIcon className="size-4" />
                  لغو نوبت
                </Button>
              )}
            </div>
            {notesHistory.length > 0 && (
              <div className="mt-6 space-y-3 rounded-app-lg border border-border bg-surface p-6">
                <h2 className="font-display text-xl font-bold text-foreground">تاریخچه یادداشت‌ها</h2>
                <div className="space-y-2">
                  {notesHistory.map((note) => (
                    <div
                      key={note.id}
                      className="flex items-start gap-3 rounded-app bg-muted/30 p-3 text-sm"
                    >
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {new Date(note.created_at).toLocaleDateString("fa-IR")}
                      </span>
                      <div className="min-w-0 flex-1 whitespace-pre-wrap break-word">{note.content}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
