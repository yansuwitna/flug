"use server";

import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export async function exportMissionResultsCsvAction(idMisi: string): Promise<string> {
  const user = await getCurrentUser();
  if (!user || (user.role !== "GURU" && user.role !== "ADMIN")) {
    throw new Error("Unauthorized");
  }

  const mission = await prisma.misi.findUnique({
    where: { id: idMisi },
    include: {
      mapelKelas: {
        include: {
          kelas: true,
          mataPelajaran: true,
        },
      },
      tantangan: true,
      percobaan: {
        include: {
          siswa: true,
          hasil: true,
          kirimanJawaban: {
            where: { benar: true },
          },
          penggunaanPetunjuk: true,
        },
        orderBy: { selesaiPada: "desc" },
      },
    },
  });

  if (!mission) {
    throw new Error("Misi tidak ditemukan");
  }

  // Header CSV
  const headers = [
    "No",
    "Nama Siswa",
    "Email",
    "Kelas",
    "Mata Pelajaran",
    "Judul Misi",
    "Percobaan Ke",
    "Status",
    "Flag Terpecahkan",
    "Total Tantangan",
    "Petunjuk Digunakan",
    "Total Skor",
    "Waktu Selesai",
  ];

  const rows = mission.percobaan.map((att, idx) => {
    const solvedCount = att.kirimanJawaban.length;
    const clueCount = att.penggunaanPetunjuk.length;
    const score = att.hasil?.totalSkor || 0;
    const completedTime = att.selesaiPada
      ? new Date(att.selesaiPada).toLocaleString("id-ID")
      : "-";

    return [
      idx + 1,
      `"${att.siswa.nama.replace(/"/g, '""')}"`,
      `"${att.siswa.email}"`,
      `"${mission.mapelKelas.kelas.nama}"`,
      `"${mission.mapelKelas.mataPelajaran.nama}"`,
      `"${mission.judul.replace(/"/g, '""')}"`,
      att.nomorPercobaan,
      att.status,
      solvedCount,
      mission.tantangan.length,
      clueCount,
      score,
      `"${completedTime}"`,
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}
