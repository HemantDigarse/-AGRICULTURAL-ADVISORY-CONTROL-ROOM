import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, CheckCircle, Loader2, XCircle } from 'lucide-react';
import { createAdvisory, getAgentStatuses, getAdvisoryResult } from '../services/api';
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
  { key: 'intake', name: 'Intake Agent', desc: 'Validates input' },
  { key: 'weather', name: 'Weather Agent', desc: 'Fetches weather data' },
  { key: 'crop', name: 'Crop Advisory Agent', desc: 'Crop recommendations' },
  { key: 'market', name: 'Market Agent', desc: 'Market intelligence' },
  { key: 'scheme', name: 'Scheme Agent', desc: 'Government schemes' },
  { key: 'risk', name: 'Risk Alert Agent', desc: 'Risk assessment' },
  { key: 'coordinator', name: 'Coordinator Agent', desc: 'Final consolidation' },
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

      // Poll agent statuses
      const poll = setInterval(async () => {
        try {
          const agRes = await getAgentStatuses(rid);
          const agents = {};
          (agRes.data.agents || []).forEach((a) => { agents[a.agent_name] = a; });
          setPolledAgents(agents);

          // Check if coordinator is done
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

      // Safety timeout
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Generate Advisory</h1>

      {error && <AlertBanner variant="error" title="Error" message={error} onClose={() => setError(null)} />}

      {/* Form */}
      {!requestId && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Farmer Name</label>
              <input
                name="farmer_name"
                value={form.farmer_name}
                onChange={handleChange}
                placeholder="Optional"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Crop *</label>
              <select
                name="crop"
                value={form.crop}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              >
                {CROPS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
              <select
                name="state"
                value={form.state}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              >
                {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
              <input
                name="district"
                value={form.district}
                onChange={handleChange}
                placeholder="e.g. Ludhiana"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="e.g. Ludhiana"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Growth Stage *</label>
              <select
                name="growth_stage"
                value={form.growth_stage}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              >
                {GROWTH_STAGES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Farm Size (acres)</label>
              <input
                name="farm_size"
                type="number"
                step="0.1"
                min="0"
                value={form.farm_size}
                onChange={handleChange}
                placeholder="Optional"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-700 text-white text-sm font-medium rounded-lg hover:bg-green-800 transition-colors disabled:opacity-50 shadow-sm"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Generate Advisory
          </button>
        </form>
      )}

      {/* Agent execution panel */}
      {requestId && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Agent Pipeline</h2>
              <p className="text-sm text-gray-500">Request: <span className="font-mono text-green-700">{requestId}</span></p>
            </div>
            {done && (
              <button
                onClick={() => navigate(`/report/${requestId}`)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-700 text-white text-sm font-medium rounded-lg hover:bg-green-800 transition-colors"
              >
                <CheckCircle className="w-4 h-4" /> View Full Advisory
              </button>
            )}
          </div>

          <div className="space-y-2">
            {AGENT_LIST.map((agent) => {
              const st = mergedAgents[agent.key];
              const status = st?.status || 'pending';
              return (
                <div
                  key={agent.key}
                  className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-green-700 text-xs font-bold">
                    {agent.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{agent.name}</p>
                    <p className="text-xs text-gray-400">{agent.desc}</p>
                  </div>
                  <AgentStatusBadge status={status} />
                </div>
              );
            })}
          </div>

          {done && (
            <AlertBanner variant="success" title="Advisory Complete" message="All agents have finished. Click 'View Full Advisory' to see the consolidated report." />
          )}
        </div>
      )}
    </div>
  );
}
