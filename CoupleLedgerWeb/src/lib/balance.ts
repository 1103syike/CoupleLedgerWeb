import type { Expense } from './types';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
}

export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function monthTitle(d: Date): string {
  return `${d.getFullYear()}年${d.getMonth() + 1}月`;
}

export function monthlyTotal(expenses: Expense[], month: Date): number {
  return expenses
    .filter((e) => !e.deletedAt && isSameMonth(e.date, month))
    .reduce((s, e) => s + e.amount, 0);
}

export function paidByUser(expenses: Expense[], month: Date, userId: string): number {
  return expenses
    .filter((e) => !e.deletedAt && isSameMonth(e.date, month) && e.paidByUserId === userId)
    .reduce((s, e) => s + e.amount, 0);
}

export function totalsByCategory(
  expenses: Expense[],
  month: Date,
  categoryIds: { id: string; name: string; icon: string; colorHex: string }[]
) {
  const monthExp = expenses.filter((e) => !e.deletedAt && isSameMonth(e.date, month));
  return categoryIds
    .map((cat) => ({
      ...cat,
      total: monthExp.filter((e) => e.categoryId === cat.id).reduce((s, e) => s + e.amount, 0),
    }))
    .filter((x) => x.total > 0)
    .sort((a, b) => b.total - a.total);
}

export interface BalanceResult {
  netByUser: Record<string, number>;
  sharedCount: number;
  message: string;
}

export function calculateBalance(
  expenses: Expense[],
  memberIds: string[],
  names: Record<string, string>,
  month?: Date
): BalanceResult {
  const active = expenses.filter((e) => {
    if (e.deletedAt || e.splitType !== 'equal') return false;
    if (!month) return true;
    return isSameMonth(e.date, month);
  });

  const net: Record<string, number> = Object.fromEntries(memberIds.map((id) => [id, 0]));

  for (const e of active) {
    if (memberIds.length !== 2 || !memberIds.includes(e.paidByUserId)) continue;
    const other = memberIds.find((id) => id !== e.paidByUserId)!;
    const half = e.amount / 2;
    net[e.paidByUserId] = (net[e.paidByUserId] ?? 0) + (e.amount - half);
    net[other] = (net[other] ?? 0) - half;
  }

  const entries = Object.entries(net);
  const max = entries.reduce((a, b) => (a[1] > b[1] ? a : b), ['', -Infinity]);
  const min = entries.reduce((a, b) => (a[1] < b[1] ? a : b), ['', Infinity]);

  let message = '目前已結清，沒有欠款';
  if (max[1] > 0.01 && min[1] < -0.01) {
    const amount = Math.min(max[1], -min[1]);
    message = `${names[min[0]] ?? '對方'} 應付給 ${names[max[0]] ?? '對方'} ${formatCurrency(amount)}`;
  }

  return { netByUser: net, sharedCount: active.length, message };
}
