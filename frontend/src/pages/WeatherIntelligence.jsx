import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { CloudSun, Search } from 'lucide-react';
import WeatherCard from '../components/WeatherCard';
import RiskBadge from '../components/RiskBadge';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { getWeatherReport } from '../services/api';

export default function WeatherIntelligence() {
  const [requestId, setRequestId] = useState('');
  const [searchId, setSearchId] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getWeatherReport(searchId.trim());
      setWeather(res.data);
      setRequestId(searchId.trim());
    } catch (err) {
      setError(err.message);
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  const weatherData = weather?.weather || {};
  const current = weatherData.current || {};
  const forecast = weatherData.forecast || [];
  const riskLevel = weatherData.risk_level || 'LOW';

  const barData = [
    { name: 'Temp (°C)', value: current.temperature_c || 0 },
    { name: 'Humidity (%)', value: current.humidity || 0 },
    { name: 'Rain (mm)', value: current.rainfall_mm || 0 },
    { name: 'Wind (km/h)', value: current.wind_speed_kmh || 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <CloudSun className="w-6 h-6 text-green-700" />
        <h1 className="text-2xl font-bold text-gray-900">Weather Intelligence</h1>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
        <input
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          placeholder="Enter Request ID (e.g. ADV-20261111-001)"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800 transition-colors"
        >
          <Search className="w-4 h-4" />
        </button>
      </form>

      {loading && <LoadingSpinner message="Fetching weather data..." />}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {weather && weather.status === 'available' ? (
        <div className="space-y-6">
          {/* Condition banner */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200 p-5 flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-gray-900">{current.condition || 'N/A'}</p>
              <p className="text-sm text-gray-500">
                {current.city}, {current.state}
              </p>
            </div>
            <RiskBadge severity={riskLevel} />
          </div>

          {/* Weather cards */}
          <WeatherCard weather={weatherData} />

          {/* Bar chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Weather Metrics</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Forecast */}
          {forecast.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">5-Day Forecast</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {forecast.map((day, i) => (
                  <div key={i} className="text-center p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <p className="text-xs font-medium text-gray-500 mb-1">{day.date}</p>
                    <p className="text-lg font-bold text-gray-900">{day.temperature_c}°C</p>
                    <p className="text-xs text-gray-500">{day.condition}</p>
                    <p className="text-xs text-blue-500 mt-1">{day.rainfall_mm} mm</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        !loading && !error && (
          <EmptyState
            title="Enter a Request ID"
            message="Search by advisory request ID to view weather data."
            icon={CloudSun}
          />
        )
      )}
    </div>
  );
}

