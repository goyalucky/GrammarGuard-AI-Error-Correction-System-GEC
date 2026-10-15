import { CheckCircle2, Clock, AlertCircle, RefreshCw, XCircle, Circle } from 'lucide-react';
import type { ReactNode } from 'react';

type BadgeStatus = 'pending' | 'running' | 'completed' | 'retry_required' | 'failed' | 'in_progress';

interface StatusBadgeProps {
  status: BadgeStatus;
  label?: string;
}

const config: Record<BadgeStatus, { label: string; icon: ReactNode; className: string }> = {
  pending: {
    label: 'Pending',
    icon: <Circle className="h-3.5 w-3.5" />,
    className: 'bg-gray-100 text-gray-600',
  },
  running: {
    label: 'Running',
    icon: <Clock className="h-3.5 w-3.5 animate-pulse" />,
    className: 'bg-blue-50 text-blue-700',
  },
  in_progress: {
    label: 'In Progress',
    icon: <Clock className="h-3.5 w-3.5 animate-pulse" />,
    className: 'bg-blue-50 text-blue-700',
  },
  completed: {
    label: 'Completed',
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    className: 'bg-emerald-50 text-emerald-700',
  },
  retry_required: {
    label: 'Retry Required',
    icon: <RefreshCw className="h-3.5 w-3.5" />,
    className: 'bg-amber-50 text-amber-700',
  },
  failed: {
    label: 'Failed',
    icon: <XCircle className="h-3.5 w-3.5" />,
    className: 'bg-red-50 text-red-700',
  },
};

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const c = config[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${c.className}`}
    >
      {c.icon}
      {label ?? c.label}
    </span>
  );
}
