'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AlertTriangle, LogIn } from 'lucide-react';
import { api, store } from '@/lib/api';
import { signInWithGoogle } from '@/lib/firebase';
import { useToast } from '@/components/Toast';

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
      <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.3-2.3H12v4.5h6.5c-.1 1.1-.8 2.7-2.4 3.8l3.6 2.8c2.1-2 3.2-4.9 3.2-8.8z" />
      <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.8-2.9c-1 .7-2.4 1.2-4.1 1.2-3.1 0-5.8-2.1-6.8-5l-3.6 2.8C3.5 21.3 7.5 24 12 24z" />
      <path fill="#FBBC05" d="M5.2 14.4c-.2-.7-.4-1.5-.4-2.4s.1-1.7.4-2.4L1.6 6.7C.6 8.6 0 10.2 0 12s.6 3.4 1.6 4.9l3.6-2.5z" />
      <path fill="#EA4335" d="M12 4.7c1.8 0 3 .8 3.7 1.4l3.3-3.2C17.9 1.1 15.2 0 12 0 7.5 0 3.5 2.7 1.6 6.7l3.6 2.8c1-2.9 3.7-4.8 6.8-4.8z" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const finish = (data: unknown) => {
    const d = (data || {}) as { user?: { username: string; apiKey: string; plan?: string }; token?: string };
    if (!d.user?.apiKey) {
      setErr('Login succeeded but no API key was returned.');
      return;
    }
    store.setSession({ username: d.user.username, apiKey: d.user.apiKey, plan: d.user.plan }, d.token);
    toast(`Welcome back, ${d.user.username}`, 'success');
    router.push('/dashboard');
  };

  const google = async () => {
    setErr('');
    setBusy(true);
    try {
      const g = await signInWithGoogle();
      const r = await api.firebase({ idToken: g.idToken });
      if (!r.success) {
        setErr(r.message);
        return;
      }
      finish(r.data);
    } catch (e) {
      const m = e instanceof Error ? e.message : 'Google login failed';
      setErr(/popup|closed|cancel/i.test(m) ? 'Google popup was closed. Try again.' : m);
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    setErr('');
    setBusy(true);
    try {
      const r = await api.login({ email: email.trim(), password });
      if (!r.success) {
        setErr(r.message);
        return;
      }
      finish(r.data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="glass rounded-3xl p-8">
        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
        <p className="mt-1 text-sm text-zinc-400">Log in to manage your API key and quota.</p>
        <button
          onClick={google}
          disabled={busy}
          className="mt-6 flex w-full items-center justify-center gap-2.5 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100 disabled:opacity-60"
        >
          <GoogleIcon /> {busy ? 'Opening Google…' : 'Continue with Google'}
        </button>
        <div className="my-5 flex items-center gap-3 text-xs text-zinc-500">
          <span className="h-px flex-1 bg-white/10" /> or with email <span className="h-px flex-1 bg-white/10" />
        </div>
        <div className="space-y-3">
          <input className="input" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input
            className="input" placeholder="Password" type="password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
          />
          {err && <p className="flex items-center gap-2 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200"><AlertTriangle size={16} /> {err}</p>}
          <button className="btn-ghost w-full" disabled={busy || !email || !password} onClick={submit}>
            <LogIn size={16} /> {busy ? 'Logging in…' : 'Login with email'}
          </button>
        </div>
        <div className="mt-5 flex items-center justify-between text-sm">
          <Link href="/register" className="text-indigo-300 hover:text-white">Create account</Link>
          <Link href="/forgot-password" className="text-zinc-400 hover:text-white">Forgot password?</Link>
        </div>
      </div>
    </div>
  );
}
