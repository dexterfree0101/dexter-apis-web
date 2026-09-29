'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Activity, BookOpen, Crown, Gift, Link2, RefreshCw, Tags, Ticket, User as UserIcon, Users } from 'lucide-react';
import { api, store } from '@/lib/api';
import CopyButton from '@/components/CopyButton';
import { ProgressBar, QuotaRing } from '@/components/Progress';

type J = Record<string, any>;

export default function DashboardPage() {
  const router = useRouter();
  const [key, setKey] = useState('');
  const [info, setInfo] = useState<J | null>(null);
  const [sub, setSub] = useState<J | null>(null);
  const [ref, setRef] = useState<J | null>(null);
  const [coupon, setCoupon] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(true);

  const load = useCallback(async (k: string) => {
    setBusy(true);
    try {
      const [i, s, r] = await Promise.all([api.info(k), api.subStatus(k), api.referral(k)]);
      if (i.success) setInfo((i.data || {}) as J);
      if (s.success) setSub((s.data || {}) as J);
      if (r.success) setRef((r.data || {}) as J);
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    const u = store.user;
    if (!u) { router.push('/login'); return; }
    setKey(u.apiKey);
    load(u.apiKey);
  }, [router, load]);

  const redeem = async () => {
    setMsg('');
    const r = await api.redeem({ apikey: key, coupon: coupon.trim() });
    setMsg(r.message);
    if (r.success) { setCoupon(''); load(key); }
  };

  if (!key) return <div className="mx-auto max-w-6xl px-4 py-20 text-center text-zinc-400">Loading…</div>;

  const quota = (sub?.quota || info?.quota || { used: 0, limit: 100 }) as { used: number; limit: number; resetsAt?: string };
  const plan = String(sub?.plan || info?.plan || 'free');

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">Dashboard</h1>
          <p className="text-sm text-zinc-400">
            Signed in as <span className="text-zinc-200">{info?.username || store.user?.username}</span>
            {' · '}
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${plan === 'free' ? 'bg-white/10 text-zinc-200' : 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white'}`}>
              {plan !== 'free' && <Crown size={12} />} {plan.toUpperCase()}
            </span>
          </p>
        </div>
        <button onClick={() => load(key)} disabled={busy} className="btn-ghost !px-4 !py-2 text-sm">
          <RefreshCw size={15} className={busy ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* Quota */}
        <div className="glass rounded-3xl p-6 text-center">
          <QuotaRing used={quota.used || 0} limit={quota.limit || 100} />
          <div className="mt-4">
            <ProgressBar value={quota.used || 0} max={quota.limit || 100} />
            <p className="mt-2 text-xs text-zinc-400">
              {quota.used || 0} / {quota.limit || 0} used
              {quota.resetsAt ? ` · resets ${new Date(quota.resetsAt).toLocaleDateString()}` : ''}
            </p>
          </div>
          {plan === 'free' && (
            <Link href="/plans" className="btn-primary mt-4 w-full !py-2.5 text-sm"><Tags size={15} /> Upgrade plan</Link>
          )}
        </div>

        {/* API key */}
        <div className="glass rounded-3xl p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Your API key</p>
          <p className="mt-2 break-all rounded-xl border border-white/10 bg-black/40 p-3 font-mono text-sm text-emerald-300">{key}</p>
          <div className="mt-3 flex gap-2">
            <CopyButton text={key} label="Copy key" />
            <Link href="/docs" className="btn-ghost !px-3 !py-1.5 text-xs"><BookOpen size={14} /> Docs</Link>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-xl border border-white/10 bg-black/30 p-3">
              <Activity size={16} className="mx-auto text-indigo-300" />
              <p className="mt-1 text-xl font-bold text-white">{info?.totalRequests ?? sub?.totalRequests ?? 0}</p>
              <p className="text-[11px] text-zinc-400">total calls</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/30 p-3">
              <Gift size={16} className="mx-auto text-violet-300" />
              <p className="mt-1 text-xl font-bold text-white">{info?.quotaBonus ?? 0}</p>
              <p className="text-[11px] text-zinc-400">bonus calls</p>
            </div>
          </div>
        </div>

        {/* Referral */}
        <div className="glass rounded-3xl p-6">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-zinc-500">
            <Users size={14} /> Referral
          </p>
          <p className="mt-2 break-all rounded-xl border border-white/10 bg-black/40 p-3 font-mono text-xs text-indigo-200">
            {String(ref?.referralLink || `https://dexter-apis-web.vercel.app/register?ref=${ref?.referralCode || ''}`)}
          </p>
          <div className="mt-3">
            <CopyButton text={String(ref?.referralLink || ref?.referralCode || '')} label="Copy invite link" />
          </div>
          <div className="mt-4 space-y-1.5 text-sm text-zinc-300">
            <p className="flex justify-between"><span>Total referrals</span><span className="font-semibold text-white">{ref?.stats?.totalReferrals ?? 0}</span></p>
            <p className="flex justify-between"><span>Bonus earned</span><span className="font-semibold text-white">{ref?.stats?.totalBonusCalls ?? 0}</span></p>
            <p className="flex justify-between"><span>Plus progress</span><span className="font-semibold text-white">{ref?.planProgress?.percentage ?? 0}%</span></p>
          </div>
          <ProgressBar value={Number(ref?.planProgress?.percentage || 0)} max={100} className="mt-2" />
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {/* Coupon */}
        <div className="glass rounded-3xl p-6">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-zinc-500"><Ticket size={14} /> Redeem coupon</p>
          <div className="mt-3 flex gap-2">
            <input className="input font-mono uppercase" placeholder="DEXTER-PAID-…" value={coupon} onChange={(e) => setCoupon(e.target.value)} />
            <button className="btn-primary whitespace-nowrap" onClick={redeem} disabled={!coupon.trim()}><Link2 size={15} /> Redeem</button>
          </div>
          {msg && <p className="mt-2 text-sm text-zinc-300">{msg}</p>}
        </div>
        {/* Account */}
        <div className="glass rounded-3xl p-6">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-zinc-500"><UserIcon size={14} /> Account</p>
          <div className="mt-3 space-y-1.5 text-sm text-zinc-300">
            <p className="flex justify-between"><span>Email</span><span className="text-white">{info?.email || '—'}</span></p>
            <p className="flex justify-between"><span>Verified</span><span className="text-white">{info?.emailVerified ? 'Yes' : 'No'}</span></p>
            <p className="flex justify-between"><span>Subscription</span><span className="text-white">{sub?.subscription?.status || 'none'}{sub?.subscription?.expiresAt ? ` · till ${new Date(sub.subscription.expiresAt).toLocaleDateString()}` : ''}</span></p>
          </div>
          <Link href="/profile" className="btn-ghost mt-4 w-full !py-2 text-sm">Edit profile</Link>
        </div>
      </div>
    </div>
  );
}
