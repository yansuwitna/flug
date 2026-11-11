import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { TeacherLayoutWrapper } from "@/components/layouts/TeacherLayoutWrapper";
import { updateMissionStatusAction } from "@/features/missions/actions";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Layers,
  Flag,
  BookOpen,
  Award,
  Globe,
  Archive,
} from "lucide-react";
import { StatusMisi } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function GuruMisiPreviewPage({
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
      kontenBelajar: { orderBy: { nomorUrut: "asc" } },
      tantangan: {
        orderBy: { nomorUrut: "asc" },
        include: { petunjuk: true },
      },
    },
  });

  if (!misi) notFound();

  const isPublished = misi.status === StatusMisi.DITERBITKAN;

  return (
    <TeacherLayoutWrapper userName={user.name}>
      <div className="p-4 md:p-8 max-w-5xl mx-auto w-full space-y-8">
        <div>
          <Link
            href={`/guru/misi/${misi.id}/challenges`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition mb-3"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Manajemen Tantangan
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                Mode Pratinjau Guru
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{misi.judul}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {misi.mapelKelas.mataPelajaran.nama} ({misi.mapelKelas.mataPelajaran.kode}) • Kelas {misi.mapelKelas.kelas.nama} • Bab: {misi.bab.judul}
              </p>
            </div>

            {/* Tombol Publikasi / Arsip */}
            <div className="flex items-center gap-3">
              {isPublished ? (
                <form action={updateMissionStatusAction.bind(null, misi.id, StatusMisi.DRAF)}>
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-semibold text-xs transition flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Archive className="w-4 h-4 text-amber-600 dark:text-amber-400" /> Tarik ke Draf
                  </button>
                </form>
              ) : (
                <form action={updateMissionStatusAction.bind(null, misi.id, StatusMisi.DITERBITKAN)}>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-2 shadow-md cursor-pointer"
                  >
                    <Globe className="w-4 h-4" /> Terbitkan Misi ke Siswa
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400">Tingkat</span>
            <p className="text-base font-bold text-slate-900 dark:text-white mt-1">{misi.tingkatKesulitan}</p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400">Total Reward</span>
            <p className="text-base font-bold text-amber-600 dark:text-amber-400 mt-1">{misi.totalPoin} XP</p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400">Maks. Mencoba</span>
            <p className="text-base font-bold text-slate-900 dark:text-white mt-1">{misi.maksPercobaan} Kali</p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400">Durasi</span>
            <p className="text-base font-bold text-slate-900 dark:text-white mt-1">
              {misi.durasiMenit ? `${misi.durasiMenit} Menit` : "Fleksibel"}
            </p>
          </div>
        </div>

        {/* Skenario Kasus */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Skenario Investigasi</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
            {misi.deskripsi}
          </p>
        </div>

        {/* Pratinjau Modul Materi */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-600 dark:text-cyan-400" /> Materi Pembelajaran ({misi.kontenBelajar.length})
          </h3>

          <div className="space-y-3">
            {misi.kontenBelajar.map((c, idx) => (
              <div
                key={c.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400">Modul {idx + 1}:</span>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{c.judul}</h4>
                </div>
                {c.isi && <p className="text-xs text-slate-600 dark:text-slate-300">{c.isi}</p>}
                {c.urlMedia && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">Media: {c.urlMedia}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Pratinjau Daftar Tantangan */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
            <Flag className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Tantangan Flag ({misi.tantangan.length})
          </h3>

          <div className="space-y-3">
            {misi.tantangan.map((ch, idx) => (
              <div
                key={ch.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{ch.judul}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{ch.pertanyaan}</p>
                  <div className="mt-2 text-xs text-amber-600 dark:text-amber-400 font-semibold">
                    +{ch.poin} XP • {ch.petunjuk.length} Petunjuk Bantuan
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </TeacherLayoutWrapper>
  );
}
