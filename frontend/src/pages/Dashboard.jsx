import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip,
} from 'recharts';
import {
  CloudSun, FileText, Bot, CheckCircle, ShieldAlert, ArrowRight, Sparkles,
  Activity, TrendingUp, MapPin, RefreshCw,
} from 'lucide-react';
import StatCard from '../components/StatCard';
import AgentStatusBadge from '../components/AgentStatusBadge';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import WeatherCard from '../components/WeatherCard';
import { getCurrentWeather, getDashboardStats } from '../services/api';

const PIE_COLORS = ['#22c55e', '#eab308', '#f97316', '#ef4444'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState(null);
  const [location, setLocation] = useState({ city: 'Pune', state: 'Maharashtra' });

  const loadWeather = async (city = location.city, state = location.state) => {
    setWeatherLoading(true);
    setWeatherError(null);
    try {
      const response = await getCurrentWeather(city, state);
      setWeather(response.data);
    } catch (error) {
      setWeather(null);
      setWeatherError(error.message);
    } finally {
      setWeatherLoading(false);
    }
  };

  useEffect(() => {
    getDashboardStats()
      .then((res) => setStats(res.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
    loadWeather();
  }, []);

  if (loading) return <LoadingSpinner message="Loading dashboard..." />;

  const overview = stats?.overview || {};
  const riskDist = stats?.risk_distribution || {};
  const recentReqs = stats?.recent_requests || [];
  const agentPerf = stats?.agent_performance || {};

  const pieData = Object.entries(riskDist)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  const areaData = recentReqs.length
    ? recentReqs.map((r, i) => ({ name: `#${i + 1}`, value: 1 }))
    : [{ name: 'Today', value: 0 }];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-green-700 via-green-600 to-emerald-600 rounded-2xl p-6 md:p-8 shadow-lg animate-fade-in">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-white/5 rounded-full translate-y-1/2" />
        <div className="absolute top-4 right-8 text-white/10">
          <Sparkles className="w-20 h-20 animate-float-slow" />
        </div>
        
        <div className="relative">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                Welcome Back! 👋
              </h1>
              <p className="text-green-100/80 mt-1.5 text-sm md:text-base max-w-lg">
                Monitor your agricultural advisory operations, track AI agent performance, and generate real-time farming insights.
              </p>
            </div>
            <Link
              to="/advisory/new"
              className="inline-flex items-center gap-2 px-5 py-3 bg-white text-green-700 text-sm font-bold rounded-xl hover:bg-green-50 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98] self-start"
            >
              <FileText className="w-4 h-4" />
              New Advisory
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Advisories', value: overview.total_requests ?? 0, icon: FileText, color: 'green' },
          { title: 'Active Agents', value: Object.keys(agentPerf).length || 7, icon: Bot, color: 'blue' },
          {
            title: 'Completed',
            value: overview.completed ?? 0,
            icon: CheckCircle,
            color: 'emerald',
            subtitle: overview.success_rate ? `${overview.success_rate}% success rate` : undefined,
          },
          { title: 'Risk Alerts', value: (riskDist.HIGH || 0) + (riskDist.CRITICAL || 0), icon: ShieldAlert, color: 'red' },
        ].map((card, i) => (
          <div key={card.title} className="animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
            <StatCard {...card} />
          </div>
        ))}
      </div>

      {/* Live weather */}
      <section className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white p-5 shadow-sm">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-sky-100 p-2 text-sky-700">
              <CloudSun className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-800">Live Weather</h2>
              <p className="text-xs text-gray-500">
                Current conditions, 5-day forecast, and historical trends
              </p>
            </div>
          </div>
          <form
            className="flex flex-col gap-2 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              loadWeather();
            }}
          >
            <label className="flex min-w-0 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
              <MapPin className="h-4 w-4 shrink-0 text-sky-600" />
              <input
                value={location.city}
                onChange={(event) => setLocation((current) => ({ ...current, city: event.target.value }))}
                required
                aria-label="City"
                className="min-w-0 bg-transparent text-sm outline-none"
                placeholder="City"
              />
            </label>
            <input
              value={location.state}
              onChange={(event) => setLocation((current) => ({ ...current, state: event.target.value }))}
              aria-label="State"
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500"
              placeholder="State"
            />
            <button
              type="submit"
              disabled={weatherLoading}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-sky-800 disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${weatherLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </form>
        </div>

        {weatherLoading ? (
          <div className="py-8 text-center text-sm text-gray-500">Fetching live weather...</div>
        ) : weatherError ? (
          <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{weatherError}</p>
        ) : (
          <>
            <p className="mb-4 text-sm font-medium text-gray-700">
              {weather?.current?.city}, {weather?.current?.state || location.state} · {weather?.current?.condition}
            </p>
            <WeatherCard weather={weather} />
            {weather?.historical_summary && (
              <p className="mt-4 text-xs text-gray-600">
                Previous {weather.historical_summary.days} days: average temperature {weather.historical_summary.average_temperature_c}°C,
                total rainfall {weather.historical_summary.total_rainfall_mm} mm.
              </p>
            )}
          </>
        )}
      </section>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Area chart */}
        <div className="bg-white rounded-2xl border border-gray-200/60 p-6 shadow-sm card-hover animate-fade-in stagger-5">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-1.5 bg-green-50 rounded-lg">
              <Activity className="w-4 h-4 text-green-600" />
            </div>
            <h3 className="text-sm font-bold text-gray-800">Advisory Activity</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={areaData}>
              <defs>
                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: '12px',
                  border: 'none',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                  fontSize: '12px',
                }}
              />
              <Area type="monotone" dataKey="value" stroke="#22c55e" fill="url(#colorVal)" strokeWidth={2.5} dot={{ fill: '#22c55e', strokeWidth: 0, r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="bg-white rounded-2xl border border-gray-200/60 p-6 shadow-sm card-hover animate-fade-in stagger-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="p-1.5 bg-orange-50 rounded-lg">
              <ShieldAlert className="w-4 h-4 text-orange-600" />
            </div>
            <h3 className="text-sm font-bold text-gray-800">Risk Distribution</h3>
          </div>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" label={{ fontSize: 11 }} strokeWidth={2} stroke="#fff">
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-sm text-gray-400">
              No risk data yet
            </div>
          )}
          <div className="flex justify-center gap-5 mt-3">
            {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((s, i) => (
              <span key={s} className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: PIE_COLORS[i] }} />
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Recent requests table */}
      <div className="bg-white rounded-2xl border border-gray-200/60 shadow-sm overflow-hidden card-hover animate-fade-in stagger-7">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 rounded-lg">
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-sm font-bold text-gray-800">Recent Requests</h3>
          </div>
          {recentReqs.length > 0 && (
            <Link to="/reports" className="text-xs text-green-700 font-semibold hover:text-green-800 transition-colors">
              View All →
            </Link>
          )}
        </div>
        {recentReqs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5 text-left font-semibold">Request ID</th>
                  <th className="px-6 py-3.5 text-left font-semibold">Crop</th>
                  <th className="px-6 py-3.5 text-left font-semibold">Location</th>
                  <th className="px-6 py-3.5 text-left font-semibold">Status</th>
                  <th className="px-6 py-3.5 text-left font-semibold">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentReqs.map((r, i) => (
                  <tr
                    key={r.request_id}
                    className="hover:bg-green-50/30 transition-colors duration-150 animate-fade-in"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <td className="px-6 py-3.5">
                      <Link to={`/report/${r.request_id}`} className="font-mono text-xs text-green-700 hover:text-green-800 font-semibold hover:underline">
                        {r.request_id}
                      </Link>
                    </td>
                    <td className="px-6 py-3.5 font-medium text-gray-800">{r.crop}</td>
                    <td className="px-6 py-3.5 text-gray-500">{r.location}</td>
                    <td className="px-6 py-3.5"><AgentStatusBadge status={r.status} /></td>
                    <td className="px-6 py-3.5 text-gray-400 text-xs">
                      {r.created_at ? new Date(r.created_at).toLocaleString() : '--'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No advisories yet" message="Generate your first advisory to see it here." />
        )}
      </div>
    </div>
  );
}
