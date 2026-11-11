import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { startOrResumeAttemptAction } from "@/features/progress/actions";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Play, Target, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export const dynamic = "force-dynamic";

export default async function MissionBriefingPage({
  params,
}: {
  params: Promise<{ missionId: string }>;
}) {
  const { missionId } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const mission = await prisma.mission.findUnique({
    where: { id: missionId },
    include: {
      classSubject: {
        include: {
          schoolClass: true,
          subject: true,
        },
      },
      chapter: true,
      _count: {
        select: {
          learningContent: true,
          challenges: true,
        },
      },
      attempts: {
        where: { userId: user.userId },
        orderBy: { attemptNumber: "desc" },
      },
    },
  });

  if (!mission) {
    notFound();
  }

  const latestAttempt = mission.attempts[0];
  const isCompleted = latestAttempt?.status === "COMPLETED";
  const isInProgress = latestAttempt?.status === "IN_PROGRESS";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-center items-center px-4 py-12 transition-colors duration-200 relative">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="max-w-2xl w-full">
        <Link
          href="/student/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard Siswa
        </Link>

        {/* Card Briefing Misi */}
        <div className="p-8 md:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800">
              {mission.classSubject.subject.name}
            </span>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              {mission.classSubject.schoolClass.name}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Bab {mission.chapter.orderIndex}: {mission.chapter.title}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mt-1">
            {mission.title}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
            {mission.description}
          </p>

          {/* Objectives */}
          {mission.learningObjectives && (
            <div className="mt-6 p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Target className="w-4 h-4" /> Tujuan Pembelajaran:
              </h3>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line font-sans">
                {mission.learningObjectives}
              </p>
            </div>
          )}

          {/* Metrik Misi */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80">
              <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">Materi & Video</span>
              <span className="text-base font-bold text-slate-900 dark:text-white">
                {mission._count.learningContent} Modul
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80">
              <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">Tantangan Flag</span>
              <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                {mission._count.challenges} Soal
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80">
              <span className="text-xs text-slate-500 dark:text-slate-400 block mb-0.5">Total Poin</span>
              <span className="text-base font-bold text-amber-600 dark:text-amber-400">
                {mission.totalPoints} XP
              </span>
            </div>
          </div>

          {/* Action CTA */}
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              {isCompleted ? (
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" /> Misi telah diselesaikan
                </div>
              ) : isInProgress ? (
                <div className="text-xs text-cyan-600 dark:text-cyan-400 font-semibold">
                  Misi sedang berjalan (Percobaan #{latestAttempt.attemptNumber})
                </div>
              ) : (
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Percobaan tersisa: {mission.maxAttempts - mission.attempts.length} dari {mission.maxAttempts}
                </div>
              )}
            </div>

            <form action={startOrResumeAttemptAction.bind(null, mission.id)}>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-2xl transition shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4" />
                <span>
                  {isInProgress
                    ? "Lanjutkan Investigasi"
                    : isCompleted
                    ? "Ulangi Misi (Attempt Baru)"
                    : "Mulai Investigasi"}
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
