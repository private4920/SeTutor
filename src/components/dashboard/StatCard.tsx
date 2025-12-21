import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  loading?: boolean;
  className?: string; // Allow custom classes
  // Deprecated props (kept for compatibility but ignored in new design)
  iconBgColor?: string;
  iconColor?: string;
}

export function StatCard({ title, value, icon, loading, className }: StatCardProps) {
  return (
    <div className={cn(
      "group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-gray-300",
      className
    )}>
      {/* Decorative gradient blob */}
      <div className="absolute -right-4 -top-4 size-20 rounded-full bg-gray-50 blur-2xl transition-all group-hover:bg-brand-neon/20" />

      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          {loading ? (
            <div className="mt-2 h-8 w-16 animate-pulse rounded bg-gray-100" />
          ) : (
            <h3 className="mt-2 text-3xl font-bold tracking-tight text-gray-900">{value}</h3>
          )}
        </div>
        <div className="flex size-10 items-center justify-center rounded-xl bg-gray-50 text-gray-600 ring-1 ring-black/5 group-hover:bg-black group-hover:text-brand-neon transition-colors">
          {icon}
        </div>
      </div>

      {/* Optional Trend indicator (mock) */}
      <div className="mt-4 flex items-center gap-1 text-xs font-medium text-green-600">
        <span className="flex size-4 items-center justify-center rounded-full bg-green-100">+</span>
        <span>Active</span>
      </div>
    </div>
  );
}
