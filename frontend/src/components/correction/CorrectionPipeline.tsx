import type { WorkflowStage } from '@/types/correction';
import { CheckCircle2, Clock, RefreshCw, Circle, ChevronRight, Cpu } from 'lucide-react';

interface CorrectionPipelineProps {
  stages: WorkflowStage[];
  isRunning: boolean;
}

const statusIcon: Record<string, React.ReactNode> = {
  pending: <Circle className="h-4 w-4 text-gray-300" />,
  running: <Clock className="h-4 w-4 animate-pulse text-blue-600" />,
  completed: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
  retry_required: <RefreshCw className="h-4 w-4 animate-spin text-amber-600" />,
};

const statusBorder: Record<string, string> = {
  pending: 'border-gray-200 bg-white',
  running: 'border-blue-300 bg-blue-50/50',
  completed: 'border-emerald-300 bg-emerald-50/50',
  retry_required: 'border-amber-300 bg-amber-50/50',
};

const statusLabel: Record<string, string> = {
  pending: 'Pending',
  running: 'Running',
  completed: 'Completed',
  retry_required: 'Retry Required',
};

export default function CorrectionPipeline({ stages, isRunning }: CorrectionPipelineProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-indigo-600" />
          <h3 className="text-sm font-semibold text-gray-900">Multi-Agent Correction Pipeline</h3>
        </div>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            isRunning ? 'bg-blue-50 text-blue-700 animate-pulse' : 'bg-emerald-50 text-emerald-700'
          }`}
        >
          {isRunning ? 'Agents Active' : 'Pipeline Ready'}
        </span>
      </div>

      {/* Stepper */}
      <div className="overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max pb-2">
          {stages.map((stage, idx) => (
            <div key={stage.id} className="flex items-center">
              <div
                className={`w-44 rounded-lg border p-3 transition-colors ${statusBorder[stage.status]}`}
              >
                <div className="flex items-center gap-2">
                  {statusIcon[stage.status]}
                  <span className="text-xs font-semibold text-gray-700">{stage.name}</span>
                </div>
                <p className="mt-1.5 text-[11px] leading-snug text-gray-400">
                  {stage.description}
                </p>
                <p
                  className={`mt-2 text-[10px] font-medium uppercase tracking-wide ${
                    stage.status === 'pending'
                      ? 'text-gray-300'
                      : stage.status === 'completed'
                        ? 'text-emerald-600'
                        : stage.status === 'retry_required'
                          ? 'text-amber-600'
                          : 'text-blue-600'
                  }`}
                >
                  {statusLabel[stage.status]}
                </p>
              </div>
              {idx < stages.length - 1 && (
                <ChevronRight className="mx-0.5 h-4 w-4 shrink-0 text-gray-300" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-500">
        <span>State Machine: Multi-agent verification loop with conditional routing</span>
        <span className="font-mono text-[11px] text-slate-400">Phase 3 Active</span>
      </div>
    </div>
  );
}