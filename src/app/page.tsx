import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-2xl font-semibold">Phase0: 手動/半自動の動画スタッツ</h1>
        <p className="mt-2 text-slate-600">
          動画にイベントを付与して、スパイク・サーブ・レセプションの指標を可視化します。
          最初はチーム内運用、後でSaaS化可能な構成を想定。
        </p>
        <div className="mt-4 flex gap-3">
          <Link href="/teams" className="rounded-md bg-ink px-4 py-2 text-white">チームを見る</Link>
          <Link href="/dashboard" className="rounded-md border border-slate-300 px-4 py-2">ダッシュボード</Link>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card">
          <h2 className="font-semibold">タグ付けが最優先</h2>
          <p className="text-sm text-slate-600">
            ショートカットキーで高速タグ付け。S/V/Rで種類、1-9で結果。
          </p>
        </div>
        <div className="card">
          <h2 className="font-semibold">将来のAI拡張に対応</h2>
          <p className="text-sm text-slate-600">
            Eventにmetadataとconfidenceを持たせ、AI検出候補の承認フローへ。
          </p>
        </div>
      </div>
    </div>
  );
}
