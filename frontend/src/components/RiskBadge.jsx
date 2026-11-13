import React from 'react';

const severityConfig = {
  LOW: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
  MEDIUM: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
  HIGH: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' },
  CRITICAL: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300 animate-pulse' },
};

export default function RiskBadge({ severity }) {
  const config = severityConfig[severity] || severityConfig.LOW;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${config.bg} ${config.text} ${config.border}`}>
      {severity}
    </span>
  );
}
