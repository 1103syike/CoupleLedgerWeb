import { useApp } from '../context/AppContext';
import { formatCurrency, paidByUser } from '../lib/balance';
import MonthNav from '../components/MonthNav';

export default function HomePage() {
  const { space, expenses, selectedMonth, monthlyTotal, categoryBreakdown, profile } = useApp();
  const maxCat = categoryBreakdown[0]?.total ?? 1;

  return (
    <div className="screen">
      <div className="page-header">
        <img src="/hero.png" alt="" className="hero-img" />
        <div>
          <h1>本月總覽</h1>
          <p className="muted" style={{ fontSize: '0.75rem' }}>{space?.name ?? '我們的帳本'}</p>
        </div>
      </div>
      <MonthNav />
      <div className="card total" style={{ marginTop: '1rem' }}>
        <div className="muted">本月總支出</div>
        {formatCurrency(monthlyTotal)}
      </div>
      {space && (
        <div className="grid-2" style={{ marginTop: '0.75rem' }}>
          {space.memberIds.map((id) => (
            <div key={id} className="card" style={{ marginBottom: 0 }}>
              <div className="muted">{space.memberNames[id]}{id === profile?.id ? '（我）' : ''}</div>
              <div style={{ fontWeight: 700, marginTop: '0.25rem' }}>
                {formatCurrency(paidByUser(expenses, selectedMonth, id))}
              </div>
              <div className="muted" style={{ fontSize: '0.75rem' }}>實際付款</div>
            </div>
          ))}
        </div>
      )}
      <h2 style={{ marginTop: '1.25rem', marginBottom: '0.75rem' }}>分類支出</h2>
      {categoryBreakdown.length === 0 ? (
        <p className="muted">本月尚無支出</p>
      ) : (
        categoryBreakdown.map((c) => (
          <div key={c.id} className="card" style={{ marginBottom: '0.5rem', padding: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>
                {c.icon} {c.name}
              </span>
              <strong>{formatCurrency(c.total)}</strong>
            </div>
            <div className="cat-bar">
              <div className="cat-bar-fill" style={{ width: `${(c.total / maxCat) * 100}%`, background: c.colorHex }} />
            </div>
          </div>
        ))
      )}
    </div>
  );
}
