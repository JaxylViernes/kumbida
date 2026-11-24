import { motion } from 'framer-motion';
import { Mic, Pause, Play, Volume2, VolumeX, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { FilmMoment } from '../config/invitation';
import { StoryVignette } from './botanicals/Illustrations';
import { useApp } from './bookContext';

function Sprockets() {
  return (
    <div className="flex justify-between px-2 py-1.5" aria-hidden="true">
      {Array.from({ length: 11 }, (_, i) => (
        <span key={i} className="h-2 w-3 rounded-[2px] bg-[#efe6d4]/85" />
      ))}
    </div>
  );
}

/**
 * A memory from the film strip, shown like a frame held up to the light.
 * Video and voice load only when this opens. Ambient music politely pauses
 * while the couple is speaking and resumes afterwards.
 */
export function MomentViewer({ moment, onClose }: { moment: FilmMoment; onClose: () => void }) {
  const { music } = useApp();
  const video = useRef<HTMLVideoElement>(null);
  const voice = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(true);
  const [voicePlaying, setVoicePlaying] = useState(false);
  const pausedByUs = useRef(false);

  const ducking = !muted || voicePlaying;
  useEffect(() => {
    if (ducking && music.playing) {
      pausedByUs.current = true;
      music.pause();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ducking]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => {
      window.removeEventListener('keydown', k);
      voice.current?.pause();
      if (pausedByUs.current) music.play();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleVoice = () => {
    if (!moment.voice) return;
    if (!voice.current) {
      voice.current = new Audio(moment.voice);
      voice.current.onended = () => setVoicePlaying(false);
    }
    if (voicePlaying) {
      voice.current.pause();
      setVoicePlaying(false);
    } else {
      voice.current.play().then(() => setVoicePlaying(true)).catch(() => setVoicePlaying(false));
    }
  };

  return (
    <motion.div
      className="absolute inset-0 z-40 flex items-center justify-center rounded-[5px] bg-[rgba(30,28,20,.5)] px-[5%]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={moment.title}
      data-no-swipe
    >
      <motion.figure
        className="m-0 w-full max-w-[min(360px,44cqh)] overflow-hidden rounded-[3px] bg-[#2b2a22] shadow-[0_24px_50px_-16px_rgba(0,0,0,.7)]"
        initial={{ y: 40, scale: 0.9, rotate: -2, opacity: 0 }}
        animate={{ y: 0, scale: 1, rotate: 0, opacity: 1 }}
        exit={{ y: 30, scale: 0.94, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 16 }}
        onClick={(e) => e.stopPropagation()}
      >
        <Sprockets />
        <div className="film-grain relative mx-2 aspect-[4/5] overflow-hidden bg-[#ece2cf]">
          {moment.video ? (
            <video
              ref={video}
              src={moment.video}
              poster={moment.photo}
              className="h-full w-full object-cover"
              autoPlay
              muted={muted}
              loop
              playsInline
              preload="metadata"
            />
          ) : moment.photo ? (
            <motion.img
              src={moment.photo}
              alt={moment.title}
              className="h-full w-full object-cover"
              initial={{ scale: 1.08 }}
              animate={{ scale: 1 }}
              transition={{ duration: 6, ease: 'easeOut' }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_30%_30%,#fbf4ea,#ecdfcb_60%,#e2d3bb)]">
              <StoryVignette kind={moment.illustration} className="h-[80%] w-[80%]" />
            </div>
          )}
          {moment.video && (
            <button
              type="button"
              onClick={() => setMuted((m) => !m)}
              className="absolute bottom-2 right-2 flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white"
              aria-label={muted ? 'Turn sound on' : 'Mute'}
            >
              {muted ? <VolumeX size={17} /> : <Volume2 size={17} />}
            </button>
          )}
        </div>
        <Sprockets />
        <figcaption className="px-4 pb-4 pt-1 text-center">
          <p className="font-script text-[clamp(26px,8cqw,34px)] leading-tight text-[#efe6d4]">{moment.title}</p>
          <p className="mt-1 font-serif text-[15px] italic text-[#efe6d4]/80">{moment.caption}</p>
          <div className="mt-3 flex items-center justify-center gap-2">
            {moment.voice && (
              <button
                type="button"
                onClick={toggleVoice}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-full border border-[#c6a46c]/60 px-4 font-caps text-[11px] uppercase tracking-[0.2em] text-[#e9d6a8]"
              >
                {voicePlaying ? <Pause size={14} /> : <Mic size={14} />}
                {voicePlaying ? 'Pause' : 'Hear from us'}
                {!voicePlaying && <Play size={12} className="opacity-70" />}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full px-3 font-caps text-[11px] uppercase tracking-[0.2em] text-[#efe6d4]/70"
            >
              <X size={14} /> Close
            </button>
          </div>
        </figcaption>
      </motion.figure>
    </motion.div>
  );
}
