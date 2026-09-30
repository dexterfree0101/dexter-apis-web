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
            <stop offset="0%" stopColor="#e4e4e7" />
            <stop offset="50%" stopColor="#a1a1aa" />
            <stop offset="100%" stopColor="#71717a" />
          </linearGradient>
        </defs>
        <ellipse cx="24" cy="24" rx="21" ry="21" fill="none" stroke="url(#logoRing)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="100 32" />
        <circle cx="24" cy="3" r="2.6" fill="#fafafa" />
      </svg>
      <span className="logo3d-core logo3d-img">
        <img src="/logo.png" alt="DEXTER APIS logo" width={size} height={size} className="h-full w-full object-cover" />
      </span>
    </span>
  );
}

export function Brand({ size = 40 }: { size?: number }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5">
      <Logo3D size={size} />
      <span className="text-lg font-bold tracking-tight text-white">
        DEXTER APIS
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
            className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-200"
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
            className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-200"
          >
            <Sparkles size={16} /> Get API Key
          </Link>
        </>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#181818]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Brand />
        <nav className="hidden items-center gap-1 md:flex">{links}</nav>
        <button
          className="rounded-xl border border-white/10 p-2.5 text-zinc-200 transition hover:border-white/30 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {open && (
        <nav className="mobile-menu flex flex-col gap-1 border-t border-white/10 bg-[#141414]/95 px-4 py-3 backdrop-blur-xl md:hidden">
          {links}
        </nav>
      )}
    </header>
  );
}
