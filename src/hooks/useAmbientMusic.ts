import { useCallback, useEffect, useRef, useState } from 'react';
import { invitation } from '../config/invitation';

interface Engine {
  play: () => Promise<void>;
  pause: () => void;
  dispose: () => void;
}

/** Plays an audio file from /public with gentle fades. */
function fileEngine(src: string, volume: number): Engine {
  const audio = new Audio(src);
  audio.loop = true;
  audio.preload = 'auto';
  audio.volume = 0;
  let fade = 0;
  const fadeTo = (v: number, done?: () => void) => {
    window.clearInterval(fade);
    fade = window.setInterval(() => {
      const next = audio.volume + (v > audio.volume ? 0.04 : -0.06);
      if ((v > audio.volume && next >= v) || (v <= audio.volume && next <= v)) {
        audio.volume = Math.max(0, Math.min(1, v));
        window.clearInterval(fade);
        done?.();
      } else audio.volume = Math.max(0, Math.min(1, next));
    }, 60);
  };
  return {
    play: async () => {
      await audio.play();
      fadeTo(volume);
    },
    pause: () => fadeTo(0, () => audio.pause()),
    dispose: () => {
      window.clearInterval(fade);
      audio.pause();
      audio.src = '';
    },
  };
}

/** A soft, generated music-box melody (used when no audio file is configured). */
function musicBoxEngine(volume: number): Engine {
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new Ctx();
  const master = ctx.createGain();
  master.gain.value = 0;
  const tone = ctx.createBiquadFilter();
  tone.type = 'lowpass';
  tone.frequency.value = 2400;
  const delay = ctx.createDelay(1);
  delay.delayTime.value = 0.46;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.36;
  const wet = ctx.createGain();
  wet.gain.value = 0.32;
  tone.connect(master);
  tone.connect(delay);
  delay.connect(feedback).connect(delay);
  delay.connect(wet).connect(master);
  master.connect(ctx.destination);

  const hz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);
  // I – vi – IV – V  in F major, voiced gently
  const chords = [
    [53, 60, 65, 69, 72],
    [50, 57, 62, 65, 69],
    [46, 53, 58, 62, 65],
    [48, 55, 60, 64, 67],
  ];
  const pattern = [1, 2, 3, 4, 3, 2, 3, 1];
  const melody = [null, 77, null, 76, 74, null, 72, null, 74, null, 72, 69, null, 70, 72, null] as (number | null)[];
  const step = 0.42;

  const bell = (midi: number, t: number, amp: number) => {
    const f = hz(midi);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(amp, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6);
    g.connect(tone);
    [
      [1, 1],
      [2, 0.18],
      [3.01, 0.06],
    ].forEach(([mult, a]) => {
      const o = ctx.createOscillator();
      const og = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = f * mult;
      og.gain.value = a;
      o.connect(og).connect(g);
      o.start(t);
      o.stop(t + 2.7);
    });
  };
  const pad = (midi: number, t: number) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'triangle';
    o.frequency.value = hz(midi - 12);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.045, t + 0.8);
    g.gain.linearRampToValueAtTime(0.0001, t + step * 8 + 0.4);
    o.connect(g).connect(tone);
    o.start(t);
    o.stop(t + step * 8 + 0.5);
  };

  let n = 0;
  let next = 0;
  const tick = () => {
    if (ctx.state !== 'running') return;
    if (next < ctx.currentTime) next = ctx.currentTime + 0.05;
    while (next < ctx.currentTime + 0.35) {
      const chord = chords[Math.floor(n / 8) % chords.length];
      if (n % 8 === 0) pad(chord[0], next);
      bell(chord[pattern[n % 8]], next, 0.11);
      const m = melody[n % melody.length];
      if (m && n >= 16) bell(m, next + 0.01, 0.08);
      n++;
      next += step;
    }
  };
  const timer = window.setInterval(tick, 90);

  const ramp = (v: number, secs: number) => {
    const t = ctx.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(master.gain.value, t);
    master.gain.linearRampToValueAtTime(v, t + secs);
  };

  let suspendTimer = 0;
  return {
    play: async () => {
      window.clearTimeout(suspendTimer);
      await ctx.resume();
      ramp(volume, 1.6);
      tick();
    },
    pause: () => {
      ramp(0, 0.6);
      suspendTimer = window.setTimeout(() => ctx.suspend(), 650);
    },
    dispose: () => {
      window.clearInterval(timer);
      window.clearTimeout(suspendTimer);
      ctx.close();
    },
  };
}

export function useAmbientMusic() {
  const { src, volume } = invitation.music;
  const engine = useRef<Engine | null>(null);
  const [playing, setPlaying] = useState(false);
  const wantPlaying = useRef(false);

  const getEngine = () => {
    if (!engine.current) engine.current = src ? fileEngine(src, volume) : musicBoxEngine(volume);
    return engine.current;
  };

  const play = useCallback(async () => {
    try {
      wantPlaying.current = true;
      await getEngine().play();
      setPlaying(true);
    } catch (e) {
      console.warn('[music] could not start', e);
      wantPlaying.current = false;
      setPlaying(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pause = useCallback(() => {
    wantPlaying.current = false;
    engine.current?.pause();
    setPlaying(false);
  }, []);

  const toggle = useCallback(() => (wantPlaying.current ? pause() : play()), [play, pause]);

  // Pause quietly while the tab/app is in the background; resume on return.
  useEffect(() => {
    const onVis = () => {
      if (!engine.current) return;
      if (document.hidden) engine.current.pause();
      else if (wantPlaying.current) engine.current.play().catch(() => setPlaying(false));
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      document.removeEventListener('visibilitychange', onVis);
      engine.current?.dispose();
      engine.current = null;
    };
  }, []);

  return { playing, play, pause, toggle };
}
