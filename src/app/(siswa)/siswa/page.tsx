import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import {
  Flag,
  Zap,
  Compass,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Award,
} from "lucide-react";
import Link from "next/link";
import { StatusMisi } from "@prisma/client";
import { StudentNavbar } from "@/components/navigation/StudentNavbar";

export const dynamic = "force-dynamic";

export default async function SiswaDashboardPage() {
  const user = await getCurrentUser();

  // 1. Cari kelas yang diikuti oleh siswa
  const anggotaKelas = await prisma.anggotaKelas.findFirst({
    where: { idSiswa: user?.userId },
    include: {
      kelas: {
        include: {
          tahunAjaran: true,
          mapelKelas: {
            include: {
              mataPelajaran: true,
              misi: {
                where: { status: StatusMisi.DITERBITKAN },
                include: {
                  bab: true,
                  _count: {
                    select: {
                      tantangan: true,
                      kontenBelajar: true,
                    },
                  },
                  percobaan: {
                    where: { idSiswa: user?.userId },
                    orderBy: { nomorPercobaan: "desc" },
                    take: 1,
                    include: {
                      hasil: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  // 2. Hitung total XP akumulasi dari TransaksiXp
  const transaksiXp = await prisma.transaksiXp.findMany({
    where: { idSiswa: user?.userId },
  });
  const totalXp = transaksiXp.reduce((sum, tx) => sum + tx.jumlah, 0);

  // Kumpulkan seluruh mission yang tersedia di kelas siswa
  const daftarMisiTersedia =
    anggotaKelas?.kelas.mapelKelas.flatMap((mk) =>
      mk.misi.map((m) => ({
        ...m,
        namaMapel: mk.mataPelajaran.nama,
        kodeMapel: mk.mataPelajaran.kode,
        percobaanTerakhir: m.percobaan[0],
      }))
    ) || [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      <StudentNavbar
        userName={user?.name}
        classNameTitle={anggotaKelas?.kelas.nama || "Siswa Baru"}
        totalXp={totalXp}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 md:p-8 space-y-8">
        {/* Banner Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-emerald-600 via-emerald-700 to-teal-800 p-6 md:p-8 text-white shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-2">
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider">
              Ruang Eksplorasi Flag
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Selamat Bertugas, Agen {user?.name}!
            </h2>
            <p className="text-emerald-100 text-xs md:text-sm leading-relaxed">
              Pecahkan skenario praktikum, pelajari konsep keamanan informasi, dan temukan bendera (flag) tersembunyi untuk mengumpulkan skor XP tertinggi!
            </p>
          </div>

          <div className="absolute right-4 -bottom-6 opacity-15 pointer-events-none">
            <Flag className="w-48 h-48" />
          </div>
        </div>

        {/* Daftar Misi Tersedia */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Misi Investigasi Kelas Anda</span>
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {daftarMisiTersedia.length} Misi Aktif
            </span>
          </div>

          {daftarMisiTersedia.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
              <h4 className="font-bold text-slate-800 dark:text-slate-200 text-base">
                Belum Ada Misi Diterbitkan
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Guru pengampu Anda belum merilis modul atau misi CTF di kelas ini. Harap periksa kembali nanti!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {daftarMisiTersedia.map((m) => {
                const isCompleted = m.percobaanTerakhir?.status === "SELESAI";
                const isInProgress = m.percobaanTerakhir?.status === "SEDANG_BERJALAN";

                return (
                  <div
                    key={m.id}
                    className="group rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 hover:border-emerald-500/50 p-6 flex flex-col justify-between shadow-xs hover:shadow-xl transition duration-200"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {m.kodeMapel}
                        </span>

                        {isCompleted ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Tuntas
                          </span>
                        ) : isInProgress ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800">
                            Sedang Berjalan
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                            Belum Dikerjakan
                          </span>
                        )}
                      </div>

                      <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition line-clamp-1">
                        {m.judul}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {m.deskripsi}
                      </p>

                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span>{m._count.kontenBelajar} Modul</span>
                        <span>{m._count.tantangan} Tantangan Flag</span>
                        <span className="font-bold text-amber-500">{m.totalPoin} XP</span>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60">
                      <Link
                        href={`/siswa/misi/${m.id}`}
                        className="w-full py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-emerald-600 dark:hover:bg-emerald-600 text-white font-semibold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                      >
                        <span>{isCompleted ? "Lihat Hasil Misi" : isInProgress ? "Lanjutkan Misi" : "Mulai Misi"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
