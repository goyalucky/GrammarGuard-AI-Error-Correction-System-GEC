import { Eraser } from 'lucide-react';
import type { CorrectionStyle } from '@/types/correction';
import { CORRECTION_STYLE_LABELS } from '@/types/correction';

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  onCorrect: () => void;
  onExampleSelect: (text: string) => void;
  style: CorrectionStyle;
  onStyleChange: (style: CorrectionStyle) => void;
  preserveMeaning: boolean;
  onPreserveMeaningChange: (v: boolean) => void;
  language: string;
  onLanguageChange: (lang: string) => void;
  isCorrecting: boolean;
}

const exampleSentences = [
  'She have completed the work yesterday.',
  "He don't likes playing cricket.",
  'They was going to school when it start raining.',
  'I am working here since two years.',
];

const sampleTexts: { label: string; text: string }[] = [
  {
    label: 'Subject–Verb Agreement',
    text: 'She have completed the work yesterday.',
  },
  {
    label: 'Verb Tense + Preposition',
    text: 'I am working here since two years.',
  },
];

export default function TextEditor({
  value,
  onChange,
  onClear,
  onCorrect,
  onExampleSelect,
  style,
  onStyleChange,
  preserveMeaning,
  onPreserveMeaningChange,
  language,
  onLanguageChange,
  isCorrecting,
}: TextEditorProps) {
  const charCount = value.length;
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const isEmpty = value.trim().length === 0;

  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Original Text</h3>
        <div className="flex gap-3 text-xs text-gray-400">
          <span>{charCount} chars</span>
          <span>{wordCount} words</span>
        </div>
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste or type text to correct…"
        className="h-40 w-full resize-none rounded-lg border border-gray-200 bg-gray-50/50 p-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
        aria-label="Original text input"
      />

      {/* Example sentences */}
      <div className="mt-3">
        <p className="mb-1.5 text-xs font-medium text-gray-500">Example sentences:</p>
        <div className="flex flex-wrap gap-2">
          {exampleSentences.map((sentence, idx) => (
            <button
              key={idx}
              onClick={() => onExampleSelect(sentence)}
              className="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-600 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
            >
              Example {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Sample text selector */}
      <div className="mt-3">
        <p className="mb-1.5 text-xs font-medium text-gray-500">Sample grammar problems:</p>
        <div className="flex flex-wrap gap-2">
          {sampleTexts.map((sample) => (
            <button
              key={sample.label}
              onClick={() => onExampleSelect(sample.text)}
              className="rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-600 transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Correction Style</label>
            <select
              value={style}
              onChange={(e) => onStyleChange(e.target.value as CorrectionStyle)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            >
              {(Object.keys(CORRECTION_STYLE_LABELS) as CorrectionStyle[]).map((s) => (
                <option key={s} value={s}>
                  {CORRECTION_STYLE_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Language</label>
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            >
              <option value="en">English</option>
              <option value="en-US">English (US)</option>
              <option value="en-GB">English (UK)</option>
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
              <button
                type="button"
                role="switch"
                aria-checked={preserveMeaning}
                onClick={() => onPreserveMeaningChange(!preserveMeaning)}
                className={`relative h-5 w-9 rounded-full transition-colors ${
                  preserveMeaning ? 'bg-indigo-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                    preserveMeaning ? 'left-4.5' : 'left-0.5'
                  }`}
                />
              </button>
              Preserve meaning
            </label>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onCorrect}
            disabled={isEmpty || isCorrecting}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isCorrecting ? 'Correcting…' : 'Correct Grammar'}
          </button>
          <button
            onClick={onClear}
            disabled={isEmpty}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-40"
          >
            <Eraser className="h-4 w-4" />
            Clear
          </button>
        </div>
        {isEmpty && (
          <p className="text-xs text-amber-600">Enter some text to enable correction.</p>
        )}
      </div>
    </div>
  );
}
