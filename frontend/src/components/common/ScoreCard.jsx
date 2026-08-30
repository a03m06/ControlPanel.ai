import React from 'react';
import RiskBadge from './RiskBadge';
import { Activity, DollarSign, Shield, TrendingUp } from 'lucide-react';

const ICON_MAP = {
  cost: DollarSign,
  responsibility: Shield,
  safety: Shield,
  performance: Activity
};

export default function ScoreCard({
  title = 'PERFORMANCE',
  score = 82,
  riskLevel = 'LOW',
  explanation = 'Evaluation explanation goes here.',
  trend = '+2.4% vs last week',
  subMetrics = [],
  category = 'performance'
}) {
  const Icon = ICON_MAP[category.toLowerCase()] || Activity;

  const getBarColor = (val) => {
    if (val >= 90) return 'bg-emerald-500';
    if (val >= 75) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
              <Icon size={16} />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                {title}
              </h3>
            </div>
          </div>
          <RiskBadge risk={riskLevel} size="sm" />
        </div>

        {/* Main Score */}
        <div className="mb-3 flex items-baseline justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white">
              {score}
            </span>
            <span className="text-xs text-slate-400 font-medium">/ 100</span>
          </div>

          {trend && (
            <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/40">
              <TrendingUp size={11} />
              <span>{trend}</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-3.5">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className={`h-full rounded-full ${getBarColor(score)} transition-all duration-500 ease-out`}
              style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
            />
          </div>
        </div>

        {/* Explanation */}
        <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 bg-slate-50/70 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-100 dark:border-slate-800 mb-3">
          {explanation}
        </p>
      </div>

      {/* Sub metrics breakdown */}
      {subMetrics && subMetrics.length > 0 && (
        <div className="grid grid-cols-3 gap-2 border-t border-slate-100 dark:border-slate-800 pt-3 mt-auto">
          {subMetrics.map((item, idx) => (
            <div key={idx} className="flex flex-col">
              <span className="text-[10px] uppercase font-medium text-slate-400 dark:text-slate-500 truncate">{item.label}</span>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 font-mono mt-0.5">{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
