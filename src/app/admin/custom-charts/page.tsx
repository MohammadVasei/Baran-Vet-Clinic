"use client";

import { useList, useDelete, useNavigation, useCan, useUpdate } from '@refinedev/core';
import { AdminTable } from '@/components/admin/AdminTable';
import { EditIcon, TrashIcon, EyeIcon, CheckIcon, XIcon } from '@/components/icons';
import { CustomChartBuilderModal } from '@/components/admin/CustomChartBuilderModal';
import { supabaseClient } from '@/lib/supabase-client';
import { useState, useEffect } from 'react';

interface CustomChart {
  id: string;
  user_id: string;
  chart_name: string;
  chart_type: "line" | "bar" | "pie" | "donut";
  resource: string;
  x_field?: string;
  y_field?: string;
  aggregation?: string;
  filters: Record<string, any>;
  time_range: string;
  custom_start_date?: string;
  custom_end_date?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export default function CustomChartsList() {
  const listResult = useList<CustomChart>({
    resource: 'admin_custom_charts',
    sorters: [{ field: 'created_at', order: 'desc' }],
    meta: { select: '*' },
  });
  const { result, query } = listResult;
  const navigation = useNavigation();
  const { mutate: deleteItem } = useDelete();
  const { mutate: updateChart, mutation: updateMutation } = useUpdate();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingChart, setEditingChart] = useState<CustomChart | null>(null);
  
  const canEdit = useCan({ resource: 'admin_custom_charts', action: 'edit' });
  const canDelete = useCan({ resource: 'admin_custom_charts', action: 'delete' });

  const handleEdit = (id: string) => {
    const chartToEdit = result?.data?.find((chart: CustomChart) => chart.id === id) || null;
    setEditingChart(chartToEdit);
    setShowEditModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('آیا از حذف این نمودار سفارشی اطمینان دارید؟')) {
      deleteItem({ id, resource: 'admin_custom_charts' });
    }
  };

const handleToggleActive = async (id: string, currentIsActive: boolean) => {
    const { data: { user } } = await supabaseClient.auth.getUser();
    const userId = user?.id;
    if (!userId) throw new Error('User not authenticated');

    const { error } = await supabaseClient
        .from('admin_custom_charts')
        .update({ is_active: !currentIsActive })
        .eq('id', id);

    if (error) {
        console.error('Error toggling chart active status:', error);
        alert('خطا در تغییر وضعیت نمودار');
    } else {
        // Optimistically update the chart in the state
        query.refetch();
    }
};

  const handleCreate = () => {
    setShowCreateModal(true);
  };

  const handleEditClose = () => {
    setShowEditModal(false);
    setEditingChart(null);
  };

  const handleCreateClose = () => {
    setShowCreateModal(false);
  };

const handleSaveChart = async (chartData: Omit<CustomChart, "id" | "user_id">) => {
    try {
        // Get current user ID from Supabase auth
        const { data: { user } } = await supabaseClient.auth.getUser();
        const userId = user?.id;
        if (!userId) throw new Error('User not authenticated');

        // Process chartData to handle empty date fields and ensure is_active is set
        const processedChartData = {
            ...chartData,
            // Convert empty strings to NULL for timestamp fields
            custom_start_date: chartData.custom_start_date || null,
            custom_end_date: chartData.custom_end_date || null,
            // Ensure is_active is set (default to true if not provided)
            is_active: chartData.is_active ?? true,
        };

        if (editingChart) {
            // Update existing chart
            const { data, error } = await supabaseClient
                .from('admin_custom_charts')
                .update({ ...processedChartData, updated_at: new Date().toISOString() })
                .eq('id', editingChart.id)
                .select()
                .single();

            if (error) throw error;

            // Optimistically update the chart in the state
            query.refetch();
        } else {
            // Create new chart
            const { data, error } = await supabaseClient
                .from('admin_custom_charts')
                .insert([{ ...processedChartData, user_id: userId, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }])
                .select()
                .single();

            if (error) throw error;

            // Optimistically add the new chart to the state
            query.refetch();
        }

        // Close modals
        handleEditClose();
        handleCreateClose();
    } catch (error) {
        console.error('Error saving chart:', error);
        alert('خطا در ذخیره نمودار سفارشی');
    }
};

  const columns = [
    {
      accessorKey: 'chart_name' as keyof CustomChart,
      header: 'نام نمودار',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => <span className="font-medium">{getValue('chart_name') as string}</span>,
    },
    {
      accessorKey: 'chart_type' as keyof CustomChart,
      header: 'نوع',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => {
        const typeMap: Record<string, string> = {
          line: 'خطی',
          bar: 'ستونی',
          pie: 'دایره‌ای',
          donut: 'دایره‌ای توخالی'
        };
        const type = getValue('chart_type') as string;
        return <span>{typeMap[type] || type}</span>;
      },
    },
    {
      accessorKey: 'resource' as keyof CustomChart,
      header: 'منبع داده',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => {
        const resourceMap: Record<string, string> = {
          bookings: 'نوبت‌ها',
          orders: 'سفارشات',
          stock_levels: 'موجودی انبار',
          // Add more as needed
        };
        const resource = getValue('resource') as string;
        return <span>{resourceMap[resource] || resource}</span>;
      },
    },
    {
      accessorKey: 'time_range' as keyof CustomChart,
      header: 'بازه زمانی',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => {
        const timeRangeMap: Record<string, string> = {
          "7d": '7 روز اخیر',
          "30d": '30 روز اخیر',
          "90d": '90 روز اخیر',
          custom: 'محدود شده'
        };
        const timeRange = getValue('time_range') as string;
        return <span>{timeRangeMap[timeRange] || timeRange}</span>;
      },
    },
    {
      accessorKey: 'is_active' as keyof CustomChart,
      header: 'وضعیت',
      cellWithMeta: ({ getValue }: { getValue: (key: string) => unknown }) => {
        const isActive = getValue('is_active') as boolean;
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {isActive ? 'فعال' : 'غیرفعال'}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: 'عملیات',
      cellWithMeta: ({ original }: { original: CustomChart }) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleToggleActive(original.id, original.is_active)}
            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            aria-label={original.is_active ? 'غیرفعال کردن' : 'فعال کردن'}
          >
            {original.is_active ? (
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.776-1.333-2.082-2-3.464-2H6.074c-1.382 0-2.688.667-3.464 2l-.012 1.172c-.77 1.333-.192 3 1.732 3z" />
              </svg>
            )}
          </button>
          <button onClick={() => handleEdit(original.id)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" aria-label="ویرایش">
            {canEdit.data && <EditIcon className="size-4" />}
          </button>
          <button onClick={() => handleDelete(original.id)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-destructive transition-colors" aria-label="حذف">
            {canDelete.data && <TrashIcon className="size-4" />}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">مدیریت نمودارهای سفارشی</h1>
          <p className="text-muted-foreground mt-1">لیست تمام نمودارهای سفارشی که توسط کاربران ایجاد شده‌اند</p>
        </div>
        {canEdit.data && (
          <button onClick={handleCreate} className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
            نمودار جدید
          </button>
        )}
      </div>

      <AdminTable
        columns={columns}
        data={(result?.data as CustomChart[]) || []}
        isLoading={query.isLoading}
        onCreate={handleCreate}
        createLabel="افزودن نمودار سفارشی"
      />

      {query.isError && (
        <div className="rounded-app border border-destructive bg-destructive/10 p-4 text-center text-destructive">
          خطا در بارگذاری نمودارهای سفارشی
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingChart && (
        <CustomChartBuilderModal
          initialChart={editingChart}
          onClose={handleEditClose}
          onSave={handleSaveChart}
        />
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CustomChartBuilderModal
          onClose={handleCreateClose}
          onSave={handleSaveChart}
        />
      )}
    </div>
  );
}