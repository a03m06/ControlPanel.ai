import React from 'react';
import { 
  Activity, 
  DollarSign, 
  Shield, 
  Cpu, 
  ArrowRight, 
  ArrowDown, 
  CheckCircle2, 
  RefreshCw, 
  Ban, 
  UserCheck 
} from 'lucide-react';

export default function DecisionOverview() {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 shadow-xs transition-colors">
      <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Decision Engine Workflow Overview
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            How parallel checker outputs synthesize into policy outcomes
          </p>
        </div>
      </div>

      {/* 2D Clean Workflow Flow */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        
        {/* Step 1: Three Checker Inputs (4 Cols) */}
        <div className="md:col-span-4 space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono mb-1">
            1. Evaluation Inputs
          </div>

          {/* Performance */}
          <div className="flex items-center justify-between rounded-lg border border-blue-200 dark:border-blue-800/60 bg-blue-50/50 dark:bg-blue-950/40 p-2 text-xs">
            <div className="flex items-center gap-2">
              <Activity size={14} className="text-blue-600 dark:text-blue-400" />
              <span className="font-semibold text-slate-800 dark:text-slate-200">PERFORMANCE</span>
            </div>
            <span className="font-mono text-[11px] text-blue-700 dark:text-blue-300 font-bold">82 / 100</span>
          </div>

          {/* Cost */}
          <div className="flex items-center justify-between rounded-lg border border-amber-200 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/40 p-2 text-xs">
            <div className="flex items-center gap-2">
              <DollarSign size={14} className="text-amber-600 dark:text-amber-400" />
              <span className="font-semibold text-slate-800 dark:text-slate-200">COST</span>
            </div>
            <span className="font-mono text-[11px] text-amber-700 dark:text-amber-300 font-bold">91 / 100</span>
          </div>

          {/* Responsibility */}
          <div className="flex items-center justify-between rounded-lg border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/40 p-2 text-xs">
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-emerald-600 dark:text-emerald-400" />
              <span className="font-semibold text-slate-800 dark:text-slate-200">RESPONSIBILITY</span>
            </div>
            <span className="font-mono text-[11px] text-emerald-700 dark:text-emerald-300 font-bold">95 / 100</span>
          </div>
        </div>

        {/* Arrow (1 Col) */}
        <div className="hidden md:flex md:col-span-1 justify-center text-slate-300 dark:text-slate-600">
          <ArrowRight size={20} />
        </div>
        <div className="flex md:hidden justify-center text-slate-300 dark:text-slate-600 py-1">
          <ArrowDown size={18} />
        </div>

        {/* Step 2: Decision Engine Arbiter (3 Cols) */}
        <div className="md:col-span-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono mb-1">
            2. Policy Arbiter
          </div>
          <div className="rounded-xl border border-purple-200 dark:border-purple-800/60 bg-purple-50/40 dark:bg-purple-950/40 p-4 text-center">
            <div className="flex items-center justify-center gap-1.5 text-purple-700 dark:text-purple-300 font-bold text-xs mb-1">
              <Cpu size={16} />
              <span>DECISION ENGINE</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-normal">
              Evaluates multi-vector rules & risk thresholds
            </p>
          </div>
        </div>

        {/* Arrow (1 Col) */}
        <div className="hidden md:flex md:col-span-1 justify-center text-slate-300 dark:text-slate-600">
          <ArrowRight size={20} />
        </div>
        <div className="flex md:hidden justify-center text-slate-300 dark:text-slate-600 py-1">
          <ArrowDown size={18} />
        </div>

        {/* Step 3: Four Possible Outcomes (3 Cols) */}
        <div className="md:col-span-3 space-y-1.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono mb-1">
            3. Strict Policy Outcomes
          </div>

          <div className="flex items-center justify-between rounded-md border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 text-[11px]">
            <span className="font-bold text-emerald-800 dark:text-emerald-300 font-mono flex items-center gap-1">
              <CheckCircle2 size={11} /> ALLOW
            </span>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400">Low Risk</span>
          </div>

          <div className="flex items-center justify-between rounded-md border border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/40 px-2 py-1 text-[11px]">
            <span className="font-bold text-amber-800 dark:text-amber-300 font-mono flex items-center gap-1">
              <RefreshCw size={11} /> EDIT / REGEN
            </span>
            <span className="text-[10px] text-amber-700 dark:text-amber-400">Correctable</span>
          </div>

          <div className="flex items-center justify-between rounded-md border border-rose-200 dark:border-rose-800/60 bg-rose-50 dark:bg-rose-950/40 px-2 py-1 text-[11px]">
            <span className="font-bold text-rose-800 dark:text-rose-300 font-mono flex items-center gap-1">
              <Ban size={11} /> BLOCK
            </span>
            <span className="text-[10px] text-rose-700 dark:text-rose-400">High Risk</span>
          </div>

          <div className="flex items-center justify-between rounded-md border border-purple-200 dark:border-purple-800/60 bg-purple-50 dark:bg-purple-950/40 px-2 py-1 text-[11px]">
            <span className="font-bold text-purple-800 dark:text-purple-300 font-mono flex items-center gap-1">
              <UserCheck size={11} /> HUMAN REVIEW
            </span>
            <span className="text-[10px] text-purple-700 dark:text-purple-400">Uncertain</span>
          </div>
        </div>

      </div>
    </div>
  );
}
