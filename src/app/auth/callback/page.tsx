import { Metadata } from "next";
import { AuthCallbackClient } from "./AuthCallbackClient";

interface AuthCallbackPageProps {
  searchParams: Promise<{ callbackUrl?: string; error?: string; error_description?: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }: AuthCallbackPageProps): Promise<Metadata> {
  const { error } = await searchParams;
  return {
    title: error ? "خطای احراز هویت | کلینیک باران" : "پردازش ورود | کلینیک باران",
  };
}

export default async function AuthCallbackPage({ searchParams }: AuthCallbackPageProps) {
  const params = await searchParams;
  return <AuthCallbackClient initialParams={params} />;
}