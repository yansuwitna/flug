import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { TeacherLayoutWrapper } from "@/components/layouts/TeacherLayoutWrapper";
import {
  BarChart3,
  Flag,
  CheckCircle2,
  Download,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function TeacherReportsPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "TEACHER" && user.role !== "ADMIN")) {
    redirect("/login");
  }

  // 1. Ambil seluruh mission yang dibuat atau diampu oleh guru ini
  const missions = await prisma.mission.findMany({
    where: { creatorId: user.userId },
    include: {
      classSubject: {
        include: {
          schoolClass: {
            include: {
              _count: { select: { members: true } },
            },
          },
          subject: true,
        },
      },
      challenges: true,
      attempts: {
        include: {
          result: true,
          flagSubmissions: {
            where: { isCorrect: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

// Metrik Analitik Agregat
  const totalMissions = missions.length;

  const missionAnalytics = missions.map((m) => {
    const totalAssignedStudents = m.classSubject.schoolClass._count.members;
    const completedAttempts = m.attempts.filter((a) => a.status === "COMPLETED");
    const completionRate =
      totalAssignedStudents > 0
        ? Math.round((completedAttempts.length / totalAssignedStudents) * 100)
        : 0;

    const avgScore =
      completedAttempts.length > 0
        ? Math.round(
            completedAttempts.reduce(
              (sum, a) => sum + (a.result?.totalScore || 0),
              0
            ) / completedAttempts.length
          )
        : 0;

    return {
      id: m.id,
      title: m.title,
      subjectName: m.classSubject.subject.name,
      className: m.classSubject.schoolClass.name,
      status: m.status,
      assignedStudents: totalAssignedStudents,
      startedCount: m.attempts.length,
      completedCount: completedAttempts.length,
      completionRate,
      avgScore,
      totalChallenges: m.challenges.length,
    };
  });

  const totalAttemptsAll = missionAnalytics.reduce((sum, m) => sum + m.startedCount, 0);
  const totalCompletedAll = missionAnalytics.reduce((sum, m) => sum + m.completedCount, 0);
  const totalScoreSum = missionAnalytics.reduce((sum, m) => sum + m.avgScore, 0);
  const overallAvgScore =
    missions.length > 0 ? Math.round(totalScoreSum / missions.length) : 0;

  return (
    <TeacherLayoutWrapper userName={user.name}>
      <div className="p-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-white">Laporan & Analisis Pembelajaran</h2>
            <p className="text-sm text-slate-400 mt-1">
              Pantau tingkat partisipasi, akurasi pemecahan flag, dan rekap skor hasil belajar siswa.
            </p>
          </div>
        </div>

        {/* Global Summary Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Total Mission
              </span>
              <Flag className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-white">{totalMissions}</div>
            <p className="text-xs text-slate-400 mt-1">Misi yang dibuat</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Total Percobaan
              </span>
              <TrendingUp className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="text-3xl font-black text-cyan-400">{totalAttemptsAll}</div>
            <p className="text-xs text-slate-400 mt-1">Siswa memulai investigasi</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Misi Selesai
              </span>
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-3xl font-black text-emerald-400">{totalCompletedAll}</div>
            <p className="text-xs text-slate-400 mt-1">Tuntas hingga hasil akhir</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Rata-rata Skor
              </span>
              <BarChart3 className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-amber-400">{overallAvgScore} XP</div>
            <p className="text-xs text-slate-400 mt-1">Skor seluruh misi</p>
          </div>
        </div>

        {/* Tabel Analitik Per Mission */}
        <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" /> Ringkasan Hasil Belajar Per Mission
            </h3>
          </div>

          {missionAnalytics.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
              Belum ada data mission untuk dianalisis.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Mission</th>
                    <th className="pb-3 font-semibold">Kelas & Mapel</th>
                    <th className="pb-3 font-semibold">Partisipasi</th>
                    <th className="pb-3 font-semibold">Penyelesaian</th>
                    <th className="pb-3 font-semibold">Rata-rata Skor</th>
                    <th className="pb-3 font-semibold text-right">Aksi & Ekspor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {missionAnalytics.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-750/50 transition">
                      <td className="py-4 font-bold text-white max-w-xs">
                        <div className="truncate">{m.title}</div>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {m.totalChallenges} Tantangan
                        </span>
                      </td>

                      <td className="py-4 text-slate-300">
                        <span className="font-semibold text-cyan-400">{m.className}</span>
                        <div className="text-[11px] text-slate-400">{m.subjectName}</div>
                      </td>

                      <td className="py-4 text-slate-300">
                        <div className="font-semibold text-white">
                          {m.startedCount} / {m.assignedStudents} Siswa
                        </div>
                        <span className="text-[10px] text-slate-400">Mulai attempt</span>
                      </td>

                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-emerald-400">
                            {m.completionRate}%
                          </span>
                          <span className="text-[10px] text-slate-400">
                            ({m.completedCount} tuntas)
                          </span>
                        </div>
                      </td>

                      <td className="py-4 font-black text-amber-400 text-sm">
                        {m.avgScore} XP
                      </td>

                      <td className="py-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <a
                            href={`/api/export/mission/${m.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-[11px] font-semibold transition"
                            title="Unduh Rekap Nilai CSV"
                          >
                            <Download className="w-3.5 h-3.5" /> CSV
                          </a>

                          <Link
                            href={`/teacher/missions/${m.id}/results`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-semibold transition"
                          >
                            <span>Detail Siswa</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </TeacherLayoutWrapper>
  );
}
