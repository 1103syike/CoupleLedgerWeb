import { useState } from 'react';
import { useApp } from '../context/AppContext';
import type { Expense, SplitType } from '../lib/types';
import { SPLIT_LABELS } from '../lib/types';

interface Props {
  expense?: Expense;
  onClose: () => void;
}

export default function ExpenseFormModal({ expense, onClose }: Props) {
  const { profile, space, categories, saveExpense, firebaseUser } = useApp();
  const [amount, setAmount] = useState(expense ? String(expense.amount) : '');
  const [date, setDate] = useState(
    expense ? expense.date.toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
  );
  const [categoryId, setCategoryId] = useState(expense?.categoryId ?? categories[0]?.id ?? 'dining');
  const [note, setNote] = useState(expense?.note ?? '');
  const [paidBy, setPaidBy] = useState(expense?.paidByUserId ?? firebaseUser?.uid ?? '');
  const [splitType, setSplitType] = useState<SplitType>(expense?.splitType ?? 'equal');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const num = parseFloat(amount);
    if (!space || !firebaseUser || isNaN(num) || num <= 0) return;
    setSaving(true);
    try {
      const now = new Date();
      const payload: Expense = expense
        ? {
            ...expense,
            amount: num,
            date: new Date(date),
            categoryId,
            note,
            paidByUserId: paidBy,
            splitType,
            updatedBy: firebaseUser.uid,
            updatedAt: now,
          }
        : {
            id: crypto.randomUUID(),
            spaceId: space.id,
            amount: num,
            currency: 'TWD',
            date: new Date(date),
            categoryId,
            note,
            paidByUserId: paidBy,
            splitType,
            createdBy: firebaseUser.uid,
            updatedBy: firebaseUser.uid,
            createdAt: now,
            updatedAt: now,
            deletedAt: null,
          };
      await saveExpense(payload);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <header>
          <h2>{expense ? '編輯' : '記一筆'}</h2>
          <button type="button" className="btn-ghost" style={{ width: 'auto', padding: '0.5rem' }} onClick={onClose}>
            取消
          </button>
        </header>
        <div className="form-group">
          <label>金額</label>
          <input type="number" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="350" />
        </div>
        <div className="form-group">
          <label>日期</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="form-group">
          <label>分類</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>誰付的</label>
          <select value={paidBy} onChange={(e) => setPaidBy(e.target.value)}>
            {space?.memberIds.map((id) => (
              <option key={id} value={id}>
                {space.memberNames[id]}
                {id === profile?.id ? '（我）' : ''}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>分帳</label>
          <select value={splitType} onChange={(e) => setSplitType(e.target.value as SplitType)}>
            {(Object.keys(SPLIT_LABELS) as SplitType[]).map((k) => (
              <option key={k} value={k}>
                {SPLIT_LABELS[k]}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>備註</label>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="選填" />
        </div>
        <button type="button" className="btn btn-primary" disabled={saving || !amount} onClick={handleSave}>
          {saving ? '儲存中…' : '儲存'}
        </button>
      </div>
    </div>
  );
}
