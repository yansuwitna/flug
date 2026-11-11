import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { AdminLayoutWrapper } from "@/components/layouts/AdminLayoutWrapper";
import { createChapterAction } from "@/features/academic/actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, Plus, FolderTree } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDetailMataPelajaranPage({
  params,
}: {
  params: Promise<{ subjectId: string }>;
}) {
  const { subjectId } = await params;
  const user = await getCurrentUser();

  const mataPelajaran = await prisma.mataPelajaran.findUnique({
    where: { id: subjectId },
    include: {
      bab: {
        orderBy: { nomorUrut: "asc" },
        include: {
          _count: { select: { misi: true } },
        },
      },
      mapelKelas: {
        include: {
          kelas: true,
          guru: true,
        },
      },
    },
  });

  if (!mataPelajaran) {
    notFound();
  }

  return (
    <AdminLayoutWrapper userName={user?.name}>
      <div className="p-4 md:p-8 max-w-6xl mx-auto w-full space-y-8">
        <div>
          <Link
            href="/admin/mata-pelajaran"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition mb-3"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Mata Pelajaran
          </Link>

          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-amber-400">
              {mataPelajaran.kode}
            </span>
            <h2 className="text-3xl font-extrabold text-white">{mataPelajaran.nama}</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            {mataPelajaran.deskripsi || "Silabus dan susunan materi pembelajaran FLAG HUNTER."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Tambah Bab */}
          <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80 shadow-xl h-fit">
            <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" /> Tambah Bab / Modul
            </h3>

            <form action={createChapterAction} className="space-y-4">
              <input type="hidden" name="idMataPelajaran" value={mataPelajaran.id} />

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Nomor Urut
                </label>
                <input
                  type="number"
                  name="nomorUrut"
                  defaultValue={mataPelajaran.bab.length + 1}
                  required
                  min={1}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Judul Bab
                </label>
                <input
                  type="text"
                  name="judul"
                  required
                  placeholder="Contoh: Protokol IP & Routing Dasar"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Tujuan Pembelajaran / Ringkasan (Opsional)
                </label>
                <textarea
                  name="deskripsi"
                  rows={3}
                  placeholder="Uraian konsep yang dipelajari pada bab ini..."
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition shadow-lg shadow-emerald-600/20 cursor-pointer"
              >
                Simpan Bab Baru
              </button>
            </form>
          </div>

          {/* List Bab & Modul */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-amber-400" /> Urutan Bab Pembelajaran ({mataPelajaran.bab.length})
            </h3>

            {mataPelajaran.bab.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-800/40 border border-slate-700/80 text-center text-xs text-slate-400">
                Belum ada bab materi pada mata pelajaran ini.
              </div>
            ) : (
              <div className="space-y-3">
                {mataPelajaran.bab.map((b) => (
                  <div
                    key={b.id}
                    className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:border-slate-600 transition flex items-start gap-4"
                  >
                    <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 text-amber-400 flex items-center justify-center font-bold text-sm shrink-0">
                      {b.nomorUrut}
                    </div>

                    <div className="flex-1">
                      <h4 className="font-bold text-white text-base">{b.judul}</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        {b.deskripsi || "Tidak ada rincian materi."}
                      </p>

                      <div className="mt-3 flex items-center gap-3 text-xs text-emerald-400 font-medium">
                        <span>{b._count.misi} Misi Lab Tersedia</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayoutWrapper>
  );
}
