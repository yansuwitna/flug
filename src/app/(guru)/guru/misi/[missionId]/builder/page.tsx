import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { TeacherLayoutWrapper } from "@/components/layouts/TeacherLayoutWrapper";
import {
  addLearningContentAction,
  deleteLearningContentAction,
  updateMissionStatusAction,
} from "@/features/missions/actions";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Plus,
  Trash2,
  ArrowRight,
  Eye,
  FileText,
  Video,
  ExternalLink,
} from "lucide-react";
import { TipeKonten, StatusMisi } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function GuruMisiBuilderPage({
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
      kontenBelajar: {
        orderBy: { nomorUrut: "asc" },
      },
      _count: { select: { tantangan: true } },
    },
  });

  if (!misi) notFound();

  return (
    <TeacherLayoutWrapper userName={user.name}>
      <div className="p-4 md:p-8 max-w-6xl mx-auto w-full space-y-8">
        <div>
          <Link
            href="/guru/misi"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition mb-3"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Bank Misi
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">{misi.judul}</h2>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {misi.tingkatKesulitan}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {misi.mapelKelas.mataPelajaran.nama} ({misi.mapelKelas.mataPelajaran.kode}) • Kelas {misi.mapelKelas.kelas.nama} • Bab: {misi.bab.judul}
              </p>
            </div>

            {/* Wizard Navigation */}
            <div className="flex items-center gap-2">
              <Link
                href={`/guru/misi/${misi.id}/challenges`}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition flex items-center gap-1.5 shadow-md"
              >
                Tantangan Flag ({misi._count.tantangan}) <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Form Tambah Materi & List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm h-fit">
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Tambah Materi Pembelajaran
            </h3>

            <form action={addLearningContentAction} className="space-y-4">
              <input type="hidden" name="idMisi" value={misi.id} />

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Tipe Konten
                </label>
                <select
                  name="tipeKonten"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value={TipeKonten.TEKS}>Teks / Artikel Teori</option>
                  <option value={TipeKonten.VIDEO_SEMATAN}>Video Sematan (YouTube/Embed)</option>
                  <option value={TipeKonten.TAUTAN}>Tautan Eksternal / Lab Guide</option>
                  <option value={TipeKonten.DOKUMEN}>Dokumen / PDF Lab Guide</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Judul Materi
                </label>
                <input
                  type="text"
                  name="judul"
                  required
                  placeholder="Contoh: Pengenalan Paket Wireshark"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  URL Media / Tautan (Opsional)
                </label>
                <input
                  type="url"
                  name="urlMedia"
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Isi Pembahasan / Petunjuk Belajar
                </label>
                <textarea
                  name="isi"
                  rows={4}
                  placeholder="Uraikan konsep atau instruksi praktikum bagi siswa..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition shadow-md cursor-pointer"
              >
                Simpan Materi
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> Daftar Modul Materi Misi ({misi.kontenBelajar.length})
            </h3>

            {misi.kontenBelajar.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
                Belum ada materi pembelajaran yang ditambahkan untuk misi ini.
              </div>
            ) : (
              <div className="space-y-3">
                {misi.kontenBelajar.map((c) => (
                  <div
                    key={c.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition flex items-start gap-4 shadow-sm"
                  >
                    <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-cyan-600 dark:text-cyan-400 shrink-0">
                      {c.tipeKonten === TipeKonten.VIDEO_SEMATAN ? (
                        <Video className="w-5 h-5" />
                      ) : c.tipeKonten === TipeKonten.TAUTAN ? (
                        <ExternalLink className="w-5 h-5" />
                      ) : (
                        <FileText className="w-5 h-5" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                          {c.tipeKonten}
                        </span>
                        <h4 className="font-bold text-slate-900 dark:text-white text-base">{c.judul}</h4>
                      </div>

                      {c.isi && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2">
                          {c.isi}
                        </p>
                      )}

                      {c.urlMedia && (
                        <a
                          href={c.urlMedia}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-cyan-600 dark:text-cyan-400 hover:underline mt-2"
                        >
                          Buka Tautan Media <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    <form action={deleteLearningContentAction.bind(null, c.id, misi.id)}>
                      <button
                        type="submit"
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                        title="Hapus Materi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </TeacherLayoutWrapper>
  );
}
