import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { notFound, redirect } from "next/navigation";
import { MissionWorkspace } from "@/components/mission/MissionWorkspace";

export const dynamic = "force-dynamic";

export default async function SiswaMisiKerjakanPage({
  params,
}: {
  params: Promise<{ missionId: string }>;
}) {
  const { missionId } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // 1. Ambil mission beserta konten belajar dan tantangan
  const misi = await prisma.misi.findUnique({
    where: { id: missionId },
    include: {
      mapelKelas: {
        include: {
          kelas: true,
          mataPelajaran: true,
        },
      },
      bab: true,
      kontenBelajar: {
        orderBy: { nomorUrut: "asc" },
      },
      tantangan: {
        orderBy: { nomorUrut: "asc" },
        include: {
          petunjuk: { orderBy: { nomorUrut: "asc" } },
          opsi: { orderBy: { nomorUrut: "asc" } },
        },
      },
    },
  });

  if (!misi) {
    notFound();
  }

  // 2. Cari active attempt siswa untuk mission ini
  let attempt = await prisma.percobaanMisi.findFirst({
    where: {
      idSiswa: user.userId,
      idMisi: missionId,
      status: "SEDANG_BERJALAN",
    },
    include: {
      kirimanJawaban: {
        where: { benar: true },
      },
      penggunaanPetunjuk: true,
    },
  });

  // Jika belum ada attempt aktif, buat attempt pertama secara otomatis
  if (!attempt) {
    const previousAttemptsCount = await prisma.percobaanMisi.count({
      where: { idSiswa: user.userId, idMisi: missionId },
    });

    attempt = await prisma.percobaanMisi.create({
      data: {
        idSiswa: user.userId,
        idMisi: missionId,
        nomorPercobaan: previousAttemptsCount + 1,
        status: "SEDANG_BERJALAN",
      },
      include: {
        kirimanJawaban: {
          where: { benar: true },
        },
        penggunaanPetunjuk: true,
      },
    });
  }

  const solvedChallengeIds = attempt.kirimanJawaban.map((s) => s.idTantangan);
  const unlockedClueIds = attempt.penggunaanPetunjuk.map((c) => c.idPetunjuk);

  return (
    <MissionWorkspace
      attemptId={attempt.id}
      missionId={misi.id}
      missionTitle={misi.judul}
      missionDescription={misi.deskripsi}
      learningContents={misi.kontenBelajar.map((c) => ({
        id: c.id,
        contentType: c.tipeKonten,
        title: c.judul,
        body: c.isi,
        mediaUrl: c.urlMedia,
        orderIndex: c.nomorUrut,
      }))}
      challenges={misi.tantangan.map((ch) => ({
        id: ch.id,
        title: ch.judul,
        question: ch.pertanyaan,
        challengeType: ch.tipeTantangan,
        points: ch.poin,
        orderIndex: ch.nomorUrut,
        options: ch.opsi.map((o) => ({ id: o.id, optionText: o.teksOpsi })),
        clues: ch.petunjuk.map((c) => ({
          id: c.id,
          title: c.judul,
          penaltyXp: c.penaltiXp,
          hintText: c.teksPetunjuk,
        })),
      }))}
      solvedChallengeIds={solvedChallengeIds}
      initialUnlockedClueIds={unlockedClueIds}
    />
  );
}
