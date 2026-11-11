import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { getLevelFromXp, LEVELS } from "@/features/gamification/levels";
import { Award, ArrowLeft, Zap, CheckCircle2, Lock } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export const dynamic = "force-dynamic";

export default async function StudentAchievementsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // 1. Ambil XP siswa
  const xpTransactions = await prisma.xpTransaction.findMany({
    where: { userId: user.userId },
  });
  const totalXp = xpTransactions.reduce((sum, tx) => sum + tx.amount, 0);
  const currentLevel = getLevelFromXp(totalXp);

  // 2. Ambil badge yang didapat siswa
  const userBadges = await prisma.userBadge.findMany({
    where: { userId: user.userId },
    include: { badge: true },
  });

  const unlockedBadgeIds = new Set(userBadges.map((ub) => ub.badgeId));

  // 3. Ambil semua badge yang tersedia
  const allBadges = await prisma.badge.findMany({
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col px-4 py-8 md:p-8 transition-colors duration-200">
      <div className="max-w-4xl mx-auto w-full flex-1">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/student/dashboard"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
          </Link>
          <ThemeToggle />
        </div>

        {/* Level Progression Card */}
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                Level {currentLevel.level} Investigator
              </span>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                {currentLevel.title}
              </h1>
              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Kumpulkan XP lebih banyak dengan menyelesaikan tantangan untuk naik pangkat berikutnya.
              </p>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 self-start md:self-center">
              <Zap className="w-6 h-6 text-amber-500 fill-amber-500" />
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase block">
                  Total XP Kamu
                </span>
                <span className="text-xl font-black text-amber-600 dark:text-amber-400">{totalXp} XP</span>
              </div>
            </div>
          </div>

          {/* Level Tracks */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            {LEVELS.map((lvl) => {
              const isPassed = totalXp >= lvl.minXp;
              const isCurrent = currentLevel.level === lvl.level;

              return (
                <div
                  key={lvl.level}
                  className={`p-3.5 rounded-2xl border text-center transition ${
                    isCurrent
                      ? "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-500/70 shadow-sm"
                      : isPassed
                      ? "bg-slate-50 dark:bg-slate-950 border-emerald-300 dark:border-emerald-800/40"
                      : "bg-slate-50/50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800/60 opacity-50"
                  }`}
                >
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                    Lv. {lvl.level}
                  </span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate">
                    {lvl.title}
                  </p>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold block mt-1">
                    {lvl.minXp} XP
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Badges & Achievements Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Lencana Penghargaan ({userBadges.length}/{allBadges.length})
            </h2>
          </div>

          {allBadges.length === 0 ? (
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
              Selesaikan misi pembelajaran pertamamu untuk mulai membuka lencana penghargaan!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {allBadges.map((badge) => {
                const isUnlocked = unlockedBadgeIds.has(badge.id);

                return (
                  <div
                    key={badge.id}
                    className={`p-6 rounded-3xl border transition flex flex-col justify-between ${
                      isUnlocked
                        ? "bg-white dark:bg-slate-900 border-emerald-300 dark:border-emerald-500/40 shadow-sm"
                        : "bg-white/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/60 opacity-60"
                    }`}
                  >
                    <div>
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        {isUnlocked ? (
                          <Award className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Lock className="w-5 h-5 text-slate-400" />
                        )}
                      </div>

                      <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug">
                        {badge.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {badge.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                      {isUnlocked ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Terbuka
                        </span>
                      ) : (
                        <span className="text-[11px] font-medium text-slate-500">
                          Terkunci: {badge.criteria}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
