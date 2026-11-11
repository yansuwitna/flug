import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { TeacherLayoutWrapper } from "@/components/layouts/TeacherLayoutWrapper";
import {
  createChallengeAction,
  addClueAction,
  deleteChallengeAction,
  deleteClueAction,
} from "@/features/challenges/actions";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Flag,
  Plus,
  Trash2,
  HelpCircle,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { ChallengeType } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function ChallengesEditorPage({
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
      challenges: {
        orderBy: { orderIndex: "asc" },
        include: {
          clues: { orderBy: { orderIndex: "asc" } },
          options: { orderBy: { orderIndex: "asc" } },
          flagAnswers: true,
        },
      },
    },
  });

  if (!mission) {
    notFound();
  }

  return (
    <TeacherLayoutWrapper userName={user?.name}>
      <div className="p-8 max-w-7xl mx-auto w-full">
        {/* Header Breadcrumb */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <Link
            href={`/teacher/missions/${mission.id}/builder`}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Mission Builder
          </Link>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-emerald-400 bg-emerald-950 border border-emerald-800 px-3 py-1 rounded-full">
              Total Poin Mission: {mission.totalPoints} XP
            </span>
          </div>
        </div>

        {/* Mission Info Banner */}
        <div className="p-6 rounded-2xl bg-slate-800 border border-slate-700 mb-8">
          <span className="text-xs font-bold text-cyan-400">
            {mission.classSubject.subject.name} • {mission.classSubject.schoolClass.name}
          </span>
          <h2 className="text-2xl font-black text-white mt-1">
            Challenge & Flag Editor: {mission.title}
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-3xl">
            Rancang pertanyaan investigasi yang jawabannya tersembunyi di dalam materi. Flag diverifikasi menggunakan HMAC hash aman di server.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Form Tambah Challenge (5 Kolom) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-slate-800 border border-slate-700">
              <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" /> Tambah Challenge Baru
              </h3>

              <form action={createChallengeAction} className="space-y-4">
                <input type="hidden" name="missionId" value={mission.id} />
                <input
                  type="hidden"
                  name="orderIndex"
                  value={mission.challenges.length + 1}
                />

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Tipe Challenge (5 Tipe)
                  </label>
                  <select
                    name="challengeType"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value={ChallengeType.TEXT}>Teks / String Flag (FLAG&#123;...&#125;)</option>
                    <option value={ChallengeType.NUMERIC}>Numerik (Angka Hasil Perhitungan)</option>
                    <option value={ChallengeType.MULTIPLE_CHOICE}>Pilihan Ganda (Multiple Choice)</option>
                    <option value={ChallengeType.SEQUENCE}>Urutan / Langkah (Sequence)</option>
                    <option value={ChallengeType.CASE_STUDY}>Studi Kasus / Analisis Log (Case Study)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Judul Challenge
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder="misal: Menemukan Gateway Utama"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Pertanyaan / Instruksi Tantangan
                  </label>
                  <textarea
                    name="question"
                    required
                    rows={3}
                    placeholder="Tonton video menit ke 02:15, catat alamat IP server dan kirimkan dalam format flag..."
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Poin Reward
                    </label>
                    <input
                      type="number"
                      name="points"
                      defaultValue={100}
                      min={10}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                      Batas Salah
                    </label>
                    <input
                      type="number"
                      name="maxTries"
                      defaultValue={5}
                      min={1}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Kunci Jawaban Flag (Server Hash) */}
                <div className="p-4 rounded-xl bg-slate-950 border border-emerald-800/40 space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <label className="block text-xs font-bold text-emerald-300 uppercase tracking-wider">
                      Kunci Jawaban Flag (Aman di Server)
                    </label>
                  </div>
                  <input
                    type="text"
                    name="flagAnswer"
                    required
                    placeholder="misal: FLAG{192.168.1.1} atau 192.168.1.1"
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />

                  <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        name="isCaseSensitive"
                        className="rounded bg-slate-900 border-slate-700 text-emerald-600"
                      />
                      <span>Case-sensitive</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        name="trimSpaces"
                        defaultChecked
                        className="rounded bg-slate-900 border-slate-700 text-emerald-600"
                      />
                      <span>Trim Spasi</span>
                    </label>
                  </div>
                </div>

                {/* Opsi untuk Multiple Choice / Sequence */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Daftar Opsi (Khusus Pilihan Ganda / Sequence, 1 baris per opsi)
                  </label>
                  <textarea
                    name="options"
                    rows={2}
                    placeholder="Opsi A&#10;Opsi B&#10;Opsi C"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Simpan Challenge
                </button>
              </form>
            </div>
          </div>

          {/* List Challenges & Clue Manager (7 Kolom) */}
          <div className="lg:col-span-7 space-y-6">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Flag className="w-4 h-4 text-emerald-400" /> Daftar Challenge & Petunjuk Clue ({mission.challenges.length})
            </h3>

            {mission.challenges.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-800/40 border border-slate-700 text-center text-xs text-slate-400">
                Belum ada challenge yang dibuat untuk mission ini. Silakan buat di samping.
              </div>
            ) : (
              <div className="space-y-6">
                {mission.challenges.map((ch, idx) => (
                  <div
                    key={ch.id}
                    className="p-6 rounded-2xl bg-slate-800/90 border border-slate-700 shadow-md space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                            #{idx + 1} {ch.challengeType}
                          </span>
                          <span className="text-xs font-bold text-white">{ch.points} XP</span>
                          <span className="text-xs text-slate-400">• Max {ch.maxTries}x Coba</span>
                        </div>
                        <h4 className="text-lg font-bold text-white mt-1">{ch.title}</h4>
                        <p className="text-xs text-slate-300 mt-1">{ch.question}</p>
                      </div>

                      <form action={deleteChallengeAction.bind(null, ch.id, mission.id)}>
                        <button
                          type="submit"
                          title="Hapus Challenge"
                          className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </form>
                    </div>

                    {/* Clue Section */}
                    <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5" /> Petunjuk Bertingkat ({ch.clues.length})
                        </span>
                      </div>

                      {/* List Clue Yang Sudah Ada */}
                      {ch.clues.length > 0 && (
                        <div className="space-y-2">
                          {ch.clues.map((clue) => (
                            <div
                              key={clue.id}
                              className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs"
                            >
                              <div>
                                <span className="font-semibold text-slate-200">
                                  {clue.title}:
                                </span>{" "}
                                <span className="text-slate-400">{clue.hintText}</span>
                                <span className="ml-2 text-[10px] text-amber-400 font-medium">
                                  (Penalti: -{clue.penaltyXp} XP)
                                </span>
                              </div>

                              <form action={deleteClueAction.bind(null, clue.id, mission.id)}>
                                <button
                                  type="submit"
                                  className="text-slate-500 hover:text-rose-400 ml-2"
                                  title="Hapus Clue"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </form>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Form Tambah Clue Bertingkat */}
                      <form action={addClueAction} className="pt-2 border-t border-slate-800 space-y-2">
                        <input type="hidden" name="challengeId" value={ch.id} />
                        <input type="hidden" name="missionId" value={mission.id} />
                        <input
                          type="hidden"
                          name="orderIndex"
                          value={ch.clues.length + 1}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <input
                            type="text"
                            name="title"
                            required
                            placeholder="Judul Clue (misal: Clue 1)"
                            className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                          />
                          <input
                            type="text"
                            name="hintText"
                            required
                            placeholder="Isi petunjuk bantuan..."
                            className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white md:col-span-2"
                          />
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <label className="text-[11px] text-slate-400">Penalti XP:</label>
                            <input
                              type="number"
                              name="penaltyXp"
                              defaultValue={10}
                              min={0}
                              className="w-20 px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white"
                            />
                          </div>

                          <button
                            type="submit"
                            className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-medium transition cursor-pointer"
                          >
                            + Tambah Clue
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </TeacherLayoutWrapper>
  );
}
