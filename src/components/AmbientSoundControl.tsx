import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const AmbientSoundControl: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const { t } = useLanguage();

  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const sizzleTimerRef = useRef<number | null>(null);
  const kitchenTimerRef = useRef<number | null>(null);

  const stopSoundscape = () => {
    if (sizzleTimerRef.current) {
      window.clearTimeout(sizzleTimerRef.current);
      sizzleTimerRef.current = null;
    }
    if (kitchenTimerRef.current) {
      window.clearTimeout(kitchenTimerRef.current);
      kitchenTimerRef.current = null;
    }

    const ctx = audioCtxRef.current;
    const master = masterGainRef.current;
    if (ctx && master && ctx.state === 'running') {
      try {
        const now = ctx.currentTime;
        master.gain.cancelScheduledValues(now);
        master.gain.setValueAtTime(master.gain.value, now);
        master.gain.linearRampToValueAtTime(0.0001, now + 0.45);
        window.setTimeout(() => {
          if (ctx.state === 'running') {
            ctx.suspend().catch(() => {});
          }
        }, 480);
      } catch {
        ctx.suspend().catch(() => {});
      }
    }
  };

  const startSoundscape = async () => {
    try {
      const AudioContextClass =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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

        // Create a 4-second looping pink/brown noise buffer for room tone & gentle simmering
        const sampleRate = ctx.sampleRate;
        const bufferLength = sampleRate * 4;
        const pinkBuffer = ctx.createBuffer(1, bufferLength, sampleRate);
        const pinkData = pinkBuffer.getChannelData(0);

        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferLength; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          pinkData[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
          b6 = white * 0.115926;
        }

        // Layer 1: Warm Restaurant Dining Room Ambience (low-passed warm room murmur)
        const roomSource = ctx.createBufferSource();
        roomSource.buffer = pinkBuffer;
        roomSource.loop = true;

        const roomFilter = ctx.createBiquadFilter();
        roomFilter.type = 'lowpass';
        roomFilter.frequency.setValueAtTime(290, ctx.currentTime);

        const roomGain = ctx.createGain();
        roomGain.gain.setValueAtTime(0.45, ctx.currentTime);

        roomSource.connect(roomFilter);
        roomFilter.connect(roomGain);
        roomGain.connect(master);
        roomSource.start();

        // Layer 2: Continuous Faint Tawa Simmer Bed
        const simmerSource = ctx.createBufferSource();
        simmerSource.buffer = pinkBuffer;
        simmerSource.loop = true;

        const simmerBand = ctx.createBiquadFilter();
        simmerBand.type = 'bandpass';
        simmerBand.frequency.setValueAtTime(2600, ctx.currentTime);
        simmerBand.Q.setValueAtTime(1.2, ctx.currentTime);

        const simmerLowpass = ctx.createBiquadFilter();
        simmerLowpass.type = 'lowpass';
        simmerLowpass.frequency.setValueAtTime(4400, ctx.currentTime);

        const simmerGain = ctx.createGain();
        simmerGain.gain.setValueAtTime(0.16, ctx.currentTime);

        // Slow LFO to make the simmering breathe naturally
        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.24, ctx.currentTime);
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(0.05, ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(simmerGain.gain);
        lfo.start();

        simmerSource.connect(simmerBand);
        simmerBand.connect(simmerLowpass);
        simmerLowpass.connect(simmerGain);
        simmerGain.connect(master);
        simmerSource.start();
      }

      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      // Smoothly ramp master volume to a whisper-quiet level (~0.032)
      if (master) {
        const now = ctx.currentTime;
        master.gain.cancelScheduledValues(now);
        master.gain.setValueAtTime(Math.max(0.0001, master.gain.value), now);
        master.gain.linearRampToValueAtTime(0.032, now + 1.4);
      }

      // Layer 3: Gentle Tawa Sizzle Micro-Droplets
      const scheduleSizzleDroplet = () => {
        const activeCtx = audioCtxRef.current;
        const activeMaster = masterGainRef.current;
        if (!activeCtx || !activeMaster || activeCtx.state !== 'running') return;

        const now = activeCtx.currentTime;
        const dur = 0.014 + Math.random() * 0.022;
        const bufSize = Math.floor(activeCtx.sampleRate * dur);
        const dropBuf = activeCtx.createBuffer(1, bufSize, activeCtx.sampleRate);
        const data = dropBuf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.sin((Math.PI * i) / bufSize);
        }

        const src = activeCtx.createBufferSource();
        src.buffer = dropBuf;

        const bp = activeCtx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(2800 + Math.random() * 2400, now);
        bp.Q.setValueAtTime(2.2, now);

        const g = activeCtx.createGain();
        g.gain.setValueAtTime(0.06 + Math.random() * 0.08, now);

        src.connect(bp);
        bp.connect(g);
        g.connect(activeMaster);
        src.start(now);

        sizzleTimerRef.current = window.setTimeout(
          scheduleSizzleDroplet,
          90 + Math.random() * 240
        );
      };

      // Layer 4: Faint Distant Kitchen Activity (subtle warm ceramic/spoon touch)
      const scheduleKitchenTouch = () => {
        const activeCtx = audioCtxRef.current;
        const activeMaster = masterGainRef.current;
        if (!activeCtx || !activeMaster || activeCtx.state !== 'running') return;

        const now = activeCtx.currentTime;
        const osc = activeCtx.createOscillator();
        const baseFreq = 980 + Math.random() * 620;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, now);

        const lp = activeCtx.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.setValueAtTime(1100, now);

        const env = activeCtx.createGain();
        env.gain.setValueAtTime(0.0001, now);
        env.gain.exponentialRampToValueAtTime(0.022, now + 0.008);
        env.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

        osc.connect(lp);
        lp.connect(env);
        env.connect(activeMaster);
        osc.start(now);
        osc.stop(now + 0.15);

        kitchenTimerRef.current = window.setTimeout(
          scheduleKitchenTouch,
          3800 + Math.random() * 5200
        );
      };

      scheduleSizzleDroplet();
      scheduleKitchenTouch();
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
      stopSoundscape();
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
