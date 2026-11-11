"use client";

import { useState } from "react";
import { submitFlagAction, unlockClueAction } from "@/features/challenges/engine";
import { completeAttemptAction } from "@/features/progress/actions";
import {
  Flag,
  Video,
  ExternalLink,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Send,
  Trophy,
  BookOpen,
  ArrowLeft,
} from "lucide-react";
import { TipeKonten, TipeTantangan } from "@prisma/client";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

interface LearningContentItem {
  id: string;
  contentType: TipeKonten;
  title: string;
  body: string | null;
  mediaUrl: string | null;
  orderIndex: number;
}

interface ClueItem {
  id: string;
  title: string;
  hintText: string;
  penaltyXp: number;
  orderIndex?: number;
}

interface ChallengeOptionItem {
  id: string;
  optionText: string;
  orderIndex?: number;
}

interface ChallengeItem {
  id: string;
  title: string;
  question: string;
  challengeType: TipeTantangan;
  points: number;
  orderIndex: number;
  maxTries?: number;
  clues: ClueItem[];
  options: ChallengeOptionItem[];
}

interface MissionWorkspaceProps {
  attemptId: string;
  missionId: string;
  missionTitle: string;
  missionDescription: string;
  learningContents: LearningContentItem[];
  challenges: ChallengeItem[];
  solvedChallengeIds: string[];
  initialUnlockedClueIds: string[];
}

export function MissionWorkspace({
  attemptId,
  missionTitle,
  missionDescription,
  learningContents,
  challenges,
  solvedChallengeIds: initialSolved,
  initialUnlockedClueIds,
}: MissionWorkspaceProps) {
  // Mobile active tab: 'content' | 'challenge'
  const [activeTab, setActiveTab] = useState<"content" | "challenge">("content");

  // Solved challenges state
  const [solvedSet, setSolvedSet] = useState<Set<string>>(new Set(initialSolved));

  // Flag input state per challenge
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [submittingMap, setSubmittingMap] = useState<Record<string, boolean>>({});
  const [feedbackMap, setFeedbackMap] = useState<
    Record<string, { isCorrect: boolean; message: string }>
  >({});

  // Clue unlocked map: clueId -> boolean
  const [unlockedClues, setUnlockedClues] = useState<Set<string>>(
    new Set(initialUnlockedClueIds)
  );

  const totalChallenges = challenges.length;
  const totalSolved = solvedSet.size;
  const progressPercent =
    totalChallenges > 0 ? Math.round((totalSolved / totalChallenges) * 100) : 0;

  const handleInputChange = (challengeId: string, val: string) => {
    setInputs((prev) => ({ ...prev, [challengeId]: val }));
  };

  const handleSubmitFlag = async (challengeId: string) => {
    const rawFlag = inputs[challengeId]?.trim();
    if (!rawFlag) return;

    setSubmittingMap((prev) => ({ ...prev, [challengeId]: true }));
    try {
      const res = await submitFlagAction(attemptId, challengeId, rawFlag);
      setFeedbackMap((prev) => ({
        ...prev,
        [challengeId]: {
          isCorrect: !!res.isCorrect,
          message: res.message,
        },
      }));

      if (res.isCorrect) {
        setSolvedSet((prev) => new Set([...prev, challengeId]));
      }
    } catch {
      setFeedbackMap((prev) => ({
        ...prev,
        [challengeId]: {
          isCorrect: false,
          message: "Gagal mengirim flag. Coba sesaat lagi.",
        },
      }));
    } finally {
      setSubmittingMap((prev) => ({ ...prev, [challengeId]: false }));
    }
  };

  const handleUnlockClue = async (clueId: string, penalty: number) => {
    if (unlockedClues.has(clueId)) return;

    const confirmUnlock = window.confirm(
      `Buka petunjuk ini akan mengurangi ${penalty} XP dari tantangan ini. Apakah Anda yakin?`
    );
    if (!confirmUnlock) return;

    const res = await unlockClueAction(attemptId, clueId);
    if (res.success) {
      setUnlockedClues((prev) => new Set([...prev, clueId]));
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Top Header Workspace */}
      <header className="px-6 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            href="/siswa"
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition"
            title="Kembali ke Dasbor"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              Investigasi Aktif
            </span>
            <h1 className="text-lg md:text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
              {missionTitle}
            </h1>
          </div>
        </div>

        {/* Progress & Selesai Button */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Progres Flag:</span>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {totalSolved} / {totalChallenges} Selesai ({progressPercent}%)
              </p>
            </div>
            <div className="w-24 h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <ThemeToggle />

          <form action={completeAttemptAction.bind(null, attemptId)}>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5" /> Selesaikan Misi
            </button>
          </form>
        </div>
      </header>

      {/* Mobile Tab Switcher */}
      <div className="flex lg:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-[73px] z-10">
        <button
          onClick={() => setActiveTab("content")}
          className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition flex items-center justify-center gap-2 ${
            activeTab === "content"
              ? "border-cyan-500 text-cyan-600 dark:text-cyan-400"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <BookOpen className="w-4 h-4" /> Materi & Video
        </button>
        <button
          onClick={() => setActiveTab("challenge")}
          className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition flex items-center justify-center gap-2 ${
            activeTab === "challenge"
              ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Flag className="w-4 h-4" /> Tantangan Flag ({totalSolved}/{totalChallenges})
        </button>
      </div>

      {/* Main Split Screen Workspace */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Panel Kiri: Video & Materi */}
        <section
          className={`lg:col-span-7 space-y-6 ${
            activeTab === "content" ? "block" : "hidden lg:block"
          }`}
        >
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 dark:text-white mb-2">Briefing Skenario</h2>
            <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {missionDescription}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Video className="w-4 h-4 text-cyan-600 dark:text-cyan-400" /> Sumber Materi Investigasi
            </h3>

            {learningContents.length === 0 ? (
              <div className="p-8 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
                Tidak ada materi tambahan untuk misi ini.
              </div>
            ) : (
              learningContents.map((content) => (
                <div
                  key={content.id}
                  className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{content.title}</h4>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {content.contentType}
                    </span>
                  </div>

                  {content.mediaUrl && (
                    <div className="rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3.5">
                      <a
                        href={content.mediaUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-cyan-600 dark:text-cyan-400 hover:underline font-medium"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Buka Tautan Media Eksternal
                      </a>
                    </div>
                  )}

                  {content.body && (
                    <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-slate-50/70 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
                      {content.body}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* Panel Kanan: Tantangan Flag & Petunjuk Clue */}
        <section
          className={`lg:col-span-5 space-y-6 ${
            activeTab === "challenge" ? "block" : "hidden lg:block"
          }`}
        >
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2 mb-4">
              <Flag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Tantangan Investigasi
            </h3>

            {challenges.length === 0 ? (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
                Belum ada challenge yang ditambahkan guru.
              </div>
            ) : (
              <div className="space-y-5">
                {challenges.map((ch, idx) => {
                  const isSolved = solvedSet.has(ch.id);
                  const isSubmitting = !!submittingMap[ch.id];
                  const feedback = feedbackMap[ch.id];

                  return (
                    <div
                      key={ch.id}
                      className={`p-5 rounded-2xl border transition-all ${
                        isSolved
                          ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-500/40"
                          : "bg-slate-50/60 dark:bg-slate-950/80 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                    >
                      {/* Challenge Header */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          Tantangan #{idx + 1}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {ch.points} XP
                          </span>
                          {isSolved && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                              <CheckCircle2 className="w-3 h-3" /> Terpecahkan
                            </span>
                          )}
                        </div>
                      </div>

                      <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{ch.title}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                        {ch.question}
                      </p>

                      {/* Multiple Choice Options Preview */}
                      {ch.options.length > 0 && (
                        <div className="mb-4 space-y-1.5 p-3 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                          <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                            Pilihan Jawaban:
                          </span>
                          {ch.options.map((opt) => (
                            <div
                              key={opt.id}
                              onClick={() => !isSolved && handleInputChange(ch.id, opt.optionText)}
                              className={`p-2 rounded-xl text-xs font-mono cursor-pointer transition ${
                                inputs[ch.id] === opt.optionText
                                  ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-600/50"
                                  : "bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                              }`}
                            >
                              {opt.optionText}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Clues Accordion */}
                      {ch.clues.length > 0 && (
                        <div className="mb-4 space-y-2">
                          {ch.clues.map((clue) => {
                            const isClueUnlocked = unlockedClues.has(clue.id);

                            return (
                              <div
                                key={clue.id}
                                className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
                              >
                                {isClueUnlocked ? (
                                  <div>
                                    <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold mb-1">
                                      <HelpCircle className="w-3.5 h-3.5" />
                                      <span>{clue.title}:</span>
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-300">{clue.hintText}</p>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-between">
                                    <span className="text-slate-500 dark:text-slate-400 font-medium">
                                      {clue.title} (-{clue.penaltyXp} XP)
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleUnlockClue(clue.id, clue.penaltyXp)
                                      }
                                      className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/80 hover:bg-amber-100 dark:hover:bg-amber-900 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 rounded-lg text-[11px] font-semibold transition cursor-pointer"
                                    >
                                      Buka Clue
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Flag Input / Submission */}
                      {!isSolved ? (
                        <div className="space-y-2">
                          <label className="block text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Masukkan Flag Jawaban:
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={inputs[ch.id] || ""}
                              onChange={(e) => handleInputChange(ch.id, e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSubmitFlag(ch.id);
                              }}
                              placeholder="misal: FLAG{jawaban_kamu}"
                              className="flex-1 px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-slate-400"
                            />
                            <button
                              type="button"
                              disabled={isSubmitting || !inputs[ch.id]?.trim()}
                              onClick={() => handleSubmitFlag(ch.id)}
                              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                            >
                              {isSubmitting ? (
                                <span>Cek...</span>
                              ) : (
                                <>
                                  <span>Submit</span>
                                  <Send className="w-3 h-3" />
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span>Flag berhasil ditangkap! Poin telah ditambahkan.</span>
                        </div>
                      )}

                      {/* Feedback Submission */}
                      {feedback && !isSolved && (
                        <div
                          className={`mt-3 p-3 rounded-xl text-xs flex items-start gap-2 border ${
                            feedback.isCorrect
                              ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                              : "bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300"
                          }`}
                        >
                          {feedback.isCorrect ? (
                            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                          ) : (
                            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                          )}
                          <span>{feedback.message}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
