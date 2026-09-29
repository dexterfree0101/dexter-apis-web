'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BookOpen, LayoutDashboard, LogIn, LogOut, Menu, Sparkles, Tags, X } from 'lucide-react';
import { store } from '@/lib/api';

export function Logo3D({ size = 40 }: { size?: number }) {
  return (
    <span className="logo3d" style={{ width: size, height: size }}>
      <svg viewBox="0 0 48 48" width={size} height={size} className="logo3d-ring" aria-hidden>
        <defs>
          <linearGradient id="logoRing" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="50%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        <ellipse cx="24" cy="24" rx="21" ry="21" fill="none" stroke="url(#logoRing)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="100 32" />
        <circle cx="24" cy="3" r="2.6" fill="#22d3ee" />
      </svg>
      <span className="logo3d-core">
        <svg viewBox="0 0 24 24" width={size * 0.48} height={size * 0.48} fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
        </svg>
      </span>
    </span>
  );
}

export function Brand({ size = 40 }: { size?: number }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5">
      <Logo3D size={size} />
      <span className="text-lg font-bold tracking-tight text-white">
        DEXTER{' '}
        <span className="animate-gradient bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-300 bg-clip-text text-transparent">
          APIS
        </span>
      </span>
    </Link>
  );
}

export default function Navbar() {
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => { setUser(store.user); }, []);

  const logout = () => {
    store.clear();
    setUser(null);
    setOpen(false);
    window.location.href = '/';
  };

  const links = (
    <>
      <Link
        href="/docs"
        onClick={() => setOpen(false)}
        className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white"
      >
        <BookOpen size={16} /> Docs
      </Link>
      <Link
        href="/plans"
        onClick={() => setOpen(false)}
        className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white"
      >
        <Tags size={16} /> Plans
      </Link>
      {user ? (
        <>
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2.5 text-sm font-medium text-white shadow-[0_0_18px_rgba(99,102,241,0.35)] transition hover:opacity-90"
          >
            <LayoutDashboard size={16} /> Dashboard
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-zinc-400 transition hover:border-rose-400/40 hover:text-rose-300"
          >
            <LogOut size={16} /> Logout
          </button>
        </>
      ) : (
        <>
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-white"
          >
            <LogIn size={16} /> Login
          </Link>
          <Link
            href="/register"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2.5 text-sm font-medium text-white shadow-[0_0_18px_rgba(99,102,241,0.35)] transition hover:opacity-90"
          >
            <Sparkles size={16} /> Get API Key
          </Link>
        </>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#07070d]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Brand />
        <nav className="hidden items-center gap-1 md:flex">{links}</nav>
        <button
          className="rounded-xl border border-white/10 p-2.5 text-zinc-200 transition hover:border-indigo-400/40 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {open && (
        <nav className="mobile-menu flex flex-col gap-1 border-t border-white/10 bg-[#0a0a12]/95 px-4 py-3 backdrop-blur-xl md:hidden">
          {links}
        </nav>
      )}
    </header>
  );
}
