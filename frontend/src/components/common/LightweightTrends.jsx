import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, AreaChart, Area } from 'recharts';
import { Activity, DollarSign, Shield, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const MiniTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded bg-slate-900 dark:bg-slate-800 px-2 py-1 text-[11px] font-mono text-white shadow-md border border-slate-700">
        <span>{label}: </span>
        <span className="font-bold">{payload[0].value}</span>
      </div>
    );
  }
  return null;
};

export default function LightweightTrends({ trends = [] }) {
  if (!trends || trends.length === 0) return null;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 shadow-xs transition-colors">
      <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            7-Day Score Trends
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Lightweight telemetry tracking across the 3 evaluation pillars
          </p>
        </div>
        <Link
          to="/analytics"
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-0.5"
        >
          <span>Full Analytics</span>
          <ArrowUpRight size={13} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Performance Sparkline */}
        <div className="rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/60 p-3">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Activity size={13} className="text-blue-600 dark:text-blue-400" />
              <span>Performance Trend</span>
            </div>
            <span className="font-mono text-xs font-bold text-blue-700 dark:text-blue-400">84 pts</span>
          </div>

          <div className="h-16 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends} margin={{ top: 5, right: 2, left: -30, bottom: 0 }}>
                <defs>
                  <linearGradient id="miniPerf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" stroke="#94a3b8" tick={{ fontSize: 9 }} />
                <YAxis domain={[65, 100]} hide />
                <Tooltip content={<MiniTooltip />} />
                <Area type="monotone" dataKey="performance" stroke="#2563eb" strokeWidth={2} fill="url(#miniPerf)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost Sparkline */}
        <div className="rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/60 p-3">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <DollarSign size={13} className="text-amber-600 dark:text-amber-400" />
              <span>Cost Efficiency Trend</span>
            </div>
            <span className="font-mono text-xs font-bold text-amber-700 dark:text-amber-400">91 pts</span>
          </div>

          <div className="h-16 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends} margin={{ top: 5, right: 2, left: -30, bottom: 0 }}>
                <XAxis dataKey="label" stroke="#94a3b8" tick={{ fontSize: 9 }} />
                <YAxis domain={[75, 100]} hide />
                <Tooltip content={<MiniTooltip />} />
                <Line type="monotone" dataKey="cost" stroke="#d97706" strokeWidth={2} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Responsibility Sparkline */}
        <div className="rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/60 p-3">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <Shield size={13} className="text-emerald-600 dark:text-emerald-400" />
              <span>Responsibility & Safety</span>
            </div>
            <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">98 pts</span>
          </div>

          <div className="h-16 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends} margin={{ top: 5, right: 2, left: -30, bottom: 0 }}>
                <defs>
                  <linearGradient id="miniResp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" stroke="#94a3b8" tick={{ fontSize: 9 }} />
                <YAxis domain={[80, 100]} hide />
                <Tooltip content={<MiniTooltip />} />
                <Area type="monotone" dataKey="responsibility" stroke="#059669" strokeWidth={2} fill="url(#miniResp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
