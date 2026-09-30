'use client';
import { useEffect, useRef, useState } from 'react';
import createGlobe from 'cobe';

const MARKERS = [
  { location: [6.9271, 79.8612] as [number, number], size: 0.08 }, // Colombo
  { location: [35.6762, 139.6503] as [number, number], size: 0.05 }, // Tokyo
  { location: [51.5074, -0.1278] as [number, number], size: 0.05 }, // London
  { location: [40.7128, -74.006] as [number, number], size: 0.05 }, // NYC
  { location: [-33.8688, 151.2093] as [number, number], size: 0.05 }, // Sydney
  { location: [25.2048, 55.2708] as [number, number], size: 0.05 }, // Dubai
];

function webgl2ok() {
  try {
    const c = document.createElement('canvas');
    return !!c.getContext('webgl2');
  } catch {
    return false;
  }
}

function GlobeFallback() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
      <div className="absolute h-44 w-44 rounded-full bg-indigo-500/25 blur-3xl" />
      <div className="orbit-ring h-44 w-44"><span className="orbit-dot" /></div>
      <div className="orbit-ring orbit-ring-2 h-60 w-60"><span className="orbit-dot" /></div>
      <div className="orbit-ring orbit-ring-3 h-76 w-76"><span className="orbit-dot" /></div>
      <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400/30 to-violet-600/20 shadow-[0_0_50px_rgba(99,102,241,0.4)] ring-1 ring-indigo-300/30">
        <span className="bg-gradient-to-b from-white to-white/20 bg-clip-text text-2xl font-bold text-transparent">D</span>
      </div>
    </div>
  );
}

export default function Globe({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!webgl2ok()) {
      setFailed(true);
      return;
    }
    const canvas = ref.current;
    if (!canvas) return;
    let phi = 0;
    let raf = 0;
    let globe: { update: (s: Record<string, number>) => void; destroy: () => void } | null = null;
    try {
      const size = () => canvas.offsetWidth || 300;
      globe = createGlobe(canvas, {
        devicePixelRatio: 2,
        width: size() * 2,
        height: size() * 2,
        phi: 0,
        theta: 0.3,
        dark: 1,
        diffuse: 3,
        mapSamples: 16000,
        mapBrightness: 1.4,
        baseColor: [0.39, 0.4, 0.95],
        markerColor: [1, 1, 1],
        glowColor: [0.45, 0.4, 1],
        markers: MARKERS,
      });
      const tick = () => {
        phi += 0.004;
        const w = size() * 2;
        globe?.update({ phi, width: w, height: w });
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    } catch {
      setFailed(true);
    }
    return () => {
      cancelAnimationFrame(raf);
      try {
        globe?.destroy();
      } catch {
        /* noop */
      }
    };
  }, []);

  if (failed) return <GlobeFallback />;

  return (
    <canvas
      ref={ref}
      className={className}
      style={{ width: '100%', height: '100%', aspectRatio: '1', contain: 'layout paint size', background: 'transparent' }}
    />
  );
}
