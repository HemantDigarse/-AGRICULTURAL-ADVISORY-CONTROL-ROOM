import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Eye, ArrowRight } from 'lucide-react';
import AgentStatusBadge from '../components/AgentStatusBadge';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { getDashboardStats } from '../services/api';

export default function ReportsHistory() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="Loading reports..." />;

  const recentReqs = stats?.recent_requests || [];
  const overview = stats?.overview || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
            <ClipboardList className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Advisory Reports & History</h1>
            <p className="text-sm text-gray-500">View all past advisory requests and their results</p>
          </div>
        </div>
        <Link to="/advisory/new" className="inline-flex items-center gap-2 px-4 py-2 bg-green-700 text-white text-sm font-medium rounded-lg hover:bg-green-800 transition-colors shadow-sm">
          New Advisory <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: overview.total_requests || 0, color: 'text-green-700 bg-green-50 border-green-200' },
          { label: 'Completed', value: overview.completed || 0, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
          { label: 'Processing', value: overview.processing || 0, color: 'text-blue-700 bg-blue-50 border-blue-200' },
          { label: 'Failed', value: overview.failed || 0, color: 'text-red-700 bg-red-50 border-red-200' },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border p-4 ${s.color}`}>
            <p className="text-xs font-medium opacity-70">{s.label}</p>
            <p className="text-2xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Reports table */}
      {recentReqs.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-700">Advisory Reports</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-5 py-3 text-left">Request ID</th>
                  <th className="px-5 py-3 text-left">Crop</th>
                  <th className="px-5 py-3 text-left">Location</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Created</th>
                  <th className="px-5 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentReqs.map((r) => (
                  <tr key={r.request_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-green-700 font-medium">{r.request_id}</td>
                    <td className="px-5 py-3 font-medium text-gray-900">{r.crop}</td>
                    <td className="px-5 py-3 text-gray-500">{r.location}</td>
                    <td className="px-5 py-3"><AgentStatusBadge status={r.status} /></td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{r.created_at ? new Date(r.created_at).toLocaleString() : '--'}</td>
                    <td className="px-5 py-3">
                      <Link to={`/report/${r.request_id}`} className="inline-flex items-center gap-1 text-xs text-green-700 hover:text-green-800 font-medium">
                        <Eye className="w-3.5 h-3.5" /> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState title="No reports yet" message="Generate your first advisory to see it here." icon={ClipboardList} />
      )}
    </div>
  );
}
