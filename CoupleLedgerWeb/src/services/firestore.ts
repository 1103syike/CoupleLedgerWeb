import {
  collection,
  deleteField,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  Timestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { waitForAuthUser } from '../lib/waitForAuth';
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

export async function probeFirestoreRules(): Promise<string | null> {
  try {
    await waitForAuthUser();
    await getDoc(doc(db, 'invites', '__rules_probe__'));
    return null;
  } catch (e) {
    if (e instanceof Error && e.message === '請先登入') return null;
    if (e && typeof e === 'object' && 'code' in e && (e as { code: string }).code === 'permission-denied') {
      return `Firestore 拒絕存取（專案：${import.meta.env.VITE_FIREBASE_PROJECT_ID}）。請確認規則已發布，且 App Check 未強制啟用。`;
    }
    return null;
  }
}

export async function getOrCreateProfile(uid: string, email: string, displayName: string): Promise<AppUser> {
  await waitForAuthUser();
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const d = snap.data();
    return {
      id: snap.id,
      email: d.email as string,
      displayName: d.displayName as string,
      spaceId: (d.spaceId as string) ?? null,
      createdAt: toDate(d.createdAt),
    };
  }
  const user: AppUser = {
    id: uid,
    email: email.trim().toLowerCase(),
    displayName: displayName.trim() || '使用者',
    spaceId: null,
    createdAt: new Date(),
  };
  await setDoc(ref, {
    ...user,
    createdAt: Timestamp.fromDate(user.createdAt),
  });
  return user;
}

export async function saveUser(user: AppUser): Promise<void> {
  await waitForAuthUser();
  await setDoc(doc(db, 'users', user.id), {
    ...user,
    createdAt: Timestamp.fromDate(user.createdAt),
  });
}

export async function fetchUser(id: string): Promise<AppUser> {
  await waitForAuthUser();
  const snap = await getDoc(doc(db, 'users', id));
  if (!snap.exists()) {
    throw new Error('USER_NOT_FOUND');
  }
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
  await waitForAuthUser();
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
  await setDoc(doc(db, 'invites', space.inviteCode.toUpperCase()), { spaceId: space.id });
  for (const cat of systemCategoriesForSpace(space.id)) {
    await setDoc(doc(db, 'categories', `${space.id}_${cat.id}`), cat);
  }
  await updateDoc(doc(db, 'users', creator.id), { spaceId: space.id });
  return space;
}

export async function ensureInviteIndex(space: CoupleSpace): Promise<void> {
  const code = space.inviteCode.toUpperCase();
  const ref = doc(db, 'invites', code);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { spaceId: space.id });
  }
}

export async function findSpaceByInviteCode(code: string): Promise<CoupleSpace | null> {
  await waitForAuthUser();
  const normalized = code.trim().toUpperCase();
  if (normalized.length < 6) return null;

  const inviteSnap = await getDoc(doc(db, 'invites', normalized));
  if (!inviteSnap.exists()) {
    throw new Error('找不到邀請碼，請請建立者到「設定」按「同步邀請碼」');
  }
  return getSpace(inviteSnap.data().spaceId as string);
}

export async function joinSpace(spaceId: string, user: AppUser): Promise<void> {
  await waitForAuthUser();
  const spaceRef = doc(db, 'spaces', spaceId);
  const userRef = doc(db, 'users', user.id);
  const spaceSnap = await getDoc(spaceRef);
  if (!spaceSnap.exists()) throw new Error('找不到帳本');

  const data = spaceSnap.data();
  const memberIds = (data.memberIds as string[]) ?? [];

  if (memberIds.includes(user.id)) {
    await updateDoc(userRef, { spaceId });
    return;
  }
  if (memberIds.length >= 2) throw new Error('此帳本已有兩位成員');

  await updateDoc(spaceRef, {
    memberIds: [...memberIds, user.id],
    [`memberNames.${user.id}`]: user.displayName,
  });
  await updateDoc(userRef, { spaceId });
}

export async function removeMember(
  spaceId: string,
  creatorId: string,
  memberIdToRemove: string
): Promise<void> {
  await waitForAuthUser();
  const spaceRef = doc(db, 'spaces', spaceId);
  const spaceSnap = await getDoc(spaceRef);
  if (!spaceSnap.exists()) throw new Error('找不到帳本');

  const data = spaceSnap.data();
  const creator = (data.createdBy as string) ?? ((data.memberIds as string[]) ?? [])[0];
  if (creator !== creatorId) throw new Error('只有建立者可以移除成員');
  if (memberIdToRemove === creatorId) throw new Error('無法移除自己');

  const memberIds = (data.memberIds as string[]) ?? [];
  if (!memberIds.includes(memberIdToRemove)) throw new Error('該使用者不是成員');

  await updateDoc(spaceRef, {
    memberIds: memberIds.filter((id) => id !== memberIdToRemove),
    [`memberNames.${memberIdToRemove}`]: deleteField(),
  });
  await updateDoc(doc(db, 'users', memberIdToRemove), { spaceId: null });
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
