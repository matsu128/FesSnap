import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const { code, state, error, error_description } = req.query;

  // エラーパラメータがある場合はトップページにリダイレクト＋localStorageにエラー内容をセット
  if (error) {
    return res.send(`
      <script>
        localStorage.setItem('line_error', 'line_auth_failed');
        window.location.href = '/';
      </script>
    `);
  }
  if (!code) {
    return res.send(`
      <script>
        localStorage.setItem('line_error', 'line_no_code');
        window.location.href = '/';
      </script>
    `);
  }

  const clientId = process.env.NEXT_PUBLIC_LINE_CLIENT_ID;
  const clientSecret = process.env.LINE_CLIENT_SECRET;
  const redirectUri = `${req.headers['x-forwarded-proto'] || 'https'}://${req.headers.host}/api/auth/line-callback`;
  const supabaseJwtSecret = process.env.SUPABASE_JWT_SECRET;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!clientId || !clientSecret || !supabaseJwtSecret || !supabaseUrl || !supabaseServiceKey) {
    return res.send(`
      <script>
        localStorage.setItem('line_error', 'line_env_error');
        window.location.href = '/';
      </script>
    `);
  }

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
      return res.send(`
        <script>
          localStorage.setItem('line_error', 'line_token_error');
          window.location.href = '/';
        </script>
      `);
    }

    // 2. プロフィール取得
    const actualProfileRes = await fetch('https://api.line.me/v2/profile', {
      headers: { Authorization: `Bearer ${tokenJson.access_token}` }
    });
    const profile = await actualProfileRes.json();
    if (!profile.userId) {
      return res.send(`
        <script>
          localStorage.setItem('line_error', 'line_profile_error');
          window.location.href = '/';
        </script>
      `);
    }

    // 3. Supabaseユーザーを作成/検索
    let userId;
    let existingUser = null;
    // 1. まずメールアドレスで既存ユーザーを検索
    if (tokenJson.email) {
      const { data: emailUser } = await supabase
        .from('auth.users')
        .select('*')
        .eq('email', tokenJson.email)
        .single();
      if (emailUser) {
        userId = emailUser.id;
        existingUser = emailUser;
      }
    }
    // 2. メールアドレスで見つからなければ、LINE userIdで検索
    if (!userId) {
      const { data: lineUser } = await supabase
        .from('auth.users')
        .select('*')
        .eq('raw_user_meta_data->>provider', 'line')
        .eq('raw_user_meta_data->>sub', profile.userId)
        .single();
      if (lineUser) {
        userId = lineUser.id;
        existingUser = lineUser;
      }
    }
    // 3. どちらにも該当しなければ新規作成
    if (!userId) {
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: tokenJson.email || `${profile.userId}@line.local`,
        password: Math.random().toString(36).substring(2),
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
        email_confirm: true
      });
      if (createError) {
        return res.send(`
          <script>
            localStorage.setItem('line_error', 'line_user_create:' + ${JSON.stringify(createError.message)});
            window.location.href = '/';
          </script>
        `);
      }
      userId = newUser.user.id;
    }

    // 4. Supabase用JWT生成
    const payload = {
      sub: userId,
      aud: 'authenticated',
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
      iat: Math.floor(Date.now() / 1000),
      iss: 'supabase',
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

    // 5. クライアントでセッションをセットするスクリプトを返す
    return res.send(`
      <script>
        (async () => {
          const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm');
          const supabase = createClient('${supabaseUrl}', '${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}');
          await supabase.auth.setSession({ access_token: '${token}', refresh_token: '${token}' });
          window.location.href = '/';
        })();
      </script>
    `);
  } catch (e) {
    return res.send(`
      <script>
        localStorage.setItem('line_error', 'line_auth_exception:' + ${JSON.stringify(e.message)});
        window.location.href = '/';
      </script>
    `);
  }
} 