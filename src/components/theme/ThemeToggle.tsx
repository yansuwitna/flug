"use client";

import { useTheme } from "./ThemeProvider";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={`Beralih ke mode ${theme === "light" ? "Gelap" : "Terang"}`}
      aria-label="Toggle Theme"
      className={`p-2 rounded-xl border transition-all duration-200 cursor-pointer select-none flex items-center justify-center
        ${
          theme === "dark"
            ? "bg-slate-900 border-slate-700 text-amber-400 hover:bg-slate-800 hover:border-slate-600 shadow-sm"
            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-sm"
        } ${className}`}
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4 transition-transform duration-200 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 transition-transform duration-200 hover:-rotate-12" />
      )}
    </button>
  );
}
