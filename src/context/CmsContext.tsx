"use client";

import { createContext, useContext } from "react";
import type { CmsContent } from "@/lib/content-types";

/**
 * Provides the CMS content snapshot to every client component on the public
 * site. The root layout (a Server Component) fetches the snapshot via
 * `getCmsData()` (src/lib/cms.ts — unstable_cache, 300s base revalidation)
 * and passes it in as a plain, serializable `data` prop — so there is no
 * client-side fetch and no hydration mismatch.
 *
 * Every public component that used to `import { X } from "@/lib/content"`
 * now reads the matching slice, e.g. `const { clinic } = useCms()`.
 */
const CmsContext = createContext<CmsContent | null>(null);

export function CmsProvider({
  data,
  children,
}: {
  data: CmsContent;
  children: React.ReactNode;
}) {
  return <CmsContext.Provider value={data}>{children}</CmsContext.Provider>;
}

export function useCms(): CmsContent {
  const ctx = useContext(CmsContext);
  if (!ctx) {
    throw new Error("useCms() must be used inside <CmsProvider>.");
  }
  return ctx;
}