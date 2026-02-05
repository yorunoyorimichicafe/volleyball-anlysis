import Link from "next/link";
import { getPrisma } from "@/lib/db";
import { summarizeEvents, spikeMetrics, serveMetrics, receptionMetrics } from "@/lib/stats";
import VideoUploadForm from "@/components/VideoUploadForm";

export const dynamic = "force-dynamic";

export default async function MatchPage({ params }: { params: { matchId: string } }) {
  const prisma = getPrisma();
  const match = await prisma.match.findUnique({
    where: { id: params.matchId },
    include: {
      team: true,
      videos: { orderBy: { uploadedAt: "desc" } },
      events: true
    }
  });

  if (!match) {
    return <div className="card">試合が見つかりません。</div>;
  }

  const summary = summarizeEvents(match.events);
  const spike = spikeMetrics(summary.spike);
  const serve = serveMetrics(summary.serve);
  const reception = receptionMetrics(summary.reception);

  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-xl font-semibold">{match.title}</h1>
        <p className="text-sm text-slate-600">
          {match.playedAt.toLocaleDateString()} vs {match.opponent ?? "TBD"}
        </p>
        {match.memo && <p className="text-xs text-slate-500 mt-2">{match.memo}</p>}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="card">
          <h2 className="font-semibold">スパイク</h2>
          <p className="text-sm">打数 {spike.attempts}</p>
          <p className="text-sm">決定率 {spike.killRate}%</p>
          <p className="text-sm">ミス率 {spike.errorRate}%</p>
          <p className="text-sm">被ブロック率 {spike.blockRate}%</p>
        </div>
        <div className="card">
          <h2 className="font-semibold">サーブ</h2>
          <p className="text-sm">本数 {serve.attempts}</p>
          <p className="text-sm">エース率 {serve.aceRate}%</p>
          <p className="text-sm">ミス率 {serve.missRate}%</p>
        </div>
        <div className="card">
          <h2 className="font-semibold">レセプション</h2>
          <p className="text-sm">本数 {reception.attempts}</p>
          <p className="text-sm">成功率 {reception.successRate}%</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card">
          <h2 className="font-semibold">動画アップロード</h2>
          <p className="text-xs text-slate-500 mb-2">mp4想定。ローカル保存。</p>
          <VideoUploadForm matchId={match.id} />
        </div>
        <div className="card">
          <h2 className="font-semibold">動画一覧</h2>
          <div className="mt-3 grid gap-2">
            {match.videos.map((video) => (
              <Link key={video.id} href={`/videos/${video.id}`} className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 hover:border-accent">
                <span className="text-sm">{video.storageUrl}</span>
                <span className="text-xs text-slate-500">{video.durationSec}s</span>
              </Link>
            ))}
            {match.videos.length === 0 && (
              <p className="text-sm text-slate-500">まだ動画がありません。</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
