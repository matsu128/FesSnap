"use client";
// LP（紹介ページ）
import LPMain from '../components/organisms/LPMain';
import Head from 'next/head';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function Home() {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // URLパラメータからエラーを確認
    const error = searchParams.get('error');
    
    if (error === 'line_interaction_required') {
      alert('LINEアプリでの認証が必要です。再度LINEログインをお試しください。');
    } else if (error === 'line_auth_failed') {
      alert('LINE認証に失敗しました。再度お試しください。');
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
      <h1 style={{position:'absolute',left:'-9999px',height:'1px',width:'1px',overflow:'hidden'}}>FesSnap（フェススナップ）｜イベント写真共有サービス</h1>
      <LPMain />
    </>
  );
}
