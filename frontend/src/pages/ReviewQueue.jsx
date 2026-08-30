import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  Search,
  Download,
  RefreshCw,
  ChevronDown,
  Check,
  X,
  UserCheck,
  ExternalLink,
  ShieldAlert,
  FileText,
  Code2
} from 'lucide-react';

import {
  getReviewQueue,
  reviewEvaluation
} from '../services/api';

export default function ReviewQueue() {
  const { showToast, refreshReviews } = useOutletContext() || {};

  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [sortOption, setSortOption] = useState('risk');

  const [selectedReviewItem, setSelectedReviewItem] = useState(null);
  const [reviewingId, setReviewingId] = useState(null);

  // ------------------------------------------------------------
  // Fetch real review queue from FastAPI
  // ------------------------------------------------------------

  const fetchQueue = async () => {
    setLoading(true);

    try {
      const data = await getReviewQueue();

      // Backend should return an array.
      // Keep the UI safe if the response is unexpectedly empty/null.
      setQueue(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching review queue:', err);

      setQueue([]);

      if (showToast) {
        showToast({
          type: 'error',
          title: 'Human Review Error',
          message:
            err?.message ||
            'Failed to load escalated interactions.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  // ------------------------------------------------------------
  // Human review action
  //
  // UI:
  //   APPROVE -> backend ALLOW
  //   REJECT  -> backend BLOCK
  //
  // api.js performs this translation.
  // ------------------------------------------------------------

  const handleReviewAction = async (id, action) => {
    setReviewingId(id);

    try {
      const result = await reviewEvaluation(id, action);

      console.log('Review action result:', result);

      if (showToast) {
        showToast({
          type: action === 'APPROVE' ? 'success' : 'error',

          title:
            action === 'APPROVE'
              ? `Item #${id} Approved`
              : `Item #${id} Blocked`,

          message:
            result?.message ||
            (
              action === 'APPROVE'
                ? 'Interaction approved and marked ALLOW.'
                : 'Interaction rejected and marked BLOCK.'
            )
        });
      }

      // Reload the queue from the database.
      // The reviewed item will no longer appear
      // if the backend removes it from the review queue.
      await fetchQueue();

      // Update the queue counter in Layout.
      if (refreshReviews) {
        refreshReviews();
      }

      setSelectedReviewItem(null);
    } catch (err) {
      console.error('Review action failed:', err);

      if (showToast) {
        showToast({
          type: 'error',
          title: 'Review Action Failed',
          message:
            err?.message ||
            'Error updating the review decision.'
        });
      }
    } finally {
      setReviewingId(null);
    }
  };

  // ------------------------------------------------------------
  // Normalize backend fields for the existing UI
  //
  // This allows the component to tolerate slightly different
  // backend naming without changing the API client.
  // ------------------------------------------------------------

  const normalizedQueue = queue.map((item) => {
    const id = item.id ?? item.interaction_id;

    const decision =
      item.decision ??
      item.final_decision ??
      'HUMAN REVIEW';

    const performance =
      item.performance ??
      item.performance_score ??
      item.performanceRisk ??
      0;

    const cost =
      item.cost ??
      item.cost_score ??
      item.costRisk ??
      0;

    const responsibility =
      item.responsibility ??
      item.safety_score ??
      item.responsibility_score ??
      0;

    const reason =
      item.reason ??
      item.issue ??
      (
        Array.isArray(item.issues)
          ? item.issues[0]
          : ''
      ) ??
      'Manual review required';

    const prompt =
      item.prompt ??
      item.user_prompt ??
      '';

    const response =
      item.response ??
      item.llm_response ??
      item.output ??
      '';

    const timestamp =
      item.timestamp ??
      item.created_at ??
      '';

    let risk = item.risk;

    if (!risk) {
      if (responsibility < 40) {
        risk = 'HIGH';
      } else if (
        decision === 'HUMAN REVIEW' ||
        performance < 75
      ) {
        risk = 'MEDIUM';
      } else {
        risk = 'LOW';
      }
    }

    return {
      ...item,
      id,
      decision,
      performance,
      cost,
      responsibility,
      reason,
      prompt,
      response,
      timestamp,
      risk
    };
  });

  // ------------------------------------------------------------
  // Search / filters / sorting
  // ------------------------------------------------------------

  const filteredQueue = normalizedQueue
    .filter((item) => {
      if (searchTerm) {
        const s = searchTerm.toLowerCase();

        const matchesId = String(item.id ?? '')
          .toLowerCase()
          .includes(s);

        const matchesReason = String(item.reason ?? '')
          .toLowerCase()
          .includes(s);

        const matchesPrompt = String(item.prompt ?? '')
          .toLowerCase()
          .includes(s);

        if (!matchesId && !matchesReason && !matchesPrompt) {
          return false;
        }
      }

      if (
        riskFilter !== 'ALL' &&
        item.risk !== riskFilter
      ) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortOption === 'risk') {
        const riskOrder = {
          HIGH: 3,
          MEDIUM: 2,
          LOW: 1
        };

        return (
          (riskOrder[b.risk] || 0) -
          (riskOrder[a.risk] || 0)
        );
      }

      if (sortOption === 'perf') {
        return (
          (a.performance || 0) -
          (b.performance || 0)
        );
      }

      if (sortOption === 'newest') {
        return (
          new Date(b.timestamp || 0) -
          new Date(a.timestamp || 0)
        );
      }

      return 0;
    });

  // ------------------------------------------------------------
  // CSV export
  // ------------------------------------------------------------

  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Risk Level',
      'Reason / Issue',
      'Perf. Score',
      'Cost Impact',
      'Resp. Score',
      'Decision'
    ];

    const escapeCSV = (value) => {
      return `"${String(value ?? '').replace(/"/g, '""')}"`;
    };

    const rows = filteredQueue.map((item) => [
      escapeCSV(`#${item.id}`),
      escapeCSV(item.risk),
      escapeCSV(item.reason),
      item.performance,
      item.cost,
      item.responsibility,
      escapeCSV(item.decision)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(','))
    ].join('\n');

    const blob = new Blob(
      [csvContent],
      { type: 'text/csv;charset=utf-8;' }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');

    link.href = url;
    link.download = `human_review_${Date.now()}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // ------------------------------------------------------------
  // UI
  // ------------------------------------------------------------

  return (
    <div className="space-y-6 animate-in fade-in">

      {/* ------------------------------------------------------ */}
      {/* 1. Header */}
      {/* ------------------------------------------------------ */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Human Review
          </h1>

          <div className="flex items-center gap-2 mt-1">
            <span className="h-2 w-2 rounded-full bg-amber-400" />

            <p className="text-xs sm:text-sm text-[var(--text-muted)]">
              {queue.length} Items requiring human oversight
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">

          {/* Export */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3.5 py-2 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-colors shadow-xs"
          >
            <Download size={14} />
            <span>Export</span>
          </button>

          {/* Refresh */}
          <button
            type="button"
            onClick={fetchQueue}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600/15 border border-blue-500/30 hover:bg-blue-600/25 px-3.5 py-2 text-xs font-semibold text-blue-500 transition-colors shadow-xs disabled:opacity-50"
          >
            <RefreshCw
              size={14}
              className={loading ? 'animate-spin' : ''}
            />
            <span>Refresh</span>
          </button>

        </div>
      </div>

      {/* ------------------------------------------------------ */}
      {/* 2. Search & Filter Bar */}
      {/* ------------------------------------------------------ */}

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3.5 shadow-lg">

        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">

          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px]">

            <Search
              size={14}
              className="absolute left-3.5 top-3 text-[var(--text-muted)]"
            />

            <input
              type="text"
              placeholder="Search ID or Issue..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] pl-9 pr-3.5 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-blue-500 focus:outline-none transition-colors"
            />

          </div>

          {/* Risk Filter */}
          <div className="relative">

            <select
              value={riskFilter}
              onChange={(e) =>
                setRiskFilter(e.target.value)
              }
              className="w-full sm:w-auto appearance-none rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] pl-3.5 pr-8 py-2 text-xs text-[var(--text-primary)] focus:border-blue-500 focus:outline-none transition-colors cursor-pointer"
            >
              <option value="ALL">
                All Risks
              </option>

              <option value="HIGH">
                High Risk
              </option>

              <option value="MEDIUM">
                Medium Risk
              </option>

              <option value="LOW">
                Low Risk
              </option>
            </select>

            <ChevronDown
              size={13}
              className="pointer-events-none absolute right-2.5 top-3 text-[var(--text-muted)]"
            />

          </div>

        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 self-end lg:self-auto">

          <span className="text-xs text-[var(--text-muted)] font-medium">
            Sort by:
          </span>

          <div className="relative">

            <select
              value={sortOption}
              onChange={(e) =>
                setSortOption(e.target.value)
              }
              className="appearance-none rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] pl-3.5 pr-8 py-2 text-xs font-semibold text-[var(--text-primary)] focus:border-blue-500 focus:outline-none transition-colors cursor-pointer"
            >
              <option value="risk">
                Risk Score ↓
              </option>

              <option value="perf">
                Performance ↑
              </option>

              <option value="newest">
                Newest First
              </option>
            </select>

            <ChevronDown
              size={13}
              className="pointer-events-none absolute right-2.5 top-3 text-[var(--text-muted)]"
            />

          </div>

        </div>

      </div>

      {/* ------------------------------------------------------ */}
      {/* 3. Review Table */}
      {/* ------------------------------------------------------ */}

      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-lg">

        {loading ? (

          <div className="flex h-64 items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
          </div>

        ) : filteredQueue.length === 0 ? (

          <div className="py-16 text-center text-xs text-[var(--text-muted)] space-y-2">

            <Check
              size={32}
              className="text-emerald-500 mx-auto"
            />

            <p className="font-semibold text-[var(--text-primary)]">
              No items found
            </p>

            <p>
              No human review requests matching the current filters.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full text-left text-xs">

              <thead>

                <tr className="border-b border-[var(--border-subtle)] text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">

                  <th className="pb-3.5 pr-3 font-mono">
                    ID
                  </th>

                  <th className="pb-3.5 pr-3">
                    RISK LEVEL
                  </th>

                  <th className="pb-3.5 pr-4">
                    REASON / ISSUE
                  </th>

                  <th className="pb-3.5 pr-3 text-center font-mono">
                    PERF. SCORE
                  </th>

                  <th className="pb-3.5 pr-3 text-center font-mono">
                    COST IMPACT
                  </th>

                  <th className="pb-3.5 pr-3 text-center font-mono">
                    RESP. SCORE
                  </th>

                  <th className="pb-3.5 pr-4">
                    SYSTEM DECISION
                  </th>

                  <th className="pb-3.5 pr-2 text-right">
                    ACTION
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-[var(--border-subtle)]">

                {filteredQueue.map((item) => (

                  <tr
                    key={item.id}
                    onClick={() =>
                      setSelectedReviewItem(item)
                    }
                    className="hover:bg-[#12192d] transition-colors cursor-pointer group"
                  >

                    {/* ID */}
                    <td className="py-4 pr-3 font-mono font-bold text-slate-300 group-hover:text-blue-400 transition-colors">
                      #{item.id}
                    </td>

                    {/* Risk */}
                    <td className="py-4 pr-3">

                      {item.risk === 'HIGH' && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-950/50 border border-rose-800/40 px-2.5 py-0.5 text-[10px] font-bold font-mono text-rose-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                          <span>HIGH</span>
                        </span>
                      )}

                      {item.risk === 'MEDIUM' && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-950/50 border border-amber-800/40 px-2.5 py-0.5 text-[10px] font-bold font-mono text-amber-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                          <span>MEDIUM</span>
                        </span>
                      )}

                      {item.risk === 'LOW' && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/50 border border-emerald-800/40 px-2.5 py-0.5 text-[10px] font-bold font-mono text-emerald-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          <span>LOW</span>
                        </span>
                      )}

                    </td>

                    {/* Reason */}
                    <td className="py-4 pr-4 max-w-xs sm:max-w-md">

                      <div className="font-semibold text-slate-200 group-hover:text-white transition-colors">
                        {item.reason || 'Manual review required'}
                      </div>

                      {item.prompt && (
                        <div className="text-[11px] text-slate-500 truncate mt-0.5 font-sans">
                          {item.prompt}
                        </div>
                      )}

                    </td>

                    {/* Scores */}
                    <td className="py-4 pr-3 text-center font-mono font-bold text-slate-200">
                      {item.performance}
                    </td>

                    <td className="py-4 pr-3 text-center font-mono font-bold text-slate-200">
                      {item.cost}
                    </td>

                    <td className="py-4 pr-3 text-center font-mono font-bold text-slate-200">
                      {item.responsibility}
                    </td>

                    {/* System Decision */}
                    <td className="py-4 pr-4">

                      <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-950/50 border border-purple-800/40 px-2.5 py-1 text-[10px] font-mono font-bold text-purple-300">

                        <UserCheck size={12} />

                        <span>
                          {item.decision === 'HUMAN REVIEW'
                            ? 'HUMAN REVIEW'
                            : item.decision}
                        </span>

                      </span>

                    </td>

                    {/* Action */}
                    <td
                      className="py-4 pr-2 text-right"
                      onClick={(e) =>
                        e.stopPropagation()
                      }
                    >

                      <div className="flex items-center justify-end gap-1.5">

                        {/* Approve */}
                        <button
                          type="button"
                          onClick={() =>
                            handleReviewAction(
                              item.id,
                              'APPROVE'
                            )
                          }
                          disabled={
                            reviewingId === item.id
                          }
                          className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-2.5 py-1 text-xs font-semibold text-white shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1"
                          title="Approve response"
                        >
                          <Check size={12} />

                          <span className="hidden sm:inline">
                            Approve
                          </span>
                        </button>

                        {/* Block */}
                        <button
                          type="button"
                          onClick={() =>
                            handleReviewAction(
                              item.id,
                              'REJECT'
                            )
                          }
                          disabled={
                            reviewingId === item.id
                          }
                          className="rounded-lg bg-rose-600 hover:bg-rose-500 px-2.5 py-1 text-xs font-semibold text-white shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1"
                          title="Block response"
                        >
                          <X size={12} />

                          <span className="hidden sm:inline">
                            Block
                          </span>
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

        {/* Pagination footer */}
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-[#182136] text-xs">

          <span className="text-slate-400 font-mono">
            Showing {filteredQueue.length === 0 ? 0 : 1} to {filteredQueue.length} of {normalizedQueue.length} entries
          </span>

          <div className="flex items-center gap-1.5">

            <button
              type="button"
              disabled
              className="rounded-lg border border-[#1f2a42] bg-[#12192d] px-2.5 py-1 text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold"
            >
              Prev
            </button>

            <button
              type="button"
              className="rounded-lg bg-blue-600 px-2.5 py-1 text-white text-xs font-mono font-bold"
            >
              1
            </button>

            <button
              type="button"
              disabled
              className="rounded-lg border border-[#1f2a42] bg-[#12192d] px-2.5 py-1 text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold"
            >
              Next
            </button>

          </div>

        </div>

      </div>

      {/* ------------------------------------------------------ */}
      {/* 4. Detailed Review Modal */}
      {/* ------------------------------------------------------ */}

      {selectedReviewItem && (

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">

          <div className="w-full max-w-3xl rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-2xl space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">

              <div className="flex items-center gap-2.5">

                <UserCheck
                  size={20}
                  className="text-purple-400"
                />

                <div>

                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    Detailed Response Review — #{selectedReviewItem.id}
                  </h3>

                  <span className="text-[11px] font-mono text-[var(--text-muted)]">
                    Category: {selectedReviewItem.category || 'Compliance Review'}
                  </span>

                </div>

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedReviewItem(null)
                }
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X size={18} />
              </button>

            </div>

            {/* Why flagged */}
            <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3.5 space-y-1">

              <div className="flex items-center gap-2 text-xs font-bold text-rose-500 uppercase tracking-wide">

                <ShieldAlert size={15} />

                <span>
                  Why It Was Flagged:
                </span>

              </div>

              <p className="text-xs text-rose-400 dark:text-rose-200 leading-relaxed font-medium">
                {selectedReviewItem.reason || 'Manual review required.'}
              </p>

            </div>

            {/* Prompt */}
            <div className="space-y-1">

              <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] flex items-center gap-1.5">

                <FileText
                  size={13}
                  className="text-blue-500"
                />

                <span>User Prompt:</span>

              </span>

              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3 text-xs text-[var(--text-primary)] leading-relaxed">
                {selectedReviewItem.prompt || 'No prompt recorded.'}
              </div>

            </div>

            {/* Response */}
            <div className="space-y-1">

              <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] flex items-center gap-1.5">

                <Code2
                  size={13}
                  className="text-blue-500"
                />

                <span>AI Response:</span>

              </span>

              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3 text-[var(--text-primary)] font-mono text-[12px] leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                {selectedReviewItem.response || 'No response recorded.'}
              </div>

            </div>

            {/* Scores */}
            <div className="grid grid-cols-3 gap-3">

              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3 text-center">

                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Performance
                </span>

                <div className="text-xl font-black font-mono text-[var(--text-primary)] mt-1">
                  {selectedReviewItem.performance}

                  <span className="text-[10px] text-[var(--text-muted)] font-normal">
                    {' '}/100
                  </span>
                </div>

              </div>

              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3 text-center">

                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Cost Impact
                </span>

                <div className="text-xl font-black font-mono text-[var(--text-primary)] mt-1">
                  {selectedReviewItem.cost}

                  <span className="text-[10px] text-[var(--text-muted)] font-normal">
                    {' '}/100
                  </span>
                </div>

              </div>

              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3 text-center">

                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  Responsibility
                </span>

                <div className="text-xl font-black font-mono text-[var(--text-primary)] mt-1">
                  {selectedReviewItem.responsibility}

                  <span className="text-[10px] text-[var(--text-muted)] font-normal">
                    {' '}/100
                  </span>
                </div>

              </div>

            </div>

            {/* Recommendation */}
            <div className="text-xs text-[var(--text-muted)] bg-[var(--bg-card)] border border-[var(--border-subtle)] p-3 rounded-xl">

              <span className="font-bold text-[var(--text-primary)]">
                Current Recommendation:
              </span>

              <span>
                {' '}

                {selectedReviewItem.decision === 'BLOCK'
                  ? 'Confirm gate drop to protect privacy/safety guidelines.'
                  : 'Verify the flagged content before manual authorization.'}

              </span>

            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]">

              <Link
                to={`/events/${selectedReviewItem.id}`}
                className="text-xs font-semibold text-blue-500 hover:underline flex items-center gap-1"
              >
                <span>
                  Full Inspection Log
                </span>

                <ExternalLink size={12} />
              </Link>

              <div className="flex items-center gap-2">

                {/* Block */}
                <button
                  type="button"
                  onClick={() =>
                    handleReviewAction(
                      selectedReviewItem.id,
                      'REJECT'
                    )
                  }
                  disabled={
                    reviewingId === selectedReviewItem.id
                  }
                  className="rounded-xl bg-rose-600 hover:bg-rose-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-rose-600/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >

                  <X size={14} />

                  <span>
                    Block Response
                  </span>

                </button>

                {/* Approve */}
                <button
                  type="button"
                  onClick={() =>
                    handleReviewAction(
                      selectedReviewItem.id,
                      'APPROVE'
                    )
                  }
                  disabled={
                    reviewingId === selectedReviewItem.id
                  }
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >

                  <Check size={14} />

                  <span>
                    Approve Response
                  </span>

                </button>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}