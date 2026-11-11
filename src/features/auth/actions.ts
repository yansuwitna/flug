"use server";

import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/security/hash";
import { setSessionCookie, clearSessionCookie } from "@/lib/auth/session";
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

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user || user.status !== "ACTIVE") {
    return { error: "Email atau password salah" };
  }

  const isPasswordValid = await verifyPassword(password, user.passwordHash);
  if (!isPasswordValid) {
    return { error: "Email atau password salah" };
  }

  await setSessionCookie({
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });

  // Arahkan ke dashboard sesuai role
  if (user.role === "ADMIN") {
    redirect("/admin/dashboard");
  } else if (user.role === "TEACHER") {
    redirect("/teacher/dashboard");
  } else {
    redirect("/student/dashboard");
  }
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}
