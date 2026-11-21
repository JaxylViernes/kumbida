import { AnimatePresence, MotionConfig } from 'framer-motion';
import { useMemo, useState } from 'react';
import { Butterflies, DriftingPetals, GoldDust } from './components/Ambient';
import { AppContext } from './components/bookContext';
import { SvgDefs } from './components/botanicals/SvgDefs';
import { CinematicIntro } from './components/CinematicIntro';
import { Envelope } from './components/Envelope';
import { InvitationBook } from './components/InvitationBook';
import { MusicControl } from './components/MusicControl';
import { invitation } from './config/invitation';
import { useAmbientMusic } from './hooks/useAmbientMusic';

type Stage = 'envelope' | 'film' | 'book';

export default function App() {
  const [stage, setStage] = useState<Stage>('envelope');
  const [replaying, setReplaying] = useState(false);
  const music = useAmbientMusic();
  const filmOn = invitation.intro.enabled;

  const app = useMemo(
    () => ({
      music: { playing: music.playing, play: music.play, pause: music.pause },
      replayFilm: filmOn ? () => setReplaying(true) : null,
    }),
    [music.playing, music.play, music.pause, filmOn],
  );

  return (
    <MotionConfig reducedMotion="user">
      <AppContext.Provider value={app}>
        <SvgDefs />
        <div className="desk" aria-hidden="true" />
        <GoldDust count={14} />
        <DriftingPetals count={stage === 'book' ? 7 : 10} />
        <Butterflies />

        <main className="relative h-full w-full overflow-hidden">
          <AnimatePresence>
            {stage === 'envelope' && (
              <Envelope
                key="envelope"
                onOpenStart={() => {
                  // The tap on the envelope is a user gesture, so starting audio here is allowed.
                  if (invitation.music.startOnOpen) music.play();
                }}
                onOpened={() => setStage(filmOn ? 'film' : 'book')}
              />
            )}
          </AnimatePresence>
          {/* The book stays mounted while a replayed film plays, so the guest returns to the same page. */}
          {stage === 'book' && <InvitationBook />}
        </main>

        <AnimatePresence>
          {stage === 'film' && <CinematicIntro key="film" onDone={() => setStage('book')} />}
          {replaying && <CinematicIntro key="replay" onDone={() => setReplaying(false)} />}
        </AnimatePresence>

        <MusicControl playing={music.playing} onToggle={music.toggle} />
      </AppContext.Provider>
    </MotionConfig>
  );
}
