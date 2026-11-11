import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { startOrResumeAttemptAction } from "@/features/progress/actions";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Play,
  Clock,
  Award,
  BookOpen,
  HelpCircle,
  Flag,
  CheckCircle2,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export const dynamic = "force-dynamic";

export default async function SiswaMisiDetailPage({
  params,
}: {
  params: Promise<{ missionId: string }>;
}) {
  const { missionId } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

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
      _count: {
        select: {
          kontenBelajar: true,
          tantangan: true,
        },
      },
      percobaan: {
        where: { idSiswa: user.userId },
        orderBy: { nomorPercobaan: "desc" },
      },
    },
  });

  if (!misi) {
    notFound();
  }

  const latestAttempt = misi.percobaan[0];
  const isCompleted = latestAttempt?.status === "SELESAI";
  const isInProgress = latestAttempt?.status === "SEDANG_BERJALAN";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-center items-center px-4 py-12 transition-colors duration-200 relative">
      <div className="absolute top-6 left-6 flex items-center gap-3">
        <Link
          href="/siswa"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Dasbor
        </Link>
      </div>

      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="max-w-2xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {misi.mapelKelas.mataPelajaran.kode}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {misi.mapelKelas.kelas.nama} • Bab: {misi.bab.judul}
            </span>
          </div>

          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            {misi.judul}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {misi.deskripsi}
          </p>
        </div>

        {/* Informasi Detail Misi */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-y border-slate-100 dark:border-slate-800/80 text-center">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Tingkat</span>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">{misi.tingkatKesulitan}</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Total Poin</span>
            <p className="text-sm font-bold text-amber-500 mt-0.5">{misi.totalPoin} XP</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Materi</span>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">{misi._count.kontenBelajar} Modul</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase">Flag Soal</span>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">{misi._count.tantangan} Soal</p>
          </div>
        </div>

        {/* CTA Button Mulai / Lanjutkan */}
        <div>
          <form action={startOrResumeAttemptAction.bind(null, misi.id)}>
            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-2xl transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>
                {isCompleted
                  ? "Ulangi Misi (Attempt Baru)"
                  : isInProgress
                  ? "Lanjutkan Pengerjaan Misi"
                  : "Mulai Investigasi Lab Sekarang"}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
