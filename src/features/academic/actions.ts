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
// 1. TAHUN AJARAN (Academic Year)
// -----------------------------------------------------------------------------
const academicYearSchema = z.object({
  name: z.string().min(3, "Nama tahun ajaran minimal 3 karakter"),
  startDate: z.string().min(1, "Tanggal mulai wajib diisi"),
  endDate: z.string().min(1, "Tanggal selesai wajib diisi"),
  isActive: z.boolean().default(false),
});

export async function createAcademicYearAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const validated = academicYearSchema.safeParse({
    name: formData.get("name"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    isActive: formData.get("isActive") === "on",
  });

  if (!validated.success) {
    return;
  }

  const { name, startDate, endDate, isActive } = validated.data;

  // Jika diaktifkan, nonaktifkan tahun ajaran lainnya
  if (isActive) {
    await prisma.academicYear.updateMany({
      data: { isActive: false },
    });
  }

  await prisma.academicYear.create({
    data: {
      name,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isActive,
    },
  });

  revalidatePath("/admin/academic-years");
  revalidatePath("/admin/classes");
}

export async function toggleAcademicYearActiveAction(id: string): Promise<void> {
  await requireAdmin();

  const target = await prisma.academicYear.findUnique({ where: { id } });
  if (!target) return;

  if (!target.isActive) {
    await prisma.academicYear.updateMany({ data: { isActive: false } });
    await prisma.academicYear.update({ where: { id }, data: { isActive: true } });
  } else {
    await prisma.academicYear.update({ where: { id }, data: { isActive: false } });
  }

  revalidatePath("/admin/academic-years");
  revalidatePath("/admin/classes");
}

export async function deleteAcademicYearAction(id: string): Promise<void> {
  await requireAdmin();
  await prisma.academicYear.delete({ where: { id } });
  revalidatePath("/admin/academic-years");
}

// -----------------------------------------------------------------------------
// 2. KELAS (School Class)
// -----------------------------------------------------------------------------
const schoolClassSchema = z.object({
  name: z.string().min(2, "Nama kelas minimal 2 karakter"),
  gradeLevel: z.coerce.number().min(1, "Tingkat kelas minimal 1"),
  major: z.string().optional(),
  academicYearId: z.string().min(1, "Tahun ajaran wajib dipilih"),
});

export async function createClassAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const validated = schoolClassSchema.safeParse({
    name: formData.get("name"),
    gradeLevel: formData.get("gradeLevel"),
    major: formData.get("major") || undefined,
    academicYearId: formData.get("academicYearId"),
  });

  if (!validated.success) {
    return;
  }

  const { name, gradeLevel, major, academicYearId } = validated.data;

  // Cek duplikasi
  const existing = await prisma.schoolClass.findUnique({
    where: {
      name_academicYearId: {
        name,
        academicYearId,
      },
    },
  });

  if (existing) {
    return;
  }

  await prisma.schoolClass.create({
    data: {
      name,
      gradeLevel,
      major,
      academicYearId,
    },
  });

  revalidatePath("/admin/classes");
}

export async function deleteClassAction(id: string): Promise<void> {
  await requireAdmin();
  await prisma.schoolClass.delete({ where: { id } });
  revalidatePath("/admin/classes");
}

// -----------------------------------------------------------------------------
// 3. MATA PELAJARAN (Subject) & CHAPTER (Bab)
// -----------------------------------------------------------------------------
const subjectSchema = z.object({
  code: z.string().min(2, "Kode mata pelajaran minimal 2 karakter"),
  name: z.string().min(3, "Nama mata pelajaran minimal 3 karakter"),
  description: z.string().optional(),
});

export async function createSubjectAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const validated = subjectSchema.safeParse({
    code: formData.get("code")?.toString().trim().toUpperCase(),
    name: formData.get("name"),
    description: formData.get("description") || undefined,
  });

  if (!validated.success) {
    return;
  }

  const { code, name, description } = validated.data;

  const existing = await prisma.subject.findUnique({ where: { code } });
  if (existing) {
    return;
  }

  await prisma.subject.create({
    data: { code, name, description },
  });

  revalidatePath("/admin/subjects");
}

export async function deleteSubjectAction(id: string): Promise<void> {
  await requireAdmin();
  await prisma.subject.delete({ where: { id } });
  revalidatePath("/admin/subjects");
}

export async function createChapterAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "TEACHER")) {
    return;
  }

  const subjectId = formData.get("subjectId") as string;
  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || undefined;
  const orderIndex = Number(formData.get("orderIndex") || 1);

  if (!subjectId || !title) {
    return;
  }

  await prisma.chapter.create({
    data: {
      subjectId,
      title,
      description,
      orderIndex,
    },
  });

  revalidatePath(`/admin/subjects/${subjectId}`);
  revalidatePath("/admin/subjects");
  revalidatePath("/teacher/dashboard");
}

// -----------------------------------------------------------------------------
// 4. PENUGASAN GURU KE KELAS (ClassSubject) & SISWA (ClassMember)
// -----------------------------------------------------------------------------
export async function assignTeacherToClassAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const classId = formData.get("classId") as string;
  const subjectId = formData.get("subjectId") as string;
  const teacherId = formData.get("teacherId") as string;

  if (!classId || !subjectId || !teacherId) {
    return;
  }

  const existing = await prisma.classSubject.findUnique({
    where: {
      classId_subjectId_teacherId: {
        classId,
        subjectId,
        teacherId,
      },
    },
  });

  if (existing) {
    return;
  }

  await prisma.classSubject.create({
    data: { classId, subjectId, teacherId },
  });

  revalidatePath(`/admin/classes/${classId}`);
  revalidatePath("/admin/classes");
}

export async function addStudentToClassAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const classId = formData.get("classId") as string;
  const userId = formData.get("userId") as string;

  if (!classId || !userId) {
    return;
  }

  const existing = await prisma.classMember.findUnique({
    where: {
      classId_userId: { classId, userId },
    },
  });

  if (existing) {
    return;
  }

  await prisma.classMember.create({
    data: { classId, userId, role: "STUDENT" },
  });

  revalidatePath(`/admin/classes/${classId}`);
}

export async function removeClassMemberAction(memberId: string, classId: string): Promise<void> {
  await requireAdmin();
  await prisma.classMember.delete({ where: { id: memberId } });
  revalidatePath(`/admin/classes/${classId}`);
}
