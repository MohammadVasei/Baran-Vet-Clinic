import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, { label: string; className: string }> = {
  pending: { label: "در انتظار", className: "bg-accent-yellow-soft text-accent-yellow-fg" },
  confirmed: { label: "تأیید شده", className: "bg-accent-soft text-accent-soft-fg" },
  completed: { label: "انجام شده", className: "bg-accent-green-soft text-accent-green-fg" },
  cancelled: { label: "لغو شده", className: "bg-destructive-soft text-destructive-soft-fg" },
};

interface StatusBadgeProps {
  status: string;
  labels?: Partial<Record<string, string>>;
  className?: string;
}

export function StatusBadge({ status, labels, className }: StatusBadgeProps) {
  const config = STATUS_STYLES[status] ?? {
    label: status,
    className: "bg-muted text-muted-foreground",
  };

  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs", config.className, className)}>
      {labels?.[status] ?? config.label}
    </span>
  );
}
