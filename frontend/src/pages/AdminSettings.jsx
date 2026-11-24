import React, { useEffect, useState } from 'react';
import {
  Settings,
  Server,
  Database,
  Cpu,
  Shield,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Globe,
  Key,
  ToggleLeft,
  ToggleRight,
  Info,
  AlertTriangle,
  Zap,
  HardDrive,
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';

function StatusDot({ ok }) {
  return (
    <span
      className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
        ok ? 'bg-green-500' : 'bg-red-500 animate-pulse'
      }`}
    />
  );
}

function SettingRow({ icon: Icon, label, value, status, description }) {
  return (
    <div className="flex items-start gap-4 py-4 border-b border-gray-100 last:border-0">
      <div className="p-2 bg-gray-100 rounded-lg">
        <Icon className="w-4 h-4 text-gray-600" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-800">{label}</span>
          {status !== undefined && <StatusDot ok={status} />}
        </div>
        {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
      </div>
      <div className="text-sm text-right">
        {typeof value === 'boolean' ? (
          value ? (
            <span className="inline-flex items-center gap-1 text-green-700">
              <ToggleRight className="w-5 h-5" /> Enabled
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-gray-400">
              <ToggleLeft className="w-5 h-5" /> Disabled
            </span>
          )
        ) : (
          <span className="font-mono text-gray-600">{value}</span>
        )}
      </div>
    </div>
  );
}

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState(null);
  const [healthError, setHealthError] = useState(null);
  const [checking, setChecking] = useState(false);

  const fetchHealth = () => {
    setChecking(true);
    setHealthError(null);
    api
      .get('/health')
      .then((res) => setHealth(res.data))
      .catch((err) => {
        setHealthError(err.message || 'Failed to reach backend');
        setHealth(null);
      })
      .finally(() => {
        setLoading(false);
        setChecking(false);
      });
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  if (loading) return <LoadingSpinner message="Checking system status..." />;

  const isDemo = health?.demo_mode ?? true;
  const isHealthy = health?.status === 'healthy';

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 bg-gradient-to-br from-green-700 to-emerald-600 rounded-xl shadow-sm">
          <Settings className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            System configuration, health status, and environment information
          </p>
        </div>
      </div>

      {/* API Health Banner */}
      <div
        className={`flex items-center gap-4 p-4 rounded-xl border ${
          isHealthy
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        }`}
      >
        <div
          className={`p-2.5 rounded-lg ${
            isHealthy ? 'bg-green-100' : 'bg-red-100'
          }`}
        >
          {isHealthy ? (
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          ) : (
            <XCircle className="w-6 h-6 text-red-600" />
          )}
        </div>
        <div className="flex-1">
          <p className={`font-semibold ${isHealthy ? 'text-green-800' : 'text-red-800'}`}>
            {isHealthy ? 'Backend API is Healthy' : 'Backend API Unreachable'}
          </p>
          <p className={`text-sm ${isHealthy ? 'text-green-600' : 'text-red-600'}`}>
            {isHealthy
              ? `System operational — ${health?.timestamp ? new Date(health.timestamp).toLocaleString() : 'now'}`
              : healthError || 'Could not connect to backend server'}
          </p>
        </div>
        <button
          onClick={fetchHealth}
          disabled={checking}
          className={`p-2 rounded-lg transition-colors ${
            checking ? 'text-gray-400' : 'text-gray-600 hover:bg-white/60'
          }`}
          title="Refresh"
        >
          <RefreshCw className={`w-5 h-5 ${checking ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* System Configuration */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Server className="w-4 h-4" />
            System Configuration
          </h3>
        </div>
        <div className="px-5">
          <SettingRow
            icon={Zap}
            label="Demo Mode"
            value={isDemo}
            status={true}
            description="When enabled, the system uses built-in demo data instead of external APIs"
          />
          <SettingRow
            icon={Database}
            label="Database"
            value={isDemo ? 'SQLite (aiosqlite)' : 'PostgreSQL'}
            status={isHealthy}
            description="Primary data store for advisories, weather reports, and market data"
          />
          <SettingRow
            icon={Cpu}
            label="Backend Framework"
            value="FastAPI + Uvicorn"
            status={isHealthy}
            description="Async Python web framework powering the API layer"
          />
          <SettingRow
            icon={HardDrive}
            label="Vector Store"
            value={isDemo ? 'Keyword Search (Demo)' : 'ChromaDB'}
            description="RAG pipeline storage for scheme document embeddings"
          />
        </div>
      </div>

      {/* API Keys & External Services */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Key className="w-4 h-4" />
            External Services
          </h3>
        </div>
        <div className="px-5">
          <SettingRow
            icon={Globe}
            label="OpenWeatherMap API"
            value={isDemo ? 'Using Demo Data' : 'Connected'}
            status={!isDemo}
            description="Weather data provider for location-based weather intelligence"
          />
          <SettingRow
            icon={Cpu}
            label="OpenAI API (LLM)"
            value={isDemo ? 'Using Templates' : 'Connected'}
            status={!isDemo}
            description="Large language model for advisory generation and coordination"
          />
          <SettingRow
            icon={Shield}
            label="Authentication"
            value="JWT Bearer Tokens"
            status={isHealthy}
            description="Token-based authentication with bcrypt password hashing"
          />
        </div>
      </div>

      {/* AI Agent Configuration */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            AI Agent Pipeline
          </h3>
        </div>
        <div className="px-5 py-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { name: 'Intake Agent', desc: 'Validates and structures farmer input' },
              { name: 'Weather Agent', desc: 'Fetches weather data and risk analysis' },
              { name: 'Crop Advisory Agent', desc: 'Generates crop-specific recommendations' },
              { name: 'Market Intelligence Agent', desc: 'Analyzes market prices and trends' },
              { name: 'Government Scheme Agent', desc: 'Matches relevant government schemes' },
              { name: 'Risk Alert Agent', desc: 'Evaluates threats and severity levels' },
              { name: 'Coordinator Agent', desc: 'Consolidates all outputs into final advisory' },
            ].map((agent) => (
              <div
                key={agent.name}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100"
              >
                <StatusDot ok={isHealthy} />
                <div>
                  <p className="text-sm font-medium text-gray-800">{agent.name}</p>
                  <p className="text-xs text-gray-500">{agent.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Environment Info */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Info className="w-4 h-4" />
            Environment Info
          </h3>
        </div>
        <div className="px-5">
          <SettingRow icon={Globe} label="Frontend" value="React 18 + Vite + Tailwind CSS v4" />
          <SettingRow icon={Server} label="Backend" value="Python 3.11+ / FastAPI" />
          <SettingRow icon={Database} label="ORM" value="SQLAlchemy 2.0 (async)" />
          <SettingRow icon={HardDrive} label="RAG Pipeline" value="ChromaDB + Keyword Matching" />
          <SettingRow icon={Shield} label="CORS" value="All Origins (Development)" />
        </div>
      </div>

      {/* Warning for Demo Mode */}
      {isDemo && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Demo Mode Active</p>
            <p className="text-sm text-amber-700 mt-1">
              The system is running in demo mode. All weather data, market prices, and LLM responses
              use pre-built templates. To enable live data, set <code className="bg-amber-100 px-1 py-0.5 rounded text-xs font-mono">DEMO_MODE=false</code> in
              your <code className="bg-amber-100 px-1 py-0.5 rounded text-xs font-mono">.env</code> file and
              configure the required API keys (OPENAI_API_KEY, WEATHER_API_KEY).
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <p className="text-xs text-gray-400 italic text-center pt-2">
        * Settings displayed are read-only. Modify backend environment variables to change configuration.
      </p>
    </div>
  );
}
