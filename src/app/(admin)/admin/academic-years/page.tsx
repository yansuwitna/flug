import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { AdminLayoutWrapper } from "@/components/layouts/AdminLayoutWrapper";
import {
  createAcademicYearAction,
  toggleAcademicYearActiveAction,
  deleteAcademicYearAction,
} from "@/features/academic/actions";
import { Calendar, Plus, CheckCircle, Trash2, Power } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AcademicYearsPage() {
  const user = await getCurrentUser();
  const academicYears = await prisma.academicYear.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { classes: true },
      },
    },
  });

  return (
    <AdminLayoutWrapper userName={user?.name}>
      <div className="p-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-black text-white">Tahun Ajaran</h2>
            <p className="text-sm text-slate-400 mt-1">
              Atur kalender akademik dan tentukan periode semester aktif.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Tambah Tahun Ajaran */}
          <div className="p-6 rounded-2xl bg-slate-800 border border-slate-700 h-fit">
            <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" /> Tambah Tahun Ajaran
            </h3>

            <form action={createAcademicYearAction} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Nama Periode / Tahun Ajaran
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="misal: 2025/2026 Genap"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  name="startDate"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Tanggal Berakhir
                </label>
                <input
                  type="date"
                  name="endDate"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-slate-900 border-slate-700"
                />
                <label htmlFor="isActive" className="text-xs text-slate-300 cursor-pointer">
                  Jadikan periode aktif sekarang
                </label>
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Simpan Tahun Ajaran
              </button>
            </form>
          </div>

          {/* List Tahun Ajaran */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" /> Daftar Periode Akademik ({academicYears.length})
            </h3>

            {academicYears.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-800/40 border border-slate-700/60 text-center text-sm text-slate-400">
                Belum ada tahun ajaran yang dibuat.
              </div>
            ) : (
              <div className="space-y-3">
                {academicYears.map((ay) => (
                  <div
                    key={ay.id}
                    className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="text-base font-bold text-white">{ay.name}</h4>
                        {ay.isActive && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                            <CheckCircle className="w-3 h-3" /> Aktif
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(ay.startDate).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}{" "}
                        —{" "}
                        {new Date(ay.endDate).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}{" "}
                        • <span className="text-slate-300 font-medium">{ay._count.classes} Kelas Terdaftar</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <form action={toggleAcademicYearActiveAction.bind(null, ay.id)}>
                        <button
                          type="submit"
                          title={ay.isActive ? "Nonaktifkan" : "Set sebagai Aktif"}
                          className={`p-2 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                            ay.isActive
                              ? "bg-emerald-900/40 text-emerald-300 hover:bg-emerald-900"
                              : "bg-slate-700 text-slate-300 hover:bg-emerald-600 hover:text-white"
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                          <span>{ay.isActive ? "Aktif" : "Aktifkan"}</span>
                        </button>
                      </form>

                      <form action={deleteAcademicYearAction.bind(null, ay.id)}>
                        <button
                          type="submit"
                          title="Hapus"
                          className="p-2 bg-slate-700/50 hover:bg-rose-900/50 text-slate-400 hover:text-rose-300 rounded-lg transition"
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
