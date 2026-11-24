import React from 'react';

export default function LoadingSpinner({ message = 'Loading...', size = 'md' }) {
  const sizeMap = {
    sm: { ring: 'w-8 h-8', inner: 'w-5 h-5', dot: 'w-2 h-2' },
    md: { ring: 'w-14 h-14', inner: 'w-9 h-9', dot: 'w-3 h-3' },
    lg: { ring: 'w-20 h-20', inner: 'w-14 h-14', dot: 'w-4 h-4' },
  };
  const s = sizeMap[size] || sizeMap.md;

  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
      <div className="relative">
        {/* Outer ring */}
        <div className={`${s.ring} rounded-full border-[3px] border-green-200/40 border-t-green-500 animate-spin`} />
        {/* Inner ring (reverse) */}
        <div className={`absolute inset-0 m-auto ${s.inner} rounded-full border-[2px] border-emerald-200/30 border-b-emerald-500 animate-spin-reverse`} />
        {/* Center dot */}
        <div className={`absolute inset-0 m-auto ${s.dot} rounded-full bg-green-500 animate-pulse-scale`} />
      </div>
      <p className="mt-5 text-sm text-gray-500 font-medium animate-pulse">{message}</p>
    </div>
  );
}
