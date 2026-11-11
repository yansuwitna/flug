import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { AdminLayoutWrapper } from "@/components/layouts/AdminLayoutWrapper";
import { createClassAction, deleteClassAction } from "@/features/academic/actions";
import { Layers, Plus, Trash2, ArrowRight, Users, BookOpen } from "lucide-react";
import Link from "next/link";

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
      <div className="p-4 md:p-8 max-w-6xl mx-auto w-full">
        <div className="mb-8">
          <h2 className="text-2xl font-black text-white">Manajemen Rombel & Kelas</h2>
          <p className="text-sm text-slate-400 mt-1">
            Kelola rombongan belajar, alokasi tingkat kelas, dan jurusan siswa.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Tambah Kelas */}
          <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80 shadow-xl h-fit">
            <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-400" /> Buat Kelas Baru
            </h3>

            <form action={createClassAction} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Tahun Ajaran
                </label>
                <select
                  name="idTahunAjaran"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Pilih Tahun Ajaran...</option>
                  {daftarTahunAjaran.map((ta) => (
                    <option key={ta.id} value={ta.id}>
                      {ta.nama} {ta.aktif ? "(Aktif)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Nama Kelas
                </label>
                <input
                  type="text"
                  name="nama"
                  required
                  placeholder="Contoh: X RPL 1"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Tingkat Kelas
                </label>
                <select
                  name="tingkat"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="10">Kelas 10 (Fase E)</option>
                  <option value="11">Kelas 11 (Fase F)</option>
                  <option value="12">Kelas 12 (Fase F Lanjutan)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Program / Jurusan (Opsional)
                </label>
                <input
                  type="text"
                  name="jurusan"
                  placeholder="Contoh: Rekayasa Perangkat Lunak"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition shadow-lg shadow-emerald-600/20 cursor-pointer"
              >
                Simpan Kelas Baru
              </button>
            </form>
          </div>

          {/* List Kelas */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" /> Daftar Rombongan Belajar ({daftarKelas.length})
            </h3>

            {daftarKelas.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-800/40 border border-slate-700/80 text-center text-xs text-slate-400">
                Belum ada data kelas yang dibuat. Silakan tambahkan melalui form di samping.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {daftarKelas.map((k) => (
                  <div
                    key={k.id}
                    className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:border-slate-600 transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-800">
                          Tingkat {k.tingkat}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {k.tahunAjaran.nama}
                        </span>
                      </div>

                      <h4 className="text-lg font-bold text-white">{k.nama}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {k.jurusan || "Program Reguler / Umum"}
                      </p>

                      <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center gap-4 text-xs text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-emerald-400" /> {k._count.anggota} Siswa
                        </span>
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-amber-400" /> {k._count.mapelKelas} Mapel
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-700/60 flex items-center justify-between">
                      <Link
                        href={`/admin/kelas/${k.id}`}
                        className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition"
                      >
                        Kelola Kelas <ArrowRight className="w-3.5 h-3.5" />
                      </Link>

                      <form action={deleteClassAction.bind(null, k.id)}>
                        <button
                          type="submit"
                          className="p-1.5 text-slate-500 hover:text-rose-400 transition cursor-pointer"
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
      </div>
    </AdminLayoutWrapper>
  );
}
