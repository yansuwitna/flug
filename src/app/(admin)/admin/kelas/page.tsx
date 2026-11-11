import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { AdminLayoutWrapper } from "@/components/layouts/AdminLayoutWrapper";
import { deleteClassAction } from "@/features/academic/actions";
import { Layers, Trash2, ArrowRight, Users, BookOpen } from "lucide-react";
import Link from "next/link";
import { KelasModal } from "@/components/admin/KelasModal";

export const dynamic = "force-dynamic";

export default async function AdminKelasPage() {
  const user = await getCurrentUser();

  const [daftarKelas, daftarTahunAjaran] = await Promise.all([
    prisma.kelas.findMany({
      orderBy: { tingkat: "asc" },
      include: {
        tahunAjaran: true,
        _count: {
          select: { anggota: true, mapelKelas: true },
        },
      },
    }),
    prisma.tahunAjaran.findMany({
      orderBy: { tanggalMulai: "desc" },
    }),
  ]);

  return (
    <AdminLayoutWrapper userName={user?.name}>
      <div className="p-4 md:p-8 max-w-6xl mx-auto w-full space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Manajemen Rombel & Kelas</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Kelola rombongan belajar, alokasi tingkat kelas, dan jurusan siswa.
            </p>
          </div>

          <KelasModal daftarTahunAjaran={daftarTahunAjaran} />
        </div>

        {/* List Kelas */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Daftar Rombongan Belajar ({daftarKelas.length})
          </h3>

          {daftarKelas.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 shadow-sm">
              Belum ada data kelas yang dibuat. Klik tombol &quot;Buat Kelas Baru&quot; di atas untuk menambahkan.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {daftarKelas.map((k) => (
                <div
                  key={k.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col justify-between shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                        Tingkat {k.tingkat}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {k.tahunAjaran.nama}
                      </span>
                    </div>

                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">{k.nama}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {k.jurusan || "Program Reguler / Umum"}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> {k._count.anggota} Siswa
                      </span>
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> {k._count.mapelKelas} Mapel
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <Link
                      href={`/admin/kelas/${k.id}`}
                      className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 flex items-center gap-1 transition"
                    >
                      Kelola Kelas <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    <form action={deleteClassAction.bind(null, k.id)}>
                      <button
                        type="submit"
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                        title="Hapus Kelas"
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
