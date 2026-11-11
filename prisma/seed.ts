import { PrismaClient, StatusPengguna } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Memulai seeding data awal FLAG HUNTER (Skema Bahasa Indonesia)...");

  const defaultPasswordHash = await bcrypt.hash("password123", 10);

  // 1. Bersihkan data demo
  await prisma.logAudit.deleteMany();
  await prisma.lencanaSiswa.deleteMany();
  await prisma.lencana.deleteMany();
  await prisma.transaksiXp.deleteMany();
  await prisma.hasilMisi.deleteMany();
  await prisma.penggunaanPetunjuk.deleteMany();
  await prisma.kirimanJawaban.deleteMany();
  await prisma.percobaanMisi.deleteMany();
  await prisma.petunjuk.deleteMany();
  await prisma.kunciJawaban.deleteMany();
  await prisma.opsiTantangan.deleteMany();
  await prisma.tantangan.deleteMany();
  await prisma.kontenBelajar.deleteMany();
  await prisma.misi.deleteMany();
  await prisma.bab.deleteMany();
  await prisma.mapelKelas.deleteMany();
  await prisma.anggotaKelas.deleteMany();
  await prisma.kelas.deleteMany();
  await prisma.tahunAjaran.deleteMany();
  await prisma.mataPelajaran.deleteMany();
  await prisma.siswa.deleteMany();
  await prisma.guru.deleteMany();
  await prisma.admin.deleteMany();

  // 2. Buat Pengguna (1 Admin, 2 Guru, 3 Siswa)
  await prisma.admin.create({
    data: {
      nama: "Administrator Utama",
      email: "admin@flaghunter.local",
      kataSandi: defaultPasswordHash,
      status: StatusPengguna.AKTIF,
    },
  });

  const guru1 = await prisma.guru.create({
    data: {
      nip: "198501012010011001",
      nama: "Budi Santoso, S.Kom (Guru TIK)",
      email: "guru1@flaghunter.local",
      kataSandi: defaultPasswordHash,
      status: StatusPengguna.AKTIF,
    },
  });

  await prisma.guru.create({
    data: {
      nip: "198802022012012002",
      nama: "Siti Rahmawati, M.Pd (Guru IPA)",
      email: "guru2@flaghunter.local",
      kataSandi: defaultPasswordHash,
      status: StatusPengguna.AKTIF,
    },
  });

  const siswa1 = await prisma.siswa.create({
    data: {
      nisn: "0051234561",
      nama: "Ahmad Fadillah",
      email: "siswa1@flaghunter.local",
      kataSandi: defaultPasswordHash,
      status: StatusPengguna.AKTIF,
    },
  });

  const siswa2 = await prisma.siswa.create({
    data: {
      nisn: "0051234562",
      nama: "Dewi Lestari",
      email: "siswa2@flaghunter.local",
      kataSandi: defaultPasswordHash,
      status: StatusPengguna.AKTIF,
    },
  });

  const siswa3 = await prisma.siswa.create({
    data: {
      nisn: "0051234563",
      nama: "Rizky Pratama",
      email: "siswa3@flaghunter.local",
      kataSandi: defaultPasswordHash,
      status: StatusPengguna.AKTIF,
    },
  });

  console.log("✅ Berhasil membuat akun (1 Admin, 2 Guru, 3 Siswa).");

  // 3. Tahun Ajaran & Kelas
  const tahunAjaran = await prisma.tahunAjaran.create({
    data: {
      nama: "2025/2026 Ganjil",
      tanggalMulai: new Date("2025-07-15"),
      tanggalSelesai: new Date("2025-12-20"),
      aktif: true,
    },
  });

  const kelasRPL = await prisma.kelas.create({
    data: {
      nama: "X RPL 1",
      tingkat: 10,
      jurusan: "Rekayasa Perangkat Lunak",
      idTahunAjaran: tahunAjaran.id,
    },
  });

  // Assign siswa ke kelas
  await prisma.anggotaKelas.createMany({
    data: [
      { idKelas: kelasRPL.id, idSiswa: siswa1.id },
      { idKelas: kelasRPL.id, idSiswa: siswa2.id },
      { idKelas: kelasRPL.id, idSiswa: siswa3.id },
    ],
  });

  // 4. Mata Pelajaran & Bab
  const mapelTIK = await prisma.mataPelajaran.create({
    data: {
      kode: "INF-X",
      nama: "Informatika & Jaringan Dasar",
      deskripsi: "Dasar protokol komunikasi jaringan komputer dan keamanan informasi.",
    },
  });

  await prisma.mapelKelas.create({
    data: {
      idKelas: kelasRPL.id,
      idMataPelajaran: mapelTIK.id,
      idGuru: guru1.id,
    },
  });

  await prisma.bab.create({
    data: {
      idMataPelajaran: mapelTIK.id,
      judul: "Protokol Pengalamatan IP & Subnetting",
      nomorUrut: 1,
      deskripsi: "Memahami struktur IP versi 4 dan routing sederhana.",
    },
  });

  console.log("✅ Berhasil membuat Tahun Ajaran, Kelas, Siswa, dan Mata Pelajaran.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("🎉 Seeding selesai dengan sukses!");
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
