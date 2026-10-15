import { useState } from 'react';
import { Copy, Check, Download, RefreshCw, Info, ShieldCheck } from 'lucide-react';
import type { CorrectionResult } from '@/types/correction';
import { CORRECTION_STYLE_LABELS } from '@/types/correction';

interface CorrectionResultProps {
  result: CorrectionResult | null;
  onRetry: () => void;
  isRetrying: boolean;
}

export default function CorrectionResultPanel({ result, onRetry, isRetrying }: CorrectionResultProps) {
  const [copied, setCopied] = useState(false);

  if (!result) {
    return (
      <div className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900">Corrected Text</h3>
        <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
          <Info className="h-8 w-8 text-gray-300" />
          <p className="mt-2 text-sm text-gray-400">No correction yet</p>
          <p className="text-xs text-gray-400">
            Enter text and click "Correct Grammar" to see results
          </p>
        </div>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(result.correctedText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownload = () => {
    const blob = new Blob([result.correctedText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'corrected-text.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const qualityColor =
    result.qualityScore >= 85 ? 'text-emerald-600' : result.qualityScore >= 70 ? 'text-blue-600' : 'text-amber-600';

  return (
    <div className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Corrected Text</h3>
        <div className="flex items-center gap-2">
          {result.verificationStatus && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200/60">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              {result.verificationStatus}
            </span>
          )}
          {result.isMock && (
            <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
              Mock result
            </span>
          )}
        </div>
      </div>

      {/* Corrected text */}
      <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-3">
        <p className="text-sm leading-relaxed text-gray-800">
          {result.errors.length === 0 ? (
            <span className="text-gray-500 italic">No corrections needed — text appears grammatically correct.</span>
          ) : (
            result.correctedText
          )}
        </p>
      </div>

      {/* Stats row */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-3 text-center">
          <p className="text-lg font-bold text-gray-900">{result.errorCount}</p>
          <p className="text-xs text-gray-500">Errors detected</p>
        </div>
        <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-3 text-center">
          <p className={`text-lg font-bold ${qualityColor}`}>
            {result.qualityScore > 0 ? `${result.qualityScore}%` : '—'}
          </p>
          <p className="text-xs text-gray-500">Quality {qualityScoreLabel(result.qualityScore)}</p>
        </div>
        <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-3 text-center">
          <p className="text-xs font-medium text-gray-700">
            {CORRECTION_STYLE_LABELS[result.style]}
          </p>
          <p className="text-xs text-gray-500">Style</p>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-100 pt-4">
        <button
          onClick={handleCopy}
          disabled={result.errors.length === 0}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-40"
        >
          {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
        <button
          onClick={handleDownload}
          disabled={result.errors.length === 0}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-40"
        >
          <Download className="h-4 w-4" />
          Download .txt
        </button>
        <button
          onClick={onRetry}
          disabled={isRetrying}
          className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-100 disabled:opacity-40"
        >
          <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
          Retry verification
        </button>
      </div>

      {result.needsRetry && (
        <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
          Verification agent flagged this correction for a retry — multiple errors were detected.
        </p>
      )}
    </div>
  );
}

function qualityScoreLabel(score: number): string {
  if (score === 0) return '';
  if (score >= 85) return '(High)';
  if (score >= 70) return '(Good)';
  return '(Fair)';
}