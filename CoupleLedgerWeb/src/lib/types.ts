export type SplitType = 'equal' | 'personal';

export interface AppUser {
  id: string;
  email: string;
  displayName: string;
  spaceId: string | null;
  createdAt: Date;
}

export interface CoupleSpace {
  id: string;
  name: string;
  inviteCode: string;
  memberIds: string[];
  memberNames: Record<string, string>;
  createdAt: Date;
  createdBy: string;
}

export interface ExpenseCategory {
  id: string;
  spaceId: string;
  name: string;
  icon: string;
  colorHex: string;
  sortOrder: number;
  isSystem: boolean;
}

export interface Expense {
  id: string;
  spaceId: string;
  amount: number;
  currency: string;
  date: Date;
  categoryId: string;
  note: string;
  paidByUserId: string;
  splitType: SplitType;
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export const SPLIT_LABELS: Record<SplitType, string> = {
  equal: '兩人平分',
  personal: '個人支出',
};
