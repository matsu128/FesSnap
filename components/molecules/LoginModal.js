import Modal from '../atoms/Modal';
import Button from '../atoms/Button';
import Icon from '../atoms/Icon';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginModal({ isOpen, onClose }) {
  const { isLoggedIn, signIn, signUp, signInWithOAuth } = useAuth();
  const [showSignUp, setShowSignUp] = useState(false);
  const [showEmailConfirm, setShowEmailConfirm] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetPassword, setResetPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const router = useRouter();
  const params = useSearchParams();

  // パスワードリセットリンクから遷移した場合の検知
  useEffect(() => {
    const type = params.get('type');
    if (type === 'recovery') {
      setShowReset(true);
    }
  }, [params]);
  
  // 認証状態の変更を監視
  useEffect(() => {
    if (isLoggedIn && isOpen) {
      onClose();
    }
  }, [isLoggedIn, isOpen, onClose]);
  
  return (
    <>
      <Modal isOpen={isOpen && !showEmailConfirm} onClose={onClose}>
        <div className="flex flex-col items-center p-4 w-full max-w-xs mx-auto">
          <div className="font-extrabold text-xl mb-4 text-slate-700">
            {showReset ? '新しいパスワード設定' : showForgot ? 'パスワード再設定' : showSignUp ? '新規作成' : 'ログイン'}
          </div>
          {showReset ? (
            resetSuccess ? (
              <div className="w-full text-center mb-4">
                <div className="text-green-600 font-bold mb-2">パスワードを変更しました</div>
                <Button onClick={() => { setShowReset(false); setResetSuccess(false); setResetPassword(''); setResetError(''); onClose(); }} className="w-full bg-slate-700 text-white py-3">ログイン画面へ</Button>
              </div>
            ) : (
              <form className="w-full flex flex-col items-center mb-2" onSubmit={async (e) => {
                e.preventDefault();
                setResetError('');
                if (!resetPassword || resetPassword.length < 6) {
                  setResetError('新しいパスワードは6文字以上で入力してください');
                  return;
                }
                const { error } = await supabase.auth.updateUser({ password: resetPassword });
                if (error) {
                  setResetError(error.message);
                } else {
                  setResetSuccess(true);
                }
              }}>
                <input type="password" value={resetPassword} onChange={e => setResetPassword(e.target.value)} placeholder="新しいパスワード" className="w-full mb-2 px-3 py-3 border rounded text-base" autoComplete="new-password" />
                {resetError && <div className="text-red-500 text-sm mb-2 w-full text-center">{resetError}</div>}
                <Button type="submit" className="w-full mb-2 bg-slate-700 text-white text-base py-3">パスワードを変更</Button>
              </form>
            )
          ) : showForgot ? (
            forgotSent ? (
              <div className="w-full text-center mb-4">
                <div className="text-green-600 font-bold mb-2">パスワード再設定メールを送信しました</div>
                <div className="text-gray-500 text-sm mb-4">メール内のリンクからパスワードを再設定してください。</div>
                <Button onClick={() => { setShowForgot(false); setForgotSent(false); setForgotEmail(''); setForgotError(''); }} className="w-full bg-slate-700 text-white py-3">ログイン画面へ戻る</Button>
              </div>
            ) : (
              <form className="w-full flex flex-col items-center mb-2" onSubmit={async (e) => {
                e.preventDefault();
                setForgotError('');
                if (!forgotEmail) {
                  setForgotError('メールアドレスを入力してください');
                  return;
                }
                const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail);
                if (error) {
                  setForgotError(error.message);
                } else {
                  setForgotSent(true);
                }
              }}>
                <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="メールアドレス" className="w-full mb-2 px-3 py-3 border rounded text-base" autoComplete="email" />
                {forgotError && <div className="text-red-500 text-sm mb-2 w-full text-center">{forgotError}</div>}
                <Button type="submit" className="w-full mb-2 bg-slate-700 text-white text-base py-3">再設定メールを送信</Button>
                <Button type="button" onClick={() => { setShowForgot(false); setForgotError(''); }} className="w-full mb-2 bg-gray-100 text-gray-700 text-base py-3">ログイン画面へ戻る</Button>
              </form>
            )
          ) : (
            <>
              <EmailLoginForm 
                isSignUp={showSignUp} 
                onSwitch={() => setShowSignUp(v => !v)} 
                onEmailConfirm={(email) => {
                  setUserEmail(email);
                  setShowEmailConfirm(true);
                }}
                onClose={onClose}
              />
              <div className="w-full flex justify-center mb-2">
                <button className="text-xs text-blue-500 hover:underline" onClick={() => setShowForgot(true)}>
                  パスワードを忘れた場合
                </button>
              </div>
              <div className="flex items-center w-full my-4">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="mx-2 text-gray-400 text-xs whitespace-nowrap">またはSNSでログイン</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <div className="flex justify-center w-full mb-2">
                <div className="w-full max-w-xs">
                  <OAuthButton provider="google" label="Google" icon={<Icon type="google" className="w-6 h-6" />} />
                </div>
                {/* <OAuthButton provider="line" label="LINE" icon={<Icon type="line" className="w-6 h-6" />} isLine /> */}
              </div>
            </>
          )}
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
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false); // メール存在チェック中

  const isEmailValid = email.trim().length > 0;
  const isPasswordValid = password.trim().length > 0;
  const isFormValid = isEmailValid && isPasswordValid && !loading && !checking;

  const handleAuth = async () => {
    setError('');
    if (!isEmailValid || !isPasswordValid) {
      setError('メールアドレスとパスワードは必須です');
      return;
    }
    setLoading(true);
    try {
      if (isSignUp) {
        setChecking(true);
        // メールアドレス存在チェック
        const res = await fetch(`/api/users?email=${encodeURIComponent(email)}`);
        const json = await res.json();
        setChecking(false);
        if (json.exists) {
          setError('このメールアドレスは既に登録されています');
          setLoading(false);
          return;
        }
        // 存在しなければ新規作成
        const { data, error } = await signUp(email, password);
        if (error) {
          let errorMessage = '';
          if (
            error.message.includes('already registered') ||
            error.message.includes('User already registered') ||
            error.message.includes('メールアドレスは既に登録されています')
          ) {
            errorMessage = 'このメールアドレスは既に登録されています';
          } else if (error.message.includes('password')) {
            errorMessage = 'パスワードは6文字以上で入力してください';
          } else if (error.message.includes('email')) {
            errorMessage = '有効なメールアドレスを入力してください';
          } else if (error.message.includes('network')) {
            errorMessage = 'ネットワークエラーが発生しました。しばらく待ってから再試行してください';
          } else if (error.message.includes('Anonymous sign-ins are disabled')) {
            errorMessage = '匿名サインインは無効化されています。メールアドレスでログインしてください';
          } else {
            errorMessage = 'エラーが発生しました: ' + error.message;
          }
          setError(errorMessage);
          setLoading(false);
          return;
        }
        // 新規作成成功時の処理
        if (data.session) {
          setError('');
          onClose(); // モーダルを閉じる
        } else {
          setError('');
          onEmailConfirm(email);
        }
      } else {
        // ログイン
        const { data, error } = await signIn(email, password);
        if (error) {
          let errorMessage = '';
          if (error.message.includes('Invalid login credentials')) {
            errorMessage = 'メールアドレスまたはパスワードが正しくありません';
          } else if (error.message.includes('Email not confirmed')) {
            errorMessage = 'メールアドレスの確認が完了していません。確認メールをご確認ください';
          } else if (error.message.includes('User not found')) {
            errorMessage = 'このメールアドレスは登録されていません';
          } else if (error.message.includes('network')) {
            errorMessage = 'ネットワークエラーが発生しました。しばらく待ってから再試行してください';
          } else if (error.message.includes('Anonymous sign-ins are disabled')) {
            errorMessage = '匿名サインインは無効化されています。メールアドレスでログインしてください';
          } else {
            errorMessage = 'エラーが発生しました: ' + error.message;
          }
          setError(errorMessage);
        } else {
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
      <Button onClick={handleAuth} className="w-full mb-2 bg-slate-700 text-white text-base py-3" disabled={!isFormValid}>{isSignUp ? '新規作成' : 'ログイン'}</Button>
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
      if (!clientId) {
        alert('LINE認証の設定が不完全です。管理者にお問い合わせください。');
        return;
      }
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