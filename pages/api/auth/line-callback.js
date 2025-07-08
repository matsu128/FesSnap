import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

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
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // 環境変数チェック
  if (!clientId || !clientSecret || !supabaseJwtSecret || !supabaseUrl || !supabaseServiceKey) {
    return res.status(500).send('環境変数の設定が不足しています');
  }

  // Supabaseクライアント（サービスロール）
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // 1. LINEのトークンエンドポイントでアクセストークン取得
    const tokenRes = await fetch('https://api.line.me/oauth2/v2.1/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      })
    });
    
    const tokenJson = await tokenRes.json();
    
    if (!tokenJson.access_token) {
      console.error('LINE token error:', tokenJson);
      return res.status(400).send('アクセストークン取得失敗: ' + (tokenJson.error_description || tokenJson.error || 'Unknown error'));
    }

    // 2. プロフィール取得
    const actualProfileRes = await fetch('https://api.line.me/v2/profile', {
      headers: { Authorization: `Bearer ${tokenJson.access_token}` }
    });
    
    const profile = await actualProfileRes.json();
    
    if (!profile.userId) {
      console.error('LINE profile error:', profile);
      return res.status(400).send('プロフィール取得失敗: ' + (profile.error_description || profile.error || 'Unknown error'));
    }

    // 3. Supabaseユーザーを作成/検索
    console.log('Creating/Searching Supabase user for LINE ID:', profile.userId);
    
    // 既存ユーザーを検索
    const { data: existingUser, error: searchError } = await supabase
      .from('auth.users')
      .select('*')
      .eq('raw_user_meta_data->>provider', 'line')
      .eq('raw_user_meta_data->>sub', profile.userId)
      .single();

    let userId;
    
    if (existingUser) {
      // 既存ユーザーが見つかった場合
      console.log('Existing user found:', existingUser.id);
      userId = existingUser.id;
    } else {
      // 新規ユーザーを作成
      console.log('Creating new user for LINE ID:', profile.userId);
      
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: `${profile.userId}@line.local`, // 仮のメールアドレス
        password: Math.random().toString(36).substring(2), // ランダムパスワード
        user_metadata: {
          name: profile.displayName,
          picture: profile.pictureUrl,
          provider: 'line',
          sub: profile.userId
        },
        app_metadata: {
          provider: 'line',
          providers: ['line']
        },
        email_confirm: true // メール確認をスキップ
      });
      
      if (createError) {
        console.error('User creation error:', createError);
        return res.status(500).send('ユーザー作成失敗: ' + createError.message);
      }
      
      userId = newUser.user.id;
      console.log('New user created:', userId);
    }

    // 4. Supabase用JWT生成（正確な形式）
    const payload = {
      sub: userId, // SupabaseユーザーIDを使用
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
        id: userId,
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