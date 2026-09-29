'use client';

export function ProgressBar({ value, max, className = '' }: { value: number; max: number; className?: string }) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  const hot = pct >= 90;
  return (
    <div className={`h-2.5 w-full overflow-hidden rounded-full bg-white/10 ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-700 ${hot ? 'bg-gradient-to-r from-rose-500 to-orange-400' : 'bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400'}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function QuotaRing({ used, limit, size = 148 }: { used: number; limit: number; size?: number }) {
  const pct = limit > 0 ? Math.min(1, Math.max(0, used / limit)) : 0;
  const r = 54;
  const c = 2 * Math.PI * r;
  const left = Math.max(0, limit - used);
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 128 128" className="-rotate-90">
        <defs>
          <linearGradient id="quotaGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="55%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        <circle cx="64" cy="64" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="11" />
        <circle
          cx="64" cy="64" r={r} fill="none" stroke="url(#quotaGrad)" strokeWidth="11" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)} className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white">{left}</span>
        <span className="text-[11px] uppercase tracking-widest text-zinc-400">calls left</span>
      </div>
    </div>
  );
}
