import { prisma } from "@/lib/db/prisma";

export interface TingkatPenyelidik {
  level: number;
  gelar: string;
  minXp: number;
  maxXp: number;
}

export const TINGKAT_INVESTIGATOR: TingkatPenyelidik[] = [
  { level: 1, gelar: "Penyelidik Pemula", minXp: 0, maxXp: 199 },
  { level: 2, gelar: "Pandu Junior", minXp: 200, maxXp: 499 },
  { level: 3, gelar: "Detektif Siber", minXp: 500, maxXp: 999 },
  { level: 4, gelar: "Pemburu Flag Senior", minXp: 1000, maxXp: 1999 },
  { level: 5, gelar: "Master Hunter Elit", minXp: 2000, maxXp: Infinity },
];

export function getLevelFromXp(xp: number): TingkatPenyelidik {
  for (const lvl of TINGKAT_INVESTIGATOR) {
    if (xp >= lvl.minXp && xp <= lvl.maxXp) {
      return lvl;
    }
  }
  return TINGKAT_INVESTIGATOR[0];
}

/**
 * Mengecek dan memberikan lencana secara transaksional
 */
export async function evaluateAndAwardBadges(idSiswa: string) {
  // 1. Ambil data aktivitas siswa
  const [totalFlagTerpecahkan, totalMisiSelesai] = await Promise.all([
    prisma.kirimanJawaban.count({
      where: {
        percobaan: { idSiswa },
        benar: true,
      },
    }),
    prisma.percobaanMisi.count({
      where: {
        idSiswa,
        status: "SELESAI",
      },
    }),
  ]);

  // Daftar badge default
  const daftarLencana = [
    {
      slug: "first_flag",
      nama: "First Blood",
      deskripsi: "Menangkap bendera (flag) pertama kali dalam pembelajaran.",
      kriteria: "Menjawab benar minimal 1 flag",
      kondisi: totalFlagTerpecahkan >= 1,
    },
    {
      slug: "mission_complete",
      nama: "Misi Tuntas",
      deskripsi: "Menyelesaikan misi pembelajaran pertama hingga tuntas.",
      kriteria: "Menyelesaikan minimal 1 misi",
      kondisi: totalMisiSelesai >= 1,
    },
    {
      slug: "flag_master",
      nama: "Veteran Bendera",
      deskripsi: "Berhasil menangkap 5 flag investigasi atau lebih.",
      kriteria: "Menjawab benar minimal 5 flag",
      kondisi: totalFlagTerpecahkan >= 5,
    },
  ];

  for (const lDef of daftarLencana) {
    if (lDef.kondisi) {
      // Pastikan lencana ada di tabel Lencana
      const lencana = await prisma.lencana.upsert({
        where: { slug: lDef.slug },
        create: {
          slug: lDef.slug,
          nama: lDef.nama,
          deskripsi: lDef.deskripsi,
          kriteria: lDef.kriteria,
        },
        update: {},
      });

      // Berikan ke siswa jika belum punya
      await prisma.lencanaSiswa.upsert({
        where: {
          idSiswa_idLencana: {
            idSiswa,
            idLencana: lencana.id,
          },
        },
        create: {
          idSiswa,
          idLencana: lencana.id,
        },
        update: {},
      });
    }
  }
}
