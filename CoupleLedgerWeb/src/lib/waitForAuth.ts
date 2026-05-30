import { auth } from '../firebase/config';

export async function waitForAuthUser() {
  await auth.authStateReady();
  const user = auth.currentUser;
  if (!user) throw new Error('請先登入');
  return user;
}
