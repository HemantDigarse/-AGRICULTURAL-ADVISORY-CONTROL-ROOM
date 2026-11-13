import React from 'react';
import { Thermometer, Droplets, CloudRain, Wind } from 'lucide-react';

export default function WeatherCard({ weather }) {
  if (!weather) return null;

  const current = weather.current || weather;
  const items = [
    { label: 'Temperature', value: `${current.temperature_c ?? '--'}°C`, icon: Thermometer, color: 'text-orange-500' },
    { label: 'Humidity', value: `${current.humidity ?? '--'}%`, icon: Droplets, color: 'text-blue-500' },
    { label: 'Rainfall', value: `${current.rainfall_mm ?? '--'} mm`, icon: CloudRain, color: 'text-indigo-500' },
    { label: 'Wind', value: `${current.wind_speed_kmh ?? '--'} km/h`, icon: Wind, color: 'text-teal-500' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {items.map((item) => (
        <div key={item.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
          <item.icon className={`w-6 h-6 mx-auto mb-2 ${item.color}`} />
          <p className="text-lg font-bold text-gray-900">{item.value}</p>
          <p className="text-xs text-gray-500">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
