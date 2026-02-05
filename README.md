# Volley Stats MVP (Phase0)

社会人バレー向けの動画スタッツ分析WebサービスのMVPです。動画にイベントを付与し、スパイク/サーブ/レセプションの指標を可視化します。Phase0として手動/半自動の運用を優先し、将来AI検出を追加できる設計です。

## 主要機能
- チーム/試合/動画管理
- 動画プレイヤー上でイベントタグ付け（ショートカット対応）
- スパイク/サーブ/レセプションの指標をダッシュボードで表示
- Eventに`metadata`/`confidence`を保持し将来AI拡張に対応

## 技術スタック
- Next.js (App Router) + TypeScript
- Prisma + PostgreSQL
- Tailwind CSS

## ローカル起動手順
1. 依存関係をインストール
```bash
npm install
```

2. 環境変数を用意
```bash
cp .env.example .env
```

3. DBマイグレーション
```bash
npm run prisma:migrate
```

4. seedデータ投入 (任意)
```bash
npm run seed
```

5. 開発サーバ起動
```bash
npm run dev
```

## 環境変数
`.env` に以下を設定してください。
```
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/volley_stats"
DIRECT_URL="postgresql://USER:PASSWORD@localhost:5432/volley_stats"
```

## デプロイ想定
- DB: PostgreSQL
- ファイル保存: Phase0は`public/uploads`へのローカル保存。将来的にS3互換へ差し替え可能。
- APIはRoute Handlersで実装。後段にAIワーカーを差し込む想定。

## タグ付けショートカット
- `S` = Spike
- `V` = Serve
- `R` = Reception
- `1-9` = Outcome
- `U` = Undo (直近イベント削除)
- `Space` = Play/Pause

## 画面一覧
- `/teams`
- `/teams/[teamId]/matches`
- `/matches/[matchId]`
- `/videos/[videoId]`
- `/dashboard?teamId=...`

## 将来拡張（AI）
- `/api/ai/detect-spikes?videoId=...` などのエンドポイントを追加し、Event候補を返す設計に拡張可能。

## 注意
- 現在はログインなしのローカルユーザーで運用します。
- seedデータの動画URLは `/uploads/sample.mp4` なので、実際の動画をアップロードしてください。
