'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { AlertTriangle, ArrowRight, MailCheck } from 'lucide-react';
import { api, store } from '@/lib/api';
import InputOTP from '@/components/InputOTP';

function RegisterInner() {
  const router = useRouter();
  const qp = useSearchParams();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ref, setRef] = useState('');
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const r = qp.get('ref');
    if (r) setRef(r);
  }, [qp]);

  const finish = (data: unknown) => {
    const d = (data || {}) as { user?: { username: string; apiKey: string; plan?: string }; token?: string };
    if (!d.user?.apiKey) { setErr('Registered, but no API key was returned. Try logging in.'); return; }
    store.setSession({ username: d.user.username, apiKey: d.user.apiKey, plan: d.user.plan }, d.token);
    router.push('/dashboard');
  };

  const send = async () => {
    setErr(''); setFallback(false); setBusy(true);
    try {
      const r = await api.sendOtp({ username: username.trim(), email: email.trim(), password, ...(ref ? { referralCode: ref.trim() } : {}) });
      if (!r.success) {
        setErr(r.message);
        if (/send|mail|smtp|brevo/i.test(r.message)) setFallback(true);
        return;
      }
      setStep('otp');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to send code');
      setFallback(true);
    } finally {
      setBusy(false);
    }
  };

  const verify = async (otp: string) => {
    setErr(''); setBusy(true);
    try {
      const r = await api.verifyOtp({ email: email.trim(), otp });
      if (!r.success) { setErr(r.message); return; }
      finish(r.data);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Verification failed');
    } finally {
      setBusy(false);
    }
  };

  const direct = async () => {
    setErr(''); setBusy(true);
    try {
      const r = await api.register({ username: username.trim(), email: email.trim(), password, ...(ref ? { referralCode: ref.trim() } : {}) });
      if (!r.success) { setErr(r.message); return; }
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
        {step === 'form' ? (
          <>
            <h1 className="text-2xl font-bold text-white">Create your account</h1>
            <p className="mt-1 text-sm text-zinc-400">Free forever plan · 100 calls every month.</p>
            <div className="mt-6 space-y-3">
              <input className="input" placeholder="Username (letters, numbers, _)" value={username} onChange={(e) => setUsername(e.target.value)} />
              <input className="input" placeholder="Gmail address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input className="input" placeholder="Password (6+ characters)" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <input className="input" placeholder="Referral code (optional)" value={ref} onChange={(e) => setRef(e.target.value)} />
              {err && <p className="flex items-center gap-2 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200"><AlertTriangle size={16} /> {err}</p>}
              <button className="btn-primary w-full" disabled={busy || !username || !email || !password} onClick={send}>
                {busy ? 'Sending code…' : <>Send verification code <ArrowRight size={16} /></>}
              </button>
              {fallback && (
                <button className="btn-ghost w-full" disabled={busy} onClick={direct}>
                  Continue without email verification
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <MailCheck size={22} className="text-indigo-300" />
              <h1 className="text-2xl font-bold text-white">Check your inbox</h1>
            </div>
            <p className="mt-1 text-sm text-zinc-400">We sent a 6-digit code to <span className="text-zinc-200">{email}</span>. It expires in 10 minutes.</p>
            <div className="mt-6">
              <InputOTP onComplete={verify} />
            </div>
            {err && <p className="mt-4 flex items-center gap-2 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200"><AlertTriangle size={16} /> {err}</p>}
            <button className="btn-ghost mt-5 w-full" disabled={busy} onClick={() => setStep('form')}>Use a different email</button>
          </>
        )}
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
