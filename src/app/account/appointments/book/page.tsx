"use client";

import { useGSAP, gsap } from "@/lib/gsap";
import { revealUp, prefersReducedMotion, duration, ease } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ArrowIcon, CheckIcon, XIcon, CheckCircleIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { supabaseClient } from "@/lib/supabase-client";

const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const toFa = (n: number) => String(n).replace(/\d/g, (d) => FA_DIGITS[+d]);
const digitsOnly = (v: string | null | undefined) => (v || "").replace(/\D/g, "");
const toLocalPhone = (v: string | null | undefined): string => {
  let d = digitsOnly(v);
  if (d.startsWith("98")) d = d.slice(2);
  if (d.startsWith("0")) d = d.slice(1);
  return "0" + d.slice(-10);
};

type ServiceOption = { key: string; name: string; price_rial: number | null; doctor_id: string | null };
type PetOption = { id: string; name: string; speciesCode: string | null };
type DayOption = { iso: string; weekday: string; day: string };
type TimeSlot = { time: string; available: boolean };
type StepDef = { key: string; label: string; title: string; hint: string };
type DoctorInfo = { id: string; name: string } | null;

const SPECIES_TO_PET_TYPE: Record<string, string> = {
  dog: "dog",
  cat: "cat",
  bird: "bird",
  rabbit: "exotic",
  other: "other",
};

const STEPS: StepDef[] = [
  { key: "service", label: "خدمت", title: "خدمت مورد نظر", hint: "خدمتی که می‌خواهید رزرو کنید را انتخاب کنید." },
  { key: "pet", label: "حیوان", title: "حیوان خانگی", hint: "حیوان خانگی خود را انتخاب کنید یا نوع آن را مشخص کنید." },
  { key: "time", label: "زمان", title: "انتخاب زمان", hint: "روز و بازه زمانی مورد نظر را انتخاب کنید." },
  { key: "confirm", label: "تأیید", title: "تأیید و ثبت نوبت", hint: "اطلاعات نوبت خود را بررسی کنید و ثبت کنید." },
];

function formatRial(value: number | null | undefined): string | null {
  if (!value) return null;
  return `${new Intl.NumberFormat("fa-IR").format(value)} ریال`;
}

function ChipGroup({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: { value: string; label: string; sub?: string; disabled?: boolean }[];
  value: string | null;
  onChange: (v: string) => void;
}) {
  const enabled = options.filter((o) => !o.disabled);
  const focusValue = value ?? enabled[0]?.value ?? null;

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const keys = enabled.map((o) => o.value);
    if (!keys.length) return;
    const cur = keys.indexOf(value ?? "");
    const base = cur === -1 ? 0 : cur;
    const rtl = document.documentElement.dir === "rtl";
    let next: string | null = null;
    if (e.key === "ArrowDown" || (rtl ? e.key === "ArrowLeft" : e.key === "ArrowRight"))
      next = keys[(base + 1) % keys.length];
    else if (e.key === "ArrowUp" || (rtl ? e.key === "ArrowRight" : e.key === "ArrowLeft"))
      next = keys[(base - 1 + keys.length) % keys.length];
    if (!next) return;
    e.preventDefault();
    onChange(next);
    document.getElementById(`chip-${next}`)?.focus();
  }

  return (
    <div role="radiogroup" aria-label={name} onKeyDown={handleKeyDown} className="flex flex-wrap gap-3">
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            id={`chip-${opt.value}`}
            aria-checked={selected}
            disabled={opt.disabled}
            tabIndex={opt.value === focusValue ? 0 : -1}
            onClick={() => onChange(opt.value)}
            className={`choice-chip ${opt.sub ? "flex-col gap-0.5 px-5 py-2" : ""}`}
          >
            {opt.sub ? (
              <>
                <span className="font-label text-sm font-bold leading-tight">{opt.label}</span>
                <span className="text-xs leading-tight opacity-80">{opt.sub}</span>
              </>
            ) : (
              opt.label
            )}
          </button>
        );
      })}
    </div>
  );
}

export default function AccountAppointmentBookPage() {
  const { user } = useAuth();
  const root = useRef<HTMLDivElement>(null);
  const headline = useRef<HTMLHeadingElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();

  const [step, setStep] = useState(0);
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [referenceCode, setReferenceCode] = useState<string | null>(null);

  const [services, setServices] = useState<ServiceOption[]>([]);
  const [pets, setPets] = useState<PetOption[]>([]);
  const [days, setDays] = useState<DayOption[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [doctorResolution, setDoctorResolution] = useState<{ service: string; info: DoctorInfo } | null>(null);

  const [service, setService] = useState<string | null>(null);
  const [pet, setPet] = useState<string | null>(null);
  const [petTypeManual, setPetTypeManual] = useState<string | null>(null);
  const [day, setDay] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [petName, setPetName] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const selectedService = services.find((s) => s.key === service);
  const selectedPet = pets.find((p) => p.id === pet);
  const selectedDay = days.find((d) => d.iso === day);
  const selectedAnimalType = petTypeManual || selectedPet?.speciesCode || null;
  const resolvedPetType = selectedAnimalType ? (SPECIES_TO_PET_TYPE[selectedAnimalType] || "other") : null;

  const doctorForService = doctorResolution?.service === service ? doctorResolution : null;
  const doctorInfo = doctorForService?.info ?? null;
  const doctorLoading = !!service && doctorForService === null;

  const stepComplete = [!!service, !!pet || !!petTypeManual, !!day && !!time, true][step];

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabaseClient
        .from("services")
        .select("key,name,price_rial,doctor_id")
        .eq("is_active", true)
        .order("display_order");
      if (active && data) setServices(data as ServiceOption[]);
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      const { data } = await supabaseClient
        .from("animals")
        .select("id,name,species:species(id,code)")
        .eq("owner_id", user.id)
        .eq("status", "active");
      if (!active || !data) return;
      setPets(
        (data as unknown as { id: string; name: string; species: { code: string }[] | null }[]).map((a) => ({
          id: a.id,
          name: a.name,
          speciesCode: a.species?.[0]?.code ?? null,
        }))
      );
    })();
    return () => { active = false; };
  }, [user]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      const weekdayFmt = new Intl.DateTimeFormat("fa-IR", { weekday: "long" });
      const dayFmt = new Intl.DateTimeFormat("fa-IR", { day: "numeric" });
      const now = new Date();
      setDays(
        Array.from({ length: 7 }, (_, i) => {
          const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
          return {
            iso: d.toISOString().slice(0, 10),
            weekday: weekdayFmt.format(d),
            day: dayFmt.format(d),
          };
        })
      );
    }, 0);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!service) return;
    let active = true;
    const serviceKey = service;
    (async () => {
      try {
        const { data } = await supabaseClient
          .from("services")
          .select("doctor_id")
          .eq("key", serviceKey)
          .maybeSingle();
        if (!active) return;
        const doctorId = data?.doctor_id;
        if (!doctorId) { setDoctorResolution({ service: serviceKey, info: null }); return; }
        const { data: doc } = await supabaseClient
          .from("doctors")
          .select("id,name")
          .eq("id", doctorId)
          .eq("is_active", true)
          .maybeSingle();
        if (active) setDoctorResolution({ service: serviceKey, info: (doc as DoctorInfo) || null });
      } catch {
        if (active) setDoctorResolution({ service: serviceKey, info: null });
      }
    })();
    return () => { active = false; };
  }, [service]);

  useEffect(() => {
    if (!day || !service || !doctorInfo) return;
    const controller = new AbortController();
    const params = new URLSearchParams({
      date: day,
      doctor_id: doctorInfo.id,
      service_id: service,
    });
    fetch(`/api/availability?${params}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => { if (data.slots) setTimeSlots(data.slots); })
      .catch(() => {});
    return () => controller.abort();
  }, [day, service, doctorInfo]);

  useEffect(() => { titleRef.current?.focus({ preventScroll: false }); }, [step, submitted]);

  useGSAP(
    () => {
      if (!panel.current) return;
      if (prefersReducedMotion() || reduced) { gsap.set(panel.current, { clearProps: "all" }); return; }
      gsap.fromTo(panel.current, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: duration("--duration-normal"), ease: ease(), overwrite: "auto" });
    },
    { scope: root, dependencies: [step, submitted, reduced] }
  );

  useGSAP(
    () => {
      if (prefersReducedMotion() || reduced || !root.current || !headline.current) return;
      const tw = [revealUp(headline.current, { once: true, y: 30 }), revealUp(".book-card", { once: true, y: 24, delay: 0.1 })];
      return () => tw.forEach((t) => t.kill());
    },
    { scope: root, dependencies: [reduced, submitted] }
  );

  function goNext() { if (stepComplete) setStep((s) => s + 1); }
  function goBack() { setSubmitError(null); setStep((s) => Math.max(0, s - 1)); }

  async function handleSubmit() {
    if (!service || !day || !time || !doctorInfo) return;
    setPending(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_id: service,
          doctor_id: doctorInfo.id,
          booking_date: day,
          booking_time: time,
          customer_name: (user?.user_metadata?.full_name || user?.email || "").trim(),
          customer_phone: toLocalPhone(user?.phone ?? user?.user_metadata?.phone ?? ""),
          pet_name: petName.trim() || selectedPet?.name || undefined,
          pet_type: resolvedPetType || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409 && data.slots) setTimeSlots(data.slots);
        setSubmitError(data.error || "خطا در ثبت نوبت");
        setPending(false);
        return;
      }
      setReferenceCode(data.booking?.reference_code ?? null);
      setSubmitted(true);
    } catch {
      setSubmitError("خطای شبکه. لطفاً دوباره تلاش کنید.");
    } finally {
      setPending(false);
    }
  }

  if (!user) {
    return <div className="p-8 text-center text-muted-foreground">لطفاً ابتدا وارد شوید.</div>;
  }

  return (
    <div ref={root} className="space-y-6">
      <div>
        <h1 ref={headline} className="font-display text-2xl font-bold text-foreground">ثبت نوبت جدید</h1>
        <p className="text-muted-foreground mt-1">نوبت خود را با چند مرحله ساده ثبت کنید.</p>
      </div>

      <div className="book-card rounded-app-lg border border-border bg-surface p-6 sm:p-8">
        {submitted ? (
          <div ref={panel} key="done" className="flex flex-col items-center py-6 text-center">
            <CheckCircleIcon className="size-16 text-green-600 mx-auto mb-4" />
            <h2 ref={titleRef} tabIndex={-1} className="font-display text-2xl font-bold text-foreground outline-none">نوبت شما ثبت شد</h2>
            {referenceCode && (
              <p className="mt-4 text-muted-foreground">
                کد پیگیری: <span dir="ltr" className="font-semibold text-primary">{referenceCode}</span>
              </p>
            )}
            <div className="mt-6 grid w-full max-w-md gap-x-8 gap-y-3 rounded-app border border-border bg-surface-alt p-6 text-start sm:grid-cols-2">
              <div><dt className="font-label text-xs text-muted-foreground">خدمت</dt><dd className="mt-0.5 font-semibold">{selectedService?.name}</dd></div>
              <div><dt className="font-label text-xs text-muted-foreground">پزشک</dt><dd className="mt-0.5 font-semibold">{doctorInfo?.name || "—"}</dd></div>
              <div><dt className="font-label text-xs text-muted-foreground">تاریخ</dt><dd className="mt-0.5 font-semibold">{selectedDay ? `${selectedDay.weekday} ${selectedDay.day}` : "—"}</dd></div>
              <div><dt className="font-label text-xs text-muted-foreground">زمان</dt><dd className="mt-0.5 font-semibold">{time}</dd></div>
            </div>
            <div className="mt-8 flex gap-3">
              <Link href="/account/appointments"><Button variant="outline">نوبت‌های من</Button></Link>
              <Link href="/account"><Button>بازگشت به پنل</Button></Link>
            </div>
          </div>
        ) : (
          <div ref={panel} key={step}>
            <ol aria-label="مراحل رزرو" className="flex items-start">
              {STEPS.map((s, i) => {
                const done = i < step;
                const active = i === step;
                return (
                  <li key={s.key} className="relative flex flex-1 items-start justify-center">
                    {i > 0 && <span aria-hidden className={`absolute end-1/2 top-4 h-[2px] w-full -translate-y-1/2 ${i <= step ? "bg-primary" : "bg-border"}`} />}
                    <div className="flex flex-col items-center gap-2">
                      <span className={`relative z-10 grid size-8 place-items-center rounded-full border-2 font-label text-sm font-bold transition-colors duration-normal ${done ? "border-accent bg-accent text-accent-foreground" : active ? "border-primary bg-primary text-on-primary" : "border-border-strong bg-surface text-muted-foreground"}`} aria-current={active ? "step" : undefined}>
                        {done ? <CheckIcon className="size-4" /> : toFa(i + 1)}
                      </span>
                      <span className={`text-xs ${active ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{s.label}</span>
                    </div>
                  </li>
                );
              })}
            </ol>
            <div aria-hidden className="mt-6 h-1 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-[width] duration-slow ease-out" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
            </div>

            <h3 ref={titleRef} tabIndex={-1} className="mt-8 font-display text-xl font-bold text-foreground outline-none sm:text-2xl">{STEPS[step].title}</h3>
            <p className="mt-2 text-muted-foreground">{STEPS[step].hint}</p>

            <div className="mt-6">
              {step === 0 && (
                services.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">در حال بارگذاری خدمات...</p>
                ) : (
                  <ChipGroup
                    name="انتخاب خدمت"
                    value={service}
                    onChange={(v) => { setService(v); setDay(null); setTime(null); }}
                    options={services.map((s) => ({
                      value: s.key,
                      label: s.name,
                      sub: formatRial(s.price_rial) ?? undefined,
                    }))}
                  />
                )
              )}

              {step === 1 && (
                <div className="space-y-5">
                  {pets.length > 0 && (
                    <ChipGroup
                      name="انتخاب حیوان"
                      value={pet}
                      onChange={(v) => { setPet(v); setPetTypeManual(null); }}
                      options={pets.map((p) => ({ value: p.id, label: p.name }))}
                    />
                  )}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {pets.length > 0 ? "یا نوع حیوان را انتخاب کنید:" : "نوع حیوان خود را انتخاب کنید:"}
                    </label>
                    <ChipGroup
                      name="نوع حیوان"
                      value={petTypeManual}
                      onChange={(v) => { setPetTypeManual(v); setPet(null); }}
                      options={[
                        { value: "dog", label: "سگ" },
                        { value: "cat", label: "گربه" },
                        { value: "bird", label: "پرنده" },
                        { value: "rabbit", label: "خرگوش" },
                        { value: "other", label: "سایر" },
                      ]}
                    />
                  </div>
                  <div>
                    <label htmlFor="pet-name" className="block text-sm font-medium text-foreground mb-2">نام حیوان (اختیاری)</label>
                    <input
                      id="pet-name"
                      type="text"
                      className="w-full rounded-app border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={petName}
                      onChange={(e) => setPetName(e.target.value)}
                      placeholder="مثلاً: برفی"
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <p className="block text-sm font-medium text-foreground mb-2">روز</p>
                    {days.length === 0 ? (
                      <p className="text-sm text-muted-foreground">در حال بارگذاری تقویم...</p>
                    ) : (
                      <ChipGroup
                        name="انتخاب روز"
                        value={day}
                        onChange={(v) => { setDay(v); setTime(null); }}
                        options={days.map((d, i) => ({
                          value: d.iso,
                          label: i === 0 ? "امروز" : d.weekday,
                          sub: d.day,
                        }))}
                      />
                    )}
                  </div>
                  {day && service && doctorInfo && (
                    <div>
                      <p className="block text-sm font-medium text-foreground mb-2">بازه زمانی</p>
                      {timeSlots.length === 0 ? (
                        <p className="text-sm text-muted-foreground">در حال بررسی زمان‌های خالی...</p>
                      ) : (
                        <ChipGroup
                          name="انتخاب زمان"
                          value={time}
                          onChange={(v) => setTime(v)}
                          options={timeSlots.map((s) => ({
                            value: s.time,
                            label: s.time,
                            disabled: !s.available,
                          }))}
                        />
                      )}
                      {timeSlots.length > 0 && timeSlots.every((s) => !s.available) && (
                        <p className="mt-2 text-sm text-destructive flex items-center gap-1">
                          <XIcon className="size-4" />
                          همه بازه‌های این روز پر است. روز دیگری انتخاب کنید.
                        </p>
                      )}
                    </div>
                  )}
                  {!doctorInfo && !doctorLoading && service && (
                    <p className="text-sm text-destructive">هنوز پزشکی برای این خدمت تعیین نشده است.</p>
                  )}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div className="grid gap-3 rounded-app border border-border bg-surface-alt p-4 text-sm sm:grid-cols-2">
                    <div className="flex items-center gap-2"><span className="text-muted-foreground">خدمت:</span><span className="font-semibold">{selectedService?.name}</span></div>
                    <div className="flex items-center gap-2"><span className="text-muted-foreground">مبلغ:</span><span className="font-semibold">{selectedService ? formatRial(selectedService.price_rial) ?? "—" : "—"}</span></div>
                    <div className="flex items-center gap-2"><span className="text-muted-foreground">پزشک:</span><span className="font-semibold">{doctorInfo?.name || "—"}</span></div>
                    <div className="flex items-center gap-2"><span className="text-muted-foreground">تاریخ:</span><span className="font-semibold">{selectedDay ? `${selectedDay.weekday} ${selectedDay.day}` : "—"}</span></div>
                    <div className="flex items-center gap-2"><span className="text-muted-foreground">زمان:</span><span className="font-semibold">{time}</span></div>
                    <div className="flex items-center gap-2"><span className="text-muted-foreground">حیوان:</span><span className="font-semibold">{petName.trim() || selectedPet?.name || "—"}</span></div>
                    <div className="flex items-center gap-2"><span className="text-muted-foreground">نام:</span><span className="font-semibold">{user?.user_metadata?.full_name || user?.email || "—"}</span></div>
                    <div className="flex items-center gap-2"><span className="text-muted-foreground">تلفن:</span><span dir="ltr" className="font-semibold text-left">{toLocalPhone(user?.phone ?? user?.user_metadata?.phone ?? "")}</span></div>
                  </div>
                  {submitError && (
                    <div className="rounded-app border border-destructive bg-destructive/10 p-4 flex items-start gap-3" role="alert">
                      <XIcon className="size-5 shrink-0 text-destructive mt-0.5" />
                      <p className="text-sm text-destructive">{submitError}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-8 flex items-center justify-between gap-4">
              <Button variant="outline" onClick={goBack} disabled={step === 0}>
                <ArrowIcon direction="forward" className="size-4" />
                قبلی
              </Button>
              {step < STEPS.length - 1 ? (
                <Button onClick={goNext} disabled={!stepComplete}>
                  بعدی
                  <ArrowIcon direction="back" className="size-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={pending}>
                  {pending ? "در حال ثبت..." : "ثبت نوبت"}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
