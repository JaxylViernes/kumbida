import type { ReactNode } from 'react';
import { invitation } from '../../config/invitation';
import { Divider } from '../botanicals/Florals';
import { Caps, PageShell, Reveal } from '../PageShell';
import { ScriptDraw } from '../ScriptDraw';
import { SecretTrigger } from '../Secrets';

function Section({ title, children, delay }: { title: string; children: ReactNode; delay: number }) {
  return (
    <Reveal delay={delay} className="w-full">
      <Caps className="mb-[0.7cqh] text-gold">{title}</Caps>
      {children}
    </Reveal>
  );
}

function Names({ names }: { names: string[] }) {
  return (
    <ul className="font-serif text-small leading-snug text-ink/90">
      {names.map((n, i) => (
        <li key={`${n}-${i}`}>{n}</li>
      ))}
    </ul>
  );
}

function Pair({ left, right, leftLabel, rightLabel }: { left: string[]; right: string[]; leftLabel?: string; rightLabel?: string }) {
  return (
    <div className="grid grid-cols-2 gap-x-[4cqw]">
      <div>
        {leftLabel && <p className="mb-[0.3cqh] font-serif text-small italic text-olive/70">{leftLabel}</p>}
        <Names names={left} />
      </div>
      <div>
        {rightLabel && <p className="mb-[0.3cqh] font-serif text-small italic text-olive/70">{rightLabel}</p>}
        <Names names={right} />
      </div>
    </div>
  );
}

/** Printed-program style list of the wedding party. */
const ENVELOPE = (
  <SecretTrigger id="envelope" label="A tiny envelope is tucked here — tap to open it" className="h-11 w-14">
    <svg viewBox="0 0 56 40" className="h-[34px] w-[48px] rotate-[8deg] drop-shadow-[0_3px_3px_rgba(60,50,30,.3)]" aria-hidden="true">
      <rect x="2" y="4" width="52" height="34" rx="2" fill="#efe5d2" stroke="#c6a46c" strokeWidth=".7" />
      <path d="M2 6 L28 24 L54 6" fill="#f6efe2" stroke="#c6a46c" strokeWidth=".7" />
      <circle cx="28" cy="23" r="4.5" fill="url(#wax)" />
    </svg>
  </SecretTrigger>
);

/** The family & wedding party, printed like a programme. */
export default function EntouragePage() {
  const e = invitation.entourage;
  const sep = <Divider className="my-[2cqh] opacity-70" />;
  return (
    <PageShell decor="top">
      <ScriptDraw text={e.heading} className="mx-auto w-[80%] text-olive" />
      <div className="mt-[1.4cqh] w-full">
        <Section title="Parents" delay={0.5}>
          <Pair left={e.parents.one} right={e.parents.two} leftLabel={e.parents.oneLabel} rightLabel={e.parents.twoLabel} />
        </Section>
        {sep}
        <Reveal delay={0.8} className="grid w-full grid-cols-2 gap-x-[4cqw]">
          <div>
            <Caps className="mb-[0.5cqh] text-gold">{e.honor.oneLabel}</Caps>
            <Names names={[e.honor.one]} />
          </div>
          <div>
            <Caps className="mb-[0.5cqh] text-gold">{e.honor.twoLabel}</Caps>
            <Names names={[e.honor.two]} />
          </div>
        </Reveal>
        {sep}
        <Reveal delay={1.1} className="grid w-full grid-cols-2 gap-x-[4cqw]">
          <div>
            <Caps className="mb-[0.5cqh] text-gold">{e.attendants.oneLabel}</Caps>
            <Names names={e.attendants.one} />
          </div>
          <div>
            <Caps className="mb-[0.5cqh] text-gold">{e.attendants.twoLabel}</Caps>
            <Names names={e.attendants.two} />
          </div>
        </Reveal>
      </div>
    </PageShell>
  );
}

/** The sponsors' insert — with a tiny envelope tucked at its foot. */
export function SponsorsPage() {
  const e = invitation.entourage;
  return (
    <PageShell decor="light">
      <ScriptDraw text={invitation.pageLabels.sponsors} className="mx-auto w-[66%] text-olive" />
      <div className="mt-[1.4cqh] w-full">
        <Section title={e.principalSponsorsLabel} delay={0.5}>
          <Pair left={e.principalSponsors.map((p) => p[0])} right={e.principalSponsors.map((p) => p[1])} />
        </Section>
        <Divider className="my-[2cqh] opacity-70" delay={0.8} />
        <Section title={e.secondarySponsorsLabel} delay={0.9}>
          <div className="space-y-[1.2cqh]">
            {e.secondarySponsors.map((s) => (
              <div key={s.role}>
                <p className="font-serif text-small italic text-olive/70">{s.role}</p>
                <Pair left={[s.names[0]]} right={s.names.slice(1)} />
              </div>
            ))}
          </div>
        </Section>
      </div>
      <div className="mt-[1.4cqh] flex w-full justify-end pr-[2%]">{ENVELOPE}</div>
    </PageShell>
  );
}
