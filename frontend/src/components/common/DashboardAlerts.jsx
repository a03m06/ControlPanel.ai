import React from 'react';
import { Link } from 'react-router-dom';
import { AlertOctagon, AlertTriangle, DollarSign, Activity, ShieldAlert, ArrowRight } from 'lucide-react';

export default function DashboardAlerts({ alerts = [] }) {
  const getAlertIcon = (type, severity) => {
    if (severity.includes('HIGH')) return <AlertOctagon size={14} className="text-rose-600 dark:text-rose-400 shrink-0" />;
    if (type === 'cost') return <DollarSign size={14} className="text-amber-600 dark:text-amber-400 shrink-0" />;
    if (type === 'performance') return <Activity size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />;
    return <AlertTriangle size={14} className="text-amber-600 dark:text-amber-400 shrink-0" />;
  };

  const getAlertBadgeStyle = (severity) => {
    if (severity.includes('HIGH')) return 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/60';
    if (severity.includes('COST')) return 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/60';
    if (severity.includes('PERF')) return 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60';
    return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 shadow-xs transition-colors">
      <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <ShieldAlert size={16} className="text-slate-700 dark:text-slate-300" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            System Alerts & Policy Flags
          </h2>
        </div>
        <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
          {alerts.length} Active Notifications
        </span>
      </div>

      <div className="space-y-2.5">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/60 p-3 hover:bg-slate-50 dark:hover:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
          >
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5">{getAlertIcon(alert.type, alert.severity)}</div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold font-mono uppercase px-1.5 py-0.2 rounded border ${getAlertBadgeStyle(alert.severity)}`}>
                    {alert.severity}
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">{alert.time}</span>
                </div>
                <p className="text-xs text-slate-800 dark:text-slate-200 font-medium mt-1 leading-relaxed">
                  {alert.message}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-1 sm:pt-0 border-t sm:border-0 border-slate-200/60 dark:border-slate-800">
              <Link
                to={`/events/${alert.eventId}`}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <span>Event #{alert.eventId}</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
