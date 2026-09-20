import { useState } from "react";
import { Button } from "@/components/ui/button";

interface CustomChart {
  id?: string;
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

interface CustomChartBuilderModalProps {
  onClose: () => void;
  onSave: (chart: CustomChart) => Promise<void>;
  initialChart?: CustomChart;
}

export function CustomChartBuilderModal({
  onClose,
  onSave,
  initialChart,
}: CustomChartBuilderModalProps) {
  const [form, setForm] = useState<Omit<CustomChart, "id" | "user_id">>(() => {
    if (initialChart) {
      return {
        chart_name: initialChart.chart_name,
        chart_type: initialChart.chart_type,
        resource: initialChart.resource,
        x_field: initialChart.x_field || "",
        y_field: initialChart.y_field || "",
        aggregation: initialChart.aggregation || "count",
        filters: initialChart.filters || {},
        time_range: initialChart.time_range,
        custom_start_date: initialChart.custom_start_date || "",
        custom_end_date: initialChart.custom_end_date || "",
        is_active: initialChart.is_active ?? true,
      };
    }
    
    return {
      chart_name: "",
      chart_type: "line",
      resource: "bookings",
      x_field: "",
      y_field: "",
      aggregation: "count",
      filters: {},
      time_range: "7d",
      custom_start_date: "",
      custom_end_date: "",
      is_active: true,
    };
  });

  const [loading, setLoading] = useState(false);

  // Define available fields for each resource
  const resourceFields: Record<string, string[]> = {
    bookings: ["id", "booking_date", "status", "created_at"],
    orders: ["id", "total_rial", "status", "created_at"],
    stock_levels: [
      "product_id",
      "quantity_on_hand",
      "low_stock_threshold",
      "updated_at",
      "products(name,price_rial,category,is_active)",
    ],
    // Add more resources as needed
  };

  const fields = resourceFields[form.resource] || [];

  // Determine if a field is numeric (for aggregation options)
  const isNumericField = (field?: string) => {
    if (!field) return false;
    // Simple heuristic: field names that suggest numeric values
    const numericFields = [
      "quantity_on_hand",
      "low_stock_threshold",
      "total_rial",
      "id",
    ];
    return numericFields.includes(field);
  };

  const aggregationOptions = isNumericField(form.y_field || form.x_field)
      ? ["count", "sum", "avg", "min", "max"]
      : ["count"];

  const handleSave = async () => {
    setLoading(true);
    try {
      // Hand the form data to the parent, which owns the actual insert.
      // (Inserting here too would create a duplicate row.)
      await onSave(form);
      onClose();
    } catch (error) {
      console.error("Error saving custom chart:", error);
      alert("خطا در ذخیره نمودار سفارشی");
    } finally {
      setLoading(false);
    }
  };

return (
<div className="fixed inset-0 z-overlay flex items-center justify-center bg-[var(--overlay-background)]">
          <div className="bg-surface rounded-xl border border-border p-2 sm:p-4 max-h-[80vh] overflow-y-auto">
           <div className="flex justify-between items-start mb-2 sm:mb-4">
             <h2 className="text-xl font-bold text-foreground">ساخت نمودار سفارشی</h2>
             <Button
                 variant="outline"
                 size="sm"
                 type="button"
                 onClick={onClose}
                 className="p-1"
             >
               <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
               </svg>
             </Button>
           </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                نام نمودار
              </label>
              <input
                  type="text"
                  value={form.chart_name}
                  onChange={(e) =>
                      setForm((prev) => ({ ...prev, chart_name: e.target.value }))
                  }
                  className="w-full px-3 py-2 rounded-border border border-input bg-background/50 text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                نوع نمودار
              </label>
              <select
                  value={form.chart_type}
                  onChange={(e) =>
                      setForm((prev) => ({ ...prev, chart_type: e.target.value as "line" | "bar" | "pie" | "donut" }))
                  }
                  className="w-full px-3 py-2 rounded-border border border-input bg-background/50 text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="line">خطی</option>
                <option value="bar">ستونی</option>
                <option value="pie">دایره‌ای</option>
                <option value="donut">دایره‌ای توخالی</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                منبع داده
              </label>
              <select
                  value={form.resource}
                  onChange={(e) => {
                    setForm((prev) => ({
                      ...prev,
                      resource: e.target.value,
                      x_field: "",
                      y_field: "",
                      aggregation: "count",
                    }));
                  }}
                  className="w-full px-3 py-2 rounded-border border border-input bg-background/50 text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="bookings">نوبت‌ها</option>
                <option value="orders">سفارشات</option>
                <option value="stock_levels">موجودی انبار</option>
              </select>
            </div>

            {fields.length > 0 && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      فیلد محور X
                    </label>
                    <select
                        value={form.x_field}
                        onChange={(e) =>
                            setForm((prev) => ({ ...prev, x_field: e.target.value }))
                        }
                        className="w-full px-3 py-2 rounded-border border border-input bg-background/50 text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {fields.map((field) => (
                          <option key={field} value={field}>
                            {field}
                          </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      فیلد محور Y
                    </label>
                    <select
                        value={form.y_field}
                        onChange={(e) =>
                            setForm((prev) => ({ ...prev, y_field: e.target.value }))
                        }
                        className="w-full px-3 py-2 rounded-border border border-input bg-background/50 text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {fields.map((field) => (
                          <option key={field} value={field}>
                            {field}
                          </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      تجمیع
                    </label>
                    <select
                        value={form.aggregation}
                        onChange={(e) =>
                            setForm((prev) => ({ ...prev, aggregation: e.target.value }))
                        }
                        className="w-full px-3 py-2 rounded-border border border-input bg-background/50 text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {aggregationOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                      ))}
                    </select>
                  </div>
                </>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                بازه زمانی
              </label>
              <select
                  value={form.time_range}
                  onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        time_range: e.target.value,
                        custom_start_date: "",
                        custom_end_date: "",
                      }))
                  }
                  className="w-full px-3 py-2 rounded-border border border-input bg-background/50 text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="7d">7 روز اخیر</option>
                <option value="30d">30 روز اخیر</option>
                <option value="90d">90 روز اخیر</option>
                <option value="custom">محدود شده</option>
              </select>
            </div>

{form.time_range === "custom" && (
                 <>
                   <div>
                     <label className="block text-sm font-medium text-foreground mb-2">
                       تاریخ شروع
                     </label>
                     <input
                       type="date"
                       value={form.custom_start_date}
                       onChange={(e) =>
                         setForm((prev) => ({ ...prev, custom_start_date: e.target.value }))
                       }
                       className="w-full px-3 py-2 rounded-border border border-input bg-background/50 text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-foreground mb-2">
                       تاریخ پایان
                     </label>
                     <input
                       type="date"
                       value={form.custom_end_date}
                       onChange={(e) =>
                         setForm((prev) => ({ ...prev, custom_end_date: e.target.value }))
                       }
                       className="w-full px-3 py-2 rounded-border border border-input bg-background/50 text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                     />
                   </div>
                 </>
               )}
               
               <div>
                 <label className="block text-sm font-medium text-foreground mb-2">
                   وضعیت
                 </label>
                 <div className="flex items-center">
                   <div className="flex items-center space-x-2">
                     <div className={`w-3 h-3 rounded-full ${form.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                     <span className="text-sm font-medium text-foreground">
                       {form.is_active ? 'فعال' : 'غیرفعال'}
                     </span>
                   </div>
                   <input
                     type="checkbox"
                     checked={form.is_active}
                     onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))}
                     className="h-4 w-4 text-primary-foreground focus:ring-primary border-gray-300 rounded"
                   />
                 </div>
               </div>

            <div className="flex justify-end space-x-3">
              <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onClose}
              >
                انصراف
              </Button>
              <Button
                  type="submit"
                  variant="default"
                  size="sm"
                  isLoading={loading}
              >
                ذخیره
              </Button>
            </div>
          </form>
        </div>
      </div>
  );
}