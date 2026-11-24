import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { CloudSun, Search, MapPin, RefreshCw, Droplets, Wind, Thermometer, CloudRain } from 'lucide-react';
import WeatherCard from '../components/WeatherCard';
import RiskBadge from '../components/RiskBadge';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { getCurrentWeather, getWeatherReport } from '../services/api';

export default function WeatherIntelligence() {
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [requestId, setRequestId] = useState('');
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadWeather = async (fetchWeather) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchWeather();
      setWeather(res.data.weather || res.data);
    } catch (err) {
      setError(err.message);
      setWeather(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSearch = (e) => {
    e.preventDefault();
    if (!city.trim()) return;
    setRequestId('');
    loadWeather(() => getCurrentWeather(city.trim(), state.trim()));
  };

  const handleRequestSearch = (e) => {
    e.preventDefault();
    if (!requestId.trim()) return;
    loadWeather(() => getWeatherReport(requestId.trim()));
  };

  const current = weather?.current || {};
  const forecast = weather?.forecast || [];
  const barData = [
    { name: 'Temp (°C)', value: current.temperature_c ?? 0 },
    { name: 'Humidity (%)', value: current.humidity ?? 0 },
    { name: 'Rain (mm)', value: current.rainfall_mm ?? 0 },
    { name: 'Wind (km/h)', value: current.wind_speed_kmh ?? 0 },
  ];
  const formattedTime = current.fetched_at
    ? new Date(current.fetched_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <CloudSun className="w-6 h-6 text-green-700" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Weather Intelligence</h1>
          <p className="text-sm text-gray-500">Live local conditions and a five-day forecast for your farm</p>
        </div>
      </div>

      <form onSubmit={handleLocationSearch} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-700"><MapPin className="w-4 h-4 text-green-700" /> Search by location</div>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2">
          <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City or district (e.g. Ludhiana)" required className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
          <input value={state} onChange={(e) => setState(e.target.value)} placeholder="State (optional)" className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
          <button type="submit" disabled={loading} className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800 disabled:opacity-60">
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />} Get live weather
          </button>
        </div>
      </form>

      {loading && <LoadingSpinner message="Fetching live weather data..." />}
      {error && <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">{error}</p>}

      {!weather && !loading && !error && (
        <EmptyState title="Search for your location" message="Enter a city or district to see current weather, farm conditions and the five-day forecast." icon={CloudSun} />
      )}

      {weather && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-sky-700 via-blue-700 to-indigo-800 rounded-2xl p-6 md:p-8 text-white shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div>
                <div className="flex items-center gap-2 text-blue-100 text-sm"><MapPin className="w-4 h-4" />{current.city}{current.state ? `, ${current.state}` : ''}</div>
                <div className="flex items-end gap-3 mt-2">
                  <span className="text-6xl font-light tracking-tight">{current.temperature_c ?? '--'}°</span>
                  <div className="pb-2"><p className="text-lg font-semibold">{current.condition || 'Current conditions'}</p><p className="text-sm text-blue-100">Feels like local conditions</p></div>
                </div>
                {formattedTime && <p className="text-xs text-blue-200 mt-3">Updated {formattedTime} · {weather.source === 'open-meteo' ? 'Live data' : weather.source || 'Weather data'}</p>}
              </div>
              <CloudSun className="w-20 h-20 text-amber-200 self-center sm:mr-6" strokeWidth={1.25} />
              <div className="grid grid-cols-2 gap-x-5 gap-y-4 text-sm">
                <div className="flex items-center gap-2"><Droplets className="w-4 h-4 text-blue-200" /><span><b>{current.humidity ?? '--'}%</b><small className="block text-blue-200">Humidity</small></span></div>
                <div className="flex items-center gap-2"><Wind className="w-4 h-4 text-blue-200" /><span><b>{current.wind_speed_kmh ?? '--'} km/h</b><small className="block text-blue-200">Wind</small></span></div>
                <div className="flex items-center gap-2"><CloudRain className="w-4 h-4 text-blue-200" /><span><b>{current.rainfall_mm ?? '--'} mm</b><small className="block text-blue-200">Rainfall</small></span></div>
                <div className="flex items-center gap-2"><Thermometer className="w-4 h-4 text-blue-200" /><span><b>{current.temperature_c ?? '--'}°C</b><small className="block text-blue-200">Temperature</small></span></div>
              </div>
            </div>
          </div>

          {weather.risk_level && <div className="flex items-center gap-2 text-sm text-gray-600">Agricultural weather risk <RiskBadge severity={weather.risk_level} /></div>}
          <WeatherCard weather={weather} />

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Weather Metrics</h3>
            <ResponsiveContainer width="100%" height={240}><BarChart data={barData}><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="value" fill="#22c55e" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>
          </div>

          {forecast.length > 0 && <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">5-Day Forecast</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">{forecast.map((day) => <div key={day.date} className="text-center p-4 rounded-lg bg-gray-50 border border-gray-100"><p className="text-xs font-medium text-gray-500 mb-2">{new Date(`${day.date}T00:00:00`).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</p><CloudSun className="w-7 h-7 mx-auto mb-2 text-amber-500" /><p className="text-lg font-bold text-gray-900">{day.temperature_c ?? '--'}°C</p><p className="text-xs text-gray-500">{day.condition}</p><p className="text-xs text-blue-600 mt-2">{day.rainfall_mm ?? 0} mm rain</p></div>)}</div>
          </div>}

          {weather.historical_summary && <p className="text-xs text-gray-400 text-right">Historical context: previous 14 days · {weather.historical_summary.total_rainfall_mm} mm total rainfall</p>}
        </div>
      )}

      <details className="bg-white rounded-xl border border-gray-200 p-4">
        <summary className="cursor-pointer text-sm font-medium text-gray-600">Look up weather from an advisory request</summary>
        <form onSubmit={handleRequestSearch} className="flex gap-2 max-w-md mt-3">
          <input value={requestId} onChange={(e) => setRequestId(e.target.value)} placeholder="Request ID (e.g. ADV-20261111-001)" className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" />
          <button type="submit" disabled={loading} className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-60"><Search className="w-4 h-4" /></button>
        </form>
      </details>
    </div>
  );
}
