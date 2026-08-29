import { Metadata } from "next";
import { LoginClient } from "./LoginClient";

interface LoginPageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "ورود به حساب کاربری | کلینیک باران",
  };
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  return <LoginClient callbackUrl={params.callbackUrl || "/account"} />;
}