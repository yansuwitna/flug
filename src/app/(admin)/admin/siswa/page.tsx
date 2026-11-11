import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { AdminLayoutWrapper } from "@/components/layouts/AdminLayoutWrapper";
import { Users, Trash2, Mail, School } from "lucide-react";
import { SiswaFormDanImpor } from "@/components/admin/SiswaFormDanImpor";
import { hapusSiswaAction } from "@/features/academic/manajemen-pengguna";

export const dynamic = "force-dynamic";

export default async function AdminSiswaPage() {
  const user = await getCurrentUser();

  const [daftarSiswa, daftarKelas] = await Promise.all([
    prisma.siswa.findMany({
      orderBy: { dibuatPada: "desc" },
      include: {
        anggotaKelas: {
          include: { kelas: true },
        },
        _count: {
          select: { percobaanMisi: true, lencanaSiswa: true },
        },
      },
    }),
    prisma.kelas.findMany({
      orderBy: { tingkat: "asc" },
      select: { id: true, nama: true, tingkat: true },
    }),
  ]);

  return (
    <AdminLayoutWrapper userName={user?.name}>
      <div className="p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Users className="w-7 h-7 text-emerald-400" /> Manajemen Siswa
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Kelola data siswa, penempatan rombel/kelas, dan daftarkan siswa via form manual atau impor berkas CSV.
          </p>
        </div>

        {/* Form Tambah Manual & Impor CSV Khusus Siswa */}
        <SiswaFormDanImpor daftarKelas={daftarKelas} />

        {/* Tabel / Grid Siswa */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" /> Daftar Siswa Terdaftar ({daftarSiswa.length})
            </h3>
          </div>

          {daftarSiswa.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-800/40 border border-slate-700/80 text-xs text-slate-400">
              Belum ada akun siswa yang terdaftar. Gunakan formulir di atas untuk menambahkan siswa baru.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {daftarSiswa.map((s) => (
                <div
                  key={s.id}
                  className="p-5 rounded-3xl bg-slate-800/80 border border-slate-700/80 hover:border-slate-600 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border bg-emerald-950 text-emerald-400 border-emerald-800">
                        SISWA
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                        {s.status}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white">{s.nama}</h4>
                    <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" /> {s.email}
                    </p>
                    {s.nisn && (
                      <p className="text-[11px] font-mono text-emerald-400 mt-1">
                        NISN: {s.nisn}
                      </p>
                    )}

                    {/* Informasi Kelas */}
                    <div className="mt-4 pt-3 border-t border-slate-700/60 text-xs text-slate-400 space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <School className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>
                          Kelas:{" "}
                          {s.anggotaKelas.length > 0
                            ? s.anggotaKelas.map((ak) => ak.kelas.nama).join(", ")
                            : "Belum masuk kelas"}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {s._count.percobaanMisi} Percobaan Misi • {s._count.lencanaSiswa} Lencana
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-700/60 flex items-center justify-end">
                    <form action={hapusSiswaAction.bind(null, s.id)}>
                      <button
                        type="submit"
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl transition cursor-pointer"
                        title="Hapus Akun Siswa"
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
