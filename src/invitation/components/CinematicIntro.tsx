import { ChevronsRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { invitation } from '../config/invitation';

/**
 * A short cinematic opening: letterboxed, vignette, romantic lines, then the
 * couple's names — and a soft fade into the invitation. Always skippable.
 *
 * Built for phones:
 *  - the component can sit hidden in `standby` while the envelope is showing,
 *    so the video is already downloaded when the film starts (no buffering stall);
 *  - every effect is a CSS animation the browser runs off the main thread;
 *  - nothing is blended over the video (blending every video frame is costly on phones).
 */
export function CinematicIntro({
  active = true,
  onEnding,
  onDone,
}: {
  /** false = mounted hidden, preloading the video */
  active?: boolean;
  /** called when the fade-out begins (the invitation can start appearing underneath) */
  onEnding?: () => void;
  onDone: () => void;
}) {
  const { intro, couple, wedding } = invitation;
  const [step, setStep] = useState(0); // 0..lines.length = lines, then names
  const [ending, setEnding] = useState(false);
  const finished = useRef(false);
  const video = useRef<HTMLVideoElement>(null);
  const lines = intro.lines;
  const namesStep = lines.length;

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    setEnding(true);
    onEnding?.();
    window.setTimeout(onDone, 900);
  };

  useEffect(() => {
    if (!active) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onEnding?.();
      onDone();
      return;
    }
    if (intro.video) {
      const v = video.current;
      if (v) {
        v.currentTime = 0;
        v.play().catch(() => setStep(namesStep)); // if autoplay is refused, go straight to the names
      }
      // safety net: never get stuck on a video that fails to load
      const t = window.setTimeout(() => {
        if (!v || v.readyState < 2) setStep(namesStep);
      }, 4000);
      return () => window.clearTimeout(t);
    }
    const timers: number[] = [];
    let t = 900;
    lines.forEach((_, i) => {
      timers.push(window.setTimeout(() => setStep(i), t));
      t += 3300;
    });
    timers.push(window.setTimeout(() => setStep(namesStep), t));
    timers.push(window.setTimeout(finish, t + 4200));
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // names shown → fade out a few seconds later
  useEffect(() => {
    if (!active || step !== namesStep || !intro.video) return;
    const t = window.setTimeout(finish, 4200);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, step]);

  return (
    <div
      className={`film-root fixed inset-0 z-[60] overflow-hidden bg-[#1c1a14] ${active ? 'is-active' : ''} ${ending ? 'is-ending' : ''}`}
      role="region"
      aria-label="Introduction film"
      aria-hidden={!active || undefined}
    >
      {intro.video ? (
        <video
          ref={video}
          src={intro.video}
          poster={intro.poster || undefined}
          className="absolute inset-0 h-full w-full object-cover"
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          onEnded={() => setStep(namesStep)}
          onError={() => setStep(namesStep)}
        />
      ) : (
        <>
          <div className="film-glow absolute inset-[-20%]" aria-hidden="true" />
          <div className="film-leak absolute -left-1/2 top-0 h-full w-full" aria-hidden="true" />
          <div className="film-grain pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
        </>
      )}

      {active && (
        <>
          {/* vignette + letterbox */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_90%_at_50%_50%,transparent_50%,rgba(0,0,0,.6))]" aria-hidden="true" />
          <div className="film-bar-top absolute inset-x-0 top-0 h-[9vh] bg-black" />
          <div className="film-bar-bottom absolute inset-x-0 bottom-0 h-[9vh] bg-black" />

          <div className="absolute inset-0 flex items-center justify-center px-8 text-center">
            {!intro.video && step < namesStep && (
              <p key={`l${step}`} className="film-line font-serif text-[clamp(24px,7vw,40px)] italic leading-snug text-[#efe3cc]">
                {lines[step]}
              </p>
            )}
            {step === namesStep && (
              <div className="relative">
                {/* soft dark halo so the names read over any bright frame */}
                <div
                  className="film-fade pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[150%] w-[150vw] -translate-x-1/2 -translate-y-1/2"
                  style={{ background: 'radial-gradient(closest-side, rgba(20,16,8,.62), rgba(20,16,8,.35) 55%, transparent)' }}
                  aria-hidden="true"
                />
                <h2 className="intro-names flex flex-col items-center font-script leading-[0.95]">
                  <span className="film-rise block text-[clamp(64px,22vw,120px)]">{couple.one.first}</span>
                  <span className="film-rise my-[-0.1em] block font-serif text-[clamp(26px,8vw,44px)] italic" style={{ animationDelay: '0.6s' }}>
                    &amp;
                  </span>
                  <span className="film-rise block text-[clamp(64px,22vw,120px)]" style={{ animationDelay: '0.9s' }}>
                    {couple.two.first}
                  </span>
                </h2>
                <div className="film-rule mx-auto mt-5 h-px w-40 bg-gradient-to-r from-transparent via-[#f3dfa6] to-transparent" />
                <p className="film-fade mt-3 font-caps text-[14px] font-medium uppercase tracking-[0.5em] text-[#fff3d6] [text-shadow:0_1px_8px_rgba(0,0,0,.7)]" style={{ animationDelay: '1.8s' }}>
                  {wedding.short}
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={finish}
            className="film-fade absolute right-4 flex min-h-[44px] items-center gap-1 rounded-full border border-white/25 bg-black/50 px-4 font-caps text-[11px] uppercase tracking-[0.3em] text-white/85 active:scale-95"
            style={{ bottom: 'calc(9vh + 14px + env(safe-area-inset-bottom, 0px))', animationDelay: '0.6s' }}
          >
            {intro.skipLabel} <ChevronsRight size={14} />
          </button>
        </>
      )}
    </div>
  );
}
