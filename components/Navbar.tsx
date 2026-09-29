'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BookOpen, LayoutDashboard, LogIn, LogOut, Sparkles, Tags } from 'lucide-react';
import { store } from '@/lib/api';

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-[0_0_24px_rgba(99,102,241,0.5)]">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 2 3 14h7l-1 8 10-12h-7l1-8z" />
        </svg>
      </span>
      <span className="text-lg font-bold tracking-tight text-white">
        DEXTER <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">APIS</span>
      </span>
    </Link>
  );
}

export default function Navbar() {
  const [user, setUser] = useState<{ username: string } | null>(null);

  useEffect(() => { setUser(store.user); }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#07070d]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
        <Logo />
        <nav className="flex items-center gap-1 text-sm sm:gap-2">
          <Link href="/docs" className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-zinc-300 transition hover:bg-white/5 hover:text-white sm:inline-flex">
            <BookOpen size={16} /> Docs
          </Link>
          <Link href="/plans" className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-zinc-300 transition hover:bg-white/5 hover:text-white sm:inline-flex">
            <Tags size={16} /> Plans
          </Link>
          {user ? (
            <>
              <Link href="/dashboard" className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2 font-medium text-white shadow-[0_0_18px_rgba(99,102,241,0.35)] transition hover:opacity-90">
                <LayoutDashboard size={16} /> Dashboard
              </Link>
              <button
                onClick={() => { store.clear(); setUser(null); window.location.href = '/'; }}
                title="Log out"
                className="inline-flex items-center rounded-lg border border-white/10 px-2.5 py-2 text-zinc-400 transition hover:border-rose-400/40 hover:text-rose-300"
              >
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-zinc-300 transition hover:bg-white/5 hover:text-white">
                <LogIn size={16} /> Login
              </Link>
              <Link href="/register" className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2 font-medium text-white shadow-[0_0_18px_rgba(99,102,241,0.35)] transition hover:opacity-90">
                <Sparkles size={16} /> Get API Key
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
