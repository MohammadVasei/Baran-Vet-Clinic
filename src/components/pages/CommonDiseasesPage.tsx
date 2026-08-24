"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { gsap } from "@/lib/gsap";
import { useGSAP } from "@/lib/gsap";
import { revealUp, prefersReducedMotion, revealLines } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { CLINIC } from "@/lib/content";
import { ANIMAL_ACCENTS } from "@/lib/accents";
import { PhoneIcon, ChevronDownIcon, SearchIcon, XIcon, FilterIcon } from "@/components/icons";
import { DISEASES_DATA, GENERAL_ADVICE, DISCLAIMER } from "@/lib/diseases-content";

export function CommonDiseasesPage() {
  const root = useRef<HTMLElement>(null);
  const headline = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();
  const [openIndex, setOpenIndex] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Filter state with URL sync
  const [selectedAnimal, setSelectedAnimal] = useState<"all" | "cat" | "dog" | "bird">(
    (searchParams.get("animal") as "all" | "cat" | "dog" | "bird") || "all"
  );
  const [selectedCategory, setSelectedCategory] = useState<"all" | "infectious" | "chronic">(
    (searchParams.get("category") as "all" | "infectious" | "chronic") || "all"
  );
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedAnimal !== "all") params.set("animal", selectedAnimal);
    if (selectedCategory !== "all") params.set("category", selectedCategory);
    if (searchQuery) params.set("search", searchQuery);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [selectedAnimal, selectedCategory, searchQuery, router, pathname]);

  useGSAP(
    () => {
      if (prefersReducedMotion() || reduced || !root.current || !headline.current) return;
      const { split } = revealLines(headline.current, {
        mask: true,
        stagger: 0.1,
        start: "top 85%",
        once: true,
      });
      revealUp(".diseases-disclaimer", { once: true, delay: 0.1 });
      revealUp(".diseases-section", { once: true, y: 24, delay: 0.1 });
      return () => split.revert();
    },
    { scope: root, dependencies: [reduced] }
  );

  const handleAccordionToggle = (index: string) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  // Filter logic
  const filteredData = useMemo(() => {
    return DISEASES_DATA
      .filter((animal) => selectedAnimal === "all" || animal.key === selectedAnimal)
      .map((animal) => ({
        ...animal,
        diseases: animal.diseases.filter((d) => {
          const matchesCategory = selectedCategory === "all" || d.category === selectedCategory;
          const matchesSearch =
            !searchQuery ||
            d.name.includes(searchQuery) ||
            d.symptoms.includes(searchQuery) ||
            d.care.includes(searchQuery);
          return matchesCategory && matchesSearch;
        }),
      }))
      .filter((animal) => animal.diseases.length > 0);
  }, [selectedAnimal, selectedCategory, searchQuery]);

  const totalDiseases = useMemo(
    () => DISEASES_DATA.reduce((sum, a) => sum + a.diseases.length, 0),
    []
  );
  const filteredCount = useMemo(
    () => filteredData.reduce((sum, a) => sum + a.diseases.length, 0),
    [filteredData]
  );

  const hasActiveFilters = selectedAnimal !== "all" || selectedCategory !== "all" || searchQuery !== "";

  return (
    <section id="common-diseases" ref={root} className="relative bg-background py-20 lg:py-32">
      <div className="container-site relative">
        {/* Mobile Filters (hidden on lg+) - Direct child of container-site for full width */}
        <div className="lg:hidden mb-10">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1 items-stretch">
              {/* Animal Filter Tabs */}
              <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="فیلتر بر اساس حیوان">
                <span className="hidden sm:block text-sm font-medium text-muted-foreground px-2">حیوان:</span>
                {["dog", "cat", "bird"].map((key) => {
                  const animal = DISEASES_DATA.find((a) => a.key === key);
                  const label = animal?.label || key;
                  const icon = key === "dog" ? "🐕" : key === "cat" ? "🐈" : "🐦";
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedAnimal(key as "cat" | "dog" | "bird")}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                        selectedAnimal === key
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-surface text-foreground border border-border hover:bg-muted"
                      }`}
                      aria-pressed={selectedAnimal === key}
                    >
                      <span className="inline-flex items-center gap-1.5">{icon} {label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-2 flex-wrap" role="group" aria-label="فیلتر بر اساس دسته‌بندی">
                <span className="hidden sm:block text-sm font-medium text-muted-foreground px-2">دسته:</span>
                {["infectious", "chronic"].map((key) => {
                  const label = key === "infectious" ? "واکنشی/عدوایی" : "مزمن/غیرعدوایی";
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedCategory(key as "infectious" | "chronic")}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                        selectedCategory === key
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-surface text-foreground border border-border hover:bg-muted"
                      }`}
                      aria-pressed={selectedCategory === key}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" aria-hidden />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="جستجوی بیماری، علائم، مراقبت..."
                className="w-full pl-10 pr-10 py-2 rounded-app border border-border bg-surface text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                aria-label="جستجوی بیماری‌ها"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="پاک کردن جستجو"
                >
                  <XIcon className="size-4" />
                </button>
              )}
            </div>
          </div>

          {/* Results Info & Clear Filters */}
          {(hasActiveFilters || filteredCount !== totalDiseases) && (
            <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-sm">
              <p className="text-muted-foreground">
                {filteredCount === 0
                  ? "هیچ بیماری‌ای با فیلترهای انتخاب‌شده یافت نشد."
                  : `نمایش ${filteredCount} از ${totalDiseases} بیماری`}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={() => {
                    setSelectedAnimal("all");
                    setSelectedCategory("all");
                    setSearchQuery("");
                  }}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline whitespace-nowrap"
                >
                  <FilterIcon className="size-4" />
                  پاک کردن فیلترها
                </button>
              )}
            </div>
          )}
        </div>

        {/* Desktop Sidebar + Main Content Grid */}
        <div className="lg:grid lg:grid-cols-[280px_1fr] lg:gap-8 lg:items-start lg:min-h-[calc(100vh-14rem)]">
          {/* Desktop Sidebar - Filters (hidden on mobile) */}
          <aside className="hidden lg:block lg:sticky lg:top-24 lg:self-start" aria-label="فیلترها">
            <div className="space-y-6 p-4 lg:p-6 rounded-app-lg border border-border bg-surface/50 max-h-[calc(100vh-8rem)] overflow-y-auto">
              {/* Animal Filter Tabs - Vertical */}
              <div className="space-y-2" role="group" aria-label="فیلتر بر اساس حیوان">
                <label className="block text-sm font-medium text-muted-foreground mb-2">حیوان</label>
                {["all", "dog", "cat", "bird"].map((key) => {
                  const animal = DISEASES_DATA.find((a) => a.key === key);
                  const label = key === "all" ? "همه" : animal?.label || key;
                  const icon = key === "dog" ? "🐕" : key === "cat" ? "🐈" : key === "bird" ? "🐦" : "🐾";
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedAnimal(key as "all" | "cat" | "dog" | "bird")}
                      className={`w-full px-3 py-2 rounded-app text-sm font-medium transition-all duration-200 text-right ${
                        selectedAnimal === key
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-surface text-foreground border border-border hover:bg-muted"
                      }`}
                      aria-pressed={selectedAnimal === key}
                    >
                      <span className="inline-flex items-center gap-2 justify-end">{icon} {label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Category Filter - Vertical */}
              <div className="space-y-2 border-t border-border pt-4" role="group" aria-label="فیلتر بر اساس دسته‌بندی">
                <label className="block text-sm font-medium text-muted-foreground mb-2">دسته</label>
                {["all", "infectious", "chronic"].map((key) => {
                  const label = key === "all" ? "همه" : key === "infectious" ? "واکنشی/عدوایی" : "مزمن/غیرعدوایی";
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedCategory(key as "all" | "infectious" | "chronic")}
                      className={`w-full px-3 py-2 rounded-app text-sm font-medium transition-all duration-200 text-right ${
                        selectedCategory === key
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-surface text-foreground border border-border hover:bg-muted"
                      }`}
                      aria-pressed={selectedCategory === key}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Search Input */}
              <div className="relative border-t border-border pt-4">
                <label className="block text-sm font-medium text-muted-foreground mb-2">جستجو</label>
                <SearchIcon className="absolute right-3 top-9 -translate-y-1/2 size-4 text-muted-foreground" aria-hidden />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="جستجوی بیماری، علائم، مراقبت..."
                  className="w-full pl-10 pr-10 py-2 rounded-app border border-border bg-surface text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  aria-label="جستجوی بیماری‌ها"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute left-3 top-9 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="پاک کردن جستجو"
                  >
                    <XIcon className="size-4" />
                  </button>
                )}
              </div>

              {/* Results Info & Clear Filters */}
              {(hasActiveFilters || filteredCount !== totalDiseases) && (
                <div className="space-y-3 text-sm border-t border-border pt-4">
                  <p className="text-muted-foreground">
                    {filteredCount === 0
                      ? "هیچ بیماری‌ای با فیلترهای انتخاب‌شده یافت نشد."
                      : `نمایش ${filteredCount} از ${totalDiseases} بیماری`}
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={() => {
                        setSelectedAnimal("all");
                        setSelectedCategory("all");
                        setSearchQuery("");
                      }}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline whitespace-nowrap"
                    >
                      <FilterIcon className="size-4" />
                      پاک کردن فیلترها
                    </button>
                  )}
                </div>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <main className="w-full lg:max-w-4xl lg:mx-auto">
            {/* Disclaimer */}
            <div className="diseases-disclaimer rounded-app-lg border border-destructive/30 bg-destructive/5 p-6 mb-10" role="alert">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0 text-destructive" aria-hidden>
                  <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" x2="12" y1="9" y2="13" />
                    <line x1="12" x2="12.01" y1="17" y2="17" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-destructive">{DISCLAIMER.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{DISCLAIMER.text}</p>
                </div>
              </div>
            </div>

            {/* Hero */}
            <div className="max-w-3xl mb-16">
              <p className="eyebrow">بیماری‌های شایع حیوانات خانگی</p>
              <h1
                ref={headline}
                className="mt-4 font-display text-3xl font-bold leading-[1.3] text-foreground sm:text-4xl lg:text-[2.75rem]"
              >
                شناختن علائم،<br />
                مراقبت به‌تر از عزیزتان
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                پت شما عضو خانواده است. دانستن بیماری‌های رایج به شما کمک می‌کند تا زودتر متوجه تغییرات شوید و به‌موقع اقدام کنید. اطلاعات زیر تنها جهت آگاهی است — برای تشخیص و درمان حتماً با دامپزشک مشورت کنید.
              </p>
            </div>

            {/* Animal Sections */}
            <div className="space-y-20">
          {filteredData.length === 0 ? (
            <div className="text-center py-20 lg:py-32">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
                <SearchIcon className="size-10 text-muted-foreground" aria-hidden />
              </div>
              <h3 className="font-display text-xl font-bold text-foreground mb-2">بیماری‌ای یافت نشد</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                با تغییر فیلترها یا کلمه جستجو، نتایج بیشتری پیدا کنید.
              </p>
              <button
                onClick={() => {
                  setSelectedAnimal("all");
                  setSelectedCategory("all");
                  setSearchQuery("");
                }}
                className="mt-6 btn btn-outline"
              >
                نمایش همه بیماری‌ها
              </button>
            </div>
          ) : (
            filteredData.map((animal) => {
              const accent = ANIMAL_ACCENTS[animal.accent];
              const infectiousDiseases = animal.diseases.filter((d) => d.category === "infectious");
              const chronicDiseases = animal.diseases.filter((d) => d.category === "chronic");

              return (
                <section
                  key={animal.key}
                  className="diseases-section"
                  id={animal.key}
                  aria-labelledby={`${animal.key}-heading`}
                >
                  {/* Section Header - Editorial Banner */}
                  <div className="relative mb-10 rounded-app-lg overflow-hidden max-w-4xl mx-auto" style={{ backgroundColor: `var(--${accent.bar.replace("bg-", "")}15)` }}>
                    <div className="relative aspect-[4/3] lg:aspect-[3/2] overflow-hidden">
                      <Image
                        src={animal.image}
                        alt={animal.alt}
                        fill
                        priority={animal.key === "cat"}
                        className="object-cover transition-transform duration-slow hover:scale-[1.02]"
                        sizes="(max-width: 1024px) 100vw, 33vw"
                        style={{ objectPosition: 'center top' }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" aria-hidden />
                      <div className="absolute inset-0 flex items-end p-6 lg:p-10">
                        <div className="max-w-xl">
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium mb-4" style={{ backgroundColor: `var(--${accent.bar.replace("bg-", "")}20)`, color: `var(--${accent.fg.replace("text-", "")})` }}>
                            {animal.label}
                          </div>
                          <h2 id={`${animal.key}-heading`} className="font-display text-3xl lg:text-4xl font-bold text-white leading-tight mb-2">
                            بیماری‌های شایع {animal.label}
                          </h2>
                          <p className="text-white/80 text-base lg:text-lg">
                            {infectiousDiseases.length} بیماری واکنشی/عدوایی، {chronicDiseases.length} بیماری مزمن/غیرعدوایی
                          </p>
                        </div>
                      </div>
                      <div
                        className="absolute top-0 left-0 right-0 h-1.5"
                        aria-hidden
                        style={{ backgroundColor: `var(--${accent.bar.replace("bg-", "")})` }}
                      />
                    </div>
                  </div>

                  {/* Disease Categories */}
                  <div className="space-y-8 lg:grid lg:grid-cols-2 lg:gap-6">
                    {infectiousDiseases.length > 0 && (
                      <div>
                        <h3 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                          <span className="size-2 rounded-full" aria-hidden style={{ backgroundColor: `var(--${accent.dot.replace("bg-", "")})` }} />
                          بیماری‌های واکنشی و عفونی
                        </h3>
                        <div className="space-y-3" role="list">
                          {infectiousDiseases.map((disease, diseaseIndex) => (
                            <DiseaseAccordion
                              key={`${animal.key}-inf-${diseaseIndex}`}
                              disease={disease}
                              accent={accent}
                              isOpen={openIndex === `${animal.key}-inf-${diseaseIndex}`}
                              onToggle={() => handleAccordionToggle(`${animal.key}-inf-${diseaseIndex}`)}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {chronicDiseases.length > 0 && (
                      <div>
                        <h3 className="font-display text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                          <span className="size-2 rounded-full" aria-hidden style={{ backgroundColor: `var(--${accent.dot.replace("bg-", "")})` }} />
                          بیماری‌های مزمن و غیرعفونی
                        </h3>
                        <div className="space-y-3" role="list">
                          {chronicDiseases.map((disease, diseaseIndex) => (
                            <DiseaseAccordion
                              key={`${animal.key}-chr-${diseaseIndex}`}
                              disease={disease}
                              accent={accent}
                              isOpen={openIndex === `${animal.key}-chr-${diseaseIndex}`}
                              onToggle={() => handleAccordionToggle(`${animal.key}-chr-${diseaseIndex}`)}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              );
            })
          )}
        </div>

            {/* General Advice */}
            <section className="mt-16 rounded-app-lg border border-border bg-surface p-6 lg:p-8 max-w-4xl mx-auto" aria-labelledby="advice-heading">
          <h2 id="advice-heading" className="font-display text-2xl font-bold text-foreground mb-6">
            نکات کلی برای همه حیوانات
          </h2>
          <ul className="space-y-4" role="list">
            {GENERAL_ADVICE.map((advice, i) => (
              <li key={i} className="flex items-start gap-3 text-muted-foreground">
                <span className="mt-1.5 size-1.5 rounded-full shrink-0 bg-primary-text" aria-hidden />
                <span className="leading-relaxed">{advice}</span>
              </li>
            ))}
          </ul>
          </section>

          {/* CTA */}
          <div className="mt-16 rounded-app-lg border border-border bg-surface p-6 lg:p-8 text-center max-w-4xl mx-auto">
          <h2 className="font-display text-2xl font-bold text-foreground mb-4">
            نگران هستید؟ ما اینجاییم.
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            هر سوالی درباره سلامت پت‌تان دارید، یا می‌خواهید برای چکاپ نوبت بگیرید — تیم باران با یک تماس یا پیام واتساپ در خدمت شماست.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={CLINIC.phoneHref}
              className="btn btn-primary w-full sm:w-auto"
              dir="ltr"
            >
              <PhoneIcon className="size-5" />
              تماس: {CLINIC.phone}
            </a>
            <a
              href={CLINIC.mobile1WhatsApp}
              target="_blank"
              rel="noopener"
              className="btn btn-outline w-full sm:w-auto"
            >
              <PhoneIcon className="size-5" />
              واتساپ: {CLINIC.mobile1}
            </a>
          </div>
          <div className="mt-6 pt-6 border-t border-border">
            <p className="font-label text-xs text-primary-text">{CLINIC.hoursNote}</p>
            {CLINIC.hours.map((h, i) => (
              <p key={i} className="mt-1 text-sm text-muted-foreground">
                {h.days}: {h.time}
              </p>
            ))}
          </div>
        </div>
        </main>
      </div>
    </div>

  {/* Sticky Mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-header bg-background border-t border-border px-4 py-3 lg:hidden" role="region" aria-label="تماس سریع">
        <div className="container-site flex gap-3">
          <a
            href={CLINIC.phoneHref}
            className="flex-1 btn btn-primary justify-center"
            dir="ltr"
          >
            <PhoneIcon className="size-5" />
            تماس
          </a>
          <a
            href={CLINIC.mobile1WhatsApp}
            target="_blank"
            rel="noopener"
            className="flex-1 btn btn-outline justify-center"
          >
            <PhoneIcon className="size-5" />
            واتساپ
          </a>
        </div>
      </div>
    </section>
  );
}

interface DiseaseAccordionProps {
  disease: {
    name: string;
    symptoms: string;
    care: string;
  };
  accent: {
    dot: string;
    bar: string;
    fg: string;
  };
  isOpen: boolean;
  onToggle: () => void;
}

function DiseaseAccordion({ disease, accent, isOpen, onToggle }: DiseaseAccordionProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (detailsRef.current) {
      detailsRef.current.open = isOpen;
    }
  }, [isOpen]);

  useGSAP(
    () => {
      if (prefersReducedMotion() || reduced || !contentRef.current) return;
      const ctx = gsap.context(() => {
        gsap.fromTo(
          contentRef.current!,
          { height: isOpen ? 0 : contentRef.current!.scrollHeight },
          {
            height: isOpen ? contentRef.current!.scrollHeight : 0,
            duration: 0.4,
            ease: "power2.inOut",
            overwrite: true,
          }
        );
      });
      return () => ctx.revert();
    },
    { scope: detailsRef, dependencies: [isOpen, reduced] }
  );

  return (
    <details
      ref={detailsRef}
      className="group rounded-app-lg border border-border bg-surface overflow-hidden transition-shadow duration-normal hover:shadow-md"
      open={isOpen}
      onToggle={onToggle}
    >
      <summary
        className="flex items-center justify-between gap-4 p-5 cursor-pointer list-none outline-none"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span
            className="size-2.5 rounded-full shrink-0"
            aria-hidden
            style={{ backgroundColor: `var(--${accent.dot.replace("bg-", "")})` }}
          />
          <span className="font-display text-lg font-semibold text-foreground truncate">
            {disease.name}
          </span>
        </div>
        <ChevronDownIcon
          className={`size-5 text-muted-foreground transition-transform duration-normal ${isOpen ? "rotate-180" : ""}`}
          aria-hidden
        />
      </summary>
      <div
        ref={contentRef}
        className="overflow-hidden"
        style={{ height: prefersReducedMotion() || reduced ? (isOpen ? "auto" : 0) : undefined }}
      >
        <div className="px-5 pb-5 space-y-5 border-t border-border pt-4">
          <div>
            <h4 className="font-label text-sm font-semibold text-primary-text mb-2 flex items-center gap-1.5">
              <span className="size-1.5 rounded-full" aria-hidden style={{ backgroundColor: `var(--${accent.dot.replace("bg-", "")})` }} />
              علائم
            </h4>
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">{disease.symptoms}</p>
          </div>
          <div>
            <h4 className="font-label text-sm font-semibold text-primary-text mb-2 flex items-center gap-1.5">
              <span className="size-1.5 rounded-full" aria-hidden style={{ backgroundColor: `var(--${accent.dot.replace("bg-", "")})` }} />
              مراقبت و نکات درمان
            </h4>
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">{disease.care}</p>
          </div>
        </div>
      </div>
    </details>
  );
}