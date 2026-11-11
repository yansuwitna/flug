import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { AdminLayoutWrapper } from "@/components/layouts/AdminLayoutWrapper";
import { GraduationCap, Trash2, Mail, Shield, BookOpen } from "lucide-react";
import { GuruFormDanImpor } from "@/components/admin/GuruFormDanImpor";
import { hapusGuruAction } from "@/features/academic/manajemen-pengguna";

export const dynamic = "force-dynamic";

export default async function AdminGuruPage() {
  const user = await getCurrentUser();

  const daftarGuru = await prisma.guru.findMany({
    orderBy: { dibuatPada: "desc" },
    include: {
      mapelKelas: {
        include: { kelas: true, mataPelajaran: true },
      },
      misiDibuat: {
        select: { id: true },
      },
    },
  });

  return (
    <AdminLayoutWrapper userName={user?.name}>
      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2.5">
            <GraduationCap className="w-7 h-7 text-cyan-400" /> Manajemen Guru Pengajar
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Kelola daftar akun guru, penugasan mengajar, dan tambah guru via formulir atau impor berkas CSV.
          </p>
        </div>

        {/* Form Tambah Manual & Impor CSV Khusus Guru */}
        <GuruFormDanImpor />

        {/* Tabel / Grid Guru */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-cyan-400" /> Daftar Guru Terdaftar ({daftarGuru.length})
            </h3>
          </div>

          {daftarGuru.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-800/40 border border-slate-700/80 text-xs text-slate-400">
              Belum ada akun guru yang terdaftar. Gunakan formulir di atas untuk menambahkan guru baru.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {daftarGuru.map((g) => (
                <div
                  key={g.id}
                  className="p-5 rounded-3xl bg-slate-800/80 border border-slate-700/80 hover:border-slate-600 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border bg-cyan-950 text-cyan-400 border-cyan-800">
                        GURU
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                        {g.status}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white">{g.nama}</h4>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" /> {g.email}
                    </p>
                    {g.nip && (
                      <p className="text-[11px] font-mono text-cyan-400 mt-1">
                        NIP: {g.nip}
                      </p>
                    )}

                    {/* Informasi Kelas/Mapel yang Diampu */}
                    <div className="mt-4 pt-3 border-t border-slate-700/60 text-xs text-slate-400 space-y-1.5">
                      <div className="flex items-start gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <span>
                          Mengajar:{" "}
                          {g.mapelKelas.length > 0
                            ? g.mapelKelas
                                .map((mk) => `${mk.mataPelajaran.kode} (${mk.kelas.nama})`)
                                .join(", ")
                            : "Belum ada mapel diampu"}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {g.misiDibuat.length} Misi Lab Dibuat
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-700/60 flex items-center justify-end">
                    <form action={hapusGuruAction.bind(null, g.id)}>
                      <button
                        type="submit"
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl transition cursor-pointer"
                        title="Hapus Akun Guru"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayoutWrapper>
  );
}
