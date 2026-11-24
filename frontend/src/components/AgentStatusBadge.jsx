import React from 'react';

const statusConfig = {
  pending:    { label: 'Pending',    bg: 'bg-gray-100',    text: 'text-gray-600',  dot: 'bg-gray-400' },
  running:    { label: 'Running',    bg: 'bg-blue-50',     text: 'text-blue-700',  dot: 'bg-blue-500 animate-pulse', ring: true },
  processing: { label: 'Processing', bg: 'bg-blue-50',    text: 'text-blue-700',  dot: 'bg-blue-500 animate-pulse', ring: true },
  completed:  { label: 'Completed',  bg: 'bg-green-50',   text: 'text-green-700', dot: 'bg-green-500', check: true },
  failed:     { label: 'Failed',     bg: 'bg-red-50',     text: 'text-red-700',   dot: 'bg-red-500' },
};

export default function AgentStatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text} transition-all duration-300`}>
      <span className="relative flex items-center justify-center">
        <span className={`w-2 h-2 rounded-full ${config.dot}`} />
        {config.ring && (
          <span className="absolute w-3.5 h-3.5 rounded-full border border-blue-400 animate-ripple" />
        )}
      </span>
      {config.label}
    </span>
  );
}
