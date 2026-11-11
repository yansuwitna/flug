"use server";

import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { exec } from "child_process";
import { promisify } from "util";
import { revalidatePath } from "next/cache";

const execAsync = promisify(exec);

async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    throw new Error("Unauthorized: Akses khusus Administrator");
  }
  return user;
}

function getDatabaseConfig() {
  const url = process.env.DATABASE_URL || "mysql://admin:Admin123!%40%23@localhost:3306/flag_hunter";
  const parsed = new URL(url);
  const user = decodeURIComponent(parsed.username || "admin");
  const password = decodeURIComponent(parsed.password || "");
  const host = parsed.hostname || "localhost";
  const port = parsed.port || "3306";
  const database = parsed.pathname.replace(/^\//, "") || "flag_hunter";

  return { user, password, host, port, database };
}

/**
 * 1. BACKUP DATABASE: Menghasilkan string SQL Dump lengkap
 */
export async function buatCadanganDatabaseAction(): Promise<{ sukses: boolean; sql?: string; pesan: string }> {
  await requireAdmin();

  const { user, password, host, port, database } = getDatabaseConfig();

  try {
    const passArg = password ? `-p"${password.replace(/"/g, '\\"')}"` : "";
    const cmd = `mysqldump -h ${host} -P ${port} -u ${user} ${passArg} --single-transaction --routines --triggers ${database}`;

    const { stdout, stderr } = await execAsync(cmd, { maxBuffer: 1024 * 1024 * 50 });

    if (!stdout && stderr) {
      return { sukses: false, pesan: `Gagal membuat cadangan: ${stderr}` };
    }

    return {
      sukses: true,
      sql: stdout,
      pesan: "Cadangan database SQL berhasil dibuat.",
    };
  } catch (err: any) {
    return {
      sukses: false,
      pesan: `Gagal menjalankan mysqldump: ${err?.message || "Unknown error"}`,
    };
  }
}

/**
 * 2. RESTORE DATABASE: Memulihkan database dari file dump SQL
 */
export async function pulihkanDatabaseAction(formData: FormData): Promise<{ sukses: boolean; pesan: string }> {
  await requireAdmin();

  const file = formData.get("file") as File;
  if (!file || !(file instanceof File) || file.size === 0) {
    return { sukses: false, pesan: "File cadangan SQL belum dipilih atau kosong." };
  }

  const sqlContent = await file.text();
  const { user, password, host, port, database } = getDatabaseConfig();

  try {
    const passArg = password ? `-p"${password.replace(/"/g, '\\"')}"` : "";
    const cmd = `mysql -h ${host} -P ${port} -u ${user} ${passArg} ${database}`;

    const child = exec(cmd);

    await new Promise((resolve, reject) => {
      if (!child.stdin) {
        return reject(new Error("Tidak dapat membuka stdin MySQL"));
      }

      child.stdin.write(sqlContent);
      child.stdin.end();

      child.on("close", (code) => {
        if (code === 0) resolve(true);
        else reject(new Error(`MySQL exit dengan kode ${code}`));
      });

      child.on("error", (err) => reject(err));
    });

    revalidatePath("/admin");
    return { sukses: true, pesan: "Database berhasil dipulihkan dari file cadangan!" };
  } catch (err: any) {
    return {
      sukses: false,
      pesan: `Gagal memulihkan database: ${err?.message || "Unknown error"}`,
    };
  }
}

/**
 * 3. RESET DATA: Menghapus seluruh data platform & hanya menyisakan akun Administrator
 */
export async function resetSemuaDataKecualiAdminAction(formData: FormData): Promise<{ sukses: boolean; pesan: string }> {
  const currentAdmin = await requireAdmin();

  // Pastikan akun admin yang login ada di tabel admin
  const adminDb = await prisma.admin.findFirst({
    where: {
      OR: [
        { id: currentAdmin.userId },
        { email: currentAdmin.email },
      ],
    },
  });

  const konfirmasi = formData.get("konfirmasi") as string;
  if (konfirmasi !== "HAPUS_SEMUA_DATA") {
    return {
      sukses: false,
      pesan: "Konfirmasi tidak sesuai. Harap ketik 'HAPUS_SEMUA_DATA' dengan benar.",
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Hapus data operasional dan transaksi
      await tx.logAudit.deleteMany();
      await tx.lencanaSiswa.deleteMany();
      await tx.lencana.deleteMany();
      await tx.transaksiXp.deleteMany();
      await tx.hasilMisi.deleteMany();
      await tx.penggunaanPetunjuk.deleteMany();
      await tx.kirimanJawaban.deleteMany();
      await tx.percobaanMisi.deleteMany();
      await tx.petunjuk.deleteMany();
      await tx.kunciJawaban.deleteMany();
      await tx.opsiTantangan.deleteMany();
      await tx.tantangan.deleteMany();
      await tx.kontenBelajar.deleteMany();
      await tx.misi.deleteMany();
      await tx.bab.deleteMany();
      await tx.mapelKelas.deleteMany();
      await tx.anggotaKelas.deleteMany();
      await tx.kelas.deleteMany();
      await tx.tahunAjaran.deleteMany();
      await tx.mataPelajaran.deleteMany();

      // Hapus seluruh akun Siswa & Guru
      await tx.siswa.deleteMany();
      await tx.guru.deleteMany();

      // Catat log reset oleh admin (hanya jika adminDb valid)
      await tx.logAudit.create({
        data: {
          idAdmin: adminDb ? adminDb.id : null,
          aksi: "RESET_DATABASE",
          target: "SEMUA_DATA",
          metadata: JSON.stringify({ oleh: currentAdmin.email, tanggal: new Date().toISOString() }),
        },
      });
    });

    revalidatePath("/admin");
    return {
      sukses: true,
      pesan: "Semua data berhasil dibersihkan! Hanya akun Administrator yang tersisa.",
    };
  } catch (err: any) {
    return {
      sukses: false,
      pesan: `Gagal mereset data: ${err?.message || "Unknown error"}`,
    };
  }
}
