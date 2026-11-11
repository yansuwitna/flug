import { NextResponse } from "next/server";
import { exportMissionResultsCsvAction } from "@/features/reports/export";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ missionId: string }> }
) {
  const { missionId } = await params;
  const user = await getCurrentUser();

  if (!user || (user.role !== "GURU" && user.role !== "ADMIN")) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const csvContent = await exportMissionResultsCsvAction(missionId);

    const filename = `hasil-misi-${missionId.slice(-6)}-${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err: any) {
    return new NextResponse(err?.message || "Internal Error", { status: 500 });
  }
}
