import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { getLevelFromXp } from "@/features/gamification/levels";
import { Trophy, ArrowLeft, Zap, Shield, Flag } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export const dynamic = "force-dynamic";

export default async function SiswaPeringkatPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // 1. Ambil kelas tempat siswa terdaftar
  const anggota = await prisma.anggotaKelas.findFirst({
    where: { idSiswa: user.userId },
    include: {
      kelas: {
        include: {
          anggota: {
            include: {
              siswa: {
                include: {
                  transaksiXp: true,
                  percobaanMisi: {
                    include: {
                      kirimanJawaban: {
                        where: { benar: true },
                      },
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

  const kelas = anggota?.kelas;

  // 2. Kalkulasi ranking siswa di kelas tersebut
  const daftarPeringkat = (kelas?.anggota || [])
    .map((member) => {
      const s = member.siswa;
      const totalXp = s.transaksiXp.reduce((sum, tx) => sum + tx.jumlah, 0);

      // Hitung total flag unik yang terpecahkan
      const solvedFlagsSet = new Set<string>();
      s.percobaanMisi.forEach((att) => {
        att.kirimanJawaban.forEach((sub) => {
          solvedFlagsSet.add(sub.idTantangan);
        });
      });

      const lvl = getLevelFromXp(totalXp);

      return {
        id: s.id,
        nama: s.nama,
        email: s.email,
        totalXp,
        totalFlags: solvedFlagsSet.size,
        level: lvl.level,
        gelar: lvl.gelar,
        isCurrentUser: s.id === user.userId,
      };
    })
    .sort((a, b) => b.totalXp - a.totalXp);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col px-4 py-8 md:p-8 transition-colors duration-200">
      <div className="max-w-4xl mx-auto w-full flex-1">
        {/* Header Navigasi */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/siswa"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Dasbor Siswa
          </Link>
          <ThemeToggle />
        </div>

        {/* Card Header Peringkat */}
        <div className="p-6 md:p-8 rounded-3xl bg-linear-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-amber-500 text-slate-950 rounded-2xl shadow-md shadow-amber-500/20">
                <Trophy className="w-8 h-8" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-amber-800/40">
                  Peringkat Kelas
                </span>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  Peringkat Agen CTF - {kelas ? kelas.nama : "Kelas Siswa"}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Kompetisi pemecahan bendera (flag hunting) & akumulasi XP investigasi.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabel Peringkat */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500" /> Daftar Agen Aktif ({daftarPeringkat.length})
            </h3>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {daftarPeringkat.map((student, idx) => {
              const rank = idx + 1;
              const isTop1 = rank === 1;
              const isTop2 = rank === 2;
              const isTop3 = rank === 3;

              return (
                <div
                  key={student.id}
                  className={`p-4 md:p-5 flex items-center justify-between transition ${
                    student.isCurrentUser
                      ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-l-4 border-l-emerald-500"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Rank Badge */}
                    <div
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 ${
                        isTop1
                          ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20"
                          : isTop2
                          ? "bg-slate-300 dark:bg-slate-700 text-slate-900 dark:text-white"
                          : isTop3
                          ? "bg-amber-700 text-white"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono"
                      }`}
                    >
                      {rank}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {student.nama}
                        </span>
                        {student.isCurrentUser && (
                          <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                            Anda
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        <span>Level {student.level}: {student.gelar}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                          <Flag className="w-3 h-3" /> {student.totalFlags} Flag
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Skor XP */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/40 text-amber-700 dark:text-amber-400 font-black text-xs md:text-sm">
                    <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <span>{student.totalXp} XP</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
