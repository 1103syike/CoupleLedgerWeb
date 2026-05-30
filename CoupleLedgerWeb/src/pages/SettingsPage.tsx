import { useApp } from '../context/AppContext';

export default function SettingsPage() {
  const { space, profile, signOut } = useApp();

  const copyCode = () => {
    if (space?.inviteCode) {
      navigator.clipboard.writeText(space.inviteCode);
      alert('已複製邀請碼');
    }
  };

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
            <p className="muted" style={{ marginTop: '0.5rem' }}>
              傳給另一半，對方註冊後選「加入帳本」輸入即可。
            </p>
          </div>
          <h2 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>成員</h2>
          <div className="card">
            {space.memberIds.map((id) => (
              <div key={id} className="list-item">
                <span>{space.memberNames[id]}</span>
                {id === profile?.id && <span className="muted">我</span>}
              </div>
            ))}
          </div>
        </>
      )}
      <div className="card" style={{ marginTop: '1rem' }}>
        <div className="muted">登入帳號</div>
        <div>{profile?.email}</div>
      </div>
      <button type="button" className="btn btn-ghost" style={{ marginTop: '1rem', color: 'var(--danger)' }} onClick={() => signOut()}>
        登出
      </button>
    </div>
  );
}
