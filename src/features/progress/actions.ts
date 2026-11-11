"use server";

import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { StatusPercobaan, StatusMisi } from "@prisma/client";
import { evaluateAndAwardBadges } from "@/features/gamification/levels";

async function requireStudent() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "SISWA" && user.role !== "ADMIN")) {
    throw new Error("Unauthorized: Akses khusus siswa");
  }
  return user;
}

/**
 * Memulai atau melanjutkan attempt mission
 */
export async function startOrResumeAttemptAction(idMisi: string): Promise<void> {
  const user = await requireStudent();

  // 1. Validasi hak akses siswa ke kelas mission ini
  const mission = await prisma.misi.findUnique({
    where: { id: idMisi },
    include: {
      mapelKelas: {
        include: {
          kelas: {
            include: {
              anggota: {
                where: { idSiswa: user.userId },
              },
            },
          },
        },
      },
    },
  });

  if (!mission || (mission.status !== StatusMisi.DITERBITKAN && user.role !== "ADMIN")) {
    throw new Error("Misi tidak ditemukan atau belum dipublikasikan");
  }

  // Jika bukan admin, pastikan siswa terdaftar di kelas bersangkutan
  if (user.role !== "ADMIN" && mission.mapelKelas.kelas.anggota.length === 0) {
    throw new Error("Anda tidak terdaftar di kelas untuk misi ini");
  }

  // 2. Cek apakah ada attempt yang sedang SEDANG_BERJALAN
  let attempt = await prisma.percobaanMisi.findFirst({
    where: {
      idSiswa: user.userId,
      idMisi,
      status: StatusPercobaan.SEDANG_BERJALAN,
    },
  });

  if (!attempt) {
    // Hitung total attempt sebelumnya
    const totalPreviousAttempts = await prisma.percobaanMisi.count({
      where: { idSiswa: user.userId, idMisi },
    });

    if (totalPreviousAttempts >= mission.maksPercobaan) {
      throw new Error("Anda telah mencapai batas maksimal percobaan untuk misi ini");
    }

    // Buat attempt baru
    attempt = await prisma.percobaanMisi.create({
      data: {
        idSiswa: user.userId,
        idMisi,
        nomorPercobaan: totalPreviousAttempts + 1,
        status: StatusPercobaan.SEDANG_BERJALAN,
      },
    });
  }

  revalidatePath(`/siswa/misi/${idMisi}/kerjakan`);
  redirect(`/siswa/misi/${idMisi}/kerjakan`);
}

/**
 * Menyelesaikan Attempt Misi & Menghitung Skor Final
 */
export async function completeAttemptAction(idPercobaan: string): Promise<void> {
  const user = await requireStudent();

  const attempt = await prisma.percobaanMisi.findUnique({
    where: { id: idPercobaan },
    include: {
      kirimanJawaban: {
        where: { benar: true },
      },
      penggunaanPetunjuk: true,
      misi: {
        include: { tantangan: true },
      },
    },
  });

  if (!attempt || attempt.idSiswa !== user.userId) {
    throw new Error("Percobaan tidak valid");
  }

  // Hitung total poin yang diperoleh dari challenge yang dijawab benar
  const totalScore = attempt.kirimanJawaban.reduce(
    (sum, sub) => sum + sub.poinDidapat,
    0
  );

  await prisma.$transaction(async (tx) => {
    // 1. Update status attempt ke SELESAI
    await tx.percobaanMisi.update({
      where: { id: idPercobaan },
      data: {
        status: StatusPercobaan.SELESAI,
        selesaiPada: new Date(),
      },
    });

    // 2. Buat atau perbarui HasilMisi
    await tx.hasilMisi.upsert({
      where: { idPercobaan },
      create: {
        idPercobaan,
        totalSkor: totalScore,
        xpDidapat: totalScore,
        selesaiPada: new Date(),
      },
      update: {
        totalSkor: totalScore,
        xpDidapat: totalScore,
        selesaiPada: new Date(),
      },
    });

    // 3. Catat TransaksiXp jika skor > 0
    if (totalScore > 0) {
      await tx.transaksiXp.create({
        data: {
          idSiswa: user.userId,
          jumlah: totalScore,
          sumber: "SELESAI_MISI",
          idReferensi: idPercobaan,
          deskripsi: `Menyelesaikan Misi: ${attempt.misi.judul}`,
        },
      });
    }
  });

  // Evaluasi dan beri badge jika memenuhi kriteria
  await evaluateAndAwardBadges(user.userId);

  revalidatePath("/siswa");
  revalidatePath("/siswa/prestasi");
  revalidatePath("/siswa/peringkat");
  revalidatePath(`/siswa/misi/${attempt.idMisi}`);
  redirect(`/siswa`);
}
