import { useApp } from '../context/AppContext';
import { clearAppCache } from '../lib/appCache';

export default function AccountActions() {
  const { profile, signOut } = useApp();

  return (
    <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--surface2)' }}>
      {profile?.email && (
        <p className="muted" style={{ marginBottom: '0.75rem', fontSize: '0.875rem' }}>
          登入：{profile.email}
        </p>
      )}
      <button type="button" className="btn btn-ghost" onClick={() => void clearAppCache()}>
        清除快取並重新載入
      </button>
      <button
        type="button"
        className="btn btn-ghost"
        style={{ marginTop: '0.5rem', color: 'var(--danger)' }}
        onClick={() => void signOut()}
      >
        登出
      </button>
    </div>
  );
}
