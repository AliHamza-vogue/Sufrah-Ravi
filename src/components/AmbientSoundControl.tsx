import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const AmbientSoundControl: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const { t } = useLanguage();

  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const smoothNoiseBufRef = useRef<AudioBuffer | null>(null);
  const stirTimerRef = useRef<number | null>(null);
  const bubbleTimerRef = useRef<number | null>(null);

  const clearTimers = () => {
    if (stirTimerRef.current) {
      window.clearTimeout(stirTimerRef.current);
      stirTimerRef.current = null;
    }
    if (bubbleTimerRef.current) {
      window.clearTimeout(bubbleTimerRef.current);
      bubbleTimerRef.current = null;
    }
  };

  const stopSoundscape = () => {
    clearTimers();
    const ctx = audioCtxRef.current;
    const master = masterGainRef.current;
    if (ctx && master && ctx.state === 'running') {
      try {
        const now = ctx.currentTime;
        master.gain.cancelScheduledValues(now);
        master.gain.setValueAtTime(master.gain.value, now);
        master.gain.linearRampToValueAtTime(0.0001, now + 0.35);
        window.setTimeout(() => {
          if (ctx.state === 'running') {
            ctx.suspend().catch(() => {});
          }
        }, 380);
      } catch {
        ctx.suspend().catch(() => {});
      }
    }
  };

  const startSoundscape = async () => {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;

      let ctx = audioCtxRef.current;
      let master = masterGainRef.current;

      if (!ctx) {
        ctx = new AudioContextClass();
        audioCtxRef.current = ctx;

        master = ctx.createGain();
        master.gain.setValueAtTime(0.0001, ctx.currentTime);
        master.connect(ctx.destination);
        masterGainRef.current = master;

        // Precompute a silky-smooth low-frequency velvet buffer (no harsh white noise static)
        const sampleRate = ctx.sampleRate;
        const bufLen = sampleRate * 3;
        const buf = ctx.createBuffer(1, bufLen, sampleRate);
        const data = buf.getChannelData(0);
        let prev = 0;
        let prev2 = 0;
        for (let i = 0; i < bufLen; i++) {
          const raw = Math.random() * 2 - 1;
          // Double low-pass smoothing so the friction texture feels like smooth metal/wood on a clay/copper pot
          prev = prev * 0.94 + raw * 0.06;
          prev2 = prev2 * 0.92 + prev * 0.08;
          data[i] = prev2 * 1.8;
        }
        smoothNoiseBufRef.current = buf;
      }

      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      if (master) {
        const now = ctx.currentTime;
        master.gain.cancelScheduledValues(now);
        master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), now);
        master.gain.linearRampToValueAtTime(0.24, now + 0.8);
      }

      /**
       * Acoustic synthesis of a Doi (cooking ladle) moving in circular strokes inside a Handi (pot):
       * - Resonant pot body cavity (hollow warm formant sweep 280Hz -> 440Hz -> 310Hz)
       * - Gentle metallic/wooden ladle sliding & turning thick gravy against the curved inner wall
       * - Occasional soft ladle rim tap when finishing a stir cycle
       */
      const triggerDoiStroke = (duration: number, intensity: number, pitchOffset: number) => {
        const activeCtx = audioCtxRef.current;
        const activeMaster = masterGainRef.current;
        const noiseBuf = smoothNoiseBufRef.current;
        if (!activeCtx || !activeMaster || !noiseBuf || activeCtx.state !== 'running') return;

        const now = activeCtx.currentTime;

        const src = activeCtx.createBufferSource();
        src.buffer = noiseBuf;
        src.loop = true;

        // Resonant cavity filter #1: The hollow body of the Handi pot
        const handiBodyFilter = activeCtx.createBiquadFilter();
        handiBodyFilter.type = 'bandpass';
        handiBodyFilter.Q.setValueAtTime(3.8, now);
        handiBodyFilter.frequency.setValueAtTime(260 + pitchOffset, now);
        handiBodyFilter.frequency.exponentialRampToValueAtTime(
          440 + pitchOffset,
          now + duration * 0.48
        );
        handiBodyFilter.frequency.exponentialRampToValueAtTime(
          280 + pitchOffset,
          now + duration
        );

        // Resonant filter #2: The Doi ladle sliding against the inner wall & turning thick masala
        const doiScrapeFilter = activeCtx.createBiquadFilter();
        doiScrapeFilter.type = 'bandpass';
        doiScrapeFilter.Q.setValueAtTime(5.2, now);
        doiScrapeFilter.frequency.setValueAtTime(660 + pitchOffset * 1.4, now);
        doiScrapeFilter.frequency.exponentialRampToValueAtTime(
          1020 + pitchOffset * 1.5,
          now + duration * 0.52
        );
        doiScrapeFilter.frequency.exponentialRampToValueAtTime(
          700 + pitchOffset * 1.3,
          now + duration
        );

        // Warm low-pass ceiling so it never sounds like static or distortion
        const warmthLowpass = activeCtx.createBiquadFilter();
        warmthLowpass.type = 'lowpass';
        warmthLowpass.frequency.setValueAtTime(1250, now);

        // Smooth bell-shaped stroke envelope (fade in as ladle pushes, fade out at end of circle)
        const strokeEnv = activeCtx.createGain();
        strokeEnv.gain.setValueAtTime(0.0001, now);
        strokeEnv.gain.linearRampToValueAtTime(0.62 * intensity, now + duration * 0.35);
        strokeEnv.gain.linearRampToValueAtTime(0.48 * intensity, now + duration * 0.68);
        strokeEnv.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        const scrapeGain = activeCtx.createGain();
        scrapeGain.gain.setValueAtTime(0.55, now);

        src.connect(handiBodyFilter);
        src.connect(doiScrapeFilter);
        handiBodyFilter.connect(warmthLowpass);
        doiScrapeFilter.connect(scrapeGain);
        scrapeGain.connect(warmthLowpass);
        warmthLowpass.connect(strokeEnv);
        strokeEnv.connect(activeMaster);

        const startOffset = Math.random() * 1.5;
        src.start(now, startOffset, duration + 0.05);
      };

      // Gentle resonant tap of the Doi against the Handi rim
      const triggerHandiRimTouch = () => {
        const activeCtx = audioCtxRef.current;
        const activeMaster = masterGainRef.current;
        if (!activeCtx || !activeMaster || activeCtx.state !== 'running') return;

        const now = activeCtx.currentTime;
        // Two modal frequencies of a heavy handi pot (fundamental + warm overtone)
        const freqs = [395 + Math.random() * 25, 765 + Math.random() * 35];

        freqs.forEach((f, idx) => {
          const osc = activeCtx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now);

          const env = activeCtx.createGain();
          const peak = idx === 0 ? 0.095 : 0.042;
          const decay = idx === 0 ? 0.12 : 0.065;

          env.gain.setValueAtTime(0.0001, now);
          env.gain.linearRampToValueAtTime(peak, now + 0.004);
          env.gain.exponentialRampToValueAtTime(0.0001, now + decay);

          osc.connect(env);
          env.connect(activeMaster);
          osc.start(now);
          osc.stop(now + decay + 0.01);
        });
      };

      // Rhythmic cycle of stirring a Handi with a Doi (forward swirl -> return swirl -> brief pause)
      const scheduleStirringCycle = () => {
        const activeCtx = audioCtxRef.current;
        if (!activeCtx || activeCtx.state !== 'running') return;

        const strokeDur = 0.52 + Math.random() * 0.18;
        triggerDoiStroke(strokeDur, 0.95, 0);

        // Second half of the circular stirring motion
        window.setTimeout(() => {
          if (audioCtxRef.current?.state === 'running') {
            triggerDoiStroke(0.46 + Math.random() * 0.16, 0.75, -35);
          }
        }, Math.floor((strokeDur + 0.12) * 1000));

        // Occasional gentle rim touch at the end of a stir
        if (Math.random() < 0.45) {
          window.setTimeout(() => {
            if (audioCtxRef.current?.state === 'running') {
              triggerHandiRimTouch();
            }
          }, Math.floor((strokeDur * 2 + 0.22) * 1000));
        }

        stirTimerRef.current = window.setTimeout(
          scheduleStirringCycle,
          1650 + Math.random() * 950
        );
      };

      // Soft, warm bubbling of thick Qorma / Daal gravy ("blub... blub...") inside the Handi
      const scheduleGravyBubble = () => {
        const activeCtx = audioCtxRef.current;
        const activeMaster = masterGainRef.current;
        if (!activeCtx || !activeMaster || activeCtx.state !== 'running') return;

        const now = activeCtx.currentTime;
        const bubbleDur = 0.055 + Math.random() * 0.035;
        const startFreq = 145 + Math.random() * 75;
        const endFreq = startFreq * (1.65 + Math.random() * 0.35);

        const osc = activeCtx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(endFreq, now + bubbleDur);

        const env = activeCtx.createGain();
        env.gain.setValueAtTime(0.0001, now);
        env.gain.linearRampToValueAtTime(0.065 + Math.random() * 0.035, now + bubbleDur * 0.35);
        env.gain.exponentialRampToValueAtTime(0.0001, now + bubbleDur);

        osc.connect(env);
        env.connect(activeMaster);
        osc.start(now);
        osc.stop(now + bubbleDur + 0.01);

        // Sometimes a double bubble pops together in thick curry
        if (Math.random() < 0.4) {
          const secondDelay = 0.07 + Math.random() * 0.06;
          const osc2 = activeCtx.createOscillator();
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(startFreq * 1.12, now + secondDelay);
          osc2.frequency.exponentialRampToValueAtTime(
            endFreq * 1.15,
            now + secondDelay + bubbleDur * 0.85
          );

          const env2 = activeCtx.createGain();
          env2.gain.setValueAtTime(0.0001, now + secondDelay);
          env2.gain.linearRampToValueAtTime(0.048, now + secondDelay + bubbleDur * 0.3);
          env2.gain.exponentialRampToValueAtTime(
            0.0001,
            now + secondDelay + bubbleDur * 0.85
          );

          osc2.connect(env2);
          env2.connect(activeMaster);
          osc2.start(now + secondDelay);
          osc2.stop(now + secondDelay + bubbleDur);
        }

        bubbleTimerRef.current = window.setTimeout(
          scheduleGravyBubble,
          280 + Math.random() * 520
        );
      };

      clearTimers();
      scheduleStirringCycle();
      scheduleGravyBubble();
    } catch {
      setIsPlaying(false);
    }
  };

  const handleToggle = () => {
    if (isPlaying) {
      setIsPlaying(false);
      stopSoundscape();
    } else {
      setIsPlaying(true);
      startSoundscape();
    }
  };

  useEffect(() => {
    return () => {
      clearTimers();
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
