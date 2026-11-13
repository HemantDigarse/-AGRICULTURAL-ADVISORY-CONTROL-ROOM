import React, { useState } from 'react';
import { ShieldAlert, Search } from 'lucide-react';
import RiskBadge from '../components/RiskBadge';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { getAlerts } from '../services/api';

const SEVERITY_ORDER = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

export default function RiskAlertCenter() {
  const [searchId, setSearchId] = useState('');
  const [alerts, setAlerts] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
      setAlerts(null);
    } finally {
      setLoading(false);
    }
  };

  const riskData = alerts?.risk_assessment || {};
  const alertList = (riskData.alerts || []).sort(
    (a, b) => (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ShieldAlert className="w-6 h-6 text-green-700" />
        <h1 className="text-2xl font-bold text-gray-900">Risk Alert Center</h1>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
        <input
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          placeholder="Enter Request ID"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
        />
        <button type="submit" className="px-4 py-2 bg-green-700 text-white rounded-lg text-sm font-medium hover:bg-green-800 transition-colors">
          <Search className="w-4 h-4" />
        </button>
      </form>

      {loading && <LoadingSpinner message="Loading risk data..." />}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {alerts && alerts.status === 'available' ? (
        <div className="space-y-4">
          {/* Overall risk level */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">Overall Risk Level</p>
              <p className="text-lg font-bold text-gray-900 mt-1">{riskData.overall_risk_level || 'LOW'}</p>
              {riskData.summary && <p className="text-xs text-gray-500 mt-1">{riskData.summary}</p>}
            </div>
            <RiskBadge severity={riskData.overall_risk_level || 'LOW'} />
          </div>

          {/* Alert cards */}
          {alertList.length > 0 ? (
            <div className="space-y-3">
              {alertList.map((alert, i) => (
                <div
                  key={i}
                  className={`bg-white rounded-xl border p-5 shadow-sm transition-all duration-200 ${
                    alert.severity === 'CRITICAL' ? 'border-red-300 bg-red-50/50' :
                    alert.severity === 'HIGH' ? 'border-orange-300 bg-orange-50/30' :
                    alert.severity === 'MEDIUM' ? 'border-yellow-300 bg-yellow-50/30' :
                    'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">{alert.title}</h3>
                      <span className="text-xs text-gray-400 capitalize">{alert.risk_type} risk</span>
                    </div>
                    <RiskBadge severity={alert.severity} />
                  </div>
                  {alert.description && (
                    <p className="text-sm text-gray-600 mb-3 leading-relaxed">{alert.description}</p>
                  )}
                  {alert.mitigation_steps && alert.mitigation_steps.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-gray-700 mb-1.5">Suggested Actions:</p>
                      <ul className="space-y-1">
                        {alert.mitigation_steps.map((step, j) => (
                          <li key={j} className="flex items-start gap-2 text-xs text-gray-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No alerts" message="No risk alerts for this request." icon={ShieldAlert} />
          )}
        </div>
      ) : (
        !loading && !error && (
          <EmptyState title="Enter a Request ID" message="Search by advisory request ID to view risk alerts." icon={ShieldAlert} />
        )
      )}
    </div>
  );
}

