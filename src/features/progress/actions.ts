"use server";

import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AttemptStatus, MissionStatus } from "@prisma/client";
import { evaluateAndAwardBadges } from "@/features/gamification/levels";

async function requireStudent() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "STUDENT" && user.role !== "ADMIN")) {
    throw new Error("Unauthorized: Akses khusus siswa");
  }
  return user;
}

/**
 * Memulai atau melanjutkan attempt mission
 */
export async function startOrResumeAttemptAction(missionId: string): Promise<void> {
  const user = await requireStudent();

  // 1. Validasi hak akses siswa ke kelas mission ini
  const mission = await prisma.mission.findUnique({
    where: { id: missionId },
    include: {
      classSubject: {
        include: {
          schoolClass: {
            include: {
              members: {
                where: { userId: user.userId },
              },
            },
          },
        },
      },
    },
  });

  if (!mission || (mission.status !== MissionStatus.PUBLISHED && user.role !== "ADMIN")) {
    throw new Error("Mission tidak ditemukan atau belum dipublikasikan");
  }

  // Jika bukan admin, pastikan siswa terdaftar di kelas bersangkutan
  if (user.role !== "ADMIN" && mission.classSubject.schoolClass.members.length === 0) {
    throw new Error("Anda tidak terdaftar di kelas untuk mission ini");
  }

  // 2. Cek apakah ada attempt yang sedang IN_PROGRESS
  let attempt = await prisma.missionAttempt.findFirst({
    where: {
      userId: user.userId,
      missionId,
      status: AttemptStatus.IN_PROGRESS,
    },
  });

  if (!attempt) {
    // Hitung total attempt sebelumnya
    const totalPreviousAttempts = await prisma.missionAttempt.count({
      where: { userId: user.userId, missionId },
    });

    if (totalPreviousAttempts >= mission.maxAttempts) {
      throw new Error("Anda telah mencapai batas maksimal percobaan untuk misi ini");
    }

    // Buat attempt baru
    attempt = await prisma.missionAttempt.create({
      data: {
        userId: user.userId,
        missionId,
        attemptNumber: totalPreviousAttempts + 1,
        status: AttemptStatus.IN_PROGRESS,
      },
    });
  }

  revalidatePath(`/student/missions/${missionId}/play`);
  redirect(`/student/missions/${missionId}/play`);
}

/**
 * Menyelesaikan Attempt Misi & Menghitung Skor Final
 */
export async function completeAttemptAction(attemptId: string): Promise<void> {
  const user = await requireStudent();

  const attempt = await prisma.missionAttempt.findUnique({
    where: { id: attemptId },
    include: {
      flagSubmissions: {
        where: { isCorrect: true },
      },
      clueUsages: true,
      mission: {
        include: { challenges: true },
      },
    },
  });

  if (!attempt || attempt.userId !== user.userId) {
    throw new Error("Attempt tidak valid");
  }

  // Hitung total poin yang diperoleh dari challenge yang dijawab benar
  const totalScore = attempt.flagSubmissions.reduce(
    (sum, sub) => sum + sub.pointsAwarded,
    0
  );

  await prisma.$transaction(async (tx) => {
    // 1. Update status attempt ke COMPLETED
    await tx.missionAttempt.update({
      where: { id: attemptId },
      data: {
        status: AttemptStatus.COMPLETED,
        completedAt: new Date(),
      },
    });

    // 2. Buat atau perbarui MissionResult
    await tx.missionResult.upsert({
      where: { attemptId },
      create: {
        attemptId,
        totalScore,
        xpEarned: totalScore,
        completedAt: new Date(),
      },
      update: {
        totalScore,
        xpEarned: totalScore,
        completedAt: new Date(),
      },
    });

    // 3. Catat XpTransaction jika skor > 0
    if (totalScore > 0) {
      await tx.xpTransaction.create({
        data: {
          userId: user.userId,
          amount: totalScore,
          source: "MISSION_SOLVE",
          referenceId: attemptId,
          description: `Menyelesaikan Misi: ${attempt.mission.title}`,
        },
      });
    }
  });

  // Evaluasi dan beri badge jika memenuhi kriteria
  await evaluateAndAwardBadges(user.userId);

  revalidatePath("/student/dashboard");
  revalidatePath("/student/missions");
  revalidatePath("/student/achievements");
  revalidatePath("/student/leaderboard");
  revalidatePath(`/student/missions/${attempt.missionId}`);
  redirect(`/student/dashboard`);
}
