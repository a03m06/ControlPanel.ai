import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid 
} from 'recharts';
import { 
  Activity, 
  DollarSign, 
  Shield, 
  Layers, 
  PieChart as PieIcon 
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { getAnalytics } from '../services/api';

// Custom clean theme-aware tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2.5 shadow-xl text-xs font-sans">
        <div className="text-[var(--text-muted)] font-bold mb-1 pb-1 border-b border-[var(--border-subtle)]">{label}</div>
        <div className="space-y-1">
          {payload.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span>{item.name}:</span>
              </span>
              <span className="font-bold text-[var(--text-primary)] font-mono">
                {typeof item.value === 'number' ? item.value.toLocaleString() : item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  const { isDark } = useTheme();
  const [timeRange, setTimeRange] = useState('24h');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      setLoading(true);
      try {
        const data = await getAnalytics(timeRange);
        setAnalytics(data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, [timeRange]);

  if (loading || !analytics) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const { performanceTrends, costTrends, safetyTrends, volumeData, decisionDistribution, riskDistribution } = analytics;
  const gridStroke = isDark ? '#1e293b' : '#e2e8f0';
  const axisStroke = isDark ? '#64748b' : '#94a3b8';
  const axisFill = isDark ? '#94a3b8' : '#64748b';

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      
      {/* 1. Header & Timeframe Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border-subtle)]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Analytics & Trends
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
            Reliability metrics across performance, cost, and responsibility.
          </p>
        </div>

        {/* Time range buttons */}
        <div className="flex items-center rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-1 self-start sm:self-auto shadow-xs">
          {['24h', '7d', '30d'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`rounded-lg px-3 py-1 text-xs font-semibold uppercase font-mono transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Top Charts Grid: Performance & Cost */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* PERFORMANCE */}
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 shadow-lg">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              <Activity size={14} className="text-blue-500" />
              <span>PERFORMANCE TRENDS</span>
            </div>
            <span className="text-xs font-mono font-bold text-[var(--text-primary)]">Avg: 82</span>
          </div>


          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceTrends} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="perfGradTheme" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="time" stroke={axisStroke} tick={{ fontSize: 11, fill: axisFill }} />
                <YAxis domain={[60, 100]} stroke={axisStroke} tick={{ fontSize: 11, fill: axisFill }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
                <Area type="monotone" dataKey="performance" name="Performance" stroke="#2563eb" strokeWidth={2} fill="url(#perfGradTheme)" />
                <Line type="monotone" dataKey="semantic" name="Semantic" stroke="#0891b2" strokeWidth={1.5} dot={{ r: 2 }} />
                <Line type="monotone" dataKey="factual" name="Factual" stroke="#7c3aed" strokeWidth={1.5} dot={{ r: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* COST */}
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 shadow-lg">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              <DollarSign size={14} className="text-amber-500" />
              <span>COST SCORE & EFFICIENCY</span>
            </div>
            <span className="text-xs font-mono font-bold text-[var(--text-primary)]">Avg: 91</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={costTrends} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="time" stroke={axisStroke} tick={{ fontSize: 11, fill: axisFill }} />
                <YAxis domain={[70, 100]} stroke={axisStroke} tick={{ fontSize: 11, fill: axisFill }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
                <Line type="monotone" dataKey="costScore" name="Cost Score" stroke="#d97706" strokeWidth={2} dot={{ r: 3, fill: '#d97706' }} />
                <Line type="monotone" dataKey="tokenRatio" name="Token Ratio (x)" stroke="#059669" strokeWidth={1.5} dot={{ r: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 3. Middle Charts: Safety & Volume */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* SAFETY */}
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 shadow-lg">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              <Shield size={14} className="text-emerald-500" />
              <span>RESPONSIBILITY & SAFETY</span>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-500">99.4% Safe</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={safetyTrends} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="safetyGradTheme" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="time" stroke={axisStroke} tick={{ fontSize: 11, fill: axisFill }} />
                <YAxis domain={[80, 100]} stroke={axisStroke} tick={{ fontSize: 11, fill: axisFill }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
                <Area type="monotone" dataKey="safetyScore" name="Responsibility" stroke="#059669" strokeWidth={2} fill="url(#safetyGradTheme)" />
                <Line type="stepAfter" dataKey="piiFlags" name="PII Flags" stroke="#dc2626" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* VOLUME */}
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 shadow-lg">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
              <Layers size={14} className="text-blue-500" />
              <span>EVALUATION VOLUME</span>
            </div>
            <span className="text-xs font-mono text-[var(--text-muted)] font-medium">1,284 Total</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                <XAxis dataKey="time" stroke={axisStroke} tick={{ fontSize: 11, fill: axisFill }} />
                <YAxis stroke={axisStroke} tick={{ fontSize: 11, fill: axisFill }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
                <Bar dataKey="allow" name="ALLOW" stackId="a" fill="#10b981" />
                <Bar dataKey="edit" name="EDIT / REGEN" stackId="a" fill="#f59e0b" />
                <Bar dataKey="block" name="BLOCK" stackId="a" fill="#ef4444" />
                <Bar dataKey="review" name="HUMAN REVIEW" stackId="a" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 4. Bottom Grid: Donut Decision Distribution & Risk Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* DECISION DISTRIBUTION */}
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 shadow-lg">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-3 pb-2 border-b border-[var(--border-subtle)]">
            <PieIcon size={14} className="text-purple-500" />
            <span>DECISION DISTRIBUTION</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-3">
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={decisionDistribution}
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {decisionDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke={isDark ? '#111827' : '#ffffff'} strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1.5 text-xs">
              {decisionDistribution.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-medium text-[var(--text-secondary)] font-mono text-[11px]">{item.name}</span>
                  </div>
                  <span className="font-bold text-[var(--text-primary)] font-mono text-xs">{item.percentage}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RISK SPLIT */}
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 shadow-lg">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--text-primary)] mb-3 pb-2 border-b border-[var(--border-subtle)]">
            <Shield size={14} className="text-blue-500" />
            <span>RISK LEVEL CLASSIFICATION</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-3">
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskDistribution}
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {riskDistribution.map((entry, index) => (
                      <Cell key={`cell-risk-${index}`} fill={entry.color} stroke={isDark ? '#111827' : '#ffffff'} strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1.5 text-xs">
              {riskDistribution.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)]">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-medium text-[var(--text-secondary)] font-mono text-[11px]">{item.name}</span>
                  </div>
                  <span className="font-bold text-[var(--text-primary)] font-mono text-xs">{item.percentage}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>


    </div>
  );
}
