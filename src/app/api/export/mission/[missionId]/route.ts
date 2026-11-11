import { NextRequest, NextResponse } from "next/server";
import { exportMissionResultsCSV } from "@/features/reports/export";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ missionId: string }> }
) {
  try {
    const { missionId } = await params;
    const csvContent = await exportMissionResultsCSV(missionId);

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="laporan-mission-${missionId}.csv"`,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Gagal mengunduh laporan";
    return new NextResponse(message, {
      status: 400,
    });
  }
}
