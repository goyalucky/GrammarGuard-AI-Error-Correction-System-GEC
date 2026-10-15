import type { GrammarError } from '@/types/correction';
import { ERROR_CATEGORY_LABELS, SEVERITY_LABELS } from '@/types/correction';
import { AlertTriangle, ArrowRight, BookOpen, Lightbulb, CheckCircle2, XCircle } from 'lucide-react';

interface ErrorAnalysisProps {
  errors: GrammarError[];
  highlightCorrections: boolean;
}

const severityStyles: Record<string, string> = {
  low: 'bg-blue-50 text-blue-700',
  medium: 'bg-amber-50 text-amber-700',
  high: 'bg-red-50 text-red-700',
};

export default function ErrorAnalysis({ errors, highlightCorrections }: ErrorAnalysisProps) {
  if (errors.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900">Error Analysis</h3>
        <div className="mt-4 flex flex-col items-center justify-center py-6 text-center">
          <AlertTriangle className="h-7 w-7 text-gray-300" />
          <p className="mt-2 text-sm text-gray-400">No errors to analyze</p>
          <p className="text-xs text-gray-400">Run a correction to see detailed error analysis</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Error Analysis & Pedagogical Guidance</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Contextual explanations retrieved via vector similarity search against grammar rulebooks.
          </p>
        </div>
        <div className="flex gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-gray-500">
            <span className="underline decoration-red-500 decoration-2 underline-offset-2">Original error</span>
          </span>
          <span className="flex items-center gap-1.5 text-gray-500">
            <span className="underline decoration-emerald-500 decoration-2 underline-offset-2">Correction</span>
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {errors.map((error, idx) => (
          <div
            key={error.id}
            className="rounded-lg border border-gray-200/80 bg-white p-4 shadow-xs transition-colors hover:border-gray-300"
          >
            {/* Header / Badges */}
            <div className="flex items-start justify-between gap-3 border-b border-gray-100 pb-3">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span
                  className={`rounded px-2 py-0.5 font-medium ${
                    highlightCorrections
                      ? 'bg-red-50 text-red-700 underline decoration-red-500 decoration-2 underline-offset-2'
                      : 'text-gray-700'
                  }`}
                >
                  {error.originalText}
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-gray-400" />
                <span
                  className={`rounded px-2 py-0.5 font-medium ${
                    highlightCorrections
                      ? 'bg-emerald-50 text-emerald-700 underline decoration-emerald-500 decoration-2 underline-offset-2'
                      : 'text-gray-700'
                  }`}
                >
                  {error.correctedText}
                </span>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                  {ERROR_CATEGORY_LABELS[error.category]}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${severityStyles[error.severity]}`}
                >
                  {SEVERITY_LABELS[error.severity]}
                </span>
                <span className="text-[11px] font-mono text-gray-400">#{idx + 1}</span>
              </div>
            </div>

            {/* RAG Rule Title & Detailed Rule Description */}
            <div className="mt-3 space-y-1.5">
              {error.ruleTitle && (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-900">
                  <BookOpen className="h-3.5 w-3.5 text-indigo-600" />
                  <span>{error.ruleTitle}</span>
                </div>
              )}
              <p className="text-sm text-gray-600 leading-relaxed">{error.explanation}</p>
            </div>

            {/* RAG Pedagogical Tip */}
            {error.pedagogicalTip && (
              <div className="mt-3 flex items-start gap-2 rounded-md bg-amber-50/70 p-2.5 text-xs text-amber-800 border border-amber-200/50">
                <Lightbulb className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <span className="font-semibold text-amber-900">Pedagogical Tip: </span>
                  <span>{error.pedagogicalTip}</span>
                </div>
              </div>
            )}

            {/* RAG Rule Examples (Incorrect vs Correct) */}
            {error.examples && (
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex items-start gap-2 rounded bg-red-50/40 border border-red-100 p-2 text-gray-700">
                  <XCircle className="h-3.5 w-3.5 shrink-0 text-red-500 mt-0.5" />
                  <div>
                    <span className="font-medium text-red-700">Avoid: </span>
                    <span>"{error.examples.incorrect}"</span>
                  </div>
                </div>
                <div className="flex items-start gap-2 rounded bg-emerald-50/40 border border-emerald-100 p-2 text-gray-700">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600 mt-0.5" />
                  <div>
                    <span className="font-medium text-emerald-700">Preferred: </span>
                    <span>"{error.examples.correct}"</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}