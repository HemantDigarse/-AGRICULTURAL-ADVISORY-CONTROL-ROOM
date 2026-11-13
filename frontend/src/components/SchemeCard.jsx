import React from 'react';
import { Landmark, ExternalLink } from 'lucide-react';

export default function SchemeCard({ scheme }) {
  if (!scheme) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Landmark className="w-4.5 h-4.5 text-green-600" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900">{scheme.name}</h3>
          {scheme.category && (
            <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
              {scheme.category}
            </span>
          )}
        </div>
      </div>
      {scheme.description && (
        <p className="text-sm text-gray-600 mb-3 leading-relaxed">{scheme.description}</p>
      )}
      {scheme.benefits && (
        <div className="mb-2">
          <p className="text-xs font-semibold text-gray-700 mb-1">Benefits</p>
          <p className="text-xs text-gray-500 leading-relaxed">{scheme.benefits}</p>
        </div>
      )}
      {scheme.eligibility && (
        <div className="mb-2">
          <p className="text-xs font-semibold text-gray-700 mb-1">Eligibility</p>
          <p className="text-xs text-gray-500 leading-relaxed">{scheme.eligibility}</p>
        </div>
      )}
      {scheme.application_process && (
        <div>
          <p className="text-xs font-semibold text-gray-700 mb-1">How to Apply</p>
          <p className="text-xs text-gray-500 leading-relaxed">{scheme.application_process}</p>
        </div>
      )}
    </div>
  );
}
