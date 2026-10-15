/**
 * Central configuration for the GrammarGuard AI API.
 *
 * In Phase 1, the application uses local mock implementations only.
 * In Phase 2, set VITE_USE_MOCK_API=false (or leave it false by default)
 * to route calls to the FastAPI + GEC engine backend.
 *
 * Do NOT hardcode secrets in this file.
 */

const FALLBACK_URL = 'http://localhost:8000/api/v1';

export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ?? FALLBACK_URL;

export const API_ENDPOINTS = {
  correct: `${API_BASE_URL}/correct`,
  verify: `${API_BASE_URL}/verify`,
  documentReview: `${API_BASE_URL}/documents/review`,
  health: `${API_BASE_URL}/health`,
} as const;

// Set to false to use the live FastAPI backend in Phase 2
export const USE_MOCK_API: boolean =
  import.meta.env.VITE_USE_MOCK_API === 'true' ? true : false;