import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  Ban, 
  UserCheck, 
  Gauge, 
  Shield, 
  CreditCard, 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  Box, 
  AlertTriangle, 
  Check, 
  ArrowLeft,
  RefreshCw,
  Clock
} from 'lucide-react';
import { getEvaluation } from '../services/api';

export default function EventDetail() {
  const { id } = useParams();
  
  // Accordion state
  const [openPerformance, setOpenPerformance] = useState(true);
  const [openResponsibility, setOpenResponsibility] = useState(true);
  const [openCost, setOpenCost] = useState(true);

  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvent() {
      setLoading(true);
      try {
        if (id) {
          const data = await getEvaluation(id);
          setEventData(data);
        }
      } catch (err) {
        console.error('Error loading event detail:', err);
      } finally {
        setLoading(false);
      }
    }
    loadEvent();
  }, [id]);

  const displayEvalId = id || "1025";
  const displayDate = eventData?.request?.formattedTime || eventData?.request?.timestamp || "Oct 24 14:32:01";
  const displayTokens = eventData?.llm_response?.tokenCount ? `${eventData.llm_response.tokenCount} Tokens` : "1,240 Tokens";
  const displayConfidence = eventData?.performance?.confidence ? `${eventData.performance.confidence}%` : "98.4%";
  const decision = (eventData?.decision?.finalDecision || "ALLOWED").toUpperCase();

  const perfScore = eventData?.performance?.score ?? 92;
  const respScore = eventData?.responsibility?.score ?? 95;
  const costScore = eventData?.cost?.score ?? 88;

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-7 w-7 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          <span className="text-xs font-mono text-slate-400">Loading audit trace #{id}...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      {/* Top Header info */}
      <div className="flex items-center justify-between text-xs font-mono text-[var(--text-muted)]">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Dashboard</span>
        </Link>

        <div>
          <span>Eval ID: </span>
          <span className="text-[var(--text-primary)] font-semibold">EVL-{displayEvalId}</span>
        </div>
      </div>

      {/* Main Page Title and Metadata Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Event Detail Audit
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[var(--text-muted)] mt-2">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="text-[var(--text-muted)]" />
              <span>{displayDate}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Box size={14} className="text-[var(--text-muted)]" />
              <span>{displayTokens}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield size={14} className="text-blue-500" />
              <span>Confidence: {displayConfidence}</span>
            </div>
          </div>
        </div>

        {/* Top-Right Status Badge */}
        <div>
          {decision === 'ALLOWED' || decision === 'ALLOW' ? (
            <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-4 py-2 text-xs font-mono font-bold text-emerald-500 shadow-sm">
              <CheckCircle2 size={15} />
              <span>ALLOWED</span>
            </div>
          ) : decision === 'BLOCK' || decision === 'BLOCKED' ? (
            <div className="inline-flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/15 px-4 py-2 text-xs font-mono font-bold text-rose-500 shadow-sm">
              <Ban size={15} />
              <span>BLOCKED</span>
            </div>
          ) : decision.includes('EDIT') ? (
            <div className="inline-flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/15 px-4 py-2 text-xs font-mono font-bold text-amber-500 shadow-sm">
              <RefreshCw size={15} />
              <span>EDIT / REGENERATE</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 rounded-xl border border-purple-500/40 bg-purple-500/15 px-4 py-2 text-xs font-mono font-bold text-purple-500 shadow-sm">
              <UserCheck size={15} />
              <span>HUMAN REVIEW</span>
            </div>
          )}
        </div>
      </div>

      {/* Prompt & Response Preview Box */}
      {eventData?.request?.prompt && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 space-y-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]">
              USER PROMPT INGESTION
            </span>
            <p className="text-xs text-[var(--text-primary)] font-mono leading-relaxed bg-[var(--bg-card)] p-3 rounded-xl border border-[var(--border-subtle)]">
              "{eventData.request.prompt}"
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]">
              <span>EVALUATED LLM OUTPUT</span>
              <span className="text-[var(--text-muted)] font-normal">{eventData.llm_response?.latencyMs || 210}ms</span>
            </div>
            <p className="text-xs text-[var(--text-primary)] font-mono leading-relaxed bg-[var(--bg-card)] p-3 rounded-xl border border-[var(--border-subtle)] max-h-32 overflow-y-auto whitespace-pre-wrap">
              {eventData.llm_response?.fullText || "Standard response text."}
            </p>
          </div>
        </div>
      )}

      {/* Two-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Assessments & Analysis (~68% width -> lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* 1. Performance Assessment Card */}
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-lg space-y-4">
            <button
              type="button"
              onClick={() => setOpenPerformance(!openPerformance)}
              className="w-full flex items-center justify-between text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Gauge size={18} className="text-blue-500" />
                <h2 className="text-base font-bold text-[var(--text-primary)]">
                  Performance Assessment
                </h2>
              </div>
              <div className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                {openPerformance ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </button>

            {openPerformance && (
              <div className="space-y-4 pt-2 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[var(--text-secondary)]">Overall Performance Score</span>
                  <span className="text-2xl font-black font-mono text-blue-500">{perfScore}/100</span>
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--border-subtle)]">
                  <div 
                    className="h-full rounded-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${perfScore}%` }}
                  />
                </div>

                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  {eventData?.performance?.explanation || 'Execution path evaluated. Semantic relevance score verified against operational specifications.'}
                </p>

                {eventData?.performance?.issues && eventData.performance.issues.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-[var(--border-subtle)]">
                    <span className="text-[10px] font-mono uppercase text-[var(--text-muted)] font-bold">Detected Performance Flags:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {eventData.performance.issues.map((iss, i) => (
                        <span key={i} className="rounded-lg bg-blue-500/15 border border-blue-500/30 px-2 py-0.5 text-xs text-blue-400 font-mono">
                          {iss}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. Responsibility & Compliance Card */}
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-lg space-y-4">
            <button
              type="button"
              onClick={() => setOpenResponsibility(!openResponsibility)}
              className="w-full flex items-center justify-between text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Shield size={18} className="text-purple-500" />
                <h2 className="text-base font-bold text-[var(--text-primary)]">
                  Responsibility & Compliance
                </h2>
              </div>
              <div className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                {openResponsibility ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </button>

            {openResponsibility && (
              <div className="space-y-4 pt-2 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[var(--text-secondary)]">Safety & Ethics Score</span>
                  <span className={`text-2xl font-black font-mono ${respScore < 50 ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {respScore}/100
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--border-subtle)]">
                  <div 
                    className={`h-full rounded-full ${respScore < 50 ? 'bg-rose-500' : 'bg-emerald-500'} transition-all duration-500`}
                    style={{ width: `${respScore}%` }}
                  />
                </div>

                {/* PII Detection & Safe Clearance Box */}
                {eventData?.responsibility?.detectedPii && eventData.responsibility.detectedPii.length > 0 ? (
                  <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-rose-500">
                      <AlertTriangle size={14} />
                      <span>Critical PII Detected by Presidio Engine</span>
                    </div>

                    {eventData.responsibility.detectedPii.map((pii, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="text-[var(--text-muted)] font-medium">{pii.type || 'Entity'}</span>
                        <span className="font-mono text-rose-400 bg-rose-500/20 px-3 py-1 rounded-lg border border-rose-500/40">
                          {pii.text}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 flex items-center gap-2 text-xs text-emerald-500 font-mono">
                    <CheckCircle2 size={16} />
                    <span>Presidio Scanner: 0 sensitive PII entities detected.</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. Cost Analysis Card */}
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-lg space-y-4">
            <button
              type="button"
              onClick={() => setOpenCost(!openCost)}
              className="w-full flex items-center justify-between text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <CreditCard size={18} className="text-amber-500" />
                <h2 className="text-base font-bold text-[var(--text-primary)]">
                  Cost & Token Analysis
                </h2>
              </div>
              <div className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                {openCost ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </button>

            {openCost && (
              <div className="space-y-4 pt-2 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[var(--text-secondary)]">Cost Efficiency Score</span>
                  <span className="text-2xl font-black font-mono text-amber-500">{costScore}/100</span>
                </div>

                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--border-subtle)]">
                  <div 
                    className="h-full rounded-full bg-amber-500 transition-all duration-500"
                    style={{ width: `${costScore}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
                  <div className="rounded-xl bg-[var(--bg-card)] p-3 border border-[var(--border-subtle)]">
                    <span className="text-[var(--text-muted)] block text-[10px]">ACTUAL TOKENS</span>
                    <span className="text-sm font-bold text-[var(--text-primary)] mt-1 block">{eventData?.cost?.actualTokens || 48}</span>
                  </div>
                  <div className="rounded-xl bg-[var(--bg-card)] p-3 border border-[var(--border-subtle)]">
                    <span className="text-[var(--text-muted)] block text-[10px]">TOKEN RATIO</span>
                    <span className="text-sm font-bold text-amber-500 mt-1 block">{eventData?.cost?.tokenRatio || '1.20x'}</span>
                  </div>
                  <div className="rounded-xl bg-[var(--bg-card)] p-3 border border-[var(--border-subtle)]">
                    <span className="text-[var(--text-muted)] block text-[10px]">ESTIMATED COST</span>
                    <span className="text-sm font-bold text-emerald-500 mt-1 block">{eventData?.cost?.costUsd ? `$${eventData.cost.costUsd}` : '$0.00072'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: System Decision & Execution Trace */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Card 1: SYSTEM DECISION */}
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-lg space-y-4">
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]">
              SYSTEM DECISION
            </div>

            <div className="flex items-center gap-3.5 pt-1">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border shadow-sm shrink-0 ${
                decision === 'ALLOWED' || decision === 'ALLOW' ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-500' :
                decision === 'BLOCKED' || decision === 'BLOCK' ? 'bg-rose-500/15 border-rose-500/30 text-rose-500' :
                'bg-purple-500/15 border-purple-500/30 text-purple-500'
              }`}>
                {decision === 'ALLOWED' || decision === 'ALLOW' ? <CheckCircle2 size={24} /> :
                 decision === 'BLOCKED' || decision === 'BLOCK' ? <Ban size={24} /> :
                 <UserCheck size={24} />}
              </div>
              <div>
                <div className="text-xl font-bold font-mono text-[var(--text-primary)] tracking-wide">
                  {decision}
                </div>
                <div className="text-xs font-mono text-[var(--text-muted)] font-medium">
                  {eventData?.decision?.ruleMatched || 'Policy Rule #RULE-RESP-001'}
                </div>
              </div>
            </div>

            {/* Explanation Box */}
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 text-xs text-[var(--text-primary)] leading-relaxed font-sans">
              <span className="font-bold text-[var(--text-secondary)]">Reason: </span>
              {eventData?.decision?.reason || 'Cumulative evaluation scores processed against ControlPlane guardrails.'}
            </div>
          </div>

          {/* Card 2: EXECUTION TRACE */}
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]">
              <span>EXECUTION TRACE</span>
              <Clock size={12} />
            </div>

            <div className="relative pl-6 space-y-5">
              {/* Vertical Guide Line */}
              <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-[var(--border-subtle)]" />

              {/* Step 1 */}
              <div className="relative flex items-start gap-3">
                <div className="absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--bg-surface)]">
                  <div className="h-3 w-3 rounded-full border-2 border-slate-400 bg-[var(--bg-surface)] flex items-center justify-center">
                    <div className="h-1 w-1 rounded-full bg-slate-400" />
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-mono text-[var(--text-muted)]">14:32:01.012</div>
                  <div className="text-xs font-semibold text-[var(--text-primary)] mt-0.5">Request Received (API Gateway)</div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative flex items-start gap-3">
                <div className="absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--bg-surface)]">
                  <div className="h-3 w-3 rounded-full border-2 border-blue-400 bg-[var(--bg-surface)] flex items-center justify-center">
                    <div className="h-1 w-1 rounded-full bg-blue-400" />
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-mono text-[var(--text-muted)]">14:32:01.105</div>
                  <div className="text-xs font-semibold text-[var(--text-primary)] mt-0.5">Policy Engine Evaluation Started</div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative flex items-start gap-3">
                <div className="absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--bg-surface)]">
                  <div className="h-3 w-3 rounded-full border-2 border-amber-400 bg-[var(--bg-surface)] flex items-center justify-center">
                    <div className="h-1 w-1 rounded-full bg-amber-400" />
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-mono text-[var(--text-muted)]">14:32:01.450</div>
                  <div className="text-xs font-semibold text-[var(--text-primary)] mt-0.5">Presidio PII & Safety Scan Complete</div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative flex items-start gap-3">
                <div className="absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--bg-surface)]">
                  <div className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 text-white">
                    <Check size={9} strokeWidth={3.5} />
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-mono text-[var(--text-muted)]">14:32:01.890</div>
                  <div className="text-xs font-semibold text-[var(--text-primary)] mt-0.5">Decision Policy Output Delivered</div>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

