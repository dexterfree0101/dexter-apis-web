'use client';
import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

export default function CopyButton({ text, label = 'Copy', className = '' }: { text: string; label?: string; className?: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setOk(true);
          setTimeout(() => setOk(false), 1800);
        } catch { /* clipboard unavailable */ }
      }}
      className={`inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-200 transition hover:border-indigo-400/40 hover:bg-indigo-500/10 ${className}`}
    >
      {ok ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} className="text-zinc-400" />}
      {ok ? 'Copied' : label}
    </button>
  );
}
