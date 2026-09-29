'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AlertTriangle, LogIn } from 'lucide-react';
import { api, store } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setErr('');
    setBusy(true);
    try {
      const r = await api.login({ email: email.trim(), password });
      if (!r.success) { setErr(r.message); return; }
      const d = (r.data || {}) as { user?: { username: string; apiKey: string; plan?: string }; token?: string };
      if (!d.user?.apiKey) { setErr('Login succeeded but no API key was returned.'); return; }
      store.setSession({ username: d.user.username, apiKey: d.user.apiKey, plan: d.user.plan }, d.token);
      router.push('/dashboard');
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
        <div className="mt-6 space-y-3">
          <input className="input" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input
            className="input" placeholder="Password" type="password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
          />
          {err && <p className="flex items-center gap-2 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200"><AlertTriangle size={16} /> {err}</p>}
          <button className="btn-primary w-full" disabled={busy || !email || !password} onClick={submit}>
            <LogIn size={16} /> {busy ? 'Logging in…' : 'Login'}
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
