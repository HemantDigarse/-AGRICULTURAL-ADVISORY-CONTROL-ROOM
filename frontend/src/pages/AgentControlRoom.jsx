import React, { useEffect, useState } from 'react';
import {
  ClipboardCheck, CloudSun, Leaf, TrendingUp, Landmark, ShieldAlert, Users, Bot,
} from 'lucide-react';
import AgentStatusBadge from '../components/AgentStatusBadge';
import EmptyState from '../components/EmptyState';
import { getDashboardStats } from '../services/api';

const AGENTS = [
  { key: 'intake', name: 'Intake Agent', desc: 'Validates farmer input and generates request ID', icon: ClipboardCheck, color: 'bg-blue-100 text-blue-600' },
  { key: 'weather', name: 'Weather Agent', desc: 'Fetches weather data and assesses risk', icon: CloudSun, color: 'bg-sky-100 text-sky-600' },
  { key: 'crop', name: 'Crop Advisory Agent', desc: 'Generates crop-specific recommendations', icon: Leaf, color: 'bg-green-100 text-green-600' },
  { key: 'market', name: 'Market Intelligence Agent', desc: 'Fetches mandi prices and SELL/HOLD advice', icon: TrendingUp, color: 'bg-purple-100 text-purple-600' },
  { key: 'scheme', name: 'Govt Scheme Agent', desc: 'Matches relevant government schemes', icon: Landmark, color: 'bg-amber-100 text-amber-600' },
  { key: 'risk', name: 'Risk Alert Agent', desc: 'Evaluates weather, pest, and market risks', icon: ShieldAlert, color: 'bg-red-100 text-red-600' },
  { key: 'coordinator', name: 'Coordinator Agent', desc: 'Consolidates all outputs into final advisory', icon: Users, color: 'bg-emerald-100 text-emerald-600' },
];

export default function AgentControlRoom() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getDashboardStats()
      .then((res) => setStats(res.data))
      .catch(() => {});
  }, []);

  const agentPerf = stats?.agent_performance || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Bot className="w-6 h-6 text-green-700" />
        <h1 className="text-2xl font-bold text-gray-900">Agent Control Room</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {AGENTS.map((agent) => {
          const perf = agentPerf[agent.key] || {};
          return (
            <div
              key={agent.key}
              className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${agent.color}`}>
                  <agent.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{agent.name}</h3>
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-4">{agent.desc}</p>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Runs</span>
                  <span className="font-medium text-gray-700">{perf.total_runs || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Completed</span>
                  <span className="font-medium text-green-600">{perf.completed || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Failed</span>
                  <span className="font-medium text-red-600">{perf.failed || 0}</span>
                </div>
                {perf.running > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Status</span>
                    <AgentStatusBadge status="running" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {Object.keys(agentPerf).length === 0 && (
        <EmptyState
          title="No agent activity yet"
          message="Generate an advisory request to see agent performance data."
          icon={Bot}
        />
      )}
    </div>
  );
}

