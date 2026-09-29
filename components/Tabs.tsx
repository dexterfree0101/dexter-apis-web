'use client';
import type { ReactNode } from 'react';

export interface TabItem { id: string; label: string; icon?: ReactNode }

export default function Tabs({ tabs, value, onChange }: { tabs: TabItem[]; value: string; onChange: (id: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((t) => {
        const active = t.id === value;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
              active
                ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]'
                : 'border border-white/10 bg-white/[0.03] text-zinc-300 hover:border-indigo-400/40 hover:text-white'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
