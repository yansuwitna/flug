"use client";

import { useState } from "react";
import { imporSiswaAction, imporGuruAction, HasilImpor } from "@/features/academic/impor-pengguna";
import { Upload, Users, GraduationCap, CheckCircle2, AlertCircle, FileText } from "lucide-react";

export function ImporPenggunaModal() {
  const [activeTab, setActiveTab] = useState<"siswa" | "guru">("siswa");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HasilImpor | null>(null);

  async function handleImport(formData: FormData) {
    setLoading(true);
    setResult(null);
    try {
      if (activeTab === "siswa") {
        const res = await imporSiswaAction(formData);
        setResult(res);
      } else {
        const res = await imporGuruAction(formData);
        setResult(res);
      }
    } catch (err: any) {
      setResult({
        sukses: false,
        totalDibaca: 0,
        jumlahBerhasil: 0,
        jumlahDilewati: 0,
        pesanError: [err?.message || "Terjadi kesalahan saat memproses file."],
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Upload className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> Impor Pengguna dari Berkas CSV
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Tambahkan banyak akun sekaligus ke sistem menggunakan berkas berformat .CSV
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => {
              setActiveTab("siswa");
              setResult(null);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === "siswa"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Siswa
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("guru");
              setResult(null);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === "guru"
                ? "bg-cyan-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" /> Guru
          </button>
        </div>
      </div>

      {/* Petunjuk Format CSV */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 text-xs space-y-2">
        <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300">
          <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Format Kolom Berkas CSV yang Diterima ({activeTab === "siswa" ? "Siswa" : "Guru"}):</span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 font-mono text-[11px] text-emerald-700 dark:text-emerald-400 overflow-x-auto border border-slate-200 dark:border-slate-800">
          {activeTab === "siswa"
            ? "nama,email,katasandi,nisn\nBudi Raharjo,budi@sekolah.sch.id,rahasia123,0051234567\nAni Suryani,ani@sekolah.sch.id,rahasia123,0051234568"
            : "nama,email,katasandi,nip\nDrs. Joko Santoso,joko@sekolah.sch.id,guru123,198001012005011001\nSri Wahyuni M.Pd,sri@sekolah.sch.id,guru123,198202022006012002"}
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          * Kolom <strong className="text-slate-700 dark:text-slate-300">nama</strong> dan <strong className="text-slate-700 dark:text-slate-300">email</strong> wajib ada. Kolom kata sandi dan NISN/NIP bersifat opsional.
        </p>
      </div>

      {/* Form Upload */}
      <form action={handleImport} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
            Pilih Berkas CSV
          </label>
          <input
            type="file"
            name="file"
            accept=".csv,text/csv"
            required
            className="w-full text-xs text-slate-700 dark:text-slate-300 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 dark:file:bg-slate-800 file:text-slate-800 dark:file:text-white hover:file:bg-slate-200 dark:hover:file:bg-slate-700 cursor-pointer bg-slate-50 dark:bg-slate-950 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-xl font-bold text-xs text-white transition flex items-center justify-center gap-2 cursor-pointer shadow-md ${
            activeTab === "siswa"
              ? "bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50"
              : "bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50"
          }`}
        >
          <Upload className="w-4 h-4" />
          {loading ? "Sedang Memproses Berkas..." : `Impor Data ${activeTab === "siswa" ? "Siswa" : "Guru"}`}
        </button>
      </form>

      {/* Feedback Hasil Impor */}
      {result && (
        <div
          className={`p-4 rounded-2xl border text-xs space-y-2 ${
            result.sukses
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300"
              : "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/80 text-rose-800 dark:text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-sm">
            {result.sukses ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            )}
            <span>
              {result.sukses
                ? `Berhasil Mengimpor ${result.jumlahBerhasil} Pengguna!`
                : "Proses Impor Mengalami Kendala"}
            </span>
          </div>

          <p className="text-[11px] text-slate-600 dark:text-slate-300">
            Total baris dibaca: {result.totalDibaca} | Berhasil: {result.jumlahBerhasil} | Dilewati/Gagal:{" "}
            {result.jumlahDilewati}
          </p>

          {result.pesanError.length > 0 && (
            <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800/60 max-h-32 overflow-y-auto space-y-1 font-mono text-[10px] text-rose-600 dark:text-rose-400">
              {result.pesanError.map((msg, idx) => (
                <div key={idx}>• {msg}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
