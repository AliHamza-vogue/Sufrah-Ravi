import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { KITCHEN_SIZZLE_SIMMER_AUDIO_URI } from '../data/kitchenAudioData';

export const AmbientSoundControl: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const { t } = useLanguage();

  const isPlayingRef = useRef(true);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const decodedBufferRef = useRef<AudioBuffer | null>(null);
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const fallbackAudioRef = useRef<HTMLAudioElement | null>(null);
  const isStartingRef = useRef(false);

  const stopSoundscape = () => {
    const ctx = audioCtxRef.current;
    const master = masterGainRef.current;

    if (ctx && master && ctx.state === 'running') {
      try {
        const now = ctx.currentTime;
        master.gain.cancelScheduledValues(now);
        master.gain.setValueAtTime(master.gain.value, now);
        master.gain.linearRampToValueAtTime(0.0001, now + 0.35);
        window.setTimeout(() => {
          if (!isPlayingRef.current && ctx.state === 'running') {
            ctx.suspend().catch(() => {});
          }
        }, 380);
      } catch {
        ctx.suspend().catch(() => {});
      }
    }

    if (fallbackAudioRef.current) {
      fallbackAudioRef.current.pause();
    }
  };

  const startSoundscape = async () => {
    if (!isPlayingRef.current || isStartingRef.current) return;
    isStartingRef.current = true;

    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

      if (AudioContextClass) {
        let ctx = audioCtxRef.current;
        let master = masterGainRef.current;

        if (!ctx) {
          ctx = new AudioContextClass();
          audioCtxRef.current = ctx;

          master = ctx.createGain();
          master.gain.setValueAtTime(0.0001, ctx.currentTime);
          master.connect(ctx.destination);
          masterGainRef.current = master;
        }

        if (!decodedBufferRef.current) {
          const base64Part = KITCHEN_SIZZLE_SIMMER_AUDIO_URI.split(',')[1];
          const binaryString = window.atob(base64Part);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          decodedBufferRef.current = await ctx.decodeAudioData(bytes.buffer.slice(0));
        }

        if (ctx.state === 'suspended') {
          await ctx.resume().catch(() => {});
        }

        if (!activeSourceRef.current && decodedBufferRef.current && master) {
          const source = ctx.createBufferSource();
          source.buffer = decodedBufferRef.current;
          source.loop = true;

          const dur = decodedBufferRef.current.duration;
          if (dur > 2) {
            source.loopStart = 0.05;
            source.loopEnd = dur - 0.05;
          }

          source.connect(master);
          source.start(0, 0.05);
          activeSourceRef.current = source;
        }

        if (master && isPlayingRef.current) {
          const now = ctx.currentTime;
          master.gain.cancelScheduledValues(now);
          master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), now);
          master.gain.linearRampToValueAtTime(0.48, now + 0.6);
        }
        isStartingRef.current = false;
        return;
      }
    } catch {
      // Fallback to standard HTMLAudioElement if Web Audio decode fails
    }

    try {
      if (!fallbackAudioRef.current) {
        const audio = new Audio(KITCHEN_SIZZLE_SIMMER_AUDIO_URI);
        audio.loop = true;
        audio.volume = 0.4;
        fallbackAudioRef.current = audio;
      }
      if (isPlayingRef.current) {
        await fallbackAudioRef.current.play().catch(() => {});
      }
    } catch {
      // Ignore autoplay errors until first gesture
    } finally {
      isStartingRef.current = false;
    }
  };

  const handleToggle = () => {
    if (isPlaying) {
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
    // Start audio immediately by default on mount
    startSoundscape();

    // If browser autoplay policy suspends AudioContext before first gesture,
    // resume automatically on the user's very first interaction (if still enabled)
    const unlockAudioOnGesture = () => {
      if (!isPlayingRef.current) return;
      const ctx = audioCtxRef.current;
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().then(() => {
          startSoundscape();
        }).catch(() => {});
      } else if (!activeSourceRef.current) {
        startSoundscape();
      }
    };

    const events = ['pointerdown', 'touchstart', 'keydown', 'click', 'scroll'] as const;
    events.forEach((evt) =>
      window.addEventListener(evt, unlockAudioOnGesture, { passive: true })
    );

    return () => {
      events.forEach((evt) =>
        window.removeEventListener(evt, unlockAudioOnGesture)
      );
      if (activeSourceRef.current) {
        try {
          activeSourceRef.current.stop();
        } catch {
          // ignore
        }
      }
      if (fallbackAudioRef.current) {
        fallbackAudioRef.current.pause();
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="fixed bottom-4 left-4 rtl:left-auto rtl:right-4 z-40">
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
