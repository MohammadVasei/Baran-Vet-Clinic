"use client";

import { Suspense } from 'react';
import { useCan } from '@refinedev/core';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { gsap, useGSAP } from '@/lib/gsap';
import { prefersReducedMotion, duration, ease } from '@/lib/motion';
import { ArrowIcon, MenuIcon, XIcon, LogOutIcon, ChevronDownIcon } from '@/components/icons';

const NAV_GROUPS = [
  {
    key: 'shop',
    label: 'فروشگاه و نوبت',
    items: [
      { name: 'services', label: 'خدمات', href: '/admin/services' },
      { name: 'doctors', label: 'پزشکان', href: '/admin/doctors' },
      { name: 'orders', label: 'سفارشات', href: '/admin/orders' },
      { name: 'bookings', label: 'نوبت‌ها', href: '/admin/bookings' },
      { name: 'availability-blocks', label: 'بازه‌های غیرفعال', href: '/admin/availability-blocks' },
      { name: 'products', label: 'محصولات', href: '/admin/products' },
    ],
  },
  {
    key: 'operations',
    label: 'عملیات روزانه',
    items: [
      { name: 'stock_levels', label: 'موجودی انبار', href: '/admin/stock-levels' },
      { name: 'animals', label: 'حیوانات', href: '/admin/animals' },
      { name: 'reminders', label: 'یادآوری‌ها', href: '/admin/reminders' },
    ],
  },
  {
    key: 'catalog',
    label: 'داده‌های پایه',
    items: [
      { name: 'diseases', label: 'بیماری‌ها', href: '/admin/diseases' },
      { name: 'species-and-breeds', label: 'گونه‌ها و نژادها', href: '/admin/species-and-breeds' },
      { name: 'medical_items', label: 'واکسن‌ها و درمان‌ها', href: '/admin/medical-items' },
      { name: 'service_categories', label: 'دسته‌بندی خدمات', href: '/admin/service-categories' },
    ],
  },
{
      key: 'content',
      label: 'محتوا و تنظیمات',
      items: [
        { name: 'custom_charts', label: 'نمودار سفارشی', href: '/admin/custom-charts' },
        { name: 'testimonials', label: 'بازخوردها', href: '/admin/testimonials' },
        { name: 'site_content', label: 'اطلاعات کلینیک', href: '/admin/site-content' },
      ],
    },
] as const;

type NavItemName = typeof NAV_GROUPS[number]['items'][number]['name'];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const sidebarRef = useRef<HTMLDivElement>(null);

  const toggleGroup = (key: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

// Check permissions for each nav item using useCan
   const serviceCanList = useCan({ resource: 'services', action: 'list' });
   const doctorCanList = useCan({ resource: 'doctors', action: 'list' });
   const orderCanList = useCan({ resource: 'orders', action: 'list' });
   const bookingCanList = useCan({ resource: 'bookings', action: 'list' });
   const availabilityBlockCanList = useCan({ resource: 'availability-blocks', action: 'list' });
   const productCanList = useCan({ resource: 'products', action: 'list' });
   const stockLevelCanList = useCan({ resource: 'stock_levels', action: 'list' });
   const diseaseCanList = useCan({ resource: 'diseases', action: 'list' });
   const testimonialCanList = useCan({ resource: 'testimonials', action: 'list' });
   const siteContentCanList = useCan({ resource: 'site_content', action: 'list' });
   const animalCanList = useCan({ resource: 'animals', action: 'list' });
   const speciesCanList = useCan({ resource: 'species', action: 'list' });
   const breedCanList = useCan({ resource: 'breeds', action: 'list' });
const vaccineCanList = useCan({ resource: 'vaccines', action: 'list' });
    const treatmentCanList = useCan({ resource: 'treatment_types', action: 'list' });
    const reminderCanList = useCan({ resource: 'reminders', action: 'list' });
    const customChartsCanList = useCan({ resource: 'admin_custom_charts', action: 'list' });
    const serviceCategoryCanList = useCan({ resource: 'service_categories', action: 'list' });

const canMap: Record<NavItemName, boolean> = {
   services: !!serviceCanList.data,
   doctors: !!doctorCanList.data,
   orders: !!orderCanList.data,
   bookings: !!bookingCanList.data,
   'availability-blocks': !!availabilityBlockCanList.data,
   products: !!productCanList.data,
   stock_levels: !!stockLevelCanList.data,
   diseases: !!diseaseCanList.data,
   testimonials: !!testimonialCanList.data,
   site_content: !!siteContentCanList.data,
   animals: !!animalCanList.data,
   medical_items: !!(vaccineCanList.data || treatmentCanList.data),
   reminders: !!reminderCanList.data,
   custom_charts: !!customChartsCanList.data,
   'species-and-breeds': !!speciesCanList.data && !!breedCanList.data,
   service_categories: !!serviceCategoryCanList.data,
 };

  useGSAP(
    () => {
      if (prefersReducedMotion() || !sidebarRef.current) return;
      const mm = gsap.matchMedia();

      mm.add('(max-width: 1023.98px)', () => {
        gsap.fromTo(
          sidebarRef.current!,
          { x: sidebarOpen ? 0 : '100%' },
          {
            x: sidebarOpen ? 0 : '100%',
            duration: duration('--duration-normal'),
            ease: ease(),
            overwrite: 'auto',
          }
        );
      });

      mm.add('(min-width: 1024px)', () => {
        gsap.set(sidebarRef.current!, { clearProps: 'transform' });
      });
    },
    { dependencies: [sidebarOpen] }
  );

  const handleLogout = async () => {
    const { authProvider } = await import('@/lib/refine/auth-provider');
    await authProvider.logout({});
    router.push('/admin/login');
  };

  const handleNavClick = (href: string) => {
    router.push(href);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-background flex" dir="rtl">
      {/* Mobile sidebar overlay */}
      <div
className={`fixed inset-0 z-40 bg-[var(--sidebar-overlay-background)] lg:hidden transition-opacity ${
           sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
         }`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed lg:static inset-y-0 right-0 z-50 w-64 bg-surface border-l border-border transform transition-transform duration-300 ease-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="منوی مدیریت"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <Link href="/admin" className="flex items-center gap-2" aria-label="صفحه اصلی پنل مدیریت">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <svg className="w-5 h-5 text-on-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M12 21s-6.5-5.4-6.5-10A6.5 6.5 0 0 1 12 4.5 6.5 6.5 0 0 1 18.5 11c0 4.6-6.5 10-6.5 10Z" />
                  <circle cx="12" cy="11" r="2.4" />
                </svg>
              </div>
              <span className="font-display text-lg font-bold text-foreground">باران</span>
            </Link>
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-muted"
              onClick={() => setSidebarOpen(false)}
              aria-label="بستن منو"
            >
              <XIcon className="size-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto" aria-label="منوی اصلی">
            {NAV_GROUPS.map((group) => {
              const allowedItems = group.items.filter((item) => canMap[item.name]);
              if (allowedItems.length === 0) return null;
              const isCollapsed = !!collapsedGroups[group.key];
              return (
                <div key={group.key} className="space-y-0.5">
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.key)}
                    aria-expanded={!isCollapsed}
                    className="w-full flex items-center justify-between px-3 pt-3 pb-1 rounded-app group"
                  >
                    <h1 className="text-base font-bold text-foreground/80 group-hover:text-foreground transition-colors">
                      {group.label}
                    </h1>
                    <ChevronDownIcon
                      className={`size-4 text-foreground/40 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`}
                    />
                  </button>
                  {!isCollapsed &&
                    allowedItems.map((item) => {
                      const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={(e) => {
                            e.preventDefault();
                            handleNavClick(item.href);
                          }}
                          className={`flex items-center gap-3 px-3 py-2 rounded-app text-sm font-medium transition-colors ${
                            isActive
                              ? 'bg-primary text-primary-foreground'
                              : 'text-foreground/80 hover:bg-muted hover:text-foreground'
                          }`}
                        >
                          <h2 className="flex-1">{item.label}</h2>
                          {isActive && <ArrowIcon direction="forward" className="size-4" />}
                        </Link>
                      );
                    })}
                </div>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-app text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              <LogOutIcon className="size-5" />
              خروج
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-0 min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="flex items-center justify-between px-4 py-3 lg:px-6">
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-muted"
              onClick={() => setSidebarOpen(true)}
              aria-label="باز کردن منو"
            >
              <MenuIcon className="size-6" />
            </button>

            <div className="flex-1 lg:flex-none">
              <Link href="/admin" className="inline-block">
                <h1 className="font-display text-xl font-bold text-foreground">پنل مدیریت</h1>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-sm text-muted-foreground">
                <span>پنل مدیریت کلینیک باران</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="p-4 lg:p-6">
          <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}>
            {children}
          </Suspense>
        </div>
      </main>
    </div>
  );
}