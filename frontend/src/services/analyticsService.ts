// frontend/src/services/analyticsService.ts

export interface ActivityItem {
  id: string;
  title: string;
  date: string;
  errorsDetected: number;
  wordCount: number;
  status: string;
  type: 'correction' | 'document_review';
}

export interface AnalyticsOverview {
  total_sessions: number;
  total_words_processed: number;
  total_errors_detected: number;
  overall_accuracy_rate: number;
  category_breakdown: Record<string, number>;
  recent_activities: ActivityItem[];
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export async function fetchAnalyticsOverview(): Promise<AnalyticsOverview> {
  const response = await fetch(`${API_BASE_URL}/api/v1/analytics/overview`);
  if (!response.ok) {
    throw new Error(`Failed to fetch analytics: ${response.statusText}`);
  }
  return response.json();
}