import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { TeacherLayoutWrapper } from "@/components/layouts/TeacherLayoutWrapper";
import { createMissionAction } from "@/features/missions/actions";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function NewMissionPage({
  searchParams,
}: {
  searchParams: Promise<{ classSubjectId?: string }>;
}) {
  const user = await getCurrentUser();
  const { classSubjectId } = await searchParams;

  // Ambil kelas-mapel yang diampu oleh guru ini
  const classSubjects = await prisma.classSubject.findMany({
    where: { teacherId: user?.userId },
    include: {
      schoolClass: true,
      subject: {
        include: {
          chapters: {
            orderBy: { orderIndex: "asc" },
          },
        },
      },
    },
  });

  // Kumpulkan seluruh chapter dari semua mapel yang diampu
  const allChapters = classSubjects.flatMap((cs) =>
    cs.subject.chapters.map((ch) => ({
      ...ch,
      subjectCode: cs.subject.code,
      subjectName: cs.subject.name,
      classSubjectId: cs.id,
    }))
  );

  return (
    <TeacherLayoutWrapper userName={user?.name}>
      <div className="p-8 max-w-4xl mx-auto w-full">
        <Link
          href="/teacher/missions"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Mission
        </Link>

        {/* Wizard Step 1 Header */}
        <div className="p-6 rounded-2xl bg-slate-800 border border-slate-700 mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
              Langkah 1 dari 5
            </span>
            <span className="text-xs text-slate-400 font-medium">Informasi & Parameter Mission</span>
          </div>
          <h2 className="text-2xl font-black text-white">Buat Mission Baru</h2>
          <p className="text-xs text-slate-400 mt-1">
            Tentukan kelas, bab pembelajaran, judul misi investigasi, serta tujuan belajar.
          </p>
        </div>

        {/* Form Wizard Step 1 */}
        <div className="p-8 rounded-2xl bg-slate-800/90 border border-slate-700 shadow-xl">
          <form action={createMissionAction} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Kelas & Mata Pelajaran Target
                </label>
                <select
                  name="classSubjectId"
                  required
                  defaultValue={classSubjectId || ""}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Pilih Kelas & Mapel...</option>
                  {classSubjects.map((cs) => (
                    <option key={cs.id} value={cs.id}>
                      {cs.schoolClass.name} — {cs.subject.name} ({cs.subject.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Bab / Topik Materi
                </label>
                <select
                  name="chapterId"
                  required
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Pilih Bab...</option>
                  {allChapters.map((ch) => (
                    <option key={ch.id} value={ch.id}>
                      [{ch.subjectCode}] Bab {ch.orderIndex}: {ch.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Judul Mission
              </label>
              <input
                type="text"
                name="title"
                required
                placeholder="misal: Operasi Flag: Investigasi Protokol IP & Subnet"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Deskripsi Briefing Mission
              </label>
              <textarea
                name="description"
                required
                rows={3}
                placeholder="Ceritakan latar belakang misi atau skenario investigasi yang harus diselesaikan siswa..."
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Tujuan Pembelajaran (Learning Objectives)
              </label>
              <textarea
                name="learningObjectives"
                rows={2}
                placeholder="- Siswa dapat menentukan kelas alamat IP&#10;- Siswa dapat menganalisis subnet mask"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Tingkat Kesulitan
                </label>
                <select
                  name="difficulty"
                  defaultValue="MEDIUM"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="EASY">Mudah (Easy)</option>
                  <option value="MEDIUM">Menengah (Medium)</option>
                  <option value="HARD">Menantang (Hard)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Batas Waktu (Menit, Opsional)
                </label>
                <input
                  type="number"
                  name="durationMinutes"
                  placeholder="misal: 45"
                  min={5}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Maksimal Percobaan Attempt
                </label>
                <input
                  type="number"
                  name="maxAttempts"
                  defaultValue={3}
                  min={1}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-700/60 flex items-center justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-xl transition shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <span>Lanjut ke Builder Materi & Challenge</span>
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </TeacherLayoutWrapper>
  );
}
