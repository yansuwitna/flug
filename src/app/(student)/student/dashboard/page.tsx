import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import {
  Flag,
  Zap,
  Compass,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Award,
} from "lucide-react";
import Link from "next/link";
import { MissionStatus } from "@prisma/client";
import { StudentNavbar } from "@/components/navigation/StudentNavbar";

export const dynamic = "force-dynamic";

export default async function StudentDashboardPage() {
  const user = await getCurrentUser();

  // 1. Cari kelas yang diikuti oleh siswa
  const classMember = await prisma.classMember.findFirst({
    where: { userId: user?.userId },
    include: {
      schoolClass: {
        include: {
          academicYear: true,
          classSubjects: {
            include: {
              subject: true,
              missions: {
                where: { status: MissionStatus.PUBLISHED },
                include: {
                  chapter: true,
                  _count: {
                    select: {
                      challenges: true,
                      learningContent: true,
                    },
                  },
                  attempts: {
                    where: { userId: user?.userId },
                    orderBy: { attemptNumber: "desc" },
                    take: 1,
                    include: {
                      result: true,
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

  // 2. Hitung total XP akumulasi dari XpTransaction
  const xpTransactions = await prisma.xpTransaction.findMany({
    where: { userId: user?.userId },
  });
  const totalXp = xpTransactions.reduce((sum, tx) => sum + tx.amount, 0);

  // Kumpulkan seluruh mission yang tersedia di kelas siswa
  const availableMissions =
    classMember?.schoolClass.classSubjects.flatMap((cs) =>
      cs.missions.map((m) => ({
        ...m,
        subjectName: cs.subject.name,
        subjectCode: cs.subject.code,
      }))
    ) || [];

  // Hitung berapa mission yang selesai
  const completedMissionsCount = availableMissions.filter(
    (m) => m.attempts[0]?.status === "COMPLETED"
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* Top Navbar dengan Responsive Mobile Menu yang Tersembunyi */}
      <StudentNavbar
        userName={user?.name}
        classNameTitle={classMember?.schoolClass.name || "Siswa Baru"}
        totalXp={totalXp}
      />

      {/* Main Container */}
      <main className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full flex-1">
        {/* Banner Sambutan Modern */}
        <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white mb-8 shadow-xl shadow-emerald-950/10 relative overflow-hidden">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold mb-3">
              <Award className="w-3.5 h-3.5" /> Portal Investigasi Pembelajaran
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">
              Siap Berburu Bendera Pengetahuan, {user?.name?.split(" ")[0]}?
            </h2>
            <p className="text-xs md:text-sm text-emerald-50 mt-2 leading-relaxed">
              Tonton video pembelajaran dari guru, investigasi petunjuk tersembunyi, dan tangkap bendera (*flag*) untuk memuncaki leaderboard kelas!
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Akumulasi XP
              </span>
              <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
            </div>
            <div className="text-3xl font-black text-amber-600 dark:text-amber-400">{totalXp} XP</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Level 1 • Novice Investigator</p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Mission Selesai
              </span>
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {completedMissionsCount} / {availableMissions.length}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Misi yang berhasil dipecahkan</p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm sm:col-span-2 md:col-span-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Kelas Kamu
              </span>
              <BookOpen className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white truncate">
              {classMember?.schoolClass.name || "Belum Terdaftar"}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
              {classMember?.schoolClass.academicYear.name || "Tahun Ajaran Aktif"}
            </p>
          </div>
        </div>

        {/* Mission Explorer */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Mission Pembelajaran Tersedia ({availableMissions.length})
            </h3>
          </div>

          {availableMissions.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-center max-w-lg mx-auto shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 flex items-center justify-center mx-auto mb-4">
                <Flag className="w-6 h-6 text-slate-400" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">Belum Ada Mission Terbit</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Guru kamu sedang menyiapkan materi dan tantangan flag baru. Periksa kembali nanti!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {availableMissions.map((m) => {
                const latestAttempt = m.attempts[0];
                const isCompleted = latestAttempt?.status === "COMPLETED";
                const isInProgress = latestAttempt?.status === "IN_PROGRESS";

                return (
                  <div
                    key={m.id}
                    className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col justify-between shadow-sm hover:shadow-md"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800">
                          {m.subjectName} ({m.subjectCode})
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                            {m.difficulty}
                          </span>
                          {isCompleted && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle2 className="w-3 h-3" /> Selesai
                            </span>
                          )}
                          {isInProgress && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                              Sedang Dikerjakan
                            </span>
                          )}
                        </div>
                      </div>

                      <h4 className="text-xl font-bold text-slate-900 dark:text-white leading-snug">{m.title}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                        {m.description}
                      </p>

                      <div className="flex items-center gap-4 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                        <span>{m._count.learningContent} Materi/Video</span>
                        <span>•</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          {m._count.challenges} Tantangan Flag
                        </span>
                        <span>•</span>
                        <span className="text-amber-600 dark:text-amber-400 font-bold">{m.totalPoints} XP</span>
                      </div>
                    </div>

                    <Link
                      href={`/student/missions/${m.id}`}
                      className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition group"
                    >
                      <span>
                        {isInProgress
                          ? "Lanjutkan Investigasi"
                          : isCompleted
                          ? "Lihat Hasil & Ulangi"
                          : "Buka Briefing Misi"}
                      </span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
