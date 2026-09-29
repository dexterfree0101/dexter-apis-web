'use client';
import { useEffect, useRef } from 'react';

interface Particle { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: string; size: number }
interface Rocket { x: number; y: number; vy: number; targetY: number; color: string }

const COLORS = ['#6366f1', '#8b5cf6', '#22d3ee', '#f472b6', '#fbbf24', '#34d399'];

export default function Fireworks({ density = 1 }: { density?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0, h = 0, raf = 0;
    const rockets: Rocket[] = [];
    const parts: Particle[] = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const launch = (x?: number) => {
      rockets.push({
        x: x ?? Math.random() * w,
        y: h + 8,
        vy: -(h / 90 + Math.random() * 2),
        targetY: h * (0.15 + Math.random() * 0.4),
        color: COLORS[(Math.random() * COLORS.length) | 0],
      });
    };

    const explode = (r: Rocket) => {
      const n = 60 + ((Math.random() * 40) | 0);
      for (let i = 0; i < n; i++) {
        const a = (Math.PI * 2 * i) / n + Math.random() * 0.2;
        const sp = 1.2 + Math.random() * 3.2;
        parts.push({
          x: r.x, y: r.y,
          vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
          life: 0, maxLife: 55 + Math.random() * 35,
          color: Math.random() < 0.25 ? '#ffffff' : r.color,
          size: 1 + Math.random() * 1.8,
        });
      }
    };

    let tick = 0;
    const frame = () => {
      tick++;
      ctx.clearRect(0, 0, w, h);
      if (tick % Math.max(18, Math.round(55 / density)) === 0 && rockets.length < 6) launch();
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.y += r.vy;
        ctx.fillStyle = r.color;
        ctx.globalAlpha = 0.9;
        ctx.fillRect(r.x, r.y, 2, 7);
        ctx.globalAlpha = 1;
        if (r.y <= r.targetY) { explode(r); rockets.splice(i, 1); }
      }
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.life++;
        p.vy += 0.035;
        p.vx *= 0.985; p.vy *= 0.985;
        p.x += p.vx; p.y += p.vy;
        const t = 1 - p.life / p.maxLife;
        if (t <= 0) { parts.splice(i, 1); continue; }
        ctx.globalAlpha = Math.max(0, t);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * t + 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      launch(e.clientX - rect.left);
    };
    canvas.addEventListener('click', onClick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('click', onClick);
    };
  }, [density]);

  return <canvas ref={ref} className="pointer-events-auto absolute inset-0 h-full w-full" aria-hidden />;
}
