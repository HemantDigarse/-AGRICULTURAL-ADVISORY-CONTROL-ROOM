import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Search } from 'lucide-react';
import PriceDisplay from '../components/PriceDisplay';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { getMarketData } from '../services/api';

export default function MarketIntelligence() {
  const [searchId, setSearchId] = useState('');
  const [market, setMarket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getMarketData(searchId.trim());
      setMarket(res.data);
    } catch (err) {
      setError(err.message);
      setMarket(null);
    } finally {
      setLoading(false);
    }
  };

  const marketData = market?.market || {};
  const prices = marketData.prices || [];

  const chartData = prices.map((p) => ({
    name: p.mandi_name?.split(',')[0] || 'Mandi',
    min: p.min_price,
    max: p.max_price,
    modal: p.modal_price,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <TrendingUp className="w-6 h-6 text-green-700" />
        <h1 className="text-2xl font-bold text-gray-900">Market Intelligence</h1>
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

      {loading && <LoadingSpinner message="Fetching market data..." />}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {market && market.status === 'available' ? (
        <div className="space-y-6">
          {/* Price card */}
          <PriceDisplay market={marketData} />

          {/* Mandi price comparison chart */}
          {chartData.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Mandi Price Comparison (₹/quintal)</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="min" stroke="#ef4444" strokeWidth={2} dot name="Min" />
                  <Line type="monotone" dataKey="modal" stroke="#22c55e" strokeWidth={2} dot name="Modal" />
                  <Line type="monotone" dataKey="max" stroke="#3b82f6" strokeWidth={2} dot name="Max" />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-2 text-xs text-gray-500">
                <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-red-500 inline-block" /> Min</span>
                <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-green-500 inline-block" /> Modal</span>
                <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-blue-500 inline-block" /> Max</span>
              </div>
            </div>
          )}

          {/* Mandi table */}
          {prices.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700">Mandi Prices</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                    <tr>
                      <th className="px-5 py-3 text-left">Mandi</th>
                      <th className="px-5 py-3 text-right">Min (₹)</th>
                      <th className="px-5 py-3 text-right">Modal (₹)</th>
                      <th className="px-5 py-3 text-right">Max (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {prices.map((p, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-5 py-3 font-medium">{p.mandi_name}</td>
                        <td className="px-5 py-3 text-right text-gray-500">₹{p.min_price}</td>
                        <td className="px-5 py-3 text-right font-semibold text-green-700">₹{p.modal_price}</td>
                        <td className="px-5 py-3 text-right text-gray-500">₹{p.max_price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        !loading && !error && (
          <EmptyState title="Enter a Request ID" message="Search by advisory request ID to view market data." icon={TrendingUp} />
        )
      )}
    </div>
  );
}

