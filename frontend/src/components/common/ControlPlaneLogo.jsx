import React from 'react';

export default function ControlPlaneLogo({ size = 'md', showSubtext = true, className = '' }) {
  const sizeMap = {
    sm: {
      box: 'h-7 w-7 rounded-lg',
      title: 'text-xs',
      badge: 'text-[8px] px-1 py-0.5',
      sub: 'text-[8px]',
      dot: 'h-1 w-1'
    },
    md: {
      box: 'h-9 w-9 rounded-xl',
      title: 'text-[15px]',
      badge: 'text-[9px] px-1.5 py-0.5',
      sub: 'text-[9px]',
      dot: 'h-1.5 w-1.5'
    },
    lg: {
      box: 'h-11 w-11 rounded-2xl',
      title: 'text-lg',
      badge: 'text-[10px] px-2 py-0.5',
      sub: 'text-[10px]',
      dot: 'h-2 w-2'
    }
  };

  const current = sizeMap[size] || sizeMap.md;

  return (
    <div className={`group flex items-center gap-3 select-none ${className}`}>
      {/* Cool Futuristic Isometric Logo Icon */}
      <div className="relative shrink-0">
        {/* Ambient Glow Aura */}
        <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 opacity-40 blur-sm transition-all duration-300 group-hover:opacity-80 group-hover:blur-md" />

        {/* Outer Squircle Container */}
        <div className={`relative flex ${current.box} items-center justify-center border border-blue-400/30 bg-gradient-to-br from-blue-900/60 via-slate-900/90 to-black p-1.5 shadow-lg shadow-blue-950/50 backdrop-blur-md transition-all duration-300 group-hover:border-blue-400/70 group-hover:scale-105`}>
          {/* Specular light highlight on top edge */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
          
          {/* Layered Multi-Plane Vector Artwork */}
          <svg viewBox="0 0 32 32" className="h-full w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="cpGradBottom" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#1E3A8A" />
              </linearGradient>
              <linearGradient id="cpGradMid" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06B6D4" />
                <stop offset="100%" stopColor="#6366F1" />
              </linearGradient>
              <linearGradient id="cpGradTop" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#93C5FD" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="1.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Bottom Layer Plane */}
            <path 
              d="M16 26.5L5.5 20.5L16 14.5L26.5 20.5L16 26.5Z" 
              fill="url(#cpGradBottom)" 
              fillOpacity="0.85"
              stroke="#60A5FA"
              strokeWidth="0.5"
              strokeOpacity="0.4"
            />

            {/* Mid Layer Floating Lattice */}
            <path 
              d="M16 20.5L7.5 15.5L16 10.5L24.5 15.5L16 20.5Z" 
              fill="url(#cpGradMid)" 
              fillOpacity="0.9"
              stroke="#38BDF8"
              strokeWidth="0.6"
              strokeOpacity="0.6"
            />

            {/* Top Crystalline Control Diamond */}
            <path 
              d="M16 14L9.5 10L16 6L22.5 10L16 14Z" 
              fill="url(#cpGradTop)" 
              filter="url(#glow)"
            />

            {/* Glowing Intelligence Quantum Nodes */}
            <circle cx="16" cy="9.8" r="1.5" fill="#FFFFFF" className="animate-pulse" />
            <circle cx="16" cy="15.5" r="1.1" fill="#E0F2FE" />
            <circle cx="16" cy="20.5" r="0.9" fill="#93C5FD" opacity="0.8" />
          </svg>
        </div>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-tight">
          <span className={`${current.title} font-extrabold tracking-tight text-[var(--text-primary)] transition-colors group-hover:text-white`}>
            Control<span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-400 bg-clip-text text-transparent">Plane</span>
          </span>
          <span className={`rounded-md bg-blue-500/15 border border-blue-500/30 ${current.badge} font-mono font-bold text-blue-400 shadow-xs shadow-blue-500/20 leading-none group-hover:border-blue-400/60 group-hover:text-blue-300 transition-colors`}>
            .ai
          </span>
        </div>

        {showSubtext && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className={`${current.dot} rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)] animate-pulse`} />
            <span className={`${current.sub} font-mono font-semibold tracking-[0.18em] text-[var(--text-muted)] uppercase group-hover:text-[var(--text-secondary)] transition-colors`}>
              AI Control Engine
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
