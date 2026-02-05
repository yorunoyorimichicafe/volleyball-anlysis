import Link from "next/link";
import { prisma } from "@/lib/db";
import { getOrCreateLocalUser } from "@/lib/localUser";
import { summarizeEvents, spikeMetrics, serveMetrics, receptionMetrics } from "@/lib/stats";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams
}: {
  searchParams: { teamId?: string };
}) {
  const user = await getOrCreateLocalUser();
  const teams = await prisma.team.findMany({ where: { ownerId: user.id } });
  const activeTeamId = searchParams.teamId ?? teams[0]?.id;

  if (!activeTeamId) {
    return <div className="card">チームを作成してください。</div>;
  }

  const events = await prisma.event.findMany({
    where: { teamId: activeTeamId },
    include: { player: true, match: true },
    orderBy: { createdAt: "asc" }
  });

  const summary = summarizeEvents(events);
  const spike = spikeMetrics(summary.spike);
  const serve = serveMetrics(summary.serve);
  const reception = receptionMetrics(summary.reception);

  const byPlayer = new Map<string, typeof events>();
  const byMatch = new Map<string, typeof events>();

  for (const event of events) {
    if (event.playerId) {
      const list = byPlayer.get(event.playerId) ?? [];
      list.push(event);
      byPlayer.set(event.playerId, list);
    }
    const list = byMatch.get(event.matchId) ?? [];
    list.push(event);
    byMatch.set(event.matchId, list);
  }

  return (
    <div className="space-y-6">
      <div className="card flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">ダッシュボード</h1>
          <p className="text-sm text-slate-600">チーム全体の指標と推移</p>
        </div>
        <div className="flex gap-2">
          {teams.map((team) => (
            <Link
              key={team.id}
              href={`/dashboard?teamId=${team.id}`}
              className={`rounded-full border px-3 py-1 text-sm ${team.id === activeTeamId ? "bg-ink text-white" : "bg-white"}`}
            >
              {team.name}
            </Link>
          ))}
        </div>
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

      <div className="card">
        <h2 className="font-semibold">試合ごとの推移</h2>
        <div className="mt-3 overflow-auto">
          <table className="table">
            <thead>
              <tr>
                <th>試合</th>
                <th>スパイク決定率</th>
                <th>サーブエース率</th>
                <th>レセプション成功率</th>
              </tr>
            </thead>
            <tbody>
              {Array.from(byMatch.entries()).map(([matchId, list]) => {
                const matchSummary = summarizeEvents(list);
                const s = spikeMetrics(matchSummary.spike);
                const v = serveMetrics(matchSummary.serve);
                const r = receptionMetrics(matchSummary.reception);
                return (
                  <tr key={matchId}>
                    <td>{list[0]?.match?.title ?? "Match"}</td>
                    <td>{s.killRate}%</td>
                    <td>{v.aceRate}%</td>
                    <td>{r.successRate}%</td>
                  </tr>
                );
              })}
              {byMatch.size === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-slate-500">まだデータがありません。</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold">選手別</h2>
        <div className="mt-3 overflow-auto">
          <table className="table">
            <thead>
              <tr>
                <th>選手</th>
                <th>スパイク決定率</th>
                <th>サーブエース率</th>
                <th>レセプション成功率</th>
              </tr>
            </thead>
            <tbody>
              {Array.from(byPlayer.entries()).map(([playerId, list]) => {
                const playerSummary = summarizeEvents(list);
                const s = spikeMetrics(playerSummary.spike);
                const v = serveMetrics(playerSummary.serve);
                const r = receptionMetrics(playerSummary.reception);
                return (
                  <tr key={playerId}>
                    <td>{list[0]?.player?.name ?? "Unknown"}</td>
                    <td>{s.killRate}%</td>
                    <td>{v.aceRate}%</td>
                    <td>{r.successRate}%</td>
                  </tr>
                );
              })}
              {byPlayer.size === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-slate-500">まだデータがありません。</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
