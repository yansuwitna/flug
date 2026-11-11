import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { AdminLayoutWrapper } from "@/components/layouts/AdminLayoutWrapper";
import { createSubjectAction, deleteSubjectAction } from "@/features/academic/actions";
import { BookOpen, Plus, Trash2, ArrowRight } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminMataPelajaranPage() {
  const user = await getCurrentUser();

  const daftarMataPelajaran = await prisma.mataPelajaran.findMany({
    orderBy: { nama: "asc" },
    include: {
      _count: {
        select: { bab: true, mapelKelas: true },
      },
    },
  });

  return (
    <AdminLayoutWrapper userName={user?.name}>
      <div className="p-4 md:p-8 max-w-6xl mx-auto w-full">
        <div className="mb-8">
          <h2 className="text-2xl font-black text-white">Mata Pelajaran & Silabus</h2>
          <p className="text-sm text-slate-400 mt-1">
            Kelola mata pelajaran dan struktur bab/modul materi pembelajaran.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Tambah Mata Pelajaran */}
          <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80 shadow-xl h-fit">
            <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" /> Buat Mata Pelajaran Baru
            </h3>

            <form action={createSubjectAction} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Kode Mapel
                </label>
                <input
                  type="text"
                  name="kode"
                  required
                  placeholder="Contoh: INF-X"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Nama Mata Pelajaran
                </label>
                <input
                  type="text"
                  name="nama"
                  required
                  placeholder="Contoh: Jaringan Komputer Dasar"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Deskripsi Singkat (Opsional)
                </label>
                <textarea
                  name="deskripsi"
                  rows={3}
                  placeholder="Deskripsi ruang lingkup mata pelajaran..."
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition shadow-lg shadow-emerald-600/20 cursor-pointer"
              >
                Simpan Mata Pelajaran
              </button>
            </form>
          </div>

          {/* List Mata Pelajaran */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" /> Daftar Mata Pelajaran ({daftarMataPelajaran.length})
            </h3>

            {daftarMataPelajaran.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-800/40 border border-slate-700/80 text-center text-xs text-slate-400">
                Belum ada data mata pelajaran. Silakan tambahkan melalui form di samping.
              </div>
            ) : (
              <div className="space-y-3">
                {daftarMataPelajaran.map((s) => (
                  <div
                    key={s.id}
                    className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:border-slate-600 transition flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-amber-400">
                          {s.kode}
                        </span>
                        <h4 className="font-bold text-white text-base">{s.nama}</h4>
                      </div>

                      <p className="text-xs text-slate-400 line-clamp-1">
                        {s.deskripsi || "Tidak ada deskripsi"}
                      </p>

                      <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
                        <span>{s._count.bab} Bab / Modul Terdaftar</span>
                        <span>{s._count.mapelKelas} Kelas Pengampu</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/mata-pelajaran/${s.id}`}
                        className="px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-700/60 transition flex items-center gap-1.5"
                      >
                        Kelola Bab <ArrowRight className="w-3.5 h-3.5" />
                      </Link>

                      <form action={deleteSubjectAction.bind(null, s.id)}>
                        <button
                          type="submit"
                          className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl transition cursor-pointer"
                          title="Hapus Mata Pelajaran"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </form>
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
