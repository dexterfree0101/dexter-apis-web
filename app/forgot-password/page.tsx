'use client';
import Link from 'next/link';
import { useState } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';
import InputOTP from '@/components/InputOTP';

export default function ForgotPage() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [otp, setOtp] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const send = async () => {
    setErr(''); setBusy(true);
    try {
      const r = await api.forgot({ email: email.trim() });
      if (!r.success) { setErr(r.message); return; }
      setStep('reset');
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Failed to send code');
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    setErr(''); setBusy(true);
    try {
      const r = await api.reset({ email: email.trim(), otp, newPassword: pw });
      if (!r.success) { setErr(r.message); return; }
      setDone(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Reset failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="glass rounded-3xl p-8">
        <h1 className="text-2xl font-bold text-white">Reset password</h1>
        {done ? (
          <p className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
            <CheckCircle2 size={16} /> Password reset. <Link href="/login" className="underline">Log in</Link>
          </p>
        ) : step === 'email' ? (
          <div className="mt-6 space-y-3">
            <input className="input" placeholder="Account email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            {err && <p className="flex items-center gap-2 text-sm text-rose-300"><AlertTriangle size={16} /> {err}</p>}
            <button className="btn-primary w-full" disabled={busy || !email} onClick={send}>{busy ? 'Sending…' : 'Send reset code'}</button>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <InputOTP onComplete={(c) => setOtp(c)} />
            <input className="input" placeholder="New password (6+ characters)" type="password" value={pw} onChange={(e) => setPw(e.target.value)} />
            {err && <p className="flex items-center gap-2 text-sm text-rose-300"><AlertTriangle size={16} /> {err}</p>}
            <button className="btn-primary w-full" disabled={busy || otp.length !== 6 || pw.length < 6} onClick={reset}>
              {busy ? 'Resetting…' : 'Set new password'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
