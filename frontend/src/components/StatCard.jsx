import React from 'react';

export default function StatCard({ title, value, icon: Icon, color = 'green', subtitle, trend }) {
  const gradientMap = {
    green:   'from-green-500 to-emerald-600',
    blue:    'from-blue-500 to-indigo-600',
    emerald: 'from-emerald-500 to-teal-600',
    red:     'from-red-500 to-rose-600',
    yellow:  'from-yellow-500 to-amber-600',
    purple:  'from-purple-500 to-violet-600',
  };

  const lightBgMap = {
    green:   'bg-green-50/50',
    blue:    'bg-blue-50/50',
    emerald: 'bg-emerald-50/50',
    red:     'bg-red-50/50',
    yellow:  'bg-yellow-50/50',
    purple:  'bg-purple-50/50',
  };

  return (
    <div className="card-hover group relative bg-white rounded-xl border border-gray-200/60 p-5 shadow-sm overflow-hidden">
      {/* Decorative gradient blob */}
      <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-[0.07] bg-gradient-to-br ${gradientMap[color]} blur-2xl group-hover:opacity-[0.12] transition-opacity duration-500`} />
      
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-3xl font-extrabold text-gray-900 mt-1.5 tracking-tight animate-count-up">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">{subtitle}</p>
          )}
          {trend && (
            <p className={`text-xs mt-1.5 font-semibold flex items-center gap-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              <span className={`inline-block transition-transform ${trend > 0 ? 'rotate-0' : 'rotate-180'}`}>↑</span>
              {Math.abs(trend)}% from last week
            </p>
          )}
        </div>
        {Icon && (
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${gradientMap[color]} shadow-lg shadow-${color}-500/20 group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        )}
      </div>
      
      {/* Bottom gradient line */}
      <div className={`absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r ${gradientMap[color]} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
    </div>
  );
}
