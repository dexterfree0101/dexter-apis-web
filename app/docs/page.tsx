'use client';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CircleAlert, Crown, FlaskConical, KeyRound, Play } from 'lucide-react';
import { api, callApiEndpoint, store } from '@/lib/api';
import Tabs from '@/components/Tabs';
import CodeBlock from '@/components/CodeBlock';
import CopyButton from '@/components/CopyButton';
import { useToast } from '@/components/Toast';

const VIP_CATS = ['AI', 'Download', 'Image', 'NSFW', 'Stalker', 'Adult'];
const ALL = '__all';

interface ParamDef { required?: boolean; type?: string; example?: string; desc?: string }
interface SvcItem {
  name: string; path?: string; endpoint?: string; method?: string;
  desc?: string; description?: string;
  status?: string; vipOnly?: boolean; vip?: boolean;
  params?: Record<string, ParamDef> | { name: string; required?: boolean; example?: string; desc?: string }[];
  example?: string;
  __cat?: string;
}
interface SvcCat { name: string; items: SvcItem[] }

function epOf(it: SvcItem) {
  return it.endpoint || it.path || '';
}

function normPath(p: string) {
  const clean = p.replace(/^\/api\//, '').replace(/^\//, '');
  return '/api/' + clean;
}

function isVip(it: SvcItem, cat: string) {
  return !!(it.vipOnly || it.vip || VIP_CATS.includes(it.__cat || cat));
}

function DocsInner() {
  const qp = useSearchParams();
  const toast = useToast();
  const [cats, setCats] = useState<SvcCat[]>([]);
  const [cat, setCat] = useState(ALL);
  const [sel, setSel] = useState<SvcItem | null>(null);
  const [key, setKey] = useState('');
  const [vals, setVals] = useState<Record<string, string>>({});
  const [out, setOut] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    setKey(store.user?.apiKey || '');
    api.services().then((r) => {
      const raw = (((r.data || {}) as { categories?: { name: string; apis: SvcItem[] }[] }).categories || []);
      const list: SvcCat[] = raw.map((c) => ({ name: c.name, items: (c.apis || []).map((it) => ({ ...it, __cat: c.name })) }));
      setCats(list);
      const want = qp.get('cat');
      if (want && list.some((c) => c.name === want)) setCat(want);
    }).catch(() => setErr('Failed to load API registry (server may be waking up — retry in 30s).'));
  }, [qp]);

  const total = useMemo(() => cats.reduce((n, c) => n + c.items.length, 0), [cats]);
  const items = useMemo(
    () => (cat === ALL ? cats.flatMap((c) => c.items) : cats.find((c) => c.name === cat)?.items || []),
    [cats, cat]
  );

  const pick = (it: SvcItem) => {
    setSel(it);
    const pv: Record<string, string> = {};
    const prm = it.params;
    if (prm && !Array.isArray(prm)) {
      for (const [k, v] of Object.entries(prm)) {
        if (k.toLowerCase() === 'apikey') continue;
        pv[k] = v.example || '';
      }
    } else if (Array.isArray(prm)) {
      for (const p of prm) {
        if (p.name.toLowerCase() === 'apikey') continue;
        pv[p.name] = p.example || '';
      }
    }
    setVals(pv);
    setOut('');
  };

  const run = async () => {
    if (!sel) return;
    setBusy(true); setErr(''); setOut('');
    try {
      const r = await callApiEndpoint(normPath(epOf(sel)), { ...vals, apikey: key });
      setOut(JSON.stringify(r, null, 2).slice(0, 12000));
      const st = (r as { status?: number })?.status;
      if (st === 403) toast('VIP endpoint — upgrade your plan to use it', 'error');
      else if (st === 429) toast('Monthly quota exhausted — see Plans', 'error');
    } catch (e) {
      const m = e instanceof Error ? e.message : 'Request failed';
      setErr(m);
      toast(m, 'error');
    } finally {
      setBusy(false);
    }
  };

  const paramEntries: [string, ParamDef][] = useMemo(() => {
    if (!sel?.params) return [];
    if (Array.isArray(sel.params)) {
      return sel.params.filter((p) => p.name.toLowerCase() !== 'apikey').map((p) => [p.name, { required: p.required, example: p.example, desc: p.desc }]);
    }
    return Object.entries(sel.params).filter(([k]) => k.toLowerCase() !== 'apikey');
  }, [sel]);

  const curl = sel ? `curl "${normPath(epOf(sel))}?${new URLSearchParams({ ...vals, apikey: key || 'YOUR_KEY' }).toString()}"` : '';

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="flex items-center gap-2 text-2xl font-bold text-white sm:text-3xl"><FlaskConical className="text-indigo-300" /> API Docs & Playground</h1>
      <p className="mt-1 text-sm text-zinc-400">Pick an endpoint, fill params, execute live. Quota cost: 1 call each.</p>

      <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.02] p-3">
        <KeyRound size={16} className="ml-1 text-zinc-400" />
        <input
          className="input !w-auto flex-1 font-mono !text-xs" placeholder="Paste API key to try endpoints"
          value={key} onChange={(e) => setKey(e.target.value)}
        />
        {!store.user && <span className="px-1 text-xs text-zinc-500">No key? <a href="/register" className="text-indigo-300">Get one free</a></span>}
      </div>

      {err && !cats.length && (
        <p className="mt-4 flex items-center gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          <CircleAlert size={16} /> {err}
        </p>
      )}

      <div className="mt-5">
        <Tabs
          tabs={[{ id: ALL, label: `All (${total})` }, ...cats.map((c) => ({ id: c.name, label: `${c.name} (${c.items.length})` }))]}
          value={cat}
          onChange={(id) => { setCat(id); setSel(null); setOut(''); }}
        />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-5">
        <div className="max-h-[70vh] space-y-2 overflow-y-auto pr-1 lg:col-span-2">
          {items.map((it) => {
            const active = !!sel && epOf(sel) === epOf(it);
            return (
              <button
                key={`${it.__cat}:${epOf(it)}`}
                onClick={() => pick(it)}
                className={`w-full rounded-xl border p-3 text-left transition ${active ? 'border-indigo-400/60 bg-indigo-500/10' : 'border-white/10 bg-white/[0.02] hover:border-indigo-400/40'}`}
              >
                <span className="flex items-center gap-2 text-sm font-medium text-white">
                  {it.name}
                  {isVip(it, cat) && <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-semibold text-amber-300"><Crown size={10} /> VIP</span>}
                </span>
                <span className="mt-0.5 block truncate font-mono text-[11px] text-zinc-500">
                  {cat === ALL && it.__cat ? `[${it.__cat}] ` : ''}{normPath(epOf(it))}
                </span>
              </button>
            );
          })}
          {!items.length && <p className="text-sm text-zinc-500">No endpoints in this category.</p>}
        </div>

        <div className="lg:col-span-3">
          {!sel ? (
            <div className="glass rounded-2xl p-10 text-center text-sm text-zinc-400">Select an endpoint to inspect and try it.</div>
          ) : (
            <div className="glass space-y-4 rounded-2xl p-5">
              <div>
                <p className="text-lg font-semibold text-white">{sel.name}</p>
                <p className="mt-0.5 font-mono text-xs text-emerald-300">GET {normPath(epOf(sel))}</p>
                {(sel.desc || sel.description) && <p className="mt-1.5 text-sm text-zinc-400">{sel.desc || sel.description}</p>}
              </div>
              {paramEntries.length > 0 && (
                <div className="space-y-2">
                  {paramEntries.map(([k, v]) => (
                    <div key={k}>
                      <label className="mb-1 flex items-center gap-2 text-xs text-zinc-400">
                        <span className="font-mono text-zinc-200">{k}</span>
                        {v.required && <span className="rounded bg-rose-500/15 px-1.5 text-[10px] text-rose-300">required</span>}
                        {v.desc && <span className="text-zinc-500">· {v.desc}</span>}
                      </label>
                      <input className="input font-mono !text-xs" value={vals[k] ?? ''} onChange={(e) => setVals({ ...vals, [k]: e.target.value })} placeholder={v.example || v.type || ''} />
                    </div>
                  ))}
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                <button className="btn-primary !py-2 text-sm" disabled={busy || !key} onClick={run}>
                  <Play size={15} /> {busy ? 'Running…' : 'Execute'}
                </button>
                <CopyButton text={(process.env.NEXT_PUBLIC_API_URL || 'https://dexter-apis.onrender.com') + curl.slice(4)} label="Copy URL" />
              </div>
              {err && <p className="text-sm text-rose-300">{err}</p>}
              {out && <CodeBlock code={out} title="Live response" />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DocsPage() {
  return (
    <Suspense>
      <DocsInner />
    </Suspense>
  );
}
