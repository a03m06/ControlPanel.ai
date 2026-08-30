import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';

export default function RiskBadge({ risk = 'LOW', size = 'md', className = '' }) {
  const normalized = (risk || 'LOW').toUpperCase();

  const configs = {
    LOW: {
      label: 'LOW',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400',
      icon: ShieldCheck
    },
    MEDIUM: {
      label: 'MEDIUM',
      bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/50 text-amber-700 dark:text-amber-400',
      icon: AlertTriangle
    },
    HIGH: {
      label: 'HIGH',
      bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-400',
      icon: AlertOctagon
    }
  };

  const config = configs[normalized] || configs.LOW;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1 font-medium',
    md: 'text-xs px-2.5 py-0.5 gap-1.5 font-semibold',
    lg: 'text-xs px-3 py-1 gap-1.5 font-bold'
  };

  const iconSizes = {
    sm: 12,
    md: 13,
    lg: 14
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border font-mono tracking-tight transition-colors ${config.bg} ${sizeClasses[size] || sizeClasses.md} ${className}`}
    >
      <Icon size={iconSizes[size] || 13} className="shrink-0" />
      <span>{normalized === 'LOW' || normalized === 'MEDIUM' || normalized === 'HIGH' ? normalized : config.label}</span>
    </span>
  );
}
