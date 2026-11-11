import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { TeacherLayoutWrapper } from "@/components/layouts/TeacherLayoutWrapper";
import { deleteMissionAction } from "@/features/missions/actions";
import { Flag, Plus, Trash2, Eye, Edit3 } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function TeacherMissionsIndexPage() {
  const user = await getCurrentUser();

  const missions = await prisma.mission.findMany({
    where: {
      creatorId: user?.userId,
    },
    include: {
      classSubject: {
        include: {
          schoolClass: true,
          subject: true,
        },
      },
      chapter: true,
      _count: {
        select: {
          learningContent: true,
          challenges: true,
          attempts: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <TeacherLayoutWrapper userName={user?.name}>
      <div className="p-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-black text-white">Kelola Mission Pembelajaran</h2>
            <p className="text-sm text-slate-400 mt-1">
              Rancang materi, susun tantangan flag investigasi, dan atur penerbitan mission.
            </p>
          </div>
          <Link
            href="/teacher/missions/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition shadow-lg self-start md:self-center"
          >
            <Plus className="w-4 h-4" /> Buat Mission Baru
          </Link>
        </div>

        {missions.length === 0 ? (
          <div className="p-12 rounded-2xl bg-slate-800/40 border border-slate-700/60 text-center max-w-xl mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center mx-auto mb-4">
              <Flag className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Belum Ada Mission</h3>
            <p className="text-xs text-slate-400 mb-6">
              Mulai buat modul pembelajaran interaktif dan tantangan investigasi flag pertama Anda.
            </p>
            <Link
              href="/teacher/missions/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition"
            >
              <Plus className="w-4 h-4" /> Buat Mission Baru
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {missions.map((m) => {
              const statusColor =
                m.status === "PUBLISHED"
                  ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                  : m.status === "ARCHIVED"
                  ? "bg-slate-900 text-slate-400 border-slate-700"
                  : "bg-amber-950 text-amber-400 border-amber-800";

              return (
                <div
                  key={m.id}
                  className="p-6 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:border-slate-600 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${statusColor}`}>
                        {m.status}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {m.difficulty}
                      </span>
                    </div>

                    <div className="text-[11px] font-bold text-cyan-400 mb-1">
                      {m.classSubject.subject.name} • {m.classSubject.schoolClass.name}
                    </div>

                    <h4 className="text-lg font-bold text-white leading-snug">{m.title}</h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{m.description}</p>

                    <div className="mt-4 pt-3 border-t border-slate-700/60 grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 rounded-lg bg-slate-900/60">
                        <span className="block font-bold text-white text-sm">
                          {m._count.learningContent}
                        </span>
                        <span className="text-[10px] text-slate-400">Materi</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900/60">
                        <span className="block font-bold text-emerald-400 text-sm">
                          {m._count.challenges}
                        </span>
                        <span className="text-[10px] text-slate-400">Challenge</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-900/60">
                        <span className="block font-bold text-amber-400 text-sm">
                          {m._count.attempts}
                        </span>
                        <span className="text-[10px] text-slate-400">Attempt</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/teacher/missions/${m.id}/builder`}
                        className="p-2 bg-slate-700 hover:bg-cyan-600 text-slate-200 hover:text-white rounded-lg transition"
                        title="Buka Mission Builder"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Link>
                      <Link
                        href={`/teacher/missions/${m.id}/preview`}
                        className="p-2 bg-slate-700 hover:bg-emerald-600 text-slate-200 hover:text-white rounded-lg transition"
                        title="Preview Sebagai Siswa"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>

                    <form action={deleteMissionAction.bind(null, m.id)}>
                      <button
                        type="submit"
                        className="p-2 text-slate-500 hover:text-rose-400 transition"
                        title="Hapus Mission"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </TeacherLayoutWrapper>
  );
}
