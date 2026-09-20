import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabase-client";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Title } from "chart.js";
import { Line, Bar, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title
);

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
}

interface CustomChartProps {
  chart: CustomChart;
}

export function CustomChart({ chart }: CustomChartProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Build the query
        let query = supabaseClient.from(chart.resource).select("*");

        // Apply time range if applicable
        const now = new Date();
        if (chart.time_range !== "custom") {
          const days = parseInt(chart.time_range);
          if (!isNaN(days)) {
            const past = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
            // We need to know the date field for the resource
            const dateField = getDateField(chart.resource);
            if (dateField) {
              query = query.gte(dateField, past.toISOString());
            }
          }
        } else {
          if (chart.custom_start_date) {
            const dateField = getDateField(chart.resource);
            if (dateField) {
              query = query.gte(dateField, chart.custom_start_date);
            }
          }
          if (chart.custom_end_date) {
            const dateField = getDateField(chart.resource);
            if (dateField) {
              query = query.lte(dateField, chart.custom_end_date);
            }
          }
        }

        // Apply filters (simplified: we assume filters are in the format { field: value })
        // We'll skip for now and leave as future work

        // Execute the query
        const { data: fetchedData, error } = await query;

        if (error) throw error;

        if (!isMounted) return;

        // Process the data for the chart
        const processedData = processChartData(fetchedData, chart);
        setData(processedData);
      } catch (err) {
        if (!isMounted) return;
        console.error("Error fetching chart data:", err);
        setError("خطا در بارگذاری داده‌ها");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [chart]);

  if (loading) return <div className="h-48 flex items-center justify-center">در حال بارگذاری...</div>;
  if (error) return <div className="h-48 flex items-center justify-center text-red-500">{error}</div>;
  if (!data) return <div className="h-48 flex items-center justify-center text-muted-foreground">داده‌ای برای نمایش نیست</div>;

  // Render the chart based on type
  switch (chart.chart_type) {
    case "line":
      return <Line data={data} options={chartOptions} />;
    case "bar":
      return <Bar data={data} options={chartOptions} />;
    case "pie":
      return <Pie data={data} options={pieChartOptions} />;
    case "donut":
      return <Pie data={data} options={donutChartOptions} />;
    default:
      return <div className="h-48 flex items-center justify-center">نوع نمودار پشتیبانی نمی‌شود</div>;
  }
}

// Helper function to get the date field for a resource
function getDateField(resource: string): string | null {
  switch (resource) {
    case "bookings":
      return "booking_date"; // or "created_at"
    case "orders":
      return "created_at";
    case "stock_levels":
      return "updated_at";
    default:
      return null;
  }
}

// Process the data for the chart
function processChartData(data: any[], chart: CustomChart): any {
  if (!data || data.length === 0) {
    return { labels: [], datasets: [] };
  }

  // We'll group by the x_field and aggregate the y_field
  const xField = chart.x_field;
  const yField = chart.y_field;
  const aggregation = chart.aggregation || "count";

  if (!xField) {
    // If no x_field is selected, we can't create a meaningful chart
    return { labels: [], datasets: [] };
  }

  // Group by xField
  const grouped: Record<string, any[]> = {};
  data.forEach((item) => {
    const key = item[xField];
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(item);
  });

  // For each group, calculate the aggregated value of yField
  const labels: string[] = [];
  const values: number[] = [];

  for (const key in grouped) {
    const group = grouped[key];
    let value: number | null = null;

    if (aggregation === "count") {
      value = group.length;
    } else if (yField) {
      const numericValues = group
        .map((item) => item[yField])
        .filter((val): val is number => typeof val === "number" && !isNaN(val));

      if (numericValues.length === 0) {
        value = 0;
      } else {
        switch (aggregation) {
          case "sum":
            value = numericValues.reduce((sum, val) => sum + val, 0);
            break;
          case "avg":
            value =
              numericValues.reduce((sum, val) => sum + val, 0) /
              numericValues.length;
            break;
          case "min":
            value = Math.min(...numericValues);
            break;
          case "max":
            value = Math.max(...numericValues);
            break;
          default:
            value = numericValues.length;
        }
      }
    } else {
      value = group.length;
    }

    if (value !== null) {
      labels.push(String(key));
      values.push(value);
    }
  }

  // Determine the background and border colors based on the chart type
  const backgroundColor = chart.chart_type === "pie" || chart.chart_type === "donut"
    ? [
        "rgb(239 68 68)", // red-500
        "rgb(245 158 11)", // orange-500
        "rgb(212 175 55)", // yellow-500
        "rgb(34 197 94)", // green-500
        "rgb(139 92 246)", // blue-500
        "rgb(99 102 241)", // indigo-500
        "rgb(5 150 105)", // emerald-600
      ]
    : "rgb(59 130 246)"; // blue-500

  const borderColor = chart.chart_type === "pie" || chart.chart_type === "donut"
    ? [
        "rgb(239 68 68)",
        "rgb(245 158 11)",
        "rgb(212 175 55)",
        "rgb(34 197 94)",
        "rgb(139 92 246)",
        "rgb(99 102 241)",
        "rgb(5 150 105)",
      ]
    : "rgb(59 130 246)";

  // Build the dataset
  const dataset = {
    label: chart.chart_name,
    data: values,
    backgroundColor: backgroundColor,
    borderColor: borderColor,
    borderWidth: 1,
    fill: chart.chart_type === "line",
  };

  // For pie and donut, we don't want a border on each slice? We'll adjust in the options.
  // We'll set the borderWidth to 0 for pie and donut in the options.

  return {
    labels: labels,
    datasets: [dataset],
  };
}

// Chart options
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      enabled: true,
      mode: "index" as const,
      intersect: false,
    },
  },
  scales: {
    y: {
      display: true,
      grid: {
        display: false,
      },
      ticks: {
        display: false,
      },
    },
    x: {
      display: true,
      grid: {
        display: false,
      },
      ticks: {
        display: false,
      },
    },
  },
};

const pieChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom" as const,
    },
    tooltip: {
      enabled: true,
      callbacks: {
        label: (context: any) => {
          const value = context.parsed ?? 0;
          const sum = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
          const percentage = ((value as number) / sum) * 100;
          return `${percentage.toFixed(1)}%`;
        },
      },
    },
  },
};

const donutChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "bottom" as const,
    },
    tooltip: {
      enabled: true,
      callbacks: {
        label: (context: any) => {
          const value = context.parsed ?? 0;
          const sum = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
          const percentage = ((value as number) / sum) * 100;
          return `${percentage.toFixed(1)}%`;
        },
      },
    },
  },
  cutout: "50%",
};