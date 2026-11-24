import React from 'react';
import { Droplets, CloudRain, Timer, Gauge, Sprout } from 'lucide-react';

const IRRIGATION_METHODS = [
  { name: 'Drip Irrigation', efficiency: '90–95%', water: 'Low', cost: 'High (₹60–80K/ha)', subsidy: '55% under PMKSY', best: 'Orchards, Vegetables, Cotton', desc: 'Water delivered directly to root zone through emitters.' },
  { name: 'Sprinkler Irrigation', efficiency: '75–85%', water: 'Medium', cost: 'Medium (₹30–50K/ha)', subsidy: '55% under PMKSY', best: 'Wheat, Pulses, Groundnut', desc: 'Water sprayed in the air, falls like rain over the crop.' },
  { name: 'Flood / Surface Irrigation', efficiency: '40–50%', water: 'Very High', cost: 'Low', subsidy: 'N/A', best: 'Rice, Sugarcane', desc: 'Traditional method — water flows over the field surface.' },
  { name: 'Alternate Wetting & Drying (AWD)', efficiency: '70–80%', water: 'Medium', cost: 'Low', subsidy: 'N/A', best: 'Rice (Paddy)', desc: 'Saves 20–30% water in rice by alternating wet/dry periods.' },
];

const CROP_WATER = [
  { crop: 'Rice', need: '1200–1400 mm', critical: 'Flowering, Panicle Initiation', frequency: '5cm standing water continuous' },
  { crop: 'Wheat', need: '450–650 mm', critical: 'CRI (21 DAS), Flowering', frequency: '4–6 irrigations total' },
  { crop: 'Cotton', need: '700–1200 mm', critical: 'Flowering, Boll Formation', frequency: 'Every 7–10 days' },
  { crop: 'Sugarcane', need: '1500–2000 mm', critical: 'Tillering, Grand Growth', frequency: 'Every 10–15 days' },
  { crop: 'Maize', need: '500–800 mm', critical: 'Tasseling, Silking', frequency: '5–8 irrigations' },
];

export default function IrrigationAdvisory() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
          <Droplets className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Irrigation Advisory</h1>
          <p className="text-sm text-gray-500">Water management and irrigation method recommendations</p>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Droplets, label: 'Water Efficiency', value: 'Per Drop More Crop', color: 'text-blue-600 bg-blue-100' },
          { icon: Gauge, label: 'PMKSY Subsidy', value: 'Up to 55%', color: 'text-green-600 bg-green-100' },
          { icon: CloudRain, label: 'Avg Rainfall', value: '1180 mm/year', color: 'text-sky-600 bg-sky-100' },
          { icon: Timer, label: 'Critical Timing', value: 'Stage-specific', color: 'text-orange-600 bg-orange-100' },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${m.color} mb-2`}>
              <m.icon className="w-4.5 h-4.5" />
            </div>
            <p className="text-xs text-gray-500">{m.label}</p>
            <p className="text-sm font-bold text-gray-900">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Irrigation methods */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-700">Irrigation Methods Comparison</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-5 py-3 text-left">Method</th>
                <th className="px-5 py-3 text-left">Efficiency</th>
                <th className="px-5 py-3 text-left">Water Use</th>
                <th className="px-5 py-3 text-left">Cost</th>
                <th className="px-5 py-3 text-left">Subsidy</th>
                <th className="px-5 py-3 text-left">Best For</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {IRRIGATION_METHODS.map((m) => (
                <tr key={m.name} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium text-gray-900">{m.name}</td>
                  <td className="px-5 py-3"><span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full font-medium">{m.efficiency}</span></td>
                  <td className="px-5 py-3 text-gray-500">{m.water}</td>
                  <td className="px-5 py-3 text-gray-500">{m.cost}</td>
                  <td className="px-5 py-3 text-gray-500">{m.subsidy}</td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{m.best}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Crop water requirements */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-gray-700 mb-4">Crop Water Requirements</h3>
        <div className="space-y-3">
          {CROP_WATER.map((c) => (
            <div key={c.crop} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 border border-gray-100">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Sprout className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900">{c.crop}</p>
                <p className="text-xs text-gray-500">Water: {c.need} | Frequency: {c.frequency}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Critical Stage</p>
                <p className="text-xs font-medium text-orange-600">{c.critical}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="text-[11px] text-gray-400 italic">* This is demo reference data. Generate an advisory for weather-adjusted, location-specific irrigation advice.</p>
    </div>
  );
}
