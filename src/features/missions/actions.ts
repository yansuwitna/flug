"use server";

import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { TipeKonten, StatusMisi } from "@prisma/client";

async function requireTeacherOrAdmin() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "GURU" && user.role !== "ADMIN")) {
    throw new Error("Unauthorized: Hanya Guru atau Administrator yang berwenang");
  }
  return user;
}

// -----------------------------------------------------------------------------
// 1. BUAT MISSION BARU (Langkah 1 Wizard)
// -----------------------------------------------------------------------------
const createMissionSchema = z.object({
  idMapelKelas: z.string().min(1, "Pilih kelas & mata pelajaran"),
  idBab: z.string().min(1, "Pilih bab pembelajaran"),
  judul: z.string().min(3, "Judul mission minimal 3 karakter"),
  deskripsi: z.string().min(10, "Deskripsi mission minimal 10 karakter"),
  tujuanBelajar: z.string().optional(),
  tingkatKesulitan: z.enum(["MUDAH", "SEDANG", "SULIT"]).default("SEDANG"),
  durasiMenit: z.coerce.number().optional(),
  maksPercobaan: z.coerce.number().min(1).default(3),
});

export async function createMissionAction(formData: FormData): Promise<void> {
  const user = await requireTeacherOrAdmin();

  const validated = createMissionSchema.safeParse({
    idMapelKelas: formData.get("classSubjectId") || formData.get("idMapelKelas"),
    idBab: formData.get("chapterId") || formData.get("idBab"),
    judul: formData.get("title") || formData.get("judul"),
    deskripsi: formData.get("description") || formData.get("deskripsi"),
    tujuanBelajar: (formData.get("learningObjectives") as string) || (formData.get("tujuanBelajar") as string) || undefined,
    tingkatKesulitan: (formData.get("difficulty") as any) || (formData.get("tingkatKesulitan") as any) || "SEDANG",
    durasiMenit: formData.get("durationMinutes") || formData.get("durasiMenit")
      ? Number(formData.get("durationMinutes") || formData.get("durasiMenit"))
      : undefined,
    maksPercobaan: formData.get("maxAttempts") || formData.get("maksPercobaan")
      ? Number(formData.get("maxAttempts") || formData.get("maksPercobaan"))
      : 3,
  });

  if (!validated.success) {
    return;
  }

  const {
    idMapelKelas,
    idBab,
    judul,
    deskripsi,
    tujuanBelajar,
    tingkatKesulitan,
    durasiMenit,
    maksPercobaan,
  } = validated.data;

  // Generate slug unik
  const baseSlug = judul
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
  const slug = `${baseSlug}-${Date.now().toString().slice(-6)}`;

  const newMission = await prisma.misi.create({
    data: {
      idMapelKelas,
      idBab,
      idPembuat: user.userId,
      judul,
      slug,
      deskripsi,
      tujuanBelajar,
      tingkatKesulitan,
      durasiMenit,
      maksPercobaan,
      status: StatusMisi.DRAF,
    },
  });

  revalidatePath("/guru/misi");
  redirect(`/guru/misi/${newMission.id}/builder`);
}

// -----------------------------------------------------------------------------
// 2. KELOLA STATUS MISSION (Publish / Unpublish / Archive)
// -----------------------------------------------------------------------------
export async function updateMissionStatusAction(
  missionId: string,
  status: StatusMisi
): Promise<void> {
  await requireTeacherOrAdmin();

  await prisma.misi.update({
    where: { id: missionId },
    data: {
      status,
      diterbitkanPada: status === StatusMisi.DITERBITKAN ? new Date() : undefined,
    },
  });

  revalidatePath("/guru/misi");
  revalidatePath(`/guru/misi/${missionId}/preview`);
  revalidatePath("/siswa");
}

// -----------------------------------------------------------------------------
// 3. TAMBAH / HAPUS KONTEN MATERI (LearningContent)
// -----------------------------------------------------------------------------
const addContentSchema = z.object({
  idMisi: z.string().min(1),
  judul: z.string().min(3, "Judul materi minimal 3 karakter"),
  tipeKonten: z.nativeEnum(TipeKonten).default(TipeKonten.TEKS),
  isi: z.string().optional(),
  urlMedia: z.string().optional(),
  durasiDetik: z.coerce.number().optional(),
  nomorUrut: z.coerce.number().default(1),
});

export async function addLearningContentAction(formData: FormData): Promise<void> {
  await requireTeacherOrAdmin();

  const validated = addContentSchema.safeParse({
    idMisi: formData.get("missionId") || formData.get("idMisi"),
    judul: formData.get("title") || formData.get("judul"),
    tipeKonten: (formData.get("contentType") as any) || (formData.get("tipeKonten") as any) || TipeKonten.TEKS,
    isi: (formData.get("body") as string) || (formData.get("isi") as string) || undefined,
    urlMedia: (formData.get("mediaUrl") as string) || (formData.get("urlMedia") as string) || undefined,
    durasiDetik: formData.get("durationSec") || formData.get("durasiDetik")
      ? Number(formData.get("durationSec") || formData.get("durasiDetik"))
      : undefined,
    nomorUrut: Number(formData.get("orderIndex") || formData.get("nomorUrut") || 1),
  });

  if (!validated.success) {
    return;
  }

  const { idMisi, judul, tipeKonten, isi, urlMedia, durasiDetik, nomorUrut } = validated.data;

  await prisma.kontenBelajar.create({
    data: {
      idMisi,
      judul,
      tipeKonten,
      isi,
      urlMedia,
      durasiDetik,
      nomorUrut,
    },
  });

  revalidatePath(`/guru/misi/${idMisi}/builder`);
}

export async function deleteLearningContentAction(
  contentId: string,
  idMisi: string
): Promise<void> {
  await requireTeacherOrAdmin();
  await prisma.kontenBelajar.delete({ where: { id: contentId } });
  revalidatePath(`/guru/misi/${idMisi}/builder`);
}

// -----------------------------------------------------------------------------
// 4. HAPUS MISSION BESERTA SELURUH DATA TERKAIT
// -----------------------------------------------------------------------------
export async function deleteMissionAction(idMisi: string): Promise<void> {
  await requireTeacherOrAdmin();
  await prisma.misi.delete({ where: { id: idMisi } });
  revalidatePath("/guru/misi");
  revalidatePath("/siswa");
}
