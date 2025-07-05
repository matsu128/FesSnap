import Modal from '../atoms/Modal';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function LoginModal({ isOpen, onClose }) {
  const [showSignUp, setShowSignUp] = useState(false);
  const [showEmailConfirm, setShowEmailConfirm] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  
  // 認証状態の変更を監視
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // メール確認完了後のログイン成功
        if (showEmailConfirm) {
          setShowEmailConfirm(false);
          alert('メール確認が完了しました！ログインしました。');
          onClose();
        } else {
          // OAuth認証成功時（Google・LINE）
          onClose();
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [showEmailConfirm, onClose]);
  
  return (
    <>
      <Modal isOpen={isOpen && !showEmailConfirm} onClose={onClose}>
        <div className="flex flex-col items-center p-4 w-full max-w-xs mx-auto">
          <div className="font-extrabold text-xl mb-4 text-slate-700">{showSignUp ? '新規作成' : 'ログイン'}</div>
          <EmailLoginForm 
            isSignUp={showSignUp} 
            onSwitch={() => setShowSignUp(v => !v)} 
            onEmailConfirm={(email) => {
              setUserEmail(email);
              setShowEmailConfirm(true);
            }}
            onClose={onClose}
          />
          <div className="flex items-center w-full my-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="mx-2 text-gray-400 text-xs whitespace-nowrap">またはSNSでログイン</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          <div className="grid grid-cols-2 gap-3 w-full mb-2">
            <OAuthButton provider="google" label="Google" icon={<Icon type="google" className="w-6 h-6" />} />
            <OAuthButton provider="line" label="LINE" icon={<Icon type="line" className="w-6 h-6" />} isLine />
          </div>
        </div>
      </Modal>
      
      {/* メール確認モーダル */}
      <Modal isOpen={showEmailConfirm} onClose={() => {
        setShowEmailConfirm(false);
        onClose();
      }}>
        <div className="flex flex-col items-center p-6 w-full max-w-sm mx-auto text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Icon type="mail" className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="font-bold text-xl mb-2 text-slate-700">メール確認をお願いします</h3>
          <p className="text-gray-600 mb-4">
            <span className="font-medium">{userEmail}</span> に確認メールを送信しました。
          </p>
          <p className="text-sm text-gray-500 mb-6">
            メール内のリンクをクリックして、アカウントの確認を完了してください。
          </p>
          <div className="text-xs text-gray-400 mb-4">
            ※ メール確認後、自動的にログインされます
          </div>
          <Button 
            onClick={() => {
              setShowEmailConfirm(false);
              onClose();
            }} 
            className="w-full bg-slate-700 text-white py-3"
          >
            閉じる
          </Button>
        </div>
      </Modal>
    </>
  );
}

function EmailLoginForm({ isSignUp, onSwitch, onEmailConfirm, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const handleAuth = async () => {
    setError('');
    setLoading(true);
    
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        
        if (error) {
          // エラーメッセージを日本語化
          let errorMessage = '新規作成に失敗しました';
          if (error.message.includes('already registered')) {
            errorMessage = 'このメールアドレスは既に登録されています';
          } else if (error.message.includes('password')) {
            errorMessage = 'パスワードは6文字以上で入力してください';
          } else if (error.message.includes('email')) {
            errorMessage = '有効なメールアドレスを入力してください';
          } else if (error.message.includes('network')) {
            errorMessage = 'ネットワークエラーが発生しました。しばらく待ってから再試行してください';
          }
          setError(errorMessage);
        } else {
          // 新規作成成功時の処理
          if (data.session) {
            // セッションがある場合（メール確認不要）
            setError('');
            onClose(); // モーダルを閉じる
          } else {
            // セッションがない場合（メール確認が必要）
            setError('');
            onEmailConfirm(email);
          }
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          // エラーメッセージを日本語化
          let errorMessage = 'ログインに失敗しました';
          if (error.message.includes('Invalid login credentials')) {
            errorMessage = 'メールアドレスまたはパスワードが正しくありません';
          } else if (error.message.includes('Email not confirmed')) {
            errorMessage = 'メールアドレスの確認が完了していません。確認メールをご確認ください';
          } else if (error.message.includes('User not found')) {
            errorMessage = 'このメールアドレスは登録されていません';
          } else if (error.message.includes('network')) {
            errorMessage = 'ネットワークエラーが発生しました。しばらく待ってから再試行してください';
          }
          setError(errorMessage);
        } else {
          // ログイン成功時の処理
          setError('');
          onClose(); // モーダルを閉じる
        }
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
      
      // LINE認証URL（シンプルな認証フロー）
      const lineAuthUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${state}&scope=${scope}`;
      
      // 環境変数チェック
      if (!clientId) {
        alert('LINE認証の設定が不完全です。管理者にお問い合わせください。');
        return;
      }
      
      // 直接LINE認証ページに遷移
      window.location.href = lineAuthUrl;
    } else {
      supabase.auth.signInWithOAuth({ 
        provider,
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      }).then(({ data, error }) => {
        if (error) {
          alert('OAuth認証に失敗しました: ' + error.message);
        }
      }).catch((e) => {
        alert('OAuth認証でエラーが発生しました: ' + e.message);
      });
    }
  };
  
  return (
    <button onClick={handleOAuth} className={`flex items-center justify-center w-full py-3 rounded shadow-sm border bg-white text-base font-bold gap-2 ${provider === 'google' ? 'border-gray-200' : ''}`}>
      {icon}
      <span>{label}</span>
    </button>
  );
} 