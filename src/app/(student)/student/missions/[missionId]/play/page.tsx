import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { notFound, redirect } from "next/navigation";
import { MissionWorkspace } from "@/components/mission/MissionWorkspace";

export const dynamic = "force-dynamic";

export default async function PlayMissionPage({
  params,
}: {
  params: Promise<{ missionId: string }>;
}) {
  const { missionId } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // 1. Ambil mission beserta materi, challenge, opsi, dan clue
  const mission = await prisma.mission.findUnique({
    where: { id: missionId },
    include: {
      learningContent: {
        orderBy: { orderIndex: "asc" },
      },
      challenges: {
        orderBy: { orderIndex: "asc" },
        include: {
          clues: { orderBy: { orderIndex: "asc" } },
          options: { orderBy: { orderIndex: "asc" } },
        },
      },
    },
  });

  if (!mission) {
    notFound();
  }

  // 2. Cari active attempt siswa untuk mission ini
  let attempt = await prisma.missionAttempt.findFirst({
    where: {
      userId: user.userId,
      missionId,
      status: "IN_PROGRESS",
    },
    include: {
      flagSubmissions: {
        where: { isCorrect: true },
      },
      clueUsages: true,
    },
  });

  // Jika belum ada attempt aktif, buat attempt pertama secara otomatis
  if (!attempt) {
    const previousAttemptsCount = await prisma.missionAttempt.count({
      where: { userId: user.userId, missionId },
    });

    attempt = await prisma.missionAttempt.create({
      data: {
        userId: user.userId,
        missionId,
        attemptNumber: previousAttemptsCount + 1,
        status: "IN_PROGRESS",
      },
      include: {
        flagSubmissions: {
          where: { isCorrect: true },
        },
        clueUsages: true,
      },
    });
  }

  const solvedChallengeIds = attempt.flagSubmissions.map((s) => s.challengeId);
  const unlockedClueIds = attempt.clueUsages.map((cu) => cu.clueId);

  return (
    <MissionWorkspace
      attemptId={attempt.id}
      missionId={mission.id}
      missionTitle={mission.title}
      missionDescription={mission.description}
      learningContents={mission.learningContent}
      challenges={mission.challenges}
      solvedChallengeIds={solvedChallengeIds}
      initialUnlockedClueIds={unlockedClueIds}
    />
  );
}
