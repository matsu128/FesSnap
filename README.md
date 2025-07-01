# FesSnap
イベント参加者限定のリアルタイム 写真共有サービス

## サービス概要図

![レイアウト](https://github.com/matsu128/FesSnap/issues/1#issue-3188583688)

## ディレクトリ構成図
fes-snap/
├── app/
│   ├── admin/
│   │   └── page.js
│   ├── events/
│   │   ├── [eventId]/
│   │   │   ├── page.js
│   │   │   └── post/
│   │   │       └── page.js
│   │   └── page.js
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
