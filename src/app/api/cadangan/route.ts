import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { buatCadanganDatabaseAction } from "@/features/system/backup";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const result = await buatCadanganDatabaseAction();

  if (!result.sukses || !result.sql) {
    return new NextResponse(result.pesan || "Gagal membuat backup", { status: 500 });
  }

  const filename = `backup-flaghunter-${new Date().toISOString().slice(0, 10)}.sql`;

  return new NextResponse(result.sql, {
    status: 200,
    headers: {
      "Content-Type": "application/sql",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
