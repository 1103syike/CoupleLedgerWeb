import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { calculateBalance, formatCurrency, isSameMonth } from '../lib/balance';

export default function BalancePage() {
  const { expenses, space, selectedMonth } = useApp();
  const [range, setRange] = useState<'month' | 'all'>('month');

  const result =
    space &&
    calculateBalance(
      expenses,
      space.memberIds,
      space.memberNames,
      range === 'month' ? selectedMonth : undefined
    );

  const lines =
    space &&
    expenses.filter(
      (e) =>
        !e.deletedAt &&
        e.splitType === 'equal' &&
        (range === 'all' || isSameMonth(e.date, selectedMonth))
    );

  return (
    <div className="screen">
      <h1>結算</h1>
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <button
          type="button"
          className={range === 'month' ? 'btn btn-primary' : 'btn btn-ghost'}
          style={{ flex: 1 }}
          onClick={() => setRange('month')}
        >
          本月
        </button>
        <button
          type="button"
          className={range === 'all' ? 'btn btn-primary' : 'btn btn-ghost'}
          style={{ flex: 1 }}
          onClick={() => setRange('all')}
        >
          全部
        </button>
      </div>
      <div className="card" style={{ marginTop: '1rem' }}>
        <p style={{ fontSize: '1.15rem', fontWeight: 700 }}>{result?.message ?? '—'}</p>
        <p className="muted" style={{ marginTop: '0.5rem' }}>
          共同支出 {result?.sharedCount ?? 0} 筆
        </p>
      </div>
      {lines && lines.length > 0 && (
        <>
          <h2 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>明細</h2>
          <div className="card">
            {lines.map((e) => (
              <div key={e.id} className="list-item">
                <div style={{ flex: 1 }}>
                  <div>{e.note || '支出'}</div>
                  <div className="muted">{space?.memberNames[e.paidByUserId]} 付款</div>
                </div>
                <strong>{formatCurrency(e.amount)}</strong>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
