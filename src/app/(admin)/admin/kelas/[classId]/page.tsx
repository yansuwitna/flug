import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { AdminLayoutWrapper } from "@/components/layouts/AdminLayoutWrapper";
import {
  assignTeacherToClassAction,
  addStudentToClassAction,
  removeClassMemberAction,
} from "@/features/academic/actions";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UserPlus, BookOpen, Users, Trash2, GraduationCap } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDetailKelasPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;
  const user = await getCurrentUser();

  const [kelas, guruTersedia, mapelTersedia, siswaTersedia] =
    await Promise.all([
      prisma.kelas.findUnique({
        where: { id: classId },
        include: {
          tahunAjaran: true,
          mapelKelas: {
            include: {
              mataPelajaran: true,
              guru: true,
            },
          },
          anggota: {
            include: {
              siswa: true,
            },
          },
        },
      }),
      prisma.guru.findMany({
        where: { status: "AKTIF" },
        orderBy: { nama: "asc" },
      }),
      prisma.mataPelajaran.findMany({
        orderBy: { nama: "asc" },
      }),
      prisma.siswa.findMany({
        where: { status: "AKTIF" },
        orderBy: { nama: "asc" },
      }),
    ]);

  if (!kelas) {
    notFound();
  }

  const idSiswaTerdaftar = new Set(kelas.anggota.map((m) => m.idSiswa));
  const siswaBelumMasuk = siswaTersedia.filter((s) => !idSiswaTerdaftar.has(s.id));

  return (
    <AdminLayoutWrapper userName={user?.name}>
      <div className="p-4 md:p-8 max-w-6xl mx-auto w-full space-y-8">
        <div>
          <Link
            href="/admin/kelas"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition mb-3"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Kelas
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">{kelas.nama}</h2>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  Tingkat {kelas.tingkat}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {kelas.jurusan || "Program Reguler"} • {kelas.anggota.length} Siswa Terdaftar • {kelas.mapelKelas.length} Mata Pelajaran
              </p>
            </div>

            <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-sm w-fit">
              Tahun Ajaran: {kelas.tahunAjaran.nama}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Kolom Kiri: Penugasan Guru & Mapel */}
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-cyan-600 dark:text-cyan-400" /> Tetapkan Guru Pengampu Mapel
              </h3>

              <form action={assignTeacherToClassAction} className="space-y-4">
                <input type="hidden" name="idKelas" value={kelas.id} />

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Mata Pelajaran
                  </label>
                  <select
                    name="idMataPelajaran"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="">Pilih Mata Pelajaran...</option>
                    {mapelTersedia.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.kode} - {s.nama}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Guru Pengampu
                  </label>
                  <select
                    name="idGuru"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="">Pilih Guru Pengajar...</option>
                    {guruTersedia.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nama} ({t.email})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" /> Simpan Penugasan Guru
                </button>
              </form>
            </div>

            {/* List Mapel & Guru di Kelas Ini */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Mata Pelajaran & Guru Terdaftar ({kelas.mapelKelas.length})
              </h4>
              {kelas.mapelKelas.length === 0 ? (
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
                  Belum ada penugasan guru di kelas ini.
                </div>
              ) : (
                kelas.mapelKelas.map((mk) => (
                  <div
                    key={mk.id}
                    className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm"
                  >
                    <div>
                      <h5 className="font-bold text-slate-900 dark:text-white text-sm">
                        {mk.mataPelajaran.nama} ({mk.mataPelajaran.kode})
                      </h5>
                      <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-0.5">
                        Pengampu: {mk.guru.nama}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Kolom Kanan: Keanggotaan Siswa */}
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Daftarkan Siswa ke Kelas
              </h3>

              <form action={addStudentToClassAction} className="space-y-4">
                <input type="hidden" name="idKelas" value={kelas.id} />

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Pilih Siswa
                  </label>
                  <select
                    name="idSiswa"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">
                      {siswaBelumMasuk.length > 0
                        ? "Pilih siswa yang belum masuk kelas..."
                        : "Semua siswa telah terdaftar"}
                    </option>
                    {siswaBelumMasuk.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nama} ({s.email})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={siswaBelumMasuk.length === 0}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" /> Masukkan Siswa ke Kelas
                </button>
              </form>
            </div>

            {/* List Siswa di Kelas */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Daftar Siswa di {kelas.nama} ({kelas.anggota.length})
              </h4>
              {kelas.anggota.length === 0 ? (
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
                  Belum ada siswa yang dimasukkan ke kelas ini.
                </div>
              ) : (
                kelas.anggota.map((m) => (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                        {m.siswa.nama.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{m.siswa.nama}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{m.siswa.email}</p>
                      </div>
                    </div>

                    <form action={removeClassMemberAction.bind(null, m.id, kelas.id)}>
                      <button
                        type="submit"
                        title="Keluarkan Siswa"
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayoutWrapper>
  );
}
