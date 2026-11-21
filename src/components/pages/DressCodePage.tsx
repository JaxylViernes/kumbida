import { motion } from 'framer-motion';
import { invitation, type Swatch } from '../../config/invitation';
import { Gown, Suit } from '../botanicals/Illustrations';
import { Caps, PageShell, Reveal } from '../PageShell';
import { ScriptDraw } from '../ScriptDraw';

const BLOT = ['52% 48% 55% 45% / 47% 53% 47% 53%', '46% 54% 48% 52% / 55% 45% 55% 45%', '55% 45% 50% 50% / 50% 50% 46% 54%'];

function SwatchDot({ s, i, delay, avoid = false }: { s: Swatch; i: number; delay: number; avoid?: boolean }) {
  return (
    <motion.li
      className="flex w-[17%] max-w-[64px] flex-col items-center"
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: delay + i * 0.12, type: 'spring', stiffness: 160, damping: 14 }}
    >
      <span
        className="relative block aspect-square w-full"
        style={{
          borderRadius: BLOT[i % BLOT.length],
          background: `radial-gradient(circle at 32% 28%, rgba(255,255,255,.55), rgba(255,255,255,0) 46%), radial-gradient(circle at 70% 75%, rgba(0,0,0,.08), rgba(0,0,0,0) 50%), ${s.hex}`,
          boxShadow: 'inset 0 0 0 1px rgba(80,70,50,.15), 0 2px 4px -2px rgba(60,50,30,.35)',
          opacity: avoid ? 0.75 : 1,
        }}
        aria-hidden="true"
      >
        {avoid && (
          <svg viewBox="0 0 40 40" className="absolute inset-0 h-full w-full">
            <line x1="8" y1="32" x2="32" y2="8" stroke="#8a5a52" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        )}
      </span>
      <span className="mt-1 text-center font-caps text-[clamp(8.5px,2.2cqw,11px)] uppercase leading-tight tracking-[0.12em] text-olive/75">
        {s.name}
      </span>
    </motion.li>
  );
}

export default function DressCodePage() {
  const d = invitation.dressCode;
  return (
    <PageShell decor="light">
      <ScriptDraw text={d.heading} className="mx-auto w-[70%] text-olive" />
      <Reveal delay={0.6}>
        <p className="-mt-[0.4cqh] font-serif text-lead italic text-olive">{d.style}</p>
      </Reveal>

      <div className="mt-[1.6cqh] grid w-full grid-cols-2 gap-[4cqw]">
        {[
          { Art: Gown, ...d.ladies, delay: 0.8 },
          { Art: Suit, ...d.gentlemen, delay: 1.0 },
        ].map(({ Art, label, text, delay }) => (
          <Reveal key={label} delay={delay} className="flex flex-col items-center">
            <Art className="h-[min(26cqw,17cqh)] w-auto" delay={delay} />
            <Caps className="mt-[0.6cqh] text-gold">{label}</Caps>
            <p className="mt-[0.2cqh] font-serif text-small leading-snug text-ink/80">{text}</p>
          </Reveal>
        ))}
      </div>

      <Reveal delay={1.4} className="mt-[2cqh] w-full">
        <Caps className="text-olive/80">{d.paletteLabel}</Caps>
        <ul className="mt-[0.9cqh] flex justify-center gap-[2.5cqw]">
          {d.palette.map((s, i) => (
            <SwatchDot key={s.name} s={s} i={i} delay={1.5} />
          ))}
        </ul>
      </Reveal>

      <Reveal delay={2} className="mt-[1.8cqh] w-full">
        <Caps className="text-olive/80">{d.avoidLabel}</Caps>
        <ul className="mt-[0.9cqh] flex justify-center gap-[2.5cqw]">
          {d.avoid.map((s, i) => (
            <SwatchDot key={s.name} s={s} i={i} delay={2.1} avoid />
          ))}
        </ul>
        <p className="mt-[1cqh] font-serif text-small italic text-ink/70">{d.note}</p>
      </Reveal>
    </PageShell>
  );
}
