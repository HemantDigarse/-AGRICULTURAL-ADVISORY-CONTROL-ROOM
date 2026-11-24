import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip,
} from 'recharts';
import { FileText, Bot, CheckCircle, ShieldAlert, ArrowRight } from 'lucide-react';
import StatCard from '../components/StatCard';
import AgentStatusBadge from '../components/AgentStatusBadge';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { getDashboardStats } from '../services/api';

const PIE_COLORS = ['#22c55e', '#eab308', '#f97316', '#ef4444'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then((res) => setStats(res.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;

  const overview = stats?.overview || {};
  const riskDist = stats?.risk_distribution || {};
  const recentReqs = stats?.recent_requests || [];
  const agentPerf = stats?.agent_performance || {};

  const pieData = Object.entries(riskDist)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  // Fake area chart data for visual appeal when empty
  const areaData = recentReqs.length
    ? recentReqs.map((r, i) => ({ name: `#${i + 1}`, value: 1 }))
    : [{ name: 'Today', value: 0 }];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link
          to="/advisory/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-700 text-white text-sm font-medium rounded-lg hover:bg-green-800 transition-colors shadow-sm"
        >
          New Advisory <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Advisories" value={overview.total_requests ?? 0} icon={FileText} color="green" />
        <StatCard title="Active Agents" value={Object.keys(agentPerf).length || 7} icon={Bot} color="blue" />
        <StatCard
          title="Completed"
          value={overview.completed ?? 0}
          icon={CheckCircle}
          color="emerald"
          subtitle={overview.success_rate ? `${overview.success_rate}% success` : undefined}
        />
        <StatCard title="Risk Alerts" value={riskDist.HIGH + riskDist.CRITICAL || 0} icon={ShieldAlert} color="red" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Area chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Advisory Activity</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={areaData}>
              <defs>
                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="#22c55e" fill="url(#colorVal)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Risk Distribution</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-sm text-gray-400">
              No risk data yet
            </div>
          )}
          <div className="flex justify-center gap-4 mt-2">
            {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((s, i) => (
              <span key={s} className="flex items-center gap-1 text-xs text-gray-500">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Recent requests table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700">Recent Requests</h3>
        </div>
        {recentReqs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-5 py-3 text-left">Request ID</th>
                  <th className="px-5 py-3 text-left">Crop</th>
                  <th className="px-5 py-3 text-left">Location</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentReqs.map((r) => (
                  <tr key={r.request_id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-mono text-xs text-green-700">{r.request_id}</td>
                    <td className="px-5 py-3 font-medium">{r.crop}</td>
                    <td className="px-5 py-3 text-gray-500">{r.location}</td>
                    <td className="px-5 py-3"><AgentStatusBadge status={r.status} /></td>
                    <td className="px-5 py-3 text-gray-400 text-xs">
                      {r.created_at ? new Date(r.created_at).toLocaleString() : '--'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No advisories yet" message="Generate your first advisory to see it here." />
        )}
      </div>
    </div>
  );
}
