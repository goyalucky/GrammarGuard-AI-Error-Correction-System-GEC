import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: string; up: boolean };
  isDemo?: boolean;
}

export default function StatCard({ label, value, icon: Icon, trend, isDemo }: StatCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <span
            className={`inline-flex items-center gap-1 text-xs font-medium ${
              trend.up ? 'text-emerald-600' : 'text-red-500'
            }`}
          >
            {trend.up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            {trend.value}
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
      {isDemo && (
        <p className="mt-2 text-[10px] font-medium uppercase tracking-wide text-gray-400">Demo data</p>
      )}
    </div>
  );
}
