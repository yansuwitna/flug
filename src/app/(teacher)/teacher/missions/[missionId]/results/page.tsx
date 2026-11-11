import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { TeacherLayoutWrapper } from "@/components/layouts/TeacherLayoutWrapper";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Users, Flag, Download } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function MissionResultsDetailPage({
  params,
}: {
  params: Promise<{ missionId: string }>;
}) {
  const { missionId } = await params;
  const user = await getCurrentUser();

  if (!user || (user.role !== "TEACHER" && user.role !== "ADMIN")) {
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
      challenges: {
        include: {
          clues: true,
          flagSubmissions: true,
        },
      },
      attempts: {
        include: {
          user: true,
          result: true,
          flagSubmissions: true,
          clueUsages: true,
        },
        orderBy: { completedAt: "desc" },
      },
    },
  });

  if (!mission) {
    notFound();
  }

  // Analisis statistik tantangan (persentase benar vs salah)
  const challengeStats = mission.challenges.map((ch, idx) => {
    const totalSubmissions = ch.flagSubmissions.length;
    const correctSubmissions = ch.flagSubmissions.filter((s) => s.isCorrect).length;
    const successRate =
      totalSubmissions > 0
        ? Math.round((correctSubmissions / totalSubmissions) * 100)
        : 0;

    return {
      index: idx + 1,
      title: ch.title,
      points: ch.points,
      totalSubmissions,
      correctSubmissions,
      successRate,
      cluesCount: ch.clues.length,
    };
  });

  return (
    <TeacherLayoutWrapper userName={user.name}>
      <div className="p-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <Link
            href="/teacher/reports"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Ringkasan Laporan
          </Link>

          <a
            href={`/api/export/mission/${mission.id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition shadow-lg self-start md:self-center"
          >
            <Download className="w-3.5 h-3.5" /> Unduh Laporan Nilai CSV
          </a>
        </div>

        {/* Header Mission */}
        <div className="p-8 rounded-3xl bg-slate-800 border border-slate-700 shadow-xl mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
              {mission.classSubject.subject.name}
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800">
              {mission.classSubject.schoolClass.name}
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-white">{mission.title}</h1>
          <p className="text-xs text-slate-300 mt-2 max-w-3xl leading-relaxed">
            {mission.description}
          </p>
        </div>

        {/* Statistik Tiap Tantangan Flag */}
        <div className="mb-8 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Flag className="w-5 h-5 text-emerald-400" /> Analisis Tingkat Kesulitan Tantangan ({mission.challenges.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {challengeStats.map((cs) => (
              <div
                key={cs.index}
                className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400">
                    Challenge #{cs.index}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {cs.points} XP
                  </span>
                </div>

                <h3 className="font-bold text-sm text-white">{cs.title}</h3>

                <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Tingkat Akurasi:</span>
                  <span
                    className={`font-black ${
                      cs.successRate >= 70
                        ? "text-emerald-400"
                        : cs.successRate >= 40
                        ? "text-amber-400"
                        : "text-rose-400"
                    }`}
                  >
                    {cs.successRate}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {cs.correctSubmissions} benar dari {cs.totalSubmissions} pengiriman flag
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabel Rekap Hasil Attempt Siswa */}
        <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80 shadow-xl space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" /> Riwayat Pengerjaan Siswa ({mission.attempts.length})
          </h2>

          {mission.attempts.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
              Belum ada siswa yang mengerjakan misi ini.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Siswa</th>
                    <th className="pb-3 font-semibold">Percobaan</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Flag Terpecahkan</th>
                    <th className="pb-3 font-semibold">Clue Dipakai</th>
                    <th className="pb-3 font-semibold">Skor Akhir</th>
                    <th className="pb-3 font-semibold text-right">Waktu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {mission.attempts.map((att) => {
                    const solvedCount = att.flagSubmissions.filter((s) => s.isCorrect).length;
                    const clueCount = att.clueUsages.length;
                    const score = att.result?.totalScore || 0;

                    return (
                      <tr key={att.id} className="hover:bg-slate-750/50 transition">
                        <td className="py-4">
                          <div className="font-bold text-white text-sm">{att.user.name}</div>
                          <span className="text-[11px] text-slate-400">{att.user.email}</span>
                        </td>

                        <td className="py-4 text-slate-300 font-medium">
                          Attempt #{att.attemptNumber}
                        </td>

                        <td className="py-4">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              att.status === "COMPLETED"
                                ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                                : "bg-amber-950 text-amber-400 border-amber-800"
                            }`}
                          >
                            {att.status}
                          </span>
                        </td>

                        <td className="py-4 font-semibold text-white">
                          {solvedCount} / {mission.challenges.length} Flag
                        </td>

                        <td className="py-4 text-amber-400 font-medium">
                          {clueCount} Clue
                        </td>

                        <td className="py-4 font-black text-amber-400 text-sm">
                          {score} XP
                        </td>

                        <td className="py-4 text-right text-slate-400">
                          {att.completedAt
                            ? new Date(att.completedAt).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "Sedang berjalan"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </TeacherLayoutWrapper>
  );
}
