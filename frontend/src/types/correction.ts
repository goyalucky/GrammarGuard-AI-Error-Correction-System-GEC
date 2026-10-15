export type CorrectionStyle = 'grammar_only' | 'grammar_clarity' | 'professional';

export type Severity = 'low' | 'medium' | 'high';

export type ErrorCategory =
  | 'subject_verb_agreement'
  | 'verb_tense'
  | 'articles'
  | 'prepositions'
  | 'punctuation'
  | 'word_order';

export type WorkflowStageStatus = 'pending' | 'running' | 'completed' | 'retry_required';

export interface GrammarError {
  id: string;
  originalText: string;
  correctedText: string;
  category: ErrorCategory;
  explanation: string;
  severity: Severity;
  startIndex: number;
  endIndex: number;
  // RAG Retrieved Context
  ruleTitle?: string;
  pedagogicalTip?: string;
  examples?: {
    incorrect: string;
    correct: string;
  };
}

export interface CorrectionResult {
  id: string;
  originalText: string;
  correctedText: string;
  errors: GrammarError[];
  errorCount: number;
  qualityScore: number;
  style: CorrectionStyle;
  preserveMeaning: boolean;
  timestamp: string;
  isMock: boolean;
  needsRetry: boolean;
  verificationStatus?: string;
}

export interface WorkflowStage {
  id: string;
  name: string;
  description: string;
  status: WorkflowStageStatus;
  order: number;
}

export interface CorrectionRequest {
  text: string;
  style?: CorrectionStyle;
  preserveMeaning?: boolean;
  language?: string;
  context_type?: string;
}

export interface ActivityRecord {
  id: string;
  title: string;
  date: string;
  errorsDetected: number;
  status: 'completed' | 'in_progress' | 'failed';
  type: 'correction' | 'document_review' | 'practice';
}

export interface AppPreferences {
  defaultCorrectionStyle: CorrectionStyle;
  preserveOriginalMeaning: boolean;
  highlightCorrections: boolean;
  workflowAnimation: boolean;
}

export const DEFAULT_PREFERENCES: AppPreferences = {
  defaultCorrectionStyle: 'grammar_only',
  preserveOriginalMeaning: true,
  highlightCorrections: true,
  workflowAnimation: true,
};

export const ERROR_CATEGORY_LABELS: Record<ErrorCategory, string> = {
  subject_verb_agreement: 'Subject–Verb Agreement',
  verb_tense: 'Verb Tense',
  articles: 'Articles',
  prepositions: 'Prepositions',
  punctuation: 'Punctuation',
  word_order: 'Word Order',
};

export const SEVERITY_LABELS: Record<Severity, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export const CORRECTION_STYLE_LABELS: Record<CorrectionStyle, string> = {
  grammar_only: 'Grammar Only',
  grammar_clarity: 'Grammar & Clarity',
  professional: 'Professional Writing',
};

export const WORKFLOW_STAGE_NAMES = [
  'Input Analysis Agent',
  'Grammar Detection Agent',
  'Correction Agent',
  'Verification Agent',
  'LangGraph Decision Router',
  'Final Output',
] as const;

export const WORKFLOW_STAGE_DESCRIPTIONS: string[] = [
  'Parses and tokenizes the input text',
  'Identifies grammar errors using detection rules',
  'Applies corrections to detected errors',
  'Verifies that corrections preserve meaning',
  'Routes corrections through the LangGraph decision flow',
  'Assembles the final corrected output',
];

// ==========================================
// BACKEND API CONTRACT SCHEMAS & ADAPTERS
// ==========================================

export interface BackendErrorDetail {
  original_span: string;
  corrected_span: string;
  start_idx: number;
  end_idx: number;
  category: string;
  explanation: string;
  rule_title?: string;
  pedagogical_tip?: string;
  examples?: {
    incorrect: string;
    correct: string;
  };
}

export interface BackendCorrectionResponse {
  original_text: string;
  corrected_text: string;
  error_count: number;
  categories: string[];
  confidence_score: number;
  verification_status: string;
  errors: BackendErrorDetail[];
}

/**
 * Normalizes backend categories into the frontend ErrorCategory union.
 */
export function mapBackendCategory(categoryStr: string): ErrorCategory {
  const norm = categoryStr.toLowerCase().replace(/[\s–-]+/g, '_');
  if (norm.includes('subject') || norm.includes('sva')) return 'subject_verb_agreement';
  if (norm.includes('tense') || norm.includes('verb')) return 'verb_tense';
  if (norm.includes('article')) return 'articles';
  if (norm.includes('preposition')) return 'prepositions';
  if (norm.includes('punct')) return 'punctuation';
  return 'word_order';
}

/**
 * Transforms FastAPI's JSON response into the frontend CorrectionResult state.
 */
export function mapBackendToFrontendResult(
  backendData: BackendCorrectionResponse,
  style: CorrectionStyle = 'grammar_only',
  preserveMeaning: boolean = true
): CorrectionResult {
  const mappedErrors: GrammarError[] = backendData.errors.map((err, index) => ({
    id: `err-${Date.now()}-${index}`,
    originalText: err.original_span,
    correctedText: err.corrected_span,
    category: mapBackendCategory(err.category),
    explanation: err.explanation,
    severity: 'medium',
    startIndex: err.start_idx,
    endIndex: err.end_idx,
    ruleTitle: err.rule_title,
    pedagogicalTip: err.pedagogical_tip,
    examples: err.examples,
  }));

  return {
    id: `res-${Date.now()}`,
    originalText: backendData.original_text,
    correctedText: backendData.corrected_text,
    errors: mappedErrors,
    errorCount: backendData.error_count,
    qualityScore: Math.round(backendData.confidence_score * 100),
    style,
    preserveMeaning,
    timestamp: new Date().toISOString(),
    isMock: false,
    needsRetry: false,
    verificationStatus: backendData.verification_status,
  };
}