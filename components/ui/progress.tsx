'use client';
import { createContext, useContext, type ReactNode } from 'react';

const ProgressCtx = createContext(0);

export function Progress({
  value = 0,
  className = '',
  children,
}: {
  value?: number;
  className?: string;
  children?: ReactNode;
}) {
  const v = Math.min(100, Math.max(0, value));
  return (
    <div className={className}>
      <ProgressCtx.Provider value={v}>{children}</ProgressCtx.Provider>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-300 transition-[width] duration-200 ease-out"
          style={{ width: `${v}%` }}
        />
      </div>
    </div>
  );
}

export function ProgressLabel({ children }: { children: ReactNode }) {
  return <div className="mb-1.5 text-xs font-medium text-zinc-400">{children}</div>;
}

export function ProgressValue({ className = '' }: { className?: string }) {
  const v = useContext(ProgressCtx);
  return <span className={`font-mono text-xs text-indigo-200 ${className}`}>{Math.round(v)}%</span>;
}
