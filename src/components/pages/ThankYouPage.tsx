import { invitation } from '../../config/invitation';
import { guest } from '../../lib/guest';
import { Divider, Monogram } from '../botanicals/Florals';
import { Caps, PageShell, Reveal } from '../PageShell';
import { PhotoFrame } from '../PhotoFrame';
import { ScriptDraw } from '../ScriptDraw';

/** After the wedding, the invitation's first page becomes a thank-you card. */
export default function ThankYouPage() {
  const t = invitation.thankYou;
  const { couple, wedding } = invitation;
  return (
    <PageShell decor="lush">
      <Monogram className="mx-auto w-[min(17cqw,11cqh)] max-w-[80px]" delay={0.1} />
      <ScriptDraw text={t.heading} className="mx-auto mt-[0.6cqh] w-[66%] text-olive" />
      {guest.name && (
        <Reveal delay={0.6}>
          <p className="font-hand text-lead text-[#a27c74]">Dear {guest.name},</p>
        </Reveal>
      )}
      <Reveal delay={0.8} className="max-w-[90%]">
        <p className="font-serif text-body italic text-ink/85">{t.message}</p>
      </Reveal>

      <div className="relative mt-[2.4cqh] h-[min(44cqw,28cqh)] w-full">
        {t.photos.slice(0, 3).map((p, i) => (
          <div
            key={p.caption}
            className="absolute top-0 w-[40%]"
            style={{ left: `${[2, 30, 58][i]}%`, top: `${[6, 0, 8][i]}%`, zIndex: i === 1 ? 3 : 2 }}
          >
            <PhotoFrame src={p.photo} alt={p.caption} illustration={p.illustration} tilt={[-6, 2, 7][i]} delay={1 + i * 0.25} tape={i % 2 ? 'sage' : 'rose'} />
            <p className="mt-0.5 text-center font-hand text-small text-[#a27c74]">{p.caption}</p>
          </div>
        ))}
      </div>

      <Divider className="mt-[2cqh]" delay={1.8} />
      <Reveal delay={2}>
        <p className="gold-foil mt-[1cqh] inline-block font-script text-script leading-tight">
          {couple.one.first} <span className="font-serif text-[0.5em] italic">&amp;</span> {couple.two.first}
        </p>
        <Caps className="text-olive/75">married · {wedding.short}</Caps>
      </Reveal>
    </PageShell>
  );
}
