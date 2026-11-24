import { motion } from 'framer-motion';
import { useState } from 'react';
import type { StoryIllustration } from '../config/invitation';
import { StoryVignette } from './botanicals/Illustrations';

/** Polaroid-style print with washi tape; illustrated placeholder when no photo is set. */
export function PhotoFrame({
  src,
  alt,
  illustration,
  tilt = 0,
  delay = 0,
  tape = 'rose',
}: {
  src?: string;
  alt: string;
  illustration: StoryIllustration;
  tilt?: number;
  delay?: number;
  tape?: 'rose' | 'sage';
}) {
  const [loaded, setLoaded] = useState(false);
  return (
    <motion.figure
      className="relative m-0 bg-[#fffdf8] p-[6%] pb-[16%] shadow-[0_1px_2px_rgba(60,50,30,.15),0_8px_16px_-8px_rgba(60,50,30,.35)]"
      initial={{ opacity: 0, rotate: tilt * 2, y: 14, scale: 0.94 }}
      animate={{ opacity: 1, rotate: tilt, y: 0, scale: 1 }}
      transition={{ delay, duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <span
        className={`absolute -top-[7%] left-1/2 h-[14%] w-[46%] -translate-x-1/2 rotate-[-4deg] opacity-80 ${
          tape === 'rose' ? 'bg-rose/70' : 'bg-sage/60'
        }`}
        style={{ clipPath: 'polygon(3% 0, 97% 4%, 100% 100%, 0 96%)' }}
        aria-hidden="true"
      />
      <div className="relative aspect-[4/5] overflow-hidden bg-champagne/60">
        {src ? (
          <motion.img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            onLoad={() => setLoaded(true)}
            className="h-full w-full object-cover object-[50%_30%]"
            initial={{ opacity: 0, scale: 1.06 }}
            animate={loaded ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 1.4 }}
          />
        ) : (
          <motion.div
            className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_30%_30%,#fbf4ea,#ecdfcb_60%,#e2d3bb)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.3, duration: 1.2 }}
            role="img"
            aria-label={`${alt} (photo placeholder)`}
          >
            <StoryVignette kind={illustration} className="h-[86%] w-[86%]" />
          </motion.div>
        )}
      </div>
    </motion.figure>
  );
}
