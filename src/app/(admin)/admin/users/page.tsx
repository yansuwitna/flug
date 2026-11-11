import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { AdminLayoutWrapper } from "@/components/layouts/AdminLayoutWrapper";
import { Users, Shield, GraduationCap, School } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const user = await getCurrentUser();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      classMembers: {
        include: { schoolClass: true },
      },
      classSubjects: {
        include: { schoolClass: true, subject: true },
      },
    },
  });

  return (
    <AdminLayoutWrapper userName={user?.name}>
      <div className="p-8 max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <h2 className="text-2xl font-black text-white">Pengguna & Hak Akses</h2>
          <p className="text-sm text-slate-400 mt-1">
            Daftar seluruh akun Administrator, Guru, dan Siswa pada platform FLAG HUNTER.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" /> Daftar Pengguna Terdaftar ({users.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((u) => {
              const roleBadge =
                u.role === "ADMIN"
                  ? "bg-rose-950 text-rose-400 border-rose-800"
                  : u.role === "TEACHER"
                  ? "bg-cyan-950 text-cyan-400 border-cyan-800"
                  : "bg-emerald-950 text-emerald-400 border-emerald-800";

              return (
                <div
                  key={u.id}
                  className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:border-slate-600 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${roleBadge}`}>
                        {u.role}
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                        {u.status}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white">{u.name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{u.email}</p>

                    {/* Info Tambahan Relasi */}
                    <div className="mt-4 pt-3 border-t border-slate-700/60 text-xs text-slate-400 space-y-1">
                      {u.role === "STUDENT" && (
                        <div className="flex items-center gap-1.5">
                          <School className="w-3.5 h-3.5 text-emerald-400" />
                          <span>
                            Kelas:{" "}
                            {u.classMembers.length > 0
                              ? u.classMembers.map((cm) => cm.schoolClass.name).join(", ")
                              : "Belum masuk kelas"}
                          </span>
                        </div>
                      )}

                      {u.role === "TEACHER" && (
                        <div className="flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                          <span>
                            Mengajar:{" "}
                            {u.classSubjects.length > 0
                              ? u.classSubjects.map((cs) => `${cs.subject.code} (${cs.schoolClass.name})`).join(", ")
                              : "Belum ada mapel diampu"}
                          </span>
                        </div>
                      )}

                      {u.role === "ADMIN" && (
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Shield className="w-3.5 h-3.5 text-rose-400" />
                          <span>Hak Akses Penuh Sistem</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AdminLayoutWrapper>
  );
}
