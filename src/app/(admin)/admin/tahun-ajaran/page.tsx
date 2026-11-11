import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { AdminLayoutWrapper } from "@/components/layouts/AdminLayoutWrapper";
import {
  createAcademicYearAction,
  deleteAcademicYearAction,
  toggleAcademicYearStatusAction,
} from "@/features/academic/actions";
import { Calendar, Plus, Trash2, CheckCircle, XCircle } from "lucide-react";

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
      <div className="p-4 md:p-8 max-w-6xl mx-auto w-full">
        <div className="mb-8">
          <h2 className="text-2xl font-black text-white">Tahun Ajaran</h2>
          <p className="text-sm text-slate-400 mt-1">
            Kelola periode kalender pendidikan dan tahun ajaran aktif untuk platform.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Tambah Tahun Ajaran */}
          <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80 shadow-xl h-fit">
            <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" /> Tambah Tahun Ajaran
            </h3>

            <form action={createAcademicYearAction} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Nama Periode
                </label>
                <input
                  type="text"
                  name="nama"
                  required
                  placeholder="Contoh: 2025/2026 Ganjil"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  name="tanggalMulai"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Tanggal Selesai
                </label>
                <input
                  type="date"
                  name="tanggalSelesai"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="aktif"
                  name="aktif"
                  className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400 bg-slate-900 border-slate-700"
                />
                <label htmlFor="aktif" className="text-xs text-slate-300 select-none cursor-pointer">
                  Jadikan Tahun Ajaran Aktif
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition shadow-lg shadow-emerald-600/20 cursor-pointer"
              >
                Simpan Tahun Ajaran
              </button>
            </form>
          </div>

          {/* Daftar Tahun Ajaran */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" /> Daftar Periode Akademik ({daftarTahunAjaran.length})
            </h3>

            {daftarTahunAjaran.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-800/40 border border-slate-700/80 text-center text-xs text-slate-400">
                Belum ada data tahun ajaran. Silakan tambahkan melalui form di samping.
              </div>
            ) : (
              <div className="space-y-3">
                {daftarTahunAjaran.map((ta) => (
                  <div
                    key={ta.id}
                    className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:border-slate-600 transition flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <h4 className="font-bold text-white text-base">{ta.nama}</h4>
                        {ta.aktif ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Aktif
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1">
                            <XCircle className="w-3 h-3" /> Nonaktif
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-400">
                        {new Date(ta.tanggalMulai).toLocaleDateString("id-ID")} s/d{" "}
                        {new Date(ta.tanggalSelesai).toLocaleDateString("id-ID")} •{" "}
                        <span className="text-slate-300 font-medium">{ta._count.kelas} Kelas Terdaftar</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <form action={toggleAcademicYearStatusAction.bind(null, ta.id)}>
                        <button
                          type="submit"
                          className="px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-700/60 transition cursor-pointer"
                        >
                          {ta.aktif ? "Nonaktifkan" : "Set Aktif"}
                        </button>
                      </form>

                      <form action={deleteAcademicYearAction.bind(null, ta.id)}>
                        <button
                          type="submit"
                          className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl transition cursor-pointer"
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
      </div>
    </AdminLayoutWrapper>
  );
}
