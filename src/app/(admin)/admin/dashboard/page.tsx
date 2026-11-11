import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { AdminLayoutWrapper } from "@/components/layouts/AdminLayoutWrapper";
import { Users, Layers, BookOpen, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  const [usersCount, classesCount, subjectsCount, activeYear] = await Promise.all([
    prisma.user.count(),
    prisma.schoolClass.count(),
    prisma.subject.count(),
    prisma.academicYear.findFirst({ where: { isActive: true } }),
  ]);

  return (
    <AdminLayoutWrapper userName={user?.name}>
      <div className="p-8 max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-white">Dashboard Administrator</h2>
          <p className="text-sm text-slate-400 mt-1">
            Pantau dan kelola struktur akademik, kelas, mata pelajaran, dan akun pengguna.
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
              {activeYear ? activeYear.name : "Belum Aktif"}
            </div>
            <p className="text-xs text-emerald-400 mt-2 font-medium">
              {activeYear ? "Status: Aktif" : "Perlu diatur"}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Kelas</span>
              <Layers className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">{classesCount}</div>
            <p className="text-xs text-slate-400 mt-2">Kelas terdaftar</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Mata Pelajaran</span>
              <BookOpen className="w-5 h-5 text-amber-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">{subjectsCount}</div>
            <p className="text-xs text-slate-400 mt-2">Mapel aktif</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Pengguna</span>
              <Users className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">{usersCount}</div>
            <p className="text-xs text-slate-400 mt-2">Admin, Guru, Siswa</p>
          </div>
        </div>

        {/* Quick Actions */}
        <h3 className="text-lg font-bold text-white mb-4">Navigasi Modul Akademik</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/admin/academic-years"
            className="p-6 rounded-2xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/50 transition group"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-white group-hover:text-cyan-400 transition">Kelola Tahun Ajaran</h4>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 group-hover:text-cyan-400 transition" />
            </div>
            <p className="text-xs text-slate-400">
              Buat semester ganjil/genap dan tentukan tahun ajaran yang sedang aktif.
            </p>
          </Link>

          <Link
            href="/admin/classes"
            className="p-6 rounded-2xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500/50 transition group"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-white group-hover:text-indigo-400 transition">Kelola Kelas & Siswa</h4>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 group-hover:text-indigo-400 transition" />
            </div>
            <p className="text-xs text-slate-400">
              Atur kelas, daftarkan anggota siswa, serta plot penugasan guru pengampu.
            </p>
          </Link>

          <Link
            href="/admin/subjects"
            className="p-6 rounded-2xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 transition group"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-white group-hover:text-amber-400 transition">Mata Pelajaran & Bab</h4>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 group-hover:text-amber-400 transition" />
            </div>
            <p className="text-xs text-slate-400">
              Kelola kurikulum mata pelajaran dan struktur bab/topik pembelajaran.
            </p>
          </Link>
        </div>
      </div>
    </AdminLayoutWrapper>
  );
}
