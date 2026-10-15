import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import TextEditor from '@/components/correction/TextEditor';
import CorrectionResultPanel from '@/components/correction/CorrectionResult';
import ErrorAnalysis from '@/components/correction/ErrorAnalysis';
import TextComparison from '@/components/correction/TextComparison';
import CorrectionPipeline from '@/components/correction/CorrectionPipeline';
import { correctGrammar, createWorkflowStages, simulateWorkflow } from '@/services/correctionService';
import type { CorrectionResult, CorrectionStyle, WorkflowStage } from '@/types/correction';
import { DEFAULT_PREFERENCES } from '@/types/correction';

export default function GrammarCorrection() {
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [style, setStyle] = useState<CorrectionStyle>(DEFAULT_PREFERENCES.defaultCorrectionStyle);
  const [preserveMeaning, setPreserveMeaning] = useState(DEFAULT_PREFERENCES.preserveOriginalMeaning);
  const [language, setLanguage] = useState('en');
  const [isCorrecting, setIsCorrecting] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [result, setResult] = useState<CorrectionResult | null>(null);
  const [stages, setStages] = useState<WorkflowStage[]>(() => createWorkflowStages());
  const [highlightCorrections] = useState(DEFAULT_PREFERENCES.highlightCorrections);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCorrect = useCallback(async () => {
    if (!text.trim()) return;
    setIsCorrecting(true);
    setErrorMessage(null);
    setResult(null);
    setStages(createWorkflowStages());

    try {
      const correction = await correctGrammar({ text, style, preserveMeaning, language });

      // Run workflow visualization
      await simulateWorkflow(
        createWorkflowStages(),
        correction.needsRetry,
        (updated) => setStages(updated),
        400,
      );

      setResult(correction);
    } catch (err: any) {
      console.error('Correction failed:', err);
      setErrorMessage(err.message || 'Failed to connect to correction service.');
    } finally {
      setIsCorrecting(false);
    }
  }, [text, style, preserveMeaning, language]);

  const handleRetry = useCallback(async () => {
    if (!result) return;
    setIsRetrying(true);

    const newStages = createWorkflowStages();
    newStages[0].status = 'completed';
    newStages[1].status = 'completed';
    newStages[2].status = 'completed';
    setStages(newStages);

    try {
      await simulateWorkflow(newStages, false, (updated) => setStages(updated), 400);
      setResult({ ...result, needsRetry: false });
    } finally {
      setIsRetrying(false);
    }
  }, [result]);

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-4 lg:p-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Grammar Correction Workspace</h2>
        <p className="mt-0.5 text-sm text-gray-500">
          Paste text, choose a correction style, and run the automated GEC pipeline.
        </p>
      </div>

      {/* Backend / Network Error Banner */}
      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-medium">Connection Error</p>
          <p className="mt-1 text-red-600">{errorMessage}</p>
        </div>
      )}

      {/* Two-column workspace */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <TextEditor
          value={text}
          onChange={setText}
          onClear={() => {
            setText('');
            setResult(null);
            setErrorMessage(null);
            setStages(createWorkflowStages());
          }}
          onCorrect={handleCorrect}
          onExampleSelect={(t) => {
            setText(t);
            setResult(null);
            setErrorMessage(null);
          }}
          style={style}
          onStyleChange={setStyle}
          preserveMeaning={preserveMeaning}
          onPreserveMeaningChange={setPreserveMeaning}
          language={language}
          onLanguageChange={setLanguage}
          isCorrecting={isCorrecting}
        />
        <CorrectionResultPanel
          result={result}
          onRetry={handleRetry}
          isRetrying={isRetrying}
        />
      </div>

      {/* Pipeline */}
      <CorrectionPipeline stages={stages} isRunning={isCorrecting || isRetrying} />

      {/* Error analysis */}
      <ErrorAnalysis errors={result?.errors ?? []} highlightCorrections={highlightCorrections} />

      {/* Before/after comparison */}
      <TextComparison result={result} />

      {/* Clean Success Notice (Live backend returned 0 errors) */}
      {result && !result.isMock && result.errors.length === 0 && text.trim() && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 text-sm text-emerald-800">
          <p className="font-medium">No Errors Found</p>
          <p className="mt-1 text-emerald-700">
            The model evaluated your text and found no grammatical or syntactic issues.
          </p>
        </div>
      )}

      {/* Mock Demo notice (Only shows if mock mode is explicitly active) */}
      {result && result.isMock && result.errors.length === 0 && text.trim() && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 text-sm text-amber-700">
          <p className="font-medium">Demo notice</p>
          <p className="mt-1 text-amber-600">
            This text doesn't match any of the predefined mock examples. Try one of the example
            sentences above or ensure your backend is connected.
          </p>
        </div>
      )}

      {/* Explore more */}
      <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-4">
        <button
          onClick={() => navigate('/learning')}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          Learn grammar rules →
        </button>
        <button
          onClick={() => navigate('/documents')}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          Review a document →
        </button>
      </div>
    </div>
  );
}