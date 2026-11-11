import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { TeacherLayoutWrapper } from "@/components/layouts/TeacherLayoutWrapper";
import {
  updateMissionStatusAction,
  addLearningContentAction,
  deleteLearningContentAction,
} from "@/features/missions/actions";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Flag,
  Video,
  Plus,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { ContentType, MissionStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function MissionBuilderPage({
  params,
}: {
  params: Promise<{ missionId: string }>;
}) {
  const { missionId } = await params;
  const user = await getCurrentUser();

  const mission = await prisma.mission.findUnique({
    where: { id: missionId },
    include: {
      classSubject: {
        include: {
          schoolClass: true,
          subject: true,
        },
      },
      chapter: true,
      learningContent: {
        orderBy: { orderIndex: "asc" },
      },
      challenges: {
        orderBy: { orderIndex: "asc" },
        include: {
          clues: true,
          flagAnswers: true,
        },
      },
    },
  });

  if (!mission) {
    notFound();
  }

  const isPublished = mission.status === MissionStatus.PUBLISHED;

  return (
    <TeacherLayoutWrapper userName={user?.name}>
      <div className="p-8 max-w-7xl mx-auto w-full">
        {/* Top Breadcrumb & Status */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <Link
            href="/teacher/missions"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Mission
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href={`/teacher/missions/${mission.id}/preview`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold transition border border-slate-700"
            >
              <Eye className="w-3.5 h-3.5 text-cyan-400" /> Pratinjau Siswa
            </Link>

            {isPublished ? (
              <form action={updateMissionStatusAction.bind(null, mission.id, MissionStatus.DRAFT)}>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-900/60 hover:bg-amber-800 text-amber-200 border border-amber-700/60 rounded-xl text-xs font-semibold transition"
                >
                  Ubah ke Draft
                </button>
              </form>
            ) : (
              <form action={updateMissionStatusAction.bind(null, mission.id, MissionStatus.PUBLISHED)}>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition shadow-lg flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> Publikasikan Mission
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Mission Summary Card */}
        <div className="p-6 rounded-2xl bg-slate-800 border border-slate-700 mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                isPublished
                  ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                  : "bg-amber-950 text-amber-400 border-amber-800"
              }`}
            >
              {mission.status}
            </span>
            <span className="text-xs font-bold text-cyan-400">
              {mission.classSubject.subject.name} • {mission.classSubject.schoolClass.name}
            </span>
            <span className="text-xs text-slate-400">• Bab {mission.chapter.orderIndex}: {mission.chapter.title}</span>
          </div>

          <h2 className="text-2xl font-black text-white">{mission.title}</h2>
          <p className="text-xs text-slate-300 mt-2 max-w-3xl leading-relaxed">
            {mission.description}
          </p>
        </div>

        {/* Builder Workspace: Learning Content & Challenges Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* SISI KIRI: LEARNING CONTENT */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-800 border border-slate-700">
              <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
                <Video className="w-4 h-4 text-cyan-400" /> Tambah Konten Pembelajaran
              </h3>

              <form action={addLearningContentAction} className="space-y-4">
                <input type="hidden" name="missionId" value={mission.id} />

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Tipe Konten
                  </label>
                  <select
                    name="contentType"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value={ContentType.VIDEO_EMBED}>Video Embed (YouTube / URL)</option>
                    <option value={ContentType.TEXT}>Teks Penjelasan / Modul Bacaan</option>
                    <option value={ContentType.LINK}>Tautan Eksternal / Referensi</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Judul Konten
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder="misal: Video Penjelasan Subnetting"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    URL Media / Video Embed (Jika Ada)
                  </label>
                  <input
                    type="url"
                    name="mediaUrl"
                    placeholder="https://www.youtube.com/embed/..."
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Uraian Teks / Catatan Pembelajaran
                  </label>
                  <textarea
                    name="body"
                    rows={3}
                    placeholder="Tuliskan materi pendukung atau petunjuk eksplorasi..."
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Simpan Materi Pembelajaran
                </button>
              </form>
            </div>

            {/* List Learning Content */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Materi Terpasang ({mission.learningContent.length})
              </h4>

              {mission.learningContent.length === 0 ? (
                <div className="p-6 rounded-xl bg-slate-800/40 border border-slate-700 text-center text-xs text-slate-400">
                  Belum ada materi pembelajaran yang ditambahkan. Siswa butuh materi/video untuk menemukan jawaban flag.
                </div>
              ) : (
                mission.learningContent.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-start justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                          {c.contentType}
                        </span>
                        <h5 className="font-bold text-white text-sm">{c.title}</h5>
                      </div>
                      {c.mediaUrl && (
                        <p className="text-[11px] text-cyan-400/90 truncate max-w-sm mt-0.5">
                          {c.mediaUrl}
                        </p>
                      )}
                      {c.body && (
                        <p className="text-xs text-slate-300 mt-2 line-clamp-2">{c.body}</p>
                      )}
                    </div>

                    <form action={deleteLearningContentAction.bind(null, c.id, mission.id)}>
                      <button
                        type="submit"
                        className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                        title="Hapus Materi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* SISI KANAN: CHALLENGES & FLAG OVERVIEW */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-800 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Flag className="w-4 h-4 text-emerald-400" /> Tantangan & Flag Investigasi ({mission.challenges.length})
                </h3>
                <Link
                  href={`/teacher/missions/${mission.id}/challenges`}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Kelola Challenge
                </Link>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/60 text-xs text-slate-300 mb-4">
                <p>
                  Setiap challenge memuat pertanyaan investigasi, clue bertingkat dengan penalti poin, dan hash kunci jawaban flag aman.
                </p>
              </div>

              {/* List Tantangan */}
              {mission.challenges.length === 0 ? (
                <div className="p-8 rounded-xl bg-slate-800/40 border border-slate-700 text-center text-xs text-slate-400">
                  <AlertCircle className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                  Belum ada challenge. Fase 4 akan melengkapi Challenge Editor lengkap dengan 5 tipe soal dan sistem hashing flag.
                </div>
              ) : (
                <div className="space-y-3">
                  {mission.challenges.map((ch, idx) => (
                    <div
                      key={ch.id}
                      className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/80 flex items-start justify-between"
                    >
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                          Tantangan #{idx + 1} • {ch.points} Poin
                        </span>
                        <h5 className="font-bold text-white text-sm mt-1">{ch.title}</h5>
                        <p className="text-xs text-slate-400 mt-0.5">{ch.question}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </TeacherLayoutWrapper>
  );
}
