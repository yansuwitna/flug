"use server";

import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { normalizeFlag, hashFlag } from "@/lib/security/hash";
import { revalidatePath } from "next/cache";

// Sederhana in-memory rate limiter untuk proteksi submit flag per user & challenge
// format: `${userId}:${challengeId}` -> Array of timestamps
const submissionRateMap = new Map<string, number[]>();

function checkRateLimit(userId: string, challengeId: string, limit = 5, windowMs = 15000): boolean {
  const key = `${userId}:${challengeId}`;
  const now = Date.now();
  const timestamps = (submissionRateMap.get(key) || []).filter((t) => now - t < windowMs);

  if (timestamps.length >= limit) {
    return false; // Terkena rate limit
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
  attemptId: z.string().min(1),
  challengeId: z.string().min(1),
  rawFlag: z.string().min(1, "Jawaban flag tidak boleh kosong"),
});

/**
 * Validasi pengiriman flag aman di server:
 * - Rate limiting dicek
 * - Attempt berstatus IN_PROGRESS diverifikasi
 * - Normalisasi dan Hashing HMAC dilakukan
 * - Database transaction mencatat submission & menghitung poin
 * - Kunci flag tidak pernah bocor ke client
 */
export async function submitFlagAction(
  attemptId: string,
  challengeId: string,
  rawFlag: string
): Promise<SubmissionResponse> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, message: "Sesi tidak valid. Silakan login kembali." };
  }

  const validated = submitFlagSchema.safeParse({ attemptId, challengeId, rawFlag });
  if (!validated.success) {
    return { success: false, message: "Data flag yang dikirimkan tidak valid." };
  }

  // 1. Cek Rate Limit
  const isAllowed = checkRateLimit(user.userId, challengeId, 5, 15000);
  if (!isAllowed) {
    return {
      success: false,
      message: "Terlalu banyak percobaan. Harap tunggu beberapa detik sebelum mengirim lagi.",
    };
  }

  // 2. Cek Attempt & Kepemilikan Sesi
  const attempt = await prisma.missionAttempt.findUnique({
    where: { id: attemptId },
    include: {
      mission: true,
      clueUsages: {
        where: { clue: { challengeId } },
      },
    },
  });

  if (!attempt || attempt.userId !== user.userId) {
    return { success: false, message: "Attempt misi tidak ditemukan atau tidak sah." };
  }

  if (attempt.status !== "IN_PROGRESS") {
    return { success: false, message: "Misi ini sudah selesai atau tidak aktif." };
  }

  // 3. Cek apakah challenge sudah pernah dijawab dengan benar di attempt ini
  const existingCorrect = await prisma.flagSubmission.findFirst({
    where: {
      attemptId,
      challengeId,
      isCorrect: true,
    },
  });

  if (existingCorrect) {
    return {
      success: true,
      isCorrect: true,
      pointsAwarded: existingCorrect.pointsAwarded,
      message: "Tantangan ini sudah berhasil diselesaikan sebelumnya!",
    };
  }

  // 4. Ambil aturan Hash Flag dari Database
  const flagAnswers = await prisma.flagAnswer.findMany({
    where: { challengeId },
  });

  const challenge = await prisma.challenge.findUnique({
    where: { id: challengeId },
  });

  if (!challenge || flagAnswers.length === 0) {
    return { success: false, message: "Konfigurasi tantangan belum lengkap." };
  }

  // 5. Bandingkan dengan variasi flag yang diterima
  let isCorrect = false;
  for (const answerConfig of flagAnswers) {
    const normalizedInput = normalizeFlag(rawFlag, {
      isCaseSensitive: answerConfig.isCaseSensitive,
      trimSpaces: answerConfig.trimSpaces,
    });

    const computedHash = hashFlag(normalizedInput);
    if (computedHash === answerConfig.answerHash) {
      isCorrect = true;
      break;
    }
  }

  // 6. Hitung Poin (Poin Dasar - Total Penalti Clue yang sudah dibuka untuk challenge ini)
  let pointsAwarded = 0;
  if (isCorrect) {
    const totalCluePenalty = attempt.clueUsages.reduce((sum, cu) => sum + cu.penaltyDeducted, 0);
    pointsAwarded = Math.max(0, challenge.points - totalCluePenalty);
  }

  // 7. Simpan FlagSubmission secara transaksional
  await prisma.flagSubmission.create({
    data: {
      attemptId,
      challengeId,
      submittedAnswer: rawFlag, // Simpan untuk audit guru
      isCorrect,
      pointsAwarded,
    },
  });

  revalidatePath(`/student/missions/${attempt.missionId}/play`);
  revalidatePath(`/teacher/missions/${attempt.missionId}/results`);

  if (isCorrect) {
    return {
      success: true,
      isCorrect: true,
      pointsAwarded,
      message: `🎉 Flag valid! Kamu berhasil mengumpulkan +${pointsAwarded} Poin!`,
    };
  } else {
    return {
      success: true,
      isCorrect: false,
      message: "❌ Flag tidak cocok. Coba investigasi materi lebih teliti atau gunakan Clue!",
    };
  }
}

/**
 * Buka Clue Bertingkat dengan Penalti
 */
export async function unlockClueAction(attemptId: string, clueId: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false, message: "Sesi tidak valid." };

  const clue = await prisma.clue.findUnique({ where: { id: clueId } });
  if (!clue) return { success: false, message: "Clue tidak ditemukan." };

  // Cek apakah sudah pernah dibuka
  const existing = await prisma.clueUsage.findUnique({
    where: {
      attemptId_clueId: {
        attemptId,
        clueId,
      },
    },
  });

  if (existing) {
    return { success: true, clueText: clue.hintText, penalty: 0 };
  }

  await prisma.clueUsage.create({
    data: {
      attemptId,
      clueId,
      penaltyDeducted: clue.penaltyXp,
    },
  });

  return {
    success: true,
    clueText: clue.hintText,
    penalty: clue.penaltyXp,
  };
}
