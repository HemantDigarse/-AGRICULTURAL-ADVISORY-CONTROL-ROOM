import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({ title = 'No data yet', message = 'Generate an advisory to see results here.', icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
      <div className="relative mb-5">
        <div className="w-20 h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center animate-float-slow shadow-sm border border-gray-200/50">
          <Icon className="w-9 h-9 text-gray-400" />
        </div>
        {/* Decorative rings */}
        <div className="absolute -inset-3 rounded-3xl border border-dashed border-gray-200 animate-spin-slow" />
      </div>
      <h3 className="text-base font-semibold text-gray-700">{title}</h3>
      <p className="text-sm text-gray-500 mt-1.5 max-w-xs leading-relaxed">{message}</p>
    </div>
  );
}
