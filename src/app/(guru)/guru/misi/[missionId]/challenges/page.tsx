import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { TeacherLayoutWrapper } from "@/components/layouts/TeacherLayoutWrapper";
import {
  addChallengeAction,
  deleteChallengeAction,
  addClueAction,
  deleteClueAction,
} from "@/features/challenges/actions";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Flag,
  Plus,
  Trash2,
  HelpCircle,
  Eye,
  Key,
} from "lucide-react";
import { TipeTantangan } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function GuruMisiChallengesPage({
  params,
}: {
  params: Promise<{ missionId: string }>;
}) {
  const { missionId } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const misi = await prisma.misi.findUnique({
    where: { id: missionId },
    include: {
      mapelKelas: {
        include: {
          kelas: true,
          mataPelajaran: true,
        },
      },
      bab: true,
      tantangan: {
        orderBy: { nomorUrut: "asc" },
        include: {
          petunjuk: { orderBy: { nomorUrut: "asc" } },
          opsi: { orderBy: { nomorUrut: "asc" } },
        },
      },
    },
  });

  if (!misi) notFound();

  return (
    <TeacherLayoutWrapper userName={user.name}>
      <div className="p-4 md:p-8 max-w-6xl mx-auto w-full space-y-8">
        <div>
          <Link
            href={`/guru/misi/${misi.id}/builder`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition mb-3"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Susunan Materi
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">{misi.judul}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Langkah 2: Tambahkan pertanyaan investigasi dan pasang kunci flag rahasia.
              </p>
            </div>

            <Link
              href={`/guru/misi/${misi.id}/preview`}
              className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs rounded-xl transition flex items-center gap-1.5 shadow-md w-fit"
            >
              <Eye className="w-4 h-4" /> Pratinjau Misi
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Tambah Soal Tantangan */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm h-fit">
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Tambah Soal Tantangan
            </h3>

            <form action={addChallengeAction} className="space-y-4">
              <input type="hidden" name="idMisi" value={misi.id} />

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Tipe Tantangan
                </label>
                <select
                  name="tipeTantangan"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value={TipeTantangan.TEKS}>Teks Singkat / Token Flag</option>
                  <option value={TipeTantangan.NUMERIK}>Numerik (Angka / Port / IP)</option>
                  <option value={TipeTantangan.PILIHAN_GANDA}>Pilihan Ganda (Multiple Choice)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Judul Soal
                </label>
                <input
                  type="text"
                  name="judul"
                  required
                  placeholder="Contoh: Menemukan Port Rentan"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Pertanyaan / Instruksi Lab
                </label>
                <textarea
                  name="pertanyaan"
                  required
                  rows={3}
                  placeholder="Berapakah nomor port yang terbuka pada target log?"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Poin Reward (XP)
                </label>
                <input
                  type="number"
                  name="poin"
                  defaultValue={100}
                  min={10}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Kunci Jawaban Flag Aman */}
              <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-slate-950/80 border border-amber-200 dark:border-slate-700/80 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
                  <Key className="w-3.5 h-3.5" />
                  <span>Kunci Jawaban Flag (Tersimpan Aman/Hashed)</span>
                </div>

                <input
                  type="text"
                  name="flagJawaban"
                  required
                  placeholder="Contoh: FLAG{analisis_pcap_sukses}"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="hurufBesarKecil"
                      className="rounded text-emerald-600 focus:ring-emerald-500 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                    />
                    <span>Sensitif Huruf Besar/Kecil</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition shadow-md cursor-pointer"
              >
                Simpan Tantangan Flag
              </button>
            </form>
          </div>

          {/* List Soal Tantangan & Petunjuk */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Flag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Daftar Soal Investigasi ({misi.tantangan.length})
            </h3>

            {misi.tantangan.length === 0 ? (
              <div className="p-8 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
                Belum ada soal tantangan. Silakan tambahkan pertanyaan dan kunci flag melalui form di samping.
              </div>
            ) : (
              <div className="space-y-4">
                {misi.tantangan.map((ch, idx) => (
                  <div
                    key={ch.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <span className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-base">{ch.judul}</h4>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{ch.pertanyaan}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs">
                            <span className="font-semibold text-amber-600 dark:text-amber-400">+{ch.poin} XP</span>
                            <span className="text-slate-300 dark:text-slate-600">•</span>
                            <span className="text-slate-500 dark:text-slate-400">Tipe: {ch.tipeTantangan}</span>
                          </div>
                        </div>
                      </div>

                      <form action={deleteChallengeAction.bind(null, ch.id, misi.id)}>
                        <button
                          type="submit"
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
                          title="Hapus Tantangan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </form>
                    </div>

                    {/* Petunjuk (Clues) */}
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                          Petunjuk Bantuan ({ch.petunjuk.length})
                        </span>
                      </div>

                      {ch.petunjuk.map((clue) => (
                        <div
                          key={clue.id}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-semibold text-slate-900 dark:text-white">{clue.judul}: </span>
                            <span className="text-slate-600 dark:text-slate-400">{clue.teksPetunjuk}</span>
                            <span className="text-[10px] text-rose-600 dark:text-rose-400 ml-2 font-mono">
                              (Penalti -{clue.penaltiXp} XP)
                            </span>
                          </div>

                          <form action={deleteClueAction.bind(null, clue.id, misi.id)}>
                            <button
                              type="submit"
                              className="text-slate-500 hover:text-rose-400 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </form>
                        </div>
                      ))}

                      {/* Form Cepat Tambah Petunjuk */}
                      <form action={addClueAction} className="flex items-center gap-2 pt-1">
                        <input type="hidden" name="idTantangan" value={ch.id} />
                        <input type="hidden" name="idMisi" value={misi.id} />
                        <input
                          type="text"
                          name="judul"
                          placeholder="Judul Clue (Petunjuk 1)"
                          required
                          className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs w-1/3 focus:outline-none"
                        />
                        <input
                          type="text"
                          name="teksPetunjuk"
                          placeholder="Isi petunjuk..."
                          required
                          className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs flex-1 focus:outline-none"
                        />
                        <input
                          type="number"
                          name="penaltiXp"
                          placeholder="Penalti"
                          defaultValue={25}
                          className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs w-20 focus:outline-none font-mono"
                        />
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs rounded-lg transition cursor-pointer"
                        >
                          Tambah
                        </button>
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
