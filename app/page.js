"use client";
// LP（紹介ページ）
import LPMain from '../components/organisms/LPMain';
import Footer from '../components/molecules/Footer';
import Head from 'next/head';
import { useEffect, Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';

function HomePageInner() {
  const searchParams = useSearchParams();
  const [modalError, setModalError] = useState('');

  useEffect(() => {
    // クエリパラメータまたはlocalStorageからエラー取得
    let error = searchParams.get('error') || localStorage.getItem('line_error');
    if (error) {
      let msg = '認証エラーが発生しました。再度お試しください。';
      if (error === 'line_user_create') msg = 'LINEユーザー作成に失敗しました。';
      if (error === 'line_token_error') msg = 'LINE認証のアクセストークン取得に失敗しました。';
      if (error === 'line_profile_error') msg = 'LINEプロフィール取得に失敗しました。';
      if (error === 'line_session_failed') msg = 'LINEログイン後のセッション確立に失敗しました。';
      setModalError(msg);
      localStorage.removeItem('line_error');
      // クエリパラメータを消す
      if (window && window.history && error === searchParams.get('error')) {
        const url = new URL(window.location.href);
        url.searchParams.delete('error');
        window.history.replaceState({}, document.title, url.pathname);
      }
    }
  }, [searchParams]);

  return (
    <>
      <Head>
        <title>FesSnap（フェススナップ）｜イベント写真共有サービス</title>
        <meta name="description" content="FesSnapはイベントの感動をその場でみんなと共有できる新しい写真共有サービスです。QRコードで簡単参加、リアルタイムで思い出をシェア！" />
        <meta name="keywords" content="FesSnap,フェススナップ,イベント,写真共有,リアルタイム,QRコード,フェス,文化祭,パーティ,思い出,画像,シェア" />
        <meta property="og:title" content="FesSnap（フェススナップ）｜イベント写真共有サービス" />
        <meta property="og:description" content="イベントの感動をその場でみんなと。FesSnapはQRコードで簡単参加、リアルタイムで思い出をシェアできる新しい写真共有サービスです。" />
        <meta property="og:image" content="https://fessnap.com/ogp.png" />
        <meta property="og:url" content="https://fessnap.com/" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="FesSnap（フェススナップ）｜イベント写真共有サービス" />
        <meta name="twitter:description" content="イベントの感動をその場でみんなと。FesSnapはQRコードで簡単参加、リアルタイムで思い出をシェアできる新しい写真共有サービスです。" />
        <meta name="twitter:image" content="https://fessnap.com/ogp.png" />
        <link rel="canonical" href="https://fessnap.com/" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "FesSnap（フェススナップ）｜イベント写真共有サービス",
          "url": "https://fessnap.com/",
          "description": "イベントの感動をその場でみんなと共有できる新しい写真共有サービス"
        })}} />
      </Head>
      {modalError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl p-6 shadow-xl text-center">
            <div className="text-red-600 font-bold mb-2">{modalError}</div>
            <button className="mt-4 px-6 py-2 bg-blue-500 text-white rounded" onClick={()=>setModalError('')}>閉じる</button>
          </div>
        </div>
      )}
      <h1 style={{position:'absolute',left:'-9999px',height:'1px',width:'1px',overflow:'hidden'}}>FesSnap（フェススナップ）｜イベント写真共有サービス</h1>
      <LPMain />
      <Footer />
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomePageInner />
    </Suspense>
  );
}
