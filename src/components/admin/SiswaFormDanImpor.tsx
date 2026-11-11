"use client";

import { useState } from "react";
import { imporSiswaAction, HasilImpor } from "@/features/academic/impor-pengguna";
import { tambahSiswaAction } from "@/features/academic/manajemen-pengguna";
import { Upload, Plus, Users, CheckCircle2, AlertCircle, FileText, School } from "lucide-react";

interface SiswaFormDanImporProps {
  daftarKelas: { id: string; nama: string; tingkat: number }[];
}

export function SiswaFormDanImpor({ daftarKelas }: SiswaFormDanImporProps) {
  const [activeTab, setActiveTab] = useState<"tambah" | "impor">("tambah");
  const [loading, setLoading] = useState(false);
  const [formMsg, setFormMsg] = useState<{ sukses: boolean; pesan: string } | null>(null);
  const [importResult, setImportResult] = useState<HasilImpor | null>(null);

  async function handleTambah(formData: FormData) {
    setLoading(true);
    setFormMsg(null);
    try {
      const res = await tambahSiswaAction(formData);
      setFormMsg(res);
      if (res.sukses) {
        (document.getElementById("form-tambah-siswa") as HTMLFormElement)?.reset();
      }
    } catch (err: any) {
      setFormMsg({ sukses: false, pesan: err?.message || "Gagal menambahkan siswa." });
    } finally {
      setLoading(false);
    }
  }

  async function handleImpor(formData: FormData) {
    setLoading(true);
    setImportResult(null);
    try {
      const res = await imporSiswaAction(formData);
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
    <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" /> Kelola & Daftarkan Siswa
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Tambah akun siswa secara manual atau gunakan fasilitas impor massal via berkas CSV.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveTab("tambah");
              setFormMsg(null);
              setImportResult(null);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === "tambah"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
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
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              activeTab === "impor"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Upload className="w-3.5 h-3.5" /> Impor CSV
          </button>
        </div>
      </div>

      {activeTab === "tambah" ? (
        /* Form Tambah Manual Siswa */
        <form id="form-tambah-siswa" action={handleTambah} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Nama Lengkap Siswa
              </label>
              <input
                type="text"
                name="nama"
                required
                placeholder="Contoh: Ahmad Fadillah"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                NISN (Nomor Induk Siswa Nasional, Opsional)
              </label>
              <input
                type="text"
                name="nisn"
                placeholder="Contoh: 0051234567"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Alamat Email Siswa
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="Contoh: ahmad@sekolah.sch.id"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Kata Sandi Akun
              </label>
              <input
                type="password"
                name="kataSandi"
                defaultValue="siswa123"
                required
                minLength={6}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Pilih Kelas Awal (Opsional)
              </label>
              <select
                name="idKelas"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Belum dimasukkan ke kelas manapun</option>
                {daftarKelas.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama} (Tingkat {k.tingkat})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {loading ? "Menyimpan Siswa..." : "Simpan Akun Siswa"}
          </button>

          {formMsg && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
                formMsg.sukses
                  ? "bg-emerald-950/40 border-emerald-800 text-emerald-300"
                  : "bg-rose-950/40 border-rose-800 text-rose-300"
              }`}
            >
              {formMsg.sukses ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              )}
              <span>{formMsg.pesan}</span>
            </div>
          )}
        </form>
      ) : (
        /* Form Impor CSV Siswa */
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-300">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Format Kolom Berkas CSV Siswa:</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 font-mono text-[11px] text-emerald-400 overflow-x-auto">
              nama,email,katasandi,nisn{"\n"}
              Budi Raharjo,budi@sekolah.sch.id,siswa123,0051234567{"\n"}
              Ani Suryani,ani@sekolah.sch.id,siswa123,0051234568
            </div>
            <p className="text-[11px] text-slate-500">
              * Kolom <strong className="text-slate-400">nama</strong> dan <strong className="text-slate-400">email</strong> wajib diisi. Kolom katasandi dan nisn bersifat opsional.
            </p>
          </div>

          <form action={handleImpor} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Pilih Berkas CSV
              </label>
              <input
                type="file"
                name="file"
                accept=".csv,text/csv"
                required
                className="w-full text-xs text-slate-300 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-white hover:file:bg-slate-700 cursor-pointer bg-slate-950 p-2 rounded-2xl border border-slate-800 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 transition flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <Upload className="w-4 h-4" />
              {loading ? "Sedang Mengimpor Data Siswa..." : "Mulai Impor Data Siswa"}
            </button>
          </form>

          {importResult && (
            <div
              className={`p-4 rounded-2xl border text-xs space-y-2 ${
                importResult.sukses
                  ? "bg-emerald-950/40 border-emerald-800/80 text-emerald-300"
                  : "bg-rose-950/40 border-rose-800/80 text-rose-300"
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                {importResult.sukses ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400" />
                )}
                <span>
                  {importResult.sukses
                    ? `Berhasil Mengimpor ${importResult.jumlahBerhasil} Siswa!`
                    : "Proses Impor Mengalami Kendala"}
                </span>
              </div>

              <p className="text-[11px] text-slate-300">
                Total baris dibaca: {importResult.totalDibaca} | Berhasil: {importResult.jumlahBerhasil} | Dilewati/Gagal:{" "}
                {importResult.jumlahDilewati}
              </p>

              {importResult.pesanError.length > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-800/60 max-h-32 overflow-y-auto space-y-1 font-mono text-[10px] text-rose-400">
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
  );
}
