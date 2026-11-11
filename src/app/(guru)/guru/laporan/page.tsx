import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { TeacherLayoutWrapper } from "@/components/layouts/TeacherLayoutWrapper";
import { BarChart3, Download, Layers, Flag, ArrowRight } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function GuruLaporanPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const daftarMisi = await prisma.misi.findMany({
    where: user.role === "ADMIN" ? {} : { idPembuat: user.userId },
    orderBy: { dibuatPada: "desc" },
    include: {
      mapelKelas: {
        include: {
          kelas: {
            include: {
              _count: { select: { anggota: true } },
            },
          },
          mataPelajaran: true,
        },
      },
      tantangan: true,
      percobaan: {
        where: { status: "SELESAI" },
        include: {
          hasil: true,
        },
      },
    },
  });

  return (
    <TeacherLayoutWrapper userName={user.name}>
      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
        <div>
          <h2 className="text-2xl font-black text-white">Laporan & Rekapitulasi Pembelajaran</h2>
          <p className="text-sm text-slate-400 mt-1">
            Unduh rekapitulasi nilai siswa dan pantau tingkat ketuntasan asesmen berbasis CTF.
          </p>
        </div>

        {daftarMisi.length === 0 ? (
          <div className="p-12 rounded-3xl bg-slate-800/40 border border-slate-700/80 text-center text-xs text-slate-400">
            Belum ada misi yang dibuat atau diselesaikan oleh siswa.
          </div>
        ) : (
          <div className="space-y-4">
            {daftarMisi.map((m) => {
              const totalSiswaKelas = m.mapelKelas.kelas._count.anggota;
              const totalSelesai = m.percobaan.length;
              const persentaseKetuntasan =
                totalSiswaKelas > 0
                  ? Math.min(100, Math.round((totalSelesai / totalSiswaKelas) * 100))
                  : 0;

              return (
                <div
                  key={m.id}
                  className="p-6 rounded-3xl bg-slate-800/80 border border-slate-700/80 hover:border-slate-600 transition flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800">
                        {m.mapelKelas.mataPelajaran.kode}
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">
                        Kelas: {m.mapelKelas.kelas.nama}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white">{m.judul}</h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                      <span>{m.tantangan.length} Tantangan Flag</span>
                      <span>•</span>
                      <span>
                        Ketuntasan: {totalSelesai} dari {totalSiswaKelas} Siswa ({persentaseKetuntasan}%)
                      </span>
                    </div>

                    <div className="w-full max-w-md h-1.5 rounded-full bg-slate-900 overflow-hidden mt-2">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${persentaseKetuntasan}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <a
                      href={`/api/export/mission/${m.id}`}
                      download
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition flex items-center gap-2 shadow-md"
                    >
                      <Download className="w-4 h-4" /> Unduh CSV
                    </a>

                    <Link
                      href={`/guru/misi/${m.id}/results`}
                      className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs rounded-xl transition flex items-center gap-2"
                    >
                      Buka Rincian <ArrowRight className="w-4 h-4" />
                    </Link>
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
