"use client";

export const dynamic = 'force-dynamic';

import { AdminApp } from '@/components/admin/AdminApp';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { authProvider } from '@/lib/refine/auth-provider';

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/admin/login';
  const [authChecked, setAuthChecked] = useState(isLoginPage);

  useEffect(() => {
    if (isLoginPage) {
      setAuthChecked(true);
      return;
    }

    let active = true;
    setAuthChecked(false);
    authProvider.check().then(({ authenticated }) => {
      if (!active) return;
      if (!authenticated) {
        router.replace('/admin/login');
        return;
      }
      setAuthChecked(true);
    });

    return () => {
      active = false;
    };
  }, [isLoginPage, router]);

  if (!authChecked) {
    return <AdminApp><div className="flex min-h-screen items-center justify-center" /></AdminApp>;
  }

  const content = isLoginPage ? children : <AdminLayout>{children}</AdminLayout>;

  return <AdminApp>{content}</AdminApp>;
}