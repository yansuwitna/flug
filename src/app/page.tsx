import Link from "next/link";
import { Flag, Compass, Trophy, ShieldCheck, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Navbar */}
      <header className="px-6 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-600 rounded-xl text-white shadow-md shadow-emerald-600/20">
            <Flag className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">FLAG HUNTER</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Discover Knowledge. Capture the Flag.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/login"
            className="px-4 py-2 text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition shadow-md shadow-emerald-600/20"
          >
            Masuk Platform
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 relative overflow-hidden">
        {/* Modern subtle ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/10 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 text-xs font-semibold mb-6 shadow-sm">
          <ShieldCheck className="w-4 h-4" /> Platform Pembelajaran Berbasis Investigasi & Gamifikasi
        </div>
        
        <h2 className="text-4xl md:text-6xl font-extrabold max-w-4xl leading-tight tracking-tight text-slate-900 dark:text-white">
          Eksplorasi Pembelajaran Interaktif Berbasis{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300">
            Investigasi & Flag
          </span>
        </h2>
        
        <p className="mt-5 text-slate-600 dark:text-slate-300 max-w-2xl text-base md:text-lg leading-relaxed">
          Pelajari materi melalui video dan modul berkualitas, pecahkan petunjuk tersembunyi, dan temukan bendera flag untuk mengumpulkan XP serta menaikkan peringkatmu.
        </p>

        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-2xl shadow-lg shadow-emerald-600/25 transition duration-200 hover:-translate-y-0.5"
          >
            <span>Mulai Belajar Sekarang</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 3 Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mt-20 text-left w-full px-2">
          <div className="p-7 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none hover:border-emerald-500/40 transition">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800/50 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-5 shadow-sm">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Watch & Explore</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Pelajari video pembelajaran, ringkasan materi, dan referensi multimedia yang telah disiapkan guru untuk setiap bab.
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none hover:border-emerald-500/40 transition">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-5 shadow-sm">
              <Flag className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Investigate & Capture</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Jawab pertanyaan kritis dan pecahkan clue tersembunyi untuk menemukan kode flag rahasia yang tepat.
            </p>
          </div>

          <div className="p-7 rounded-3xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none hover:border-emerald-500/40 transition">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/50 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-5 shadow-sm">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Level Up & Leaderboard</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Kumpulkan XP, raih badge prestasi, naikkan level pangkat siswa, dan bersaing sehat di peringkat kelasmu.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-xs text-slate-500 dark:text-slate-500 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800/80">
        FLAG HUNTER &copy; 2026 — Discover Knowledge. Capture the Flag.
      </footer>
    </div>
  );
}
