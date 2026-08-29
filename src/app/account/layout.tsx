"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { UserIcon, PackageIcon, MapPinIcon, SettingsIcon, ArrowIcon, LogOutIcon } from "@/components/icons";

const ACCOUNT_NAV = [
  { label: "داشبورد", href: "/account", icon: UserIcon },
  { label: "سفارشات من", href: "/account/orders", icon: PackageIcon },
  { label: "آدرس‌ها", href: "/account/addresses", icon: MapPinIcon },
  { label: "تنظیمات", href: "/account/profile", icon: SettingsIcon },
] as const;

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container-site py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className={`lg:w-64 flex-shrink-0 ${mobileOpen ? "block" : "lg:block hidden"}`}>
            <div className="rounded-app-lg border border-border bg-surface p-6 space-y-6">
              {/* User Profile */}
              <div className="flex items-center gap-4 p-4 rounded-app bg-background">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserIcon className="size-7 text-primary-text" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-foreground truncate">
                    {user?.user_metadata?.full_name || user?.email?.split("@")[0] || "کاربر"}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">{user?.email || user?.phone}</p>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-1" aria-label="منوی حساب کاربری">
                {ACCOUNT_NAV.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-app text-sm font-medium transition-all ${
                        isActive
                          ? "bg-primary text-on-primary"
                          : "text-foreground hover:bg-muted"
                      }`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <item.icon className="size-5" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              <div className="pt-4 border-t border-border">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-app text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOutIcon className="size-5" />
                  خروج از حساب
                </button>
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden w-full flex items-center justify-between px-4 py-3 rounded-app border border-border bg-surface"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-expanded={mobileOpen}
            >
              <span className="font-medium">منوی حساب کاربری</span>
              <ArrowIcon direction={mobileOpen ? "back" : "forward"} className="size-5" />
            </button>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}