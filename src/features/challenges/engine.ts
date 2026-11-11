"use server";

import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { normalizeFlag, hashFlag } from "@/lib/security/hash";
import { revalidatePath } from "next/cache";

// Sederhana in-memory rate limiter untuk proteksi submit flag per user & challenge
const submissionRateMap = new Map<string, number[]>();

function checkRateLimit(idSiswa: string, idTantangan: string, limit = 5, windowMs = 15000): boolean {
  const key = `${idSiswa}:${idTantangan}`;
  const now = Date.now();
  const timestamps = (submissionRateMap.get(key) || []).filter((t) => now - t < windowMs);

  if (timestamps.length >= limit) {
    return false;
  }

  timestamps.push(now);
  submissionRateMap.set(key, timestamps);
  return true;
}

export interface SubmissionResponse {
  success: boolean;
  isCorrect?: boolean;
  message: string;
  pointsAwarded?: number;
}

const submitFlagSchema = z.object({
  idPercobaan: z.string().min(1),
  idTantangan: z.string().min(1),
  rawFlag: z.string().min(1, "Jawaban flag tidak boleh kosong"),
});

export async function submitFlagAction(
  idPercobaan: string,
  idTantangan: string,
  rawFlag: string
): Promise<SubmissionResponse> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, message: "Sesi tidak valid. Silakan login kembali." };
  }

  const validated = submitFlagSchema.safeParse({ idPercobaan, idTantangan, rawFlag });
  if (!validated.success) {
    return { success: false, message: "Data flag yang dikirimkan tidak valid." };
  }

  // 1. Cek Rate Limit
  const isAllowed = checkRateLimit(user.userId, idTantangan, 5, 15000);
  if (!isAllowed) {
    return {
      success: false,
      message: "Terlalu banyak percobaan. Harap tunggu beberapa detik sebelum mengirim lagi.",
    };
  }

  // 2. Cek Attempt & Kepemilikan Sesi
  const attempt = await prisma.percobaanMisi.findUnique({
    where: { id: idPercobaan },
    include: {
      misi: true,
      penggunaanPetunjuk: {
        where: { petunjuk: { idTantangan } },
      },
    },
  });

  if (!attempt || attempt.idSiswa !== user.userId) {
    return { success: false, message: "Percobaan misi tidak ditemukan atau tidak sah." };
  }

  if (attempt.status !== "SEDANG_BERJALAN") {
    return { success: false, message: "Misi ini sudah selesai atau tidak aktif." };
  }

  // 3. Cek apakah challenge sudah pernah dijawab dengan benar di attempt ini
  const existingCorrect = await prisma.kirimanJawaban.findFirst({
    where: {
      idPercobaan,
      idTantangan,
      benar: true,
    },
  });

  if (existingCorrect) {
    return {
      success: true,
      isCorrect: true,
      pointsAwarded: existingCorrect.poinDidapat,
      message: "Tantangan ini sudah berhasil diselesaikan sebelumnya!",
    };
  }

  // 4. Ambil aturan Hash Flag dari Database
  const flagAnswers = await prisma.kunciJawaban.findMany({
    where: { idTantangan },
  });

  const challenge = await prisma.tantangan.findUnique({
    where: { id: idTantangan },
  });

  if (!challenge || flagAnswers.length === 0) {
    return { success: false, message: "Tantangan atau kunci jawaban belum dikonfigurasi." };
  }

  // 5. Bandingkan Hash Jawaban Masukan Siswa vs Database
  let isCorrect = false;

  for (const fa of flagAnswers) {
    const normalizedInput = normalizeFlag(rawFlag, {
      trimSpaces: fa.pangkasSpasi,
      isCaseSensitive: fa.hurufBesarKecil,
    });
    const calculatedHash = hashFlag(normalizedInput);

    if (calculatedHash === fa.hashJawaban) {
      isCorrect = true;
      break;
    }
  }

  // 6. Hitung Pengurangan Skor dari Penalti Petunjuk
  const totalCluePenalty = attempt.penggunaanPetunjuk.reduce(
    (sum, c) => sum + c.penaltiDipotong,
    0
  );
  const calculatedPoints = isCorrect ? Math.max(0, challenge.poin - totalCluePenalty) : 0;

  // 7. Simpan Riwayat Submission
  await prisma.kirimanJawaban.create({
    data: {
      idPercobaan,
      idTantangan,
      jawabanTerkirim: rawFlag,
      benar: isCorrect,
      poinDidapat: calculatedPoints,
    },
  });

  revalidatePath(`/siswa/misi/${attempt.idMisi}/kerjakan`);

  if (isCorrect) {
    return {
      success: true,
      isCorrect: true,
      pointsAwarded: calculatedPoints,
      message: `🎉 Flag valid! Anda memperoleh +${calculatedPoints} XP.`,
    };
  } else {
    return {
      success: true,
      isCorrect: false,
      message: "❌ Flag salah atau tidak cocok. Periksa kembali jawaban Anda!",
    };
  }
}

/**
 * Membuka Petunjuk (Clue) dengan mencatat penalti skor
 */
export async function unlockClueAction(
  idPercobaan: string,
  idPetunjuk: string
): Promise<{ success: boolean; hintText?: string; message: string }> {
  const user = await getCurrentUser();
  if (!user) return { success: false, message: "Sesi tidak valid." };

  const clue = await prisma.petunjuk.findUnique({ where: { id: idPetunjuk } });
  if (!clue) {
    return { success: false, message: "Petunjuk tidak ditemukan." };
  }

  const existing = await prisma.penggunaanPetunjuk.findUnique({
    where: {
      idPercobaan_idPetunjuk: {
        idPercobaan,
        idPetunjuk,
      },
    },
  });

  if (existing) {
    return {
      success: true,
      hintText: clue.teksPetunjuk,
      message: "Petunjuk sudah dibuka sebelumnya.",
    };
  }

  await prisma.penggunaanPetunjuk.create({
    data: {
      idPercobaan,
      idPetunjuk,
      penaltiDipotong: clue.penaltiXp,
    },
  });

  revalidatePath(`/siswa/misi`);

  return {
    success: true,
    hintText: clue.teksPetunjuk,
    message: `Petunjuk terbuka! Penalti -${clue.penaltiXp} poin diterapkan pada soal ini.`,
  };
}
