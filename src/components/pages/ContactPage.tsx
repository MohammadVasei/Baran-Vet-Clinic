"use client";

import { Fragment, useRef } from "react";
import { useGSAP } from "@/lib/gsap";
import { revealLines, revealUp, prefersReducedMotion } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { CONTACT, CLINIC } from "@/lib/content";
import { PhoneIcon, ClockIcon, InstagramIcon, ThreadsIcon, MapPinIcon } from "@/components/icons";

export function ContactPage() {
  const root = useRef<HTMLElement>(null);
  const headline = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (prefersReducedMotion() || reduced || !root.current || !headline.current) return;
      const { split } = revealLines(headline.current, {
        mask: true,
        stagger: 0.1,
        start: "top 85%",
        once: true,
      });
      revealUp(".contact-eyebrow", { once: true });
      revealUp(".contact-intro", { once: true });
      revealUp(".contact-cards", { once: true, y: 24 });
      revealUp(".contact-info", { once: true, y: 24 });
      return () => split.revert();
    },
    { scope: root, dependencies: [reduced] }
  );

  return (
    <section id="contact" ref={root} className="relative overflow-hidden bg-background py-20 lg:py-32">
      <div className="container-site relative">
        <div className="max-w-2xl text-center">
          <p className="contact-eyebrow eyebrow">{CONTACT.eyebrow}</p>
          <h1
            ref={headline}
            className="mt-8 font-display text-3xl font-bold leading-[1.35] text-foreground sm:text-4xl lg:text-[2.75rem]"
          >
            {CONTACT.headline.map((line, i) => (
              <Fragment key={line}>
                {line}
                {i < CONTACT.headline.length - 1 && <br />}
              </Fragment>
            ))}
          </h1>
          <p className="contact-intro mt-6 text-lg leading-relaxed text-muted-foreground">
            {CONTACT.intro}
          </p>
        </div>

        {/* Contact Cards */}
        <div className="contact-cards mt-12 grid gap-6 md:grid-cols-3">
          {CONTACT.phones.map((phone) => (
            <a
              key={phone.label}
              href={phone.href}
              className="relative rounded-app-lg border border-border bg-surface p-6 text-center transition-shadow duration-normal hover:shadow-lg"
            >
              <div className="flex items-center justify-center gap-2 mb-4">
                <PhoneIcon className="size-6 text-primary" />
                <span className="font-label text-sm text-primary uppercase tracking-widest">{phone.label}</span>
              </div>
              <span className="block text-2xl font-bold tracking-wider" dir="ltr">{phone.number}</span>
              {phone.whatsapp && (
                <a
                  href={phone.whatsapp}
                  target="_blank"
                  rel="noopener"
                  className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-green-500 px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
                >
                  <PhoneIcon className="size-4" />
                  واتساپ
                </a>
              )}
            </a>
          ))}
        </div>

        {/* Social & Address */}
        <div className="contact-info mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-app-lg border border-border bg-surface p-6">
            <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
              <InstagramIcon className="size-5 text-primary" />
              شبکه‌های اجتماعی
            </h3>
            <ul className="mt-4 space-y-3">
              {CONTACT.socials.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener"
                    className="flex items-center gap-3 text-muted-foreground transition-colors hover:text-primary"
                  >
                    {social.label === "اینستاگرام" && <InstagramIcon className="size-5 shrink-0" />}
                    {social.label === "ترددز" && <ThreadsIcon className="size-5 shrink-0" />}
                    <span className="font-medium">@{social.handle}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-app-lg border border-border bg-surface p-6">
            <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
              <MapPinIcon className="size-5 text-primary" />
              آدرس
            </h3>
            <address className="mt-4 not-italic leading-relaxed text-muted-foreground">
              <p>{CONTACT.address}</p>
              <a
                href="https://maps.google.com/?q=مشهد،+احمدآباد،+بلور+بعثت،+پلاک+94"
                target="_blank"
                rel="noopener"
                className="mt-4 inline-flex items-center gap-2 font-label text-sm font-medium text-primary hover:underline"
              >
                <MapPinIcon className="size-4" />
                مسیریابی
              </a>
            </address>
          </div>
        </div>

        {/* Hours */}
        <div className="mt-10 rounded-app-lg border border-border bg-surface p-6">
          <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
            <ClockIcon className="size-5 text-primary" />
            ساعات کاری
          </h3>
          <p className="mt-2 font-label text-sm text-primary">{CONTACT.hoursNote}</p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {CONTACT.hours.map((h, i) => (
              <li key={i} className="flex items-center gap-3 text-muted-foreground">
                <ClockIcon className="size-4 shrink-0" />
                <span><strong>{h.days}:</strong> {h.time}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Final Message */}
        <div className="mt-10 text-center">
          <p className="text-lg font-semibold text-foreground">{CONTACT.finalMessage}</p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href={CLINIC.phoneHref} className="btn btn-primary min-w-[200px]">
              <PhoneIcon className="size-4" />
              تماس با کلینیک
            </a>
            <a href={CLINIC.mobile1WhatsApp} target="_blank" rel="noopener" className="btn btn-outline min-w-[200px]">
              <PhoneIcon className="size-4" />
              پیام در واتساپ
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}