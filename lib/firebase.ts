import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, GithubAuthProvider, signInWithPopup, type Auth } from 'firebase/auth';

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

export async function signInWithGoogle(): Promise<{ idToken: string; email: string; name: string }> {
  const cred = await signInWithPopup(auth, google);
  const idToken = await cred.user.getIdToken();
  return { idToken, email: cred.user.email || '', name: cred.user.displayName || '' };
}

// GitHub login: enable after adding the OAuth client secret in Firebase console
// (Authentication -> Sign-in method -> GitHub -> Client ID Ov23li9UnGFSYFZG4qig + secret).
export const GITHUB_ENABLED = false;

export async function signInWithGithub(): Promise<{ idToken: string; email: string; name: string }> {
  if (!GITHUB_ENABLED) throw new Error('GitHub login is coming soon');
  const prov = new GithubAuthProvider();
  const cred = await signInWithPopup(auth, prov);
  const idToken = await cred.user.getIdToken();
  return { idToken, email: cred.user.email || '', name: cred.user.displayName || '' };
}
