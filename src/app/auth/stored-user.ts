// The signed-in user as this app caches it, so a reload knows who is signed
// in before Firebase restores its own session. Deliberately just an id and an
// email: Firebase keeps the real credentials in its own storage.
export interface StoredUser {
  uid: string;
  email: string | null;
}

export const STORED_USER_KEY = 'user';

export function readStoredUser(): StoredUser | null {
  try {
    const raw = localStorage.getItem(STORED_USER_KEY);
    const user = raw ? JSON.parse(raw) : null;
    return user?.uid ? {uid: user.uid, email: user.email ?? null} : null;
  } catch {
    return null;
  }
}

export function writeStoredUser(user: { uid: string; email?: string | null } | null) {
  if (!user) {
    localStorage.removeItem(STORED_USER_KEY);
    return;
  }
  localStorage.setItem(STORED_USER_KEY, JSON.stringify({uid: user.uid, email: user.email ?? null}));
}
