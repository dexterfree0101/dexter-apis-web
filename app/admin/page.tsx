'use client';
import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Check, ShieldCheck, Ticket, Users, Wallet, X } from 'lucide-react';
import { api, store } from '@/lib/api';
import Tabs from '@/components/Tabs';

type J = Record<string, any>;

export default function AdminPage() {
  const [token, setToken] = useState('');
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState<J | null>(null);
  const [subs, setSubs] = useState<J[]>([]);
  const [users, setUsers] = useState<J[]>([]);
  const [coupons, setCoupons] = useState<J[]>([]);
  const [filter, setFilter] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [months, setMonths] = useState('1');
  const [rej, setRej] = useState<Record<string, string>>({});
  const [cpPlan, setCpPlan] = useState('plus');
  const [cpDays, setCpDays] = useState('7');
  const [cpUses, setCpUses] = useState('1');

  useEffect(() => { setToken(store.adminToken || ''); }, []);

  const load = useCallback(async (t: string) => {
    setBusy(true);
    try {
      const [s, b, u, c] = await Promise.all([
        api.adminStats(t), api.adminSubs(t), api.adminUsers(t, '?limit=50'), api.adminCoupons(t),
      ]);
      if (s.success) setStats((s.data || {}) as J);
      if (b.success) setSubs((((b.data || {}) as { subscriptions?: J[] }).subscriptions) || []);
      if (u.success) setUsers((((u.data || {}) as { users?: J[] }).users) || []);
      if (c.success) setCoupons((((c.data || {}) as { coupons?: J[] }).coupons) || []);
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
    setMsg('');
    const r = await api.adminApprove(token, id, { months: Number(months) || 1 });
    setMsg(r.message);
    if (r.success) load(token);
  };

  const reject = async (id: string) => {
    setMsg('');
    const r = await api.adminReject(token, id, rej[id] || '');
    setMsg(r.message);
    if (r.success) load(token);
  };

  const mkCoupon = async () => {
    setMsg('');
    const r = await api.adminCouponCreate(token, { plan: cpPlan, days: Number(cpDays) || 7, maxUses: Number(cpUses) || 1 });
    setMsg(r.success ? `Created: ${((r.data || {}) as J).code}` : r.message);
    if (r.success) load(token);
  };

  if (!token) {
    return (
      <div className="mx-auto max-w-sm px-4 py-20">
        <div className="glass rounded-3xl p-8">
          <p className="flex items-center gap-2 text-lg font-semibold text-white"><ShieldCheck className="text-indigo-300" /> Admin access</p>
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
        <button
          onClick={() => { store.clearAdmin(); setToken(''); }}
          className="btn-ghost !px-4 !py-2 text-sm"
        >
          Log out
        </button>
      </div>

      <div className="mt-4">
        <Tabs
          tabs={[
            { id: 'overview', label: 'Overview' },
            { id: 'subs', label: `Subscriptions (${subs.filter((s) => s.status === 'pending').length} pending)` },
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
