import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { AdminLayoutWrapper } from "@/components/layouts/AdminLayoutWrapper";
import { Users, Layers, BookOpen, Calendar, ArrowRight, GraduationCap, Database } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  const [totalAdmin, totalGuru, totalSiswa, totalKelas, totalMapel, tahunAktif] = await Promise.all([
    prisma.admin.count(),
    prisma.guru.count(),
    prisma.siswa.count(),
    prisma.kelas.count(),
    prisma.mataPelajaran.count(),
    prisma.tahunAjaran.findFirst({ where: { aktif: true } }),
  ]);

  const totalPengguna = totalAdmin + totalGuru + totalSiswa;

  return (
    <AdminLayoutWrapper userName={user?.name}>
      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-white">Dasbor Administrator</h2>
          <p className="text-sm text-slate-400 mt-1">
            Pantau dan kelola struktur akademik, kelas, mata pelajaran, serta data guru dan siswa.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Tahun Ajaran</span>
              <Calendar className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="text-xl font-bold text-white truncate">
              {tahunAktif ? tahunAktif.nama : "Belum Aktif"}
            </div>
            <p className="text-xs text-emerald-400 mt-2 font-medium">
              {tahunAktif ? "Status: Aktif" : "Perlu diatur"}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Kelas</span>
              <Layers className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">{totalKelas}</div>
            <p className="text-xs text-slate-400 mt-2">Kelas terdaftar</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Mata Pelajaran</span>
              <BookOpen className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">{totalMapel}</div>
            <p className="text-xs text-slate-400 mt-2">Mata pelajaran aktif</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Akun</span>
              <Users className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">{totalPengguna}</div>
            <p className="text-xs text-slate-400 mt-2">
              {totalGuru} Guru • {totalSiswa} Siswa • {totalAdmin} Admin
            </p>
          </div>
        </div>

        {/* Quick Links Menu Berbeda untuk Guru & Siswa */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/admin/guru"
            className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60 hover:border-cyan-500/50 hover:bg-slate-800/80 transition flex items-center justify-between group"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <GraduationCap className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-base group-hover:text-cyan-400 transition">
                  Kelola Guru Pengajar
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Daftar akun guru, NIP, penugasan mata pelajaran, form tambah guru, dan impor CSV guru.
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition shrink-0 ml-4" />
          </Link>

          <Link
            href="/admin/siswa"
            className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60 hover:border-emerald-500/50 hover:bg-slate-800/80 transition flex items-center justify-between group"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base group-hover:text-emerald-400 transition">
                  Kelola Siswa
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Daftar akun siswa, NISN, status kelas, form tambah siswa, dan impor massal CSV siswa.
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition shrink-0 ml-4" />
          </Link>

          <Link
            href="/admin/cadangan"
            className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60 hover:border-purple-500/50 hover:bg-slate-800/80 transition flex items-center justify-between group"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Database className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-white text-base group-hover:text-purple-400 transition">
                  Cadangan & Reset
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Unduh dump SQL, pulihkan database, atau hapus seluruh data siswa/guru.
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition shrink-0 ml-4" />
          </Link>
        </div>
      </div>
    </AdminLayoutWrapper>
  );
}
