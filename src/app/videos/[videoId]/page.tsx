import { getPrisma } from "@/lib/db";
import VideoTagger from "@/components/VideoTagger";

export const dynamic = "force-dynamic";

export default async function VideoPage({ params }: { params: { videoId: string } }) {
  const prisma = getPrisma();
  const video = await prisma.video.findUnique({
    where: { id: params.videoId },
    include: {
      match: { include: { team: { include: { players: true } } } },
      events: { include: { player: true }, orderBy: { videoTimeSec: "asc" } }
    }
  });

  if (!video) {
    return <div className="card">動画が見つかりません。</div>;
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <h1 className="text-xl font-semibold">動画タグ付け</h1>
        <p className="text-sm text-slate-600">
          {video.match.title} / {video.storageUrl}
        </p>
      </div>
      <VideoTagger
        videoUrl={video.storageUrl}
        matchId={video.matchId}
        teamId={video.match.teamId}
        videoId={video.id}
        players={video.match.team.players}
        initialEvents={video.events}
      />
    </div>
  );
}
