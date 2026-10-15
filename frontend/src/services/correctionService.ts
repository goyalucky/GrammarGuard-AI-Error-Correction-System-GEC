import type {
  CorrectionRequest,
  CorrectionResult,
  CorrectionStyle,
  GrammarError,
  WorkflowStage,
  BackendCorrectionResponse,
} from '@/types/correction';
import {
  WORKFLOW_STAGE_DESCRIPTIONS,
  WORKFLOW_STAGE_NAMES,
  mapBackendToFrontendResult,
} from '@/types/correction';
import { findMockCorrection } from './mockData';
import { USE_MOCK_API, API_ENDPOINTS } from '@/config/api';

let correctionCounter = 0;

function generateId(prefix: string): string {
  correctionCounter += 1;
  return `${prefix}-${Date.now()}-${correctionCounter}`;
}

function computeErrorPositions(
  originalText: string,
  errors: Omit<GrammarError, 'id' | 'startIndex' | 'endIndex'>[],
): GrammarError[] {
  return errors.map((err, idx) => {
    const start = originalText.indexOf(err.originalText);
    const end = start === -1 ? -1 : start + err.originalText.length;
    return {
      ...err,
      id: generateId(`err-${idx}`),
      startIndex: start,
      endIndex: end,
    };
  });
}

function computeQualityScore(errorCount: number, hasRetry: boolean): number {
  const base = Math.max(60, 100 - errorCount * 8);
  const retryPenalty = hasRetry ? 4 : 0;
  return Math.min(99, base - retryPenalty);
}

function applyStyleToCorrected(
  correctedText: string,
  style: CorrectionStyle,
): string {
  if (style === 'professional') {
    return correctedText.replace(/\bi\b/g, 'I').replace(/\s+/g, ' ').trim();
  }
  if (style === 'grammar_clarity') {
    return correctedText.replace(/\s+/g, ' ').trim();
  }
  return correctedText;
}

async function runMockCorrection(request: CorrectionRequest): Promise<CorrectionResult> {
  const match = findMockCorrection(request.text);
  const now = new Date().toISOString();
  const currentStyle = request.style || 'grammar_only';
  const shouldPreserve = request.preserveMeaning ?? true;

  if (!match) {
    return {
      id: generateId('corr'),
      originalText: request.text,
      correctedText: request.text,
      errors: [],
      errorCount: 0,
      qualityScore: 100,
      style: currentStyle,
      preserveMeaning: shouldPreserve,
      timestamp: now,
      isMock: true,
      needsRetry: false,
    };
  }

  const errorsWithPositions = computeErrorPositions(request.text, match.errors);
  const needsRetry = errorsWithPositions.length > 2;
  const styledCorrected = applyStyleToCorrected(match.correctedText, currentStyle);

  return {
    id: generateId('corr'),
    originalText: request.text,
    correctedText: styledCorrected,
    errors: errorsWithPositions,
    errorCount: errorsWithPositions.length,
    qualityScore: computeQualityScore(errorsWithPositions.length, needsRetry),
    style: currentStyle,
    preserveMeaning: shouldPreserve,
    timestamp: now,
    isMock: true,
    needsRetry,
  };
}

/**
 * Public API — correct grammar.
 * Calls FastAPI backend (POST /api/v1/correct) when USE_MOCK_API is false.
 */
export async function correctGrammar(request: CorrectionRequest): Promise<CorrectionResult> {
  if (USE_MOCK_API) {
    return runMockCorrection(request);
  }

  try {
    const payload = {
      text: request.text,
      context_type: request.style || 'general',
    };

    const response = await fetch(API_ENDPOINTS.correct, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.detail || `Correction API error: ${response.status}`);
    }

    const backendData: BackendCorrectionResponse = await response.json();
    return mapBackendToFrontendResult(
      backendData,
      request.style || 'grammar_only',
      request.preserveMeaning ?? true,
    );
  } catch (error) {
    console.error('API call failed, falling back to mock or throwing:', error);
    throw error;
  }
}

export function createWorkflowStages(): WorkflowStage[] {
  return WORKFLOW_STAGE_NAMES.map((name, idx) => ({
    id: `stage-${idx}`,
    name,
    description: WORKFLOW_STAGE_DESCRIPTIONS[idx],
    status: 'pending',
    order: idx,
  }));
}

/**
 * Animates the workflow stages one by one.
 * Calls `onUpdate` after each stage transition so the UI can re-render.
 */
export async function simulateWorkflow(
  stages: WorkflowStage[],
  needsRetry: boolean,
  onUpdate: (stages: WorkflowStage[]) => void,
  speedMs = 700,
): Promise<void> {
  const updated: WorkflowStage[] = stages.map((s) => ({ ...s, status: 'pending' }));
  onUpdate(updated.map((s) => ({ ...s })));

  for (let i = 0; i < updated.length; i++) {
    updated[i].status = 'running';
    onUpdate(updated.map((s) => ({ ...s })));
    await sleep(speedMs);

    if (i === 3 && needsRetry) {
      updated[i].status = 'retry_required';
      onUpdate(updated.map((s) => ({ ...s })));
      await sleep(speedMs);
      updated[i].status = 'running';
      onUpdate(updated.map((s) => ({ ...s })));
      await sleep(speedMs);
    }

    updated[i].status = 'completed';
    onUpdate(updated.map((s) => ({ ...s })));
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}