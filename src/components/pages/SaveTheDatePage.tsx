import { motion } from 'framer-motion';
import { CalendarPlus, Download } from 'lucide-react';
import { invitation } from '../../config/invitation';
import { downloadIcs, googleCalendarUrl, monthGrid } from '../../lib/calendar';
import { phase } from '../../lib/phase';
import { Divider, Laurel } from '../botanicals/Florals';
import { Bud, Grow, Leaf, Rose } from '../botanicals/parts';
import { Countdown } from '../Countdown';
import { Caps, PageShell, Reveal } from '../PageShell';
import { ScriptDraw } from '../ScriptDraw';

const WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/** A small paper calendar, the date circled in ink and a flower blooming beside it. */
function PaperCalendar() {
  const { cells, day, monthName, year } = monthGrid();
  return (
    <motion.div
      className="paper paper-champagne relative w-full rounded-[3px] px-[5%] pb-[4%] pt-[6%] shadow-[0_6px_14px_-8px_rgba(60,50,30,.45)]"
      initial={{ rotate: -2.5, y: 16, opacity: 0 }}
      animate={{ rotate: -1, y: 0, opacity: 1 }}
      transition={{ delay: 0.5, duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {/* binding rings */}
      <div className="absolute inset-x-[18%] -top-[7px] flex justify-between" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="h-[14px] w-[6px] rounded-full border border-[#a8843f] bg-gradient-to-b from-[#f1dfae] to-[#b08c4c]" />
        ))}
      </div>
      <div className="flex items-baseline justify-between border-b border-gold/40 pb-[1cqh]">
        <span className="font-script text-title leading-none text-olive">{monthName}</span>
        <span className="font-caps text-caps uppercase text-olive/70">{year}</span>
      </div>
      <div className="mt-[1cqh] grid grid-cols-7 gap-y-[0.6cqh] text-center" role="grid" aria-label={`${monthName} ${year}`}>
        {WEEK.map((w, i) => (
          <span key={i} className="font-caps text-[10px] uppercase tracking-[0.15em] text-gold">
            {w}
          </span>
        ))}
        {cells.map((d, i) => {
          const isDay = d === day;
          return (
            <span
              key={i}
              className={`relative flex h-[min(8cqw,5cqh)] items-center justify-center font-serif text-small ${
                isDay ? 'font-semibold text-olive' : 'text-ink/70'
              }`}
              aria-current={isDay ? 'date' : undefined}
            >
              {d ?? ''}
              {isDay && (
                <>
                  <svg viewBox="0 0 40 30" className="pointer-events-none absolute left-1/2 top-1/2 h-[175%] w-[175%] -translate-x-1/2 -translate-y-1/2 overflow-visible" aria-hidden="true">
                    <path
                      className="ink-circle"
                      pathLength={1}
                      d="M29 6 C22 1 7 3 4 12 C1 21 12 28 22 27 C32 26 38 18 35 10 C33 5 26 3 19 4"
                      fill="none"
                      stroke="#a27c74"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  <svg viewBox="0 0 40 40" className="pointer-events-none absolute -right-[75%] -top-[80%] h-[120%] w-[120%] overflow-visible" aria-hidden="true">
                    <Grow delay={2.4} from={0}>
                      <Leaf x={14} y={26} a={150} s={0.55} />
                      <Leaf x={22} y={26} a={30} s={0.55} />
                    </Grow>
                    <Grow delay={2.6} from={0}>
                      <Rose x={18} y={20} r={8} rot={20} />
                    </Grow>
                    <Grow delay={2.9} from={0}>
                      <Bud x={30} y={14} a={50} s={0.5} />
                    </Grow>
                  </svg>
                </>
              )}
            </span>
          );
        })}
      </div>
    </motion.div>
  );
}

function AddToCalendar() {
  return (
    <div className="flex items-center justify-center gap-2">
      <motion.a
        href={googleCalendarUrl()}
        target="_blank"
        rel="noopener noreferrer"
        whileTap={{ scale: 0.95 }}
        className="inline-flex min-h-[42px] items-center gap-1.5 whitespace-nowrap rounded-full bg-olive px-3.5 font-caps text-[10.5px] uppercase tracking-[0.14em] text-ivory shadow-[0_5px_12px_-7px_rgba(40,40,30,.8)]"
      >
        <CalendarPlus size={14} aria-hidden="true" /> Google
      </motion.a>
      <motion.button
        type="button"
        onClick={downloadIcs}
        whileTap={{ scale: 0.95 }}
        className="inline-flex min-h-[42px] items-center gap-1.5 whitespace-nowrap rounded-full border border-olive/40 bg-ivory/60 px-3.5 font-caps text-[10.5px] uppercase tracking-[0.14em] text-olive"
      >
        <Download size={14} aria-hidden="true" /> Apple / Outlook
      </motion.button>
    </div>
  );
}

function DaySchedule() {
  const d = invitation.weddingDay;
  return (
    <>
      <Reveal delay={0.4}>
        <p className="font-script text-names leading-none text-olive">{d.greeting}</p>
        <p className="mt-[1cqh] font-serif text-body italic text-ink/80">{d.sub}</p>
      </Reveal>
      <Divider className="my-[2cqh]" delay={0.8} />
      <Caps className="text-gold">{d.scheduleHeading}</Caps>
      <ol className="relative mt-[1.4cqh] w-full space-y-[1.4cqh] text-left">
        <span className="absolute bottom-2 left-[30%] top-2 w-px bg-gold/40" aria-hidden="true" />
        {d.schedule.map((s, i) => (
          <Reveal key={s.time + s.title} delay={1 + i * 0.15} className="relative grid grid-cols-[30%_1fr] items-baseline gap-[5cqw]">
            <span className="whitespace-nowrap pr-[3cqw] text-right font-caps text-caps uppercase text-olive/80">{s.time}</span>
            <span>
              <span className="absolute left-[30%] mt-[0.6em] h-2 w-2 -translate-x-1/2 rotate-45 bg-gold" aria-hidden="true" />
              <span className="block font-serif text-body text-olive">{s.title}</span>
              {s.note && <span className="block font-serif text-small italic text-ink/60">{s.note}</span>}
            </span>
          </Reveal>
        ))}
      </ol>
    </>
  );
}

export default function SaveTheDatePage() {
  const c = invitation.calendar;
  const w = invitation.wedding;
  if (phase === 'day') {
    return (
      <PageShell decor="lush">
        <DaySchedule />
      </PageShell>
    );
  }
  return (
    <PageShell decor="top">
      <ScriptDraw text={c.heading} className="mx-auto w-[78%] text-olive" />
      <Reveal delay={0.4}>
        <p className="-mt-[0.3cqh] font-serif text-small italic text-ink/75">
          {w.weekday}, {w.timeWords.replace(/^at /, '')}
        </p>
      </Reveal>
      <div className="mt-[2.4cqh] w-full px-[2%]">
        <PaperCalendar />
      </div>
      <Reveal delay={1.4} className="mt-[2.4cqh] flex w-full flex-col items-center">
        <Countdown iso={w.iso} />
      </Reveal>
      <Reveal delay={1.7} className="mt-[2.2cqh]">
        <Caps className="mb-[1cqh] text-olive/70">{c.addLabel}</Caps>
        <AddToCalendar />
      </Reveal>
    </PageShell>
  );
}
