import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { TeacherLayoutWrapper } from "@/components/layouts/TeacherLayoutWrapper";
import { Flag, Layers, Users, PlusCircle, ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function TeacherDashboardPage() {
  const user = await getCurrentUser();

  // Ambil kelas-mapel yang diampu oleh guru ini
  const classSubjects = await prisma.classSubject.findMany({
    where: { teacherId: user?.userId },
    include: {
      schoolClass: {
        include: {
          _count: { select: { members: true } },
        },
      },
      subject: {
        include: {
          chapters: true,
        },
      },
      missions: {
        include: {
          chapter: true,
          _count: { select: { challenges: true, attempts: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  const totalMissions = classSubjects.reduce((acc, cs) => acc + cs.missions.length, 0);
  const totalStudents = classSubjects.reduce((acc, cs) => acc + cs.schoolClass._count.members, 0);

  return (
    <TeacherLayoutWrapper userName={user?.name}>
      <div className="p-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-white">Dashboard Pengajar</h2>
            <p className="text-sm text-slate-400 mt-1">
              Rancang mission investigasi berbasis flag dan evaluasi progres pemahaman siswa.
            </p>
          </div>
          <Link
            href="/teacher/missions/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition shadow-lg self-start md:self-center"
          >
            <PlusCircle className="w-4 h-4" /> Buat Mission Baru
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Mission</span>
              <Flag className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">{totalMissions}</div>
            <p className="text-xs text-slate-400 mt-2">Mission yang dirancang</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Kelas Diampu</span>
              <Layers className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">{classSubjects.length} Kelas</div>
            <p className="text-xs text-slate-400 mt-2">Tahun ajaran aktif</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Siswa Terhubung</span>
              <Users className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">{totalStudents} Siswa</div>
            <p className="text-xs text-slate-400 mt-2">Dapat mengakses mission</p>
          </div>
        </div>

        {/* Kelas & Mapel Yang Diampu */}
        <div className="space-y-6">
          <h3 className="font-bold text-white text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" /> Kelas & Mata Pelajaran Diampu
          </h3>

          {classSubjects.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-800/40 border border-slate-700 text-center text-sm text-slate-400">
              Anda belum ditugaskan ke kelas manapun oleh Administrator. Hubungi admin untuk plotting kelas & mata pelajaran.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {classSubjects.map((cs) => (
                <div
                  key={cs.id}
                  className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:border-slate-600 transition"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-700/60">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800/40">
                          {cs.subject.code}
                        </span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800/40">
                          {cs.schoolClass.name}
                        </span>
                      </div>
                      <h4 className="text-xl font-bold text-white">{cs.subject.name}</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        {cs.schoolClass._count.members} Siswa • {cs.subject.chapters.length} Bab Terdaftar
                      </p>
                    </div>

                    <Link
                      href={`/teacher/missions/new?classSubjectId=${cs.id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold transition self-start md:self-center"
                    >
                      <PlusCircle className="w-3.5 h-3.5" /> Tambah Mission untuk Kelas Ini
                    </Link>
                  </div>

                  {/* List Mission Terpasang pada Mapel Ini */}
                  <div>
                    <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                      Mission di Kelas Ini ({cs.missions.length})
                    </h5>

                    {cs.missions.length === 0 ? (
                      <p className="text-xs text-slate-500 italic">
                        Belum ada mission. Klik tombol di atas untuk membuat mission pertama.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {cs.missions.map((m) => {
                          const statusColor =
                            m.status === "PUBLISHED"
                              ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                              : m.status === "ARCHIVED"
                              ? "bg-slate-900 text-slate-400 border-slate-700"
                              : "bg-amber-950 text-amber-400 border-amber-800";

                          return (
                            <Link
                              key={m.id}
                              href={`/teacher/missions/${m.id}/builder`}
                              className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/60 hover:border-cyan-500/50 transition group flex flex-col justify-between"
                            >
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor}`}>
                                    {m.status}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-medium">
                                    {m.difficulty}
                                  </span>
                                </div>
                                <h6 className="font-bold text-sm text-white group-hover:text-cyan-400 transition">
                                  {m.title}
                                </h6>
                                <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                                  Bab: {m.chapter.title}
                                </p>
                              </div>

                              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                                <span>{m._count.challenges} Challenge</span>
                                <span className="flex items-center gap-1 group-hover:text-cyan-400 transition font-medium">
                                  Buka Builder <ArrowRight className="w-3 h-3" />
                                </span>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}
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
