"use server";

import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

// Helper check admin
async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    throw new Error("Unauthorized: Hanya Administrator yang berwenang");
  }
  return user;
}

// -----------------------------------------------------------------------------
// 1. TAHUN AJARAN (TahunAjaran)
// -----------------------------------------------------------------------------
const tahunAjaranSchema = z.object({
  nama: z.string().min(3, "Nama tahun ajaran minimal 3 karakter"),
  tanggalMulai: z.string().min(1, "Tanggal mulai wajib diisi"),
  tanggalSelesai: z.string().min(1, "Tanggal selesai wajib diisi"),
  aktif: z.boolean().default(false),
});

export async function createAcademicYearAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const validated = tahunAjaranSchema.safeParse({
    nama: formData.get("name") || formData.get("nama"),
    tanggalMulai: formData.get("startDate") || formData.get("tanggalMulai"),
    tanggalSelesai: formData.get("endDate") || formData.get("tanggalSelesai"),
    aktif: formData.get("isActive") === "on" || formData.get("aktif") === "on",
  });

  if (!validated.success) {
    return;
  }

  const { nama, tanggalMulai, tanggalSelesai, aktif } = validated.data;

  if (aktif) {
    await prisma.tahunAjaran.updateMany({
      data: { aktif: false },
    });
  }

  await prisma.tahunAjaran.create({
    data: {
      nama,
      tanggalMulai: new Date(tanggalMulai),
      tanggalSelesai: new Date(tanggalSelesai),
      aktif,
    },
  });

  revalidatePath("/admin/tahun-ajaran");
  revalidatePath("/admin");
}

export async function toggleAcademicYearStatusAction(id: string): Promise<void> {
  await requireAdmin();

  const target = await prisma.tahunAjaran.findUnique({ where: { id } });
  if (!target) return;

  if (!target.aktif) {
    await prisma.tahunAjaran.updateMany({ data: { aktif: false } });
    await prisma.tahunAjaran.update({ where: { id }, data: { aktif: true } });
  } else {
    await prisma.tahunAjaran.update({ where: { id }, data: { aktif: false } });
  }

  revalidatePath("/admin/tahun-ajaran");
  revalidatePath("/admin");
}

export async function deleteAcademicYearAction(id: string): Promise<void> {
  await requireAdmin();
  await prisma.tahunAjaran.delete({ where: { id } });
  revalidatePath("/admin/tahun-ajaran");
  revalidatePath("/admin");
}

// -----------------------------------------------------------------------------
// 2. KELAS (Kelas)
// -----------------------------------------------------------------------------
const kelasSchema = z.object({
  nama: z.string().min(2, "Nama kelas minimal 2 karakter"),
  tingkat: z.coerce.number().min(1, "Tingkat kelas harus berupa angka valid"),
  jurusan: z.string().optional(),
  idTahunAjaran: z.string().min(1, "Tahun ajaran wajib dipilih"),
});

export async function createClassAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const validated = kelasSchema.safeParse({
    nama: formData.get("name") || formData.get("nama"),
    tingkat: formData.get("gradeLevel") || formData.get("tingkat"),
    jurusan: (formData.get("major") as string) || (formData.get("jurusan") as string) || undefined,
    idTahunAjaran: (formData.get("academicYearId") as string) || (formData.get("idTahunAjaran") as string),
  });

  if (!validated.success) {
    return;
  }

  const { nama, tingkat, jurusan, idTahunAjaran } = validated.data;

  const existing = await prisma.kelas.findUnique({
    where: {
      nama_idTahunAjaran: {
        nama,
        idTahunAjaran,
      },
    },
  });

  if (existing) {
    return;
  }

  await prisma.kelas.create({
    data: {
      nama,
      tingkat,
      jurusan,
      idTahunAjaran,
    },
  });

  revalidatePath("/admin/kelas");
  revalidatePath("/admin");
}

export async function deleteClassAction(id: string): Promise<void> {
  await requireAdmin();
  await prisma.kelas.delete({ where: { id } });
  revalidatePath("/admin/kelas");
  revalidatePath("/admin");
}

// -----------------------------------------------------------------------------
// 3. MATA PELAJARAN (MataPelajaran) & BAB
// -----------------------------------------------------------------------------
const mataPelajaranSchema = z.object({
  kode: z.string().min(2, "Kode mata pelajaran minimal 2 karakter"),
  nama: z.string().min(3, "Nama mata pelajaran minimal 3 karakter"),
  deskripsi: z.string().optional(),
});

export async function createSubjectAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const validated = mataPelajaranSchema.safeParse({
    kode: formData.get("code") || formData.get("kode"),
    nama: formData.get("name") || formData.get("nama"),
    deskripsi: (formData.get("description") as string) || (formData.get("deskripsi") as string) || undefined,
  });

  if (!validated.success) {
    return;
  }

  const { kode, nama, deskripsi } = validated.data;

  const existing = await prisma.mataPelajaran.findUnique({ where: { kode } });
  if (existing) {
    return;
  }

  await prisma.mataPelajaran.create({
    data: {
      kode,
      nama,
      deskripsi,
    },
  });

  revalidatePath("/admin/mata-pelajaran");
  revalidatePath("/admin");
}

export async function deleteSubjectAction(id: string): Promise<void> {
  await requireAdmin();
  await prisma.mataPelajaran.delete({ where: { id } });
  revalidatePath("/admin/mata-pelajaran");
  revalidatePath("/admin");
}

export async function createChapterAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "GURU")) {
    return;
  }

  const idMataPelajaran = (formData.get("subjectId") || formData.get("idMataPelajaran")) as string;
  const judul = (formData.get("title") || formData.get("judul")) as string;
  const deskripsi = (formData.get("description") || formData.get("deskripsi")) as string;
  const nomorUrut = Number(formData.get("orderIndex") || formData.get("nomorUrut") || 1);

  if (!idMataPelajaran || !judul) {
    return;
  }

  await prisma.bab.create({
    data: {
      idMataPelajaran,
      judul,
      deskripsi: deskripsi || undefined,
      nomorUrut,
    },
  });

  revalidatePath(`/admin/mata-pelajaran/${idMataPelajaran}`);
  revalidatePath("/admin/mata-pelajaran");
  revalidatePath("/guru");
}

// -----------------------------------------------------------------------------
// 4. PENUGASAN GURU KE KELAS (MapelKelas) & SISWA (AnggotaKelas)
// -----------------------------------------------------------------------------
export async function assignTeacherToClassAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const idKelas = (formData.get("classId") || formData.get("idKelas")) as string;
  const idMataPelajaran = (formData.get("subjectId") || formData.get("idMataPelajaran")) as string;
  const idGuru = (formData.get("teacherId") || formData.get("idGuru")) as string;

  if (!idKelas || !idMataPelajaran || !idGuru) {
    return;
  }

  const existing = await prisma.mapelKelas.findUnique({
    where: {
      idKelas_idMataPelajaran_idGuru: {
        idKelas,
        idMataPelajaran,
        idGuru,
      },
    },
  });

  if (existing) {
    return;
  }

  await prisma.mapelKelas.create({
    data: { idKelas, idMataPelajaran, idGuru },
  });

  revalidatePath(`/admin/kelas/${idKelas}`);
  revalidatePath("/admin/kelas");
}

export async function addStudentToClassAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const idKelas = (formData.get("classId") || formData.get("idKelas")) as string;
  const idSiswa = (formData.get("studentId") || formData.get("userId") || formData.get("idSiswa")) as string;

  if (!idKelas || !idSiswa) {
    return;
  }

  const existing = await prisma.anggotaKelas.findUnique({
    where: {
      idKelas_idSiswa: { idKelas, idSiswa },
    },
  });

  if (existing) {
    return;
  }

  await prisma.anggotaKelas.create({
    data: { idKelas, idSiswa },
  });

  revalidatePath(`/admin/kelas/${idKelas}`);
}

export async function removeClassMemberAction(memberId: string, idKelas: string): Promise<void> {
  await requireAdmin();
  await prisma.anggotaKelas.delete({ where: { id: memberId } });
  revalidatePath(`/admin/kelas/${idKelas}`);
}
