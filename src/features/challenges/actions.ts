"use server";

import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { normalizeFlag, hashFlag } from "@/lib/security/hash";
import { revalidatePath } from "next/cache";
import { ChallengeType } from "@prisma/client";

async function requireTeacherOrAdmin() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "TEACHER" && user.role !== "ADMIN")) {
    throw new Error("Unauthorized: Hanya Guru atau Administrator yang berwenang");
  }
  return user;
}

// -----------------------------------------------------------------------------
// 1. TAMBAH CHALLENGE DENGAN FLAG & OPSI
// -----------------------------------------------------------------------------
const challengeSchema = z.object({
  missionId: z.string().min(1),
  title: z.string().min(3, "Judul challenge minimal 3 karakter"),
  question: z.string().min(5, "Pertanyaan tantangan minimal 5 karakter"),
  description: z.string().optional(),
  challengeType: z.nativeEnum(ChallengeType).default(ChallengeType.TEXT),
  points: z.coerce.number().min(10).default(100),
  orderIndex: z.coerce.number().default(1),
  maxTries: z.coerce.number().min(1).default(5),
  // Flag answer
  flagAnswer: z.string().min(1, "Kunci jawaban flag wajib diisi"),
  isCaseSensitive: z.boolean().default(false),
  trimSpaces: z.boolean().default(true),
  // Multiple Choice / Sequence Options (Opsional)
  options: z.string().optional(), // baris baru dipisahkan newline
});

export async function createChallengeAction(formData: FormData): Promise<void> {
  await requireTeacherOrAdmin();

  const validated = challengeSchema.safeParse({
    missionId: formData.get("missionId"),
    title: formData.get("title"),
    question: formData.get("question"),
    description: formData.get("description") || undefined,
    challengeType: formData.get("challengeType") || ChallengeType.TEXT,
    points: formData.get("points") || 100,
    orderIndex: formData.get("orderIndex") || 1,
    maxTries: formData.get("maxTries") || 5,
    flagAnswer: formData.get("flagAnswer"),
    isCaseSensitive: formData.get("isCaseSensitive") === "on",
    trimSpaces: formData.get("trimSpaces") !== "off",
    options: formData.get("options") || undefined,
  });

  if (!validated.success) {
    return;
  }

  const {
    missionId,
    title,
    question,
    description,
    challengeType,
    points,
    orderIndex,
    maxTries,
    flagAnswer,
    isCaseSensitive,
    trimSpaces,
    options,
  } = validated.data;

  // Normalisasi flag sebelum di-hash
  const normalizedKey = normalizeFlag(flagAnswer, { isCaseSensitive, trimSpaces });
  const secureHash = hashFlag(normalizedKey);

  // Parse options jika ada (misal untuk MULTIPLE_CHOICE atau SEQUENCE)
  const optionLines = options
    ? options
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  await prisma.$transaction(async (tx) => {
    // 1. Buat Challenge
    const challenge = await tx.challenge.create({
      data: {
        missionId,
        title,
        question,
        description,
        challengeType,
        points,
        orderIndex,
        maxTries,
      },
    });

    // 2. Simpan FlagAnswer (hanya menyimpan hash aman, bukan plaintext flag)
    await tx.flagAnswer.create({
      data: {
        challengeId: challenge.id,
        answerHash: secureHash,
        isCaseSensitive,
        trimSpaces,
      },
    });

    // 3. Simpan options jika tipe MC / Sequence
    if (optionLines.length > 0) {
      await tx.challengeOption.createMany({
        data: optionLines.map((optText, idx) => ({
          challengeId: challenge.id,
          optionText: optText,
          orderIndex: idx + 1,
        })),
      });
    }

    // 4. Update total poin pada Mission
    const allChallenges = await tx.challenge.findMany({
      where: { missionId },
      select: { points: true },
    });
    const totalPoints = allChallenges.reduce((sum, ch) => sum + ch.points, 0);

    await tx.mission.update({
      where: { id: missionId },
      data: { totalPoints },
    });
  });

  revalidatePath(`/teacher/missions/${missionId}/builder`);
  revalidatePath(`/teacher/missions/${missionId}/challenges`);
  revalidatePath(`/teacher/missions/${missionId}/preview`);
}

// -----------------------------------------------------------------------------
// 2. TAMBAH CLUE BERTINGKAT DENGAN PENALTI
// -----------------------------------------------------------------------------
const clueSchema = z.object({
  challengeId: z.string().min(1),
  missionId: z.string().min(1),
  title: z.string().min(2, "Judul clue wajib diisi"),
  hintText: z.string().min(5, "Isi clue minimal 5 karakter"),
  penaltyXp: z.coerce.number().min(0).default(0),
  orderIndex: z.coerce.number().default(1),
});

export async function addClueAction(formData: FormData): Promise<void> {
  await requireTeacherOrAdmin();

  const validated = clueSchema.safeParse({
    challengeId: formData.get("challengeId"),
    missionId: formData.get("missionId"),
    title: formData.get("title"),
    hintText: formData.get("hintText"),
    penaltyXp: formData.get("penaltyXp") || 0,
    orderIndex: formData.get("orderIndex") || 1,
  });

  if (!validated.success) {
    return;
  }

  const { challengeId, missionId, title, hintText, penaltyXp, orderIndex } = validated.data;

  await prisma.clue.create({
    data: {
      challengeId,
      title,
      hintText,
      penaltyXp,
      orderIndex,
    },
  });

  revalidatePath(`/teacher/missions/${missionId}/builder`);
  revalidatePath(`/teacher/missions/${missionId}/challenges`);
  revalidatePath(`/teacher/missions/${missionId}/preview`);
}

// -----------------------------------------------------------------------------
// 3. HAPUS CLUE & CHALLENGE
// -----------------------------------------------------------------------------
export async function deleteClueAction(clueId: string, missionId: string): Promise<void> {
  await requireTeacherOrAdmin();
  await prisma.clue.delete({ where: { id: clueId } });
  revalidatePath(`/teacher/missions/${missionId}/builder`);
  revalidatePath(`/teacher/missions/${missionId}/challenges`);
}

export async function deleteChallengeAction(
  challengeId: string,
  missionId: string
): Promise<void> {
  await requireTeacherOrAdmin();

  await prisma.$transaction(async (tx) => {
    await tx.challenge.delete({ where: { id: challengeId } });

    // Recalculate total points
    const remaining = await tx.challenge.findMany({
      where: { missionId },
      select: { points: true },
    });
    const totalPoints = remaining.reduce((sum, ch) => sum + ch.points, 0);

    await tx.mission.update({
      where: { id: missionId },
      data: { totalPoints },
    });
  });

  revalidatePath(`/teacher/missions/${missionId}/builder`);
  revalidatePath(`/teacher/missions/${missionId}/challenges`);
  revalidatePath(`/teacher/missions/${missionId}/preview`);
}
