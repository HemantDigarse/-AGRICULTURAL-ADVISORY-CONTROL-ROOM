import React from 'react';
import { Workflow, ArrowRight, CheckCircle, Loader2, Clock, AlertTriangle } from 'lucide-react';

const PIPELINE_STAGES = [
  {
    id: 'intake',
    name: 'Intake Agent',
    desc: 'Validates farmer input, normalizes crop/location data, generates request ID',
    phase: 1,
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 'weather',
    name: 'Weather Agent',
    desc: 'Fetches real-time weather data, computes agricultural risk score',
    phase: 2,
    color: 'from-sky-500 to-cyan-600',
  },
  {
    id: 'market',
    name: 'Market Agent',
    desc: 'Retrieves mandi prices, compares with MSP, generates SELL/HOLD',
    phase: 2,
    color: 'from-purple-500 to-purple-600',
  },
  {
    id: 'scheme',
    name: 'Scheme Agent',
    desc: 'Matches farmer profile to relevant government schemes via RAG',
    phase: 2,
    color: 'from-amber-500 to-amber-600',
  },
  {
    id: 'crop',
    name: 'Crop Advisory Agent',
    desc: 'Generates crop+stage+weather specific recommendations',
    phase: 3,
    color: 'from-green-500 to-emerald-600',
  },
  {
    id: 'risk',
    name: 'Risk Alert Agent',
    desc: 'Evaluates weather/pest/market threats, assigns severity',
    phase: 3,
    color: 'from-red-500 to-rose-600',
  },
  {
    id: 'coordinator',
    name: 'Coordinator Agent',
    desc: 'Reads entire blackboard, generates consolidated farmer-friendly advisory',
    phase: 4,
    color: 'from-emerald-600 to-green-700',
  },
];

const PhaseLabel = ({ phase }) => {
  const labels = {
    1: { text: 'Phase 1 — Input Validation', sub: 'Sequential' },
    2: { text: 'Phase 2 — Data Collection', sub: 'Parallel Execution' },
    3: { text: 'Phase 3 — Analysis', sub: 'After Weather Data' },
    4: { text: 'Phase 4 — Consolidation', sub: 'All Agents Complete' },
  };
  const l = labels[phase];
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-xs font-bold">
        {phase}
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-800">{l.text}</p>
        <p className="text-[11px] text-gray-400">{l.sub}</p>
      </div>
    </div>
  );
};

export default function AgentWorkflow() {
  const phases = [1, 2, 3, 4];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
          <Workflow className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Agent Workflow Visualization</h1>
          <p className="text-sm text-gray-500">How the orchestrator delegates tasks to specialized agents</p>
        </div>
      </div>

      {/* Pipeline overview */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">Pipeline Architecture</h2>
        <div className="flex items-center justify-between gap-2 mb-6 flex-wrap">
          {['Farmer Input', 'Intake', 'Parallel Agents', 'Analysis', 'Coordinator', 'Final Advisory'].map((step, i) => (
            <React.Fragment key={step}>
              <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                <span className="w-5 h-5 rounded-full bg-green-600 text-white text-[10px] flex items-center justify-center font-bold">{i + 1}</span>
                <span className="text-xs font-medium text-green-800 whitespace-nowrap">{step}</span>
              </div>
              {i < 5 && <ArrowRight className="w-4 h-4 text-gray-300 flex-shrink-0" />}
            </React.Fragment>
          ))}
        </div>

        {/* Phases */}
        <div className="space-y-6">
          {phases.map((phase) => (
            <div key={phase}>
              <PhaseLabel phase={phase} />
              <div className={`grid gap-3 ${phase === 2 ? 'grid-cols-1 md:grid-cols-3' : phase === 3 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                {PIPELINE_STAGES.filter((s) => s.phase === phase).map((stage) => (
                  <div
                    key={stage.id}
                    className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-4 hover:shadow-md transition-all duration-200"
                  >
                    <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${stage.color}`} />
                    <div className="pl-3">
                      <h4 className="text-sm font-bold text-gray-900">{stage.name}</h4>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{stage.desc}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3" /> Idle
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {phase < 4 && (
                <div className="flex justify-center my-3">
                  <ArrowRight className="w-5 h-5 text-gray-300 rotate-90" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Blackboard concept */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-lg">
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Shared Blackboard Architecture
        </h3>
        <p className="text-sm text-gray-300 leading-relaxed mb-4">
          All agents read from and write to a shared in-memory Blackboard — a thread-safe, per-request
          state store. Each agent publishes its results to named sections (weather_data, market_data, etc.)
          and the Coordinator reads the complete state to generate the final consolidated advisory.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['farmer_info', 'weather_data', 'market_data', 'crop_advisory', 'scheme_data', 'risk_assessment', 'final_advisory', 'agent_statuses'].map((section) => (
            <div key={section} className="px-3 py-2 bg-white/10 rounded-lg text-xs font-mono text-green-300">
              {section}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
