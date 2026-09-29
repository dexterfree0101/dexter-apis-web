'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import { AlertTriangle, Gift, Loader2 } from 'lucide-react';
import { api, store } from '@/lib/api';
import { consumeGoogleRedirect, friendlyAuthError, signInWithGoogleSmart } from '@/lib/firebase';
import { useToast } from '@/components/Toast';

const REF_KEY = 'dexter_pending_ref';

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
  const [ref, setRef] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');
  const done = useRef(false);

  const finish = (data: unknown) => {
    const d = (data || {}) as { user?: { username: string; apiKey: string; plan?: string }; token?: string };
    if (!d.user?.apiKey) {
      setErr('Registered, but no API key was returned. Try logging in.');
      setBusy(false);
      return;
    }
    try { sessionStorage.removeItem(REF_KEY); } catch { /* noop */ }
    store.setSession({ username: d.user.username, apiKey: d.user.apiKey, plan: d.user.plan }, d.token);
    toast('Account ready — welcome aboard', 'success');
    router.push('/dashboard');
  };

  useEffect(() => {
    const q = qp.get('ref') || '';
    let saved = '';
    try { saved = sessionStorage.getItem(REF_KEY) || ''; } catch { /* noop */ }
    if (q) setRef(q);
    else if (saved) setRef(saved);

    // Complete a full-page Google redirect sign-up (if one is pending)
    (async () => {
      try {
        const cred = await consumeGoogleRedirect();
        if (cred && !done.current) {
          done.current = true;
          setBusy(true);
          setNote('Completing Google sign-up…');
          const code = (q || saved).trim();
          const r = await api.firebase({ idToken: cred.idToken, ...(code ? { referralCode: code } : {}) });
          if (!r.success) {
            setErr(r.message);
            setBusy(false);
            setNote('');
            return;
          }
          finish(r.data);
        }
      } catch (e) {
        setErr(friendlyAuthError(e));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qp]);

  const google = async () => {
    setErr('');
    setBusy(true);
    try { sessionStorage.setItem(REF_KEY, ref.trim()); } catch { /* noop */ }
    try {
      const res = await signInWithGoogleSmart();
      if (res === 'redirecting') {
        setNote('Redirecting to Google…');
        return;
      }
      const code = ref.trim();
      const r = await api.firebase({ idToken: res.idToken, ...(code ? { referralCode: code } : {}) });
      if (!r.success) {
        setErr(r.message);
        setBusy(false);
        return;
      }
      finish(r.data);
    } catch (e) {
      setErr(friendlyAuthError(e));
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="glass rounded-3xl p-8 text-center">
        <div className="mx-auto mb-4 inline-flex rounded-2xl bg-gradient-to-br from-indigo-500/25 to-violet-500/25 p-3.5 text-indigo-300">
          <Gift size={26} />
        </div>
        <h1 className="text-2xl font-bold text-white">Create your account</h1>
        <p className="mt-1.5 text-sm text-zinc-400">Free forever plan · 100 calls every month · 30-second setup.</p>
        <div className="mt-6 text-left">
          <input
            className="input"
            placeholder="Referral code (optional — earns you bonus calls)"
            value={ref}
            onChange={(e) => setRef(e.target.value)}
          />
        </div>
        <button
          onClick={google}
          disabled={busy}
          className="mt-3 flex w-full items-center justify-center gap-2.5 rounded-xl bg-white px-4 py-3.5 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100 disabled:opacity-70"
        >
          {busy && !note ? <Loader2 size={18} className="animate-spin" /> : <GoogleIcon />}
          {note || (busy ? 'Opening Google…' : 'Sign up with Google')}
        </button>
        {err && (
          <p className="mt-4 flex items-start gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3.5 py-2.5 text-left text-sm text-rose-200">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" /> {err}
          </p>
        )}
        <p className="mt-6 text-sm text-zinc-400">
          Already have an account? <Link href="/login" className="font-medium text-indigo-300 hover:text-white">Log in</Link>
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
