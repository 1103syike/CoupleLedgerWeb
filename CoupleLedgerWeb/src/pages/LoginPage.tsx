import { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function LoginPage() {
  const { signIn, signUp, error, clearError } = useApp();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const submit = async () => {
    setBusy(true);
    setLocalError(null);
    clearError();
    try {
      if (isRegister) {
        await signUp(email, password, displayName);
      } else {
        await signIn(email, password);
      }
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : '發生錯誤');
    } finally {
      setBusy(false);
    }
  };

  const err = localError ?? error;

  return (
    <div className="screen center" style={{ flexDirection: 'column' }}>
      <div className="auth-card">
        <div className="hero-wrap">
          <img src="/hero.png" alt="我們的帳本" className="hero-img lg" />
          <h1 className="brand-title">我們的帳本</h1>
          <p className="brand-sub">一起記帳，慢慢變可愛 ♡</p>
        </div>
        {isRegister && (
          <div className="form-group">
            <label>暱稱</label>
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </div>
        )}
        <div className="form-group">
          <label>Email</label>
          <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="form-group">
          <label>密碼（至少 6 碼）</label>
          <input type="password" autoComplete={isRegister ? 'new-password' : 'current-password'} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {err && <p style={{ color: 'var(--danger)', marginBottom: '1rem', fontSize: '0.875rem' }}>{err}</p>}
        <button type="button" className="btn btn-primary" disabled={busy} onClick={submit}>
          {isRegister ? '註冊並開始' : '登入'}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          style={{ marginTop: '0.75rem' }}
          onClick={() => {
            setIsRegister(!isRegister);
            setLocalError(null);
            clearError();
          }}
        >
          {isRegister ? '已有帳號？登入' : '還沒帳號？註冊'}
        </button>
      </div>
    </div>
  );
}
