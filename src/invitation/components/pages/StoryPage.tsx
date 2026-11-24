import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useRef, useState } from 'react';
import type { ReactNode, RefObject } from 'react';
import type { MotionValue } from 'framer-motion';
import { invitation } from '../../config/invitation';
import { Laurel } from '../botanicals/Florals';
import { StoryVignette } from '../botanicals/Illustrations';
import { Leaf, Rose } from '../botanicals/parts';
import { useBook } from '../bookContext';
import { Caps, PageShell, Reveal } from '../PageShell';
import { PhotoFrame } from '../PhotoFrame';
import { ScriptDraw } from '../ScriptDraw';
import { SecretTrigger } from '../Secrets';

/* ── draggable keepsakes ──────────────────────────────────────────── */

function Keepsake({
  children,
  bounds,
  className,
  rotate,
  z,
  onLift,
}: {
  children: ReactNode;
  bounds: RefObject<HTMLDivElement>;
  className: string;
  rotate: number;
  z: number;
  onLift: () => void;
}) {
  return (
    <motion.div
      className={`absolute cursor-grab touch-none active:cursor-grabbing ${className}`}
      style={{ rotate, zIndex: z }}
      drag
      dragConstraints={bounds}
      dragElastic={0.12}
      dragMomentum={false}
      onPointerDown={onLift}
      whileDrag={{ scale: 1.06, rotate: rotate * 0.4, boxShadow: '0 18px 28px -12px rgba(40,32,18,.45)' }}
      data-no-swipe
    >
      {children}
    </motion.div>
  );
}

function Ticket() {
  const t = invitation.story.ticket;
  return (
    <div
      className="relative flex w-full overflow-hidden rounded-[3px] bg-[#e9d3cc] text-left shadow-[0_6px_12px_-6px_rgba(60,50,30,.45)]"
      style={{
        WebkitMaskImage: 'radial-gradient(circle at 0 50%, transparent 7px, #000 7.5px), radial-gradient(circle at 100% 50%, transparent 7px, #000 7.5px)',
        WebkitMaskComposite: 'source-in',
        maskImage: 'radial-gradient(circle at 0 50%, transparent 7px, #000 7.5px), radial-gradient(circle at 100% 50%, transparent 7px, #000 7.5px)',
        maskComposite: 'intersect',
      }}
    >
      <div className="flex-1 px-3 py-2">
        <p className="font-caps text-[8.5px] uppercase tracking-[0.25em] text-[#8a5f57]">{t.kind}</p>
        <p className="font-script text-[clamp(18px,5.6cqw,24px)] leading-tight text-olive">{t.event}</p>
        <p className="font-serif text-[11.5px] italic leading-tight text-ink/70">{t.place}</p>
      </div>
      <div className="flex w-[30%] flex-col items-center justify-center border-l border-dashed border-[#a27c74]/60 px-1 py-2 text-center">
        <p className="font-caps text-[8px] uppercase tracking-[0.18em] text-[#8a5f57]">{t.date}</p>
        <p className="mt-0.5 font-serif text-[10.5px] leading-tight text-ink/70">{t.seat}</p>
      </div>
    </div>
  );
}

function Collage() {
  const s = invitation.story;
  const bounds = useRef<HTMLDivElement>(null);
  const [order, setOrder] = useState([0, 1, 2]);
  const lift = (i: number) => () => setOrder((o) => [...o.filter((x) => x !== i), i]);
  const z = (i: number) => order.indexOf(i) + 2;
  return (
    <div ref={bounds} className="relative mt-[1.6cqh] aspect-[1/1.12] w-full">
      <Keepsake bounds={bounds} className="left-[2%] top-[2%] w-[47%]" rotate={-7} z={z(0)} onLift={lift(0)}>
        <PhotoFrame src={s.collage[0]?.photo} alt={s.collage[0]?.caption ?? ''} illustration={s.collage[0]?.illustration ?? 'meet'} delay={0.6} />
        <p className="absolute bottom-[2%] inset-x-0 text-center font-hand text-small text-[#a27c74]">{s.collage[0]?.caption}</p>
      </Keepsake>
      <Keepsake bounds={bounds} className="right-[2%] top-[9%] w-[45%]" rotate={6} z={z(1)} onLift={lift(1)}>
        <PhotoFrame src={s.collage[1]?.photo} alt={s.collage[1]?.caption ?? ''} illustration={s.collage[1]?.illustration ?? 'date'} delay={0.85} tape="sage" />
        <p className="absolute bottom-[2%] inset-x-0 text-center font-hand text-small text-[#a27c74]">{s.collage[1]?.caption}</p>
      </Keepsake>
      <Keepsake bounds={bounds} className="bottom-[4%] left-[4%] w-[66%]" rotate={-3} z={z(2)} onLift={lift(2)}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1, duration: 0.8 }}>
          <Ticket />
        </motion.div>
      </Keepsake>

      {/* pressed flower — hides a memory */}
      <div className="absolute bottom-[4%] right-[4%]" style={{ zIndex: 10 }}>
        <SecretTrigger id="flower" label="A pressed flower — tap to read the memory" className="h-[min(18cqw,64px)] w-[min(18cqw,64px)]">
          <svg viewBox="0 0 60 60" className="h-full w-full rotate-12 drop-shadow-[0_2px_2px_rgba(60,50,30,.25)]" aria-hidden="true">
            <rect x="8" y="6" width="44" height="50" rx="2" fill="#fbf6ec" opacity=".75" />
            <path d="M30 50 C29 40 31 32 30 24" stroke="#5a6048" strokeWidth="1" fill="none" />
            <Leaf x={30} y={42} a={200} s={0.6} />
            <Leaf x={30} y={36} a={-20} s={0.55} />
            <Rose x={30} y={22} r={9} rot={15} />
          </svg>
        </SecretTrigger>
      </div>

    </div>
  );
}

/* ── contact sheet: two film negatives laid on the paper ─────────── */

function Holes() {
  return (
    <>
      {[0, 1].map((side) => (
        <div
          key={side}
          className={`pointer-events-none absolute inset-y-[3%] flex flex-col justify-between ${side ? 'right-[3%]' : 'left-[3%]'}`}
          aria-hidden="true"
        >
          {Array.from({ length: 9 }, (_, k) => (
            <span key={k} className="h-[7px] w-[5px] rounded-[1px] bg-[#efe6d4]/80" />
          ))}
        </div>
      ))}
    </>
  );
}

function ContactSheet() {
  const s = invitation.story;
  const { openMoment } = useBook();
  const strips = [s.film.slice(0, 2), s.film.slice(2, 4)];
  return (
    <div className="mt-[2.4cqh] flex w-full items-start justify-center gap-[4cqw]">
      {strips.map((strip, si) => (
        <motion.div
          key={si}
          className="relative w-[47%] rounded-[2px] bg-[#2f2e25] px-[11%] py-[7%] shadow-[0_12px_20px_-12px_rgba(30,28,20,.7)]"
          style={{ rotate: si ? 2.5 : -2.5 }}
          initial={{ opacity: 0, y: si ? 30 : -20 }}
          animate={{ opacity: 1, y: si ? 14 : 0 }}
          transition={{ delay: 0.4 + si * 0.2, duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <Holes />
          <div className="space-y-[1.6cqh]">
            {strip.map((m) => (
              <motion.button
                key={m.title}
                type="button"
                onClick={() => openMoment(m)}
                className="block w-full text-left"
                whileTap={{ scale: 0.95 }}
                aria-label={`Open memory: ${m.title}`}
                data-no-swipe
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-[#ece2cf]">
                  {m.photo ? (
                    <img src={m.photo} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover object-[50%_30%] sepia-[.2]" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_30%_30%,#fbf4ea,#e2d3bb)]">
                      <StoryVignette kind={m.illustration} className="h-[85%] w-[85%]" />
                    </div>
                  )}
                  {(m.video || m.voice) && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/15">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black/50 pl-0.5 text-[13px] text-white">▶</span>
                    </span>
                  )}
                </div>
                <p className="mt-1 text-center font-serif text-[13px] italic leading-tight text-[#efe6d4]/90">{m.title}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ── the proposal letter, folded in three ───────────────────────── */

function Panel({ index, angle, children }: { index: 0 | 1 | 2; angle?: MotionValue<number>; children: ReactNode }) {
  const fallback = useMotionValue(0);
  const a = angle ?? fallback;
  const showFront = useTransform(a, (v) => (Math.abs(v) < 90 ? 1 : 0));
  const foldShade = useTransform(a, (v) => Math.min(1, Math.abs(v) / 90));
  const origin = index === 0 ? '50% 100%' : '50% 0%';
  return (
    <motion.div
      className="absolute inset-x-0 h-1/3 overflow-hidden"
      style={{ top: `${index * 33.3333}%`, rotateX: a, transformOrigin: origin, transformPerspective: 900, zIndex: index === 1 ? 1 : 2 }}
    >
      <div className="paper absolute inset-0" />
      <motion.div className="absolute inset-x-0 h-[300%]" style={{ top: `${-index * 100}%`, opacity: showFront }}>
        {children}
      </motion.div>
      {index !== 1 && (
        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'linear-gradient(180deg, rgba(60,50,30,.12), rgba(60,50,30,.02))', opacity: foldShade }}
        />
      )}
    </motion.div>
  );
}

function ProposalLetter() {
  const l = invitation.story.letter;
  const [open, setOpen] = useState(false);
  const top = useMotionValue(-178);
  const bottom = useMotionValue(178);

  const unfold = () => {
    if (open) return;
    setOpen(true);
    animate(bottom, 0, { duration: 1, ease: [0.4, 0, 0.2, 1] });
    animate(top, 0, { duration: 1, delay: 0.7, ease: [0.4, 0, 0.2, 1] });
  };

  const content = (
    <div className="flex h-full flex-col px-[8%] py-[7%] text-left">
      <p className="font-hand text-lead text-olive">{l.to}</p>
      <p className="mt-2 flex-1 font-hand text-[clamp(17px,5.4cqw,22px)] leading-[1.35] text-ink/85">{l.body}</p>
      <p className="text-right font-hand text-lead text-olive/80">{l.signoff}</p>
      <p className="text-right font-script text-script leading-none text-olive">{l.from}</p>
    </div>
  );

  return (
    <div className="w-full">
      <ScriptDraw text={invitation.pageLabels.letter} className="mx-auto w-[58%] text-olive" />
      <Caps className="-mt-[0.4cqh] text-olive/70">{l.label}</Caps>
      <motion.button
        type="button"
        onClick={unfold}
        aria-expanded={open}
        aria-label={open ? l.label : `${l.label} — ${l.hint}`}
        className="relative mx-auto mt-[2.4cqh] block w-full text-left"
        whileTap={open ? undefined : { scale: 0.97 }}
        data-no-swipe
      >
        <motion.div
          layout
          className="relative w-full shadow-[0_8px_18px_-10px_rgba(60,50,30,.5)]"
          style={{ aspectRatio: open ? '3 / 3.9' : '3 / 2' }}
        >
          {open ? (
            <div className="absolute inset-0">
              <Panel index={0} angle={top}>{content}</Panel>
              <Panel index={1}>{content}</Panel>
              <Panel index={2} angle={bottom}>{content}</Panel>
            </div>
          ) : (
            <div className="paper absolute inset-0 flex items-center justify-center rounded-[2px]">
              <svg viewBox="0 0 300 120" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden="true">
                <path d="M0 0 L150 70 L300 0" fill="none" stroke="#c6a46c" strokeOpacity=".5" />
                <line x1="0" y1="40" x2="300" y2="40" stroke="#5a4a30" strokeOpacity=".08" />
                <line x1="0" y1="80" x2="300" y2="80" stroke="#5a4a30" strokeOpacity=".08" />
              </svg>
              <svg viewBox="0 0 40 40" className="relative mt-[8%] h-10 w-10 drop-shadow-[0_2px_2px_rgba(40,35,20,.35)]" aria-hidden="true">
                <circle cx="20" cy="20" r="18" fill="url(#wax)" />
                <circle cx="20" cy="20" r="12.5" fill="url(#wax-inner)" stroke="#2c3123" strokeOpacity=".4" />
                <path d="M20 27 C13 22 12 17 15 15 C17 13.5 19.4 14.5 20 16.5 C20.6 14.5 23 13.5 25 15 C28 17 27 22 20 27Z" fill="#dfe3c8" opacity=".8" />
              </svg>
              <span className="hint-pulse absolute bottom-[8%] font-hand text-small text-olive/70">{l.hint}</span>
            </div>
          )}
        </motion.div>
      </motion.button>
    </div>
  );
}

/* ── pages ───────────────────────────────────────────────────────── */

/** I. the diary — how it all happened */
export default function StoryPage() {
  const { heading, subheading, moments } = invitation.story;
  return (
    <PageShell decor="top">
      <ScriptDraw text={heading} className="mx-auto w-[66%] text-olive" />
      <Reveal delay={0.7}>
        <Caps className="-mt-[0.4cqh] text-olive/70">{subheading}</Caps>
      </Reveal>
      <ol className="mt-[2.4cqh] w-full space-y-[2cqh] text-left">
        {moments.map((m, i) => (
          <Reveal key={m.title} delay={0.9 + i * 0.18} className="grid grid-cols-[27%_1fr] gap-[4cqw]">
            <div className="pt-1 text-right">
              <Caps className="text-gold">{m.when}</Caps>
              <p className="font-hand text-small leading-tight text-[#a27c74]">{m.note}</p>
            </div>
            <div className="border-l border-gold/40 pl-[4cqw]">
              <h3 className="font-hand text-lead font-medium leading-tight text-olive">{m.title}</h3>
              <p className="font-serif text-small italic text-ink/80">{m.text}</p>
            </div>
          </Reveal>
        ))}
      </ol>
      <Laurel className="mx-auto mt-[2.6cqh] h-4 w-24 shrink-0" delay={1.8} />
    </PageShell>
  );
}

/** II. the scrapbook — photos and keepsakes you can move around */
export function ScrapbookPage() {
  const s = invitation.story;
  return (
    <PageShell decor="none">
      <ScriptDraw text={invitation.pageLabels.moments} className="mx-auto w-[64%] text-olive" />
      <Reveal delay={0.6}>
        <p className="-mt-[0.4cqh] font-hand text-small text-olive/60">{s.dragHint}</p>
      </Reveal>
      <Collage />
    </PageShell>
  );
}

/** III. little moments — a contact sheet of film negatives */
export function FilmPage() {
  const s = invitation.story;
  return (
    <PageShell decor="top">
      <ScriptDraw text={s.filmHeading} className="mx-auto w-[74%] text-olive" />
      <Reveal delay={0.6}>
        <p className="-mt-[0.4cqh] font-hand text-small text-olive/60">{s.filmHint} ✦</p>
      </Reveal>
      <ContactSheet />
    </PageShell>
  );
}

/** IV. the proposal letter */
export function LetterPage() {
  return (
    <PageShell decor="light">
      <ProposalLetter />
    </PageShell>
  );
}
