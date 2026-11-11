import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { TeacherLayoutWrapper } from "@/components/layouts/TeacherLayoutWrapper";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Trophy,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
  AlertCircle,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function GuruMisiResultsPage({
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
        include: {
          petunjuk: true,
          kirimanJawaban: true,
        },
      },
      percobaan: {
        include: {
          siswa: true,
          hasil: true,
          kirimanJawaban: true,
          penggunaanPetunjuk: true,
        },
        orderBy: { selesaiPada: "desc" },
      },
    },
  });

  if (!misi) notFound();

  // Analisis statistik tantangan
  const statistikTantangan = misi.tantangan.map((ch, idx) => {
    const totalSubmissions = ch.kirimanJawaban.length;
    const correctSubmissions = ch.kirimanJawaban.filter((s) => s.benar).length;
    const tingkatKeberhasilan =
      totalSubmissions > 0
        ? Math.round((correctSubmissions / totalSubmissions) * 100)
        : 0;

    return {
      nomor: idx + 1,
      judul: ch.judul,
      poin: ch.poin,
      totalSubmissions,
      correctSubmissions,
      tingkatKeberhasilan,
    };
  });

  const totalSiswaMengerjakan = new Set(misi.percobaan.map((a) => a.idSiswa)).size;
  const percobaanSelesai = misi.percobaan.filter((a) => a.status === "SELESAI");
  const rataRataSkor =
    percobaanSelesai.length > 0
      ? Math.round(
          percobaanSelesai.reduce((sum, a) => sum + (a.hasil?.totalSkor || 0), 0) /
            percobaanSelesai.length
        )
      : 0;

  return (
    <TeacherLayoutWrapper userName={user.name}>
      <div className="p-4 md:p-8 max-w-6xl mx-auto w-full space-y-8">
        <div>
          <Link
            href="/guru/misi"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition mb-3"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Bank Misi
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">{misi.judul}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Laporan Hasil Siswa • Kelas {misi.mapelKelas.kelas.nama} • {misi.mapelKelas.mataPelajaran.nama}
              </p>
            </div>

            <a
              href={`/api/export/mission/${misi.id}`}
              download
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition shadow-md w-fit cursor-pointer"
            >
              <Download className="w-4 h-4" /> Ekspor Nilai (CSV)
            </a>
          </div>
        </div>

        {/* Ringkasan Skor & Peserta */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Siswa Partisipan</span>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">{totalSiswaMengerjakan}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Siswa telah mencoba misi ini</p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Percobaan Tuntas</span>
            <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">{percobaanSelesai.length}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Sesi selesai dikerjakan</p>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Rata-Rata Nilai</span>
            <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-2">{rataRataSkor} Poin</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Dari maksimal {misi.totalPoin} poin</p>
          </div>
        </div>

        {/* Rekapitulasi Tingkat Kesulitan Tantangan */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400" /> Analitik Pemecahan Flag
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {statistikTantangan.map((st) => (
              <div
                key={st.nomor}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Soal #{st.nomor}</span>
                    <span className="font-semibold text-amber-600 dark:text-amber-400">+{st.poin} XP</span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm mt-1">{st.judul}</h4>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                    <span>Keberhasilan:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{st.tingkatKeberhasilan}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${st.tingkatKeberhasilan}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabel Rekap Hasil Attempt Siswa */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-600 dark:text-cyan-400" /> Riwayat Pengerjaan Siswa ({misi.percobaan.length})
          </h3>

          {misi.percobaan.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
              Belum ada siswa yang mengerjakan misi ini.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Siswa</th>
                    <th className="pb-3 font-semibold">Percobaan</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold">Flag Terpecahkan</th>
                    <th className="pb-3 font-semibold">Clue Dipakai</th>
                    <th className="pb-3 font-semibold">Skor Akhir</th>
                    <th className="pb-3 font-semibold text-right">Waktu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {misi.percobaan.map((att) => {
                    const solvedCount = att.kirimanJawaban.filter((s) => s.benar).length;
                    const clueCount = att.penggunaanPetunjuk.length;
                    const score = att.hasil?.totalSkor || 0;

                    return (
                      <tr key={att.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="py-4">
                          <div className="font-bold text-slate-900 dark:text-white text-sm">{att.siswa.nama}</div>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">{att.siswa.email}</span>
                        </td>
                        <td className="py-4 font-mono font-semibold text-slate-700 dark:text-slate-300">
                          Ke-{att.nomorPercobaan}
                        </td>
                        <td className="py-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              att.status === "SELESAI"
                                ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                                : "bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800"
                            }`}
                          >
                            {att.status}
                          </span>
                        </td>
                        <td className="py-4 font-semibold text-slate-900 dark:text-white">
                          {solvedCount} / {misi.tantangan.length}
                        </td>
                        <td className="py-4 text-slate-500 dark:text-slate-400 font-mono">
                          {clueCount} petunjuk
                        </td>
                        <td className="py-4 font-bold text-amber-600 dark:text-amber-400 text-sm">
                          {score} XP
                        </td>
                        <td className="py-4 text-right text-slate-500 dark:text-slate-400">
                          {att.selesaiPada
                            ? new Date(att.selesaiPada).toLocaleString("id-ID")
                            : "Sedang Berjalan"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </TeacherLayoutWrapper>
  );
}
