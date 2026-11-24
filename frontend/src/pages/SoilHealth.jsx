import React from 'react';
import { FlaskConical, TestTubes, Layers, Sprout } from 'lucide-react';

const DEMO_SOIL_PROFILES = [
  { region: 'Punjab', type: 'Alluvial', ph: '7.0–8.5', nitrogen: 'Medium', phosphorus: 'Low–Medium', potassium: 'High', organic: '0.4–0.6%', recommendation: 'Apply DAP + Urea. Add FYM 10 t/ha for organic matter.' },
  { region: 'Maharashtra', type: 'Black Cotton (Vertisol)', ph: '7.5–8.5', nitrogen: 'Low', phosphorus: 'Medium', potassium: 'High', organic: '0.3–0.5%', recommendation: 'Apply SSP for phosphorus. Green manuring recommended.' },
  { region: 'Karnataka', type: 'Red Laterite', ph: '5.5–6.5', nitrogen: 'Low', phosphorus: 'Low', potassium: 'Medium', organic: '0.2–0.4%', recommendation: 'Apply lime to correct acidity. Enrich with compost and vermicompost.' },
  { region: 'Rajasthan', type: 'Sandy/Arid', ph: '8.0–9.0', nitrogen: 'Very Low', phosphorus: 'Low', potassium: 'Medium', organic: '0.1–0.3%', recommendation: 'Heavy organic matter application. Gypsum for alkaline soils. Mulching essential.' },
];

export default function SoilHealth() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
          <FlaskConical className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Soil Health Analysis</h1>
          <p className="text-sm text-gray-500">Regional soil profiles and nutrient recommendations</p>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <TestTubes className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-800">Demo Reference Data</p>
          <p className="text-xs text-amber-700 mt-0.5">Soil data below is representative of typical Indian soil profiles. For actual soil analysis, integrate with the Soil Health Card Scheme API or upload lab test results.</p>
        </div>
      </div>

      {/* Soil NPK legend */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Nitrogen (N)', desc: 'Leaf growth & greening', color: 'bg-green-100 text-green-700', icon: Sprout },
          { label: 'Phosphorus (P)', desc: 'Root development & flowering', color: 'bg-blue-100 text-blue-700', icon: Layers },
          { label: 'Potassium (K)', desc: 'Disease resistance & quality', color: 'bg-purple-100 text-purple-700', icon: FlaskConical },
          { label: 'Organic Carbon', desc: 'Soil structure & water retention', color: 'bg-amber-100 text-amber-700', icon: TestTubes },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${item.color} mb-2`}>
              <item.icon className="w-4.5 h-4.5" />
            </div>
            <p className="text-sm font-bold text-gray-900">{item.label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
          </div>
        ))}
      </div>

      {/* Regional soil profiles */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Regional Soil Profiles</h2>
        {DEMO_SOIL_PROFILES.map((soil) => (
          <div key={soil.region} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-gray-900">{soil.region}</h3>
                <span className="text-xs text-gray-500">{soil.type}</span>
              </div>
              <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">pH {soil.ph}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              <div className="text-center p-2 rounded-lg bg-green-50 border border-green-100">
                <p className="text-[11px] text-gray-500">Nitrogen</p>
                <p className="text-xs font-bold text-gray-800">{soil.nitrogen}</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-blue-50 border border-blue-100">
                <p className="text-[11px] text-gray-500">Phosphorus</p>
                <p className="text-xs font-bold text-gray-800">{soil.phosphorus}</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-purple-50 border border-purple-100">
                <p className="text-[11px] text-gray-500">Potassium</p>
                <p className="text-xs font-bold text-gray-800">{soil.potassium}</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-amber-50 border border-amber-100">
                <p className="text-[11px] text-gray-500">Organic C</p>
                <p className="text-xs font-bold text-gray-800">{soil.organic}</p>
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-3 border border-green-100">
              <p className="text-xs font-semibold text-green-800 mb-0.5">Recommendation</p>
              <p className="text-xs text-green-700 leading-relaxed">{soil.recommendation}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-gray-400 italic">* This is demo reference data. In production, soil analysis would be based on uploaded lab reports or Soil Health Card API data.</p>
    </div>
  );
}
