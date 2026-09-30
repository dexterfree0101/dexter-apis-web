'use client';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search, ChevronDown, ChevronRight, Play, KeyRound, Crown, Link2,
  SlidersHorizontal, List, CheckCircle2, XCircle, AlertTriangle, Clock3,
  LayoutGrid, ArrowRight,
} from 'lucide-react';
import { api, callApiEndpoint, store, API_BASE } from '@/lib/api';
import CodeBlock from '@/components/CodeBlock';
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
interface CardRes { out: string; ms: number; ok: boolean; code: string }

const STATUS_CODES = [
  { code: '200', label: 'OK - Request successful', tone: 'ok' },
  { code: '400', label: 'Bad Request - Invalid parameters or missing required fields', tone: 'err' },
  { code: '401', label: 'Unauthorized - Missing or invalid API key', tone: 'err' },
  { code: '403', label: 'Forbidden - VIP endpoint or quota exhausted', tone: 'err' },
  { code: '404', label: 'Not Found - No data for the given input', tone: 'err' },
  { code: '429', label: 'Too Many Requests - Monthly quota exhausted', tone: 'warn' },
  { code: '500', label: 'Internal Server Error - Something broke on our side', tone: 'err' },
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
function defaultsOf(it: SvcItem): Record<string, string> {
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
  return pv;
}
function paramsOf(it: SvcItem): [string, ParamDef][] {
  if (!it.params) return [];
  if (Array.isArray(it.params)) {
    return it.params.filter((p) => p.name.toLowerCase() !== 'apikey')
      .map((p) => [p.name, { required: p.required, example: p.example, desc: p.desc }]);
  }
  return Object.entries(it.params).filter(([k]) => k.toLowerCase() !== 'apikey');
}
function buildUrl(path: string, vals: Record<string, string>, key: string) {
  const q = new URLSearchParams({ ...vals, apikey: key || 'YOUR_KEY' }).toString();
  return `${API_BASE}${path}?${q}`;
}

function DocsInner() {
  const qp = useSearchParams();
  const toast = useToast();
  const [cats, setCats] = useState<SvcCat[]>([]);
  const [cat, setCat] = useState('');
  const [key, setKey] = useState('');
  const [query, setQuery] = useState('');
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});
  const [valsMap, setValsMap] = useState<Record<string, Record<string, string>>>({});
  const [resMap, setResMap] = useState<Record<string, CardRes>>({});
  const [busyMap, setBusyMap] = useState<Record<string, boolean>>({});
  const [err, setErr] = useState('');

  useEffect(() => {
    setKey(store.user?.apiKey || '');
    api.services().then((r) => {
      const raw = (((r.data || {}) as { categories?: { name: string; apis: SvcItem[] }[] }).categories || []);
      const list: SvcCat[] = raw.map((c) => ({ name: c.name, items: (c.apis || []).map((it) => ({ ...it, __cat: c.name })) }));
      setCats(list);
      const wantCat = qp.get('cat');
      const wantEp = qp.get('ep');
      if (wantCat && list.some((c) => c.name === wantCat)) {
        setCat(wantCat);
        if (wantEp) {
          const found = list.find((c) => c.name === wantCat)?.items
            .find((it) => normPath(epOf(it)) === wantEp || epOf(it) === wantEp);
          if (found) setOpenMap({ [`${wantCat}:${epOf(found)}`]: true });
        }
      }
    }).catch(() => setErr('Failed to load API registry (server may be waking up — retry in 30s).'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeCat = useMemo(() => cats.find((c) => c.name === cat) || null, [cats, cat]);
  const filtered = useMemo(() => {
    if (!activeCat) return [];
    const q = query.trim().toLowerCase();
    if (!q) return activeCat.items;
    return activeCat.items.filter((it) =>
      prettyName(it).toLowerCase().includes(q) ||
      epOf(it).toLowerCase().includes(q) ||
      (it.desc || it.description || '').toLowerCase().includes(q)
    );
  }, [activeCat, query]);

  const valsFor = (ck: string, it: SvcItem) => valsMap[ck] ?? defaultsOf(it);
  const setVal = (ck: string, it: SvcItem, k: string, v: string) =>
    setValsMap((m) => ({ ...m, [ck]: { ...valsFor(ck, it), [k]: v } }));

  const run = async (ck: string, it: SvcItem) => {
    if (!isReady(it)) return;
    setBusyMap((m) => ({ ...m, [ck]: true }));
    setResMap((m) => {
      const n = { ...m };
      delete n[ck];
      return n;
    });
    const t0 = performance.now();
    try {
      const r = await callApiEndpoint(normPath(epOf(it)), { ...valsFor(ck, it), apikey: key });
      const dt = Math.round(performance.now() - t0);
      const rec = (r || {}) as { status?: boolean | number; success?: boolean; statusCode?: number };
      const ok = rec.status === true || rec.success === true;
      setResMap((m) => ({
        ...m,
        [ck]: { out: JSON.stringify(r, null, 2).slice(0, 15000), ms: dt, ok, code: String(rec.statusCode ?? rec.status ?? '') },
      }));
      if (rec.status === 403 || rec.statusCode === 403) toast('VIP endpoint — upgrade your plan to use it', 'error');
      else if (rec.status === 429 || rec.statusCode === 429) toast('Monthly quota exhausted — see Plans', 'error');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Request failed', 'error');
    } finally {
      setBusyMap((m) => ({ ...m, [ck]: false }));
    }
  };

  const copyUrl = async (ck: string, it: SvcItem) => {
    try {
      await navigator.clipboard.writeText(buildUrl(normPath(epOf(it)), valsFor(ck, it), key));
      toast('URL copied to clipboard', 'success');
    } catch {
      toast('Copy failed', 'error');
    }
  };

  const pickCat = (name: string) => {
    setCat(name);
    setQuery('');
  };

  const sideRow = (active: boolean) =>
    `flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
      active ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-white'
    }`;

  return (
    <div className="mx-auto flex max-w-7xl gap-8 px-4 py-8">
      {/* ============ SIDEBAR ============ */}
      <aside className="hidden w-60 shrink-0 lg:block">
        <div className="sticky top-[84px] space-y-5">
          <div>
            <p className="px-3 text-sm font-semibold text-white">Get Started</p>
            <div className="mt-1">
              <button onClick={() => pickCat('')} className={sideRow(cat === '')}>
                <LayoutGrid size={14} className="shrink-0" />
                <span className="flex-1 text-left">Category</span>
                <ChevronRight size={14} className="text-zinc-600" />
              </button>
            </div>
          </div>
          <div>
            <p className="px-3 text-sm font-semibold text-white">Available Endpoints</p>
            <div className="mt-1 space-y-0.5">
              {cats.map((c) => (
                <button key={c.name} onClick={() => pickCat(c.name)} className={sideRow(cat === c.name)}>
                  <span className="flex-1 text-left">{c.name}</span>
                  {VIP_CATS.includes(c.name) && <Crown size={12} className="shrink-0 text-amber-300" />}
                  <ChevronRight size={14} className="text-zinc-600" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* ============ MAIN ============ */}
      <main className="min-w-0 flex-1">
        {/* mobile category pills */}
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
          <button
            onClick={() => pickCat('')}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium ${cat === '' ? 'bg-white text-black' : 'border border-white/10 text-zinc-300'}`}
          >
            All
          </button>
          {cats.map((c) => (
            <button
              key={c.name} onClick={() => pickCat(c.name)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium ${cat === c.name ? 'bg-white text-black' : 'border border-white/10 text-zinc-300'}`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* key bar */}
        <div className="mb-3 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2">
          <KeyRound size={15} className="shrink-0 text-zinc-500" />
          <input
            className="w-full bg-transparent font-mono text-xs text-zinc-100 placeholder-zinc-600 outline-none"
            placeholder="Paste API key to try endpoints" value={key} onChange={(e) => setKey(e.target.value)}
          />
          {!store.user && <a href="/register" className="shrink-0 text-xs text-zinc-400 hover:text-white">Get one free</a>}
        </div>

        {err && !cats.length && (
          <p className="mb-3 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{err}</p>
        )}

        {/* overview */}
        {cat === '' && (
          <div className="space-y-3">
            {cats.map((c) => {
              const ready = c.items.filter(isReady).length;
              return (
                <button
                  key={c.name} onClick={() => pickCat(c.name)}
                  className="group flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-5 text-left transition hover:border-white/25 hover:bg-white/[0.04]"
                >
                  <span className="flex-1">
                    <span className="flex flex-wrap items-center gap-2 text-[15px] font-semibold text-white">
                      {c.name}
                      <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-medium text-zinc-300">{ready} endpoints</span>
                      {VIP_CATS.includes(c.name) && <Crown size={12} className="text-amber-300" />}
                    </span>
                    <span className="mt-1 block text-sm text-zinc-500">Explore {c.name} related endpoints and features.</span>
                  </span>
                  <ArrowRight size={18} className="shrink-0 text-zinc-600 transition group-hover:text-white" />
                </button>
              );
            })}
            {!cats.length && !err && <p className="py-10 text-center text-sm text-zinc-500">Loading registry…</p>}
          </div>
        )}

        {/* category view */}
        {cat !== '' && activeCat && (
          <>
            <div className="relative">
              <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
              <input
                className="input !rounded-xl !py-3 !pl-11 !text-sm" placeholder="Search endpoints…"
                value={query} onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="mt-3 space-y-2.5">
              {filtered.map((it) => {
                const ck = `${cat}:${epOf(it)}`;
                const open = !!openMap[ck];
                const ready = isReady(it);
                const res = resMap[ck];
                const busy = !!busyMap[ck];
                const vals = valsFor(ck, it);
                return (
                  <div key={ck} className={`overflow-hidden rounded-xl border border-white/10 bg-[#1f1f1f] ${ready ? '' : 'opacity-70'}`}>
                    <button
                      onClick={() => setOpenMap((m) => ({ ...m, [ck]: !m[ck] }))}
                      className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-white/[0.02]"
                    >
                      <span className="shrink-0 rounded-md bg-white/10 px-2 py-1 font-mono text-[10px] font-bold text-zinc-300">GET</span>
                      <span className="min-w-0 flex-1 truncate text-[15px] font-semibold text-white">{prettyName(it)}</span>
                      {isVip(it) && <Crown size={13} className="shrink-0 text-amber-300" />}
                      {!ready && <span className="shrink-0 rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-semibold text-zinc-400">SOON</span>}
                      <ChevronDown size={17} className={`shrink-0 text-zinc-400 transition-transform ${open ? 'rotate-180' : ''}`} />
                    </button>
                    <div className="border-t border-white/5 bg-black/30 px-4 py-2 font-mono text-xs text-zinc-500">
                      {normPath(epOf(it))}
                    </div>
                    {open && (
                      <div className="space-y-4 px-4 py-4">
                        <div>
                          <p className="flex items-center gap-1.5 text-[13px] font-bold tracking-wide text-white">
                            <Play size={12} /> TRY IT OUT
                          </p>
                          {(it.desc || it.description) && <p className="mt-1.5 text-sm text-zinc-400">{it.desc || it.description}</p>}
                        </div>
                        <div className="rounded-xl border border-white/10 p-4">
                          <p className="flex items-center gap-1.5 text-[13px] font-bold text-white">
                            <SlidersHorizontal size={13} /> PARAMETERS
                          </p>
                          <div className="mt-3 space-y-3">
                            {paramsOf(it).map(([k, v]) => (
                              <div key={k}>
                                <label className="mb-1.5 flex items-center gap-1 font-mono text-[13px] text-zinc-200">
                                  {k}
                                  {v.required && <span className="text-rose-400">*</span>}
                                  {v.desc && <span className="ml-1 font-sans text-xs text-zinc-500">· {v.desc}</span>}
                                </label>
                                <input
                                  className="input font-mono !text-xs" value={vals[k] ?? ''}
                                  onChange={(e) => setVal(ck, it, k, e.target.value)}
                                  placeholder={v.example || `Enter ${k}…`}
                                />
                              </div>
                            ))}
                            {!paramsOf(it).length && <p className="text-sm text-zinc-500">No parameters — just execute.</p>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => run(ck, it)} disabled={busy || !key || !ready}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] py-2.5 text-sm font-medium text-white transition hover:bg-white/[0.08] disabled:opacity-50"
                          >
                            <Play size={14} /> {busy ? 'Running…' : 'Execute'}
                          </button>
                          <button
                            onClick={() => copyUrl(ck, it)} title="Copy request URL"
                            className="flex w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
                          >
                            <Link2 size={15} />
                          </button>
                        </div>
                        {!ready && <p className="text-xs text-zinc-500">This endpoint is not live yet — check back soon.</p>}
                        {res && (
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.05] px-3 py-1.5 font-mono text-xs text-zinc-300">
                                <Clock3 size={13} /> {res.ms} ms
                              </span>
                              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${res.ok ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'}`}>
                                {res.ok ? <CheckCircle2 size={13} /> : <XCircle size={13} />} {res.code || (res.ok ? 'OK' : 'ERROR')}
                              </span>
                            </div>
                            <CodeBlock code={res.out} title="Response" />
                          </div>
                        )}
                        <div className="border-t border-white/10 pt-4">
                          <p className="flex items-center gap-1.5 text-[13px] font-bold text-white">
                            <List size={13} /> HTTP STATUS CODES
                          </p>
                          <div className="mt-2 overflow-hidden rounded-xl border border-white/10">
                            <div className="grid grid-cols-[92px_1fr] gap-3 border-b border-white/10 px-4 py-2.5 text-xs font-medium text-zinc-500">
                              <span>Code</span><span>Description</span>
                            </div>
                            {STATUS_CODES.map((s) => (
                              <div key={s.code} className="grid grid-cols-[92px_1fr] gap-3 border-b border-white/5 px-4 py-2.5 text-sm last:border-0">
                                <span className={`flex items-center gap-1.5 font-mono text-xs font-bold ${s.tone === 'ok' ? 'text-emerald-400' : s.tone === 'warn' ? 'text-amber-400' : 'text-rose-400'}`}>
                                  {s.tone === 'ok' ? <CheckCircle2 size={13} /> : s.tone === 'warn' ? <AlertTriangle size={13} /> : <XCircle size={13} />}
                                  {s.code}
                                </span>
                                <span className="text-zinc-400">{s.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {!filtered.length && <p className="py-10 text-center text-sm text-zinc-500">No endpoints match.</p>}
            </div>
          </>
        )}
      </main>
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
