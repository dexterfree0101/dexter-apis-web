'use client';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search, ChevronDown, Play, KeyRound, Crown, Clock3, Terminal,
  CircleCheck, CircleAlert, CircleX, FlaskConical, Menu, X, Zap, Lock,
  ListOrdered, Braces, Globe,
} from 'lucide-react';
import { api, callApiEndpoint, store, API_BASE } from '@/lib/api';
import CodeBlock from '@/components/CodeBlock';
import CopyButton from '@/components/CopyButton';
import Tabs from '@/components/Tabs';
import { useToast } from '@/components/Toast';

const VIP_CATS = ['AI', 'Download', 'Image', 'NSFW', 'Stalker', 'Adult'];

interface ParamDef { required?: boolean; type?: string; example?: string; desc?: string }
interface SvcItem {
  name: string; path?: string; endpoint?: string; method?: string;
  desc?: string; description?: string;
  status?: string; vipOnly?: boolean; vip?: boolean; cost?: number;
  params?: Record<string, ParamDef> | { name: string; required?: boolean; example?: string; desc?: string }[];
  example?: string;
  __cat?: string;
}
interface SvcCat { name: string; items: SvcItem[] }

const STATUS_CODES = [
  { code: '200', label: 'OK — Request successful', tone: 'ok' },
  { code: '400', label: 'Bad Request — Invalid or missing parameters', tone: 'warn' },
  { code: '401', label: 'Unauthorized — Missing or invalid API key', tone: 'warn' },
  { code: '403', label: 'Forbidden — VIP endpoint or quota exhausted', tone: 'warn' },
  { code: '404', label: 'Not Found — No data for the given input', tone: 'warn' },
  { code: '429', label: 'Too Many Requests — Monthly quota exhausted', tone: 'warn' },
  { code: '500', label: 'Internal Server Error — Something broke on our side', tone: 'err' },
  { code: '502', label: 'Upstream Failed — Third-party source failed', tone: 'err' },
];

function epOf(it: SvcItem) {
  return it.endpoint || it.path || '';
}
function normPath(p: string) {
  const clean = p.replace(/^\/api\//, '').replace(/^\//, '');
  return '/api/' + clean;
}
function prettyName(it: SvcItem) {
  if (it.name) return it.name;
  const seg = epOf(it).split('/').filter(Boolean).pop() || 'Endpoint';
  return seg.replace(/-/g, ' ').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
function isVip(it: SvcItem) {
  return !!(it.vipOnly || it.vip || VIP_CATS.includes(it.__cat || ''));
}
function isReady(it: SvcItem) {
  return (it.status || 'ready') === 'ready';
}

function buildUrl(path: string, vals: Record<string, string>, key: string) {
  const q = new URLSearchParams({ ...vals, apikey: key || 'YOUR_KEY' }).toString();
  return `${API_BASE}${path}?${q}`;
}

function DocsInner() {
  const qp = useSearchParams();
  const toast = useToast();
  const [cats, setCats] = useState<SvcCat[]>([]);
  const [selKey, setSelKey] = useState('');
  const [key, setKey] = useState('');
  const [vals, setVals] = useState<Record<string, string>>({});
  const [out, setOut] = useState('');
  const [ms, setMs] = useState<number | null>(null);
  const [okFlag, setOkFlag] = useState<boolean | null>(null);
  const [outCode, setOutCode] = useState<string>('');
  const outRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [query, setQuery] = useState('');
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({});
  const [codeTab, setCodeTab] = useState('curl');
  const [sideOpen, setSideOpen] = useState(false);

  useEffect(() => {
    setKey(store.user?.apiKey || '');
    api.services().then((r) => {
      const raw = (((r.data || {}) as { categories?: { name: string; apis: SvcItem[] }[] }).categories || []);
      const list: SvcCat[] = raw.map((c) => ({ name: c.name, items: (c.apis || []).map((it) => ({ ...it, __cat: c.name })) }));
      setCats(list);
      const wantCat = qp.get('cat');
      const wantEp = qp.get('ep');
      const initial: Record<string, boolean> = {};
      if (wantCat && list.some((c) => c.name === wantCat)) {
        initial[wantCat] = true;
        if (wantEp) {
          const found = list.find((c) => c.name === wantCat)?.items.find((it) => normPath(epOf(it)) === wantEp || epOf(it) === wantEp);
          if (found) setSelKey(`${wantCat}:${epOf(found)}`);
        }
      } else if (list.length) {
        initial[list[0].name] = true;
      }
      setOpenCats(initial);
    }).catch(() => setErr('Failed to load API registry (server may be waking up — retry in 30s).'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const total = useMemo(() => cats.reduce((n, c) => n + c.items.length, 0), [cats]);
  const readyCount = useMemo(
    () => cats.reduce((n, c) => n + c.items.filter(isReady).length, 0), [cats]
  );

  const sel: SvcItem | null = useMemo(() => {
    if (!selKey) return null;
    const idx = selKey.indexOf(':');
    const cat = selKey.slice(0, idx);
    const ep = selKey.slice(idx + 1);
    return cats.find((c) => c.name === cat)?.items.find((it) => epOf(it) === ep) || null;
  }, [selKey, cats]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cats;
    return cats
      .map((c) => ({
        ...c,
        items: c.items.filter((it) =>
          prettyName(it).toLowerCase().includes(q) ||
          epOf(it).toLowerCase().includes(q) ||
          (it.desc || it.description || '').toLowerCase().includes(q)
        ),
      }))
      .filter((c) => c.items.length > 0);
  }, [cats, query]);

  const pick = (cat: string, it: SvcItem) => {
    setSelKey(`${cat}:${epOf(it)}`);
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
    setOut(''); setMs(null); setOkFlag(null); setOutCode('');
    setSideOpen(false);
  };

  const run = async () => {
    if (!sel) return;
    setBusy(true); setErr(''); setOut(''); setMs(null); setOkFlag(null); setOutCode('');
    const t0 = performance.now();
    try {
      const r = await callApiEndpoint(normPath(epOf(sel)), { ...vals, apikey: key });
      const dt = Math.round(performance.now() - t0);
      setMs(dt);
      setOut(JSON.stringify(r, null, 2).slice(0, 15000));
      const rec = (r || {}) as { status?: boolean | number; success?: boolean; statusCode?: number };
      const ok = rec.status === true || rec.success === true;
      setOkFlag(ok);
      setOutCode(String(rec.statusCode ?? rec.status ?? ''));
      setTimeout(() => outRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 80);
      if (rec.status === 403 || rec.statusCode === 403) toast('VIP endpoint — upgrade your plan to use it', 'error');
      else if (rec.status === 429 || rec.statusCode === 429) toast('Monthly quota exhausted — see Plans', 'error');
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

  const fullUrl = sel ? buildUrl(normPath(epOf(sel)), vals, key) : '';
  const samples = useMemo(() => {
    if (!fullUrl) return { curl: '', node: '', py: '' };
    return {
      curl: `curl -X GET "${fullUrl}"`,
      node: `const res = await fetch("${fullUrl}");\nconst data = await res.json();\nconsole.log(data);`,
      py: `import requests\n\nres = requests.get("${fullUrl}", timeout=60)\nprint(res.json())`,
    };
  }, [fullUrl]);

  const toggleCat = (name: string) => setOpenCats((o) => ({ ...o, [name]: !o[name] }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-white sm:text-3xl">
            <FlaskConical className="text-indigo-300" /> API Reference
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            <span className="font-semibold text-emerald-300">{readyCount}</span> live endpoints · {cats.length} categories · quota cost 1 call each
          </p>
        </div>
        <button className="btn-ghost !px-4 !py-2 text-sm lg:hidden" onClick={() => setSideOpen(!sideOpen)}>
          {sideOpen ? <X size={16} /> : <Menu size={16} />} Endpoints
        </button>
      </div>

      {/* key bar */}
      <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.02] p-3">
        <KeyRound size={16} className="ml-1 shrink-0 text-zinc-400" />
        <input
          className="input !w-auto min-w-0 flex-1 font-mono !text-xs" placeholder="Paste API key to try endpoints"
          value={key} onChange={(e) => setKey(e.target.value)}
        />
        {!store.user && <span className="px-1 text-xs text-zinc-500">No key? <a href="/register" className="text-indigo-300">Get one free</a></span>}
      </div>

      {err && !cats.length && (
        <p className="mt-4 flex items-center gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          <CircleAlert size={16} /> {err}
        </p>
      )}

      <div className="mt-5 flex flex-col gap-5 lg:flex-row">
        {/* ============ SIDEBAR ============ */}
        <aside className={`${sideOpen ? 'block' : 'hidden'} w-full shrink-0 lg:block lg:w-80`}>
          <div className="glass rounded-2xl p-3 lg:sticky lg:top-[76px] lg:max-h-[calc(100vh-100px)] lg:overflow-y-auto">
            <div className="relative mb-2">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                className="input !py-2.5 !pl-9 !text-xs" placeholder={`Search ${total} endpoints…`}
                value={query} onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            {filtered.map((c) => {
              const open = query.trim() ? true : !!openCats[c.name];
              const ready = c.items.filter(isReady).length;
              return (
                <div key={c.name} className="mb-1 overflow-hidden rounded-xl">
                  <button
                    onClick={() => toggleCat(c.name)}
                    className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-zinc-100 transition hover:bg-white/[0.04]"
                  >
                    <span className="flex items-center gap-2">
                      <ChevronDown size={15} className={`text-indigo-300 transition-transform ${open ? '' : '-rotate-90'}`} />
                      {c.name}
                    </span>
                    <span className="rounded-full bg-white/[0.06] px-2 py-0.5 font-mono text-[10px] text-zinc-400">{ready}</span>
                  </button>
                  {open && (
                    <div className="space-y-0.5 px-1 pb-2">
                      {c.items.map((it) => {
                        const active = !!sel && `${it.__cat}:${epOf(it)}` === selKey;
                        const readyIt = isReady(it);
                        return (
                          <button
                            key={`${it.__cat}:${epOf(it)}`}
                            onClick={() => pick(it.__cat || c.name, it)}
                            className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition ${
                              active ? 'bg-indigo-500/15 text-white' : 'text-zinc-300 hover:bg-white/[0.04]'
                            } ${readyIt ? '' : 'opacity-55'}`}
                          >
                            <span className={`shrink-0 rounded px-1.5 py-0.5 font-mono text-[9px] font-bold ${readyIt ? 'bg-emerald-500/15 text-emerald-300' : 'bg-zinc-500/15 text-zinc-500'}`}>
                              GET
                            </span>
                            <span className="min-w-0 flex-1 truncate text-[13px]">{prettyName(it)}</span>
                            {isVip(it) && <Crown size={12} className="shrink-0 text-amber-300" />}
                            {!readyIt && <span className="shrink-0 rounded bg-zinc-500/20 px-1.5 py-0.5 text-[9px] text-zinc-400">SOON</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
            {!filtered.length && <p className="px-2 py-4 text-sm text-zinc-500">No endpoints match.</p>}
          </div>
        </aside>

        {/* ============ MAIN ============ */}
        <main className="min-w-0 flex-1">
          {!sel ? (
            <div className="glass rounded-2xl p-12 text-center">
              <Zap size={28} className="mx-auto text-indigo-300" />
              <p className="mt-3 font-medium text-white">Select an endpoint</p>
              <p className="mt-1 text-sm text-zinc-400">Browse the sidebar, fill parameters, execute live and copy code samples.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* title card */}
              <div className="glass rounded-2xl p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-emerald-500/15 px-2 py-1 font-mono text-xs font-bold text-emerald-300">GET</span>
                  <code className="break-all font-mono text-sm text-zinc-100">{normPath(epOf(sel))}</code>
                  {isVip(sel) && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-2.5 py-0.5 text-[11px] font-semibold text-amber-300">
                      <Crown size={11} /> VIP
                    </span>
                  )}
                  {!isReady(sel) && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-zinc-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-300">
                      <Lock size={11} /> Coming soon
                    </span>
                  )}
                </div>
                <p className="mt-2 text-lg font-semibold text-white">{prettyName(sel)}</p>
                {(sel.desc || sel.description) && <p className="mt-1 text-sm leading-relaxed text-zinc-400">{sel.desc || sel.description}</p>}
              </div>

              {/* parameters */}
              <div className="glass rounded-2xl p-5">
                <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                  <ListOrdered size={15} className="text-indigo-300" /> Parameters
                </p>
                {paramEntries.length === 0 && <p className="text-sm text-zinc-500">No parameters — just execute.</p>}
                <div className="space-y-3">
                  {paramEntries.map(([k, v]) => (
                    <div key={k}>
                      <label className="mb-1.5 flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-mono text-[13px] text-zinc-100">{k}</span>
                        {v.required
                          ? <span className="rounded bg-rose-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-rose-300">required</span>
                          : <span className="rounded bg-zinc-500/15 px-1.5 py-0.5 text-[10px] text-zinc-400">optional</span>}
                        {v.type && <span className="font-mono text-[10px] text-zinc-500">{v.type}</span>}
                        {v.desc && <span className="text-zinc-500">· {v.desc}</span>}
                      </label>
                      <input
                        className="input font-mono !text-xs" value={vals[k] ?? ''}
                        onChange={(e) => setVals({ ...vals, [k]: e.target.value })}
                        placeholder={v.example || `Enter ${k}…`}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button className="btn-primary btn-shine !py-2.5 text-sm" disabled={busy || !key || !isReady(sel)} onClick={run}>
                    <Play size={15} /> {busy ? 'Running…' : 'Execute'}
                  </button>
                  <CopyButton text={fullUrl} label="Copy URL" />
                  {ms !== null && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.05] px-3 py-1.5 font-mono text-xs text-zinc-300">
                      <Clock3 size={13} className="text-indigo-300" /> {ms} ms
                    </span>
                  )}
                  {okFlag !== null && (
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${okFlag ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'}`}>
                      {okFlag ? <CircleCheck size={13} /> : <CircleX size={13} />} {outCode || (okFlag ? 'OK' : 'ERROR')}
                    </span>
                  )}
                </div>
                {!isReady(sel) && <p className="mt-2 text-xs text-zinc-500">This endpoint is not live yet — check back soon.</p>}
                {err && <p className="mt-2 text-sm text-rose-300">{err}</p>}
              </div>

              {/* response */}
              {out && (
                <div ref={outRef} className="scroll-mt-24">
                  <CodeBlock code={out} title="Live response" />
                </div>
              )}

              {/* code samples */}
              <div className="glass rounded-2xl p-5">
                <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                  <Terminal size={15} className="text-indigo-300" /> Code samples
                </p>
                <Tabs
                  tabs={[
                    { id: 'curl', label: 'cURL', icon: <Globe size={13} /> },
                    { id: 'node', label: 'Node.js', icon: <Braces size={13} /> },
                    { id: 'py', label: 'Python', icon: <Braces size={13} /> },
                  ]}
                  value={codeTab}
                  onChange={setCodeTab}
                />
                <div className="mt-3">
                  {codeTab === 'curl' && <CodeBlock code={samples.curl} title="Shell" maxHeight={200} />}
                  {codeTab === 'node' && <CodeBlock code={samples.node} title="JavaScript (fetch)" maxHeight={200} />}
                  {codeTab === 'py' && <CodeBlock code={samples.py} title="Python (requests)" maxHeight={200} />}
                </div>
              </div>

              {/* status codes */}
              <div className="glass rounded-2xl p-5">
                <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                  <CircleAlert size={15} className="text-indigo-300" /> HTTP status codes
                </p>
                <div className="overflow-hidden rounded-xl border border-white/10">
                  {STATUS_CODES.map((s, i) => (
                    <div key={s.code} className={`flex items-center gap-3 px-4 py-2.5 text-sm ${i % 2 ? 'bg-white/[0.015]' : ''}`}>
                      <span className={`flex w-14 shrink-0 items-center gap-1.5 font-mono text-xs font-bold ${
                        s.tone === 'ok' ? 'text-emerald-300' : s.tone === 'warn' ? 'text-amber-300' : 'text-rose-300'
                      }`}>
                        {s.tone === 'ok' ? <CircleCheck size={13} /> : s.tone === 'warn' ? <CircleAlert size={13} /> : <CircleX size={13} />}
                        {s.code}
                      </span>
                      <span className="text-zinc-400">{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
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
