import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { AdminLayoutWrapper } from "@/components/layouts/AdminLayoutWrapper";
import { createSubjectAction, deleteSubjectAction } from "@/features/academic/actions";
import { BookOpen, Plus, Trash2, ArrowRight, Layers } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SubjectsPage() {
  const user = await getCurrentUser();

  const subjects = await prisma.subject.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { chapters: true, classSubjects: true },
      },
    },
  });

  return (
    <AdminLayoutWrapper userName={user?.name}>
      <div className="p-8 max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <h2 className="text-2xl font-black text-white">Mata Pelajaran</h2>
          <p className="text-sm text-slate-400 mt-1">
            Daftar kurikulum mata pelajaran dan struktur topik/bab pembelajaran.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Tambah Mapel */}
          <div className="p-6 rounded-2xl bg-slate-800 border border-slate-700 h-fit">
            <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-400" /> Tambah Mata Pelajaran
            </h3>

            <form action={createSubjectAction} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Kode Mata Pelajaran
                </label>
                <input
                  type="text"
                  name="code"
                  required
                  placeholder="misal: INF-X, MTK-XI"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Nama Mata Pelajaran
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="misal: Informatika & Jaringan Dasar"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Deskripsi Singkat (Opsional)
                </label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Deskripsi ruang lingkup mata pelajaran..."
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Simpan Mata Pelajaran
              </button>
            </form>
          </div>

          {/* List Mata Pelajaran */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" /> Daftar Mata Pelajaran ({subjects.length})
            </h3>

            {subjects.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-800/40 border border-slate-700/60 text-center text-sm text-slate-400">
                Belum ada mata pelajaran yang dibuat.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subjects.map((s) => (
                  <div
                    key={s.id}
                    className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:border-amber-500/50 transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800/40">
                          {s.code}
                        </span>
                        <form action={deleteSubjectAction.bind(null, s.id)}>
                          <button
                            type="submit"
                            title="Hapus Mapel"
                            className="p-1 text-slate-500 hover:text-rose-400 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </form>
                      </div>

                      <h4 className="text-lg font-bold text-white mt-2">{s.name}</h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {s.description || "Tidak ada deskripsi tambahan"}
                      </p>

                      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-700/60 text-xs text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-cyan-400" /> {s._count.chapters} Bab/Topik
                        </span>
                        <span>{s._count.classSubjects} Kelas Aktif</span>
                      </div>
                    </div>

                    <Link
                      href={`/admin/subjects/${s.id}`}
                      className="mt-4 pt-3 flex items-center justify-between text-xs font-semibold text-amber-300 hover:text-amber-200 transition"
                    >
                      <span>Lihat & Atur Bab</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
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
