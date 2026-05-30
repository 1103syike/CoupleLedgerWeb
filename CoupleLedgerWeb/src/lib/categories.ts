import type { ExpenseCategory } from './types';

const DEFAULTS: Omit<ExpenseCategory, 'spaceId'>[] = [
  { id: 'dining', name: '餐飲', icon: '🍽️', colorHex: '#FF6B6B', sortOrder: 0, isSystem: true },
  { id: 'transport', name: '交通', icon: '🚗', colorHex: '#4ECDC4', sortOrder: 1, isSystem: true },
  { id: 'shopping', name: '購物', icon: '🛍️', colorHex: '#45B7D1', sortOrder: 2, isSystem: true },
  { id: 'entertainment', name: '娛樂', icon: '🎬', colorHex: '#96CEB4', sortOrder: 3, isSystem: true },
  { id: 'home', name: '居家', icon: '🏠', colorHex: '#FFEAA7', sortOrder: 4, isSystem: true },
  { id: 'travel', name: '旅行', icon: '✈️', colorHex: '#DDA0DD', sortOrder: 5, isSystem: true },
  { id: 'health', name: '醫療', icon: '❤️', colorHex: '#F8B500', sortOrder: 6, isSystem: true },
  { id: 'gift', name: '禮物', icon: '🎁', colorHex: '#FF85A2', sortOrder: 7, isSystem: true },
  { id: 'subscription', name: '訂閱', icon: '🔁', colorHex: '#74B9FF', sortOrder: 8, isSystem: true },
  { id: 'other', name: '其他', icon: '📦', colorHex: '#A0A0A0', sortOrder: 9, isSystem: true },
];

export function systemCategoriesForSpace(spaceId: string): ExpenseCategory[] {
  return DEFAULTS.map((c) => ({ ...c, spaceId }));
}

export function generateInviteCode(length = 6): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}
