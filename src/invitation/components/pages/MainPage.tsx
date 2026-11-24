import { invitation } from '../../config/invitation';
import { Divider, Monogram } from '../botanicals/Florals';
import { guest } from '../../lib/guest';
import { Caps, PageShell, Reveal } from '../PageShell';
import { SecretTrigger } from '../Secrets';

export default function MainPage() {
  const { couple, wedding, wording } = invitation;
  return (
    <PageShell decor="lush">
      <Reveal delay={0.1}>
        <Monogram className={`mx-auto max-w-[92px] ${guest.name ? 'w-[min(15cqw,9cqh)]' : 'w-[min(21cqw,13cqh)]'}`} delay={0.2} />
      </Reveal>

      {guest.name && (
        <Reveal delay={0.35} className="mt-[1.4cqh] max-w-[76%]">
          <p className="font-hand text-small leading-snug text-[#a27c74]">
            {invitation.greeting.line.replace('{name}', guest.name)}
          </p>
        </Reveal>
      )}

      <Reveal delay={0.5} className={guest.name ? 'mt-[1.2cqh]' : 'mt-[2.2cqh]'}>
        <Caps className="text-olive/80">{wording.together}</Caps>
      </Reveal>

      <h1 className="mt-[1.4cqh] flex flex-col items-center">
        <Reveal delay={0.8} y={18}>
          <span className="gold-foil inline-block font-script text-names">{couple.one.first}</span>
        </Reveal>
        <Reveal delay={1.05}>
          <span className="-my-[1.2cqh] flex items-center justify-center gap-1 font-serif text-lead italic text-gold">
            and
            <SecretTrigger id="heart" label="A little heart — tap it" className="h-9 w-9">
              <svg viewBox="0 0 20 18" className="h-[13px] w-[14px]" aria-hidden="true">
                <path d="M10 17 C3 12 0 8 2 4 C4 0.5 8.5 1 10 4.5 C11.5 1 16 0.5 18 4 C20 8 17 12 10 17Z" fill="url(#gold-foil)" />
              </svg>
            </SecretTrigger>
          </span>
        </Reveal>
        <Reveal delay={1.25} y={18}>
          <span className="gold-foil inline-block font-script text-names">{couple.two.first}</span>
        </Reveal>
      </h1>

      <Reveal delay={1.6} className="mt-[1.2cqh] max-w-[86%]">
        <p className="font-serif text-body italic text-ink/85">{wording.invite}</p>
      </Reveal>

      <Reveal delay={1.85} className="mt-[2.6cqh] w-full">
        <div className="mx-auto grid w-[88%] grid-cols-[1fr_auto_1fr] items-center gap-[3cqw]">
          <Caps className="border-y border-gold/50 py-[0.9cqh] text-olive">{wedding.weekday}</Caps>
          <span className="font-serif text-numeral font-medium text-olive emboss">{wedding.day}</span>
          <Caps className="border-y border-gold/50 py-[0.9cqh] text-olive">{wedding.month}</Caps>
        </div>
        <Caps className="mt-[0.8cqh] text-olive/80">{wedding.year}</Caps>
      </Reveal>

      <Reveal delay={2.05} className="mt-[1.4cqh]">
        <p className="font-serif text-small italic text-ink/80">{wedding.timeWords}</p>
      </Reveal>

      <Reveal delay={2.25} className="mt-[1.8cqh] w-full">
        <Divider delay={2.25} />
        <p className="mt-[1.2cqh] font-serif text-lead font-medium text-olive">{wedding.venueShort}</p>
        <Caps className="mt-[0.3cqh] text-olive/70">{wedding.cityShort}</Caps>
      </Reveal>
    </PageShell>
  );
}
