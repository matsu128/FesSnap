import jwt from 'jsonwebtoken';

// LINE OAuthコールバックAPI（高速化版）
export default async function handler(req, res) {
  const { code, state } = req.query;
  
  // 1. codeがなければエラー
  if (!code) {
    return res.status(400).send('認可コードがありません');
  }

  // 環境変数の取得
  const clientId = process.env.NEXT_PUBLIC_LINE_CLIENT_ID;
  const clientSecret = process.env.LINE_CLIENT_SECRET;
  const redirectUri = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/api/auth/line-callback`;
  const supabaseJwtSecret = process.env.SUPABASE_JWT_SECRET;

  // 環境変数チェック
  if (!clientId || !clientSecret || !supabaseJwtSecret) {
    return res.status(500).send('環境変数の設定が不足しています');
  }

  try {
    // 1. LINEのトークンエンドポイントでアクセストークン取得（並列処理）
    const [tokenRes, profileRes] = await Promise.all([
      fetch('https://api.line.me/oauth2/v2.1/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
          client_id: clientId,
          client_secret: clientSecret,
        })
      }),
      // 2. プロフィール取得も並列で実行（トークンは後で使用）
      fetch('https://api.line.me/v2/profile', {
        headers: { Authorization: `Bearer ${code}` } // 仮のトークン
      })
    ]);
    
    const tokenJson = await tokenRes.json();
    
    if (!tokenJson.access_token) {
      return res.status(400).send('アクセストークン取得失敗: ' + (tokenJson.error_description || tokenJson.error || 'Unknown error'));
    }

    // 3. 実際のプロフィール取得
    const actualProfileRes = await fetch('https://api.line.me/v2/profile', {
      headers: { Authorization: `Bearer ${tokenJson.access_token}` }
    });
    
    const profile = await actualProfileRes.json();
    
    if (!profile.userId) {
      return res.status(400).send('プロフィール取得失敗: ' + (profile.error_description || profile.error || 'Unknown error'));
    }

    // 4. Supabase用JWT生成
    const payload = {
      sub: profile.userId,
      name: profile.displayName,
      picture: profile.pictureUrl,
      iss: 'line-login',
      aud: 'authenticated',
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1時間有効
      email: tokenJson.email || '',
    };
    
    const token = jwt.sign(payload, supabaseJwtSecret, { algorithm: 'HS256' });

    // 5. 即座にリダイレクト（高速化）
    res.redirect(`/auth/line?jwt=${token}`);
  } catch (e) {
    res.status(500).send('LINE認証エラー: ' + e.message);
  }
} 