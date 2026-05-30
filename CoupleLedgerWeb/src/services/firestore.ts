import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  arrayUnion,
  where,
  Timestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { AppUser, CoupleSpace, Expense, ExpenseCategory } from '../lib/types';
import { generateInviteCode, systemCategoriesForSpace } from '../lib/categories';

const toDate = (v: unknown): Date => {
  if (v instanceof Timestamp) return v.toDate();
  if (v instanceof Date) return v;
  return new Date();
};

const parseExpense = (id: string, data: Record<string, unknown>): Expense => ({
  id,
  spaceId: data.spaceId as string,
  amount: typeof data.amount === 'string' ? parseFloat(data.amount) : (data.amount as number),
  currency: (data.currency as string) ?? 'TWD',
  date: toDate(data.date),
  categoryId: data.categoryId as string,
  note: (data.note as string) ?? '',
  paidByUserId: data.paidByUserId as string,
  splitType: data.splitType as Expense['splitType'],
  createdBy: data.createdBy as string,
  updatedBy: data.updatedBy as string,
  createdAt: toDate(data.createdAt),
  updatedAt: toDate(data.updatedAt),
  deletedAt: data.deletedAt ? toDate(data.deletedAt) : null,
});

export async function saveUser(user: AppUser): Promise<void> {
  await setDoc(doc(db, 'users', user.id), {
    ...user,
    createdAt: Timestamp.fromDate(user.createdAt),
  });
}

export async function fetchUser(id: string): Promise<AppUser> {
  const snap = await getDoc(doc(db, 'users', id));
  const d = snap.data()!;
  return {
    id: snap.id,
    email: d.email as string,
    displayName: d.displayName as string,
    spaceId: (d.spaceId as string) ?? null,
    createdAt: toDate(d.createdAt),
  };
}

export async function createSpace(name: string, creator: AppUser): Promise<CoupleSpace> {
  const space: CoupleSpace = {
    id: crypto.randomUUID(),
    name,
    inviteCode: generateInviteCode(),
    memberIds: [creator.id],
    memberNames: { [creator.id]: creator.displayName },
    createdAt: new Date(),
    createdBy: creator.id,
  };
  await setDoc(doc(db, 'spaces', space.id), {
    ...space,
    createdAt: Timestamp.fromDate(space.createdAt),
  });
  for (const cat of systemCategoriesForSpace(space.id)) {
    await setDoc(doc(db, 'categories', `${space.id}_${cat.id}`), cat);
  }
  await updateDoc(doc(db, 'users', creator.id), { spaceId: space.id });
  return space;
}

export async function findSpaceByInviteCode(code: string): Promise<CoupleSpace | null> {
  const q = query(collection(db, 'spaces'), where('inviteCode', '==', code.toUpperCase()), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  const data = d.data();
  return {
    id: d.id,
    name: data.name as string,
    inviteCode: data.inviteCode as string,
    memberIds: data.memberIds as string[],
    memberNames: data.memberNames as Record<string, string>,
    createdAt: toDate(data.createdAt),
    createdBy: data.createdBy as string,
  };
}

export async function joinSpace(spaceId: string, user: AppUser): Promise<void> {
  await updateDoc(doc(db, 'spaces', spaceId), {
    memberIds: arrayUnion(user.id),
    [`memberNames.${user.id}`]: user.displayName,
  });
  await updateDoc(doc(db, 'users', user.id), { spaceId });
}

async function getSpace(id: string): Promise<CoupleSpace> {
  const snap = await getDoc(doc(db, 'spaces', id));
  const data = snap.data()!;
  return {
    id: snap.id,
    name: data.name as string,
    inviteCode: data.inviteCode as string,
    memberIds: data.memberIds as string[],
    memberNames: data.memberNames as Record<string, string>,
    createdAt: toDate(data.createdAt),
    createdBy: data.createdBy as string,
  };
}

export async function fetchSpace(id: string): Promise<CoupleSpace> {
  return getSpace(id);
}

export function listenSpace(spaceId: string, cb: (s: CoupleSpace) => void): Unsubscribe {
  return onSnapshot(doc(db, 'spaces', spaceId), (snap) => {
    const data = snap.data();
    if (!data) return;
    cb({
      id: snap.id,
      name: data.name as string,
      inviteCode: data.inviteCode as string,
      memberIds: data.memberIds as string[],
      memberNames: data.memberNames as Record<string, string>,
      createdAt: toDate(data.createdAt),
      createdBy: data.createdBy as string,
    });
  });
}

export function listenCategories(spaceId: string, cb: (c: ExpenseCategory[]) => void): Unsubscribe {
  const q = query(collection(db, 'categories'), where('spaceId', '==', spaceId));
  return onSnapshot(q, (snap) => {
    const items = snap.docs
      .map((d) => d.data() as ExpenseCategory)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    cb(items);
  });
}

export function listenExpenses(spaceId: string, cb: (e: Expense[]) => void): Unsubscribe {
  const q = query(
    collection(db, 'expenses'),
    where('spaceId', '==', spaceId),
    orderBy('date', 'desc')
  );
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => parseExpense(d.id, d.data() as Record<string, unknown>)));
  });
}

export async function saveExpense(expense: Expense): Promise<void> {
  await setDoc(doc(db, 'expenses', expense.id), {
    ...expense,
    amount: String(expense.amount),
    date: Timestamp.fromDate(expense.date),
    createdAt: Timestamp.fromDate(expense.createdAt),
    updatedAt: Timestamp.fromDate(expense.updatedAt),
    deletedAt: expense.deletedAt ? Timestamp.fromDate(expense.deletedAt) : null,
  });
}

export async function softDeleteExpense(id: string, userId: string): Promise<void> {
  await updateDoc(doc(db, 'expenses', id), {
    deletedAt: Timestamp.now(),
    updatedBy: userId,
    updatedAt: Timestamp.now(),
  });
}
