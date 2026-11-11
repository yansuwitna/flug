"use server";

import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { hashPassword } from "@/lib/security/hash";
import { revalidatePath } from "next/cache";

export interface HasilImpor {
  sukses: boolean;
  totalDibaca: number;
  jumlahBerhasil: number;
  jumlahDilewati: number;
  pesanError: string[];
}

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    throw new Error("Unauthorized: Hanya Administrator yang berwenang");
  }
  return user;
}

function parseCSV(text: string): string[][] {
  const lines: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let insideQuotes = false;

  const cleaned = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    const nextChar = cleaned[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentField += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === "," && !insideQuotes) {
      currentRow.push(currentField.trim());
      currentField = "";
    } else if (char === "\n" && !insideQuotes) {
      currentRow.push(currentField.trim());
      if (currentRow.some((field) => field.length > 0)) {
        lines.push(currentRow);
      }
      currentRow = [];
      currentField = "";
    } else {
      currentField += char;
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((field) => field.length > 0)) {
      lines.push(currentRow);
    }
  }

  return lines;
}

/**
 * Import Siswa dari file CSV
 * Header: nama / name, email / surel, katasandi / password, nisn / nis
 */
export async function imporSiswaAction(formData: FormData): Promise<HasilImpor> {
  await requireAdmin();

  const file = formData.get("file") as File;
  if (!file || !(file instanceof File) || file.size === 0) {
    return {
      sukses: false,
      totalDibaca: 0,
      jumlahBerhasil: 0,
      jumlahDilewati: 0,
      pesanError: ["File CSV belum dipilih atau kosong."],
    };
  }

  const rawText = await file.text();
  const rows = parseCSV(rawText);

  if (rows.length < 2) {
    return {
      sukses: false,
      totalDibaca: 0,
      jumlahBerhasil: 0,
      jumlahDilewati: 0,
      pesanError: ["File CSV minimal harus memiliki baris header dan minimal 1 baris data."],
    };
  }

  const header = rows[0].map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ""));
  const nameIdx = header.findIndex((h) => h === "nama" || h === "name");
  const emailIdx = header.findIndex((h) => h === "email" || h === "surel");
  const passIdx = header.findIndex((h) => h === "katasandi" || h === "password");
  const nisnIdx = header.findIndex((h) => h === "nisn" || h === "nis");

  if (nameIdx === -1 || emailIdx === -1) {
    return {
      sukses: false,
      totalDibaca: 0,
      jumlahBerhasil: 0,
      jumlahDilewati: 0,
      pesanError: ["Format header tidak valid. Wajib menyertakan kolom 'nama' dan 'email'."],
    };
  }

  const dataRows = rows.slice(1);
  let jumlahBerhasil = 0;
  let jumlahDilewati = 0;
  const pesanError: string[] = [];

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const rowNum = i + 2;
    const nama = row[nameIdx];
    const email = row[emailIdx]?.toLowerCase();
    const rawPass = passIdx !== -1 && row[passIdx] ? row[passIdx] : "siswa123";
    const nisn = nisnIdx !== -1 && row[nisnIdx] ? row[nisnIdx] : null;

    if (!nama || !email) {
      pesanError.push(`Baris ${rowNum}: Nama dan Email tidak boleh kosong.`);
      jumlahDilewati++;
      continue;
    }

    if (!email.includes("@")) {
      pesanError.push(`Baris ${rowNum}: Format email '${email}' tidak valid.`);
      jumlahDilewati++;
      continue;
    }

    const existingStudent = await prisma.siswa.findUnique({ where: { email } });
    const existingTeacher = await prisma.guru.findUnique({ where: { email } });
    const existingAdmin = await prisma.admin.findUnique({ where: { email } });

    if (existingStudent || existingTeacher || existingAdmin) {
      pesanError.push(`Baris ${rowNum}: Email '${email}' sudah digunakan.`);
      jumlahDilewati++;
      continue;
    }

    if (nisn) {
      const existingNisn = await prisma.siswa.findUnique({ where: { nisn } });
      if (existingNisn) {
        pesanError.push(`Baris ${rowNum}: NISN '${nisn}' sudah terdaftar.`);
        jumlahDilewati++;
        continue;
      }
    }

    try {
      const kataSandi = await hashPassword(rawPass);
      await prisma.siswa.create({
        data: {
          nama,
          email,
          kataSandi,
          nisn,
          status: "AKTIF",
        },
      });
      jumlahBerhasil++;
    } catch (err: any) {
      pesanError.push(`Baris ${rowNum}: Gagal menyimpan (${err?.message || "Error DB"}).`);
      jumlahDilewati++;
    }
  }

  revalidatePath("/admin/pengguna");
  revalidatePath("/admin");

  return {
    sukses: jumlahBerhasil > 0,
    totalDibaca: dataRows.length,
    jumlahBerhasil,
    jumlahDilewati,
    pesanError,
  };
}

/**
 * Import Guru dari file CSV
 * Header: nama / name, email / surel, katasandi / password, nip
 */
export async function imporGuruAction(formData: FormData): Promise<HasilImpor> {
  await requireAdmin();

  const file = formData.get("file") as File;
  if (!file || !(file instanceof File) || file.size === 0) {
    return {
      sukses: false,
      totalDibaca: 0,
      jumlahBerhasil: 0,
      jumlahDilewati: 0,
      pesanError: ["File CSV belum dipilih atau kosong."],
    };
  }

  const rawText = await file.text();
  const rows = parseCSV(rawText);

  if (rows.length < 2) {
    return {
      sukses: false,
      totalDibaca: 0,
      jumlahBerhasil: 0,
      jumlahDilewati: 0,
      pesanError: ["File CSV minimal harus memiliki baris header dan minimal 1 baris data."],
    };
  }

  const header = rows[0].map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ""));
  const nameIdx = header.findIndex((h) => h === "nama" || h === "name");
  const emailIdx = header.findIndex((h) => h === "email" || h === "surel");
  const passIdx = header.findIndex((h) => h === "katasandi" || h === "password");
  const nipIdx = header.findIndex((h) => h === "nip");

  if (nameIdx === -1 || emailIdx === -1) {
    return {
      sukses: false,
      totalDibaca: 0,
      jumlahBerhasil: 0,
      jumlahDilewati: 0,
      pesanError: ["Format header tidak valid. Wajib menyertakan kolom 'nama' dan 'email'."],
    };
  }

  const dataRows = rows.slice(1);
  let jumlahBerhasil = 0;
  let jumlahDilewati = 0;
  const pesanError: string[] = [];

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const rowNum = i + 2;
    const nama = row[nameIdx];
    const email = row[emailIdx]?.toLowerCase();
    const rawPass = passIdx !== -1 && row[passIdx] ? row[passIdx] : "guru123";
    const nip = nipIdx !== -1 && row[nipIdx] ? row[nipIdx] : null;

    if (!nama || !email) {
      pesanError.push(`Baris ${rowNum}: Nama dan Email tidak boleh kosong.`);
      jumlahDilewati++;
      continue;
    }

    if (!email.includes("@")) {
      pesanError.push(`Baris ${rowNum}: Format email '${email}' tidak valid.`);
      jumlahDilewati++;
      continue;
    }

    const existingTeacher = await prisma.guru.findUnique({ where: { email } });
    const existingStudent = await prisma.siswa.findUnique({ where: { email } });
    const existingAdmin = await prisma.admin.findUnique({ where: { email } });

    if (existingTeacher || existingStudent || existingAdmin) {
      pesanError.push(`Baris ${rowNum}: Email '${email}' sudah digunakan.`);
      jumlahDilewati++;
      continue;
    }

    if (nip) {
      const existingNip = await prisma.guru.findUnique({ where: { nip } });
      if (existingNip) {
        pesanError.push(`Baris ${rowNum}: NIP '${nip}' sudah terdaftar.`);
        jumlahDilewati++;
        continue;
      }
    }

    try {
      const kataSandi = await hashPassword(rawPass);
      await prisma.guru.create({
        data: {
          nama,
          email,
          kataSandi,
          nip,
          status: "AKTIF",
        },
      });
      jumlahBerhasil++;
    } catch (err: any) {
      pesanError.push(`Baris ${rowNum}: Gagal menyimpan (${err?.message || "Error DB"}).`);
      jumlahDilewati++;
    }
  }

  revalidatePath("/admin/pengguna");
  revalidatePath("/admin");

  return {
    sukses: jumlahBerhasil > 0,
    totalDibaca: dataRows.length,
    jumlahBerhasil,
    jumlahDilewati,
    pesanError,
  };
}
