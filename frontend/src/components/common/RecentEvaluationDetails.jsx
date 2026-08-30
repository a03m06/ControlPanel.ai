import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Code2, ArrowRight, ExternalLink, CheckCircle2 } from 'lucide-react';
import DecisionBadge from './DecisionBadge';

export default function RecentEvaluationDetails({ details, allRecent = [] }) {
  const [selectedId, setSelectedId] = useState(details?.id || '1025');

  const currentItem = allRecent.find(item => item.id === selectedId) || details;
  if (!currentItem) return null;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 shadow-xs transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-2.5 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Recent Evaluation & Response Details
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Deep inspection of how prompt, response, scores, and decision align
          </p>
        </div>

        {/* Event Selector Pill if multiple recent events exist */}
        <div className="flex items-center gap-2">
          {allRecent && allRecent.length > 1 && (
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">Sample:</span>
              <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-0.5">
                {allRecent.slice(0, 3).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={`px-2 py-0.5 text-xs font-mono rounded transition-colors ${
                      selectedId === item.id
                        ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-bold shadow-xs'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    #{item.id}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Link
            to={`/events/${currentItem.id}`}
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <span>Full Audit</span>
            <ExternalLink size={11} />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Prompt & Response (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          
          {/* PROMPT */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              <FileText size={13} className="text-slate-400" />
              <span>PROMPT</span>
            </div>
            <div className="rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 p-3 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
              {currentItem.prompt}
            </div>
          </div>

          {/* AI RESPONSE */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
              <div className="flex items-center gap-1.5">
                <Code2 size={13} className="text-slate-400" />
                <span>AI RESPONSE</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono font-normal">
                {currentItem.latency || '210ms'} latency
              </span>
            </div>
            <div className="rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 p-3 text-xs text-slate-800 dark:text-slate-200 font-mono leading-relaxed max-h-36 overflow-y-auto whitespace-pre-wrap">
              {currentItem.response}
            </div>
          </div>

        </div>

        {/* Right Column: Scores, Issues, Decision, Token Usage (5 Cols) */}
        <div className="lg:col-span-5 space-y-3 flex flex-col justify-between">
          
          {/* Scores Row */}
          <div className="grid grid-cols-3 gap-2 text-center">
            {/* Performance Score */}
            <div className="rounded-lg border border-blue-200 dark:border-blue-800/60 bg-blue-50/40 dark:bg-blue-950/40 p-2">
              <span className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-400 block truncate">PERFORMANCE</span>
              <span className="text-lg font-extrabold font-mono text-slate-900 dark:text-white">{currentItem.performanceScore || currentItem.performance}</span>
            </div>

            {/* Cost Score */}
            <div className="rounded-lg border border-amber-200 dark:border-amber-800/60 bg-amber-50/40 dark:bg-amber-950/40 p-2">
              <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 block truncate">COST</span>
              <span className="text-lg font-extrabold font-mono text-slate-900 dark:text-white">{currentItem.costScore || currentItem.cost}</span>
            </div>

            {/* Responsibility Score */}
            <div className="rounded-lg border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/40 p-2">
              <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block truncate">RESPONSIBILITY</span>
              <span className="text-lg font-extrabold font-mono text-slate-900 dark:text-white">{currentItem.responsibilityScore || currentItem.responsibility}</span>
            </div>
          </div>

          {/* Decision & Issues */}
          <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 p-3 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-600 dark:text-slate-400 uppercase text-[10px]">FINAL DECISION:</span>
              <DecisionBadge decision={currentItem.finalDecision || currentItem.decision} size="sm" />
            </div>

            {/* Detected Issues */}
            {currentItem.detectedIssues && currentItem.detectedIssues.length > 0 ? (
              <div className="space-y-1">
                <span className="font-bold text-slate-600 dark:text-slate-400 uppercase text-[10px]">DETECTED ISSUES:</span>
                <div className="flex flex-wrap gap-1">
                  {currentItem.detectedIssues.map((issue, idx) => (
                    <span key={idx} className="rounded bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 px-1.5 py-0.5 text-[10px] text-rose-700 dark:text-rose-300 font-mono">
                      ⚠️ {issue}
                    </span>
                  ))}
                </div>
              </div>
            ) : currentItem.issues && currentItem.issues.length > 0 ? (
              <div className="space-y-1">
                <span className="font-bold text-slate-600 dark:text-slate-400 uppercase text-[10px]">DETECTED ISSUES:</span>
                <div className="flex flex-wrap gap-1">
                  {currentItem.issues.map((issue, idx) => (
                    <span key={idx} className="rounded bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 px-1.5 py-0.5 text-[10px] text-rose-700 dark:text-rose-300 font-mono">
                      ⚠️ {issue}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                <CheckCircle2 size={12} />
                <span>Zero compliance issues detected</span>
              </div>
            )}

            {/* Token Usage */}
            <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-600 dark:text-slate-400">
              <span>TOKEN USAGE:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {currentItem.tokenUsage ? `${currentItem.tokenUsage.actual} tokens (${currentItem.tokenUsage.ratio})` : '48 tokens (1.20x)'}
              </span>
            </div>
          </div>

          {/* Action */}
          <Link
            to={`/events/${currentItem.id}`}
            className="w-full text-center rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
          >
            <span>View Full Details for #{currentItem.id}</span>
            <ArrowRight size={12} />
          </Link>

        </div>

      </div>
    </div>
  );
}
