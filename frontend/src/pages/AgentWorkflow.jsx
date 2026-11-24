import React from 'react';
import { Workflow, ArrowRight, ArrowDown, Clock, Zap, Database, Shield } from 'lucide-react';

const PIPELINE_STAGES = [
  { id: 'intake', name: 'Intake Agent', desc: 'Validates farmer input, normalizes crop/location data, generates request ID', phase: 1, color: 'from-blue-500 to-indigo-600' },
  { id: 'weather', name: 'Weather Agent', desc: 'Fetches real-time weather data, computes agricultural risk score', phase: 2, color: 'from-sky-500 to-cyan-600' },
  { id: 'market', name: 'Market Agent', desc: 'Retrieves mandi prices, compares with MSP, generates SELL/HOLD', phase: 2, color: 'from-purple-500 to-violet-600' },
  { id: 'scheme', name: 'Scheme Agent', desc: 'Matches farmer profile to relevant government schemes via RAG', phase: 2, color: 'from-amber-500 to-orange-600' },
  { id: 'crop', name: 'Crop Advisory Agent', desc: 'Generates crop+stage+weather specific recommendations', phase: 3, color: 'from-green-500 to-emerald-600' },
  { id: 'risk', name: 'Risk Alert Agent', desc: 'Evaluates weather/pest/market threats, assigns severity', phase: 3, color: 'from-red-500 to-rose-600' },
  { id: 'coordinator', name: 'Coordinator Agent', desc: 'Reads entire blackboard, generates consolidated farmer-friendly advisory', phase: 4, color: 'from-emerald-600 to-teal-700' },
];

const PhaseLabel = ({ phase }) => {
  const labels = {
    1: { text: 'Phase 1 — Input Validation', sub: 'Sequential', icon: '🔍' },
    2: { text: 'Phase 2 — Data Collection', sub: 'Parallel Execution (asyncio.gather)', icon: '⚡' },
    3: { text: 'Phase 3 — Analysis', sub: 'After Weather Data Arrives', icon: '🧠' },
    4: { text: 'Phase 4 — Consolidation', sub: 'All Agents Complete', icon: '✅' },
  };
  const l = labels[phase];
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center text-white text-sm font-bold shadow-sm">
        {phase}
      </div>
      <div>
        <p className="text-sm font-bold text-gray-800">{l.text} {l.icon}</p>
        <p className="text-[11px] text-gray-400 font-medium">{l.sub}</p>
      </div>
    </div>
  );
};

export default function AgentWorkflow() {
  const phases = [1, 2, 3, 4];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-4 animate-fade-in">
        <div className="p-3 bg-gradient-to-br from-green-700 to-emerald-600 rounded-xl shadow-lg shadow-green-700/20">
          <Workflow className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Agent Workflow Visualization</h1>
          <p className="text-sm text-gray-500 mt-0.5">How the orchestrator delegates tasks to specialized agents</p>
        </div>
      </div>

      {/* Pipeline Overview Banner */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200/60 p-5 animate-fade-in stagger-1">
        <h2 className="text-xs font-bold text-green-800 mb-4 uppercase tracking-wider flex items-center gap-2">
          <Zap className="w-3.5 h-3.5" /> Pipeline Architecture
        </h2>
        <div className="flex items-center justify-between gap-1 md:gap-2 overflow-x-auto pb-1">
          {['Farmer Input', 'Intake', 'Parallel Agents', 'Analysis', 'Coordinator', 'Final Advisory'].map((step, i) => (
            <React.Fragment key={step}>
              <div className="flex items-center gap-1.5 px-2.5 md:px-3 py-2 bg-white border border-green-200 rounded-xl shadow-sm animate-fade-in min-w-fit" style={{ animationDelay: `${i * 0.1}s` }}>
                <span className="w-5 h-5 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white text-[10px] flex items-center justify-center font-bold shadow-sm">{i + 1}</span>
                <span className="text-xs font-semibold text-green-800 whitespace-nowrap">{step}</span>
              </div>
              {i < 5 && <ArrowRight className="w-4 h-4 text-green-400 flex-shrink-0 animate-pulse" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Phases */}
      <div className="bg-white rounded-2xl border border-gray-200/60 p-6 md:p-8 shadow-sm animate-fade-in stagger-2">
        <div className="space-y-8">
          {phases.map((phase, pIdx) => (
            <div key={phase} className="animate-fade-in" style={{ animationDelay: `${pIdx * 0.15}s` }}>
              <PhaseLabel phase={phase} />
              <div className={`grid gap-3 ${phase === 2 ? 'grid-cols-1 md:grid-cols-3' : phase === 3 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                {PIPELINE_STAGES.filter((s) => s.phase === phase).map((stage, sIdx) => (
                  <div
                    key={stage.id}
                    className="group relative overflow-hidden rounded-xl border border-gray-200/60 bg-white p-5 card-hover-glow animate-fade-in"
                    style={{ animationDelay: `${sIdx * 0.08}s` }}
                  >
                    {/* Left accent bar */}
                    <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${stage.color} group-hover:w-1.5 transition-all duration-300`} />
                    
                    {/* Hover glow */}
                    <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${stage.color} opacity-0 group-hover:opacity-[0.06] blur-2xl transition-opacity duration-500`} />

                    <div className="pl-3 relative">
                      <h4 className="text-sm font-bold text-gray-900">{stage.name}</h4>
                      <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{stage.desc}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">
                          <Clock className="w-3 h-3" /> Idle
                        </span>
                        {phase === 2 && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-500 bg-blue-50 px-2.5 py-1 rounded-full">
                            <Zap className="w-3 h-3" /> Async
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {phase < 4 && (
                <div className="flex justify-center my-4">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-px h-4 bg-gradient-to-b from-gray-200 to-gray-300" />
                    <ArrowDown className="w-4 h-4 text-gray-300" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Blackboard concept */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 md:p-8 text-white shadow-xl animate-fade-in stagger-5">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-green-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl" />

        <div className="relative">
          <h3 className="text-sm font-bold mb-2 flex items-center gap-2">
            <Database className="w-4 h-4 text-green-400" />
            <span className="relative flex h-2 w-2 mr-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
            </span>
            Shared Blackboard Architecture
          </h3>
          <p className="text-sm text-gray-400 leading-relaxed mb-5 max-w-2xl">
            All agents read from and write to a shared in-memory Blackboard — a thread-safe, per-request
            state store. Each agent publishes its results to named sections and the Coordinator reads the
            complete state to generate the final consolidated advisory.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { key: 'farmer_info', label: '👤 Farmer Info' },
              { key: 'weather_data', label: '🌤 Weather' },
              { key: 'market_data', label: '📊 Market' },
              { key: 'crop_advisory', label: '🌱 Crop Advisory' },
              { key: 'scheme_data', label: '🏛 Schemes' },
              { key: 'risk_assessment', label: '⚠ Risk Assessment' },
              { key: 'final_advisory', label: '📋 Final Advisory' },
              { key: 'agent_statuses', label: '🤖 Agent Status' },
            ].map((section, i) => (
              <div
                key={section.key}
                className="glass px-3 py-2.5 rounded-xl animate-fade-in hover:bg-white/15 transition-colors duration-200 cursor-default"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <p className="text-[11px] text-gray-400 mb-0.5">{section.label}</p>
                <p className="text-xs font-mono text-green-300">{section.key}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Security note */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200/60 rounded-xl animate-fade-in stagger-7">
        <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-blue-800">Thread-Safe Design</p>
          <p className="text-sm text-blue-700 mt-0.5">
            Each request gets its own isolated Blackboard with asyncio.Lock for safe concurrent agent writes. 
            Server-Sent Events (SSE) provide real-time agent status updates to the frontend.
          </p>
        </div>
      </div>
    </div>
  );
}
