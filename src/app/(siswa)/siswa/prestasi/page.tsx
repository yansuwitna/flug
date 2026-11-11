import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { getLevelFromXp, TINGKAT_INVESTIGATOR } from "@/features/gamification/levels";
import { Award, ArrowLeft, Zap, CheckCircle2, Lock, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export const dynamic = "force-dynamic";

export default async function SiswaPrestasiPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // 1. Ambil XP siswa
  const transaksiXp = await prisma.transaksiXp.findMany({
    where: { idSiswa: user.userId },
  });
  const totalXp = transaksiXp.reduce((sum, tx) => sum + tx.jumlah, 0);
  const tingkatSaatIni = getLevelFromXp(totalXp);

  // 2. Ambil badge yang didapat siswa
  const lencanaSiswa = await prisma.lencanaSiswa.findMany({
    where: { idSiswa: user.userId },
    include: { lencana: true },
  });

  const lencanaTerkunciIds = new Set(lencanaSiswa.map((ub) => ub.idLencana));

  // 3. Ambil semua badge yang tersedia
  const semuaLencana = await prisma.lencana.findMany({
    orderBy: { dibuatPada: "asc" },
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col px-4 py-8 md:p-8 transition-colors duration-200">
      <div className="max-w-4xl mx-auto w-full flex-1">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/siswa"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Dasbor Siswa
          </Link>
          <ThemeToggle />
        </div>

        {/* Level Progression Banner */}
        <div className="p-6 md:p-8 rounded-3xl bg-linear-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white shadow-xl mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md">
              Level Penyelidik Siber
            </span>
            <div className="flex items-center gap-1.5 font-black text-amber-300 text-sm">
              <Zap className="w-4 h-4 fill-amber-300" />
              <span>{totalXp} XP</span>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-black">
              Level {tingkatSaatIni.level}: {tingkatSaatIni.gelar}
            </h2>
            <p className="text-xs text-emerald-100 mt-1 max-w-xl">
              Terus pecahkan teka-teki bendera (flag) pada misi praktikum untuk meningkatkan level dan membuka lencana prestasi baru!
            </p>
          </div>

          {/* Progress Bar ke Level Berikutnya */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs font-semibold text-emerald-100">
              <span>{tingkatSaatIni.minXp} XP</span>
              <span>
                {tingkatSaatIni.maxXp === Infinity
                  ? "Tingkat Maksimal Tercapai"
                  : `${tingkatSaatIni.maxXp + 1} XP (Level ${tingkatSaatIni.level + 1})`}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-900/40 overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-500"
                style={{
                  width: `${
                    tingkatSaatIni.maxXp === Infinity
                      ? 100
                      : Math.min(
                          100,
                          Math.max(
                            0,
                            ((totalXp - tingkatSaatIni.minXp) /
                              (tingkatSaatIni.maxXp - tingkatSaatIni.minXp)) *
                              100
                          )
                        )
                  }%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Daftar Lencana (Badges) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>Koleksi Lencana Penghargaan ({lencanaSiswa.length} / {semuaLencana.length})</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {semuaLencana.map((b) => {
              const isUnlocked = lencanaTerkunciIds.has(b.id);

              return (
                <div
                  key={b.id}
                  className={`p-5 rounded-3xl border flex flex-col justify-between transition ${
                    isUnlocked
                      ? "bg-white dark:bg-slate-900 border-emerald-500/40 shadow-sm"
                      : "bg-slate-100/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 opacity-60"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                          isUnlocked
                            ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/60"
                            : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                        }`}
                      >
                        <Award className="w-5 h-5" />
                      </div>

                      {isUnlocked ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Terbuka
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Terkunci
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{b.nama}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {b.deskripsi}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 text-[11px] text-slate-400 font-medium">
                    Kriteria: {b.kriteria}
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
