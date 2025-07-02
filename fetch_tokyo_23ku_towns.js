const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const TOKYO_WARDS = [
  { name: '千代田区', file: 'chiyoda.json' },
  { name: '中央区', file: 'chuo.json' },
  { name: '港区', file: 'minato.json' },
  { name: '新宿区', file: 'shinjuku.json' },
  { name: '文京区', file: 'bunkyo.json' },
  { name: '台東区', file: 'taito.json' },
  { name: '墨田区', file: 'sumida.json' },
  { name: '江東区', file: 'koto.json' },
  { name: '品川区', file: 'shinagawa.json' },
  { name: '目黒区', file: 'meguro.json' },
  { name: '大田区', file: 'ota.json' },
  { name: '世田谷区', file: 'setagaya.json' },
  { name: '渋谷区', file: 'shibuya.json' },
  { name: '中野区', file: 'nakano.json' },
  { name: '杉並区', file: 'suginami.json' },
  { name: '豊島区', file: 'toshima.json' },
  { name: '北区', file: 'kita.json' },
  { name: '荒川区', file: 'arakawa.json' },
  { name: '板橋区', file: 'itabashi.json' },
  { name: '練馬区', file: 'nerima.json' },
  { name: '足立区', file: 'adachi.json' },
  { name: '葛飾区', file: 'katsushika.json' },
  { name: '江戸川区', file: 'edogawa.json' },
];

const API_BASE = 'https://geolonia.github.io/japanese-addresses/api/ja/東京都/';
const OUTPUT_DIR = path.join(__dirname, 'public/addresses/major-cities/tokyo');

(async () => {
  for (const ward of TOKYO_WARDS) {
    const url = API_BASE + encodeURIComponent(ward.name) + '.json';
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      // 既存形式に合わせて"town"のみ抽出
      const towns = data.map(item => ({ town: item.town }));
      fs.writeFileSync(path.join(OUTPUT_DIR, ward.file), JSON.stringify(towns, null, 2));
      console.log(`${ward.name} → ${ward.file} 完了 (${towns.length}件)`);
    } catch (e) {
      console.error(`${ward.name} (${ward.file}) 取得失敗:`, e.message);
    }
  }
})(); 