import React, { useState } from 'react';
import { Bug, ShieldAlert, Search, AlertTriangle, Leaf, Thermometer } from 'lucide-react';
import RiskBadge from '../components/RiskBadge';
import { getAlerts } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const DEMO_PESTS = [
  { name: 'Stem Borer', crop: 'Rice', severity: 'HIGH', symptoms: 'Dead hearts in vegetative stage, white ear heads in reproductive stage', management: 'Install pheromone traps. Apply Cartap Hydrochloride 4G @ 25kg/ha. Remove and destroy affected tillers.', conditions: 'High humidity > 80%, Temperature 25–30°C' },
  { name: 'Yellow Rust', crop: 'Wheat', severity: 'MEDIUM', symptoms: 'Yellow-orange pustules on leaves arranged in stripes parallel to leaf veins', management: 'Spray Propiconazole 25 EC @ 0.1%. Use resistant varieties (PBW 343, HD 2967).', conditions: 'Cool temperatures 10–15°C, high humidity, dew' },
  { name: 'American Bollworm', crop: 'Cotton', severity: 'CRITICAL', symptoms: 'Larvae bore into bolls, squares, and flowers. Excreta visible outside bore holes', management: 'Install 5 pheromone traps/ha. Apply Emamectin Benzoate 5SG @ 0.2g/L. Release Trichogramma cards.', conditions: 'Warm weather 25–35°C, monsoon to post-monsoon period' },
  { name: 'Blast Disease', crop: 'Rice', severity: 'HIGH', symptoms: 'Spindle-shaped spots with grey center on leaves. Neck blast causes panicle breakage', management: 'Spray Tricyclazole 75 WP @ 0.6g/L. Avoid excess nitrogen. Ensure proper spacing.', conditions: 'High humidity > 90%, temperature 20–25°C, long dew periods' },
  { name: 'Aphids', crop: 'Wheat/Mustard', severity: 'MEDIUM', symptoms: 'Colony of greenish-black insects on undersides of leaves. Honeydew secretion, sooty mold', management: 'Apply Imidacloprid 17.8 SL @ 0.5ml/L when ETL crossed (10–15 aphids/ear head). Encourage ladybird beetles.', conditions: 'Cool dry weather, temperature 15–22°C' },
  { name: 'Powdery Mildew', crop: 'Vegetables', severity: 'MEDIUM', symptoms: 'White powdery patches on leaves, stems, and fruits. Leaves curl and dry', management: 'Spray Sulfur 80 WP @ 3g/L or Karathane 48 EC @ 1ml/L. Remove severely infected plants.', conditions: 'Moderate temperature 20–25°C, low humidity, cloudy weather' },
];

export default function PestDisease() {
  const [searchId, setSearchId] = useState('');
  const [alerts, setAlerts] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterCrop, setFilterCrop] = useState('All');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getAlerts(searchId.trim());
      setAlerts(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const crops = ['All', ...new Set(DEMO_PESTS.map((p) => p.crop))];
  const filtered = filterCrop === 'All' ? DEMO_PESTS : DEMO_PESTS.filter((p) => p.crop === filterCrop);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
          <Bug className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Pest & Disease Analysis</h1>
          <p className="text-sm text-gray-500">Common threats and integrated pest management (IPM) guidance</p>
        </div>
      </div>

      {/* Search for specific advisory */}
      <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
        <input value={searchId} onChange={(e) => setSearchId(e.target.value)} placeholder="Enter Request ID for specific risk alerts" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" />
        <button type="submit" className="px-4 py-2 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800 transition-colors"><Search className="w-4 h-4" /></button>
      </form>

      {loading && <LoadingSpinner />}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* API risk alerts if fetched */}
      {alerts && alerts.status === 'available' && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <h3 className="text-sm font-bold text-red-800 mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Risk Alerts from Advisory</h3>
          {(alerts.risk_assessment?.alerts || []).filter(a => a.risk_type === 'pest' || a.risk_type === 'disease').map((a, i) => (
            <div key={i} className="mb-2 p-3 bg-white rounded-lg border border-red-100">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">{a.title}</span>
                <RiskBadge severity={a.severity} />
              </div>
              <p className="text-xs text-gray-500 mt-1">{a.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {crops.map((crop) => (
          <button key={crop} onClick={() => setFilterCrop(crop)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterCrop === crop ? 'bg-red-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {crop}
          </button>
        ))}
      </div>

      {/* Pest/disease cards */}
      <div className="space-y-4">
        {filtered.map((pest) => (
          <div key={pest.name} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900">{pest.name}</h3>
                <span className="text-xs text-gray-500">Affects: {pest.crop}</span>
              </div>
              <RiskBadge severity={pest.severity} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                <p className="font-semibold text-red-800 mb-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Symptoms</p>
                <p className="text-red-700 leading-relaxed">{pest.symptoms}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                <p className="font-semibold text-green-800 mb-1 flex items-center gap-1"><Leaf className="w-3 h-3" /> Management</p>
                <p className="text-green-700 leading-relaxed">{pest.management}</p>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                <p className="font-semibold text-amber-800 mb-1 flex items-center gap-1"><Thermometer className="w-3 h-3" /> Favorable Conditions</p>
                <p className="text-amber-700 leading-relaxed">{pest.conditions}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-gray-400 italic">* Pest data shown is demo reference. Generate an advisory for weather-based pest risk analysis.</p>
    </div>
  );
}
