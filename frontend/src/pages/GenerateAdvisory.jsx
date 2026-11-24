import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send, CheckCircle, Loader2, XCircle, Sprout, MapPin, Layers, User, Maximize,
  ClipboardCheck, CloudSun, Leaf, TrendingUp, Landmark, ShieldAlert, Users,
} from 'lucide-react';
import { createAdvisory, getAgentStatuses } from '../services/api';
import useAdvisoryStream from '../hooks/useAdvisoryStream';
import AgentStatusBadge from '../components/AgentStatusBadge';
import AlertBanner from '../components/AlertBanner';

const CROPS = ['Wheat', 'Rice', 'Cotton', 'Sugarcane', 'Maize', 'Soybean', 'Mustard', 'Groundnut', 'Tomato', 'Onion', 'Potato'];
const INDIAN_STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
  'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan',
  'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];
const GROWTH_STAGES = ['Germination', 'Seedling', 'Vegetative', 'Flowering', 'Fruiting', 'Maturity', 'Harvest'];

const AGENT_LIST = [
  { key: 'intake', name: 'Intake Agent', desc: 'Validates input', icon: ClipboardCheck, gradient: 'from-blue-500 to-indigo-600' },
  { key: 'weather', name: 'Weather Agent', desc: 'Fetches weather data', icon: CloudSun, gradient: 'from-sky-500 to-cyan-600' },
  { key: 'crop', name: 'Crop Advisory', desc: 'Crop recommendations', icon: Leaf, gradient: 'from-green-500 to-emerald-600' },
  { key: 'market', name: 'Market Agent', desc: 'Market intelligence', icon: TrendingUp, gradient: 'from-purple-500 to-violet-600' },
  { key: 'scheme', name: 'Scheme Agent', desc: 'Government schemes', icon: Landmark, gradient: 'from-amber-500 to-orange-600' },
  { key: 'risk', name: 'Risk Alert', desc: 'Risk assessment', icon: ShieldAlert, gradient: 'from-red-500 to-rose-600' },
  { key: 'coordinator', name: 'Coordinator', desc: 'Final consolidation', icon: Users, gradient: 'from-emerald-500 to-teal-600' },
];

export default function GenerateAdvisory() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    crop: 'Wheat',
    state: 'Punjab',
    district: '',
    city: '',
    growth_stage: 'Vegetative',
    farmer_name: '',
    farm_size: '',
  });
  const [requestId, setRequestId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [polledAgents, setPolledAgents] = useState({});
  const [done, setDone] = useState(false);

  const { agentStatuses, isComplete, error: streamError } = useAdvisoryStream(requestId);
  const pollingTimerRef = useRef(null);

  useEffect(() => () => {
    if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);
  }, []);

  useEffect(() => {
    if (isComplete) setDone(true);
  }, [isComplete]);

  useEffect(() => {
    if (streamError) setError(streamError);
  }, [streamError]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setRequestId(null);
    setPolledAgents({});
    setDone(false);
    if (pollingTimerRef.current) clearInterval(pollingTimerRef.current);

    try {
      const payload = {
        crop: form.crop,
        location: {
          city: form.city || form.district || 'Unknown',
          district: form.district || '',
          state: form.state,
        },
        growth_stage: form.growth_stage,
        farmer_name: form.farmer_name || undefined,
        farm_size: form.farm_size ? parseFloat(form.farm_size) : undefined,
      };

      const res = await createAdvisory(payload);
      const rid = res.data.request_id;
      setRequestId(rid);

      const poll = setInterval(async () => {
        try {
          const agRes = await getAgentStatuses(rid);
          const agents = {};
          (agRes.data.agents || []).forEach((a) => { agents[a.agent_name] = a; });
          setPolledAgents(agents);

          if (agents.coordinator?.status === 'completed') {
            clearInterval(poll);
            pollingTimerRef.current = null;
            setDone(true);
          }
        } catch (err) {
          // Ignore polling errors
        }
      }, 1500);
      pollingTimerRef.current = poll;

      setTimeout(() => {
        clearInterval(poll);
        if (pollingTimerRef.current === poll) pollingTimerRef.current = null;
      }, 120000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const mergedAgents = { ...polledAgents };
  Object.entries(agentStatuses).forEach(([name, data]) => {
    mergedAgents[name] = { ...mergedAgents[name], agent_name: name, status: data.status };
  });

  // Count completed agents for progress
  const completedCount = AGENT_LIST.filter(a => {
    const st = mergedAgents[a.key];
    return st?.status === 'completed';
  }).length;
  const progressPct = requestId ? Math.round((completedCount / AGENT_LIST.length) * 100) : 0;

  const inputClass = "w-full px-4 py-3 border border-gray-200 bg-gray-50/50 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:bg-white outline-none transition-all duration-200";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4 animate-fade-in">
        <div className="p-3 bg-gradient-to-br from-green-700 to-emerald-600 rounded-xl shadow-lg shadow-green-700/20">
          <Sprout className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Generate Advisory</h1>
          <p className="text-sm text-gray-500 mt-0.5">Fill in crop and location details to receive AI-powered agricultural advice</p>
        </div>
      </div>

      {error && <AlertBanner variant="error" title="Error" message={error} onClose={() => setError(null)} />}

      {/* Form */}
      {!requestId && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200/60 p-6 md:p-8 shadow-sm space-y-6 animate-fade-in stagger-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="animate-fade-in stagger-1">
              <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
                <User className="w-3.5 h-3.5 text-gray-400" />
                Farmer Name
              </label>
              <input
                name="farmer_name"
                value={form.farmer_name}
                onChange={handleChange}
                placeholder="Optional"
                className={inputClass}
              />
            </div>
            <div className="animate-fade-in stagger-2">
              <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
                <Sprout className="w-3.5 h-3.5 text-green-500" />
                Crop *
              </label>
              <select name="crop" value={form.crop} onChange={handleChange} className={inputClass}>
                {CROPS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="animate-fade-in stagger-3">
              <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
                <MapPin className="w-3.5 h-3.5 text-red-400" />
                State *
              </label>
              <select name="state" value={form.state} onChange={handleChange} className={inputClass}>
                {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="animate-fade-in stagger-4">
              <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
                <MapPin className="w-3.5 h-3.5 text-orange-400" />
                District
              </label>
              <input name="district" value={form.district} onChange={handleChange} placeholder="e.g. Ludhiana" className={inputClass} />
            </div>
            <div className="animate-fade-in stagger-5">
              <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                City *
              </label>
              <input name="city" value={form.city} onChange={handleChange} placeholder="e.g. Ludhiana" className={inputClass} required />
            </div>
            <div className="animate-fade-in stagger-6">
              <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                Growth Stage *
              </label>
              <select name="growth_stage" value={form.growth_stage} onChange={handleChange} className={inputClass}>
                {GROWTH_STAGES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="animate-fade-in stagger-7">
              <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 mb-2">
                <Maximize className="w-3.5 h-3.5 text-teal-400" />
                Farm Size (acres)
              </label>
              <input name="farm_size" type="number" step="0.1" min="0" value={form.farm_size} onChange={handleChange} placeholder="Optional" className={inputClass} />
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2.5 px-7 py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white text-sm font-bold rounded-xl hover:shadow-lg hover:shadow-green-700/25 transition-all duration-200 disabled:opacity-50 hover:-translate-y-0.5 active:scale-[0.98]"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Generate Advisory
          </button>
        </form>
      )}

      {/* Agent execution panel */}
      {requestId && (
        <div className="bg-white rounded-2xl border border-gray-200/60 p-6 md:p-8 shadow-sm space-y-5 animate-fade-in-scale">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Agent Pipeline</h2>
              <p className="text-sm text-gray-500">
                Request: <span className="font-mono text-green-700 font-semibold">{requestId}</span>
              </p>
            </div>
            {done && (
              <button
                onClick={() => navigate(`/report/${requestId}`)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-700 text-white text-sm font-bold rounded-xl hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] animate-success-pop"
              >
                <CheckCircle className="w-4 h-4" /> View Full Advisory
              </button>
            )}
          </div>

          {/* Overall progress */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-500 font-medium">Overall Progress</span>
              <span className="text-xs font-bold text-gray-700">{progressPct}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-700 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Agent rows */}
          <div className="space-y-2">
            {AGENT_LIST.map((agent, i) => {
              const st = mergedAgents[agent.key];
              const status = st?.status || 'pending';
              const isCompleted = status === 'completed';
              const isRunning = status === 'running' || status === 'processing';

              return (
                <div
                  key={agent.key}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 animate-fade-in ${
                    isCompleted
                      ? 'border-green-200/60 bg-green-50/30'
                      : isRunning
                      ? 'border-blue-200/60 bg-blue-50/20 animate-border-glow'
                      : 'border-gray-100 hover:bg-gray-50/50'
                  }`}
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${agent.gradient} shadow-sm ${isRunning ? 'animate-pulse-scale' : ''}`}>
                    <agent.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{agent.name}</p>
                    <p className="text-xs text-gray-400">{agent.desc}</p>
                  </div>
                  <AgentStatusBadge status={status} />
                </div>
              );
            })}
          </div>

          {done && (
            <AlertBanner variant="success" title="Advisory Complete" message="All agents have finished processing. Click 'View Full Advisory' to see the consolidated report." />
          )}
        </div>
      )}
    </div>
  );
}
