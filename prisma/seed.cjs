const { PrismaClient, EventOutcome, EventType } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "local@volley-stats" },
    update: {},
    create: { email: "local@volley-stats", name: "Local User" }
  });

  const team = await prisma.team.upsert({
    where: { id: "seed-team" },
    update: { name: "Sample VC", ownerId: user.id },
    create: { id: "seed-team", name: "Sample VC", ownerId: user.id }
  });

  const players = await Promise.all(
    [
      { name: "Sato", number: 1, position: "OH" },
      { name: "Kudo", number: 5, position: "MB" },
      { name: "Mori", number: 10, position: "S" }
    ].map((player) =>
      prisma.player.upsert({
        where: { id: `seed-player-${player.number}` },
        update: { ...player, teamId: team.id },
        create: { id: `seed-player-${player.number}`, teamId: team.id, ...player }
      })
    )
  );

  const match = await prisma.match.upsert({
    where: { id: "seed-match" },
    update: {
      teamId: team.id,
      title: "Preseason Match",
      opponent: "Blue Stars",
      playedAt: new Date(),
      memo: "Sample data"
    },
    create: {
      id: "seed-match",
      teamId: team.id,
      title: "Preseason Match",
      opponent: "Blue Stars",
      playedAt: new Date(),
      memo: "Sample data"
    }
  });

  const video = await prisma.video.upsert({
    where: { id: "seed-video" },
    update: {
      matchId: match.id,
      storageUrl: "/uploads/sample.mp4",
      durationSec: 600
    },
    create: {
      id: "seed-video",
      matchId: match.id,
      storageUrl: "/uploads/sample.mp4",
      durationSec: 600
    }
  });

  const sampleEvents = [
    { type: EventType.SPIKE, outcome: EventOutcome.POINT, playerId: players[0].id, videoTimeSec: 12 },
    { type: EventType.SPIKE, outcome: EventOutcome.ERROR, playerId: players[0].id, videoTimeSec: 22 },
    { type: EventType.SERVE, outcome: EventOutcome.ACE, playerId: players[1].id, videoTimeSec: 35 },
    { type: EventType.SERVE, outcome: EventOutcome.MISS, playerId: players[1].id, videoTimeSec: 60 },
    { type: EventType.RECEPTION, outcome: EventOutcome.SUCCESS_A, playerId: players[2].id, videoTimeSec: 80 }
  ];

  await prisma.event.deleteMany({ where: { matchId: match.id } });
  await prisma.event.createMany({
    data: sampleEvents.map((event) => ({
      teamId: team.id,
      matchId: match.id,
      videoId: video.id,
      type: event.type,
      outcome: event.outcome,
      playerId: event.playerId,
      rotation: 1,
      zone: 1,
      videoTimeSec: event.videoTimeSec
    }))
  });

  console.log("Seeded sample data");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
