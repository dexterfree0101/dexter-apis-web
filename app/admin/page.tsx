'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Check, Plug, ShieldCheck, Ticket, Users, Wallet, X } from 'lucide-react';
import { api, store } from '@/lib/api';
import { consumeGoogleRedirect, friendlyAuthError, signInWithGoogleSmart } from '@/lib/firebase';
import Tabs from '@/components/Tabs';
import { useToast } from '@/components/Toast';

type J = Record<string, any>;

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

function Switch({ on, onFlip, label }: { on: boolean; onFlip: () => void; label: string }) {
  return (
    <button
      onClick={onFlip}
      title={label}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${on ? 'bg-gradient-to-r from-indigo-500 to-violet-500' : 'bg-white/10'}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? 'left-[22px]' : 'left-0.5'}`}
      />
    </button>
  );
}

export default function AdminPage() {
  const toast = useToast();
  const [token, setToken] = useState('');
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState<J | null>(null);
  const [subs, setSubs] = useState<J[]>([]);
  const [users, setUsers] = useState<J[]>([]);
  const [coupons, setCoupons] = useState<J[]>([]);
  const [apis, setApis] = useState<J[]>([]);
  const [apiCat, setApiCat] = useState('__all');
  const [filter, setFilter] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [months, setMonths] = useState('1');
  const [rej, setRej] = useState<Record<string, string>>({});
  const [cpPlan, setCpPlan] = useState('plus');
  const [cpDays, setCpDays] = useState('7');
  const [cpUses, setCpUses] = useState('1');

  useEffect(() => { setToken(store.adminToken || ''); }, []);

  // Complete a Google redirect sign-in (if one is pending)
  useEffect(() => {
    (async () => {
      try {
        const cred = await consumeGoogleRedirect();
        if (cred) await googleAdminWith(cred.idToken);
      } catch (e) {
        setErr(friendlyAuthError(e));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const googleAdminWith = async (idToken: string) => {
    const r = await api.firebase({ idToken });
    const t = ((r.data || {}) as { adminToken?: string }).adminToken || '';
    if (r.success && t) {
      store.setAdmin(t);
      setToken(t);
      toast('Welcome, admin', 'success');
    } else if (r.success) {
      setErr('This Gmail is not an admin account.');
    } else {
      setErr(r.message);
    }
  };

  const googleAdmin = async () => {
    setErr('');
    try {
      const res = await signInWithGoogleSmart();
      if (res === 'redirecting') return;
      await googleAdminWith(res.idToken);
    } catch (e) {
      setErr(friendlyAuthError(e));
    }
  };

  const load = useCallback(async (t: string) => {
    setBusy(true);
    try {
      const [s, b, u, c, a] = await Promise.all([
        api.adminStats(t), api.adminSubs(t), api.adminUsers(t, '?limit=50'), api.adminCoupons(t),
        api.adminApis(t).catch(() => null),
      ]);
      if (s.success) setStats((s.data || {}) as J);
      if (b.success) setSubs((((b.data || {}) as { subscriptions?: J[] }).subscriptions) || []);
      if (u.success) setUsers((((u.data || {}) as { users?: J[] }).users) || []);
      if (c.success) setCoupons((((c.data || {}) as { coupons?: J[] }).coupons) || []);
      if (a?.success) setApis((((a.data || {}) as { apis?: J[] }).apis) || []);
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => { if (token) load(token); }, [token, load]);

  const login = async () => {
    setErr('');
    const r = await api.adminLogin({ adminId: adminId.trim(), password });
    if (!r.success) { setErr(r.message); return; }
    const t = ((r.data || {}) as { token?: string }).token || '';
    if (!t) { setErr('No token returned'); return; }
    store.setAdmin(t);
    setToken(t);
  };

  const approve = async (id: string) => {
    const r = await api.adminApprove(token, id, { months: Number(months) || 1 });
    setMsg(r.message);
    toast(r.message, r.success ? 'success' : 'error');
    if (r.success) load(token);
  };

  const reject = async (id: string) => {
    const r = await api.adminReject(token, id, rej[id] || '');
    setMsg(r.message);
    toast(r.message, r.success ? 'success' : 'error');
    if (r.success) load(token);
  };

  const mkCoupon = async () => {
    const r = await api.adminCouponCreate(token, { plan: cpPlan, days: Number(cpDays) || 7, maxUses: Number(cpUses) || 1 });
    const m = r.success ? `Created: ${((r.data || {}) as J).code}` : r.message;
    setMsg(m);
    toast(m, r.success ? 'success' : 'error');
    if (r.success) load(token);
  };

  const flipApi = async (a: J, patch: { vipOnly?: boolean; enabled?: boolean }) => {
    setApis((prev) => prev.map((x) => (x.handlerId === a.handlerId ? { ...x, ...patch, overridden: true } : x)));
    const r = await api.adminApiUpdate(token, a.handlerId, patch);
    if (!r.success) {
      toast(r.message, 'error');
      load(token);
    }
  };

  const apiCats = useMemo(() => ['__all', ...Array.from(new Set(apis.map((a) => String(a.category || 'Other'))))], [apis]);
  const shownApis = useMemo(
    () => (apiCat === '__all' ? apis : apis.filter((a) => String(a.category) === apiCat)),
    [apis, apiCat]
  );

  if (!token) {
    return (
      <div className="mx-auto max-w-sm px-4 py-20">
        <div className="glass rounded-3xl p-8">
          <p className="flex items-center gap-2 text-lg font-semibold text-white"><ShieldCheck className="text-indigo-300" /> Admin access</p>
          <button
            onClick={googleAdmin}
            className="mt-4 flex w-full items-center justify-center gap-2.5 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100"
          >
            <GoogleIcon /> Sign in with Google
          </button>
          <div className="my-4 flex items-center gap-3 text-xs text-zinc-500">
            <span className="h-px flex-1 bg-white/10" /> or with admin ID <span className="h-px flex-1 bg-white/10" />
          </div>
          <div className="mt-4 space-y-3">
            <input className="input font-mono" placeholder="Admin ID" value={adminId} onChange={(e) => setAdminId(e.target.value)} />
            <input className="input" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && login()} />
            {err && <p className="flex items-center gap-2 text-sm text-rose-300"><AlertTriangle size={15} /> {err}</p>}
            <button className="btn-primary w-full" onClick={login}>Login</button>
          </div>
        </div>
      </div>
    );
  }

  const shownUsers = filter ? users.filter((u) => String(u.username || '').toLowerCase().includes(filter.toLowerCase()) || String(u.email || '').toLowerCase().includes(filter.toLowerCase())) : users;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-white"><ShieldCheck className="text-indigo-300" /> Admin</h1>
        <button onClick={() => { store.clearAdmin(); setToken(''); }} className="btn-ghost !px-4 !py-2 text-sm">
          Log out
        </button>
      </div>

      <div className="mt-4">
        <Tabs
          tabs={[
            { id: 'overview', label: 'Overview' },
            { id: 'subs', label: `Subscriptions (${subs.filter((s) => s.status === 'pending').length} pending)` },
            { id: 'apis', label: `APIs (${apis.length})` },
            { id: 'users', label: `Users (${users.length})` },
            { id: 'coupons', label: 'Coupons' },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>

      {msg && <p className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-200">{msg}</p>}
      {busy && <p className="mt-3 text-sm text-zinc-500">Loading…</p>}

      {tab === 'overview' && stats && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { l: 'Users', v: stats.users ?? 0, icon: <Users size={16} /> },
            { l: 'Paid users', v: stats.paidUsers ?? 0, icon: <Wallet size={16} /> },
            { l: 'API calls', v: stats.requests ?? 0, icon: <Check size={16} /> },
            { l: 'Revenue', v: stats.payments?.revenue ?? 'Rs.0', icon: <Ticket size={16} /> },
          ].map((c) => (
            <div key={c.l} className="glass rounded-2xl p-5">
              <p className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-zinc-500">{c.icon} {c.l}</p>
              <p className="mt-1 text-2xl font-bold text-white">{c.v}</p>
            </div>
          ))}
          <div className="glass rounded-2xl p-5 sm:col-span-2 lg:col-span-4">
            <p className="text-xs uppercase tracking-widest text-zinc-500">Recent users</p>
            <div className="mt-2 space-y-1 text-sm text-zinc-300">
              {(stats.recentUsers || []).map((u: J, i: number) => (
                <p key={i} className="flex justify-between"><span>{u.username} <span className="text-zinc-500">({u.email})</span></span><span className="text-zinc-500">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : ''}</span></p>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'subs' && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <span>Approve for</span>
            <input className="input !w-20 !py-1.5" value={months} onChange={(e) => setMonths(e.target.value)} />
            <span>month(s)</span>
          </div>
          {subs.map((s) => (
            <div key={s._id || s.id} className="glass rounded-2xl p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-white">
                  <span className="font-semibold">{s.username}</span>
                  <span className="text-zinc-400"> → {String(s.plan).toUpperCase()} · Rs.{s.amount} · </span>
                  <span className="font-mono text-xs text-indigo-200">{s.reference}</span>
                  {s.plan === 'custom' && <span className="text-zinc-400"> · {s.requestedCalls} calls · dev: {s.requestedDevName || '—'}</span>}
                </p>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.status === 'approved' ? 'bg-emerald-500/15 text-emerald-300' : s.status === 'rejected' ? 'bg-rose-500/15 text-rose-300' : 'bg-amber-400/15 text-amber-300'}`}>{s.status}</span>
              </div>
              {s.note && <p className="mt-1 text-xs text-zinc-500">Note: {s.note}</p>}
              {s.status === 'pending' && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button className="btn-primary !py-1.5 text-sm" onClick={() => approve(s._id || s.id)}><Check size={15} /> Approve</button>
                  <input className="input !w-56 !py-1.5 !text-xs" placeholder="Reject reason" value={rej[s._id || s.id] || ''} onChange={(e) => setRej({ ...rej, [s._id || s.id]: e.target.value })} />
                  <button className="btn-ghost !py-1.5 text-sm !text-rose-200" onClick={() => reject(s._id || s.id)}><X size={15} /> Reject</button>
                </div>
              )}
            </div>
          ))}
          {!subs.length && <p className="text-sm text-zinc-500">No subscription requests yet.</p>}
        </div>
      )}

      {tab === 'apis' && (
        <div className="mt-4 space-y-3">
          <Tabs tabs={apiCats.map((c) => ({ id: c, label: c === '__all' ? `All (${apis.length})` : `${c} (${apis.filter((a) => String(a.category) === c).length})` }))} value={apiCat} onChange={setApiCat} />
          <div className="space-y-2">
            {shownApis.map((a) => (
              <div key={a.handlerId} className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 ${a.enabled === false ? 'border-rose-400/20 bg-rose-500/[0.04] opacity-70' : 'border-white/10 bg-white/[0.02]'}`}>
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-white">
                    {a.name}
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-zinc-300">{a.category}</span>
                    {a.status === 'down' && <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-semibold text-rose-300">DOWN</span>}
                    {a.overridden && <span className="rounded-full bg-indigo-500/15 px-2 py-0.5 text-[10px] font-semibold text-indigo-300">CUSTOM</span>}
                  </p>
                  <p className="mt-0.5 truncate font-mono text-[11px] text-zinc-500">{a.endpoint}</p>
                </div>
                <div className="flex items-center gap-5 text-xs text-zinc-400">
                  <span className="flex items-center gap-2">
                    <Plug size={14} className={a.enabled === false ? 'text-rose-300' : 'text-emerald-300'} />
                    {a.enabled === false ? 'Off' : 'On'}
                    <Switch on={a.enabled !== false} onFlip={() => flipApi(a, { enabled: !(a.enabled !== false) })} label="Enable / disable endpoint" />
                  </span>
                  <span className="flex items-center gap-2">
                    VIP
                    <Switch on={!!a.vipOnly} onFlip={() => flipApi(a, { vipOnly: !a.vipOnly })} label="VIP only" />
                  </span>
                </div>
              </div>
            ))}
            {!shownApis.length && <p className="text-sm text-zinc-500">No APIs found. Deploy backend v3.3+ for this tab.</p>}
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="mt-4">
          <input className="input max-w-xs" placeholder="Filter by username / email" value={filter} onChange={(e) => setFilter(e.target.value)} />
          <div className="mt-3 space-y-2">
            {shownUsers.slice(0, 100).map((u) => (
              <div key={u._id || u.username} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2.5 text-sm">
                <span className="text-white">{u.username} <span className="text-zinc-500">({u.email})</span></span>
                <span className="flex items-center gap-3 text-xs text-zinc-400">
                  <span className="rounded-full bg-white/10 px-2 py-0.5">{String(u.plan || 'free').toUpperCase()}</span>
                  <span>{u.quotaUsed ?? 0} calls</span>
                  {u.isBanned && <span className="text-rose-300">BANNED</span>}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'coupons' && (
        <div className="mt-4 space-y-3">
          <div className="glass flex flex-wrap items-end gap-3 rounded-2xl p-4">
            <div>
              <label className="mb-1 block text-xs text-zinc-400">Plan</label>
              <select className="input !w-32" value={cpPlan} onChange={(e) => setCpPlan(e.target.value)}>
                <option value="plus">Plus</option>
                <option value="pro">Pro</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-400">Days</label>
              <input className="input !w-24" value={cpDays} onChange={(e) => setCpDays(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-400">Max uses</label>
              <input className="input !w-24" value={cpUses} onChange={(e) => setCpUses(e.target.value)} />
            </div>
            <button className="btn-primary !py-2.5 text-sm" onClick={mkCoupon}><Ticket size={15} /> Create coupon</button>
          </div>
          <div className="space-y-2">
            {coupons.map((c, i) => (
              <div key={i} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2.5 font-mono text-sm">
                <span className="text-indigo-200">{c.code}</span>
                <span className="text-xs text-zinc-400">{String(c.plan).toUpperCase()} · {c.days}d · used {c.usedCount}/{c.maxUses}</span>
              </div>
            ))}
            {!coupons.length && <p className="text-sm text-zinc-500">No coupons yet.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
