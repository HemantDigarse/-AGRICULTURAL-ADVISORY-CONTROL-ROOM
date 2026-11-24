import React, { useState } from 'react';
import { Sprout, Search, Leaf, Droplets, Sun, ThermometerSun } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { getAdvisoryResult } from '../services/api';

const DEMO_CROP_DATA = {
  Wheat: {
    season: 'Rabi (Oct–Mar)',
    water: '450–650 mm',
    soil: 'Loamy, Clay Loam',
    temp: '20–25°C (ideal)',
    stages: ['Germination (5–7 days)', 'Tillering (25–30 days)', 'Flowering (60–65 days)', 'Grain Filling', 'Maturity (120–150 days)'],
    tips: ['Apply DAP 100 kg/ha as basal dose', 'CRI irrigation at 21 DAS is critical', 'Monitor for aphids and yellow rust'],
  },
  Rice: {
    season: 'Kharif (Jun–Nov)',
    water: '1200–1400 mm',
    soil: 'Clay, Clay Loam',
    temp: '25–30°C (ideal)',
    stages: ['Nursery (20–25 days)', 'Transplanting', 'Tillering (30 DAT)', 'Flowering', 'Grain Filling', 'Maturity (120–140 days)'],
    tips: ['Maintain 5cm standing water', 'Apply 40% N as basal + full P&K', 'Monitor for stem borer'],
  },
  Cotton: {
    season: 'Kharif (Apr–Dec)',
    water: '700–1200 mm',
    soil: 'Black Soil, Alluvial',
    temp: '21–30°C (ideal)',
    stages: ['Germination', 'Squaring (35–45 DAS)', 'Flowering (50–70 DAS)', 'Boll Formation', 'Boll Opening', 'Picking'],
    tips: ['Install pheromone traps for bollworm', 'Apply Neem oil for sucking pests', 'Avoid excess nitrogen'],
  },
};

export default function CropRecommendation() {
  const [searchId, setSearchId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCrop, setSelectedCrop] = useState('Wheat');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getAdvisoryResult(searchId.trim());
      setResult(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const cropInfo = DEMO_CROP_DATA[selectedCrop] || DEMO_CROP_DATA.Wheat;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
          <Sprout className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Crop Recommendation</h1>
          <p className="text-sm text-gray-500">Crop-specific guidance and growth stage recommendations</p>
        </div>
      </div>

      {/* Search for specific advisory crop data */}
      <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
        <input value={searchId} onChange={(e) => setSearchId(e.target.value)} placeholder="Enter Request ID for specific advisory" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" />
        <button type="submit" className="px-4 py-2 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800 transition-colors"><Search className="w-4 h-4" /></button>
      </form>

      {loading && <LoadingSpinner message="Loading crop data..." />}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Crop selector tabs */}
      <div className="flex gap-2 flex-wrap">
        {Object.keys(DEMO_CROP_DATA).map((crop) => (
          <button key={crop} onClick={() => setSelectedCrop(crop)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedCrop === crop ? 'bg-green-700 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
            {crop}
          </button>
        ))}
      </div>

      {/* Crop info cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm text-center">
          <Leaf className="w-6 h-6 text-green-600 mx-auto mb-2" />
          <p className="text-xs text-gray-500 mb-1">Season</p>
          <p className="text-sm font-bold text-gray-900">{cropInfo.season}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm text-center">
          <Droplets className="w-6 h-6 text-blue-500 mx-auto mb-2" />
          <p className="text-xs text-gray-500 mb-1">Water Need</p>
          <p className="text-sm font-bold text-gray-900">{cropInfo.water}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm text-center">
          <Sun className="w-6 h-6 text-amber-500 mx-auto mb-2" />
          <p className="text-xs text-gray-500 mb-1">Ideal Soil</p>
          <p className="text-sm font-bold text-gray-900">{cropInfo.soil}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm text-center">
          <ThermometerSun className="w-6 h-6 text-orange-500 mx-auto mb-2" />
          <p className="text-xs text-gray-500 mb-1">Temperature</p>
          <p className="text-sm font-bold text-gray-900">{cropInfo.temp}</p>
        </div>
      </div>

      {/* Growth stages */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-gray-700 mb-4">Growth Stages — {selectedCrop}</h3>
        <div className="flex flex-wrap items-center gap-2">
          {cropInfo.stages.map((stage, i) => (
            <React.Fragment key={i}>
              <div className="px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-xs font-medium text-green-800">{stage}</div>
              {i < cropInfo.stages.length - 1 && <span className="text-gray-300">→</span>}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Key tips */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-gray-700 mb-3">Key Recommendations</h3>
        <ul className="space-y-2">
          {cropInfo.tips.map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
              <span className="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>

      {/* API-fetched crop advisory result */}
      {result && result.status === 'completed' && result.detailed_advisory && (
        <div className="bg-green-50 rounded-xl border border-green-200 p-5">
          <h3 className="text-sm font-bold text-green-800 mb-2">AI-Generated Crop Advisory ({result.request_id})</h3>
          <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{result.detailed_advisory}</div>
        </div>
      )}

      <p className="text-[11px] text-gray-400 italic">* Crop data shown is demo reference data. Generate an advisory for personalized AI-powered recommendations.</p>
    </div>
  );
}
