import Link from 'next/link';

export default function LegalPage() {
  return (
    <div className="w-full min-h-screen flex flex-col items-center bg-white px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">特定商取引法に基づく表記</h1>
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-md p-4 mb-8">
        <table className="w-full border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1 w-1/3">項目</th>
              <th className="border px-2 py-1">内容</th>
            </tr>
          </thead>
          <tbody>
            <tr><td className="border px-2 py-1">販売業者の名称</td><td className="border px-2 py-1">02Lab（屋号）</td></tr>
            <tr><td className="border px-2 py-1">運営統括責任者</td><td className="border px-2 py-1">松本 颯</td></tr>
            <tr><td className="border px-2 py-1">所在地</td><td className="border px-2 py-1">福岡県糟屋郡宇美町平和1丁目5番2号</td></tr>
            <tr><td className="border px-2 py-1">電話番号</td><td className="border px-2 py-1">070-9138-0499</td></tr>
            <tr><td className="border px-2 py-1">メールアドレス</td><td className="border px-2 py-1">soumatsumoto1282002@icloud.com</td></tr>
            <tr><td className="border px-2 py-1">販売URL</td><td className="border px-2 py-1">https://fessnap.com</td></tr>
            <tr><td className="border px-2 py-1">販売価格</td><td className="border px-2 py-1">各商品ページに記載（消費税込）</td></tr>
            <tr><td className="border px-2 py-1">商品代金以外の必要料金</td><td className="border px-2 py-1">送料・振込手数料など（該当時は商品ページに記載）</td></tr>
            <tr><td className="border px-2 py-1">支払い方法</td><td className="border px-2 py-1">クレジットカード（Stripe）</td></tr>
            <tr><td className="border px-2 py-1">支払い時期</td><td className="border px-2 py-1">ご注文確定時に決済が確定</td></tr>
            <tr><td className="border px-2 py-1">引き渡し時期</td><td className="border px-2 py-1">ご注文から即日～3営業日以内に納品またはサービス提供</td></tr>
            <tr><td className="border px-2 py-1">返品・キャンセルポリシー</td><td className="border px-2 py-1">デジタル商材のため、原則として返品・キャンセルはお受けしておりません</td></tr>
          </tbody>
        </table>
      </div>
      <Link href="/" className="inline-block px-6 py-3 bg-slate-700 text-white rounded-full font-bold shadow hover:bg-slate-800 transition mb-4">トップへ戻る</Link>
    </div>
  );
} 