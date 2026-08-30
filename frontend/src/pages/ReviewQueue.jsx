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
import { getReviewQueue, reviewEvaluation } from '../services/api';

export default function ReviewQueue() {
  const { showToast, refreshReviews } = useOutletContext() || {};
  
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [sortOption, setSortOption] = useState('risk'); // 'risk', 'perf', 'newest'
  
  const [selectedReviewItem, setSelectedReviewItem] = useState(null);
  const [reviewingId, setReviewingId] = useState(null);
  const [reviewerNote, setReviewerNote] = useState('');

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const data = await getReviewQueue();
      setQueue(data);
    } catch (err) {
      console.error('Error fetching review queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleReviewAction = async (id, action) => {
    setReviewingId(id);
    try {
      const res = await reviewEvaluation(id, action, reviewerNote);
      if (res.success) {
        if (showToast) {
          showToast({
            type: action === 'APPROVE' ? 'success' : 'error',
            title: `Item #${id} ${action === 'APPROVE' ? 'Approved' : 'Rejected'}`,
            message: res.message
          });
        }
        await fetchQueue();
        if (refreshReviews) refreshReviews();
        setSelectedReviewItem(null);
        setReviewerNote('');
      }
    } catch (err) {
      if (showToast) {
        showToast({
          type: 'error',
          title: 'Review Action Failed',
          message: err.message || 'Error updating review'
        });
      }
    } finally {
      setReviewingId(null);
    }
  };

  const filteredQueue = queue
    .filter(item => {
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        const matchesId = (item.id || '').toLowerCase().includes(s);
        const matchesReason = (item.reason || '').toLowerCase().includes(s);
        const matchesPrompt = (item.prompt || '').toLowerCase().includes(s);
        if (!matchesId && !matchesReason && !matchesPrompt) return false;
      }
      if (riskFilter !== 'ALL' && item.risk !== riskFilter) return false;
      if (statusFilter === 'PENDING' && item.status && item.status !== 'PENDING') return false;
      if (statusFilter === 'RESOLVED' && item.status === 'PENDING') return false;
      return true;
    })
    .sort((a, b) => {
      if (sortOption === 'risk') {
        const riskOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        return (riskOrder[b.risk] || 0) - (riskOrder[a.risk] || 0);
      }
      if (sortOption === 'perf') {
        return (a.performance || 0) - (b.performance || 0);
      }
      return 0;
    });

  const pendingCount = queue.filter(item => !item.status || item.status === 'PENDING').length;

  const handleExportCSV = () => {
    const headers = ['ID', 'Risk Level', 'Reason / Issue', 'Perf. Score', 'Cost Impact', 'Resp. Score', 'Decision', 'Status'];
    const rows = filteredQueue.map(item => [
      `"#${item.id}"`,
      `"${item.risk}"`,
      `"${(item.reason || '').replace(/"/g, '""')}"`,
      item.performance,
      item.cost,
      item.responsibility,
      `"${item.decision}"`,
      `"${item.status || 'PENDING'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `review_queue_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* 1. Header (Screenshot 4) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Review Queue
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="h-2 w-2 rounded-full bg-amber-400"></span>
            <p className="text-xs sm:text-sm text-[var(--text-muted)]">
              {pendingCount} Pending Items requiring human oversight
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Export Button */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-3.5 py-2 text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-colors shadow-xs"
          >
            <Download size={14} />
            <span>Export</span>
          </button>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={fetchQueue}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600/15 border border-blue-500/30 hover:bg-blue-600/25 px-3.5 py-2 text-xs font-semibold text-blue-500 transition-colors shadow-xs"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. Search & Filter Bar (Screenshot 4) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3.5 shadow-lg">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px]">
            <Search size={14} className="absolute left-3.5 top-3 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search ID or Issue..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] pl-9 pr-3.5 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>

          {/* All Risks Dropdown */}
          <div className="relative">
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="w-full sm:w-auto appearance-none rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] pl-3.5 pr-8 py-2 text-xs text-[var(--text-primary)] focus:border-blue-500 focus:outline-none transition-colors cursor-pointer"
            >
              <option value="ALL">All Risks</option>
              <option value="HIGH">High Risk</option>
              <option value="MEDIUM">Medium Risk</option>
              <option value="LOW">Low Risk</option>
            </select>
            <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-3 text-[var(--text-muted)]" />
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto appearance-none rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] pl-3.5 pr-8 py-2 text-xs text-[var(--text-primary)] focus:border-blue-500 focus:outline-none transition-colors cursor-pointer"
            >
              <option value="PENDING">Status: Pending</option>
              <option value="RESOLVED">Status: Resolved</option>
              <option value="ALL">All Statuses</option>
            </select>
            <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-3 text-[var(--text-muted)]" />
          </div>
        </div>

        {/* Sort By Dropdown */}
        <div className="flex items-center gap-2 self-end lg:self-auto">
          <span className="text-xs text-[var(--text-muted)] font-medium">Sort by:</span>
          <div className="relative">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="appearance-none rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] pl-3.5 pr-8 py-2 text-xs font-semibold text-[var(--text-primary)] focus:border-blue-500 focus:outline-none transition-colors cursor-pointer"
            >
              <option value="risk">Risk Score ↓</option>
              <option value="perf">Performance ↑</option>
              <option value="newest">Newest First</option>
            </select>
            <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-3 text-[var(--text-muted)]" />
          </div>
        </div>
      </div>

      {/* 3. Review Table (Screenshot 4) */}
      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 shadow-lg">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
          </div>
        ) : filteredQueue.length === 0 ? (
          <div className="py-16 text-center text-xs text-[var(--text-muted)] space-y-2">
            <Check size={32} className="text-emerald-500 mx-auto" />
            <p className="font-semibold text-[var(--text-primary)]">No items found</p>
            <p>No human review requests matching the current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
                  <th className="pb-3.5 pr-3 font-mono">ID</th>
                  <th className="pb-3.5 pr-3">RISK LEVEL</th>
                  <th className="pb-3.5 pr-4">REASON / ISSUE</th>
                  <th className="pb-3.5 pr-3 text-center font-mono">PERF. SCORE</th>
                  <th className="pb-3.5 pr-3 text-center font-mono">COST IMPACT</th>
                  <th className="pb-3.5 pr-3 text-center font-mono">RESP. SCORE</th>
                  <th className="pb-3.5 pr-4">SYSTEM DECISION</th>
                  <th className="pb-3.5 pr-2 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {filteredQueue.map((item) => {
                  const isResolved = item.status && item.status !== 'PENDING';


                  return (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedReviewItem(item)}
                      className="hover:bg-[#12192d] transition-colors cursor-pointer group"
                    >
                      {/* ID */}
                      <td className="py-4 pr-3 font-mono font-bold text-slate-300 group-hover:text-blue-400 transition-colors">
                        #{item.id}
                      </td>

                      {/* Risk Level */}
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

                      {/* Reason / Issue */}
                      <td className="py-4 pr-4 max-w-xs sm:max-w-md">
                        <div className="font-semibold text-slate-200 group-hover:text-white transition-colors">
                          {item.reason}
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
                          <span>HUMAN REVIEW</span>
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-4 pr-2 text-right" onClick={(e) => e.stopPropagation()}>
                        {isResolved ? (
                          <span className={`inline-block font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${
                            item.status === 'APPROVED'
                              ? 'bg-emerald-950/60 text-emerald-400 border-emerald-700/50'
                              : 'bg-rose-950/60 text-rose-400 border-rose-700/50'
                          }`}>
                            {item.status}
                          </span>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleReviewAction(item.id, 'APPROVE')}
                              disabled={reviewingId === item.id}
                              className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-2.5 py-1 text-xs font-semibold text-white shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1"
                              title="Approve response"
                            >
                              <Check size={12} />
                              <span className="hidden sm:inline">Approve</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReviewAction(item.id, 'REJECT')}
                              disabled={reviewingId === item.id}
                              className="rounded-lg bg-rose-600 hover:bg-rose-500 px-2.5 py-1 text-xs font-semibold text-white shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1"
                              title="Reject response"
                            >
                              <X size={12} />
                              <span className="hidden sm:inline">Reject</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer (Screenshot 4) */}
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-[#182136] text-xs">
          <span className="text-slate-400 font-mono">
            Showing 1 to {filteredQueue.length} of {queue.length} entries
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

      {/* 4. Detailed Review Modal (Required by prompt) */}
      {selectedReviewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-3xl rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-2xl space-y-5 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2.5">
                <UserCheck size={20} className="text-purple-400" />
                <div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">
                    Detailed Response Review — #{selectedReviewItem.id}
                  </h3>
                  <span className="text-[11px] font-mono text-[var(--text-muted)]">
                    Category: {selectedReviewItem.category || 'Compliance Flag'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReviewItem(null)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Why Flagged Alert */}
            <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3.5 space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-500 uppercase tracking-wide">
                <ShieldAlert size={15} />
                <span>Why It Was Flagged:</span>
              </div>
              <p className="text-xs text-rose-400 dark:text-rose-200 leading-relaxed font-medium">
                {selectedReviewItem.reason}
              </p>
            </div>

            {/* Prompt & Response */}
            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] flex items-center gap-1.5">
                  <FileText size={13} className="text-blue-500" />
                  <span>User Prompt:</span>
                </span>
                <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3 text-[var(--text-primary)] leading-relaxed">
                  {selectedReviewItem.prompt}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] flex items-center gap-1.5">
                  <Code2 size={13} className="text-blue-500" />
                  <span>AI Response:</span>
                </span>
                <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3 text-[var(--text-primary)] font-mono text-[12px] leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {selectedReviewItem.response}
                </div>
              </div>
            </div>

            {/* Pillar Scores Breakdown */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Performance</span>
                <div className="text-xl font-black font-mono text-[var(--text-primary)] mt-1">
                  {selectedReviewItem.performance} <span className="text-[10px] text-[var(--text-muted)] font-normal">/100</span>
                </div>
              </div>
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Cost Impact</span>
                <div className="text-xl font-black font-mono text-[var(--text-primary)] mt-1">
                  {selectedReviewItem.cost} <span className="text-[10px] text-[var(--text-muted)] font-normal">/100</span>
                </div>
              </div>
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Responsibility</span>
                <div className="text-xl font-black font-mono text-[var(--text-primary)] mt-1">
                  {selectedReviewItem.responsibility} <span className="text-[10px] text-[var(--text-muted)] font-normal">/100</span>
                </div>
              </div>
            </div>


            {/* Current Recommendation */}
            <div className="text-xs text-[var(--text-muted)] bg-[var(--bg-card)] border border-[var(--border-subtle)] p-3 rounded-xl">
              <span className="font-bold text-[var(--text-primary)]">Current Recommendation: </span>
              <span>{selectedReviewItem.decision === 'BLOCK' ? 'Confirm gate drop to protect privacy/safety guidelines.' : 'Verify domain specific figures before manual authorization.'}</span>
            </div>

            {/* Reviewer Note Input */}
            <div>
              <label className="block text-[11px] font-medium text-[var(--text-muted)] mb-1">
                Optional Reviewer Note:
              </label>
              <input
                type="text"
                value={reviewerNote}
                onChange={(e) => setReviewerNote(e.target.value)}
                placeholder="Add audit rationale before approval or rejection..."
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]">
              <Link
                to={`/events/${selectedReviewItem.id}`}
                className="text-xs font-semibold text-blue-500 hover:underline flex items-center gap-1"
              >
                <span>Full Inspection Log</span>
                <ExternalLink size={12} />
              </Link>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleReviewAction(selectedReviewItem.id, 'REJECT')}
                  disabled={reviewingId === selectedReviewItem.id}
                  className="rounded-xl bg-rose-600 hover:bg-rose-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-rose-600/20 transition-all flex items-center gap-1.5"
                >
                  <X size={14} />
                  <span>Reject Response</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleReviewAction(selectedReviewItem.id, 'APPROVE')}
                  disabled={reviewingId === selectedReviewItem.id}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-1.5"
                >
                  <Check size={14} />
                  <span>Approve Response</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
