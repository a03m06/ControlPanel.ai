import React from 'react';
import { CheckCircle2, RefreshCw, Ban, UserCheck, HelpCircle } from 'lucide-react';

export default function DecisionBadge({ decision = 'ALLOW', size = 'md', className = '' }) {
  const norm = (decision || '').toUpperCase().trim();

  let config = {
    label: norm || 'UNKNOWN',
    bg: 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300',
    icon: HelpCircle
  };

  if (norm.includes('ALLOW')) {
    config = {
      label: 'ALLOW',
      bg: 'bg-emerald-950/50 border-emerald-800/60 text-emerald-400 font-semibold',
      icon: CheckCircle2
    };
  } else if (norm.includes('EDIT') || norm.includes('REGEN')) {
    config = {
      label: 'EDIT',
      bg: 'bg-amber-950/50 border-amber-800/60 text-amber-400 font-semibold',
      icon: RefreshCw
    };
  } else if (norm.includes('BLOCK')) {
    config = {
      label: 'BLOCK',
      bg: 'bg-rose-950/50 border-rose-800/60 text-rose-400 font-semibold',
      icon: Ban
    };
  } else if (norm.includes('ESCALATE') || norm.includes('REVIEW') || norm.includes('HUMAN')) {
    config = {
      label: norm.includes('ESCALATE') ? 'ESCALATE' : 'HUMAN REVIEW',
      bg: 'bg-purple-950/50 border-purple-800/60 text-purple-400 font-semibold',
      icon: UserCheck
    };
  }

  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-xs px-3 py-1.5 gap-1.5'
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
      <span>{config.label}</span>
    </span>
  );
}
