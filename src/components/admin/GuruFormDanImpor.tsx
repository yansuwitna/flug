"use client";

import { useState } from "react";
import { imporGuruAction, HasilImpor } from "@/features/academic/impor-pengguna";
import { tambahGuruAction } from "@/features/academic/manajemen-pengguna";
import { Upload, Plus, GraduationCap, CheckCircle2, AlertCircle, FileText } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

export function GuruFormDanImpor() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"tambah" | "impor">("tambah");
  const [loading, setLoading] = useState(false);
  const [formMsg, setFormMsg] = useState<{ sukses: boolean; pesan: string } | null>(null);
  const [importResult, setImportResult] = useState<HasilImpor | null>(null);

  async function handleTambah(formData: FormData) {
    setLoading(true);
    setFormMsg(null);
    try {
      const res = await tambahGuruAction(formData);
      setFormMsg(res);
      if (res.sukses) {
        (document.getElementById("form-tambah-guru") as HTMLFormElement)?.reset();
      }
    } catch (err: any) {
      setFormMsg({ sukses: false, pesan: err?.message || "Gagal menambahkan guru." });
    } finally {
      setLoading(false);
    }
  }

  async function handleImpor(formData: FormData) {
    setLoading(true);
    setImportResult(null);
    try {
      const res = await imporGuruAction(formData);
      setImportResult(res);
    } catch (err: any) {
      setImportResult({
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
    <>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            setIsOpen(true);
            setFormMsg(null);
            setImportResult(null);
          }}
          className="px-5 py-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-600/20 transition cursor-pointer"
        >
          <GraduationCap className="w-4 h-4" />
          <span>Kelola & Daftarkan Guru Pengajar</span>
        </button>
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} maxWidth="2xl">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 pr-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-cyan-600 dark:text-cyan-400" /> Kelola & Daftarkan Guru Pengajar
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Tambah akun guru secara manual perorangan atau gunakan impor massal via berkas CSV.
              </p>
            </div>

            {/* Tab Selector */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("tambah");
                  setFormMsg(null);
                  setImportResult(null);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  activeTab === "tambah"
                    ? "bg-cyan-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Manual
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("impor");
                  setFormMsg(null);
                  setImportResult(null);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer ${
                  activeTab === "impor"
                    ? "bg-cyan-600 text-white shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Upload className="w-3.5 h-3.5" /> Impor CSV
              </button>
            </div>
          </div>

          {activeTab === "tambah" ? (
            /* Form Tambah Manual Guru */
            <form id="form-tambah-guru" action={handleTambah} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1.5">
                    Nama Lengkap & Gelar
                  </label>
                  <input
                    type="text"
                    name="nama"
                    required
                    placeholder="Contoh: Budi Santoso, S.Kom"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1.5">
                    NIP (Nomor Induk Pegawai, Opsional)
                  </label>
                  <input
                    type="text"
                    name="nip"
                    placeholder="Contoh: 198501012010011001"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1.5">
                    Alamat Email Resmi
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="Contoh: budi@sekolah.sch.id"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-400 mb-1.5">
                    Kata Sandi Akun
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    defaultValue="password123"
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
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
                  className="py-2.5 px-6 rounded-xl font-bold text-xs text-white bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  {loading ? "Menyimpan Data..." : "Daftarkan Guru"}
                </button>
              </div>

              {formMsg && (
                <div
                  className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
                    formMsg.sukses
                      ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                      : "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300"
                  }`}
                >
                  {formMsg.sukses ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                  )}
                  <span>{formMsg.pesan}</span>
                </div>
              )}
            </form>
          ) : (
            /* Tab Impor CSV */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 text-xs space-y-2">
                <div className="flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-300">
                  <FileText className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <span>Format Kolom Berkas CSV Guru:</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 font-mono text-[11px] text-cyan-700 dark:text-cyan-400 overflow-x-auto">
                  {"nama,email,katasandi,nip\n" +
                    "Drs. Joko Santoso,joko@sekolah.sch.id,guru123,198001012005011001\n" +
                    "Sri Wahyuni M.Pd,sri@sekolah.sch.id,guru123,198202022006012002"}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  * Kolom <strong className="text-slate-700 dark:text-slate-300">nama</strong> dan{" "}
                  <strong className="text-slate-700 dark:text-slate-300">email</strong> wajib diisi. Kolom kata sandi dan NIP bersifat opsional.
                </p>
              </div>

              <form action={handleImpor} className="space-y-4">
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

                <div className="flex justify-end gap-3 pt-2">
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
                    className="py-2.5 px-6 rounded-xl font-bold text-xs text-white bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <Upload className="w-4 h-4" />
                    {loading ? "Sedang Mengimpor Data..." : "Mulai Impor CSV Guru"}
                  </button>
                </div>
              </form>

              {importResult && (
                <div
                  className={`p-4 rounded-2xl border text-xs space-y-2 ${
                    importResult.sukses
                      ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300"
                      : "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/80 text-rose-800 dark:text-rose-300"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {importResult.sukses ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    )}
                    <span>
                      {importResult.sukses
                        ? `Berhasil Mengimpor ${importResult.jumlahBerhasil} Guru!`
                        : "Proses Impor Mengalami Kendala"}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Total baris dibaca: {importResult.totalDibaca} | Berhasil: {importResult.jumlahBerhasil} | Dilewati/Gagal:{" "}
                    {importResult.jumlahDilewati}
                  </p>

                  {importResult.pesanError.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800/60 max-h-32 overflow-y-auto space-y-1 font-mono text-[10px] text-rose-600 dark:text-rose-400">
                      {importResult.pesanError.map((msg, idx) => (
                        <div key={idx}>• {msg}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
