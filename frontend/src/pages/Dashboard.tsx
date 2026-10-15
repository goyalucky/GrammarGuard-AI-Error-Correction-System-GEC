import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  SpellCheck2,
  GraduationCap,
  FileText,
  PenLine,
  AlertCircle,
  CheckCircle2,
  Clock,
  Gauge,
  Loader2,
} from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import RecentActivity from '@/components/dashboard/RecentActivity';
import { fetchAnalyticsOverview, type AnalyticsOverview } from '@/services/analyticsService';
import type { ActivityRecord } from '@/types/correction';

export default function Dashboard() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsOverview()
      .then((data) => setAnalytics(data))
      .catch((err) => console.error('Failed to load dashboard metrics:', err))
      .finally(() => setLoading(false));
  }, []);

  const quickActions = [
    {
      label: 'Correct a sentence',
      description: 'Paste text and run the correction pipeline',
      icon: SpellCheck2,
      onClick: () => navigate('/correction'),
    },
    {
      label: 'Review a document',
      description: 'Upload and analyze a .txt, .docx, or .pdf file',
      icon: FileText,
      onClick: () => navigate('/documents'),
    },
    {
      label: 'Practice grammar',
      description: 'Take an interactive grammar quiz',
      icon: GraduationCap,
      onClick: () => navigate('/learning'),
    },
  ];

  // Map backend activity logs to frontend RecentActivity expected format
  const mappedActivities: ActivityRecord[] = (analytics?.recent_activities || []).map((item) => ({
    id: item.id,
    title: item.title,
    date: item.date,
    errorsDetected: item.errorsDetected,
    status: item.status === 'completed' ? 'completed' : 'in_progress',
    type: item.type === 'document_review' ? 'document_review' : 'correction',
  }));

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 lg:p-6">
      {/* Welcome banner */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm lg:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl">
            <div className="mb-2 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                <PenLine className="h-3 w-3" />
                Multi-Agent Grammar Intelligence
              </span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 lg:text-3xl">
              Write Better. Communicate Smarter.
            </h2>
            <p className="mt-2 text-sm text-gray-500 lg:text-base">
              GrammarGuard AI pairs sequence-to-sequence neural correction with Qdrant vector retrieval
              to explain grammar rules with pedagogical accuracy.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/correction')}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
              >
                <SpellCheck2 className="h-4 w-4" />
                Start Correcting
              </button>
              <button
                onClick={() => navigate('/documents')}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                <FileText className="h-4 w-4" />
                Review Document
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Stats Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Corrections"
          value={loading ? '...' : analytics?.total_sessions ?? 0}
          icon={SpellCheck2}
          isDemo={false}
        />
        <StatCard
          label="Grammar Errors Detected"
          value={loading ? '...' : analytics?.total_errors_detected ?? 0}
          icon={AlertCircle}
          isDemo={false}
        />
        <StatCard
          label="Words Processed"
          value={loading ? '...' : analytics?.total_words_processed ?? 0}
          icon={Clock}
          isDemo={false}
        />
        <StatCard
          label="Average Accuracy Score"
          value={loading ? '...' : `${analytics?.overall_accuracy_rate ?? 100}%`}
          icon={Gauge}
          isDemo={false}
        />
      </div>

      {/* Quick actions */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-900">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={action.onClick}
                className="group flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm transition-all hover:border-indigo-200 hover:shadow-md"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-100">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{action.label}</p>
                  <p className="mt-0.5 text-xs text-gray-500">{action.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Recent Activity */}
      {loading ? (
        <div className="flex h-36 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
        </div>
      ) : (
        <RecentActivity records={mappedActivities} />
      )}

      {/* System Status Footnote */}
      <div className="flex items-center gap-2 rounded-lg bg-emerald-50/70 border border-emerald-100 px-4 py-3 text-xs text-emerald-800">
        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
        Live SQLite persistence active. Metrics update automatically with each correction and document session.
      </div>
    </div>
  );
}