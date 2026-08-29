import { Metadata } from "next";
import { RegisterClient } from "./RegisterClient";

interface RegisterPageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "ایجاد حساب کاربری | کلینیک باران",
  };
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  return <RegisterClient callbackUrl={params.callbackUrl || "/account"} />;
}