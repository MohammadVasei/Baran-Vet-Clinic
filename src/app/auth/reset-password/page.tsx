import { Metadata } from "next";
import { ResetPasswordClient } from "./ResetPasswordClient";

interface ResetPasswordPageProps {
  searchParams: Promise<{ type?: string; code?: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "بازیابی رمز عبور | کلینیک باران",
  };
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams;
  return <ResetPasswordClient type={params.type} />;
}