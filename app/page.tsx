'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight, Activity, BadgeCheck, Bot, CloudDownload, Flame, Gauge, Gift,
  Newspaper, ShieldCheck, Users, Wrench, Clapperboard, Zap, ChevronDown,
} from 'lucide-react';
import CodeBlock from '@/components/CodeBlock';
import AvatarGroup from '@/components/AvatarGroup';
import Reveal from '@/components/Reveal';
import { API_BASE } from '@/lib/api';

const STATS = [
  { k: '131+', v: 'LIVE ENDPOINTS' },
  { k: '14', v: 'API CATEGORIES' },
  { k: '100', v: 'FREE CALLS / MO' },
  { k: '24/7', v: 'HUMAN SUPPORT' },
];

const FEATURES = [
  { icon: <Bot size={22} />, t: 'AI Endpoints', d: '17 AI writers, chat and helpers with clean JSON output.' },
  { icon: <Newspaper size={22} />, t: 'Sri Lankan News', d: 'Derana, Lankadeepa, Hiru, Gossip Lanka, Siyatha, cricket and more.' },
  { icon: <CloudDownload size={22} />, t: 'Downloaders', d: 'YouTube, TikTok, Facebook, MediaFire, Mega and direct APK downloads.' },
  { icon: <Clapperboard size={22} />, t: 'Movies & Subs', d: 'CineSubz search, latest releases and Sinhala subtitle links.' },
  { icon: <Flame size={22} />, t: 'Adult Search', d: 'VIP-gated video search and stream extraction for adult platforms.' },
  { icon: <Gauge size={22} />, t: 'Quota Dashboard', d: 'Real-time usage rings, plan status and per-call quota tracking.' },
  { icon: <ShieldCheck size={22} />, t: 'Manual Approval', d: 'Bank-transfer subscriptions reviewed by a human. No surprise charges.' },
  { icon: <Gift size={22} />, t: 'Referral Rewards', d: 'Earn bonus API calls per referral and FREE Plus at milestones.' },
  { icon: <Users size={22} />, t: 'Google Login', d: 'One-tap Gmail sign-in powered by Firebase. No email codes.' },
];

const PLANS = [
  { n: 'Free', p: 'Rs. 0', c: '100 calls / mo', f: ['Standard API access', 'Community support'], hot: false },
  { n: 'Plus', p: 'Rs. 500', c: '1,000 calls / mo', f: ['VIP API access', 'Priority support'], hot: true },
  { n: 'Pro', p: 'Rs. 1,000', c: '2,500 calls / mo', f: ['VIP + fast lane', 'Customer care 24/7'], hot: false },
  { n: 'Custom', p: "Let's talk", c: 'tailored limits', f: ['Custom APIs', 'Your dev name'], hot: false },
];

const FAQS = [
  { q: 'What is Dexter API?', a: 'A REST API platform with 131+ endpoints for AI text, downloaders, movies, Sri Lankan news, tools, fun and more. One key works everywhere and every response is clean JSON.' },
  { q: 'Is there a free tier?', a: 'Yes — 100 calls every month, free forever. No credit card required. Upgrade to Plus or Pro when you need VIP endpoints and higher limits.' },
  { q: 'How do API keys work?', a: 'Sign in with Google, copy your key from the dashboard and append ?apikey=YOUR_KEY to any endpoint. You can also paste it into the docs playground to try endpoints live.' },
  { q: 'Which programming languages are supported?', a: 'Any language that speaks HTTP. The docs include copy-paste samples for cURL, Node.js and Python for every endpoint.' },
  { q: 'What happens when my quota runs out?', a: 'Calls return HTTP 429 until the next monthly reset. Upgrade your plan or earn bonus calls through referrals to keep going.' },
];

export default function Home() {
  const [faq, setFaq] = useState<number | null>(null);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="hero-grid" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#181818]" />
        </div>
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:py-24 lg:grid-cols-[1fr_360px]">
          <div>
            <Reveal>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium text-zinc-300">
                v3.7 — 131 endpoints, apps, AI tools & new docs
              </div>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="max-w-xl text-4xl font-bold leading-tight tracking-tight text-white sm:text-6xl">
                One API Platform for Apps, Bots and Automation
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-5 max-w-lg text-base text-zinc-400 sm:text-lg">
                AI, downloaders, movies, LK news, tools and fun. One key, predictable JSON and a free tier that never expires.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/register" className="btn-primary px-7 py-3 text-base">
                  Get Started
                </Link>
                <a href="#stats" className="btn-ghost px-7 py-3 text-base">
                  <Activity size={18} /> Statistic
                </a>
              </div>
            </Reveal>
          </div>
          <Reveal delay={200}>
            <div className="glass mx-auto flex aspect-square w-full max-w-[360px] items-center justify-center rounded-3xl">
              <Zap size={150} strokeWidth={1.5} className="text-white" fill="currentColor" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* STATS */}
      <section id="stats" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-14">
        <Reveal>
          <h2 className="text-center text-2xl font-bold text-white sm:text-3xl">API Statistics</h2>
          <div className="mx-auto mt-3 h-0.5 w-16 bg-white" />
          <p className="mt-3 text-center text-zinc-400">A snapshot of what Dexter puts in your hands.</p>
        </Reveal>
        <div className="mx-auto mt-8 grid max-w-3xl gap-4 sm:grid-cols-2">
          {STATS.map((s, i) => (
            <Reveal key={s.v} delay={i * 80}>
              <div className="glass stat-glow rounded-2xl px-6 py-6">
                <p className="text-3xl font-bold text-white">{s.k}</p>
                <p className="mt-1 text-xs tracking-wider text-zinc-500">{s.v}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <div className="mt-6 text-center">
            <Link href="/docs" className="btn-ghost">Explore docs <ArrowRight size={16} /></Link>
          </div>
        </Reveal>
      </section>

      {/* CODE */}
      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          <Reveal>
            <div>
              <h2 className="text-2xl font-bold text-white sm:text-3xl">Live in 30 seconds</h2>
              <p className="mt-3 text-zinc-400">Sign in with Google, grab your key from the dashboard and call any endpoint. Every response includes your remaining quota.</p>
              <ul className="mt-5 space-y-2.5 text-sm text-zinc-300">
                {['No credit card for Free tier', 'VIP gating with clear 403 errors', 'Referral bonuses stack every month'].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <BadgeCheck size={16} className="text-white" /> {t}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <CodeBlock
              title="bash — try it now"
              code={`curl "${API_BASE}/api/movies/cinesubz-search?q=avatar&apikey=YOUR_KEY"\n\n# {\n#   "status": 200,\n#   "result": { "count": 13, "movies": [...] },\n#   "quota": { "used": 1, "limit": 100 }\n# }`}
            />
          </Reveal>
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <Reveal>
          <h2 className="text-center text-2xl font-bold text-white sm:text-3xl">Why Choose Dexter API?</h2>
          <p className="mt-2 text-center text-zinc-400">A single REST API with predictable JSON and quota headers.</p>
        </Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Reveal key={f.t} delay={(i % 3) * 90}>
              <div className="glass card-glow group h-full rounded-2xl p-6 hover:-translate-y-1">
                <div className="mb-4 inline-flex rounded-xl bg-white/5 p-3 text-zinc-200 transition group-hover:scale-110 group-hover:text-white">
                  {f.icon}
                </div>
                <p className="font-semibold text-white">{f.t}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-400">{f.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* PLANS */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <Reveal>
          <h2 className="text-center text-2xl font-bold text-white sm:text-3xl">Pricing Plans</h2>
          <p className="mt-2 text-center text-zinc-400">Choose a plan that fits your needs. No hidden fees.</p>
        </Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((p, i) => (
            <Reveal key={p.n} delay={i * 80}>
              <div className={`h-full rounded-2xl p-6 ${p.hot ? 'border border-white/40 bg-white/[0.06]' : 'glass'}`}>
                {p.hot && <span className="mb-2 inline-block rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-black">RECOMMENDED</span>}
                <p className="font-semibold text-white">{p.n}</p>
                <p className="mt-1 text-2xl font-bold text-white">{p.p}</p>
                <p className="text-sm text-zinc-300">{p.c}</p>
                <ul className="mt-4 space-y-1.5 text-sm text-zinc-300">
                  {p.f.map((f) => <li key={f} className="flex items-center gap-2"><BadgeCheck size={14} className="text-white" /> {f}</li>)}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <div className="mt-6 text-center">
            <Link href="/plans" className="btn-ghost">Compare plans <ArrowRight size={16} /></Link>
          </div>
        </Reveal>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-14">
        <Reveal>
          <h2 className="text-center text-2xl font-bold text-white sm:text-3xl">Frequently Asked Questions</h2>
          <p className="mt-2 text-center text-zinc-400">Find answers to common questions about our service.</p>
        </Reveal>
        <div className="mt-8 space-y-2.5">
          {FAQS.map((f, i) => {
            const open = faq === i;
            return (
              <Reveal key={f.q} delay={i * 60}>
                <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
                  <button
                    onClick={() => setFaq(open ? null : i)}
                    className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left font-medium text-white"
                  >
                    {f.q}
                    <ChevronDown size={17} className={`shrink-0 text-zinc-400 transition-transform ${open ? 'rotate-180' : ''}`} />
                  </button>
                  {open && <p className="px-5 pb-4 text-sm leading-relaxed text-zinc-400">{f.a}</p>}
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* REFERRAL */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <Reveal>
          <div className="glass flex flex-col items-center gap-5 rounded-3xl px-6 py-10 text-center">
            <AvatarGroup avatars={[{ name: 'Kasun' }, { name: 'Nimal' }, { name: 'Amal' }, { name: 'Sunil' }, { name: 'Kamal' }, { name: 'Ruwan' }]} max={5} size={44} />
            <div>
              <h2 className="flex items-center justify-center gap-2 text-2xl font-bold text-white"><Users size={24} className="text-white" /> Invite, earn, repeat</h2>
              <p className="mt-2 text-zinc-400">Every friend who joins gives you bonus calls. Hit the milestone and Plus is on us.</p>
            </div>
            <Link href="/register" className="btn-primary">Start referring <ArrowRight size={16} /></Link>
            <p className="flex items-center gap-2 text-xs text-zinc-500"><Wrench size={14} /> Movies · Adult · Tools · Fun · Stalker · Anime — 131 endpoints and counting</p>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
