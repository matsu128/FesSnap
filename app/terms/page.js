import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 戻るボタン */}
      <div className="absolute top-4 left-4 z-10">
        <Link 
          href="/"
          className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          戻る
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">利用規約</h1>
          
          <div className="space-y-8 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第1条（適用）</h2>
              <p className="mb-4">
                本規約は、FesSnap（フェススナップ）（以下「当サービス」）の利用に関する条件を定めるものです。
                ユーザーは本規約に従って当サービスを利用するものとします。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第2条（サービスの内容）</h2>
              <p className="mb-4">
                当サービスは、イベント参加者が写真を投稿・閲覧できる写真共有サービスです。
                主な機能は以下の通りです：
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>イベントの作成・管理</li>
                <li>QRコードによる簡単参加</li>
                <li>写真の投稿・閲覧</li>
                <li>リアルタイムでの写真共有</li>
                <li>有料プランによる機能拡張</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第3条（利用対象）</h2>
              <p className="mb-4">
                当サービスの利用は、日本国内に居住する13歳以上の方に限ります。
                13歳未満の方は、保護者の同意を得た上で利用してください。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第4条（禁止行為）</h2>
              <p className="mb-4">ユーザーは、当サービスの利用にあたり、以下の行為を行ってはなりません：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>著作権、商標権、その他の知的財産権を侵害する行為</li>
                <li>公序良俗に反する投稿や行為</li>
                <li>他のユーザーや第三者を誹謗中傷する行為</li>
                <li>当サービスの運営を妨害する行為</li>
                <li>法令に違反する行為</li>
                <li>その他、当社が不適切と判断する行為</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第5条（免責事項）</h2>
              <p className="mb-4">
                当社は、以下の場合について責任を負いません：
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>サービス停止やデータ損失による損害</li>
                <li>ユーザー間のトラブル</li>
                <li>投稿内容による損害</li>
                <li>不可抗力によるサービス停止</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第6条（アカウント管理）</h2>
              <p className="mb-4">
                ユーザーは、自己の責任においてアカウント情報を管理するものとします。
                当社は、規約違反や不適切な行為があった場合、事前通知なくアカウントの停止または削除を行う場合があります。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第7条（著作権・知的財産権）</h2>
              <p className="mb-4">
                投稿された写真の著作権は、投稿者に帰属します。
                当サービスのシステムやデザインに関する知的財産権は、当社に帰属します。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第8条（有料プラン）</h2>
              <p className="mb-4">
                有料プランの利用については、別途定める料金体系に従います。
                決済はStripeを通じて行われ、返金については返金ポリシーに従います。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第9条（規約の変更）</h2>
              <p className="mb-4">
                当社は、必要に応じて本規約を変更することができます。
                変更は、当サービス上での告知をもって効力を生じるものとします。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">第10条（準拠法・管轄裁判所）</h2>
              <p className="mb-4">
                本規約の解釈にあたっては、日本法を準拠法とします。
                本規約に関して紛争が生じた場合には、東京地方裁判所を第一審の専属管轄裁判所とします。
              </p>
            </section>

            <div className="border-t pt-8 mt-8">
              <p className="text-sm text-gray-500">
                制定日：2024年1月1日<br />
                最終更新日：2024年12月1日
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 