import { useEffect, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendingUp, Target, AlertCircle, BarChart3, Loader2, CheckCircle2 } from 'lucide-react';
import { fetchAnalyticsOverview, type AnalyticsOverview } from '@/services/analyticsService';
import { ERROR_CATEGORY_LABELS, mapBackendCategory } from '@/types/correction';
import StatusBadge from '@/components/common/StatusBadge';

const PIE_COLORS = ['#4f46e5', '#7c3aed', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444'];

export default function Analytics() {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsOverview()
      .then((res) => setData(res))
      .catch((err) => console.error('Failed to load analytics data:', err))
      .finally(() => setLoading(false));
  }, []);

  // Format category breakdown for PieChart and BarChart
  const categoryData = Object.entries(data?.category_breakdown || {}).map(([rawCat, count]) => {
    const normalized = mapBackendCategory(rawCat);
    return {
      categoryKey: normalized,
      label: ERROR_CATEGORY_LABELS[normalized] || rawCat,
      count,
    };
  });

  // Determine top error category
  const topCategory = categoryData.length > 0
    ? [...categoryData].sort((a, b) => b.count - a.count)[0]
    : null;

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-4 lg:p-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">My Writing Analytics</h2>
        <p className="mt-0.5 text-sm text-gray-500">
          Track your correction history, error patterns, and writing metrics from live backend sessions.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <TrendingUp className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium text-gray-500">Average Quality</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-emerald-600">
            {loading ? '...' : `${data?.overall_accuracy_rate ?? 100}%`}
          </p>
          <p className="text-xs text-gray-400">Mean confidence score across sessions</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Target className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium text-gray-500">Total Words Processed</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">
            {loading ? '...' : (data?.total_words_processed ?? 0).toLocaleString()}
          </p>
          <p className="text-xs text-gray-400">Across all single & document checks</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <AlertCircle className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium text-gray-500">Top Error Category</span>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-900">
            {loading ? '...' : (topCategory?.label || 'None')}
          </p>
          <p className="text-xs text-gray-400">
            {topCategory ? `${topCategory.count} total occurrences` : 'No errors logged yet'}
          </p>
        </div>
      </div>

      {/* Two-column: Error distribution Pie + Frequency Bar Chart */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">Error Category Distribution</h3>
          {loading ? (
            <div className="flex h-60 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            </div>
          ) : categoryData.length === 0 ? (
            <div className="flex h-60 flex-col items-center justify-center text-center text-gray-400">
              <AlertCircle className="h-8 w-8 mb-2 stroke-1" />
              <p className="text-sm">No error category data available yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="count"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  paddingAngle={3}
                >
                  {categoryData.map((_, idx) => (
                    <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-gray-900">Error Frequency Breakdown</h3>
          {loading ? (
            <div className="flex h-60 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            </div>
          ) : categoryData.length === 0 ? (
            <div className="flex h-60 flex-col items-center justify-center text-center text-gray-400">
              <BarChart3 className="h-8 w-8 mb-2 stroke-1" />
              <p className="text-sm">No errors recorded yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <YAxis
                  type="category"
                  dataKey="label"
                  tick={{ fontSize: 11, fill: '#6b7280' }}
                  width={130}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#4f46e5" radius={[0, 4, 4, 0]} name="Occurrences" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Writing Activity from SQLite DB */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900">Recent Writing Sessions</h3>
          </div>
          <span className="text-xs text-gray-400 font-mono">
            Total Sessions: {data?.total_sessions ?? 0}
          </span>
        </div>

        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
          </div>
        ) : (data?.recent_activities?.length ?? 0) === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400">No session history recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {data!.recent_activities.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/40 px-4 py-3 transition hover:bg-gray-50"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">{record.title}</p>
                  <p className="text-xs text-gray-400">{record.date} • {record.wordCount} words</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500">{record.errorsDetected} errors</span>
                  <StatusBadge status={record.status === 'completed' ? 'completed' : 'in_progress'} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Banner */}
      <div className="flex items-center gap-2 rounded-lg bg-emerald-50/70 border border-emerald-100 px-4 py-3 text-xs text-emerald-800">
        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
        Live database tracking active. Every correction executed updates your metrics.
      </div>
    </div>
  );
}