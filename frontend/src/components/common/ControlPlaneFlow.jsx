import React, { useState } from 'react';
import { 
  Users, 
  Layers, 
  Server, 
  Cpu, 
  Scale, 
  CheckCircle, 
  RefreshCw, 
  Ban, 
  UserCheck, 
  Database,
  ArrowDown,
  Activity,
  DollarSign,
  Shield,
  Info
} from 'lucide-react';

export default function ControlPlaneFlow({ _activeStep = null }) {
  const [selectedNode, setSelectedNode] = useState(null);

  const nodeInfo = {
    user: {
      title: "1. User / Enterprise Application",
      description: "End users, chatbots, internal copilots, or automated services submit prompts and request LLM responses."
    },
    gateway: {
      title: "2. React Dashboard / LLM Gateway",
      description: "Interception middleware and developer UI that ingests the request-response stream prior to downstream consumption."
    },
    backend: {
      title: "3. FastAPI Backend Orchestrator",
      description: "Asynchronously dispatches the payload to parallel worker evaluators and aggregates runtime telemetry."
    },
    parallel: {
      title: "4. Parallel Evaluation Modules",
      description: "Concurrent validation across 3 key pillars: Performance (semantic similarity & hallucinations), Cost (token ratio & budget), and Responsibility (Presidio PII scanner & toxicity)."
    },
    engine: {
      title: "5. Decision Engine",
      description: "Rule-based and threshold-driven arbiter that synthesizes scores into an actionable operational policy outcome."
    },
    outcomes: {
      title: "6. Decision Outcomes",
      description: "ALLOW (low risk), EDIT / REGENERATE (correctable format/cost), BLOCK (PII/unsafe content), or HUMAN REVIEW (uncertain/high-impact)."
    },
    database: {
      title: "7. Database + Audit Logs",
      description: "Immutable SIEM logging, SOC audit trail, compliance records, and real-time dashboard analytics storage."
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-[#111827]/90 p-6 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="text-blue-400" size={18} />
            <h3 className="text-base font-bold text-white tracking-wide">
              ControlPlane System Architecture Flow
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            2D runtime visualization of response evaluation & decision-control pipeline
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>PIPELINE STATUS: ONLINE (PARALLEL)</span>
        </div>
      </div>

      {/* 2D Architecture Diagram Container */}
      <div className="flex flex-col items-center max-w-4xl mx-auto space-y-3 py-2">
        
        {/* Node 1: User / Application */}
        <div 
          onClick={() => setSelectedNode('user')}
          className="w-full max-w-md cursor-pointer rounded-lg border border-slate-700/80 bg-slate-900/90 px-4 py-3 text-center shadow-md transition-all hover:border-blue-500 hover:bg-slate-800/90 group"
        >
          <div className="flex items-center justify-center gap-2">
            <Users size={16} className="text-blue-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              USER / ENTERPRISE APPLICATION
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Generates prompt & receives response</div>
        </div>

        {/* Down Arrow */}
        <div className="flex justify-center text-slate-600">
          <ArrowDown size={18} className="animate-bounce" />
        </div>

        {/* Node 2: React Dashboard / LLM Gateway */}
        <div 
          onClick={() => setSelectedNode('gateway')}
          className="w-full max-w-md cursor-pointer rounded-lg border border-blue-500/40 bg-blue-950/20 px-4 py-3 text-center shadow-md transition-all hover:border-blue-400 hover:bg-blue-950/30 group"
        >
          <div className="flex items-center justify-center gap-2">
            <Layers size={16} className="text-blue-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
              REACT DASHBOARD / LLM GATEWAY
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Control Plane UI & Real-Time Interception Proxy</div>
        </div>

        {/* Down Arrow */}
        <div className="flex justify-center text-slate-600">
          <ArrowDown size={18} />
        </div>

        {/* Node 3: FastAPI Backend */}
        <div 
          onClick={() => setSelectedNode('backend')}
          className="w-full max-w-md cursor-pointer rounded-lg border border-emerald-500/40 bg-emerald-950/20 px-4 py-3 text-center shadow-md transition-all hover:border-emerald-400 hover:bg-emerald-950/30 group"
        >
          <div className="flex items-center justify-center gap-2">
            <Server size={16} className="text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              FASTAPI BACKEND ORCHESTRATOR
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Asynchronous Parallel Evaluator Dispatcher</div>
        </div>

        {/* Down Arrow */}
        <div className="flex justify-center text-slate-600">
          <ArrowDown size={18} />
        </div>

        {/* Node 4: Parallel Evaluation Box */}
        <div 
          onClick={() => setSelectedNode('parallel')}
          className="w-full max-w-xl cursor-pointer rounded-xl border-2 border-indigo-500/40 bg-indigo-950/20 p-4 shadow-lg transition-all hover:border-indigo-400 hover:bg-indigo-950/30"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <Cpu size={16} className="text-indigo-400" />
            <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-300">
              PARALLEL EVALUATION ENGINE
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Performance */}
            <div className="rounded-lg border border-blue-500/30 bg-slate-900/80 p-2.5 text-center">
              <div className="flex items-center justify-center gap-1.5 text-blue-400 text-xs font-bold mb-1">
                <Activity size={14} />
                <span>PERFORMANCE</span>
              </div>
              <p className="text-[10px] text-slate-400">Semantic check, hallucination & instruction match</p>
            </div>

            {/* Cost */}
            <div className="rounded-lg border border-amber-500/30 bg-slate-900/80 p-2.5 text-center">
              <div className="flex items-center justify-center gap-1.5 text-amber-400 text-xs font-bold mb-1">
                <DollarSign size={14} />
                <span>COST</span>
              </div>
              <p className="text-[10px] text-slate-400">Expected tokens, token ratio & budget variance</p>
            </div>

            {/* Responsibility */}
            <div className="rounded-lg border border-emerald-500/30 bg-slate-900/80 p-2.5 text-center">
              <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-xs font-bold mb-1">
                <Shield size={14} />
                <span>RESPONSIBILITY</span>
              </div>
              <p className="text-[10px] text-slate-400">Presidio PII scanner, toxicity & safety policies</p>
            </div>
          </div>
        </div>

        {/* Down Arrow */}
        <div className="flex justify-center text-slate-600">
          <ArrowDown size={18} />
        </div>

        {/* Node 5: Decision Engine */}
        <div 
          onClick={() => setSelectedNode('engine')}
          className="w-full max-w-md cursor-pointer rounded-lg border border-purple-500/40 bg-purple-950/20 px-4 py-3 text-center shadow-md transition-all hover:border-purple-400 hover:bg-purple-950/30 group"
        >
          <div className="flex items-center justify-center gap-2">
            <Scale size={16} className="text-purple-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
              DECISION ENGINE
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Multi-criteria policy arbiter & risk classifier</div>
        </div>

        {/* Down Arrow */}
        <div className="flex justify-center text-slate-600">
          <ArrowDown size={18} />
        </div>

        {/* Node 6: 4 Outcomes Grid */}
        <div 
          onClick={() => setSelectedNode('outcomes')}
          className="w-full max-w-2xl cursor-pointer"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* ALLOW */}
            <div className="rounded-lg border border-emerald-500/40 bg-emerald-950/30 p-2.5 text-center transition-all hover:scale-105">
              <div className="flex items-center justify-center gap-1 text-emerald-400 text-xs font-bold font-mono">
                <CheckCircle size={13} />
                <span>ALLOW</span>
              </div>
              <div className="text-[10px] text-emerald-300/80 mt-0.5">Low Risk</div>
            </div>

            {/* EDIT / REGENERATE */}
            <div className="rounded-lg border border-amber-500/40 bg-amber-950/30 p-2.5 text-center transition-all hover:scale-105">
              <div className="flex items-center justify-center gap-1 text-amber-400 text-xs font-bold font-mono">
                <RefreshCw size={13} />
                <span>EDIT / REGEN</span>
              </div>
              <div className="text-[10px] text-amber-300/80 mt-0.5">Correctable Issue</div>
            </div>

            {/* BLOCK */}
            <div className="rounded-lg border border-rose-500/40 bg-rose-950/30 p-2.5 text-center transition-all hover:scale-105">
              <div className="flex items-center justify-center gap-1 text-rose-400 text-xs font-bold font-mono">
                <Ban size={13} />
                <span>BLOCK</span>
              </div>
              <div className="text-[10px] text-rose-300/80 mt-0.5">High-Risk / PII</div>
            </div>

            {/* HUMAN REVIEW */}
            <div className="rounded-lg border border-violet-500/40 bg-violet-950/30 p-2.5 text-center transition-all hover:scale-105">
              <div className="flex items-center justify-center gap-1 text-violet-400 text-xs font-bold font-mono">
                <UserCheck size={13} />
                <span>HUMAN REVIEW</span>
              </div>
              <div className="text-[10px] text-violet-300/80 mt-0.5">Uncertain Case</div>
            </div>
          </div>
        </div>

        {/* Down Arrow */}
        <div className="flex justify-center text-slate-600">
          <ArrowDown size={18} />
        </div>

        {/* Node 7: Database + Audit Logs */}
        <div 
          onClick={() => setSelectedNode('database')}
          className="w-full max-w-md cursor-pointer rounded-lg border border-slate-700/80 bg-slate-900/90 px-4 py-3 text-center shadow-md transition-all hover:border-slate-500 hover:bg-slate-800/90 group"
        >
          <div className="flex items-center justify-center gap-2">
            <Database size={16} className="text-slate-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              DATABASE + AUDIT LOGS
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Immutable compliance storage & live telemetry</div>
        </div>

      </div>

      {/* Interactive Node Info Box */}
      {selectedNode && (
        <div className="mt-6 rounded-lg border border-blue-500/30 bg-blue-950/30 p-4 transition-all animate-in fade-in">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs">
              <Info size={16} />
              <span>{nodeInfo[selectedNode].title}</span>
            </div>
            <button 
              onClick={() => setSelectedNode(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-slate-300 mt-1 pl-6 leading-relaxed">
            {nodeInfo[selectedNode].description}
          </p>
        </div>
      )}
    </div>
  );
}
