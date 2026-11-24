import { useCountdown } from '../hooks/useCountdown';
import { useLeafActive } from './leafContext';

function Unit({ value, label }: { value: number; label: string }) {
  const text = String(value).padStart(2, '0');
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center">
      <div className="relative flex h-[clamp(36px,11cqw,52px)] w-full max-w-[64px] items-center justify-center overflow-hidden rounded-[3px] border border-gold/40 bg-ivory/70">
        <span className="absolute inset-x-0 top-1/2 h-px bg-gold/15" aria-hidden="true" />
        {/* digit change is a CSS fade (compositor-only, no per-frame JavaScript) */}
        <span key={text} className="digit-in font-serif text-title font-medium tabular-nums lining-nums text-olive">
          {text}
        </span>
      </div>
      <span className="mt-1.5 font-caps text-caps uppercase text-olive/70">{label}</span>
    </div>
  );
}

export function Countdown({ iso }: { iso: string }) {
  const t = useCountdown(iso, useLeafActive());
  if (t.done) {
    return <p className="font-serif text-lead italic text-olive">The celebration has begun ✦</p>;
  }
  return (
    <div className="flex w-full max-w-[300px] gap-[2.5cqw]" role="timer" aria-label={`${t.days} days, ${t.hours} hours, ${t.minutes} minutes to go`}>
      <Unit value={t.days} label="Days" />
      <Unit value={t.hours} label="Hrs" />
      <Unit value={t.minutes} label="Min" />
      <Unit value={t.seconds} label="Sec" />
    </div>
  );
}
