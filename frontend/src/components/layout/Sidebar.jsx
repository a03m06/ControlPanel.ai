import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutGrid, 
  MessageSquareWarning, 
  Sliders,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import ControlPlaneLogo from '../common/ControlPlaneLogo';

export default function Sidebar({ 
  reviewCount = 5, 
  isMobileOpen = false, 
  setIsMobileOpen = () => {},
  isCollapsed = false,
  onToggleCollapse = () => {}
}) {
  const location = useLocation();

  const navItems = [
    {
      label: 'Conversation',
      path: '/conversation',
      icon: Sliders,
      badge: null
    },
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: LayoutGrid,
      badge: null
    },
    {
      label: 'Review Queue',
      path: '/review',
      icon: MessageSquareWarning,
      badge: reviewCount > 0 ? String(reviewCount) : '5'
    }
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-surface)] transition-all duration-300 ease-in-out lg:static shadow-xs ${
          isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        } ${
          isCollapsed ? 'lg:w-0 lg:border-r-0 lg:overflow-visible' : 'lg:w-64'
        }`}
      >
        {/* Toggle Arrow Button on Right Border */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className={`absolute top-20 z-50 hidden lg:flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] hover:border-blue-500/50 shadow-md shadow-black/50 transition-all cursor-pointer group ${
            isCollapsed 
              ? 'left-3 translate-x-0' 
              : '-right-3.5 translate-x-0'
          }`}
          title={isCollapsed ? "Show sidebar" : "Hide sidebar"}
          aria-label={isCollapsed ? "Show sidebar" : "Hide sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform text-[var(--text-primary)]" />
          ) : (
            <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform text-[var(--text-primary)]" />
          )}
        </button>

        {/* Content wrapper with smooth opacity transition when collapsed */}
        <div className={`flex flex-col h-full w-64 transition-opacity duration-200 ${isCollapsed ? 'lg:opacity-0 lg:pointer-events-none' : 'opacity-100'}`}>
          {/* Header Branding */}
          <div className="flex h-16 items-center px-5 border-b border-[var(--border-subtle)] shrink-0">
            <NavLink to="/conversation" onClick={() => setIsMobileOpen(false)}>
              <ControlPlaneLogo size="md" showSubtext={true} />
            </NavLink>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto px-3.5 py-5">
            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || 
                  (item.path === '/conversation' && (location.pathname === '/' || location.pathname === ''));

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileOpen(false)}
                    className={`group relative flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--border-subtle)] shadow-xs font-semibold'
                        : 'text-[var(--text-muted)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)] border border-transparent'
                    }`}
                  >
                    {/* Subtle right accent line for active state */}
                    {isActive && (
                      <div className="absolute right-0 top-2 bottom-2 w-0.5 rounded-l-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                    )}

                    <div className="flex items-center gap-3">
                      <Icon
                        size={17}
                        className={`transition-colors ${
                          isActive ? 'text-blue-500' : 'text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[10px] font-mono font-bold text-white shadow-xs shadow-blue-500/30">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
}
