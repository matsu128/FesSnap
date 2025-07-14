import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { email } = req.query;
    if (email) {
      // Service Role Keyで管理者クライアントを作成
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      if (!supabaseUrl || !serviceRoleKey) {
        return res.status(500).json({ error: 'Supabase管理者キーが設定されていません' });
      }
      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({ email });
      if (error) return res.status(500).json({ error: error.message });
      const exists = data?.users?.some(u => u.email === email);
      return res.status(200).json({ exists });
    }
    // ...既存のダミーユーザーjson返却は残す
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(process.cwd(), 'dummy', 'users.json');
    const data = fs.readFileSync(filePath, 'utf8');
    res.status(200).json(JSON.parse(data));
  }
  res.status(405).json({ error: 'Method not allowed' });
} 