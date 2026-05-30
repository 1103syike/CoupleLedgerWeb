export function formatFirebaseError(error: unknown): string {
  const code =
    error && typeof error === 'object' && 'code' in error
      ? String((error as { code: string }).code)
      : '';

  switch (code) {
    case 'permission-denied':
      return 'Firebase 規則未生效：請到 Firebase Console → Firestore → 規則，貼上 firestore.rules 並按「發布」';
    case 'auth/network-request-failed':
      return '網路連線失敗，請確認網路後重試';
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Email 或密碼錯誤';
    case 'auth/email-already-in-use':
      return '此 Email 已註冊';
    default:
      if (error instanceof Error && error.message) return error.message;
      return '發生錯誤，請稍後再試';
  }
}
