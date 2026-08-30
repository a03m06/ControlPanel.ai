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
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await getDashboardStats();
      setData(res);
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
      setError(err?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // ------------------------------------------------------------
  // Loading state
  // ------------------------------------------------------------

  if (loading && !data) {
    return (
      <div className="space-y-7 animate-in fade-in pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
              System Dashboard
            </h1>

            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
              Real-time multi-vector evaluation overview & AI control telemetry.
            </p>
          </div>

          <button
            type="button"
            disabled
            className="flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3.5 py-2 text-xs font-semibold text-[var(--text-primary)] opacity-60"
          >
            <RefreshCw size={13} className="animate-spin text-blue-400" />
            <span>Loading...</span>
          </button>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-8 shadow-lg">
          <div className="flex items-center justify-center gap-3 text-sm text-[var(--text-muted)]">
            <RefreshCw size={16} className="animate-spin text-blue-400" />
            Loading dashboard data...
          </div>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------
  // Error state
  // ------------------------------------------------------------

  if (error && !data) {
    return (
      <div className="space-y-7 animate-in fade-in pb-12">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            System Dashboard
          </h1>

          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            Real-time multi-vector evaluation overview & AI control telemetry.
          </p>
        </div>

        <div className="rounded-2xl border border-rose-500/30 bg-[var(--bg-surface)] p-8 shadow-lg">
          <div className="flex flex-col items-center justify-center text-center gap-4">
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <Shield size={22} className="text-rose-500" />
            </div>

            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)]">
                Unable to load dashboard
              </h2>

              <p className="text-xs text-[var(--text-muted)] mt-1">
                {error}
              </p>
            </div>

            <button
              type="button"
              onClick={fetchStats}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition-colors"
            >
              <RefreshCw size={13} />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------
  // Real backend response
  // ------------------------------------------------------------

  const overview = data?.overview || {};

  const totalInteractions = Number(overview.total_interactions || 0);
  const allowCount = Number(overview.allow_count || 0);
  const editCount = Number(overview.edit_count || 0);
  const blockCount = Number(overview.block_count || 0);
  const escalateCount = Number(overview.escalate_count || 0);

  const avgPerformance = Number(overview.avg_performance || 0);
  const avgCost = Number(overview.avg_cost || 0);
  const avgSafety = Number(overview.avg_safety || 0);
  const avgConfidence = Number(overview.avg_confidence || 0);

  const totalTokens = Number(overview.total_tokens || 0);
  const totalEstimatedCost = Number(
    overview.total_estimated_cost || 0
  );

  const costAnomalies = Number(overview.cost_anomalies || 0);
  const piiIncidents = Number(overview.pii_incidents || 0);
  const safetyIncidents = Number(overview.safety_incidents || 0);

  const percentage = (count) => {
    if (totalInteractions === 0) return '0';
    return ((count / totalInteractions) * 100).toFixed(0);
  };

  const allowPct = percentage(allowCount);
  const blockPct = percentage(blockCount);
  const editPct = percentage(editCount);
  const escalatePct = percentage(escalateCount);

  return (
    <div className="space-y-7 animate-in fade-in pb-12">

      {/* ========================================================
          1. HEADER
      ======================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            System Dashboard
          </h1>

          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            Real-time multi-vector evaluation overview & AI control telemetry.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3.5 py-2 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-colors shadow-xs disabled:opacity-60"
          title="Refresh statistics"
        >
          <RefreshCw
            size={13}
            className={
              loading
                ? 'animate-spin text-blue-400'
                : 'text-[var(--text-muted)]'
            }
          />

          <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>


      {/* ========================================================
          2. TOP DECISION DISTRIBUTION
      ======================================================== */}

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
            {totalInteractions.toLocaleString()}
          </div>

          <div className="mt-2.5 text-xs text-[var(--text-muted)] flex items-center justify-between font-mono">
            <span>
              {totalTokens.toLocaleString()} tokens
            </span>

            <span className="text-emerald-500 font-semibold">
              ${totalEstimatedCost.toFixed(6)}
            </span>
          </div>

        </div>


        {/* ALLOW */}

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
            {allowCount.toLocaleString()}
          </div>

          <div className="mt-2.5 text-xs text-emerald-500 font-medium flex items-center justify-between font-mono">
            <span>{allowPct}% of total</span>

            <span className="text-[11px] text-[var(--text-muted)]">
              Passed
            </span>
          </div>

        </div>


        {/* EDIT */}

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
            {editCount.toLocaleString()}
          </div>

          <div className="mt-2.5 text-xs text-amber-500 font-medium flex items-center justify-between font-mono">
            <span>{editPct}% of total</span>

            <span className="text-[11px] text-[var(--text-muted)]">
              Corrected
            </span>
          </div>

        </div>


        {/* BLOCK */}

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
            {blockCount.toLocaleString()}
          </div>

          <div className="mt-2.5 text-xs text-rose-500 font-medium flex items-center justify-between font-mono">
            <span>{blockPct}% of total</span>

            <span className="text-[11px] text-[var(--text-muted)]">
              Shielded
            </span>
          </div>

        </div>


        {/* ESCALATE */}

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
            {escalateCount.toLocaleString()}
          </div>

          <div className="mt-2.5 text-xs text-purple-500 font-medium flex items-center justify-between font-mono">
            <span>{escalatePct}% of total</span>

            <span className="text-[11px] text-[var(--text-muted)]">
              {escalateCount > 0 ? '! Action req' : '0 Pending'}
            </span>
          </div>

        </div>

      </div>


      {/* ========================================================
          3. CORE SCORES
      ======================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* PERFORMANCE */}

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-lg space-y-3">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)]">
              <Activity size={15} className="text-blue-500" />
              <span>Avg Performance</span>
            </div>

            <span className="font-mono text-lg font-black text-blue-500">
              {avgPerformance} / 100
            </span>

          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--border-subtle)]">

            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.max(0, avgPerformance))}%`
              }}
            />

          </div>

          <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] font-mono">
            <span>Semantic & consistency fit</span>

            <span className="text-emerald-500 font-semibold">
              {avgPerformance >= 90 ? 'Optimal' : 'Normal'}
            </span>
          </div>

        </div>


        {/* COST */}

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-lg space-y-3">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)]">
              <DollarSign size={15} className="text-amber-500" />
              <span>Avg Cost Score</span>
            </div>

            <span className="font-mono text-lg font-black text-amber-500">
              {avgCost} / 100
            </span>

          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--border-subtle)]">

            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.max(0, avgCost))}%`
              }}
            />

          </div>

          <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] font-mono">
            <span>Token budget efficiency</span>

            <span className="text-amber-500 font-semibold">
              {avgCost >= 90 ? 'Efficient' : 'Review'}
            </span>
          </div>

        </div>


        {/* SAFETY */}

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-lg space-y-3">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)]">
              <Shield size={15} className="text-emerald-500" />
              <span>Avg Safety Score</span>
            </div>

            <span className="font-mono text-lg font-black text-emerald-500">
              {avgSafety} / 100
            </span>

          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--border-subtle)]">

            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.max(0, avgSafety))}%`
              }}
            />

          </div>

          <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] font-mono">
            <span>PII & toxicity guardrails</span>

            <span className="text-emerald-500 font-semibold">
              {avgSafety >= 90 ? 'Protected' : 'Alert'}
            </span>
          </div>

        </div>


        {/* CONFIDENCE */}

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-lg space-y-3">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)]">
              <Sparkles size={15} className="text-purple-500" />
              <span>Avg Confidence</span>
            </div>

            <span className="font-mono text-lg font-black text-purple-500">
              {avgConfidence}%
            </span>

          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--border-subtle)]">

            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.max(0, avgConfidence))}%`
              }}
            />

          </div>

          <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] font-mono">
            <span>Evaluator certainty</span>

            <span className="text-purple-500 font-semibold">
              {avgConfidence >= 90
                ? 'High Confidence'
                : 'Review'}
            </span>
          </div>

        </div>

      </div>


      {/* ========================================================
          4. INCIDENT & ANOMALY HEALTH
      ======================================================== */}

      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 shadow-lg flex flex-wrap items-center justify-between gap-4">

        <span className="text-xs font-bold font-mono text-[var(--text-primary)] uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck size={16} className="text-emerald-500" />
          <span>Guardrail Incidents & Telemetry:</span>
        </span>

        <div className="flex flex-wrap items-center gap-3">

          {/* PII */}

          <div className="inline-flex items-center gap-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] px-3 py-1.5 text-xs font-mono">

            <span className="text-[var(--text-muted)]">
              PII Incidents:
            </span>

            <span
              className={`font-bold px-2 py-0.5 rounded ${
                piiIncidents === 0
                  ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-500 border border-rose-500/30'
              }`}
            >
              {piiIncidents}
            </span>

          </div>


          {/* SAFETY */}

          <div className="inline-flex items-center gap-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] px-3 py-1.5 text-xs font-mono">

            <span className="text-[var(--text-muted)]">
              Safety Incidents:
            </span>

            <span
              className={`font-bold px-2 py-0.5 rounded ${
                safetyIncidents === 0
                  ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-500 border border-rose-500/30'
              }`}
            >
              {safetyIncidents}
            </span>

          </div>


          {/* COST ANOMALIES */}

          <div className="inline-flex items-center gap-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] px-3 py-1.5 text-xs font-mono">

            <span className="text-[var(--text-muted)]">
              Cost Anomalies:
            </span>

            <span
              className={`font-bold px-2 py-0.5 rounded ${
                costAnomalies === 0
                  ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
              }`}
            >
              {costAnomalies}
            </span>

          </div>


          {/* TOKENS + COST */}

          <div className="inline-flex items-center gap-2 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] px-3 py-1.5 text-xs font-mono text-[var(--text-primary)]">

            <span className="text-[var(--text-muted)]">
              Tokens:
            </span>

            <span className="font-bold text-[var(--text-primary)]">
              {totalTokens.toLocaleString()}
            </span>

            <span className="text-[var(--text-muted)]">
              |
            </span>

            <span className="text-[var(--text-muted)]">
              Est. Cost:
            </span>

            <span className="font-bold text-emerald-500">
              ${totalEstimatedCost.toFixed(6)}
            </span>

          </div>

        </div>

      </div>

    </div>
  );
}