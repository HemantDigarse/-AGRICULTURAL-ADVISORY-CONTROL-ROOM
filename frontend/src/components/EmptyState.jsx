import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({ title = 'No data yet', message = 'Generate an advisory to see results here.', icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-gray-400" />
      </div>
      <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      <p className="text-sm text-gray-500 mt-1 max-w-xs">{message}</p>
    </div>
  );
}
