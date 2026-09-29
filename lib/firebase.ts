import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getAuth, GoogleAuthProvider, GithubAuthProvider,
  signInWithPopup, signInWithRedirect, getRedirectResult, type Auth, type User,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyBsH0mIyXGjGWi0orp7IViBIPACdINZMTA',
  authDomain: 'api-dexter-78074.firebaseapp.com',
  projectId: 'api-dexter-78074',
  storageBucket: 'api-dexter-78074.firebasestorage.app',
  messagingSenderId: '621690160616',
  appId: '1:621690160616:web:11b082d68e28d1f523505d',
};

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export const auth: Auth = getAuth(app);

const google = new GoogleAuthProvider();
google.setCustomParameters({ prompt: 'select_account' });

export interface GoogleCred { idToken: string; email: string; name: string }

async function toCred(user: User): Promise<GoogleCred> {
  return { idToken: await user.getIdToken(), email: user.email || '', name: user.displayName || '' };
}

// Popup first (fast). If the popup is blocked / instantly closed (blockers,
// COOP, webviews), automatically fall back to a full-page Google redirect.
export async function signInWithGoogleSmart(): Promise<GoogleCred | 'redirecting'> {
  try {
    const cred = await signInWithPopup(auth, google);
    return toCred(cred.user);
  } catch (e) {
    const code = (e as { code?: string })?.code || '';
    if (
      code === 'auth/popup-blocked' ||
      code === 'auth/popup-closed-by-user' ||
      code === 'auth/cancelled-popup-request' ||
      code === 'auth/internal-error'
    ) {
      await signInWithRedirect(auth, google);
      return 'redirecting';
    }
    throw e;
  }
}

// Call on page load: completes a redirect sign-in (null when none pending).
export async function consumeGoogleRedirect(): Promise<GoogleCred | null> {
  const res = await getRedirectResult(auth);
  if (!res) return null;
  return toCred(res.user);
}

export function friendlyAuthError(e: unknown): string {
  const code = (e as { code?: string })?.code || '';
  if (code === 'auth/operation-not-allowed') {
    return 'Google sign-in is not enabled yet. Site admin must enable the Google provider in Firebase console.';
  }
  if (code === 'auth/unauthorized-domain') {
    return 'This site domain is not authorized. Site admin must add it under Firebase console → Authentication → Settings → Authorized domains.';
  }
  if (code === 'auth/network-request-failed') return 'Network error reaching Google — check your connection and retry.';
  if (code === 'auth/user-disabled') return 'This account has been disabled.';
  return e instanceof Error ? e.message : 'Google sign-in failed';
}

// GitHub login: enable after adding the OAuth client secret in Firebase console
// (Authentication -> Sign-in method -> GitHub -> Client ID Ov23li9UnGFSYFZG4qig + secret).
export const GITHUB_ENABLED = false;

export async function signInWithGithub(): Promise<GoogleCred> {
  if (!GITHUB_ENABLED) throw new Error('GitHub login is coming soon');
  const prov = new GithubAuthProvider();
  const cred = await signInWithPopup(auth, prov);
  return toCred(cred.user);
}
