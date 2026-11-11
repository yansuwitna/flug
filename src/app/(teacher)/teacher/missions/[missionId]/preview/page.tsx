import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { notFound } from "next/navigation";
import { ArrowLeft, Flag, Video, ExternalLink } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function MissionPreviewPage({
  params,
}: {
  params: Promise<{ missionId: string }>;
}) {
  const { missionId } = await params;
  await getCurrentUser();

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
          clues: { orderBy: { orderIndex: "asc" } },
        },
      },
    },
  });

  if (!mission) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Bar Preview Mode */}
      <header className="px-6 py-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/teacher/missions/${mission.id}/builder`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Builder
          </Link>
          <span className="text-slate-600">|</span>
          <span className="text-xs font-bold text-cyan-400 bg-cyan-950/80 border border-cyan-800/40 px-2.5 py-0.5 rounded-full">
            Pratinjau Sudut Pandang Siswa
          </span>
        </div>

        <div className="text-xs text-slate-400">
          Status: <strong className="text-white">{mission.status}</strong>
        </div>
      </header>

      {/* Main Workspace Preview Layout (Split View Desktop) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Panel Kiri: Video & Materi Pembelajaran */}
        <section className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2 mb-2 text-xs font-medium text-slate-400">
              <span>{mission.classSubject.subject.name}</span>
              <span>•</span>
              <span>Bab {mission.chapter.orderIndex}: {mission.chapter.title}</span>
            </div>
            <h1 className="text-2xl font-black text-white">{mission.title}</h1>
            <p className="text-xs text-slate-300 mt-2 leading-relaxed">
              {mission.description}
            </p>
          </div>

          {/* Konten Materi / Video */}
          <div className="space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Video className="w-4 h-4 text-cyan-400" /> Materi & Petunjuk Investigasi
            </h3>

            {mission.learningContent.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center text-xs text-slate-400">
                Belum ada konten materi yang dimasukkan ke mission ini.
              </div>
            ) : (
              mission.learningContent.map((content) => (
                <div
                  key={content.id}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-sm">{content.title}</h4>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                      {content.contentType}
                    </span>
                  </div>

                  {content.mediaUrl && (
                    <div className="rounded-xl overflow-hidden bg-slate-950 border border-slate-800 p-3">
                      <a
                        href={content.mediaUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Buka Media: {content.mediaUrl}
                      </a>
                    </div>
                  )}

                  {content.body && (
                    <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/40 p-4 rounded-xl border border-slate-800/40">
                      {content.body}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* Panel Kanan: Skenario Challenge & Input Flag */}
        <section className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
            <h3 className="font-bold text-white text-base flex items-center gap-2 mb-4">
              <Flag className="w-4 h-4 text-emerald-400" /> Tantangan Flag ({mission.challenges.length})
            </h3>

            {mission.challenges.length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-400">
                Belum ada challenge yang ditambahkan.
              </div>
            ) : (
              <div className="space-y-4">
                {mission.challenges.map((ch, idx) => (
                  <div
                    key={ch.id}
                    className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400">
                        Challenge #{idx + 1}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {ch.points} Poin
                      </span>
                    </div>

                    <h5 className="font-bold text-white text-sm">{ch.title}</h5>
                    <p className="text-xs text-slate-300">{ch.question}</p>

                    {/* Preview Flag Input Dummy */}
                    <div className="pt-2">
                      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        Kirim Flag Jawaban
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          disabled
                          placeholder="FLAG{jawaban_rahasia}"
                          className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-400 cursor-not-allowed"
                        />
                        <button
                          disabled
                          className="px-3 py-2 bg-emerald-700 text-white rounded-lg text-xs font-semibold opacity-70 cursor-not-allowed"
                        >
                          Submit
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
