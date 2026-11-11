import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { AdminLayoutWrapper } from "@/components/layouts/AdminLayoutWrapper";
import {
  deleteAcademicYearAction,
  toggleAcademicYearStatusAction,
} from "@/features/academic/actions";
import { Calendar, Trash2, CheckCircle, XCircle } from "lucide-react";
import { TahunAjaranModal } from "@/components/admin/TahunAjaranModal";

export const dynamic = "force-dynamic";

export default async function AdminTahunAjaranPage() {
  const user = await getCurrentUser();

  const daftarTahunAjaran = await prisma.tahunAjaran.findMany({
    orderBy: { tanggalMulai: "desc" },
    include: {
      _count: {
        select: { kelas: true },
      },
    },
  });

  return (
    <AdminLayoutWrapper userName={user?.name}>
      <div className="p-4 md:p-8 max-w-6xl mx-auto w-full space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Tahun Ajaran</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Kelola periode kalender pendidikan dan tahun ajaran aktif untuk platform.
            </p>
          </div>

          <TahunAjaranModal />
        </div>

        {/* Daftar Tahun Ajaran */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> Daftar Periode Akademik ({daftarTahunAjaran.length})
          </h3>

          {daftarTahunAjaran.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 shadow-sm">
              Belum ada data tahun ajaran. Klik tombol &quot;Tambah Tahun Ajaran&quot; di atas untuk menambahkan.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {daftarTahunAjaran.map((ta) => (
                <div
                  key={ta.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition flex items-center justify-between shadow-sm"
                >
                  <div>
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <h4 className="font-bold text-slate-900 dark:text-white text-base">{ta.nama}</h4>
                      {ta.aktif ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Aktif
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> Nonaktif
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(ta.tanggalMulai).toLocaleDateString("id-ID")} s/d{" "}
                      {new Date(ta.tanggalSelesai).toLocaleDateString("id-ID")} •{" "}
                      <span className="text-slate-700 dark:text-slate-300 font-medium">{ta._count.kelas} Kelas Terdaftar</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <form action={toggleAcademicYearStatusAction.bind(null, ta.id)}>
                      <button
                        type="submit"
                        className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                      >
                        {ta.aktif ? "Nonaktifkan" : "Set Aktif"}
                      </button>
                    </form>

                    <form action={deleteAcademicYearAction.bind(null, ta.id)}>
                      <button
                        type="submit"
                        className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition cursor-pointer"
                        title="Hapus Tahun Ajaran"
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
