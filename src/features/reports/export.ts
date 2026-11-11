import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";

/**
 * Generate string format CSV untuk laporan hasil pengerjaan misi siswa
 */
export async function exportMissionResultsCSV(missionId: string): Promise<string> {
  const user = await getCurrentUser();
  if (!user || (user.role !== "TEACHER" && user.role !== "ADMIN")) {
    throw new Error("Unauthorized");
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
      challenges: true,
      attempts: {
        include: {
          user: true,
          result: true,
          flagSubmissions: {
            where: { isCorrect: true },
          },
          clueUsages: true,
        },
        orderBy: { completedAt: "desc" },
      },
    },
  });

  if (!mission) {
    throw new Error("Mission tidak ditemukan");
  }

  // Header CSV
  const headers = [
    "No",
    "Nama Siswa",
    "Email",
    "Kelas",
    "Mata Pelajaran",
    "Judul Mission",
    "Attempt Ke",
    "Status",
    "Flag Terpecahkan",
    "Total Challenge",
    "Clue Digunakan",
    "Total Skor",
    "Waktu Selesai",
  ];

  const rows = mission.attempts.map((att, idx) => {
    const solvedCount = att.flagSubmissions.length;
    const clueCount = att.clueUsages.length;
    const score = att.result?.totalScore || 0;
    const completedTime = att.completedAt
      ? new Date(att.completedAt).toLocaleString("id-ID")
      : "-";

    return [
      idx + 1,
      `"${att.user.name.replace(/"/g, '""')}"`,
      `"${att.user.email}"`,
      `"${mission.classSubject.schoolClass.name}"`,
      `"${mission.classSubject.subject.name}"`,
      `"${mission.title.replace(/"/g, '""')}"`,
      att.attemptNumber,
      att.status,
      solvedCount,
      mission.challenges.length,
      clueCount,
      score,
      `"${completedTime}"`,
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}
