import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { AdminLayoutWrapper } from "@/components/layouts/AdminLayoutWrapper";
import {
  assignTeacherToClassAction,
  addStudentToClassAction,
  removeClassMemberAction,
} from "@/features/academic/actions";
import { notFound } from "next/navigation";
import { ArrowLeft, UserPlus, BookOpen, Users, Trash2, GraduationCap } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ClassDetailPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;
  const user = await getCurrentUser();

  const [schoolClass, availableTeachers, availableSubjects, availableStudents] =
    await Promise.all([
      prisma.schoolClass.findUnique({
        where: { id: classId },
        include: {
          academicYear: true,
          classSubjects: {
            include: {
              subject: true,
              teacher: true,
            },
          },
          members: {
            include: {
              user: true,
            },
          },
        },
      }),
      prisma.user.findMany({
        where: { role: "TEACHER", status: "ACTIVE" },
        orderBy: { name: "asc" },
      }),
      prisma.subject.findMany({
        orderBy: { name: "asc" },
      }),
      prisma.user.findMany({
        where: { role: "STUDENT", status: "ACTIVE" },
        orderBy: { name: "asc" },
      }),
    ]);

  if (!schoolClass) {
    notFound();
  }

  // Filter siswa yang belum masuk di kelas ini
  const enrolledStudentIds = new Set(schoolClass.members.map((m) => m.userId));
  const unassignedStudents = availableStudents.filter(
    (student) => !enrolledStudentIds.has(student.id)
  );

  return (
    <AdminLayoutWrapper userName={user?.name}>
      <div className="p-8 max-w-7xl mx-auto w-full">
        <Link
          href="/admin/classes"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Kelas
        </Link>

        {/* Header Kelas */}
        <div className="p-6 rounded-2xl bg-slate-800 border border-slate-700 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800">
                Tingkat {schoolClass.gradeLevel}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {schoolClass.academicYear.name}
              </span>
            </div>
            <h2 className="text-2xl font-black text-white">{schoolClass.name}</h2>
            <p className="text-xs text-slate-400 mt-1">
              {schoolClass.major || "Program Umum"} • {schoolClass.members.length} Siswa Terdaftar • {schoolClass.classSubjects.length} Mata Pelajaran
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bagian 1: Pengampu Mata Pelajaran (Teachers) */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-800 border border-slate-700">
              <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" /> Plot Guru Mata Pelajaran
              </h3>

              <form action={assignTeacherToClassAction} className="space-y-4">
                <input type="hidden" name="classId" value={schoolClass.id} />

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Mata Pelajaran
                  </label>
                  <select
                    name="subjectId"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">Pilih Mata Pelajaran...</option>
                    {availableSubjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        [{s.code}] {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Guru Pengampu
                  </label>
                  <select
                    name="teacherId"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">Pilih Guru...</option>
                    {availableTeachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.email})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" /> Tetapkan Guru Pengampu
                </button>
              </form>
            </div>

            {/* List Mata Pelajaran di Kelas */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Mata Pelajaran & Guru Terdaftar ({schoolClass.classSubjects.length})
              </h4>
              {schoolClass.classSubjects.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700 text-center text-xs text-slate-400">
                  Belum ada penugasan guru di kelas ini.
                </div>
              ) : (
                schoolClass.classSubjects.map((cs) => (
                  <div
                    key={cs.id}
                    className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-bold text-white">
                        [{cs.subject.code}] {cs.subject.name}
                      </p>
                      <p className="text-xs text-amber-400 mt-0.5 flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5" /> Pengajar: {cs.teacher.name}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Bagian 2: Anggota Siswa (Students) */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-800 border border-slate-700">
              <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" /> Daftarkan Siswa ke Kelas
              </h3>

              <form action={addStudentToClassAction} className="space-y-4">
                <input type="hidden" name="classId" value={schoolClass.id} />

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Pilih Siswa
                  </label>
                  <select
                    name="userId"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">
                      {unassignedStudents.length > 0
                        ? "Pilih siswa yang belum terdaftar..."
                        : "Semua siswa terdaftar di kelas"}
                    </option>
                    {unassignedStudents.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.email})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={unassignedStudents.length === 0}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" /> Masukkan Siswa ke Kelas
                </button>
              </form>
            </div>

            {/* List Siswa di Kelas */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Daftar Siswa di {schoolClass.name} ({schoolClass.members.length})
              </h4>
              {schoolClass.members.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700 text-center text-xs text-slate-400">
                  Belum ada siswa yang dimasukkan ke kelas ini.
                </div>
              ) : (
                schoolClass.members.map((m) => (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-800/40 text-emerald-400 flex items-center justify-center font-bold text-xs">
                        {m.user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{m.user.name}</p>
                        <p className="text-[11px] text-slate-400">{m.user.email}</p>
                      </div>
                    </div>

                    <form action={removeClassMemberAction.bind(null, m.id, schoolClass.id)}>
                      <button
                        type="submit"
                        title="Keluarkan Siswa"
                        className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayoutWrapper>
  );
}
