import { motion } from 'framer-motion';
import { Clock, MapPin } from 'lucide-react';
import type { ComponentType } from 'react';
import { invitation, type Venue } from '../../config/invitation';
import { Divider } from '../botanicals/Florals';
import { Chapel, Pavilion } from '../botanicals/Illustrations';
import { Caps, PageShell, Reveal } from '../PageShell';
import { ScriptDraw } from '../ScriptDraw';

const mapsLink = (v: Venue) =>
  v.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([v.name, ...v.address].join(', '))}`;

function VenueBlock({ venue, Art, delay }: { venue: Venue; Art: ComponentType<{ className?: string; delay?: number }>; delay: number }) {
  return (
    <Reveal delay={delay} className="flex w-full flex-col items-center">
      <Art className="h-auto w-[78%] max-w-[300px]" delay={delay} />
      <Divider className="my-[1.6cqh]" delay={delay + 0.4} />
      <p className="font-serif text-title font-medium text-olive">{venue.name}</p>
      <p className="font-serif text-small text-ink/80">{venue.date}</p>
      <p className="flex items-center justify-center gap-1.5 font-serif text-small italic text-ink/80">
        <Clock size={13} strokeWidth={1.5} className="text-gold" aria-hidden="true" />
        {venue.time}
      </p>
      <address className="mt-[0.3cqh] font-serif text-small not-italic leading-snug text-ink/70">
        {venue.address.map((l) => (
          <span key={l} className="block">
            {l}
          </span>
        ))}
      </address>
      <motion.a
        href={mapsLink(venue)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-[2cqh] inline-flex min-h-[40px] items-center gap-2 rounded-full border border-olive/40 bg-ivory/60 px-4 font-caps text-caps uppercase text-olive shadow-[0_2px_6px_-3px_rgba(60,50,30,.35)] transition-colors active:bg-champagne"
        whileTap={{ scale: 0.95 }}
        whileHover={{ y: -1 }}
      >
        <MapPin size={14} strokeWidth={1.5} aria-hidden="true" />
        {invitation.details.directionsLabel}
      </motion.a>
    </Reveal>
  );
}

/** The ceremony insert. */
export default function DetailsPage() {
  const { ceremony } = invitation.details;
  return (
    <PageShell decor="light">
      <ScriptDraw text={ceremony.label} className="mx-auto w-[80%] text-olive" />
      <div className="mt-[1.6cqh] w-full">
        <VenueBlock venue={ceremony} Art={Chapel} delay={0.6} />
      </div>
    </PageShell>
  );
}

/** The reception insert. */
export function ReceptionPage() {
  const { reception } = invitation.details;
  return (
    <PageShell decor="light">
      <ScriptDraw text={reception.label} className="mx-auto w-[80%] text-olive" />
      <div className="mt-[1.6cqh] w-full">
        <VenueBlock venue={reception} Art={Pavilion} delay={0.6} />
      </div>
    </PageShell>
  );
}
