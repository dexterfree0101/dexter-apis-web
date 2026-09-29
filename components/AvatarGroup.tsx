'use client';

export interface AvatarItem { name: string; src?: string }

const PALETTE = ['#6366f1', '#8b5cf6', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export default function AvatarGroup({ avatars, max = 5, size = 36 }: { avatars: AvatarItem[]; max?: number; size?: number }) {
  const shown = avatars.slice(0, max);
  const extra = avatars.length - shown.length;
  return (
    <div className="flex items-center">
      {shown.map((a, i) => {
        const bg = PALETTE[(a.name.charCodeAt(0) + i) % PALETTE.length];
        return (
          <div
            key={i}
            title={a.name}
            className="flex items-center justify-center overflow-hidden rounded-full border-2 border-[#0a0a12] font-semibold text-white"
            style={{ width: size, height: size, marginLeft: i === 0 ? 0 : -size * 0.32, background: bg, fontSize: size * 0.38, zIndex: shown.length - i }}
          >
            {a.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={a.src} alt={a.name} className="h-full w-full object-cover" />
            ) : (
              a.name.slice(0, 2).toUpperCase()
            )}
          </div>
        );
      })}
      {extra > 0 && (
        <div
          className="flex items-center justify-center rounded-full border-2 border-[#0a0a12] bg-zinc-700 font-semibold text-white"
          style={{ width: size, height: size, marginLeft: -size * 0.32, fontSize: size * 0.32 }}
        >
          +{extra}
        </div>
      )}
    </div>
  );
}
