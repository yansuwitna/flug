import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { TeacherLayoutWrapper } from "@/components/layouts/TeacherLayoutWrapper";
import { createMissionAction } from "@/features/missions/actions";
import { Flag, ArrowLeft, PlusCircle } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function GuruMisiBaruPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const daftarMapelKelas = await prisma.mapelKelas.findMany({
    where: user.role === "ADMIN" ? {} : { idGuru: user.userId },
    include: {
      kelas: true,
      mataPelajaran: {
        include: {
          bab: {
            orderBy: { nomorUrut: "asc" },
          },
        },
      },
    },
  });

  return (
    <TeacherLayoutWrapper userName={user.name}>
      <div className="p-4 md:p-8 max-w-4xl mx-auto w-full">
        <Link
          href="/guru/misi"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Bank Misi
        </Link>

        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-600 rounded-2xl text-white shadow-md">
              <Flag className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">Buat Misi Investigasi Baru</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Langkah 1: Tentukan identitas misi, kelas tujuan, dan sasaran kompetensi.
              </p>
            </div>
          </div>

          <form action={createMissionAction} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Kelas & Mata Pelajaran
                </label>
                <select
                  name="idMapelKelas"
                  required
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Pilih Rombel & Mapel...</option>
                  {daftarMapelKelas.map((mk) => (
                    <option key={mk.id} value={mk.id}>
                      {mk.kelas.nama} — {mk.mataPelajaran.nama} ({mk.mataPelajaran.kode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Bab Pembelajaran
                </label>
                <select
                  name="idBab"
                  required
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Pilih Bab Terkait...</option>
                  {daftarMapelKelas.flatMap((mk) =>
                    mk.mataPelajaran.bab.map((b) => (
                      <option key={b.id} value={b.id}>
                        {mk.mataPelajaran.kode}: Bab {b.nomorUrut} - {b.judul}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Judul Misi
              </label>
              <input
                type="text"
                name="judul"
                required
                placeholder="Contoh: Investigasi Serangan ARP Spoofing di Jaringan Lokal"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Skenario & Deskripsi Kasus
              </label>
              <textarea
                name="deskripsi"
                required
                rows={4}
                placeholder="Jelaskan latar belakang kasus, peran siswa sebagai analis keamanan, dan misi investigasi yang harus dipecahkan..."
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Tingkat Kesulitan
                </label>
                <select
                  name="tingkatKesulitan"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="MUDAH">Mudah (Beginner)</option>
                  <option value="SEDANG">Sedang (Intermediate)</option>
                  <option value="SULIT">Sulit (Advanced)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Batas Waktu (Menit, Opsional)
                </label>
                <input
                  type="number"
                  name="durasiMenit"
                  placeholder="Contoh: 45"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Maksimal Percobaan
                </label>
                <input
                  type="number"
                  name="maksPercobaan"
                  defaultValue={3}
                  min={1}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-2xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-5 h-5" /> Simpan & Lanjutkan ke Penyusunan Materi
            </button>
          </form>
        </div>
      </div>
    </TeacherLayoutWrapper>
  );
}
