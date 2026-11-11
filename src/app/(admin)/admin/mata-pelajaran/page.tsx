import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { AdminLayoutWrapper } from "@/components/layouts/AdminLayoutWrapper";
import { deleteSubjectAction } from "@/features/academic/actions";
import { BookOpen, Trash2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { MataPelajaranModal } from "@/components/admin/MataPelajaranModal";

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
      <div className="p-4 md:p-8 max-w-6xl mx-auto w-full space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Mata Pelajaran & Silabus</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Kelola mata pelajaran dan struktur bab/modul materi pembelajaran.
            </p>
          </div>

          <MataPelajaranModal />
        </div>

        {/* List Mata Pelajaran */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" /> Daftar Mata Pelajaran ({daftarMataPelajaran.length})
          </h3>

          {daftarMataPelajaran.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 shadow-sm">
              Belum ada data mata pelajaran. Klik tombol &quot;Buat Mata Pelajaran Baru&quot; di atas untuk menambahkan.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {daftarMataPelajaran.map((s) => (
                <div
                  key={s.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition flex items-center justify-between shadow-sm"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400">
                        {s.kode}
                      </span>
                      <h4 className="font-bold text-slate-900 dark:text-white text-base">{s.nama}</h4>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                      {s.deskripsi || "Tidak ada deskripsi"}
                    </p>

                    <div className="mt-3 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                      <span>{s._count.bab} Bab / Modul Terdaftar</span>
                      <span>{s._count.mapelKelas} Kelas Pengampu</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/mata-pelajaran/${s.id}`}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5"
                    >
                      Kelola Bab <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    <form action={deleteSubjectAction.bind(null, s.id)}>
                      <button
                        type="submit"
                        className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition cursor-pointer"
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
    </AdminLayoutWrapper>
  );
}
