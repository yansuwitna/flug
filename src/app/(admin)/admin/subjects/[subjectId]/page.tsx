import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { AdminLayoutWrapper } from "@/components/layouts/AdminLayoutWrapper";
import { createChapterAction } from "@/features/academic/actions";
import { notFound } from "next/navigation";
import { ArrowLeft, Plus, Layers, Flag } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SubjectDetailPage({
  params,
}: {
  params: Promise<{ subjectId: string }>;
}) {
  const { subjectId } = await params;
  const user = await getCurrentUser();

  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    include: {
      chapters: {
        orderBy: { orderIndex: "asc" },
        include: {
          _count: {
            select: { missions: true },
          },
        },
      },
      classSubjects: {
        include: {
          schoolClass: true,
          teacher: true,
        },
      },
    },
  });

  if (!subject) {
    notFound();
  }

  return (
    <AdminLayoutWrapper userName={user?.name}>
      <div className="p-8 max-w-7xl mx-auto w-full">
        <Link
          href="/admin/subjects"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Mata Pelajaran
        </Link>

        {/* Header Mapel */}
        <div className="p-6 rounded-2xl bg-slate-800 border border-slate-700 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                {subject.code}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {subject.chapters.length} Bab / Topik Terdaftar
              </span>
            </div>
            <h2 className="text-2xl font-black text-white">{subject.name}</h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              {subject.description || "Tidak ada deskripsi rinci untuk mata pelajaran ini."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Tambah Bab */}
          <div className="p-6 rounded-2xl bg-slate-800 border border-slate-700 h-fit">
            <h3 className="font-bold text-white text-base mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-cyan-400" /> Tambah Bab / Topik
            </h3>

            <form action={createChapterAction} className="space-y-4">
              <input type="hidden" name="subjectId" value={subject.id} />

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Nomor Urut Bab
                </label>
                <input
                  type="number"
                  name="orderIndex"
                  min={1}
                  defaultValue={subject.chapters.length + 1}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Judul Bab / Topik
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="misal: Protokol Routing & IP"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Deskripsi Bab (Opsional)
                </label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Ringkasan kompetensi dasar yang dipelajari..."
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Simpan Bab
              </button>
            </form>
          </div>

          {/* List Bab / Topik */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" /> Struktur Bab Pembelajaran ({subject.chapters.length})
            </h3>

            {subject.chapters.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-800/40 border border-slate-700 text-center text-xs text-slate-400">
                Belum ada bab untuk mata pelajaran ini. Silakan tambahkan bab pertama di samping.
              </div>
            ) : (
              <div className="space-y-3">
                {subject.chapters.map((ch) => (
                  <div
                    key={ch.id}
                    className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-start justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {ch.orderIndex}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white">{ch.title}</h4>
                        <p className="text-xs text-slate-400 mt-1">
                          {ch.description || "Tidak ada deskripsi tambahan"}
                        </p>
                        <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Flag className="w-3.5 h-3.5 text-emerald-400" /> {ch._count.missions} Mission Terpasang
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayoutWrapper>
  );
}
