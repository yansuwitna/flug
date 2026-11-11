"use server";

import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { normalizeFlag, hashFlag } from "@/lib/security/hash";
import { revalidatePath } from "next/cache";
import { TipeTantangan } from "@prisma/client";

async function requireTeacherOrAdmin() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "GURU" && user.role !== "ADMIN")) {
    throw new Error("Unauthorized: Akses khusus Guru dan Administrator");
  }
  return user;
}

// -----------------------------------------------------------------------------
// 1. TAMBAH TANTANGAN & JAWABAN FLAG
// -----------------------------------------------------------------------------
const addChallengeSchema = z.object({
  idMisi: z.string().min(1),
  judul: z.string().min(3, "Judul tantangan minimal 3 karakter"),
  pertanyaan: z.string().min(5, "Pertanyaan tantangan minimal 5 karakter"),
  deskripsi: z.string().optional(),
  tipeTantangan: z.nativeEnum(TipeTantangan).default(TipeTantangan.TEKS),
  poin: z.coerce.number().min(10).default(100),
  nomorUrut: z.coerce.number().default(1),
  maksMencoba: z.coerce.number().min(1).default(5),
  flagJawaban: z.string().min(1, "Kunci jawaban flag wajib diisi"),
  hurufBesarKecil: z.boolean().default(false),
  pangkasSpasi: z.boolean().default(true),
  opsi: z.array(z.string()).optional(),
});

export async function addChallengeAction(formData: FormData): Promise<void> {
  await requireTeacherOrAdmin();

  const idMisi = (formData.get("missionId") || formData.get("idMisi")) as string;
  const judul = (formData.get("title") || formData.get("judul")) as string;
  const pertanyaan = (formData.get("question") || formData.get("pertanyaan")) as string;
  const deskripsi = (formData.get("description") || formData.get("deskripsi")) as string;
  const tipeTantangan = (formData.get("challengeType") || formData.get("tipeTantangan") || TipeTantangan.TEKS) as TipeTantangan;
  const poin = Number(formData.get("points") || formData.get("poin") || 100);
  const nomorUrut = Number(formData.get("orderIndex") || formData.get("nomorUrut") || 1);
  const maksMencoba = Number(formData.get("maxTries") || formData.get("maksMencoba") || 5);
  const flagJawaban = (formData.get("flagAnswer") || formData.get("flagJawaban")) as string;
  const hurufBesarKecil = formData.get("isCaseSensitive") === "on" || formData.get("hurufBesarKecil") === "on";
  const pangkasSpasi = formData.get("trimSpaces") !== "off" && formData.get("pangkasSpasi") !== "off";

  // Opsi (untuk pilihan ganda)
  const opsiRaw = (formData.get("options") || formData.get("opsi")) as string;
  const opsi = opsiRaw
    ? opsiRaw
        .split("\n")
        .map((o) => o.trim())
        .filter((o) => o.length > 0)
    : [];

  const validated = addChallengeSchema.safeParse({
    idMisi,
    judul,
    pertanyaan,
    deskripsi: deskripsi || undefined,
    tipeTantangan,
    poin,
    nomorUrut,
    maksMencoba,
    flagJawaban,
    hurufBesarKecil,
    pangkasSpasi,
    opsi,
  });

  if (!validated.success) {
    return;
  }

  // Normalisasi dan hitung Hash HMAC aman dari jawaban flag
  const normalizedAnswer = normalizeFlag(flagJawaban, {
    trimSpaces: pangkasSpasi,
    isCaseSensitive: hurufBesarKecil,
  });
  const answerHash = hashFlag(normalizedAnswer);

  await prisma.$transaction(async (tx) => {
    // 1. Simpan Tantangan
    const challenge = await tx.tantangan.create({
      data: {
        idMisi,
        judul,
        pertanyaan,
        deskripsi: deskripsi || undefined,
        tipeTantangan,
        poin,
        nomorUrut,
        maksMencoba,
      },
    });

    // 2. Simpan Kunci Jawaban (Hash disimpan, plaintext dibuang)
    await tx.kunciJawaban.create({
      data: {
        idTantangan: challenge.id,
        hashJawaban: answerHash,
        hurufBesarKecil,
        pangkasSpasi,
      },
    });

    // 3. Simpan Opsi Pilihan Ganda jika ada
    if (opsi && opsi.length > 0) {
      await tx.opsiTantangan.createMany({
        data: opsi.map((optText, idx) => ({
          idTantangan: challenge.id,
          teksOpsi: optText,
          nomorUrut: idx + 1,
        })),
      });
    }

    // 4. Update akumulasi poin misi
    const total = await tx.tantangan.aggregate({
      where: { idMisi },
      _sum: { poin: true },
    });

    await tx.misi.update({
      where: { id: idMisi },
      data: { totalPoin: total._sum.poin || 0 },
    });
  });

  revalidatePath(`/guru/misi/${idMisi}/challenges`);
  revalidatePath(`/guru/misi/${idMisi}/builder`);
}

// -----------------------------------------------------------------------------
// 2. TAMBAH PETUNJUK (Clue) DENGAN PENALTI SKOR
// -----------------------------------------------------------------------------
export async function addClueAction(formData: FormData): Promise<void> {
  await requireTeacherOrAdmin();

  const idTantangan = (formData.get("challengeId") || formData.get("idTantangan")) as string;
  const idMisi = (formData.get("missionId") || formData.get("idMisi")) as string;
  const judul = (formData.get("title") || formData.get("judul")) as string;
  const teksPetunjuk = (formData.get("hintText") || formData.get("teksPetunjuk")) as string;
  const penaltiXp = Number(formData.get("penaltyXp") || formData.get("penaltiXp") || 0);
  const nomorUrut = Number(formData.get("orderIndex") || formData.get("nomorUrut") || 1);

  if (!idTantangan || !judul || !teksPetunjuk) {
    return;
  }

  await prisma.petunjuk.create({
    data: {
      idTantangan,
      judul,
      teksPetunjuk,
      penaltiXp,
      nomorUrut,
    },
  });

  revalidatePath(`/guru/misi/${idMisi}/challenges`);
}

export async function deleteClueAction(idPetunjuk: string, idMisi: string): Promise<void> {
  await requireTeacherOrAdmin();
  await prisma.petunjuk.delete({ where: { id: idPetunjuk } });
  revalidatePath(`/guru/misi/${idMisi}/challenges`);
}

// -----------------------------------------------------------------------------
// 3. HAPUS TANTANGAN
// -----------------------------------------------------------------------------
export async function deleteChallengeAction(idTantangan: string, idMisi: string): Promise<void> {
  await requireTeacherOrAdmin();

  await prisma.$transaction(async (tx) => {
    await tx.tantangan.delete({ where: { id: idTantangan } });

    // Rekalkulasi total poin
    const total = await tx.tantangan.aggregate({
      where: { idMisi },
      _sum: { poin: true },
    });

    await tx.misi.update({
      where: { id: idMisi },
      data: { totalPoin: total._sum.poin || 0 },
    });
  });

  revalidatePath(`/guru/misi/${idMisi}/challenges`);
  revalidatePath(`/guru/misi/${idMisi}/builder`);
}
