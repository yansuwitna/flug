"use server";

import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/security/hash";
import { setSessionCookie, clearSessionCookie, PeranPengguna } from "@/lib/auth/session";
import { redirect } from "next/navigation";

const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export type LoginActionState = {
  error?: string;
};

export async function loginAction(
  prevState: LoginActionState | null,
  formData: FormData
): Promise<LoginActionState> {
  const rawEmail = formData.get("email");
  const rawPassword = formData.get("password");

  const validated = loginSchema.safeParse({
    email: rawEmail,
    password: rawPassword,
  });

  if (!validated.success) {
    return { error: validated.error.issues[0]?.message || "Input tidak valid" };
  }

  const { email, password } = validated.data;
  const normalizedEmail = email.toLowerCase();

  // Cari di tabel Admin, Guru, atau Siswa
  let foundUser: {
    id: string;
    nama: string;
    email: string;
    kataSandi: string;
    status: string;
    role: PeranPengguna;
  } | null = null;

  const admin = await prisma.admin.findUnique({ where: { email: normalizedEmail } });
  if (admin) {
    foundUser = {
      id: admin.id,
      nama: admin.nama,
      email: admin.email,
      kataSandi: admin.kataSandi,
      status: admin.status,
      role: "ADMIN",
    };
  } else {
    const guru = await prisma.guru.findUnique({ where: { email: normalizedEmail } });
    if (guru) {
      foundUser = {
        id: guru.id,
        nama: guru.nama,
        email: guru.email,
        kataSandi: guru.kataSandi,
        status: guru.status,
        role: "GURU",
      };
    } else {
      const siswa = await prisma.siswa.findUnique({ where: { email: normalizedEmail } });
      if (siswa) {
        foundUser = {
          id: siswa.id,
          nama: siswa.nama,
          email: siswa.email,
          kataSandi: siswa.kataSandi,
          status: siswa.status,
          role: "SISWA",
        };
      }
    }
  }

  if (!foundUser || foundUser.status !== "AKTIF") {
    return { error: "Email atau password salah atau akun dinonaktifkan." };
  }

  const isPasswordValid = await verifyPassword(password, foundUser.kataSandi);
  if (!isPasswordValid) {
    return { error: "Email atau password salah." };
  }

  await setSessionCookie({
    userId: foundUser.id,
    name: foundUser.nama,
    email: foundUser.email,
    role: foundUser.role,
  });

  // Arahkan ke dashboard sesuai role baru dalam bahasa indonesia
  if (foundUser.role === "ADMIN") {
    redirect("/admin");
  } else if (foundUser.role === "GURU") {
    redirect("/guru");
  } else {
    redirect("/siswa");
  }
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}
