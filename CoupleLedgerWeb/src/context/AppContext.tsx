import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../firebase/config';
import type { AppUser, CoupleSpace, Expense, ExpenseCategory } from '../lib/types';
import {
  calculateBalance,
  monthlyTotal,
  monthTitle,
  paidByUser,
  totalsByCategory,
} from '../lib/balance';
import * as fs from '../services/firestore';

interface AppContextValue {
  configured: boolean;
  loading: boolean;
  firebaseUser: User | null;
  profile: AppUser | null;
  space: CoupleSpace | null;
  expenses: Expense[];
  categories: ExpenseCategory[];
  selectedMonth: Date;
  setSelectedMonth: (d: Date) => void;
  error: string | null;
  clearError: () => void;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  createSpace: (name: string) => Promise<void>;
  joinSpace: (code: string) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  saveExpense: (e: Expense) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  monthlyTotal: number;
  categoryBreakdown: ReturnType<typeof totalsByCategory>;
  balanceMessage: string;
  monthTitle: string;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [space, setSpace] = useState<CoupleSpace | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(() => new Date());
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }
    return onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (!user) {
        setProfile(null);
        setSpace(null);
        setExpenses([]);
        setCategories([]);
        setLoading(false);
        return;
      }
      try {
        const p = await fs.fetchUser(user.uid);
        setProfile(p);
        if (p.spaceId) {
          setSpace(await fs.fetchSpace(p.spaceId));
        } else {
          setSpace(null);
        }
      } catch (e) {
        const recovered = await fs.getOrCreateProfile(
          user.uid,
          user.email ?? '',
          user.displayName ?? '使用者'
        );
        setProfile(recovered);
        if (recovered.spaceId) {
          try {
            setSpace(await fs.fetchSpace(recovered.spaceId));
          } catch {
            setSpace(null);
          }
        } else {
          setSpace(null);
        }
      }
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!space?.id || !profile) return;
    if (space.createdBy === profile.id) {
      fs.ensureInviteIndex(space).catch(() => {});
    }
    const u1 = fs.listenSpace(space.id, setSpace);
    const u2 = fs.listenExpenses(space.id, setExpenses);
    const u3 = fs.listenCategories(space.id, setCategories);
    return () => {
      u1();
      u2();
      u3();
    };
  }, [space?.id]);

  const signUp = useCallback(async (email: string, password: string, displayName: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const user: AppUser = {
      id: cred.user.uid,
      email: email.trim().toLowerCase(),
      displayName: displayName.trim(),
      spaceId: null,
      createdAt: new Date(),
    };
    await fs.saveUser(user);
    setProfile(user);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email.trim(), password);
  }, []);

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
  }, []);

  const createSpace = useCallback(
    async (name: string) => {
      if (!firebaseUser) throw new Error('請先登入');
      const activeProfile =
        profile ??
        (await fs.getOrCreateProfile(
          firebaseUser.uid,
          firebaseUser.email ?? '',
          firebaseUser.displayName ?? '使用者'
        ));
      const s = await fs.createSpace(name, activeProfile);
      setProfile({ ...activeProfile, spaceId: s.id });
      setSpace(s);
    },
    [profile, firebaseUser]
  );

  const joinSpace = useCallback(
    async (code: string) => {
      if (!firebaseUser) throw new Error('請先登入');
      const activeProfile =
        profile ??
        (await fs.getOrCreateProfile(
          firebaseUser.uid,
          firebaseUser.email ?? '',
          firebaseUser.displayName ?? '使用者'
        ));
      const found = await fs.findSpaceByInviteCode(code);
      if (!found) throw new Error('找不到邀請碼');
      if (found.memberIds.length >= 2) throw new Error('此帳本已有兩位成員');
      await fs.joinSpace(found.id, activeProfile);
      setProfile({ ...activeProfile, spaceId: found.id });
      setSpace(await fs.fetchSpace(found.id));
    },
    [profile, firebaseUser]
  );

  const removeMember = useCallback(
    async (memberId: string) => {
      if (!firebaseUser || !space || !profile) throw new Error('請先登入');
      await fs.removeMember(space.id, profile.id, memberId);
    },
    [firebaseUser, space, profile]
  );

  const saveExpense = useCallback(async (e: Expense) => {
    await fs.saveExpense(e);
  }, []);

  const deleteExpense = useCallback(
    async (id: string) => {
      if (!firebaseUser) return;
      await fs.softDeleteExpense(id, firebaseUser.uid);
    },
    [firebaseUser]
  );

  const balance = useMemo(() => {
    if (!space) return { message: '尚未加入帳本' };
    return calculateBalance(expenses, space.memberIds, space.memberNames, selectedMonth);
  }, [expenses, space, selectedMonth]);

  const value: AppContextValue = {
    configured: isFirebaseConfigured,
    loading,
    firebaseUser,
    profile,
    space,
    expenses,
    categories,
    selectedMonth,
    setSelectedMonth,
    error,
    clearError,
    signUp,
    signIn,
    signOut,
    createSpace,
    joinSpace,
    removeMember,
    saveExpense,
    deleteExpense,
    monthlyTotal: monthlyTotal(expenses, selectedMonth),
    categoryBreakdown: totalsByCategory(expenses, selectedMonth, categories),
    balanceMessage: balance.message,
    monthTitle: monthTitle(selectedMonth),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}

export { paidByUser };
