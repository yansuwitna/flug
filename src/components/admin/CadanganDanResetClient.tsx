"use client";

import { useState } from "react";
import { pulihkanDatabaseAction, resetSemuaDataKecualiAdminAction } from "@/features/system/backup";
import {
  Download,
  Upload,
  Database,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export function CadanganDanResetClient() {
  const [restoreStatus, setRestoreStatus] = useState<{ sukses: boolean; pesan: string } | null>(null);
  const [restoreLoading, setRestoreLoading] = useState(false);

  const [resetStatus, setResetStatus] = useState<{ sukses: boolean; pesan: string } | null>(null);
  const [resetLoading, setResetLoading] = useState(false);
  const [konfirmasiTeks, setKonfirmasiTeks] = useState("");

  async function handleRestore(formData: FormData) {
    if (!confirm("Apakah Anda yakin ingin memulihkan database dari berkas ini? Seluruh data saat ini akan ditimpa!")) {
      return;
    }
    setRestoreLoading(true);
    setRestoreStatus(null);
    try {
      const res = await pulihkanDatabaseAction(formData);
      setRestoreStatus(res);
    } catch (err: any) {
      setRestoreStatus({ sukses: false, pesan: err?.message || "Gagal memulihkan database." });
    } finally {
      setRestoreLoading(false);
    }
  }

  async function handleReset(formData: FormData) {
    if (konfirmasiTeks !== "HAPUS_SEMUA_DATA") {
      alert("Harap ketik 'HAPUS_SEMUA_DATA' untuk mengonfirmasi.");
      return;
    }
    if (!confirm("PERINGATAN AKHIR: Seluruh data siswa, guru, kelas, misi, dan progres akan dihapus permanen! Lanjutkan?")) {
      return;
    }
    setResetLoading(true);
    setResetStatus(null);
    try {
      const res = await resetSemuaDataKecualiAdminAction(formData);
      setResetStatus(res);
      if (res.sukses) {
        setKonfirmasiTeks("");
      }
    } catch (err: any) {
      setResetStatus({ sukses: false, pesan: err?.message || "Gagal mereset data." });
    } finally {
      setResetLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* 1. Cadangan & Pulihkan Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Unduh Cadangan SQL */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-2xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-400">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Buat Cadangan (Backup)</h3>
                <p className="text-xs text-slate-400">Ekspor seluruh skema dan data platform ke berkas SQL</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Berkas cadangan mencakup tabel akun administrator, guru, siswa, kelas, mata pelajaran, materi, flag, dan catatan progres pengerjaan misi.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <a
              href="/api/cadangan"
              download
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" /> Unduh Berkas Cadangan (.sql)
            </a>
          </div>
        </div>

        {/* Pulihkan Cadangan SQL */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 rounded-2xl bg-cyan-950/60 border border-cyan-800/60 text-cyan-400">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Pulihkan (Restore) Database</h3>
              <p className="text-xs text-slate-400">Impor data dari berkas dump SQL sebelumnya</p>
            </div>
          </div>

          <form action={handleRestore} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Pilih Berkas SQL (.sql)
              </label>
              <input
                type="file"
                name="file"
                accept=".sql"
                required
                className="w-full text-xs text-slate-300 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-white hover:file:bg-slate-700 cursor-pointer bg-slate-950 p-2 rounded-2xl border border-slate-800"
              />
            </div>

            <button
              type="submit"
              disabled={restoreLoading}
              className="w-full py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              {restoreLoading ? "Sedang Memulihkan Database..." : "Mulai Pemulihan"}
            </button>
          </form>

          {restoreStatus && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
                restoreStatus.sukses
                  ? "bg-emerald-950/40 border-emerald-800 text-emerald-300"
                  : "bg-rose-950/40 border-rose-800 text-rose-300"
              }`}
            >
              {restoreStatus.sukses ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              )}
              <span>{restoreStatus.pesan}</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Zona Berbahaya: Reset Semua Data Kecuali Admin */}
      <div className="p-6 md:p-8 rounded-3xl bg-rose-950/20 border border-rose-900/60 shadow-xl space-y-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-400 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">Zona Berbahaya: Bersihkan Seluruh Data Platform</h3>
            <p className="text-xs text-rose-300/80 mt-1 leading-relaxed">
              Tindakan ini akan <strong>menghapus permanen</strong> seluruh data siswa, guru, kelas, mata pelajaran, materi belajar, soal tantangan, dan seluruh rekap pengerjaan misi. 
              Hanya akun <strong>Administrator</strong> yang sedang aktif yang akan dipertahankan.
            </p>
          </div>
        </div>

        <form action={handleReset} className="p-5 rounded-2xl bg-slate-950 border border-rose-900/40 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Ketik <span className="font-mono text-rose-400 font-bold">HAPUS_SEMUA_DATA</span> di bawah ini untuk konfirmasi:
            </label>
            <input
              type="text"
              name="konfirmasi"
              value={konfirmasiTeks}
              onChange={(e) => setKonfirmasiTeks(e.target.value)}
              placeholder="HAPUS_SEMUA_DATA"
              required
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={konfirmasiTeks !== "HAPUS_SEMUA_DATA" || resetLoading}
            className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            {resetLoading ? "Sedang Membersihkan Seluruh Data..." : "Hapus Semua Data & Sisakan Admin Saja"}
          </button>
        </form>

        {resetStatus && (
          <div
            className={`p-4 rounded-xl border text-xs flex items-center gap-2.5 ${
              resetStatus.sukses
                ? "bg-emerald-950/40 border-emerald-800 text-emerald-300"
                : "bg-rose-950/40 border-rose-800 text-rose-300"
            }`}
          >
            {resetStatus.sukses ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{resetStatus.pesan}</span>
          </div>
        )}
      </div>
    </div>
  );
}
