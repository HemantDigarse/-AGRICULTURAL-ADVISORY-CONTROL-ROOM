import React, { useEffect, useState } from 'react';
import {
  ClipboardCheck, CloudSun, Leaf, TrendingUp, Landmark, ShieldAlert, Users, Bot,
  Zap, ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import AgentStatusBadge from '../components/AgentStatusBadge';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { getDashboardStats } from '../services/api';

const AGENTS = [
  { key: 'intake', name: 'Intake Agent', desc: 'Validates farmer input and generates request ID', icon: ClipboardCheck, gradient: 'from-blue-500 to-indigo-600', bg: 'bg-blue-50' },
  { key: 'weather', name: 'Weather Agent', desc: 'Fetches weather data and assesses risk levels', icon: CloudSun, gradient: 'from-sky-500 to-cyan-600', bg: 'bg-sky-50' },
  { key: 'crop', name: 'Crop Advisory Agent', desc: 'Generates crop-specific growth recommendations', icon: Leaf, gradient: 'from-green-500 to-emerald-600', bg: 'bg-green-50' },
  { key: 'market', name: 'Market Intelligence', desc: 'Fetches mandi prices and SELL/HOLD advice', icon: TrendingUp, gradient: 'from-purple-500 to-violet-600', bg: 'bg-purple-50' },
  { key: 'scheme', name: 'Govt Scheme Agent', desc: 'Matches relevant government welfare schemes', icon: Landmark, gradient: 'from-amber-500 to-orange-600', bg: 'bg-amber-50' },
  { key: 'risk', name: 'Risk Alert Agent', desc: 'Evaluates weather, pest, and market threats', icon: ShieldAlert, gradient: 'from-red-500 to-rose-600', bg: 'bg-red-50' },
  { key: 'coordinator', name: 'Coordinator Agent', desc: 'Consolidates all outputs into final advisory', icon: Users, gradient: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50' },
];

export default function AgentControlRoom() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="Loading agent data..." />;

  const agentPerf = stats?.agent_performance || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-gradient-to-br from-green-700 to-emerald-600 rounded-xl shadow-lg shadow-green-700/20">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">AI Agent Control Room</h1>
            <p className="text-sm text-gray-500 mt-0.5">Monitor and manage your specialized AI agricultural agents</p>
          </div>
        </div>
        <Link
          to="/agents/workflow"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-700 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-green-700/20 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] self-start"
        >
          <Zap className="w-4 h-4" />
          View Workflow
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Agent stats overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in stagger-1">
        <div className="bg-white rounded-xl border border-gray-200/60 p-4 shadow-sm">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Total Agents</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-1">7</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200/60 p-4 shadow-sm">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Active</p>
          <p className="text-3xl font-extrabold text-green-600 mt-1">{Object.keys(agentPerf).length || 7}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200/60 p-4 shadow-sm">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Total Runs</p>
          <p className="text-3xl font-extrabold text-blue-600 mt-1">
            {Object.values(agentPerf).reduce((acc, v) => acc + (v.total_runs || 0), 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200/60 p-4 shadow-sm">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Success Rate</p>
          <p className="text-3xl font-extrabold text-emerald-600 mt-1">
            {Object.keys(agentPerf).length > 0
              ? Math.round(
                  (Object.values(agentPerf).reduce((acc, v) => acc + (v.completed || 0), 0) /
                    Math.max(Object.values(agentPerf).reduce((acc, v) => acc + (v.total_runs || 0), 0), 1)) *
                    100
                )
              : 0}
            %
          </p>
        </div>
      </div>

      {/* Agent cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {AGENTS.map((agent, i) => {
          const perf = agentPerf[agent.key] || {};
          const totalRuns = perf.total_runs || 0;
          const completed = perf.completed || 0;
          const failed = perf.failed || 0;
          const successRate = totalRuns > 0 ? Math.round((completed / totalRuns) * 100) : 0;

          return (
            <div
              key={agent.key}
              className="group relative bg-white rounded-2xl border border-gray-200/60 p-5 shadow-sm card-hover-glow overflow-hidden animate-fade-in"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              {/* Hover glow effect */}
              <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${agent.gradient} opacity-0 group-hover:opacity-[0.06] blur-2xl transition-opacity duration-500`} />

              <div className="relative">
                {/* Agent icon + name */}
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br ${agent.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <agent.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 truncate">{agent.name}</h3>
                    {perf.running > 0 ? (
                      <AgentStatusBadge status="running" />
                    ) : totalRuns > 0 ? (
                      <span className="text-[11px] text-green-600 font-medium">Online</span>
                    ) : (
                      <span className="text-[11px] text-gray-400 font-medium">Idle</span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-gray-500 mb-4 leading-relaxed">{agent.desc}</p>

                {/* Stats */}
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400 font-medium">Total Runs</span>
                    <span className="text-xs font-bold text-gray-700">{totalRuns}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400 font-medium">Completed</span>
                    <span className="text-xs font-bold text-green-600">{completed}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400 font-medium">Failed</span>
                    <span className="text-xs font-bold text-red-600">{failed}</span>
                  </div>

                  {/* Progress bar */}
                  <div className="pt-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Success Rate</span>
                      <span className="text-[10px] font-bold text-gray-600">{successRate}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${agent.gradient} animate-progress`}
                        style={{ width: `${successRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {Object.keys(agentPerf).length === 0 && (
        <EmptyState
          title="No agent activity yet"
          message="Generate an advisory request to see agent performance data here."
          icon={Bot}
        />
      )}
    </div>
  );
}
