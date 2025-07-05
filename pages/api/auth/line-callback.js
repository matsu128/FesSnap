import jwt from 'jsonwebtoken';

// LINE OAuthコールバックAPI（高速化版）
export default async function handler(req, res) {
  const { code, state, error, error_description } = req.query;
  
  // エラーパラメータがある場合はエラーページにリダイレクト
  if (error) {
    console.error('LINE OAuth error:', error, error_description);
    
    // INTERACTION_REQUIREDエラーの場合は、再度認証を促す
    if (error === 'INTERACTION_REQUIRED') {
      return res.redirect('/?error=line_interaction_required');
    }
    
    // その他のエラーは一般的なエラーページに
    return res.redirect('/?error=line_auth_failed');
  }
  
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
      console.error('LINE token error:', tokenJson);
      return res.status(400).send('アクセストークン取得失敗: ' + (tokenJson.error_description || tokenJson.error || 'Unknown error'));
    }

    // 3. 実際のプロフィール取得
    const actualProfileRes = await fetch('https://api.line.me/v2/profile', {
      headers: { Authorization: `Bearer ${tokenJson.access_token}` }
    });
    
    const profile = await actualProfileRes.json();
    
    if (!profile.userId) {
      console.error('LINE profile error:', profile);
      return res.status(400).send('プロフィール取得失敗: ' + (profile.error_description || profile.error || 'Unknown error'));
    }

    // 4. Supabase用JWT生成（正確な形式）
    const payload = {
      sub: profile.userId,
      aud: 'authenticated',
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1時間有効
      iat: Math.floor(Date.now() / 1000),
      iss: 'supabase',  // Supabaseが期待する形式
      role: 'authenticated',
      user_metadata: {
        name: profile.displayName,
        picture: profile.pictureUrl,
        email: tokenJson.email || '',
        provider: 'line',
        providers: ['line']
      },
      app_metadata: {
        provider: 'line',
        providers: ['line']
      }
    };
    
    const token = jwt.sign(payload, supabaseJwtSecret, { algorithm: 'HS256' });

    // 5. セッション情報を含むリダイレクト（Supabase形式）
    const sessionData = {
      access_token: token,
      refresh_token: token,
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      token_type: 'bearer',
      user: {
        id: profile.userId,
        aud: 'authenticated',
        role: 'authenticated',
        email: tokenJson.email || '',
        user_metadata: payload.user_metadata,
        app_metadata: payload.app_metadata,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };
    
    console.log('Generated session data:', sessionData);
    
    // セッションデータをURLパラメータとして渡す（長さチェック）
    const sessionParam = encodeURIComponent(JSON.stringify(sessionData));
    console.log('Session param length:', sessionParam.length);
    
    // URLパラメータが長すぎる場合はlocalStorageを使用
    if (sessionParam.length > 2000) {
      // 短縮版：JWTトークンのみを渡す
      res.redirect(`/auth/line?jwt=${token}`);
    } else {
      res.redirect(`/auth/line?session=${sessionParam}`);
    }
  } catch (e) {
    console.error('LINE auth error:', e);
    res.status(500).send('LINE認証エラー: ' + e.message);
  }
} 