import { useState } from 'react';
import { useApp } from '../context/AppContext';

type Mode = 'choose' | 'create' | 'join';

export default function OnboardingPage() {
  const { createSpace, joinSpace } = useApp();
  const [mode, setMode] = useState<Mode>('choose');
  const [spaceName, setSpaceName] = useState('我們的帳本');
  const [inviteCode, setInviteCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : '發生錯誤');
    } finally {
      setBusy(false);
    }
  };

  if (mode === 'choose') {
    return (
      <div className="screen center" style={{ flexDirection: 'column', gap: '1rem' }}>
        <h1>建立或加入帳本</h1>
        <p className="muted" style={{ textAlign: 'center' }}>
          兩人共用一個帳本，資料會即時同步。
        </p>
        <button type="button" className="btn btn-primary" onClick={() => setMode('create')}>
          建立新帳本
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => setMode('join')}>
          輸入邀請碼加入
        </button>
      </div>
    );
  }

  if (mode === 'create') {
    return (
      <div className="screen">
        <h1>建立帳本</h1>
        <div className="form-group" style={{ marginTop: '1rem' }}>
          <label>帳本名稱</label>
          <input value={spaceName} onChange={(e) => setSpaceName(e.target.value)} />
        </div>
        {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
        <button type="button" className="btn btn-primary" disabled={busy} onClick={() => run(() => createSpace(spaceName))}>
          建立並產生邀請碼
        </button>
        <button type="button" className="btn btn-ghost" style={{ marginTop: '0.75rem' }} onClick={() => setMode('choose')}>
          返回
        </button>
      </div>
    );
  }

  return (
    <div className="screen">
      <h1>加入帳本</h1>
      <div className="form-group" style={{ marginTop: '1rem' }}>
        <label>邀請碼（6 碼）</label>
        <input
          value={inviteCode}
          maxLength={6}
          onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
          placeholder="ABCDEF"
        />
      </div>
      {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
      <button
        type="button"
        className="btn btn-primary"
        disabled={busy || inviteCode.length < 6}
        onClick={() => run(() => joinSpace(inviteCode))}
      >
        加入帳本
      </button>
      <button type="button" className="btn btn-ghost" style={{ marginTop: '0.75rem' }} onClick={() => setMode('choose')}>
        返回
      </button>
    </div>
  );
}
