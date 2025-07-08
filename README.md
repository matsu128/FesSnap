# FesSnap
イベント参加者限定のリアルタイム 写真共有サービス

## サービス概要図

![レイアウト](https://github.com/matsu128/FesSnap/issues/1#issue-3188583688)

---

## ディレクトリ構成

```plaintext
fes-snap/
├── app/
│   ├── admin/
│   ├── events/
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.js
│   └── page.js
├── components/
│   ├── atoms/
│   ├── molecules/
│   ├── organisms/
│   └── templates/
├── api/
│   ├── events.js
│   ├── images.js
│   └── users.js
├── public/
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── eslint.config.mjs
├── jsconfig.json
├── next.config.mjs
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── README.md
```

---

## 主な技術

- Next.js (App Router)
- React
- Tailwind CSS
- Atomic Design
- API Routes
- Supabase (認証・データベース・ストレージ)

---

## 機能概要

- LP（紹介ページ）
- イベントリスト・詳細・投稿ページ
- 主催者管理ページ（QRコード生成・イベント編集）
- レスポンシブ・スマホファースト
- アニメーション・グラデーションUI
- いいね機能（リアルタイム更新）
- 画像ソート機能（人気順・新しい順）

---

## データベース設定

### image_likesテーブルの作成

いいね機能を使用するには、Supabaseで以下のSQLを実行してください：

```sql
-- image_likesテーブル作成
CREATE TABLE IF NOT EXISTS image_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  eventId UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  imageId UUID NOT NULL REFERENCES images(id) ON DELETE CASCADE,
  userId UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 同じユーザーが同じ画像に複数回いいねできないように制約
  UNIQUE(eventId, imageId, userId)
);

-- インデックスを作成してクエリパフォーマンスを向上
CREATE INDEX IF NOT EXISTS idx_image_likes_event_id ON image_likes(eventId);
CREATE INDEX IF NOT EXISTS idx_image_likes_image_id ON image_likes(imageId);
CREATE INDEX IF NOT EXISTS idx_image_likes_user_id ON image_likes(userId);
CREATE INDEX IF NOT EXISTS idx_image_likes_created_at ON image_likes(created_at);

-- RLS（Row Level Security）を有効化
ALTER TABLE image_likes ENABLE ROW LEVEL SECURITY;

-- ポリシー設定
-- 全ユーザーがいいねを読み取り可能
CREATE POLICY "Allow public read access" ON image_likes
  FOR SELECT USING (true);

-- 認証済みユーザーのみいいねの追加・削除が可能
CREATE POLICY "Allow authenticated users to insert likes" ON image_likes
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow users to delete their own likes" ON image_likes
  FOR DELETE USING (auth.uid()::text = userId::text);
```

---

## 開発・起動方法

```bash
npm install
npm run dev
```

---

## ライセンス

MIT
