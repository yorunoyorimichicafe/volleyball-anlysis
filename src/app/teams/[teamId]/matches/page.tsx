import Link from "next/link";
import { prisma } from "@/lib/db";
import MatchForm from "@/components/MatchForm";
import PlayerForm from "@/components/PlayerForm";

export default async function TeamMatchesPage({ params }: { params: { teamId: string } }) {
  const team = await prisma.team.findUnique({
    where: { id: params.teamId },
    include: {
      matches: { orderBy: { playedAt: "desc" } },
      players: { orderBy: { createdAt: "asc" } }
    }
  });

  if (!team) {
    return <div className="card">チームが見つかりません。</div>;
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-xl font-semibold">{team.name}</h1>
        <p className="text-sm text-slate-600">試合と選手を登録しましょう。</p>
      </div>

      <div className="card">
        <h2 className="font-semibold">試合作成</h2>
        <div className="mt-3">
          <MatchForm teamId={team.id} />
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold">選手登録</h2>
        <div className="mt-3">
          <PlayerForm teamId={team.id} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          {team.players.map((player) => (
            <span key={player.id} className="rounded-full bg-slate-100 px-3 py-1">
              #{player.number ?? "-"} {player.name}
            </span>
          ))}
          {team.players.length === 0 && (
            <span className="text-slate-500">まだ選手がいません。</span>
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="font-semibold">試合一覧</h2>
        <div className="mt-3 grid gap-3">
          {team.matches.map((match) => (
            <Link key={match.id} href={`/matches/${match.id}`} className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 hover:border-accent">
              <div>
                <p className="font-medium">{match.title}</p>
                <p className="text-xs text-slate-500">{match.playedAt.toLocaleDateString()} vs {match.opponent ?? "TBD"}</p>
              </div>
              <span className="text-xs text-slate-500">詳細を見る</span>
            </Link>
          ))}
          {team.matches.length === 0 && (
            <p className="text-sm text-slate-500">まだ試合がありません。</p>
          )}
        </div>
      </div>
    </div>
  );
}
