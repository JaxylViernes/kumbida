import { motion } from 'framer-motion';
import { useMemo } from 'react';
import type { CSSProperties } from 'react';

// deterministic pseudo-random so layout is stable between renders
const rand = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

const PETAL_FILLS = ['#E7C9C2', '#D8B9B2', '#EFE3D0', '#E2CFC0', '#C9CDB8'];

function PetalShape({ fill, size }: { fill: string; size: number }) {
  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 20 23" aria-hidden="true">
      <path d="M10 0.5 C17 5 18.5 15 10 22.5 C1.5 15 3 5 10 0.5Z" fill={fill} />
      <path d="M10 2 C11 8 11 14 10 21" stroke="#fff" strokeOpacity=".45" strokeWidth=".6" fill="none" />
    </svg>
  );
}

/** A few petals drifting across the whole scene. Pure CSS animation → cheap. */
export function DriftingPetals({ count = 9 }: { count?: number }) {
  const petals = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: rand(i + 1) * 100,
        size: 9 + rand(i + 7) * 9,
        dur: 13 + rand(i + 3) * 10,
        delay: -rand(i + 11) * 20,
        drift: (rand(i + 5) - 0.3) * 160,
        spin: 180 + rand(i + 2) * 300,
        fill: PETAL_FILLS[i % PETAL_FILLS.length],
      })),
    [count],
  );
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      {petals.map((p, i) => (
        <div
          key={i}
          className="petal"
          style={
            {
              left: `${p.left}%`,
              animationDuration: `${p.dur}s`,
              animationDelay: `${p.delay}s`,
              '--drift': `${p.drift}px`,
              '--spin': `${p.spin}deg`,
              opacity: 0,
            } as CSSProperties
          }
        >
          <PetalShape fill={p.fill} size={p.size} />
        </div>
      ))}
    </div>
  );
}

/** Tiny gold motes that twinkle and rise. */
export function GoldDust({ count = 16 }: { count?: number }) {
  const motes = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: rand(i + 21) * 100,
        top: 8 + rand(i + 31) * 84,
        size: 2 + rand(i + 41) * 3.5,
        dur: 4 + rand(i + 51) * 5,
        delay: -rand(i + 61) * 8,
      })),
    [count],
  );
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      {motes.map((m, i) => (
        <span
          key={i}
          className="dust"
          style={{
            left: `${m.left}%`,
            top: `${m.top}%`,
            width: m.size,
            height: m.size,
            animationDuration: `${m.dur}s`,
            animationDelay: `${m.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

/** A one-time flourish of petals bursting upward then falling (CSS only — smooth on phones). */
export function PetalBurst({ count = 18, className = '' }: { count?: number; className?: string }) {
  const petals = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const a = (-90 + (rand(i + 70) - 0.5) * 150) * (Math.PI / 180);
        const dist = 90 + rand(i + 80) * 140;
        const x = Math.cos(a) * dist;
        const y = Math.sin(a) * dist;
        const rot = (rand(i + 100) - 0.5) * 720;
        return {
          style: {
            '--x': `${x.toFixed(1)}px`,
            '--y': `${y.toFixed(1)}px`,
            '--x2': `${(x * 1.25).toFixed(1)}px`,
            '--y2': `${(y + 160 + rand(i + 90) * 220).toFixed(1)}px`,
            '--r1': `${(rot * 0.5).toFixed(0)}deg`,
            '--r2': `${rot.toFixed(0)}deg`,
            animationDelay: `${(rand(i + 120) * 0.35).toFixed(2)}s`,
          } as CSSProperties,
          size: 9 + rand(i + 110) * 10,
          fill: PETAL_FILLS[i % PETAL_FILLS.length],
        };
      }),
    [count],
  );
  return (
    <div className={`pointer-events-none absolute left-1/2 top-1/2 ${className}`} aria-hidden="true">
      {petals.map((p, i) => (
        <div key={i} className="burst-petal" style={p.style}>
          <PetalShape fill={p.fill} size={p.size} />
        </div>
      ))}
    </div>
  );
}

/** One or two butterflies drifting lazily across the scene (CSS only). */
export function Butterflies() {
  const flights = [
    { top: '22%', dur: 26, delay: -4, scale: 1, hue: '#D8B9B2' },
    { top: '64%', dur: 34, delay: -19, scale: 0.75, hue: '#C9CDB8' },
  ];
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      {flights.map((f, i) => (
        <div
          key={i}
          className="butterfly-path absolute left-0"
          style={{ top: f.top, animationDuration: `${f.dur}s`, animationDelay: `${f.delay}s` }}
        >
          <svg width={26 * f.scale} height={22 * f.scale} viewBox="0 0 26 22" className="butterfly-bob">
            <g className="wing-l" style={{ transformOrigin: '13px 11px' }}>
              <path d="M13 11 C9 2 1 1 2 7 C3 11 8 12 13 11Z" fill={f.hue} opacity=".9" />
              <path d="M13 11 C9 13 4 18 7 20 C10 21 12 16 13 11Z" fill={f.hue} opacity=".75" />
            </g>
            <g className="wing-r" style={{ transformOrigin: '13px 11px' }}>
              <path d="M13 11 C17 2 25 1 24 7 C23 11 18 12 13 11Z" fill={f.hue} opacity=".9" />
              <path d="M13 11 C17 13 22 18 19 20 C16 21 14 16 13 11Z" fill={f.hue} opacity=".75" />
            </g>
            <path d="M13 6 V16" stroke="#5a6048" strokeWidth="1.1" strokeLinecap="round" />
            <path d="M13 6 C12 3 10.5 2 10 1.5 M13 6 C14 3 15.5 2 16 1.5" stroke="#5a6048" strokeWidth=".5" fill="none" />
          </svg>
        </div>
      ))}
    </div>
  );
}

/** Tiny hearts that float up from a point — the "send love" reaction. */
export function HeartFloat({ bursts }: { bursts: number[] }) {
  return (
    <div className="pointer-events-none absolute left-1/2 top-0" aria-hidden="true">
      {bursts.map((id) =>
        [0, 1, 2].map((k) => {
          const dx = (rand(id + k * 13) - 0.5) * 90;
          return (
            <motion.svg
              key={`${id}-${k}`}
              viewBox="0 0 20 18"
              width={12 + k * 4}
              className="absolute -translate-x-1/2"
              initial={{ y: 0, x: 0, opacity: 0, scale: 0.4 }}
              animate={{ y: -110 - k * 30, x: dx, opacity: [0, 1, 0], scale: 1, rotate: dx / 4 }}
              transition={{ duration: 1.6 + k * 0.2, delay: k * 0.08, ease: 'easeOut' }}
            >
              <path d="M10 17 C3 12 0 8 2 4 C4 0.5 8.5 1 10 4.5 C11.5 1 16 0.5 18 4 C20 8 17 12 10 17Z" fill={k === 1 ? '#c6a46c' : '#D8B9B2'} />
            </motion.svg>
          );
        }),
      )}
    </div>
  );
}
