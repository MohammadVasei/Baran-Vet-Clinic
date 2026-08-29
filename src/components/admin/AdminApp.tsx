"use client";

import { Suspense } from 'react';
import { Refine } from '@refinedev/core';
import { RefineKbarProvider } from '@refinedev/kbar';
import routerProvider from '@refinedev/nextjs-router';
import { dataProvider } from '@/lib/refine/data-provider';
import { authProvider } from '@/lib/refine/auth-provider';
import { accessControlProvider } from '@/lib/refine/access-control';

export function AdminApp({ children }: { children: React.ReactNode }) {
  return (
    <RefineKbarProvider>
      <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>}>
        <Refine
          routerProvider={routerProvider}
          dataProvider={dataProvider}
          authProvider={authProvider}
          accessControlProvider={accessControlProvider}
          resources={[
            {
              name: 'services',
              list: '/admin/services',
              create: '/admin/services/create',
              edit: '/admin/services/edit/:id',
              show: '/admin/services/show/:id',
              meta: {
                label: 'خدمات',
                icon: 'service',
              },
            },
            {
              name: 'doctors',
              list: '/admin/doctors',
              create: '/admin/doctors/create',
              edit: '/admin/doctors/edit/:id',
              show: '/admin/doctors/show/:id',
              meta: {
                label: 'پزشکان',
                icon: 'doctor',
              },
            },
            {
              name: 'diseases',
              list: '/admin/diseases',
              create: '/admin/diseases/create',
              edit: '/admin/diseases/edit/:id',
              show: '/admin/diseases/show/:id',
              meta: {
                label: 'بیماری‌ها',
                icon: 'disease',
              },
            },
            {
              name: 'testimonials',
              list: '/admin/testimonials',
              create: '/admin/testimonials/create',
              edit: '/admin/testimonials/edit/:id',
              show: '/admin/testimonials/show/:id',
              meta: {
                label: 'نظرات',
                icon: 'testimonial',
              },
            },
            {
              name: 'bookings',
              list: '/admin/bookings',
              edit: '/admin/bookings/edit/:id',
              meta: {
                label: 'نوبت‌ها',
                icon: 'booking',
              },
            },
{
            name: 'availability-blocks',
            list: '/admin/availability-blocks',
            create: '/admin/availability-blocks/create',
            edit: '/admin/availability-blocks/edit/:id',
            meta: {
              label: 'بازه‌های غیرفعال',
              icon: 'block',
            },
          },
          {
            name: 'products',
            list: '/admin/products',
            create: '/admin/products/create',
            edit: '/admin/products/edit/:id',
            meta: {
              label: 'محصولات',
              icon: 'product',
            },
          },
          {
            name: 'stock_levels',
            list: '/admin/stock-levels',
            edit: '/admin/stock-levels/edit/:id',
            meta: {
              label: 'موجودی انبار',
              icon: 'stock',
            },
          },
          {
            name: 'orders',
            list: '/admin/orders',
            show: '/admin/orders/show/:id',
            meta: {
              label: 'سفارشات',
              icon: 'order',
            },
          },
        ]}
          options={{
            syncWithLocation: true,
            warnWhenUnsavedChanges: true,
          }}
        >
          {children}
        </Refine>
      </Suspense>
    </RefineKbarProvider>
  );
}