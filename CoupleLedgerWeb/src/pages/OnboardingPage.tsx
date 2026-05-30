import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import AccountActions from '../components/AccountActions';
import * as fs from '../services/firestore';
import { formatFirebaseError } from '../lib/firebaseError';

type Mode = 'choose' | 'create' | 'join';

export default function OnboardingPage() {
  const { createSpace, joinSpace, firebaseUser } = useApp();
  const [mode, setMode] = useState<Mode>('choose');
  const [spaceName, setSpaceName] = useState('我們的帳本');
  const [inviteCode, setInviteCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rulesIssue, setRulesIssue] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseUser) {
      setRulesIssue(null);
      return;
    }
    fs.probeFirestoreRules().then(setRulesIssue);
  }, [firebaseUser]);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(formatFirebaseError(e));
    } finally {
      setBusy(false);
    }
  };

  const rulesBanner = rulesIssue ? (
    <div className="card" style={{ marginBottom: '1rem', borderColor: 'var(--danger)' }}>
      <p style={{ color: 'var(--danger)', marginBottom: '0.5rem' }}>{rulesIssue}</p>
      <p className="muted" style={{ fontSize: '0.875rem', marginBottom: '0.75rem' }}>
        請用電腦開 Firebase Console → Firestore → 規則，貼上專案裡的 firestore.rules，按「發布」。
      </p>
      <a
        className="btn btn-ghost"
        href="https://console.firebase.google.com/project/coupleledgerweb/firestore/rules"
        target="_blank"
        rel="noreferrer"
        style={{ display: 'inline-block', textDecoration: 'none' }}
      >
        開啟 Firebase 規則頁
      </a>
    </div>
  ) : null;

  if (mode === 'choose') {
    return (
      <div className="screen center" style={{ flexDirection: 'column', gap: '1rem' }}>
        {rulesBanner}
        <div className="hero-wrap">
          <img src="/hero.png" alt="" className="hero-img" />
          <h1 className="brand-title">建立或加入帳本</h1>
        </div>
        <p className="muted" style={{ textAlign: 'center' }}>
          兩人共用一個帳本，資料會即時同步。
        </p>
        <button type="button" className="btn btn-primary" onClick={() => setMode('create')}>
          建立新帳本
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => setMode('join')}>
          輸入邀請碼加入
        </button>
        <AccountActions />
      </div>
    );
  }

  if (mode === 'create') {
    return (
      <div className="screen">
        {rulesBanner}
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
        <AccountActions />
      </div>
    );
  }

  return (
    <div className="screen">
      {rulesBanner}
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
      <AccountActions />
    </div>
  );
}
