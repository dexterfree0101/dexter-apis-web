'use client';
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

type Kind = 'success' | 'error' | 'info';
interface ToastItem { id: number; msg: string; kind: Kind }

const Ctx = createContext<(msg: string, kind?: Kind) => void>(() => {});
export const useToast = () => useContext(Ctx);

let nextId = 1;

const ICONS = {
  success: <CheckCircle2 size={17} className="shrink-0 text-emerald-400" />,
  error: <AlertTriangle size={17} className="shrink-0 text-rose-400" />,
  info: <Info size={17} className="shrink-0 text-indigo-300" />,
};

const BORDERS = {
  success: 'border-emerald-400/30',
  error: 'border-rose-400/30',
  info: 'border-indigo-400/30',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = useCallback((msg: string, kind: Kind = 'info') => {
    const id = nextId++;
    setItems((prev) => [...prev.slice(-3), { id, msg, kind }]);
    setTimeout(() => setItems((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  return (
    <Ctx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex w-[calc(100vw-2.5rem)] max-w-sm flex-col gap-2">
        {items.map((t) => (
          <div
            key={t.id}
            className={`toast-in pointer-events-auto flex items-start gap-2.5 rounded-2xl border ${BORDERS[t.kind]} bg-[#0d0d16]/95 px-4 py-3 text-sm text-zinc-100 shadow-2xl backdrop-blur-xl`}
          >
            <span className="mt-0.5">{ICONS[t.kind]}</span>
            <span className="flex-1 leading-snug">{t.msg}</span>
            <button
              onClick={() => setItems((prev) => prev.filter((x) => x.id !== t.id))}
              className="text-zinc-500 transition hover:text-white"
              aria-label="Dismiss"
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
