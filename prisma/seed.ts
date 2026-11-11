import { PrismaClient, Role, UserStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Memulai seeding data awal FLAG HUNTER...");

  const defaultPasswordHash = await bcrypt.hash("password123", 10);

  // 1. Bersihkan data demo sebelumnya
  await prisma.auditLog.deleteMany();
  await prisma.userBadge.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.xpTransaction.deleteMany();
  await prisma.missionResult.deleteMany();
  await prisma.clueUsage.deleteMany();
  await prisma.flagSubmission.deleteMany();
  await prisma.missionAttempt.deleteMany();
  await prisma.clue.deleteMany();
  await prisma.flagAnswer.deleteMany();
  await prisma.challengeOption.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.learningContent.deleteMany();
  await prisma.mission.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.classSubject.deleteMany();
  await prisma.classMember.deleteMany();
  await prisma.schoolClass.deleteMany();
  await prisma.academicYear.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.user.deleteMany();

  // 2. Buat Pengguna (1 Admin, 2 Guru, 3 Siswa)
  await prisma.user.create({
    data: {
      name: "Administrator Utama",
      email: "admin@flaghunter.local",
      passwordHash: defaultPasswordHash,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  const guru1 = await prisma.user.create({
    data: {
      name: "Budi Santoso, S.Kom (Guru TIK)",
      email: "guru1@flaghunter.local",
      passwordHash: defaultPasswordHash,
      role: Role.TEACHER,
      status: UserStatus.ACTIVE,
    },
  });

  await prisma.user.create({
    data: {
      name: "Siti Rahmawati, M.Pd (Guru IPA)",
      email: "guru2@flaghunter.local",
      passwordHash: defaultPasswordHash,
      role: Role.TEACHER,
      status: UserStatus.ACTIVE,
    },
  });

  const siswa1 = await prisma.user.create({
    data: {
      name: "Ahmad Fadillah",
      email: "siswa1@flaghunter.local",
      passwordHash: defaultPasswordHash,
      role: Role.STUDENT,
      status: UserStatus.ACTIVE,
    },
  });

  const siswa2 = await prisma.user.create({
    data: {
      name: "Dewi Lestari",
      email: "siswa2@flaghunter.local",
      passwordHash: defaultPasswordHash,
      role: Role.STUDENT,
      status: UserStatus.ACTIVE,
    },
  });

  const siswa3 = await prisma.user.create({
    data: {
      name: "Rizky Pratama",
      email: "siswa3@flaghunter.local",
      passwordHash: defaultPasswordHash,
      role: Role.STUDENT,
      status: UserStatus.ACTIVE,
    },
  });

  console.log("✅ Berhasil membuat 6 user demonstrasi (Admin, 2 Guru, 3 Siswa).");

  // 3. Tahun Ajaran & Kelas
  const academicYear = await prisma.academicYear.create({
    data: {
      name: "2025/2026 Ganjil",
      startDate: new Date("2025-07-15"),
      endDate: new Date("2025-12-20"),
      isActive: true,
    },
  });

  const kelasRPL = await prisma.schoolClass.create({
    data: {
      name: "X RPL 1",
      gradeLevel: 10,
      major: "Rekayasa Perangkat Lunak",
      academicYearId: academicYear.id,
    },
  });

  // Assign siswa ke kelas
  await prisma.classMember.createMany({
    data: [
      { classId: kelasRPL.id, userId: siswa1.id, role: Role.STUDENT },
      { classId: kelasRPL.id, userId: siswa2.id, role: Role.STUDENT },
      { classId: kelasRPL.id, userId: siswa3.id, role: Role.STUDENT },
    ],
  });

  // 4. Mata Pelajaran & Chapter
  const mapelTIK = await prisma.subject.create({
    data: {
      code: "INF-X",
      name: "Informatika & Jaringan Dasar",
      description: "Dasar protokol komunikasi jaringan komputer dan keamanan informasi.",
    },
  });

  await prisma.classSubject.create({
    data: {
      classId: kelasRPL.id,
      subjectId: mapelTIK.id,
      teacherId: guru1.id,
    },
  });

  await prisma.chapter.create({
    data: {
      subjectId: mapelTIK.id,
      title: "Protokol Pengalamatan IP & Subnetting",
      orderIndex: 1,
      description: "Memahami struktur IP versi 4 dan routing sederhana.",
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
