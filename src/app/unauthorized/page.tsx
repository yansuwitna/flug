import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-slate-100 px-4">
      <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center shadow-2xl">
        <div className="w-16 h-16 bg-rose-950/80 border border-rose-500/40 text-rose-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-white mb-2">Akses Ditolak</h1>
        <p className="text-sm text-slate-400 mb-6">
          Anda tidak memiliki izin akses (role) untuk melihat halaman ini. Silakan kembali atau masuk dengan akun yang sesuai.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm font-semibold transition"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Portal
        </Link>
      </div>
    </div>
  );
}
