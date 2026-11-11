"use client";

import { useState } from "react";
import Link from "next/link";
import { logoutAction } from "@/features/auth/actions";
import {
  Flag,
  LogOut,
  Zap,
  Trophy,
  Award,
  Menu,
  X,
  Compass,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

interface StudentNavbarProps {
  userName?: string;
  classNameTitle?: string;
  totalXp: number;
}

export function StudentNavbar({
  userName = "Siswa",
  classNameTitle = "Siswa Baru",
  totalXp,
}: StudentNavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
        />
      )}

      {/* Mobile Side Drawer (Slide in from Left) */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-2xl md:hidden transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div>
          {/* Drawer Header */}
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-600 rounded-xl text-white shadow-sm">
                <Flag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                  FLAG HUNTER
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  Siswa
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1.5 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Tutup Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Student Profile Quick View */}
          <div className="p-4 mx-4 my-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
            <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
              {userName}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {classNameTitle}
            </p>
            <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/40 text-amber-700 dark:text-amber-400 font-bold text-xs">
              <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{totalXp} XP Terkumpul</span>
            </div>
          </div>

          {/* Navigation Links Bahasa Indonesia */}
          <nav className="p-4 space-y-1">
            <Link
              href="/siswa"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Daftar Misi</span>
            </Link>

            <Link
              href="/siswa/peringkat"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Peringkat Kelas</span>
            </Link>

            <Link
              href="/siswa/prestasi"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <Award className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>Prestasi & Lencana</span>
            </Link>
          </nav>
        </div>

        {/* Drawer Footer / Logout */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 text-xs text-slate-700 dark:text-slate-300 font-semibold transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar Akun</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Top Header Navbar */}
      <header className="px-4 sm:px-6 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition"
              aria-label="Buka Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="p-2 sm:p-2.5 bg-emerald-600 rounded-2xl text-white shadow-md shadow-emerald-600/20">
              <Flag className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white">
                  FLAG HUNTER
                </h1>
                <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  Siswa
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[150px] sm:max-w-none">
                {classNameTitle} • {userName}
              </p>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/siswa/peringkat"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition border border-slate-200 dark:border-slate-700"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>Peringkat</span>
            </Link>

            <Link
              href="/siswa/prestasi"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition border border-slate-200 dark:border-slate-700"
            >
              <Award className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Prestasi</span>
            </Link>

            {/* XP Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/40 text-amber-700 dark:text-amber-400 font-bold text-xs">
              <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>{totalXp} XP</span>
            </div>

            <ThemeToggle />

            <form action={logoutAction}>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 rounded-xl transition text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar</span>
              </button>
            </form>
          </div>

          <div className="flex md:hidden items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/40 text-amber-700 dark:text-amber-400 font-bold text-xs">
              <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{totalXp} XP</span>
            </div>

            <ThemeToggle />
          </div>
        </div>
      </header>
    </>
  );
}
