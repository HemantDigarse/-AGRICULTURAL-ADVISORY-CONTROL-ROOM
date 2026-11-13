import React from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

const variantConfig = {
  info: { bg: 'bg-blue-50 border-blue-200', icon: Info, iconColor: 'text-blue-500' },
  success: { bg: 'bg-green-50 border-green-200', icon: CheckCircle, iconColor: 'text-green-500' },
  warning: { bg: 'bg-yellow-50 border-yellow-200', icon: AlertTriangle, iconColor: 'text-yellow-500' },
  error: { bg: 'bg-red-50 border-red-200', icon: XCircle, iconColor: 'text-red-500' },
};

export default function AlertBanner({ variant = 'info', title, message, onClose }) {
  const config = variantConfig[variant];
  const IconComp = config.icon;
  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border ${config.bg}`}>
      <IconComp className={`w-5 h-5 mt-0.5 flex-shrink-0 ${config.iconColor}`} />
      <div className="flex-1">
        {title && <p className="text-sm font-semibold text-gray-800">{title}</p>}
        <p className="text-sm text-gray-600">{message}</p>
      </div>
      {onClose && (
        <button className="text-gray-400 hover:text-gray-600" onClick={onClose}>
          <XCircle className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
