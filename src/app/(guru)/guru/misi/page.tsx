import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { TeacherLayoutWrapper } from "@/components/layouts/TeacherLayoutWrapper";
import { Flag, PlusCircle, ArrowRight, Eye, Trophy, Trash2, Edit } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { deleteMissionAction } from "@/features/missions/actions";

export const dynamic = "force-dynamic";

export default async function GuruMisiPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const daftarMisi = await prisma.misi.findMany({
    where: user.role === "ADMIN" ? {} : { idPembuat: user.userId },
    orderBy: { dibuatPada: "desc" },
    include: {
      mapelKelas: {
        include: {
          kelas: true,
          mataPelajaran: true,
        },
      },
      bab: true,
      _count: {
        select: { tantangan: true, kontenBelajar: true, percobaan: true },
      },
    },
  });

  return (
    <TeacherLayoutWrapper userName={user.name}>
      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Kelola Misi Investigasi (CTF)</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Rancang tantangan berburu bendera (flag hunting), susun materi, dan publikasikan tugas lab.
            </p>
          </div>

          <Link
            href="/guru/misi/baru"
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-2xl transition shadow-md w-fit"
          >
            <PlusCircle className="w-4 h-4" /> Buat Misi Baru
          </Link>
        </div>

        {daftarMisi.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center mx-auto">
              <Flag className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Belum Ada Misi Dibuat</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
                Mulai bangun tantangan gamifikasi pertama Anda dengan menyusun materi dan memasang flag tantangan.
              </p>
            </div>
            <Link
              href="/guru/misi/baru"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition shadow-sm"
            >
              <PlusCircle className="w-4 h-4" /> Mulai Buat Misi
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {daftarMisi.map((m) => {
              const statusBadge =
                m.status === "DITERBITKAN"
                  ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                  : m.status === "DRAF"
                  ? "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700";

              return (
                <div
                  key={m.id}
                  className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col justify-between shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${statusBadge}`}>
                        {m.status}
                      </span>
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                        {m.tingkatKesulitan}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1">{m.judul}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {m.mapelKelas.mataPelajaran.nama} • {m.mapelKelas.kelas.nama}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>{m._count.kontenBelajar} Materi</span>
                      <span>{m._count.tantangan} Tantangan Flag</span>
                      <span className="font-semibold text-amber-600 dark:text-amber-400">{m.totalPoin} Poin</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/guru/misi/${m.id}/builder`}
                        className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                        title="Edit Materi & Skenario"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>

                      <Link
                        href={`/guru/misi/${m.id}/preview`}
                        className="p-2 text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 rounded-xl transition"
                        title="Pratinjau Misi"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      <Link
                        href={`/guru/misi/${m.id}/results`}
                        className="p-2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl transition"
                        title="Rekap Pengerjaan Siswa"
                      >
                        <Trophy className="w-4 h-4" />
                      </Link>
                    </div>

                    <form action={deleteMissionAction.bind(null, m.id)}>
                      <button
                        type="submit"
                        className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition cursor-pointer"
                        title="Hapus Misi"
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
