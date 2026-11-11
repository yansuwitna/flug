"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { createAcademicYearAction } from "@/features/academic/actions";

export function TahunAjaranModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      await createAcademicYearAction(formData);
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
        <Plus className="w-4 h-4" /> Tambah Tahun Ajaran
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} maxWidth="md">
        <div className="space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 pr-8">
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Tambah Tahun Ajaran
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Buat periode tahun ajaran baru untuk platform pembelajaran.
            </p>
          </div>

          <form action={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Nama Periode
              </label>
              <input
                type="text"
                name="nama"
                required
                placeholder="Contoh: 2025/2026 Ganjil"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Tanggal Mulai
              </label>
              <input
                type="date"
                name="tanggalMulai"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Tanggal Selesai
              </label>
              <input
                type="date"
                name="tanggalSelesai"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="modal-ta-aktif"
                name="aktif"
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
              />
              <label htmlFor="modal-ta-aktif" className="text-xs text-slate-700 dark:text-slate-300 select-none cursor-pointer">
                Jadikan Tahun Ajaran Aktif
              </label>
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
                {loading ? "Menyimpan..." : "Simpan Tahun Ajaran"}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
