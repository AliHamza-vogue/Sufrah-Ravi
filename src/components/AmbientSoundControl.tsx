import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { KITCHEN_SIZZLE_SIMMER_AUDIO_URI } from '../data/kitchenAudioData';

const TARGET_VOLUME = 0.48;

export const AmbientSoundControl: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const { t } = useLanguage();

  const isPlayingRef = useRef(true);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const decodedBufferRef = useRef<AudioBuffer | null>(null);
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const isDecodingRef = useRef(false);
  const htmlAudioRef = useRef<HTMLAudioElement | null>(null);
  const runningSinceRef = useRef<number>(0);

  const markAudible = () => {
    if (runningSinceRef.current === 0) {
      runningSinceRef.current = performance.now();
    }
  };

  const stopSoundscape = () => {
    runningSinceRef.current = 0;

    if (htmlAudioRef.current) {
      try {
        htmlAudioRef.current.pause();
      } catch {
        // ignore
      }
    }

    const ctx = audioCtxRef.current;
    const master = masterGainRef.current;

    if (ctx && master) {
      try {
        const now = ctx.currentTime;
        master.gain.cancelScheduledValues(now);
        master.gain.setValueAtTime(master.gain.value, now);
        master.gain.linearRampToValueAtTime(0.0001, now + 0.25);
        window.setTimeout(() => {
          if (!isPlayingRef.current && ctx.state === 'running') {
            ctx.suspend().catch(() => {});
          }
        }, 280);
      } catch {
        ctx.suspend().catch(() => {});
      }
    }
  };

  const ensureWebAudioSource = (ctx: AudioContext, master: GainNode, buffer: AudioBuffer) => {
    if (activeSourceRef.current) return;
    try {
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const dur = buffer.duration;
      if (dur > 2) {
        source.loopStart = 0.05;
        source.loopEnd = dur - 0.05;
      }

      source.connect(master);
      source.onended = () => {
        if (activeSourceRef.current === source) {
          activeSourceRef.current = null;
          if (isPlayingRef.current && audioCtxRef.current && masterGainRef.current && decodedBufferRef.current) {
            ensureWebAudioSource(audioCtxRef.current, masterGainRef.current, decodedBufferRef.current);
          }
        }
      };
      source.start(0, 0.05);
      activeSourceRef.current = source;
    } catch {
      // ignore source creation errors
    }
  };

  const startSoundscape = () => {
    if (!isPlayingRef.current) return;

    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    if (AudioContextClass) {
      let ctx = audioCtxRef.current;
      let master = masterGainRef.current;

      if (!ctx) {
        try {
          ctx = new AudioContextClass();
          audioCtxRef.current = ctx;

          master = ctx.createGain();
          master.gain.setValueAtTime(TARGET_VOLUME, ctx.currentTime);
          master.connect(ctx.destination);
          masterGainRef.current = master;

          ctx.onstatechange = () => {
            if (!ctx) return;
            if (ctx.state === 'running') {
              if (!isPlayingRef.current) {
                ctx.suspend().catch(() => {});
                return;
              }
              markAudible();
              // Stop HTML5 fallback audio if WebAudio is actively running
              if (htmlAudioRef.current && !htmlAudioRef.current.paused) {
                htmlAudioRef.current.pause();
              }
              if (masterGainRef.current) {
                const now = ctx.currentTime;
                masterGainRef.current.gain.cancelScheduledValues(now);
                masterGainRef.current.gain.setValueAtTime(TARGET_VOLUME, now);
              }
            }
          };
        } catch {
          ctx = null;
        }
      }

      if (ctx && master) {
        // Non-blocking resume so execution never hangs if browser awaits user gesture
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        } else if (ctx.state === 'running') {
          markAudible();
        }

        const now = ctx.currentTime;
        master.gain.cancelScheduledValues(now);
        master.gain.setValueAtTime(TARGET_VOLUME, now);

        if (decodedBufferRef.current) {
          ensureWebAudioSource(ctx, master, decodedBufferRef.current);
        } else if (!isDecodingRef.current) {
          isDecodingRef.current = true;
          try {
            const base64Part = KITCHEN_SIZZLE_SIMMER_AUDIO_URI.split(',')[1];
            const binaryString = window.atob(base64Part);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
              bytes[i] = binaryString.charCodeAt(i);
            }
            ctx
              .decodeAudioData(bytes.buffer.slice(0))
              .then((buffer) => {
                decodedBufferRef.current = buffer;
                isDecodingRef.current = false;
                if (isPlayingRef.current && audioCtxRef.current && masterGainRef.current) {
                  ensureWebAudioSource(audioCtxRef.current, masterGainRef.current, buffer);
                  if (audioCtxRef.current.state === 'running') {
                    markAudible();
                    if (htmlAudioRef.current && !htmlAudioRef.current.paused) {
                      htmlAudioRef.current.pause();
                    }
                  }
                }
              })
              .catch(() => {
                isDecodingRef.current = false;
              });
          } catch {
            isDecodingRef.current = false;
          }
        }
      }
    }

    // If WebAudio is not running yet, also attempt HTML5 <audio> playback immediately
    const ctxState = audioCtxRef.current?.state;
    if (ctxState !== 'running' && htmlAudioRef.current && isPlayingRef.current) {
      htmlAudioRef.current.volume = TARGET_VOLUME;
      if (htmlAudioRef.current.paused) {
        htmlAudioRef.current
          .play()
          .then(() => {
            if (!isPlayingRef.current) {
              htmlAudioRef.current?.pause();
              return;
            }
            markAudible();
            if (audioCtxRef.current?.state === 'running') {
              htmlAudioRef.current?.pause();
            }
          })
          .catch(() => {
            // Browser blocked unmuted autoplay until first user interaction
          });
      }
    }
  };

  const handleToggle = () => {
    if (isPlaying) {
      // If the browser had blocked autoplay prior to this click, this click just unlocked it;
      // keep it ON and playing instead of forcing the user to click off and on again.
      const wasAlreadyAudible =
        runningSinceRef.current > 0 && performance.now() - runningSinceRef.current > 350;

      if (!wasAlreadyAudible) {
        isPlayingRef.current = true;
        setIsPlaying(true);
        startSoundscape();
        return;
      }

      isPlayingRef.current = false;
      setIsPlaying(false);
      stopSoundscape();
    } else {
      isPlayingRef.current = true;
      setIsPlaying(true);
      startSoundscape();
    }
  };

  useEffect(() => {
    if (htmlAudioRef.current) {
      htmlAudioRef.current.volume = TARGET_VOLUME;
    }

    // Start immediately on mount
    startSoundscape();

    // Unlock and resume immediately on any user interaction in capture phase
    // so no stopPropagation() on child buttons can prevent audio from starting
    const unlockOnInteraction = () => {
      if (!isPlayingRef.current) return;
      const ctx = audioCtxRef.current;
      if (!ctx || ctx.state !== 'running' || !activeSourceRef.current) {
        startSoundscape();
      }
    };

    const handleVisibilityOrFocus = () => {
      if (!isPlayingRef.current) return;
      if (document.visibilityState === 'visible') {
        startSoundscape();
      }
    };

    const interactionEvents = [
      'pointerdown',
      'pointerup',
      'mousedown',
      'mouseup',
      'touchstart',
      'touchend',
      'keydown',
      'click',
    ] as const;

    interactionEvents.forEach((evt) =>
      window.addEventListener(evt, unlockOnInteraction, { capture: true, passive: true })
    );
    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    return () => {
      interactionEvents.forEach((evt) =>
        window.removeEventListener(evt, unlockOnInteraction, { capture: true })
      );
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);

      if (activeSourceRef.current) {
        try {
          activeSourceRef.current.stop();
        } catch {
          // ignore
        }
      }
      if (htmlAudioRef.current) {
        htmlAudioRef.current.pause();
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="fixed bottom-4 left-4 rtl:left-auto rtl:right-4 z-40">
      <audio
        ref={htmlAudioRef}
        src={KITCHEN_SIZZLE_SIMMER_AUDIO_URI}
        autoPlay
        loop
        playsInline
        preload="auto"
        className="hidden"
      />
      <button
        type="button"
        onClick={handleToggle}
        aria-pressed={isPlaying}
        aria-label={isPlaying ? t('Mute kitchen ambience') : t('Unmute kitchen ambience')}
        title={isPlaying ? t('Mute kitchen ambience') : t('Unmute kitchen ambience')}
        className={`group flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium backdrop-blur-md border shadow-md transition-all duration-300 ${
          isPlaying
            ? 'bg-stone-900/85 text-amber-300 border-amber-600/50 hover:bg-stone-900'
            : 'bg-stone-900/65 text-stone-300 border-stone-700/50 hover:bg-stone-900/85 hover:text-white'
        }`}
      >
        {isPlaying ? (
          <Volume2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        ) : (
          <VolumeX className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-200 shrink-0" />
        )}
        <span className="hidden sm:inline text-[11px] tracking-wide">
          {isPlaying ? t('Ambience On') : t('Ambience Muted')}
        </span>
        {isPlaying && (
          <span className="flex items-end gap-0.5 h-2.5 px-0.5" aria-hidden="true">
            <span className="w-0.5 h-1.5 bg-amber-400/80 rounded-full animate-pulse" />
            <span className="w-0.5 h-2.5 bg-amber-400 rounded-full animate-pulse [animation-delay:180ms]" />
            <span className="w-0.5 h-1 bg-amber-400/70 rounded-full animate-pulse [animation-delay:340ms]" />
          </span>
        )}
      </button>
    </div>
  );
};
