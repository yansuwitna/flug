"use server";

import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ContentType, MissionStatus } from "@prisma/client";

async function requireTeacherOrAdmin() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "TEACHER" && user.role !== "ADMIN")) {
    throw new Error("Unauthorized: Hanya Guru atau Administrator yang berwenang");
  }
  return user;
}

// -----------------------------------------------------------------------------
// 1. BUAT MISSION BARU (Langkah 1 Wizard)
// -----------------------------------------------------------------------------
const createMissionSchema = z.object({
  classSubjectId: z.string().min(1, "Pilih kelas & mata pelajaran"),
  chapterId: z.string().min(1, "Pilih bab pembelajaran"),
  title: z.string().min(3, "Judul mission minimal 3 karakter"),
  description: z.string().min(10, "Deskripsi mission minimal 10 karakter"),
  learningObjectives: z.string().optional(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).default("MEDIUM"),
  durationMinutes: z.coerce.number().optional(),
  maxAttempts: z.coerce.number().min(1).default(3),
});

export async function createMissionAction(formData: FormData): Promise<void> {
  const user = await requireTeacherOrAdmin();

  const validated = createMissionSchema.safeParse({
    classSubjectId: formData.get("classSubjectId"),
    chapterId: formData.get("chapterId"),
    title: formData.get("title"),
    description: formData.get("description"),
    learningObjectives: formData.get("learningObjectives") || undefined,
    difficulty: formData.get("difficulty") || "MEDIUM",
    durationMinutes: formData.get("durationMinutes")
      ? Number(formData.get("durationMinutes"))
      : undefined,
    maxAttempts: formData.get("maxAttempts") ? Number(formData.get("maxAttempts")) : 3,
  });

  if (!validated.success) {
    return;
  }

  const {
    classSubjectId,
    chapterId,
    title,
    description,
    learningObjectives,
    difficulty,
    durationMinutes,
    maxAttempts,
  } = validated.data;

  // Generate slug unik
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
  const slug = `${baseSlug}-${Date.now().toString().slice(-6)}`;

  const newMission = await prisma.mission.create({
    data: {
      classSubjectId,
      chapterId,
      creatorId: user.userId,
      title,
      slug,
      description,
      learningObjectives,
      difficulty,
      durationMinutes,
      maxAttempts,
      status: MissionStatus.DRAFT,
    },
  });

  revalidatePath("/teacher/missions");
  revalidatePath("/teacher/dashboard");
  redirect(`/teacher/missions/${newMission.id}/builder`);
}

// -----------------------------------------------------------------------------
// 2. UPDATE STATUS MISSION (DRAFT / PUBLISHED / ARCHIVED)
// -----------------------------------------------------------------------------
export async function updateMissionStatusAction(
  missionId: string,
  newStatus: MissionStatus
): Promise<void> {
  await requireTeacherOrAdmin();

  await prisma.mission.update({
    where: { id: missionId },
    data: {
      status: newStatus,
      publishedAt: newStatus === MissionStatus.PUBLISHED ? new Date() : undefined,
    },
  });

  revalidatePath("/teacher/missions");
  revalidatePath(`/teacher/missions/${missionId}/builder`);
  revalidatePath("/student/dashboard");
}

// -----------------------------------------------------------------------------
// 3. LEARNING CONTENT (Video Embed, Text, Link, Document)
// -----------------------------------------------------------------------------
const learningContentSchema = z.object({
  missionId: z.string().min(1),
  contentType: z.nativeEnum(ContentType),
  title: z.string().min(2, "Judul konten wajib diisi"),
  body: z.string().optional(),
  mediaUrl: z.string().optional(),
  orderIndex: z.coerce.number().default(1),
});

export async function addLearningContentAction(formData: FormData): Promise<void> {
  await requireTeacherOrAdmin();

  const validated = learningContentSchema.safeParse({
    missionId: formData.get("missionId"),
    contentType: formData.get("contentType"),
    title: formData.get("title"),
    body: formData.get("body") || undefined,
    mediaUrl: formData.get("mediaUrl") || undefined,
    orderIndex: formData.get("orderIndex") || 1,
  });

  if (!validated.success) {
    return;
  }

  const { missionId, contentType, title, body, mediaUrl, orderIndex } = validated.data;

  await prisma.learningContent.create({
    data: {
      missionId,
      contentType,
      title,
      body,
      mediaUrl,
      orderIndex,
    },
  });

  revalidatePath(`/teacher/missions/${missionId}/builder`);
  revalidatePath(`/teacher/missions/${missionId}/preview`);
}

export async function deleteLearningContentAction(
  contentId: string,
  missionId: string
): Promise<void> {
  await requireTeacherOrAdmin();
  await prisma.learningContent.delete({ where: { id: contentId } });
  revalidatePath(`/teacher/missions/${missionId}/builder`);
  revalidatePath(`/teacher/missions/${missionId}/preview`);
}

// -----------------------------------------------------------------------------
// 4. HAPUS MISSION
// -----------------------------------------------------------------------------
export async function deleteMissionAction(missionId: string): Promise<void> {
  await requireTeacherOrAdmin();
  await prisma.mission.delete({ where: { id: missionId } });
  revalidatePath("/teacher/missions");
  revalidatePath("/teacher/dashboard");
}
