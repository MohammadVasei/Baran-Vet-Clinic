"use client";

import { Fragment, useEffect, useRef, useState, useMemo } from "react";
import { useGSAP, gsap } from "@/lib/gsap";
import { revealLines, revealUp, prefersReducedMotion, duration, ease } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { APPOINTMENT, ANIMALS, CLINIC, SERVICES } from "@/lib/content";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { ArrowIcon, CheckIcon, ClockIcon, PhoneIcon, PinIcon, XIcon } from "@/components/icons";
import { GoldieVideo } from "@/components/mascot";

const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const toFa = (n: number) => String(n).replace(/\d/g, (d) => FA_DIGITS[+d]);

type Fields = {
  service: string | null;
  animal: string | null;
  day: string | null;
  time: string | null;
  name: string;
  phone: string;
  petName: string;
};

const EMPTY_FIELDS: Fields = {
  service: null,
  animal: null,
  day: null,
  time: null,
  name: "",
  phone: "",
  petName: "",
};

type DayOption = { iso: string; weekday: string; day: string };

type ChipOption = { value: string; label: string; sub?: string; disabled?: boolean };

type TimeSlot = { time: string; available: boolean };

type BookingResponse = {
  success: boolean;
  booking?: {
    id: string;
    reference_code: string;
    service_name: string;
    doctor_name: string;
    date: string;
    time: string;
  };
  error?: string;
  details?: Record<string, string[]>;
};

/** Radio-style single-select option chips (APG radios, RTL-aware arrows). */
function OptionChips({
  name,
  options,
  value,
  onChange,
}: {
  name: string;
  options: ChipOption[];
  value: string | null;
  onChange: (v: string) => void;
}) {
  const enabled = options.filter((o) => !o.disabled);
  const focusValue = value ?? enabled[0]?.value ?? null;

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const keys = enabled.map((o) => o.value);
    if (keys.length === 0) return;
    const cur = keys.indexOf(value ?? "");
    const base = cur === -1 ? 0 : cur;
    const rtl =
      typeof document !== "undefined" && document.documentElement.dir === "rtl";
    let next: string | null = null;
    if (e.key === "ArrowDown" || (rtl ? e.key === "ArrowLeft" : e.key === "ArrowRight"))
      next = keys[(base + 1) % keys.length];
    else if (e.key === "ArrowUp" || (rtl ? e.key === "ArrowRight" : e.key === "ArrowLeft"))
      next = keys[(base - 1 + keys.length) % keys.length];
    if (next === null) return;
    e.preventDefault();
    onChange(next);
    document.getElementById(`ap-opt-${next}`)?.focus();
  }

  return (
    <div role="radiogroup" aria-label={name} onKeyDown={handleKeyDown} className="flex flex-wrap gap-3">
      {options.map((opt) => {
        const selected = value === opt.value;
        const tabIndex = opt.disabled ? -1 : opt.value === focusValue ? 0 : -1;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            id={`ap-opt-${opt.value}`}
            aria-checked={selected}
            disabled={opt.disabled}
            tabIndex={tabIndex}
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

export function AppointmentCTA() {
  const root = useRef<HTMLElement>(null);
  const headline = useRef<HTMLHeadingElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const liveRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);
  const [fields, setFields] = useState<Fields>(EMPTY_FIELDS);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [days, setDays] = useState<DayOption[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [referenceCode, setReferenceCode] = useState<string | null>(null);

  const selectedDoctorId = useMemo(() => {
    if (!fields.service) return null;
    const doctorMap: Record<string, string> = {
      'darman': 'dr-tazik',
      'shenasname': 'dr-tazik',
      'grooming': 'moghan-jahani',
      'petshop': 'dr-tazik',
    };
    return doctorMap[fields.service] || 'dr-tazik';
  }, [fields.service]);

  const STEPS = APPOINTMENT.steps;
  const selectedService = SERVICES.items.find((s) => s.key === fields.service);
  const selectedAnimal = ANIMALS.categories.find((a) => a.key === fields.animal);
  const selectedDay = days.find((d) => d.iso === fields.day);
  const selectedTimeSlot = timeSlots.find((t) => t.time === fields.time);

  // Build the next 7 real days after mount (client-only — avoids any
  // SSR/build-time vs runtime date mismatch).
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

  // Fetch available time slots when day, service, or doctor changes
  useEffect(() => {
    if (!fields.day || !fields.service || !selectedDoctorId) {
      return;
    }

    const controller = new AbortController();
    const params = new URLSearchParams({
      date: fields.day,
      doctor_id: selectedDoctorId,
      service_id: fields.service,
    });

    fetch(`/api/availability?${params.toString()}`, { signal: controller.signal })
      .then(res => res.json())
      .then(data => {
        if (data.slots) setTimeSlots(data.slots);
      })
      .catch(err => {
        if (err.name !== 'AbortError') console.error('Availability fetch failed:', err);
      });

    return () => controller.abort();
  }, [fields.day, fields.service, selectedDoctorId]);

  // Announce step changes to screen readers (visible text mirrors the panel).
  useEffect(() => {
    if (liveRef.current) {
      liveRef.current.textContent = submitted
        ? "نوبت شما ثبت شد"
        : `مرحله ${toFa(step + 1)} از ${toFa(STEPS.length)}: ${STEPS[step].label}`;
    }
  }, [step, submitted, STEPS]);

  // Move focus to the step heading so keyboard/SR users track the wizard
  // position after any step change (Wizard APG pattern).
  useEffect(() => {
    titleRef.current?.focus({ preventScroll: false });
  }, [step, submitted]);

  const stepComplete = [
    !!fields.service,
    !!fields.animal,
    !!fields.day && !!fields.time,
    true,
  ][step];

  function goNext() {
    if (!stepComplete) return;
    setErrors({});
    setSubmitError(null);
    setStep((s) => s + 1);
  }

  function goBack() {
    setErrors({});
    setSubmitError(null);
    setStep((s) => Math.max(0, s - 1));
  }

  function normalizePhone(value: string) {
    const faToEn = value.replace(/[۰-۹]/g, (d) => String(FA_DIGITS.indexOf(d)));
    return faToEn.replace(/[^\d]/g, "");
  }

  function validateContact() {
    const next: Record<string, string> = {};
    if (!fields.name.trim()) next.name = "نام خود را وارد کنید";
    if (!fields.phone.trim()) {
      next.phone = "شماره تلفن را وارد کنید";
    } else if (!/^0?\d{10,11}$/.test(normalizePhone(fields.phone))) {
      next.phone = "شماره تلفن معتبر نیست";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit() {
    if (!validateContact()) return;
    if (!fields.day || !fields.time || !fields.service || !selectedDoctorId) return;

    setPending(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: fields.service,
          doctor_id: selectedDoctorId,
          booking_date: fields.day,
          booking_time: fields.time,
          customer_name: fields.name.trim(),
          customer_phone: normalizePhone(fields.phone),
          pet_name: fields.petName.trim() || undefined,
          pet_type: selectedAnimal?.key,
        }),
      });

      const data: BookingResponse = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          // Slot taken - refetch availability and show error
          setSubmitError(data.error || 'این بازه زمانی رزرو شده است');
          const params = new URLSearchParams({
            date: fields.day,
            doctor_id: selectedDoctorId,
            service_id: fields.service,
          });
          const availRes = await fetch(`/api/availability?${params.toString()}`);
          const availData = await availRes.json();
          if (availData.slots) setTimeSlots(availData.slots);
        } else if (response.status === 400 && data.details) {
          // Validation errors
          const fieldErrors: Record<string, string> = {};
          Object.entries(data.details).forEach(([key, messages]) => {
            if (messages.length) fieldErrors[key] = messages[0];
          });
          setErrors(fieldErrors);
        } else {
          setSubmitError(data.error || 'خطا در ثبت نوبت. لطفاً دوباره تلاش کنید.');
        }
        setPending(false);
        return;
      }

      // Success
      if (data.booking) {
        setReferenceCode(data.booking.reference_code);
        setSubmitted(true);
      }
    } catch (err) {
      console.error('Booking submit error:', err);
      setSubmitError('خطای شبکه. لطفاً اتصال اینترنت را چک کنید و دوباره تلاش کنید.');
    } finally {
      setPending(false);
    }
  }

  function reset() {
    setFields(EMPTY_FIELDS);
    setErrors({});
    setSubmitError(null);
    setReferenceCode(null);
    setStep(0);
    setSubmitted(false);
  }

  // Section entry reveals (eyebrow / split headline / intro / card / side).
  useGSAP(
    () => {
      if (prefersReducedMotion() || reduced || !root.current || !headline.current) return;
      const { split } = revealLines(headline.current, {
        mask: true,
        stagger: 0.1,
        start: "top 85%",
        once: true,
      });
      revealUp(".ap-eyebrow", { once: true });
      revealUp(".ap-intro", { once: true });
      revealUp(".ap-card", { once: true, y: 32 });
      revealUp(".ap-side", { once: true, y: 32 });
      return () => split.revert();
    },
    { scope: root, dependencies: [reduced] }
  );

  // Step / confirmation panel transition (cross-fade + rise). Uses plain
  // `opacity` (not autoAlpha) so the heading stays focusable while the new
  // step is focused (visibility:hidden during the tween would reject focus).
  useGSAP(
    () => {
      if (!panel.current) return;
      if (prefersReducedMotion() || reduced) {
        gsap.set(panel.current, { clearProps: "all" });
        return;
      }
      gsap.fromTo(
        panel.current,
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: duration("--duration-normal"),
          ease: ease(),
          overwrite: "auto",
        }
      );
    },
    { scope: root, dependencies: [step, submitted, reduced] }
  );

  const dayLabel = selectedDay ? `${selectedDay.weekday} ${selectedDay.day}` : "";

  return (
    <section
      id="appointment"
      ref={root}
      aria-labelledby="appointment-heading"
      className="relative overflow-hidden bg-background py-20 lg:py-32"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute start-[-5rem] top-16 size-80 rounded-full bg-primary-soft opacity-50 blur-3xl" />
        <div className="absolute bottom-8 end-[-4rem] size-80 rounded-full bg-accent-soft opacity-40 blur-3xl" />
      </div>

      <div className="container-site relative">
        <div className="mx-auto max-w-2xl text-center">
          <p className="ap-eyebrow eyebrow">{APPOINTMENT.eyebrow}</p>
          <h2
            id="appointment-heading"
            ref={headline}
            className="mt-8 font-display text-3xl font-bold leading-[1.35] text-foreground sm:text-4xl lg:text-[2.75rem]"
          >
            {APPOINTMENT.headline.map((line, i) => (
              <Fragment key={line}>
                {line}
                {i < APPOINTMENT.headline.length - 1 && <br />}
              </Fragment>
            ))}
          </h2>
          <p className="ap-intro mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            {APPOINTMENT.intro}
          </p>
        </div>

        <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-12">
          {/* Booking flow card */}
          <div className="ap-card lg:col-span-8 rounded-app-lg border border-border bg-surface p-6 shadow-lg sm:p-8 lg:p-10">
            {submitted ? (
              /* ---- Confirmation (step 5) ---- */
              <div
                ref={panel}
                key="done"
                className="flex flex-col items-center py-2 text-center sm:py-6"
              >
                <GoldieVideo
                  src="/videos/goldie/celebrating.webm"
                  alt="گلدگی، جشن موفقیت"
                  className="w-48 h-48 sm:w-64 sm:h-64 mx-auto mb-4"
                />
                <h3
                  ref={titleRef}
                  tabIndex={-1}
                  className="mt-6 font-display text-2xl font-bold text-foreground outline-none"
                >
                  نوبتِ شما با موفقیت ثبت شد
                </h3>
                <p className="mt-3 max-w-md text-muted-foreground">{APPOINTMENT.note}</p>

                <dl className="mt-8 grid w-full max-w-md gap-x-8 gap-y-3 rounded-app border border-border bg-surface-alt p-6 text-start sm:grid-cols-2">
                  <div>
                    <dt className="font-label text-xs text-muted-foreground">خدمت</dt>
                    <dd className="mt-0.5 font-semibold text-foreground">{selectedService?.name}</dd>
                  </div>
                  <div>
                    <dt className="font-label text-xs text-muted-foreground">حیوان</dt>
                    <dd className="mt-0.5 font-semibold text-foreground">{selectedAnimal?.name}</dd>
                  </div>
                  <div>
                    <dt className="font-label text-xs text-muted-foreground">تاریخ</dt>
                    <dd className="mt-0.5 font-semibold text-foreground">{dayLabel}</dd>
                  </div>
                  <div>
                    <dt className="font-label text-xs text-muted-foreground">زمان</dt>
                    <dd className="mt-0.5 font-semibold text-foreground">{selectedTimeSlot?.time}</dd>
                  </div>
                  <div>
                    <dt className="font-label text-xs text-muted-foreground">نام</dt>
                    <dd className="mt-0.5 font-semibold text-foreground">{fields.name}</dd>
                  </div>
                  <div>
                    <dt className="font-label text-xs text-muted-foreground">تلفن</dt>
                    <dd dir="ltr" className="mt-0.5 text-end font-semibold text-foreground">
                      {fields.phone}
                    </dd>
                  </div>
                </dl>

                {referenceCode && (
                  <p className="mt-6 font-label text-sm text-muted-foreground">
                    کد پیگیری:{" "}
                    <span dir="ltr" className="font-semibold text-foreground text-primary">
                      {referenceCode}
                    </span>
                  </p>
                )}

                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  <button type="button" onClick={reset} className="btn btn-outline">
                    ثبت نوبت دیگر
                  </button>
                  <a href={CLINIC.phoneHref} className="btn btn-primary">
                    تماس فوری با کلینیک
                  </a>
                </div>
              </div>
            ) : (
              /* ---- Active step ---- */
              <div ref={panel} key={step}>
                <ol aria-label="مراحل رزرو" className="flex items-start">
                  {STEPS.map((s, i) => {
                    const done = i < step;
                    const active = i === step;
                    return (
                      <li key={s.key} className="relative flex flex-1 items-start justify-center">
                        {i > 0 && (
                          <span
                            aria-hidden
                            className={`absolute end-1/2 top-4 h-[2px] w-full -translate-y-1/2 ${
                              i <= step ? "bg-primary" : "bg-border"
                            }`}
                          />
                        )}
                        <div className="flex flex-col items-center gap-2">
                          <span
                            className={`relative z-10 grid size-8 place-items-center rounded-full border-2 font-label text-sm font-bold transition-colors duration-normal ${
                              done
                                ? "border-accent bg-accent text-accent-foreground"
                                : active
                                  ? "border-primary bg-primary text-on-primary"
                                  : "border-border-strong bg-surface text-muted-foreground"
                            }`}
                            aria-current={active ? "step" : undefined}
                          >
                            {done ? <CheckIcon className="size-4" /> : toFa(i + 1)}
                          </span>
                          <span
                            className={`text-xs ${
                              active ? "font-semibold text-foreground" : "text-muted-foreground"
                            }`}
                          >
                            {s.label}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ol>

                <div aria-hidden className="mt-6 h-1 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-[width] duration-slow ease-out"
                    style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                  />
                </div>

                <h3
                  ref={titleRef}
                  tabIndex={-1}
                  className="mt-8 font-display text-xl font-bold text-foreground outline-none sm:text-2xl"
                >
                  {STEPS[step].title}
                </h3>
                <p className="mt-2 text-muted-foreground">{STEPS[step].hint}</p>

                <div className="mt-6">
                  {step === 0 && (
                    <OptionChips
                      name="انتخاب خدمت"
                      value={fields.service}
                      onChange={(v) => setFields((f) => ({ ...f, service: v }))}
                      options={SERVICES.items.map((s) => ({ value: s.key, label: s.name }))}
                    />
                  )}

                  {step === 1 && (
                    <OptionChips
                      name="انتخاب نوع حیوان"
                      value={fields.animal}
                      onChange={(v) => setFields((f) => ({ ...f, animal: v }))}
                      options={ANIMALS.categories.map((a) => ({ value: a.key, label: a.name }))}
                    />
                  )}

                  {step === 2 && (
                    <div className="space-y-6">
                      {days.length === 0 ? (
                        <p className="text-sm text-muted-foreground">در حال بارگذاری تقویم نوبت‌ها…</p>
                      ) : (
                        <OptionChips
                          name="انتخاب روز"
                          value={fields.day}
                          onChange={(v) => setFields((f) => ({ ...f, day: v }))}
                          options={days.map((d, i) => ({
                            value: d.iso,
                            label: i === 0 ? "امروز" : d.weekday,
                            sub: d.day,
                          }))}
                        />
                      )}
                      {fields.day && fields.service && selectedDoctorId && (
                        <div>
                          <p className="field-label">بازهٔ زمانی</p>
                          {timeSlots.length === 0 ? (
                            <p className="text-sm text-muted-foreground">در حال بررسی زمان‌های خالی…</p>
                          ) : (
                            <OptionChips
                              name="انتخاب زمان"
                              value={fields.time}
                              onChange={(v) => setFields((f) => ({ ...f, time: v }))}
                              options={timeSlots.map((slot) => ({
                                value: slot.time,
                                label: slot.time,
                                disabled: !slot.available,
                              }))}
                            />
                          )}
                          {timeSlots.length > 0 && timeSlots.every(s => !s.available) && (
                            <p className="mt-2 text-sm text-destructive flex items-center gap-1">
                              <XIcon className="size-4" />
                              همه بازه‌های این روز پر است. روز دیگری انتخاب کنید.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {step === 3 && (
                    <form
                      id="ap-form"
                      noValidate
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit();
                      }}
                      className="grid gap-5 sm:grid-cols-2"
                    >
                      {submitError && (
                        <div className="sm:col-span-2 rounded-app border border-destructive bg-destructive/10 p-4 flex items-start gap-3" role="alert">
                          <XIcon className="size-5 shrink-0 text-destructive mt-0.5" />
                          <p className="text-sm text-destructive">{submitError}</p>
                        </div>
                      )}
                      <div>
                        <label htmlFor="ap-name" className="field-label">
                          نام شما <span className="text-destructive">*</span>
                        </label>
                        <input
                          id="ap-name"
                          name="name"
                          type="text"
                          autoComplete="name"
                          required
                          className="field-input"
                          value={fields.name}
                          onChange={(e) => {
                            setFields((f) => ({ ...f, name: e.target.value }));
                            setErrors((er) => {
                              const next = { ...er };
                              delete next.name;
                              return next;
                            });
                          }}
                          aria-invalid={!!errors.name}
                          aria-describedby={errors.name ? "ap-name-error" : undefined}
                          placeholder="مثلاً: سارا احمدی"
                        />
                        {errors.name && (
                          <span id="ap-name-error" role="alert" className="field-error">
                            {errors.name}
                          </span>
                        )}
                      </div>

                      <div>
                        <label htmlFor="ap-phone" className="field-label">
                          تلفن همراه <span className="text-destructive">*</span>
                        </label>
                        <input
                          id="ap-phone"
                          name="phone"
                          type="tel"
                          autoComplete="tel"
                          required
                          dir="ltr"
                          inputMode="tel"
                          className="field-input text-left"
                          value={fields.phone}
                          onChange={(e) => {
                            setFields((f) => ({ ...f, phone: e.target.value }));
                            setErrors((er) => {
                              const next = { ...er };
                              delete next.phone;
                              return next;
                            });
                          }}
                          aria-invalid={!!errors.phone}
                          aria-describedby={errors.phone ? "ap-phone-error" : undefined}
                          placeholder="09120000000"
                        />
                        {errors.phone && (
                          <span id="ap-phone-error" role="alert" className="field-error">
                            {errors.phone}
                          </span>
                        )}
                      </div>

                      <div className="sm:col-span-2">
                        <label htmlFor="ap-pet" className="field-label">
                          نام حیوان خانگی (اختیاری)
                        </label>
                        <input
                          id="ap-pet"
                          name="pet"
                          type="text"
                          className="field-input"
                          value={fields.petName}
                          onChange={(e) => setFields((f) => ({ ...f, petName: e.target.value }))}
                          placeholder="مثلاً: برفی"
                        />
                      </div>
                    </form>
                  )}
                </div>

                <div className="mt-8 flex items-center justify-between gap-4">
                  <button type="button" onClick={goBack} disabled={step === 0} className="btn btn-outline">
                    <ArrowIcon direction="forward" className="size-5" />
                    قبلی
                  </button>

                  {step < STEPS.length - 1 ? (
                    <button type="button" onClick={goNext} disabled={!stepComplete} className="btn btn-primary">
                      بعدی
                      <ArrowIcon direction="back" className="size-5" />
                    </button>
                  ) : (
                    <MagneticButton
                      type="submit"
                      form="ap-form"
                      disabled={pending}
                      ariaBusy={pending}
                      className="btn btn-primary"
                    >
                      {pending ? "در حال ثبت…" : "ثبت نوبت"}
                    </MagneticButton>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Direct-contact side card */}
          <aside
            className="ap-side lg:col-span-4 flex flex-col gap-6 rounded-app-lg border border-border bg-surface p-6 shadow-lg sm:p-8"
            aria-label="تماس مستقیم با کلینیک"
          >
            <div>
              <h3 className="font-display text-xl font-bold text-foreground">اطلاعات بیشتر</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                ترجیح می‌دهید مستقیم با ما در تماس باشید؟ از راه‌های زیر می‌توانید اقدام کنید.
              </p>
            </div>

            <ul className="space-y-5 text-sm">
              <li className="flex items-start gap-3">
                <ClockIcon className="mt-0.5 size-5 shrink-0 text-primary-text" />
                <div>
                  <span className="block font-semibold text-foreground">ساعت کاری</span>
                  <span className="mt-0.5 block text-muted-foreground">
                    {CLINIC.hoursNote}
                  </span>
                  {CLINIC.hours.map((h, i) => (
                    <span key={i} className="block mt-1 text-muted-foreground">
                      {h.days}: {h.time}
                    </span>
                  ))}
                </div>
              </li>
              <li className="flex items-start gap-3">
                <PhoneIcon className="mt-0.5 size-5 shrink-0 text-primary-text" />
                <div>
                  <span className="block font-semibold text-foreground">تلفن</span>
                  <a
                    dir="ltr"
                    href={CLINIC.phoneHref}
                    className="mt-0.5 block text-muted-foreground transition-colors duration-fast hover:text-primary-text-hover"
                  >
                    {CLINIC.phone}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <PinIcon className="mt-0.5 size-5 shrink-0 text-primary-text" />
                <div>
                  <span className="block font-semibold text-foreground">آدرس</span>
                  <span className="mt-0.5 block leading-relaxed text-muted-foreground">
                    {CLINIC.address}
                  </span>
                </div>
              </li>
            </ul>

            <MagneticButton href={CLINIC.phoneHref} className="btn btn-outline mt-auto">
              تماس با کلینیک
            </MagneticButton>
          </aside>
        </div>
      </div>

      <span ref={liveRef} className="sr-only" aria-live="polite" />
    </section>
  );
}