'use client';
import { useEffect, useState } from 'react';
import { BadgeCheck, Building2, Crown, History, MessageCircle, Send, X } from 'lucide-react';
import { api, store, type PlanInfo } from '@/lib/api';
import { ProgressBar } from '@/components/Progress';
import { CONTACTS } from '@/components/Footer';

type J = Record<string, any>;

export default function PlansPage() {
  const [plans, setPlans] = useState<PlanInfo[]>([]);
  const [status, setStatus] = useState<J | null>(null);
  const [hist, setHist] = useState<J[]>([]);
  const [logged, setLogged] = useState(false);
  const [show, setShow] = useState<PlanInfo | null>(null);
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');
  const [calls, setCalls] = useState('');
  const [devName, setDevName] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.plans().then((r) => r.success && setPlans(((r.data || {}) as { plans?: PlanInfo[] }).plans || [])).catch(() => {});
    const u = store.user;
    if (u) {
      setLogged(true);
      api.subStatus(u.apiKey).then((r) => r.success && setStatus((r.data || {}) as J)).catch(() => {});
      api.subHistory(u.apiKey).then((r) => {
        if (r.success) setHist((((r.data || {}) as { payments?: J[] }).payments) || []);
      }).catch(() => {});
    }
  }, []);

  const submit = async () => {
    if (!show || !store.user) return;
    setMsg(''); setBusy(true);
    try {
      const r = await api.subRequest({
        apikey: store.user.apiKey,
        plan: show.id,
        reference: reference.trim(),
        ...(note ? { note } : {}),
        ...(show.id === 'custom' ? { requestedCalls: Number(calls) || 0, ...(devName ? { requestedDevName: devName } : {}) } : {}),
      });
      setMsg(r.message);
      if (r.success) {
        setShow(null); setReference(''); setNote(''); setCalls(''); setDevName('');
        const h = await api.subHistory(store.user.apiKey);
        if (h.success) setHist((((h.data || {}) as { payments?: J[] }).payments) || []);
      }
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Request failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-center text-2xl font-bold text-white sm:text-3xl">Plans & Pricing</h1>
      <p className="mt-1 text-center text-sm text-zinc-400">Pay by bank transfer, get approved by a human, build without limits.</p>

      {logged && status && (
        <div className="glass mx-auto mt-6 flex max-w-2xl flex-wrap items-center justify-between gap-3 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-sm">
            <Crown size={16} className="text-amber-300" />
            <span className="text-zinc-400">Current:</span>
            <span className="font-semibold text-white">{String(status.plan || 'free').toUpperCase()}</span>
            <span className="text-zinc-500">·</span>
            <span className="text-zinc-300">{status.quota?.used ?? 0} / {status.quota?.limit ?? 0} calls</span>
          </div>
          <div className="w-40"><ProgressBar value={status.quota?.used || 0} max={status.quota?.limit || 1} /></div>
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {plans.map((p) => (
          <div key={p.id} className={`flex flex-col rounded-3xl p-6 ${p.id === 'plus' ? 'border border-indigo-400/50 bg-indigo-500/10 shadow-[0_0_36px_rgba(99,102,241,0.25)]' : 'glass'}`}>
            {p.id === 'plus' && <span className="mb-2 inline-block w-fit rounded-full bg-indigo-500 px-2.5 py-0.5 text-[11px] font-semibold text-white">POPULAR</span>}
            <p className="text-lg font-semibold text-white">{p.name}</p>
            <p className="mt-1 text-3xl font-bold text-white">{p.price > 0 ? `Rs.${p.price}` : p.id === 'custom' ? "Let's talk" : 'Rs. 0'}</p>
            <p className="text-sm text-indigo-300">{p.calls > 0 ? `${p.calls.toLocaleString()} calls / ${p.id === 'free' ? 'day (auto-refill)' : 'month'}` : 'tailored limits'}</p>
            <ul className="mt-4 flex-1 space-y-2 text-sm text-zinc-300">
              {(p.features || []).map((f) => <li key={f} className="flex items-start gap-2"><BadgeCheck size={15} className="mt-0.5 shrink-0 text-emerald-400" /> {f}</li>)}
            </ul>
            {p.id !== 'free' ? (
              <button className={p.id === 'plus' ? 'btn-primary mt-5 w-full' : 'btn-ghost mt-5 w-full'} onClick={() => { setShow(p); setMsg(''); }}>
                Subscribe
              </button>
            ) : (
              <a href={logged ? '/dashboard' : '/register'} className="btn-ghost mt-5 w-full text-center">{logged ? 'Current plan' : 'Start free'}</a>
            )}
          </div>
        ))}
      </div>

      {/* How to pay */}
      <div className="glass mt-8 grid gap-6 rounded-3xl p-6 md:grid-cols-2">
        <div>
          <p className="flex items-center gap-2 font-semibold text-white"><Building2 size={18} className="text-indigo-300" /> How payment works</p>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-zinc-300">
            <li>Pick a plan above and click Subscribe.</li>
            <li>Bank-transfer the amount (ask us for account details on WhatsApp).</li>
            <li>Submit the form with your payment reference number.</li>
            <li>Admin approves — usually within hours — quota activates instantly.</li>
          </ol>
        </div>
        <div>
          <p className="font-semibold text-white">Custom plan? Talk to us</p>
          <div className="mt-3 space-y-2 text-sm">
            {CONTACTS.whatsapp.map((n) => (
              <a key={n} href={`https://wa.me/${n}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-zinc-300 hover:text-white">
                <MessageCircle size={15} className="text-emerald-400" /> WhatsApp +{n}
              </a>
            ))}
            <a href={`https://t.me/${CONTACTS.telegram}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-zinc-300 hover:text-white">
              <Send size={15} className="text-sky-400" /> Telegram @{CONTACTS.telegram}
            </a>
          </div>
        </div>
      </div>

      {logged && hist.length > 0 && (
        <div className="glass mt-6 rounded-3xl p-6">
          <p className="flex items-center gap-2 font-semibold text-white"><History size={17} className="text-indigo-300" /> Your requests</p>
          <div className="mt-3 space-y-2">
            {hist.map((h, i) => (
              <div key={i} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 text-sm">
                <span className="font-medium text-white">{String(h.plan).toUpperCase()} · {h.amount}</span>
                <span className="font-mono text-xs text-zinc-400">{h.reference}</span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${h.status === 'approved' ? 'bg-emerald-500/15 text-emerald-300' : h.status === 'rejected' ? 'bg-rose-500/15 text-rose-300' : 'bg-amber-400/15 text-amber-300'}`}>
                  {h.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {msg && !show && <p className="mt-4 text-center text-sm text-zinc-200">{msg}</p>}

      {/* Subscribe modal */}
      {show && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setShow(null)}>
          <div className="glass w-full max-w-md rounded-3xl !bg-[#0c0c14] p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold text-white">Subscribe · {show.name}</p>
              <button onClick={() => setShow(null)} className="text-zinc-400 hover:text-white"><X size={18} /></button>
            </div>
            {!logged ? (
              <p className="mt-4 text-sm text-zinc-300">Please <a href="/login" className="text-indigo-300">log in</a> first.</p>
            ) : (
              <div className="mt-4 space-y-3">
                <input className="input" placeholder="Bank payment reference (required)" value={reference} onChange={(e) => setReference(e.target.value)} />
                {show.id === 'custom' && (
                  <>
                    <input className="input" placeholder="Requested calls / month" inputMode="numeric" value={calls} onChange={(e) => setCalls(e.target.value)} />
                    <input className="input" placeholder="Custom dev name (shows in API responses)" value={devName} onChange={(e) => setDevName(e.target.value)} />
                  </>
                )}
                <input className="input" placeholder="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} />
                {msg && <p className="text-sm text-zinc-300">{msg}</p>}
                <button className="btn-primary w-full" disabled={busy || !reference.trim() || (show.id === 'custom' && !(Number(calls) > 0))} onClick={submit}>
                  {busy ? 'Submitting…' : 'Submit request'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
