import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency, isSameMonth } from '../lib/balance';
import { SPLIT_LABELS } from '../lib/types';
import MonthNav from '../components/MonthNav';
import ExpenseFormModal from '../components/ExpenseFormModal';
import type { Expense } from '../lib/types';

export default function ExpensesPage() {
  const { expenses, selectedMonth, space, categories, deleteExpense } = useApp();
  const [editing, setEditing] = useState<Expense | null>(null);

  const visible = expenses.filter((e) => !e.deletedAt && isSameMonth(e.date, selectedMonth));

  return (
    <div className="screen">
      <h1>明細</h1>
      <MonthNav />
      {visible.length === 0 ? (
        <p className="muted" style={{ marginTop: '2rem', textAlign: 'center' }}>
          本月沒有紀錄，點右下角 + 記一筆
        </p>
      ) : (
        <div className="card" style={{ marginTop: '1rem' }}>
          {visible.map((e) => {
            const cat = categories.find((c) => c.id === e.categoryId);
            return (
              <div key={e.id} className="list-item" style={{ cursor: 'pointer' }} onClick={() => setEditing(e)}>
                <span style={{ fontSize: '1.5rem' }}>{cat?.icon ?? '📦'}</span>
                <div style={{ flex: 1 }}>
                  <div>{e.note || cat?.name || '支出'}</div>
                  <div className="muted">
                    {space?.memberNames[e.paidByUserId]} 付款 · {SPLIT_LABELS[e.splitType]}
                  </div>
                </div>
                <div style={{ fontWeight: 700 }}>{formatCurrency(e.amount)}</div>
                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--danger)',
                    fontSize: '0.75rem',
                    marginLeft: '0.25rem',
                  }}
                  onClick={(ev) => {
                    ev.stopPropagation();
                    if (confirm('確定刪除這筆？')) deleteExpense(e.id);
                  }}
                >
                  刪
                </button>
              </div>
            );
          })}
        </div>
      )}
      {editing && <ExpenseFormModal expense={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}
