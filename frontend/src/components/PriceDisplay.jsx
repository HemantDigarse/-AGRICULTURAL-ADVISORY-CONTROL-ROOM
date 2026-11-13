import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function PriceDisplay({ market }) {
  if (!market) return null;

  const trendIcon = {
    rising: <TrendingUp className="w-5 h-5 text-green-500" />,
    falling: <TrendingDown className="w-5 h-5 text-red-500" />,
    stable: <Minus className="w-5 h-5 text-gray-500" />,
  };

  const recColor = market.recommendation === 'SELL' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">{market.crop}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${recColor}`}>
          {market.recommendation || 'HOLD'}
        </span>
      </div>
      <div className="flex items-end gap-2 mb-1">
        <span className="text-3xl font-bold text-gray-900">₹{market.avg_price ?? '--'}</span>
        <span className="text-sm text-gray-500 mb-1">/quintal</span>
        {trendIcon[market.price_trend] || trendIcon.stable}
      </div>
      {market.msp && (
        <p className="text-xs text-gray-500">MSP: ₹{market.msp}/quintal</p>
      )}
      {market.recommendation_reason && (
        <p className="text-xs text-gray-500 mt-2 leading-relaxed">{market.recommendation_reason}</p>
      )}
    </div>
  );
}
