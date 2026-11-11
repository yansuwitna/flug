"use server";

import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { hashPassword } from "@/lib/security/hash";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    throw new Error("Unauthorized: Akses khusus Administrator");
  }
  return user;
}

// -----------------------------------------------------------------------------
// 1. MANAJEMEN GURU
// -----------------------------------------------------------------------------
const guruSchema = z.object({
  nama: z.string().min(2, "Nama guru minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  kataSandi: z.string().min(6, "Kata sandi minimal 6 karakter"),
  nip: z.string().optional(),
});

export async function tambahGuruAction(formData: FormData): Promise<{ sukses: boolean; pesan: string }> {
  await requireAdmin();

  const validated = guruSchema.safeParse({
    nama: formData.get("nama"),
    email: (formData.get("email") as string)?.toLowerCase().trim(),
    kataSandi: formData.get("kataSandi") || "guru123",
    nip: (formData.get("nip") as string)?.trim() || undefined,
  });

  if (!validated.success) {
    return { sukses: false, pesan: validated.error.issues[0]?.message || "Input tidak valid" };
  }

  const { nama, email, kataSandi, nip } = validated.data;

  // Cek duplikasi email
  const existingTeacher = await prisma.guru.findUnique({ where: { email } });
  const existingStudent = await prisma.siswa.findUnique({ where: { email } });
  const existingAdmin = await prisma.admin.findUnique({ where: { email } });

  if (existingTeacher || existingStudent || existingAdmin) {
    return { sukses: false, pesan: `Email '${email}' sudah digunakan di sistem.` };
  }

  if (nip) {
    const existingNip = await prisma.guru.findUnique({ where: { nip } });
    if (existingNip) {
      return { sukses: false, pesan: `NIP '${nip}' sudah terdaftar.` };
    }
  }

  const passwordHash = await hashPassword(kataSandi);

  await prisma.guru.create({
    data: {
      nama,
      email,
      kataSandi: passwordHash,
      nip,
      status: "AKTIF",
    },
  });

  revalidatePath("/admin/guru");
  revalidatePath("/admin");

  return { sukses: true, pesan: `Berhasil menambahkan guru: ${nama}` };
}

export async function hapusGuruAction(idGuru: string): Promise<void> {
  await requireAdmin();
  await prisma.guru.delete({ where: { id: idGuru } });
  revalidatePath("/admin/guru");
  revalidatePath("/admin");
}

// -----------------------------------------------------------------------------
// 2. MANAJEMEN SISWA
// -----------------------------------------------------------------------------
const siswaSchema = z.object({
  nama: z.string().min(2, "Nama siswa minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  kataSandi: z.string().min(6, "Kata sandi minimal 6 karakter"),
  nisn: z.string().optional(),
  idKelas: z.string().optional(),
});

export async function tambahSiswaAction(formData: FormData): Promise<{ sukses: boolean; pesan: string }> {
  await requireAdmin();

  const validated = siswaSchema.safeParse({
    nama: formData.get("nama"),
    email: (formData.get("email") as string)?.toLowerCase().trim(),
    kataSandi: formData.get("kataSandi") || "siswa123",
    nisn: (formData.get("nisn") as string)?.trim() || undefined,
    idKelas: (formData.get("idKelas") as string) || undefined,
  });

  if (!validated.success) {
    return { sukses: false, pesan: validated.error.issues[0]?.message || "Input tidak valid" };
  }

  const { nama, email, kataSandi, nisn, idKelas } = validated.data;

  // Cek duplikasi email
  const existingStudent = await prisma.siswa.findUnique({ where: { email } });
  const existingTeacher = await prisma.guru.findUnique({ where: { email } });
  const existingAdmin = await prisma.admin.findUnique({ where: { email } });

  if (existingStudent || existingTeacher || existingAdmin) {
    return { sukses: false, pesan: `Email '${email}' sudah digunakan di sistem.` };
  }

  if (nisn) {
    const existingNisn = await prisma.siswa.findUnique({ where: { nisn } });
    if (existingNisn) {
      return { sukses: false, pesan: `NISN '${nisn}' sudah terdaftar.` };
    }
  }

  const passwordHash = await hashPassword(kataSandi);

  const newStudent = await prisma.siswa.create({
    data: {
      nama,
      email,
      kataSandi: passwordHash,
      nisn,
      status: "AKTIF",
    },
  });

  // Jika langsung memilih kelas, masukkan ke anggota_kelas
  if (idKelas) {
    await prisma.anggotaKelas.create({
      data: {
        idKelas,
        idSiswa: newStudent.id,
      },
    });
  }

  revalidatePath("/admin/siswa");
  revalidatePath("/admin");

  return { sukses: true, pesan: `Berhasil menambahkan siswa: ${nama}` };
}

export async function hapusSiswaAction(idSiswa: string): Promise<void> {
  await requireAdmin();
  await prisma.siswa.delete({ where: { id: idSiswa } });
  revalidatePath("/admin/siswa");
  revalidatePath("/admin");
}
