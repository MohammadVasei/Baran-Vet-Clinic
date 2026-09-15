"use client";

import { useGSAP } from "@/lib/gsap";
import { revealUp, prefersReducedMotion } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { PawIcon } from "@/components/icons";
import {
  ANIMAL_SEX_LABELS,
  ANIMAL_STATUS_LABELS,
  ANIMAL_STATUS_STYLES,
  getAnimalAge,
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
  medical_notes: string | null;
  status: string;
  profile_image: string | null;
}

export default function AccountPetsPage() {
  const { user } = useAuth();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const headline = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (prefersReducedMotion() || reduced || !root.current || !headline.current) return;
      const revealTweens = [
        revealUp(headline.current, { once: true, y: 30 }),
        revealUp(".pets-grid", { once: true, y: 24, delay: 0.1 }),
      ];
      return () => revealTweens.forEach((t) => t.kill());
    },
    { scope: root, dependencies: [reduced, animals] }
  );

  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();
    const fetchPets = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/account/animals", { signal: controller.signal });
        if (!res.ok) throw new Error("failed");
        const data = await res.json();
        setAnimals(data.animals || []);
      } catch (err) {
        if ((err as Error).name !== "AbortError") setError("خطا در بارگذاری حیوانات");
      } finally {
        setLoading(false);
      }
    };
    fetchPets();
    return () => controller.abort();
  }, [user]);

  return (
    <div ref={root} className="space-y-6">
      <div>
        <h1 ref={headline} className="font-display text-2xl font-bold text-foreground">حیوانات من</h1>
        <p className="text-muted-foreground mt-1">
          پرونده حیوانات شما، سابقه درمان و یادآوری‌ها. اگر حیوانی را اینجا نمی‌بینید با کلینیک تماس بگیرید تا با شماره شما ثبت شود.
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">در حال بارگذاری...</p>
        </div>
      ) : error ? (
        <div className="p-12 text-center text-destructive">{error}</div>
      ) : animals.length === 0 ? (
        <div className="pets-grid rounded-app-lg border border-border bg-surface p-12 text-center">
          <PawIcon className="size-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-display text-lg font-bold text-foreground mb-2">حیوانی ثبت نشده است</h3>
          <p className="text-muted-foreground mb-6">
            هنوز پرونده‌ای برای حیوان شما ثبت نشده است. برای ثبت، با کلینیک در تماس باشید.
          </p>
          <p className="text-sm text-muted-foreground">
            اولین نوبت خود را ثبت کنید تا اطلاعات به‌روز باشد.
          </p>
        </div>
      ) : (
        <div className="pets-grid grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {animals.map((animal) => {
            const statusStyle =
              ANIMAL_STATUS_STYLES[animal.status as keyof typeof ANIMAL_STATUS_STYLES] ||
              "bg-gray-100 text-gray-700";
            return (
              <Link
                key={animal.id}
                href={`/account/pets/${animal.id}`}
                className="group rounded-app-lg border border-border bg-surface p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                {animal.profile_image ? (
                  <img
                    src={animal.profile_image}
                    alt={animal.name}
                    className="size-16 rounded-full object-cover mx-auto mb-4"
                  />
                ) : (
                  <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <PawIcon className="size-8 text-primary" />
                  </div>
                )}
                <h3 className="text-center font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                  {animal.name}
                </h3>
                <p className="text-center text-sm text-muted-foreground mt-1">
                  {animal.species?.name}
                  {animal.breed?.name && ` · ${animal.breed?.name}`}
                </p>
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <span>{getAnimalAge(animal.date_of_birth)}</span>
                  <span aria-hidden>·</span>
                  <span>{ANIMAL_SEX_LABELS[animal.sex as keyof typeof ANIMAL_SEX_LABELS] || "—"}</span>
                </div>
                <div className="mt-4 flex justify-center">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${statusStyle}`}>
                    {ANIMAL_STATUS_LABELS[animal.status as keyof typeof ANIMAL_STATUS_LABELS] || animal.status}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}