import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const THEME_PRESETS = {
  dark: [
    { id: 'obsidian', name: 'Deep Obsidian', bg: '#090d16', surface: '#0e1424', card: '#121829', border: '#1c263c' },
    { id: 'midnight', name: 'Midnight Navy', bg: '#0b132b', surface: '#111d3d', card: '#16244d', border: '#223668' },
    { id: 'charcoal', name: 'Charcoal Slate', bg: '#121820', surface: '#18202b', card: '#1e2938', border: '#2a384c' },
    { id: 'oled', name: 'True Pitch Black', bg: '#000000', surface: '#0d0d0e', card: '#141416', border: '#222225' },
    { id: 'matrix', name: 'Cyber Emerald', bg: '#061612', surface: '#0b241e', card: '#103028', border: '#1b4a3f' }
  ],
  light: [
    { id: 'slate-light', name: 'Crisp Slate', bg: '#f8fafc', surface: '#ffffff', card: '#ffffff', border: '#e2e8f0' },
    { id: 'pure-white', name: 'Pure White', bg: '#ffffff', surface: '#f8fafc', card: '#ffffff', border: '#eaedf2' },
    { id: 'lavender', name: 'Cool Cloud', bg: '#f1f5f9', surface: '#ffffff', card: '#f8fafc', border: '#cbd5e1' },
    { id: 'warm-sand', name: 'Warm Cream', bg: '#faf8f5', surface: '#ffffff', card: '#fffdfa', border: '#e8e2d8' },
    { id: 'mint-breeze', name: 'Mint Soft', bg: '#f0fdf4', surface: '#ffffff', card: '#f7fee7', border: '#bbf7d0' }
  ]
};

// Helper to calculate brightness/contrast from hex
function hexToRgb(hex) {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  const num = parseInt(clean, 16);
  if (isNaN(num)) return { r: 9, g: 13, b: 22 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

function adjustBrightness(hex, percent) {
  const { r, g, b } = hexToRgb(hex);
  const amt = Math.round(2.55 * percent);
  const newR = Math.min(255, Math.max(0, r + amt));
  const newG = Math.min(255, Math.max(0, g + amt));
  const newB = Math.min(255, Math.max(0, b + amt));
  return `#${((1 << 24) + (newR << 16) + (newG << 8) + newB).toString(16).slice(1)}`;
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('cp_theme');
      if (stored === 'dark' || stored === 'light') return stored;
    }
    return 'dark'; // Default sleek dark
  });

  const [customBg, setCustomBg] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('cp_custom_bg') || '#090d16';
    }
    return '#090d16';
  });

  // Apply colors and variables to document
  useEffect(() => {
    const root = document.documentElement;
    const isDarkMode = theme === 'dark';

    if (isDarkMode) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }

    // Determine surface and card colors based on customBg or preset
    let bgMain = customBg || (isDarkMode ? '#090d16' : '#f8fafc');
    let bgSurface = isDarkMode ? adjustBrightness(bgMain, 6) : '#ffffff';
    let bgCard = isDarkMode ? adjustBrightness(bgMain, 11) : '#ffffff';
    let bgHover = isDarkMode ? adjustBrightness(bgMain, 18) : adjustBrightness(bgMain, -5);
    let borderSubtle = isDarkMode ? adjustBrightness(bgMain, 20) : adjustBrightness(bgMain, -15);
    let textPrimary = isDarkMode ? '#f8fafc' : '#0f172a';
    let textSecondary = isDarkMode ? '#cbd5e1' : '#334155';
    let textMuted = isDarkMode ? '#8492a6' : '#64748b';

    // Set CSS variables
    root.style.setProperty('--bg-main', bgMain);
    root.style.setProperty('--bg-surface', bgSurface);
    root.style.setProperty('--bg-card', bgCard);
    root.style.setProperty('--bg-hover', bgHover);
    root.style.setProperty('--border-subtle', borderSubtle);
    root.style.setProperty('--text-primary', textPrimary);
    root.style.setProperty('--text-secondary', textSecondary);
    root.style.setProperty('--text-muted', textMuted);

    document.body.style.backgroundColor = bgMain;
    document.body.style.color = textPrimary;

    localStorage.setItem('cp_theme', theme);
    localStorage.setItem('cp_custom_bg', bgMain);
  }, [theme, customBg]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    // Set default preset for the new theme mode
    const defaultBg = nextTheme === 'dark' ? '#090d16' : '#f8fafc';
    setCustomBg(defaultBg);
  };

  const handleSetCustomBg = (newBgColor, forcedTheme = null) => {
    setCustomBg(newBgColor);
    if (forcedTheme) {
      setTheme(forcedTheme);
    } else {
      // Auto-detect mode based on brightness
      const { r, g, b } = hexToRgb(newBgColor);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      setTheme(brightness > 130 ? 'light' : 'dark');
    }
  };

  const resetTheme = () => {
    setTheme('dark');
    setCustomBg('#090d16');
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme === 'dark',
        customBg,
        presets: THEME_PRESETS,
        toggleTheme,
        setTheme,
        setCustomBg: handleSetCustomBg,
        resetTheme
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

