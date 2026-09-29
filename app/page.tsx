import Link from 'next/link';
import {
  ArrowRight, BadgeCheck, Bot, CloudDownload, Gauge, Gift,
  Newspaper, ShieldCheck, Sparkles, Users, Wrench, Zap,
} from 'lucide-react';
import Fireworks from '@/components/Fireworks';
import CodeBlock from '@/components/CodeBlock';
import AvatarGroup from '@/components/AvatarGroup';
import { API_BASE } from '@/lib/api';

const STATS = [
  { k: '36+', v: 'Live endpoints' },
  { k: '100', v: 'Free calls / month' },
  { k: '11', v: 'News sources' },
  { k: '24/7', v: 'Pro support' },
];

const FEATURES = [
  { icon: <Bot size={22} />, t: 'AI Endpoints', d: 'Claude, Gemini and MathGPT with generous timeouts and clean JSON output.' },
  { icon: <Newspaper size={22} />, t: 'Sri Lankan News', d: 'Derana, Lankadeepa, ITN, Gossip Lanka, Siyatha, cricket and more.' },
  { icon: <CloudDownload size={22} />, t: 'Downloaders', d: 'TikTok, Facebook, MediaFire and Mega download APIs for your apps.' },
  { icon: <Gauge size={22} />, t: 'Quota Dashboard', d: 'Real-time usage rings, plan status and per-call quota tracking.' },
  { icon: <ShieldCheck size={22} />, t: 'Manual Approval', d: 'Bank-transfer subscriptions reviewed by a human. No surprise charges.' },
  { icon: <Gift size={22} />, t: 'Referral Rewards', d: 'Earn bonus API calls per referral and FREE Plus at milestones.' },
];

const PLANS = [
  { n: 'Free', p: 'Rs. 0', c: '100 calls / mo', f: ['Standard API access', 'Community support'], hot: false },
  { n: 'Plus', p: 'Rs. 500', c: '1,000 calls / mo', f: ['VIP API access', 'Priority support'], hot: true },
  { n: 'Pro', p: 'Rs. 1,000', c: '2,500 calls / mo', f: ['VIP + fast lane', 'Customer care 24/7'], hot: false },
  { n: 'Custom', p: "Let's talk", c: 'tailored limits', f: ['Custom APIs', 'Your dev name'], hot: false },
];

export default function Home() {
  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Fireworks density={0.8} />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#07070d]" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-20 text-center sm:pt-28">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-medium text-indigo-200">
            <Sparkles size={14} /> v3 — subscriptions are live
          </div>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-6xl">
            APIs that{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-300 bg-clip-text text-transparent">
              just work
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-zinc-400 sm:text-lg">
            One key for AI, downloaders, LK news, tools and fun. Start free with 100 calls every month — upgrade when you grow.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/register" className="btn-primary px-7 py-3 text-base">
              Get a free API key <ArrowRight size={18} />
            </Link>
            <Link href="/docs" className="btn-ghost px-7 py-3 text-base">Explore docs</Link>
          </div>
          <div className="mx-auto mt-12 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.v} className="glass rounded-2xl px-4 py-4">
                <p className="text-2xl font-bold text-white">{s.k}</p>
                <p className="text-xs text-zinc-400">{s.v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-center text-2xl font-bold text-white sm:text-3xl">Everything you need to ship</h2>
        <p className="mt-2 text-center text-zinc-400">A single REST API with predictable JSON and quota headers.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.t} className="glass group rounded-2xl p-6 transition hover:border-indigo-400/40">
              <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-indigo-500/25 to-violet-500/25 p-3 text-indigo-300 transition group-hover:text-indigo-200">
                {f.icon}
              </div>
              <p className="font-semibold text-white">{f.t}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CODE */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">Live in 30 seconds</h2>
            <p className="mt-3 text-zinc-400">Grab your key from the dashboard and call any endpoint. Every response includes your remaining quota.</p>
            <ul className="mt-5 space-y-2.5 text-sm text-zinc-300">
              {['No credit card for Free tier', 'VIP gating with clear 403 errors', 'Referral bonuses stack every month'].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <BadgeCheck size={16} className="text-emerald-400" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <CodeBlock
            title="bash — try it now"
            code={`curl "${API_BASE}/api/news/gossiplanka?apikey=YOUR_KEY"\n\n# {\n#   "status": 200,\n#   "result": { "count": 20, "articles": [...] },\n#   "quota": { "used": 1, "limit": 100 }\n# }`}
          />
        </div>
      </section>

      {/* PLANS */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-center text-2xl font-bold text-white sm:text-3xl">Simple pricing</h2>
        <p className="mt-2 text-center text-zinc-400">Manual bank transfer. Human approval. Zero dark patterns.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((p) => (
            <div key={p.n} className={`rounded-2xl p-6 ${p.hot ? 'border border-indigo-400/50 bg-indigo-500/10 shadow-[0_0_36px_rgba(99,102,241,0.25)]' : 'glass'}`}>
              {p.hot && <span className="mb-2 inline-block rounded-full bg-indigo-500 px-2.5 py-0.5 text-[11px] font-semibold text-white">POPULAR</span>}
              <p className="font-semibold text-white">{p.n}</p>
              <p className="mt-1 text-2xl font-bold text-white">{p.p}</p>
              <p className="text-sm text-indigo-300">{p.c}</p>
              <ul className="mt-4 space-y-1.5 text-sm text-zinc-300">
                {p.f.map((f) => <li key={f} className="flex items-center gap-2"><Zap size={14} className="text-indigo-400" /> {f}</li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link href="/plans" className="btn-ghost">Compare plans <ArrowRight size={16} /></Link>
        </div>
      </section>

      {/* REFERRAL */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="glass flex flex-col items-center gap-5 rounded-3xl px-6 py-10 text-center">
          <AvatarGroup avatars={[{ name: 'Kasun' }, { name: 'Nimal' }, { name: 'Amal' }, { name: 'Sunil' }, { name: 'Kamal' }, { name: 'Ruwan' }]} max={5} size={44} />
          <div>
            <h2 className="flex items-center justify-center gap-2 text-2xl font-bold text-white"><Users size={24} className="text-indigo-300" /> Invite, earn, repeat</h2>
            <p className="mt-2 text-zinc-400">Every friend who joins gives you bonus calls. Hit the milestone and Plus is on us.</p>
          </div>
          <Link href="/register" className="btn-primary">Start referring <ArrowRight size={16} /></Link>
          <p className="flex items-center gap-2 text-xs text-zinc-500"><Wrench size={14} /> Tools · Fun · Stalker · Anime — 36 endpoints and counting</p>
        </div>
      </section>
    </div>
  );
}
