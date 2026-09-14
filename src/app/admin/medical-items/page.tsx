"use client";

import { useState } from 'react';
import { useList, useDelete, useNavigation, useCan } from '@refinedev/core';
import { AdminTable } from '@/components/admin/AdminTable';
import { EditIcon, TrashIcon } from '@/components/icons';
import { formatReminderInterval, TREATMENT_CATEGORY_LABELS } from '@/lib/animals';
import { MedicalItemsTabSwitcher } from '@/components/admin/MedicalItemsTabSwitcher';

interface VaccineRow {
  id: string;
  name: string;
  species_id: string;
  species?: { name: string } | null;
  manufacturer: string | null;
  active: boolean;
  is_periodic: boolean;
  reminder_interval_value: number | null;
  reminder_interval_unit: string | null;
}

interface TreatmentRow {
  id: string;
  name: string;
  species_id: string;
  species?: { name: string } | null;
  category: string;
  active: boolean;
  is_periodic: boolean;
  reminder_interval_value: number | null;
  reminder_interval_unit: string | null;
}

export default function MedicalItemsPage() {
  const [activeTab, setActiveTab] = useState<'vaccines' | 'treatment_types'>('vaccines');
  
  // Vaccines data
  const { result: vaccineResult, query: vaccineQuery } = useList<VaccineRow>({
    resource: 'vaccines',
    sorters: [{ field: 'name', order: 'asc' }],
    pagination: { pageSize: 200 },
    meta: {
      select: 'id,name,species_id,manufacturer,species:species(name),active,is_periodic,reminder_interval_value,reminder_interval_unit',
    },
  });
  
  // Treatments data
  const { result: treatmentResult, query: treatmentQuery } = useList<TreatmentRow>({
    resource: 'treatment_types',
    sorters: [{ field: 'name', order: 'asc' }],
    pagination: { pageSize: 200 },
    meta: {
      select: 'id,name,species_id,category,species:species(name),active,is_periodic,reminder_interval_value,reminder_interval_unit',
    },
  });
  
  const navigation = useNavigation();
  const { mutate: deleteVaccine } = useDelete();
  const { mutate: deleteTreatment } = useDelete();
  const canEditVaccine = useCan({ resource: 'vaccines', action: 'edit' });
  const canDeleteVaccine = useCan({ resource: 'vaccines', action: 'delete' });
  const canEditTreatment = useCan({ resource: 'treatment_types', action: 'edit' });
  const canDeleteTreatment = useCan({ resource: 'treatment_types', action: 'delete' });

  const handleEditVaccine = (id: string) => navigation.edit('vaccines', id);
  const handleDeleteVaccine = (id: string) => {
    if (confirm('آیا از حذف این واکسن اطمینان دارید؟')) {
      deleteVaccine({ id, resource: 'vaccines' });
    }
  };
  
  const handleEditTreatment = (id: string) => navigation.edit('treatment_types', id);
  const handleDeleteTreatment = (id: string) => {
    if (confirm('آیا از حذف این نوع درمان اطمینان دارید؟')) {
      deleteTreatment({ id, resource: 'treatment_types' });
    }
  };

  const handleCreateVaccine = () => navigation.create('vaccines');
  const handleCreateTreatment = () => navigation.create('treatment_types');

  const vaccineColumns = [
    {
      accessorKey: 'name' as keyof VaccineRow,
      header: 'نام',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => (
        <span className="font-medium">{getValue('name') as string}</span>
      ),
    },
    {
      accessorKey: 'species_id' as keyof VaccineRow,
      header: 'گونه',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => (
        <span className="px-2 py-1 text-xs rounded-full bg-muted">{(getValue('species') as { name?: string } | null)?.name || '—'}</span>
      ),
    },
    {
      accessorKey: 'manufacturer' as keyof VaccineRow,
      header: 'سازنده',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => (
        <span>{(getValue('manufacturer') as string | null) || '—'}</span>
      ),
    },
    {
      accessorKey: 'is_periodic' as keyof VaccineRow,
      header: 'یادآوری دوره‌ای',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => {
        const periodic = getValue('is_periodic') as boolean;
        if (!periodic) return <span className="text-muted-foreground">—</span>;
        const value = getValue('reminder_interval_value') as number | null;
        const unit = getValue('reminder_interval_unit') as string | null;
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
            هر {formatReminderInterval(value, unit)}
          </span>
        );
      },
    },
    {
      accessorKey: 'active' as keyof VaccineRow,
      header: 'وضعیت',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => {
        const active = getValue('active') as boolean;
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {active ? 'فعال' : 'غیرفعال'}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: 'عملیات',
      cellWithMeta: ({ original }: { original: VaccineRow }) => (
        <div className="flex items-center gap-2">
          {canEditVaccine.data && (
            <button onClick={() => handleEditVaccine(original.id)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" aria-label="ویرایش">
              <EditIcon className="size-4" />
            </button>
          )}
          {canDeleteVaccine.data && (
            <button onClick={() => handleDeleteVaccine(original.id)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-destructive transition-colors" aria-label="حذف">
              <TrashIcon className="size-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const treatmentColumns = [
    {
      accessorKey: 'name' as keyof TreatmentRow,
      header: 'نام',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => (
        <span className="font-medium">{getValue('name') as string}</span>
      ),
    },
    {
      accessorKey: 'species_id' as keyof TreatmentRow,
      header: 'گونه',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => (
        <span className="px-2 py-1 text-xs rounded-full bg-muted">{(getValue('species') as { name?: string } | null)?.name || '—'}</span>
      ),
    },
    {
      accessorKey: 'category' as keyof TreatmentRow,
      header: 'دسته‌بندی',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => {
        const category = getValue('category') as string;
        return <span className="px-2 py-1 text-xs rounded-full bg-muted">{TREATMENT_CATEGORY_LABELS[category] || category}</span>;
      },
    },
    {
      accessorKey: 'is_periodic' as keyof TreatmentRow,
      header: 'دوره‌ای',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => {
        const periodic = getValue('is_periodic') as boolean;
        if (!periodic) return <span className="text-muted-foreground">—</span>;
        const value = getValue('reminder_interval_value') as number | null;
        const unit = getValue('reminder_interval_unit') as string | null;
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
            هر {formatReminderInterval(value, unit)}
          </span>
        );
      },
    },
    {
      accessorKey: 'active' as keyof TreatmentRow,
      header: 'وضعیت',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => {
        const active = getValue('active') as boolean;
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {active ? 'فعال' : 'غیرفعال'}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: 'عملیات',
      cellWithMeta: ({ original }: { original: TreatmentRow }) => (
        <div className="flex items-center gap-2">
          {canEditTreatment.data && (
            <button onClick={() => handleEditTreatment(original.id)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" aria-label="ویرایش">
              <EditIcon className="size-4" />
            </button>
          )}
          {canDeleteTreatment.data && (
            <button onClick={() => handleDeleteTreatment(original.id)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-destructive transition-colors" aria-label="حذف">
              <TrashIcon className="size-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const vaccines = (vaccineResult?.data as VaccineRow[]) || [];
  const treatments = (treatmentResult?.data as TreatmentRow[]) || [];
  const vaccineIsLoading = vaccineQuery.isLoading;
  const treatmentIsLoading = treatmentQuery.isLoading;
  const vaccineIsError = vaccineQuery.isError;
  const treatmentIsError = treatmentQuery.isError;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            {activeTab === 'vaccines' ? 'مدیریت واکسن‌ها' : 'انواع درمان'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {activeTab === 'vaccines' 
              ? 'کاتالوگ واکسن‌های موجود در کلینیک به تفکیک گونه' 
              : 'کاتالوگ انواع درمان و خدمات پزشکی قابل انجام در کلینیک'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {activeTab === 'vaccines' && (
            <button 
              onClick={handleCreateVaccine}
              className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded transition-colors flex items-center gap-1"
            >
              افزودن واکسن
            </button>
          )}
          {activeTab === 'treatment_types' && (
            <button 
              onClick={handleCreateTreatment}
              className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded transition-colors flex items-center gap-1"
            >
              افزودن نوع درمان
            </button>
          )}
        </div>
      </div>

      <div role="tablist" className="flex border-b border-muted mb-4">
        <button
          role="tab"
          aria-selected={activeTab === 'vaccines' ? 'true' : 'false'}
          aria-controls="vaccines-tabpanel"
          id="vaccines-tab"
          onClick={() => setActiveTab('vaccines')}
          className={`
            px-4 py-2 font-medium text-sm
            ${activeTab === 'vaccines' 
              ? 'text-foreground border-b-2 border-primary' 
              : 'text-muted-foreground hover:text-muted-foreground/80'}
          `}
        >
          واکسن‌ها
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'treatment_types' ? 'true' : 'false'}
          aria-controls="treatment-types-tabpanel"
          id="treatment-types-tab"
          onClick={() => setActiveTab('treatment_types')}
          className={`
            px-4 py-2 font-medium text-sm
            ${activeTab === 'treatment_types' 
              ? 'text-foreground border-b-2 border-primary' 
              : 'text-muted-foreground hover:text-muted-foreground/80'}
          `}
        >
          انواع درمان
        </button>
      </div>

      {activeTab === 'vaccines' && (
        <div role="tabpanel" id="vaccines-tabpanel">
          <>
            {vaccineIsLoading && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="mt-2 text-muted-foreground">در حال بارگذاری واکسن‌ها...</p>
              </div>
            )}
            
            {!vaccineIsLoading && vaccines.length === 0 && !vaccineIsError && (
              <div className="text-center py-8 text-muted-foreground">
                <p> واکسنی یافت نشد. </p>
                <button 
                  onClick={handleCreateVaccine}
                  className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded transition-colors mt-4"
                >
                  اولین واکسن را اضافه کنید
                </button>
              </div>
            )}
            
            {vaccineIsError && (
              <div className="rounded-app border border-destructive bg-destructive/10 p-4 text-center text-destructive">
                خطا در بارگذاری واکسن‌ها. لطفاً صفحه را znovu بارگذاری کنید یا با پشتیبانی تماس بگیرید.
              </div>
            )}
            
            {!vaccineIsLoading && vaccines.length > 0 && !vaccineIsError && (
              <AdminTable
                columns={vaccineColumns}
                data={vaccines}
                isLoading={vaccineIsLoading}
                onCreate={handleCreateVaccine}
                createLabel="افزودن واکسن"
              />
            )}
          </>
        </div>
      )}
      
      {activeTab === 'treatment_types' && (
        <div role="tabpanel" id="treatment-types-tabpanel">
          <>
            {treatmentIsLoading && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="mt-2 text-muted-foreground">در حال بارگذاری انواع درمان...</p>
              </div>
            )}
            
            {!treatmentIsLoading && treatments.length === 0 && !treatmentIsError && (
              <div className="text-center py-8 text-muted-foreground">
                <p> نوع دَرمانِی یافت نشد. </p>
                <button 
                  onClick={handleCreateTreatment}
                  className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded transition-colors mt-4"
                >
                  اولین نوع درمان را اضافه کنید
                </button>
              </div>
            )}
            
            {treatmentIsError && (
              <div className="rounded-app border border-destructive bg-destructive/10 p-4 text-center text-destructive">
                خطا در بارگذاری انواع درمان. لطفاً صفحه را znovu بارگذاری کنید یا با پشتیبانی تماس بگیرید.
              </div>
            )}
            
            {!treatmentIsLoading && treatments.length > 0 && !treatmentIsError && (
              <AdminTable
                columns={treatmentColumns}
                data={treatments}
                isLoading={treatmentIsLoading}
                onCreate={handleCreateTreatment}
                createLabel="افزودن نوع درمان"
              />
            )}
          </>
        </div>
      )}
    </div>
  );
}