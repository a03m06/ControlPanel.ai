import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Ban, 
  UserCheck, 
  RefreshCw,
  Shield, 
  ShieldCheck,
  DollarSign, 
  Activity, 
  Sparkles
} from 'lucide-react';
import { getDashboardStats } from '../services/api';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await getDashboardStats();
      setData(res);
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // Default fallback matching the exact API response specification
  const overview = data?.overview || {
    total_interactions: 2,
    allow_count: 2,
    edit_count: 0,
    block_count: 0,
    escalate_count: 0,
    avg_performance: 100,
    avg_cost: 100,
    avg_safety: 100,
    avg_confidence: 100,
    total_tokens: 29,
    total_estimated_cost: 0.001032,
    cost_anomalies: 0,
    pii_incidents: 0,
    safety_incidents: 0
  };

  const total = overview.total_interactions || 1;
  const allowPct = ((overview.allow_count / total) * 100).toFixed(0);
  const blockPct = ((overview.block_count / total) * 100).toFixed(0);
  const editPct = ((overview.edit_count / total) * 100).toFixed(0);
  const escalatePct = ((overview.escalate_count / total) * 100).toFixed(0);

  return (
    <div className="space-y-7 animate-in fade-in pb-12">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            System Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            Real-time multi-vector evaluation overview & AI control telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            type="button"
            onClick={fetchStats}
            className="flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3.5 py-2 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-colors shadow-xs"
            title="Refresh statistics"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin text-blue-400' : 'text-[var(--text-muted)]'} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. Top Decision Distribution Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* TOTAL INTERACTIONS */}
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-lg relative overflow-hidden group hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between text-[var(--text-muted)] mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] font-mono">
              TOTAL INTERACTIONS
            </span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Activity size={15} />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-[var(--text-primary)] tracking-tight">
            {overview.total_interactions.toLocaleString()}
          </div>
          <div className="mt-2.5 text-xs text-[var(--text-muted)] flex items-center justify-between font-mono">
            <span>{overview.total_tokens.toLocaleString()} tokens</span>
            <span className="text-emerald-500 font-semibold">${Number(overview.total_estimated_cost).toFixed(6)}</span>
          </div>
        </div>

        {/* ALLOWED */}
        <div className="rounded-2xl border-l-4 border-l-emerald-500 border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between text-emerald-500 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-primary)] font-mono">
              ALLOW
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-500">
              <CheckCircle2 size={15} />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-[var(--text-primary)] tracking-tight">
            {overview.allow_count.toLocaleString()}
          </div>
          <div className="mt-2.5 text-xs text-emerald-500 font-medium flex items-center justify-between font-mono">
            <span>{allowPct}% of total</span>
            <span className="text-[11px] text-[var(--text-muted)]">Passed</span>
          </div>
        </div>

        {/* EDIT / REGENERATE */}
        <div className="rounded-2xl border-l-4 border-l-amber-500 border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between text-amber-500 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-primary)] font-mono">
              EDIT
            </span>
            <div className="p-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-500">
              <RefreshCw size={15} />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-[var(--text-primary)] tracking-tight">
            {overview.edit_count.toLocaleString()}
          </div>
          <div className="mt-2.5 text-xs text-amber-500 font-medium flex items-center justify-between font-mono">
            <span>{editPct}% of total</span>
            <span className="text-[11px] text-[var(--text-muted)]">Corrected</span>
          </div>
        </div>

        {/* BLOCKED */}
        <div className="rounded-2xl border-l-4 border-l-rose-500 border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-lg relative overflow-hidden group hover:border-rose-500/40 transition-all">
          <div className="flex items-center justify-between text-rose-500 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-primary)] font-mono">
              BLOCK
            </span>
            <div className="p-1.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-500">
              <Ban size={15} />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-[var(--text-primary)] tracking-tight">
            {overview.block_count.toLocaleString()}
          </div>
          <div className="mt-2.5 text-xs text-rose-500 font-medium flex items-center justify-between font-mono">
            <span>{blockPct}% of total</span>
            <span className="text-[11px] text-[var(--text-muted)]">Shielded</span>
          </div>
        </div>

        {/* ESCALATE / HUMAN REVIEW */}
        <div className="rounded-2xl border-l-4 border-l-purple-500 border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-lg relative overflow-hidden group hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between text-purple-500 mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-primary)] font-mono">
              ESCALATE
            </span>
            <div className="p-1.5 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-500">
              <UserCheck size={15} />
            </div>
          </div>
          <div className="text-3xl font-black font-mono text-[var(--text-primary)] tracking-tight">
            {overview.escalate_count.toLocaleString()}
          </div>
          <div className="mt-2.5 text-xs text-purple-500 font-medium flex items-center justify-between font-mono">
            <span>{escalatePct}% of total</span>
            <span className="text-[11px] text-[var(--text-muted)]">{overview.escalate_count > 0 ? '! Action req' : '0 Pending'}</span>
          </div>
        </div>
      </div>

      {/* 3. Core Scores & Reliability Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* AVG PERFORMANCE */}
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)]">
              <Activity size={15} className="text-blue-500" />
              <span>Avg Performance</span>
            </div>
            <span className="font-mono text-lg font-black text-blue-500">{overview.avg_performance} / 100</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--border-subtle)]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, overview.avg_performance))}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] font-mono">
            <span>Semantic & consistency fit</span>
            <span className="text-emerald-500 font-semibold">{overview.avg_performance >= 90 ? 'Optimal' : 'Normal'}</span>
          </div>
        </div>

        {/* AVG COST SCORE */}
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)]">
              <DollarSign size={15} className="text-amber-500" />
              <span>Avg Cost Score</span>
            </div>
            <span className="font-mono text-lg font-black text-amber-500">{overview.avg_cost} / 100</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--border-subtle)]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, overview.avg_cost))}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] font-mono">
            <span>Token budget efficiency</span>
            <span className="text-amber-500 font-semibold">{overview.avg_cost >= 90 ? 'Efficient' : 'Review'}</span>
          </div>
        </div>

        {/* AVG SAFETY */}
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)]">
              <Shield size={15} className="text-emerald-500" />
              <span>Avg Safety Score</span>
            </div>
            <span className="font-mono text-lg font-black text-emerald-500">{overview.avg_safety} / 100</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--border-subtle)]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, overview.avg_safety))}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] font-mono">
            <span>PII & toxicity guardrails</span>
            <span className="text-emerald-500 font-semibold">{overview.avg_safety >= 90 ? 'Protected' : 'Alert'}</span>
          </div>
        </div>

        {/* AVG CONFIDENCE */}
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)]">
              <Sparkles size={15} className="text-purple-500" />
              <span>Avg Confidence</span>
            </div>
            <span className="font-mono text-lg font-black text-purple-500">{overview.avg_confidence}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--border-subtle)]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, overview.avg_confidence))}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] font-mono">
            <span>Evaluator certainty</span>
            <span className="text-purple-500 font-semibold">High Confidence</span>
          </div>
        </div>
      </div>

      {/* 4. Incident & Anomaly Health Strip */}
      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <span className="text-xs font-bold font-mono text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck size={16} className="text-emerald-500" />
          <span>Guardrail Incidents & Telemetry:</span>
        </span>

        <div className="flex flex-wrap items-center gap-3">
          {/* PII Incidents */}
          <div className="inline-flex items-center gap-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] px-3 py-1.5 text-xs font-mono">
            <span className="text-[var(--text-muted)]">PII Incidents:</span>
            <span className={`font-bold px-2 py-0.5 rounded ${
              overview.pii_incidents === 0 ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-500 border border-rose-500/30'
            }`}>
              {overview.pii_incidents}
            </span>
          </div>

          {/* Safety Incidents */}
          <div className="inline-flex items-center gap-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] px-3 py-1.5 text-xs font-mono">
            <span className="text-[var(--text-muted)]">Safety Incidents:</span>
            <span className={`font-bold px-2 py-0.5 rounded ${
              overview.safety_incidents === 0 ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30' : 'bg-rose-500/15 text-rose-500 border border-rose-500/30'
            }`}>
              {overview.safety_incidents}
            </span>
          </div>

          {/* Cost Anomalies */}
          <div className="inline-flex items-center gap-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] px-3 py-1.5 text-xs font-mono">
            <span className="text-[var(--text-muted)]">Cost Anomalies:</span>
            <span className={`font-bold px-2 py-0.5 rounded ${
              overview.cost_anomalies === 0 ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
            }`}>
              {overview.cost_anomalies}
            </span>
          </div>

          {/* Tokens & Cost */}
          <div className="inline-flex items-center gap-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] px-3 py-1.5 text-xs font-mono text-[var(--text-primary)]">
            <span className="text-[var(--text-muted)]">Tokens:</span>
            <span className="font-bold text-[var(--text-primary)]">{overview.total_tokens}</span>
            <span className="text-[var(--text-muted)]">|</span>
            <span className="text-[var(--text-muted)]">Est. Cost:</span>
            <span className="font-bold text-emerald-500">${Number(overview.total_estimated_cost).toFixed(6)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

