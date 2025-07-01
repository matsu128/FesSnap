# FesSnap
イベント参加者限定のリアルタイム 写真共有サービス

## サービス概要図

![レイアウト](https://github.com/matsu128/FesSnap/issues/1#issue-3188583688)


# FesSnap

イベント参加者限定のリアルタイム写真共有サービス

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

---

## 機能概要

- LP（紹介ページ）
- イベントリスト・詳細・投稿ページ
- 主催者管理ページ（QRコード生成・イベント編集）
- レスポンシブ・スマホファースト
- アニメーション・グラデーションUI

---

## 開発・起動方法

```bash
npm install
npm run dev
```

---

## ライセンス

MIT
