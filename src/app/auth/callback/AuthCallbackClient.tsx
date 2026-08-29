"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGSAP } from "@/lib/gsap";
import { revealUp, prefersReducedMotion } from "@/lib/motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useRef } from "react";
import { CheckCircleIcon, AlertCircleIcon, LoaderIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";

interface AuthCallbackClientProps {
  initialParams: {
    callbackUrl?: string;
    error?: string;
    error_description?: string;
  };
}

export function AuthCallbackClient({ initialParams }: AuthCallbackClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const root = useRef<HTMLDivElement>(null);
  const headline = useRef<HTMLHeadingElement>(null);
  const reduced = useReducedMotion();

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useGSAP(
    () => {
      if (prefersReducedMotion() || reduced || !root.current || !headline.current) return;
      const revealTweens = [
        revealUp(headline.current, { once: true, y: 30 }),
        revealUp(".callback-status", { once: true, y: 24, delay: 0.1 }),
      ];
      return () => revealTweens.forEach((t) => t.kill());
    },
    { scope: root, dependencies: [reduced, status] }
  );

  useEffect(() => {
    const callbackUrl = searchParams.get("callbackUrl") || initialParams.callbackUrl || "/account";
    const error = searchParams.get("error") || initialParams.error;
    const errorDescription = searchParams.get("error_description") || initialParams.error_description;

    const handleAuth = async () => {
      try {
        if (error) {
          setStatus("error");
          setMessage(errorDescription || error || "خطای ناشناخته در احراز هویت");
        } else {
          // Wait a bit for session to be established
          await new Promise((resolve) => setTimeout(resolve, 1000));
          setStatus("success");
          setMessage("ورود با موفقیت انجام شد");
          setTimeout(() => router.push(callbackUrl), 1500);
        }
      } catch {
        setStatus("error");
        setMessage("خطا در پردازش پاسخ احراز هویت");
      }
    };

    handleAuth();
  }, [router, searchParams, initialParams]);

  return (
    <div ref={root} className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="callback-status">
          {status === "loading" && (
            <>
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mx-auto mb-6">
                <LoaderIcon className="size-10 text-primary animate-spin" />
              </div>
              <h1 ref={headline} className="font-display text-2xl font-bold text-foreground mb-4">
                در حال پردازش...
              </h1>
              <p className="text-muted-foreground">
                لطفاً صبر کنید، شما به صفحه مورد نظر هدایت می‌شوید
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mx-auto mb-6">
                <CheckCircleIcon className="size-10 text-green-600" />
              </div>
              <h1 ref={headline} className="font-display text-2xl font-bold text-foreground mb-4">
                موفقیت‌آمیز
              </h1>
              <p className="text-green-700 mb-6">{message}</p>
              <Button onClick={() => router.push("/account")}>
                ادامه به داشبورد
              </Button>
            </>
          )}

          {status === "error" && (
            <>
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mx-auto mb-6">
                <AlertCircleIcon className="size-10 text-red-600" />
              </div>
              <h1 ref={headline} className="font-display text-2xl font-bold text-foreground mb-4">
                خطا
              </h1>
              <p className="text-red-700 mb-6">{message}</p>
              <div className="flex flex-col gap-3">
                <Button variant="outline" onClick={() => router.push("/auth/login")}>
                  تلاش مجدد
                </Button>
                <Button onClick={() => router.push("/")}>
                  بازگشت به خانه
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}