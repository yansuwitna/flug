import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { getLevelFromXp } from "@/features/gamification/levels";
import { Trophy, ArrowLeft, Zap, Shield, Flag } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export const dynamic = "force-dynamic";

export default async function StudentLeaderboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // 1. Ambil kelas tempat siswa terdaftar
  const membership = await prisma.classMember.findFirst({
    where: { userId: user.userId },
    include: {
      schoolClass: {
        include: {
          members: {
            include: {
              user: {
                include: {
                  xpTransactions: true,
                  attempts: {
                    include: {
                      flagSubmissions: {
                        where: { isCorrect: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  const schoolClass = membership?.schoolClass;

  // 2. Kalkulasi ranking siswa di kelas tersebut
  const rankedStudents = (schoolClass?.members || [])
    .map((member) => {
      const u = member.user;
      const totalXp = u.xpTransactions.reduce((sum, tx) => sum + tx.amount, 0);

      // Hitung total flag unik yang terpecahkan
      const solvedFlagsSet = new Set<string>();
      u.attempts.forEach((att) => {
        att.flagSubmissions.forEach((sub) => {
          solvedFlagsSet.add(sub.challengeId);
        });
      });

      const lvl = getLevelFromXp(totalXp);

      return {
        userId: u.id,
        name: u.name,
        email: u.email,
        totalXp,
        flagsCount: solvedFlagsSet.size,
        levelTitle: lvl.title,
        levelNumber: lvl.level,
        isCurrentUser: u.id === user.userId,
      };
    })
    .sort((a, b) => b.totalXp - a.totalXp || b.flagsCount - a.flagsCount);

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

        {/* Header Leaderboard */}
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800">
                Kelas: {schoolClass?.name || "Umum"}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Peringkat XP & Flag</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              <Trophy className="w-7 h-7 text-amber-500" /> Leaderboard Kelas
            </h1>
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 mt-2 max-w-xl">
              Bersaing secara sehat dalam menangkap bendera pengetahuan dan menyelesaikan misi investigasi.
            </p>
          </div>
        </div>

        {/* Daftar Peringkat */}
        <div className="space-y-3">
          {rankedStudents.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
              Belum ada data peringkat untuk kelas ini.
            </div>
          ) : (
            rankedStudents.map((st, idx) => {
              const rank = idx + 1;
              const isTop1 = rank === 1;
              const isTop2 = rank === 2;
              const isTop3 = rank === 3;

              return (
                <div
                  key={st.userId}
                  className={`p-4 md:p-5 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                    st.isCurrentUser
                      ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-500/60 shadow-sm"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank Badge */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-base shrink-0 ${
                        isTop1
                          ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30"
                          : isTop2
                          ? "bg-slate-200 text-slate-800"
                          : isTop3
                          ? "bg-amber-700 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {rank}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm md:text-base text-slate-900 dark:text-white">
                          {st.name}
                        </h3>
                        {st.isCurrentUser && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                            Kamu
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <span className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400">
                          <Shield className="w-3.5 h-3.5" /> Lv.{st.levelNumber} {st.levelTitle}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                          <Flag className="w-3.5 h-3.5" /> {st.flagsCount} Flag
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* XP Total */}
                  <div className="text-right shrink-0">
                    <div className="flex items-center justify-end gap-1.5 text-base md:text-lg font-black text-amber-600 dark:text-amber-400">
                      <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />
                      <span>{st.totalXp} XP</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
