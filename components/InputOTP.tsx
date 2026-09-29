'use client';
import { useEffect, useRef, useState } from 'react';

export default function InputOTP({ length = 6, onComplete, autoFocus = true }: {
  length?: number; onComplete?: (code: string) => void; autoFocus?: boolean;
}) {
  const [code, setCode] = useState('');
  const [focus, setFocus] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => { if (autoFocus) setTimeout(() => input.current?.focus(), 350); }, [autoFocus]);

  const set = (v: string) => {
    const clean = v.replace(/[^0-9]/g, '').slice(0, length);
    setCode(clean);
    if (clean.length === length) onComplete?.(clean);
  };

  return (
    <div className="flex flex-col items-center gap-3" onClick={() => input.current?.focus()}>
      <input
        ref={input}
        value={code}
        onChange={(e) => set(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        inputMode="numeric"
        autoComplete="one-time-code"
        className="absolute h-0 w-0 opacity-0"
        aria-label="One-time code"
      />
      <div className="flex gap-2.5">
        {Array.from({ length }).map((_, i) => {
          const active = focus && (i === code.length || (code.length === length && i === length - 1));
          return (
            <div
              key={i}
              className={`flex h-14 w-11 items-center justify-center rounded-xl border font-mono text-xl font-bold transition sm:h-14 sm:w-12 ${
                code[i]
                  ? 'border-indigo-400/70 bg-indigo-500/15 text-white shadow-[0_0_18px_rgba(99,102,241,0.25)]'
                  : active
                    ? 'border-indigo-400 bg-white/5 text-white'
                    : 'border-white/10 bg-white/[0.03] text-zinc-500'
              }`}
            >
              {code[i] || (active ? <span className="animate-pulse text-indigo-300">|</span> : '')}
            </div>
          );
        })}
      </div>
    </div>
  );
}
