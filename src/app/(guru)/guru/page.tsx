import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { TeacherLayoutWrapper } from "@/components/layouts/TeacherLayoutWrapper";
import { Flag, Layers, Users, PlusCircle, ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function GuruDashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const [mapelKelas, totalMisi] = await Promise.all([
    prisma.mapelKelas.findMany({
      where: user.role === "ADMIN" ? {} : { idGuru: user.userId },
      include: {
        kelas: {
          include: {
            _count: { select: { anggota: true } },
          },
        },
        mataPelajaran: {
          include: {
            bab: true,
          },
        },
        misi: {
          include: {
            _count: { select: { tantangan: true, percobaan: true } },
          },
        },
      },
    }),
    prisma.misi.count({
      where: user.role === "ADMIN" ? {} : { idPembuat: user.userId },
    }),
  ]);

  const totalSiswa = mapelKelas.reduce((acc, mk) => acc + mk.kelas._count.anggota, 0);

  return (
    <TeacherLayoutWrapper userName={user.name}>
      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-white">Dasbor Guru</h2>
            <p className="text-sm text-slate-400 mt-1">
              Selamat datang kembali, {user.name}! Kelola misi investigasi CTF dan pantau pengerjaan siswa.
            </p>
          </div>

          <Link
            href="/guru/misi/baru"
            className="flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-2xl transition shadow-lg shadow-emerald-600/20 cursor-pointer w-fit"
          >
            <PlusCircle className="w-4 h-4" /> Buat Misi Baru
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Misi Dibuat</span>
              <Flag className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">{totalMisi}</div>
            <p className="text-xs text-slate-400 mt-2">Misi pembelajaran aktif</p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Kelas Diampu</span>
              <Layers className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">{mapelKelas.length}</div>
            <p className="text-xs text-slate-400 mt-2">Rombel terhubung</p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Siswa Diajar</span>
              <Users className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">{totalSiswa}</div>
            <p className="text-xs text-slate-400 mt-2">Total siswa di kelas Anda</p>
          </div>
        </div>

        {/* List Kelas Diampu */}
        <div className="space-y-4">
          <h3 className="font-bold text-white text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" /> Mata Pelajaran & Kelas yang Anda Ampu
          </h3>

          {mapelKelas.length === 0 ? (
            <div className="p-8 rounded-3xl bg-slate-800/40 border border-slate-700/80 text-center text-xs text-slate-400">
              Anda belum ditugaskan mengampu kelas apapun oleh Administrator.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mapelKelas.map((mk) => (
                <div
                  key={mk.id}
                  className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80 hover:border-slate-600 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                        {mk.mataPelajaran.kode}
                      </span>
                      <span className="text-xs font-semibold text-white">
                        {mk.kelas.nama}
                      </span>
                    </div>

                    <h4 className="font-bold text-white text-base mt-2">{mk.mataPelajaran.nama}</h4>
                    <p className="text-xs text-slate-400 mt-1">
                      {mk.kelas._count.anggota} Siswa • {mk.mataPelajaran.bab.length} Bab Terdaftar
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-700/60 text-xs text-slate-400 flex items-center justify-between">
                      <span>{mk.misi.length} Misi Diterbitkan</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-3 border-t border-slate-700/60">
                    <Link
                      href={`/guru/misi`}
                      className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition"
                    >
                      Buka Bank Misi <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </TeacherLayoutWrapper>
  );
}
