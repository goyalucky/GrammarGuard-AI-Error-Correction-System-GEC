import type { CorrectionResult } from '@/types/correction';
import { ArrowRight } from 'lucide-react';

interface TextComparisonProps {
  result: CorrectionResult | null;
}

interface DiffSegment {
  text: string;
  type: 'same' | 'removed' | 'added';
}

function computeDiff(original: string, corrected: string): DiffSegment[] {
  if (!original || !corrected) return [];
  const origWords = original.split(/(\s+)/);
  const corrWords = corrected.split(/(\s+)/);

  // Simple LCS-based diff
  const m = origWords.length;
  const n = corrWords.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      if (origWords[i] === corrWords[j]) {
        dp[i][j] = dp[i + 1][j + 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  const segments: DiffSegment[] = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (origWords[i] === corrWords[j]) {
      segments.push({ text: origWords[i], type: 'same' });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      segments.push({ text: origWords[i], type: 'removed' });
      i++;
    } else {
      segments.push({ text: corrWords[j], type: 'added' });
      j++;
    }
  }
  while (i < m) {
    segments.push({ text: origWords[i], type: 'removed' });
    i++;
  }
  while (j < n) {
    segments.push({ text: corrWords[j], type: 'added' });
    j++;
  }
  return segments;
}

export default function TextComparison({ result }: TextComparisonProps) {
  if (!result || result.errors.length === 0) return null;

  const segments = computeDiff(result.originalText, result.correctedText);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-1 text-sm font-semibold text-gray-900">Before & After Comparison</h3>
      <p className="mb-4 text-xs text-gray-400">
        Red strikethrough shows removed text, green shows added text
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Before */}
        <div>
          <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-gray-500">
            <span className="h-2 w-2 rounded-full bg-red-400" />
            Before
          </div>
          <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-3 text-sm leading-relaxed">
            {segments.map((seg, idx) =>
              seg.type === 'added' ? null : (
                <span
                  key={idx}
                  className={
                    seg.type === 'removed'
                      ? 'text-red-600 line-through decoration-red-400'
                      : 'text-gray-700'
                  }
                >
                  {seg.text}
                </span>
              ),
            )}
          </div>
        </div>

        {/* Arrow */}
        <div className="hidden md:block" />

        {/* After */}
        <div>
          <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-gray-500">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            After
          </div>
          <div className="rounded-lg border border-gray-100 bg-emerald-50/30 p-3 text-sm leading-relaxed">
            {segments.map((seg, idx) =>
              seg.type === 'removed' ? null : (
                <span
                  key={idx}
                  className={
                    seg.type === 'added'
                      ? 'text-emerald-700 font-medium'
                      : 'text-gray-700'
                  }
                >
                  {seg.text}
                </span>
              ),
            )}
          </div>
        </div>
      </div>

      {/* Inline diff for mobile */}
      <div className="mt-4 md:hidden">
        <p className="mb-1.5 text-xs font-medium text-gray-500">Inline diff</p>
        <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-3 text-sm leading-relaxed">
          {segments.map((seg, idx) => (
            <span
              key={idx}
              className={
                seg.type === 'removed'
                  ? 'text-red-600 line-through decoration-red-400'
                  : seg.type === 'added'
                    ? 'text-emerald-700 font-medium'
                    : 'text-gray-700'
              }
            >
              {seg.text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
