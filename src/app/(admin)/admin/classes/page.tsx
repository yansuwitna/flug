import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { AdminLayoutWrapper } from "@/components/layouts/AdminLayoutWrapper";
import { createClassAction, deleteClassAction } from "@/features/academic/actions";
import { Layers, Plus, Trash2, ArrowRight, Users, BookOpen } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ClassesPage() {
  const user = await getCurrentUser();

  const [classes, academicYears] = await Promise.all([
    prisma.schoolClass.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        academicYear: true,
        _count: {
          select: { members: true, classSubjects: true },
        },
      },
    }),
    prisma.academicYear.findMany({
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <AdminLayoutWrapper userName={user?.name}>
      <div className="p-8 max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <h2 className="text-2xl font-black text-white">Manajemen Kelas</h2>
          <p className="text-sm text-slate-400 mt-1">
            Daftar seluruh rombel kelas, siswa terdaftar, dan guru pengampu tiap mata pelajaran.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Tambah Kelas */}
          <div className="p-6 rounded-2xl bg-slate-800 border border-slate-700 h-fit">
            <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-400" /> Buat Kelas Baru
            </h3>

            <form action={createClassAction} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Tahun Ajaran
                </label>
                <select
                  name="academicYearId"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Pilih Tahun Ajaran...</option>
                  {academicYears.map((ay) => (
                    <option key={ay.id} value={ay.id}>
                      {ay.name} {ay.isActive ? "(Aktif)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Nama Kelas
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="misal: X RPL 1, XI IPA 2"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Tingkat / Grade Level (1 - 12)
                </label>
                <input
                  type="number"
                  name="gradeLevel"
                  required
                  min={1}
                  max={12}
                  defaultValue={10}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Jurusan / Program (Opsional)
                </label>
                <input
                  type="text"
                  name="major"
                  placeholder="misal: Rekayasa Perangkat Lunak"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Simpan Kelas
              </button>
            </form>
          </div>

          {/* List Kelas */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" /> Daftar Kelas ({classes.length})
            </h3>

            {classes.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-800/40 border border-slate-700/60 text-center text-sm text-slate-400">
                Belum ada kelas yang terdaftar.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {classes.map((c) => (
                  <div
                    key={c.id}
                    className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:border-indigo-500/50 transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-700">
                          Tingkat {c.gradeLevel}
                        </span>
                        <form action={deleteClassAction.bind(null, c.id)}>
                          <button
                            type="submit"
                            title="Hapus Kelas"
                            className="p-1 text-slate-500 hover:text-rose-400 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </form>
                      </div>

                      <h4 className="text-xl font-bold text-white mt-2">{c.name}</h4>
                      <p className="text-xs text-indigo-400 font-medium">
                        {c.major || "Umum"} • {c.academicYear.name}
                      </p>

                      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-700/60 text-xs text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-emerald-400" /> {c._count.members} Siswa
                        </span>
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-amber-400" /> {c._count.classSubjects} Mapel Diajar
                        </span>
                      </div>
                    </div>

                    <Link
                      href={`/admin/classes/${c.id}`}
                      className="mt-4 pt-3 flex items-center justify-between text-xs font-semibold text-indigo-300 hover:text-indigo-200 transition"
                    >
                      <span>Kelola Anggota & Guru</span>
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
