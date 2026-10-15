import { BackendErrorDetail } from '@/types/correction';

export interface DocumentReviewResponse {
  filename: string;
  original_text: string;
  corrected_text: string;
  error_count: number;
  sentence_count: number;
  categories: string[];
  errors: BackendErrorDetail[];
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export async function uploadAndReviewDocument(
  file: File,
  contextType: string = 'general'
): Promise<DocumentReviewResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('context_type', contextType);

  const response = await fetch(`${API_BASE_URL}/api/v1/documents/review`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Upload failed with status ${response.status}`);
  }

  return response.json();
}