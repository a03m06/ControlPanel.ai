import React from 'react';
import { 
  Menu, 
  Sun, 
  Moon 
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function Topbar({ onToggleSidebar }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between bg-transparent px-4 sm:px-6 transition-colors">
        {/* Left: Mobile Menu */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="rounded-lg border border-[var(--border-subtle)] p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] lg:hidden transition-colors"
            aria-label="Toggle menu"
          >
            <Menu size={18} />
          </button>
        </div>

        {/* Right Actions: Theme Toggle */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Quick Mode Toggle Button */}
          <button
            onClick={toggleTheme}
            className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-blue-400 hover:border-blue-500/40 hover:bg-[var(--bg-hover)] transition-all shadow-xs"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle theme mode"
          >
            {isDark ? (
              <Sun size={16} className="text-amber-400 animate-in spin-in-90 duration-300" />
            ) : (
              <Moon size={16} className="text-blue-500 animate-in spin-in-90 duration-300" />
            )}
          </button>
        </div>
      </header>
    </>
  );
}
