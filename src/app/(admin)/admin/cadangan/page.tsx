import { getCurrentUser } from "@/lib/auth/session";
import { AdminLayoutWrapper } from "@/components/layouts/AdminLayoutWrapper";
import { CadanganDanResetClient } from "@/components/admin/CadanganDanResetClient";
import { Database } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminCadanganPage() {
  const user = await getCurrentUser();

  return (
    <AdminLayoutWrapper userName={user?.name}>
      <div className="p-4 md:p-8 max-w-6xl mx-auto w-full">
        <div className="mb-8">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <Database className="w-6 h-6 text-purple-600 dark:text-purple-400" /> Cadangan, Pemulihan & Pembersihan Sistem
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Kelola salinan cadangan SQL database, pulihkan dari berkas arsip, atau lakukan pembersihan menyeluruh.
          </p>
        </div>

        <CadanganDanResetClient />
      </div>
    </AdminLayoutWrapper>
  );
}
