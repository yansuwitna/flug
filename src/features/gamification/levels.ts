import { prisma } from "@/lib/db/prisma";

export interface InvestigatorLevel {
  level: number;
  title: string;
  minXp: number;
  maxXp: number;
}

export const LEVELS: InvestigatorLevel[] = [
  { level: 1, title: "Recruit Investigator", minXp: 0, maxXp: 199 },
  { level: 2, title: "Junior Scout", minXp: 200, maxXp: 499 },
  { level: 3, title: "Cyber Detective", minXp: 500, maxXp: 999 },
  { level: 4, title: "Senior Flag Hunter", minXp: 1000, maxXp: 1999 },
  { level: 5, title: "Elite Master Hunter", minXp: 2000, maxXp: Infinity },
];

export function getLevelFromXp(xp: number): InvestigatorLevel {
  for (const lvl of LEVELS) {
    if (xp >= lvl.minXp && xp <= lvl.maxXp) {
      return lvl;
    }
  }
  return LEVELS[0];
}

/**
 * Mengecek dan memberikan badge secara transaksional
 */
export async function evaluateAndAwardBadges(userId: string) {
  // 1. Ambil data aktivitas siswa
  const [totalFlagsCaptured, completedAttemptsCount] = await Promise.all([
    prisma.flagSubmission.count({
      where: {
        attempt: { userId },
        isCorrect: true,
      },
    }),
    prisma.missionAttempt.count({
      where: {
        userId,
        status: "COMPLETED",
      },
    }),
  ]);

  // Daftar badge default
  const badgeDefinitions = [
    {
      slug: "first_flag",
      name: "First Blood",
      description: "Menangkap bendera (flag) pertama kali dalam pembelajaran.",
      criteria: "Capture at least 1 flag",
      condition: totalFlagsCaptured >= 1,
    },
    {
      slug: "mission_complete",
      name: "Mission Accomplished",
      description: "Menyelesaikan misi pembelajaran pertama hingga tuntas.",
      criteria: "Complete at least 1 mission",
      condition: completedAttemptsCount >= 1,
    },
    {
      slug: "flag_master",
      name: "Flag Veteran",
      description: "Berhasil menangkap 5 flag investigasi atau lebih.",
      criteria: "Capture at least 5 flags",
      condition: totalFlagsCaptured >= 5,
    },
  ];

  for (const bDef of badgeDefinitions) {
    if (bDef.condition) {
      // Pastikan badge ada di tabel Badge
      const badge = await prisma.badge.upsert({
        where: { slug: bDef.slug },
        create: {
          slug: bDef.slug,
          name: bDef.name,
          description: bDef.description,
          criteria: bDef.criteria,
        },
        update: {},
      });

      // Berikan ke user jika belum punya
      await prisma.userBadge.upsert({
        where: {
          userId_badgeId: {
            userId,
            badgeId: badge.id,
          },
        },
        create: {
          userId,
          badgeId: badge.id,
        },
        update: {},
      });
    }
  }
}
