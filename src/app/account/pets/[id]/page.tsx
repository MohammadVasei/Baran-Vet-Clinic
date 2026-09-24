"use client";

import { useGSAP } from "@/lib/gsap";
import { revealUp, prefersReducedMotion } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { PawIcon, AlertCircleIcon, ArrowIcon, EditIcon, CheckCircleIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  ANIMAL_SEX_LABELS,
  ANIMAL_STATUS_LABELS,
  ANIMAL_STATUS_STYLES,
  MEDICAL_RECORD_TYPE_LABELS,
  REMINDER_STATUS_LABELS,
  REMINDER_TYPE_LABELS,
  getAnimalAge,
  formatJalaliDate,
  formatReminderDue,
} from "@/lib/animals";

interface Animal {
  id: string;
  name: string;
  owner_id: string | null;
  owner_phone: string | null;
  species?: { id: string; name: string } | null;
  breed?: { id: string; name: string } | null;
  sex: string;
  date_of_birth: string | null;
  weight: number | null;
  color: string | null;
  microchip_number: string | null;
  neutered: boolean;
  allergies: string | null;
  medical_notes: string | null;
  status: string;
  profile_image: string | null;
}

interface MedicalRecord {
  id: string;
  type: string;
  title: string;
  description: string | null;
  performed_at: string;
  vaccine?: { id: string; name: string } | null;
  treatment_type?: { id: string; name: string } | null;
  doctor?: { id: string; name: string; role: string } | null;
  next_reminder_date: string | null;
}

interface Reminder {
  id: string;
  type: string;
  title: string;
  due_date: string;
  due_time: string | null;
  status: string;
  priority: string;
}

interface NotesHistory {
  id: string;
  entity_type: string;
  author_id: string;
  content: string;
  created_at: string;
}

const REMINDER_STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  due: "bg-blue-100 text-blue-700",
  overdue: "bg-red-100 text-red-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-gray-100 text-gray-700",
};

export default function AccountPetDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { user } = useAuth();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [notesHistory, setNotesHistory] = useState<NotesHistory[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const headline = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (prefersReducedMotion() || reduced || !root.current || !headline.current) return;
      const revealTweens = [
        revealUp(headline.current, { once: true, y: 30 }),
        revealUp(".pet-info", { once: true, y: 24, delay: 0.1 }),
        revealUp(".pet-notes", { once: true, y: 24, delay: 0.15 }),
        revealUp(".pet-history", { once: true, y: 24, delay: 0.2 }),
        revealUp(".pet-reminders", { once: true, y: 24, delay: 0.25 }),
      ];
      return () => revealTweens.forEach((t) => t.kill());
    },
    { scope: root, dependencies: [reduced, animal, records, reminders, notesHistory] }
  );

  useEffect(() => {
    if (!user || !id) return;
    let active = true;
    const fetchPet = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/account/animals/${id}`, {
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) {
          if (active) setError("حیوان یافت نشد یا به حساب شما تعلق ندارد");
          return;
        }
        const data = await res.json();
        if (!active) return;
        const a = data.animal as Animal;
        setAnimal(a);
        setNotes(a.medical_notes || "");
        setRecords((data.records as MedicalRecord[]) || []);
        setReminders((data.reminders as Reminder[]) || []);
        setNotesHistory((data.history as NotesHistory[]) || []);
      } catch (err) {
        console.error("Fetch pet error:", err);
        if (active) setError("خطا در بارگذاری پرونده حیوان");
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchPet();
    return () => {
      active = false;
    };
  }, [user, id]);

  const handleSaveNotes = async () => {
    if (!animal) return;
    setSaving(true);
    setSaved(false);
    setMessage(null);
    try {
      const res = await fetch(`/api/account/animals/${animal.id}/notes`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      if (!res.ok) throw new Error("failed");
      setSaved(true);
      setMessage("یادداشت ذخیره شد و برای پزشک قابل مشاهده است.");
    } catch {
      setMessage("خطا در ذخیره یادداشت");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">در حال بارگذاری...</p>
      </div>
    );
  }

  if (error || !animal) {
    return (
      <div className="space-y-6">
        <div className="rounded-app-lg border border-border bg-surface p-12 text-center">
          <AlertCircleIcon className="size-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-foreground mb-4">{error || "حیوان یافت نشد"}</p>
          <Link href="/account/pets">
            <Button variant="outline">
              <ArrowIcon direction="forward" className="size-4" />
              بازگشت به حیوانات
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const statusStyle =
    ANIMAL_STATUS_STYLES[animal.status as keyof typeof ANIMAL_STATUS_STYLES] ||
    "bg-gray-100 text-gray-700";

  return (
    <div ref={root} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {animal.profile_image ? (
            <img src={animal.profile_image} alt={animal.name} className="size-16 rounded-full object-cover" />
          ) : (
            <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
              <PawIcon className="size-8 text-primary" />
            </div>
          )}
          <div>
            <h1 ref={headline} className="font-display text-2xl font-bold text-foreground">{animal.name}</h1>
            <p className="text-muted-foreground mt-1">
              {animal.species?.name}
              {animal.breed?.name && ` · ${animal.breed?.name}`} — {getAnimalAge(animal.date_of_birth)}
            </p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full w-fit ${statusStyle}`}>
          {ANIMAL_STATUS_LABELS[animal.status as keyof typeof ANIMAL_STATUS_LABELS] || animal.status}
        </span>
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 p-3 rounded-app border text-sm ${
            saved ? "bg-green-50 border-green-100 text-green-700" : "bg-red-50 border-red-100 text-red-700"
          }`}
        >
          {saved ? <CheckCircleIcon className="size-4" /> : <AlertCircleIcon className="size-4" />}
          <span>{message}</span>
        </div>
      )}

      {/* Pet info */}
      <div className="pet-info grid gap-4 rounded-app-lg border border-border bg-surface p-6 sm:grid-cols-3">
        <div>
          <span className="text-sm text-muted-foreground">جنسیت</span>
          <p className="mt-1 font-medium">{ANIMAL_SEX_LABELS[animal.sex as keyof typeof ANIMAL_SEX_LABELS] || "—"}</p>
        </div>
        <div>
          <span className="text-sm text-muted-foreground">وزن</span>
          <p className="mt-1 font-medium">{animal.weight != null ? `${animal.weight} کیلوگرم` : "—"}</p>
        </div>
        <div>
          <span className="text-sm text-muted-foreground">رنگ</span>
          <p className="mt-1 font-medium">{animal.color || "—"}</p>
        </div>
        <div>
          <span className="text-sm text-muted-foreground">میکروچیپ</span>
          <p className="mt-1 font-medium" dir="ltr">{animal.microchip_number || "—"}</p>
        </div>
        <div>
          <span className="text-sm text-muted-foreground">عقیم‌سازی</span>
          <p className="mt-1 font-medium">{animal.neutered ? "انجام شده" : "انجام نشده"}</p>
        </div>
        <div>
          <span className="text-sm text-muted-foreground">تولد</span>
          <p className="mt-1 font-medium">{animal.date_of_birth ? formatJalaliDate(animal.date_of_birth) : "—"}</p>
        </div>
        {animal.allergies && (
          <div className="sm:col-span-3">
            <span className="text-sm text-muted-foreground">حساسیت‌ها</span>
            <p className="mt-1">{animal.allergies}</p>
          </div>
        )}
      </div>

      {/* Notes for doctor */}
      <div className="pet-notes rounded-app-lg border border-border bg-surface p-6">
        <div className="flex items-center gap-2 mb-4">
          <EditIcon className="size-5 text-primary" />
          <h2 className="font-display text-lg font-bold text-foreground">یادداشت برای پزشک</h2>
        </div>
        <div className="space-y-2">
          <Label htmlFor="pet-notes">هر نکته‌ای که پزشک باید بداند اینجا بنویسید</Label>
          <textarea
            id="pet-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full rounded-app border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="مثلاً: نسبت به غذای جدید حساس شد، وقتی مراجعه می‌کنیم لطفاً واکسن یادآوری را بزنید..."
          />
        </div>
        <div className="mt-4">
          <Button onClick={handleSaveNotes} disabled={saving}>
            {saving ? "در حال ذخیره..." : "ذخیره یادداشت"}
          </Button>
        </div>
        {notesHistory.length > 0 && (
          <div className="pet-notes-history space-y-3 rounded-app-lg border border-border bg-surface p-6 mt-6">
            <h2 className="font-display text-xl font-bold text-foreground">تاریخچه یادداشت‌های دکتر</h2>
            <div className="space-y-2">
              {notesHistory.map((note) => (
                <div key={note.id} className="flex items-center gap-3 px-3 py-2 rounded-app bg-muted/30 text-sm">
                  <span className="text-muted-foreground text-xs">{new Date(note.created_at).toLocaleDateString('fa-IR')}</span>
                  <div className="flex-1 whitespace-pre-wrap break-word">{note.content}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Treatment history */}
      <div className="pet-history space-y-3">
        <h2 className="font-display text-xl font-bold text-foreground">سابقه درمان و واکسیناسیون</h2>
        {records.length === 0 ? (
          <div className="rounded-app-lg border border-border bg-surface p-6 text-center text-muted-foreground">
            هنوز سابقه‌ای ثبت نشده است.
          </div>
        ) : (
          <div className="rounded-app-lg border border-border bg-surface overflow-x-auto">
            <table className="w-full" role="table">
              <thead>
                <tr className="text-right text-sm text-muted-foreground border-b border-border">
                  <th className="px-4 py-3 font-medium">تاریخ</th>
                  <th className="px-4 py-3 font-medium">نوع</th>
                  <th className="px-4 py-3 font-medium">درمان / واکسن</th>
                  <th className="px-4 py-3 font-medium">پزشک</th>
                  <th className="px-4 py-3 font-medium">یادآوری بعدی</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 text-sm whitespace-nowrap">{formatJalaliDate(record.performed_at)}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs rounded-full bg-muted">
                        {MEDICAL_RECORD_TYPE_LABELS[record.type] || record.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      {record.vaccine?.name || record.treatment_type?.name || record.title || "—"}
                      {record.description && <p className="mt-0.5 text-xs text-muted-foreground font-normal">{record.description}</p>}
                    </td>
                    <td className="px-4 py-3 text-sm">{record.doctor?.name || "—"}{record.doctor?.role && ` (${record.doctor.role})`}</td>
                    <td className="px-4 py-3 text-sm">
                      {record.next_reminder_date ? formatJalaliDate(record.next_reminder_date) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upcoming reminders */}
      <div className="pet-reminders space-y-3">
        <h2 className="font-display text-xl font-bold text-foreground">یادآوری‌های این حیوان</h2>
        {reminders.length === 0 ? (
          <div className="rounded-app-lg border border-border bg-surface p-6 text-center text-muted-foreground">
            یادآوری در انتظاری وجود ندارد.
          </div>
        ) : (
          <div className="space-y-2">
            {reminders.map((reminder) => {
              const statusStyle =
                REMINDER_STATUS_STYLES[reminder.status] || "bg-gray-100 text-gray-700";
              return (
                <div
                  key={reminder.id}
                  className="flex items-center justify-between gap-4 rounded-app-lg border border-border bg-surface px-4 py-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{reminder.title}</span>
                      <span className="px-2 py-0.5 text-xs rounded-full bg-muted">
                        {REMINDER_TYPE_LABELS[reminder.type] || reminder.type}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      موعد: <span className="font-medium text-foreground">{formatReminderDue(reminder.due_date, reminder.due_time)}</span>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full whitespace-nowrap ${statusStyle}`}>
                    {REMINDER_STATUS_LABELS[reminder.status] || reminder.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}