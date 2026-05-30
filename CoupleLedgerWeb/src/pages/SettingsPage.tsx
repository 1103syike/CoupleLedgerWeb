import { useState } from 'react';
import { useApp } from '../context/AppContext';
import * as fs from '../services/firestore';
import { clearAppCache } from '../lib/appCache';
import { formatFirebaseError } from '../lib/firebaseError';

export default function SettingsPage() {
  const { space, profile, firebaseUser, signOut, removeMember } = useApp();
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const copyCode = () => {
    if (space?.inviteCode) {
      void navigator.clipboard.writeText(space.inviteCode);
      setSyncMsg('已複製邀請碼');
    }
  };

  const syncInvite = async () => {
    if (!space) return;
    setSyncing(true);
    setSyncMsg(null);
    try {
      await fs.ensureInviteIndex(space);
      setSyncMsg('邀請碼已同步，請讓對方再試一次');
    } catch (e) {
      setSyncMsg(formatFirebaseError(e));
    } finally {
      setSyncing(false);
    }
  };

  const clearCache = () => void clearAppCache();

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!space || !isCreator) return;
    const ok = window.confirm(`確定要移除「${memberName}」嗎？對方將無法再存取此帳本，但可再次用邀請碼加入。`);
    if (!ok) return;
    setRemovingId(memberId);
    setSyncMsg(null);
    try {
      await removeMember(memberId);
      setSyncMsg(`已移除 ${memberName}`);
    } catch (e) {
      setSyncMsg(formatFirebaseError(e));
    } finally {
      setRemovingId(null);
    }
  };

  const creatorId = space?.createdBy ?? space?.memberIds[0];
  const isCreator = !!creatorId && (profile?.id === creatorId || firebaseUser?.uid === creatorId);
  const otherMembers = space?.memberIds.filter((id) => id !== profile?.id && id !== firebaseUser?.uid) ?? [];

  return (
    <div className="screen">
      <h1>設定</h1>
      {space && (
        <>
          <div className="card" style={{ marginTop: '1rem' }}>
            <div className="muted">帳本名稱</div>
            <div style={{ fontWeight: 600 }}>{space.name}</div>
            <div className="muted" style={{ marginTop: '0.75rem' }}>
              邀請碼
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '0.2em' }}>{space.inviteCode}</div>
            <button type="button" className="btn btn-ghost" style={{ marginTop: '0.75rem' }} onClick={copyCode}>
              複製邀請碼
            </button>
            {isCreator && (
              <button
                type="button"
                className="btn btn-ghost"
                style={{ marginTop: '0.5rem' }}
                disabled={syncing}
                onClick={syncInvite}
              >
                {syncing ? '同步中…' : '同步邀請碼（給對方加入用）'}
              </button>
            )}
            {syncMsg && <p className="muted" style={{ marginTop: '0.5rem' }}>{syncMsg}</p>}
            <p className="muted" style={{ marginTop: '0.5rem' }}>
              傳給另一半，對方註冊後選「加入帳本」輸入即可。
            </p>
          </div>
          <h2 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>成員</h2>
          {isCreator && otherMembers.length === 0 && (
            <p className="muted" style={{ marginBottom: '0.5rem' }}>
              目前只有您一人；對方加入後，這裡會出現「移除」按鈕。
            </p>
          )}
          {!isCreator && (space?.memberIds.length ?? 0) > 1 && (
            <p className="muted" style={{ marginBottom: '0.5rem' }}>
              只有建立帳本的人可移除成員。
            </p>
          )}
          <div className="card">
            {space.memberIds.map((id) => (
              <div key={id} className="list-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                <span>
                  {space.memberNames[id]}
                  {id === profile?.id && <span className="muted">（我）</span>}
                  {id === creatorId && id !== profile?.id && id !== firebaseUser?.uid && (
                    <span className="muted">（建立者）</span>
                  )}
                </span>
                {isCreator && id !== profile?.id && id !== firebaseUser?.uid && (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    style={{ color: 'var(--danger)', padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                    disabled={removingId === id}
                    onClick={() => handleRemoveMember(id, space.memberNames[id] ?? '成員')}
                  >
                    {removingId === id ? '移除中…' : '移除'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}
      <div className="card" style={{ marginTop: '1rem' }}>
        <div className="muted">登入帳號</div>
        <div>{profile?.email}</div>
      </div>
      <button type="button" className="btn btn-ghost" style={{ marginTop: '1rem' }} onClick={clearCache}>
        清除快取並重新載入
      </button>
      <button type="button" className="btn btn-ghost" style={{ marginTop: '0.75rem', color: 'var(--danger)' }} onClick={() => signOut()}>
        登出
      </button>
    </div>
  );
}
