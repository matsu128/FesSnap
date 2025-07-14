import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const { code, state, error, error_description } = req.query;

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
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!clientId || !clientSecret || !supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
    return res.send(`
      <script>
        localStorage.setItem('line_error', 'line_env_error');
        window.location.href = '/';
      </script>
    `);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // 1. LINEのトークンエンドポイントでid_tokenも取得
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
    if (!tokenJson.id_token) {
      return res.send(`
        <script>
          localStorage.setItem('line_error', 'line_token_error');
          window.location.href = '/';
        </script>
      `);
    }

    // 2. Supabase公式APIでセッション発行
    const { data, error: supaError } = await supabase.auth.admin.signInWithIdToken({
      provider: 'oidc',
      id_token: tokenJson.id_token,
      nonce: state || ''
    });
    if (supaError || !data || !data.session) {
      return res.send(`
        <script>
          localStorage.setItem('line_error', 'line_supabase_session_error:' + ${JSON.stringify(supaError?.message || 'no session')});
          window.location.href = '/';
        </script>
      `);
    }

    // 3. クライアントで公式セッションをセット
    return res.send(`
      <script>
        (async () => {
          const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm');
          const supabase = createClient('${supabaseUrl}', '${supabaseAnonKey}');
          await supabase.auth.setSession(${JSON.stringify(data.session)});
          window.location.href = '/';
        })();
      </script>
    `);
  } catch (e) {
    return res.send(`
      <script>
        localStorage.setItem('line_error', 'line_auth_exception:' + ${JSON.stringify(JSON.stringify(e))});
        window.location.href = '/';
      </script>
    `);
  }
} 