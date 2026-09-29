'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { AlertTriangle, ArrowRight } from 'lucide-react';
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

function RegisterInner() {
  const router = useRouter();
  const qp = useSearchParams();
  const toast = useToast();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ref, setRef] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const r = qp.get('ref');
    if (r) setRef(r);
  }, [qp]);

  const finish = (data: unknown) => {
    const d = (data || {}) as { user?: { username: string; apiKey: string; plan?: string }; token?: string };
    if (!d.user?.apiKey) {
      setErr('Registered, but no API key was returned. Try logging in.');
      return;
    }
    store.setSession({ username: d.user.username, apiKey: d.user.apiKey, plan: d.user.plan }, d.token);
    toast('Account ready — welcome aboard', 'success');
    router.push('/dashboard');
  };

  const google = async () => {
    setErr('');
    setBusy(true);
    try {
      const g = await signInWithGoogle();
      const r = await api.firebase({ idToken: g.idToken, ...(ref.trim() ? { referralCode: ref.trim() } : {}) });
      if (!r.success) {
        setErr(r.message);
        return;
      }
      finish(r.data);
    } catch (e) {
      const m = e instanceof Error ? e.message : 'Google sign-up failed';
      setErr(/popup|closed|cancel/i.test(m) ? 'Google popup was closed. Try again.' : m);
    } finally {
      setBusy(false);
    }
  };

  const direct = async () => {
    setErr('');
    setBusy(true);
    try {
      const r = await api.register({
        username: username.trim(), email: email.trim(), password,
        ...(ref.trim() ? { referralCode: ref.trim() } : {}),
      });
      if (!r.success) {
        setErr(r.message);
        return;
      }
      finish(r.data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Registration failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="glass rounded-3xl p-8">
        <h1 className="text-2xl font-bold text-white">Create your account</h1>
        <p className="mt-1 text-sm text-zinc-400">Free forever plan · 100 calls every month · no email code needed.</p>
        <div className="mt-6">
          <input className="input" placeholder="Referral code (optional)" value={ref} onChange={(e) => setRef(e.target.value)} />
        </div>
        <button
          onClick={google}
          disabled={busy}
          className="mt-3 flex w-full items-center justify-center gap-2.5 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100 disabled:opacity-60"
        >
          <GoogleIcon /> {busy ? 'Opening Google…' : 'Sign up with Google'}
        </button>
        <div className="my-5 flex items-center gap-3 text-xs text-zinc-500">
          <span className="h-px flex-1 bg-white/10" /> or with email <span className="h-px flex-1 bg-white/10" />
        </div>
        <div className="space-y-3">
          <input className="input" placeholder="Username (letters, numbers, _)" value={username} onChange={(e) => setUsername(e.target.value)} />
          <input className="input" placeholder="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="input" placeholder="Password (6+ characters)" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {err && <p className="flex items-center gap-2 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200"><AlertTriangle size={16} /> {err}</p>}
          <button className="btn-primary w-full" disabled={busy || !username || !email || !password} onClick={direct}>
            {busy ? 'Creating…' : <>Create account <ArrowRight size={16} /></>}
          </button>
        </div>
        <p className="mt-5 text-center text-sm text-zinc-400">
          Already have an account? <Link href="/login" className="text-indigo-300 hover:text-white">Log in</Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterInner />
    </Suspense>
  );
}
