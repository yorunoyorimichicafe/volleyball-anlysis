import Link from "next/link";
import { getPrisma } from "@/lib/db";
import { getOrCreateLocalUser } from "@/lib/localUser";
import TeamForm from "@/components/TeamForm";

export const dynamic = "force-dynamic";

export default async function TeamsPage() {
  const prisma = getPrisma();
  const user = await getOrCreateLocalUser();
  const teams = await prisma.team.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-xl font-semibold">チーム</h1>
        <p className="text-sm text-slate-600">まずはチームを作成して試合を登録します。</p>
        <div className="mt-4">
          <TeamForm />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {teams.map((team) => (
          <Link key={team.id} href={`/teams/${team.id}/matches`} className="card hover:border-accent">
            <p className="text-lg font-semibold">{team.name}</p>
            <p className="text-xs text-slate-500">{team.createdAt.toLocaleDateString()}</p>
          </Link>
        ))}
        {teams.length === 0 && (
          <div className="card text-sm text-slate-600">まだチームがありません。</div>
        )}
      </div>
    </div>
  );
}
