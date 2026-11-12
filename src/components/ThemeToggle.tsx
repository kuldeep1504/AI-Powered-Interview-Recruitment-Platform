import React from 'react';
import { useTheme } from '../context/ThemeContext.tsx';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = false }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className={`relative inline-flex items-center justify-center p-1.5 rounded-lg transition-colors ${
        theme === 'dark'
          ? 'bg-neutral-800 text-amber-400 hover:bg-neutral-700 hover:text-amber-300 border border-neutral-700'
          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 hover:text-neutral-900 border border-neutral-200'
      } ${className}`}
    >
      {theme === 'dark' ? (
        <Sun className="w-3.5 h-3.5 transition-transform duration-200 rotate-0 scale-100" />
      ) : (
        <Moon className="w-3.5 h-3.5 transition-transform duration-200 rotate-0 scale-100" />
      )}
      {showLabel && (
        <span className="ml-1.5 text-xs font-semibold">
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </button>
  );
};
