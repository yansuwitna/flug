"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { createSubjectAction } from "@/features/academic/actions";

export function MataPelajaranModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      await createSubjectAction(formData);
      setIsOpen(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-2xl transition shadow-lg shadow-emerald-600/20 flex items-center gap-2 cursor-pointer w-fit"
      >
        <Plus className="w-4 h-4" /> Buat Mata Pelajaran Baru
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} maxWidth="md">
        <div className="space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 pr-8">
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Buat Mata Pelajaran Baru
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Tambahkan mata pelajaran baru untuk silabus dan penugasan guru.
            </p>
          </div>

          <form action={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Kode Mapel
              </label>
              <input
                type="text"
                name="kode"
                required
                placeholder="Contoh: INF-X"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Nama Mata Pelajaran
              </label>
              <input
                type="text"
                name="nama"
                required
                placeholder="Contoh: Jaringan Komputer Dasar"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Deskripsi Singkat (Opsional)
              </label>
              <textarea
                name="deskripsi"
                rows={3}
                placeholder="Deskripsi ruang lingkup mata pelajaran..."
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition shadow-md cursor-pointer"
              >
                {loading ? "Menyimpan..." : "Simpan Mata Pelajaran"}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
