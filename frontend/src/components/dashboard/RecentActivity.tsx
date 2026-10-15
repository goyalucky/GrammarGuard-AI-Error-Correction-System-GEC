import { useNavigate } from 'react-router-dom';
import { Eye, FileText, SpellCheck2, GraduationCap } from 'lucide-react';
import type { ActivityRecord } from '@/types/correction';
import StatusBadge from '@/components/common/StatusBadge';

interface RecentActivityProps {
  records: ActivityRecord[];
}

const typeIcon = {
  correction: SpellCheck2,
  document_review: FileText,
  practice: GraduationCap,
};

export default function RecentActivity({ records }: RecentActivityProps) {
  const navigate = useNavigate();

  if (records.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
        <div className="mt-6 flex flex-col items-center justify-center py-8 text-center">
          <FileText className="h-8 w-8 text-gray-300" />
          <p className="mt-2 text-sm text-gray-400">No recent activity yet</p>
          <p className="text-xs text-gray-400">Start correcting to see activity here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
        <span className="text-xs text-gray-400">Demo data</span>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs font-medium uppercase tracking-wide text-gray-400">
              <th className="pb-2 pr-4 font-medium">Title</th>
              <th className="pb-2 px-4 font-medium">Date</th>
              <th className="pb-2 px-4 font-medium">Errors</th>
              <th className="pb-2 px-4 font-medium">Status</th>
              <th className="pb-2 pl-4 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => {
              const Icon = typeIcon[record.type];
              return (
                <tr
                  key={record.id}
                  className="border-b border-gray-50 transition-colors last:border-0 hover:bg-gray-50/50"
                >
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 shrink-0 text-gray-400" />
                      <span className="font-medium text-gray-800">{record.title}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-500">{record.date}</td>
                  <td className="py-3 px-4 text-gray-600">{record.errorsDetected}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={record.status} />
                  </td>
                  <td className="py-3 pl-4 text-right">
                    <button
                      onClick={() => navigate('/correction')}
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-50"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
