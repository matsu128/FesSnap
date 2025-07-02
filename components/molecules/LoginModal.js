import Modal from '../atoms/Modal';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function LoginModal({ isOpen, onClose }) {
  const [showSignUp, setShowSignUp] = useState(false);
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col items-center p-4 w-full max-w-xs mx-auto">
        <div className="font-extrabold text-xl mb-4 text-slate-700">{showSignUp ? '新規作成' : 'ログイン'}</div>
        <EmailLoginForm isSignUp={showSignUp} onSwitch={() => setShowSignUp(v => !v)} />
        <div className="flex items-center w-full my-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="mx-2 text-gray-400 text-xs whitespace-nowrap">またはSNSでログイン</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <div className="grid grid-cols-2 gap-3 w-full mb-2">
          <OAuthButton provider="google" label="Google" icon={<Icon type="google" className="w-6 h-6" />} />
          <OAuthButton provider="twitter" label="X" icon={<Icon type="twitter" className="w-6 h-6" />} />
          <OAuthButton provider="line" label="LINE" icon={<Icon type="line" className="w-6 h-6" />} isLine />
        </div>
      </div>
    </Modal>
  );
}

function EmailLoginForm({ isSignUp, onSwitch }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const handleAuth = async () => {
    setError('');
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUpWithPassword({ email, password });
        if (error) setError(error.message);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setError(error.message);
      }
    } catch (e) {
      setError('認証エラーが発生しました');
    }
    setLoading(false);
  };
  return (
    <div className="w-full flex flex-col items-center mb-2">
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="メールアドレス" className="w-full mb-2 px-3 py-3 border rounded text-base" autoComplete="email" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="パスワード" className="w-full mb-2 px-3 py-3 border rounded text-base" autoComplete="current-password" />
      {error && <div className="text-red-500 text-sm mb-2 w-full text-center">{error}</div>}
      <Button onClick={handleAuth} className="w-full mb-2 bg-slate-700 text-white text-base py-3" disabled={loading}>{isSignUp ? '新規作成' : 'ログイン'}</Button>
      <Button onClick={onSwitch} className="w-full mb-2 bg-gray-100 text-gray-700 text-base py-3">{isSignUp ? 'ログイン画面へ' : '新規作成'}</Button>
    </div>
  );
}

function OAuthButton({ provider, label, icon, isLine }) {
  const handleOAuth = () => {
    if (isLine) {
      const clientId = process.env.NEXT_PUBLIC_LINE_CLIENT_ID || (typeof window !== 'undefined' ? window.NEXT_PUBLIC_LINE_CLIENT_ID : '');
      const redirectUri = encodeURIComponent(`${window.location.origin}/api/auth/line-callback`);
      const state = Math.random().toString(36).substring(2);
      const scope = 'profile openid email';
      const lineAuthUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=${scope}`;
      window.location.href = lineAuthUrl;
    } else {
      supabase.auth.signInWithOAuth({ provider });
    }
  };
  return (
    <button onClick={handleOAuth} className={`flex items-center justify-center w-full py-3 rounded shadow-sm border bg-white text-base font-bold gap-2 ${provider === 'google' ? 'border-gray-200' : ''}`}>
      {icon}
      <span>{label}</span>
    </button>
  );
} 