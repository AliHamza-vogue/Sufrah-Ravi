import React from 'react';

interface DishSteamProps {
  variant?: 'card' | 'hero';
  seed?: number;
}

export const DishSteam: React.FC<DishSteamProps> = ({ variant = 'card', seed = 0 }) => {
  const filterId = `dish-steam-filter-${variant}-${seed}`;
  const gradId = `dish-steam-grad-${variant}-${seed}`;
  const baseOffset = (seed % 7) * 0.45;

  // Positioned so the steam originates on the dish surface and extends 65-80px ABOVE the top border of the image
  const containerBounds =
    variant === 'hero'
      ? '-top-20 bottom-8 -inset-x-4'
      : '-top-16 bottom-6 -inset-x-2';

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute ${containerBounds} overflow-visible z-30 select-none`}
    >
      {/* Shared SVG filter that organically ripples and blurs the rising steam wisps */}
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <defs>
          <filter id={filterId} x="-40%" y="-40%" width="180%" height="180%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.018 0.032"
              numOctaves="3"
              seed={seed + 5}
              result="noise"
            >
              <animate
                attributeName="baseFrequency"
                values="0.016 0.028;0.024 0.042;0.016 0.028"
                dur={`${6.5 + (seed % 3)}s`}
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="18"
              xChannelSelector="R"
              yChannelSelector="G"
              result="displaced"
            />
            <feGaussianBlur in="displaced" stdDeviation="4.2" />
          </filter>

          <linearGradient id={gradId} x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0)" />
            <stop offset="22%" stopColor="rgba(255, 252, 246, 0.58)" />
            <stop offset="58%" stopColor="rgba(255, 255, 255, 0.72)" />
            <stop offset="85%" stopColor="rgba(255, 255, 255, 0.38)" />
            <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
          </linearGradient>
        </defs>
      </svg>

      {/* Stream 1: Left-center sinuous wavy plume extending past top edge */}
      <div
        className="wavy-steam-1 absolute bottom-0 left-[22%] w-24 h-44 flex items-center justify-center"
        style={{ animationDelay: `${-(0.3 + baseOffset)}s` }}
      >
        <svg
          viewBox="0 0 100 200"
          className="w-full h-full overflow-visible"
          style={{ filter: `url(#${filterId})` }}
          fill="none"
        >
          <path
            d="M52 188 C28 152, 74 118, 42 82 C16 50, 68 22, 44 -12"
            stroke={`url(#${gradId})`}
            strokeWidth="15"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Stream 2: Primary central billowing wavy steam rising well above image top */}
      <div
        className="wavy-steam-2 absolute bottom-2 left-[36%] w-28 h-48 flex items-center justify-center"
        style={{ animationDelay: `${-(1.9 + baseOffset)}s` }}
      >
        <svg
          viewBox="0 0 100 200"
          className="w-full h-full overflow-visible"
          style={{ filter: `url(#${filterId})` }}
          fill="none"
        >
          <path
            d="M48 192 C76 154, 22 114, 56 76 C82 44, 30 16, 54 -18"
            stroke={`url(#${gradId})`}
            strokeWidth="18"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Stream 3: Right-center curling steam wisp */}
      <div
        className="wavy-steam-3 absolute bottom-0 left-[52%] w-24 h-44 flex items-center justify-center"
        style={{ animationDelay: `${-(3.2 + baseOffset)}s` }}
      >
        <svg
          viewBox="0 0 100 200"
          className="w-full h-full overflow-visible"
          style={{ filter: `url(#${filterId})` }}
          fill="none"
        >
          <path
            d="M46 186 C22 148, 70 112, 38 74 C18 44, 64 18, 42 -14"
            stroke={`url(#${gradId})`}
            strokeWidth="14"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Stream 4: Soft ambient vapor cloud that drifts past the top border */}
      <div
        className="wavy-steam-4 absolute bottom-3 left-[30%] w-28 h-44 flex items-center justify-center"
        style={{ animationDelay: `${-(1.1 + baseOffset)}s` }}
      >
        <div
          className="w-20 h-36 rounded-full blur-[16px]"
          style={{
            background:
              'radial-gradient(ellipse at 50% 55%, rgba(255,255,255,0.48) 0%, rgba(252,248,240,0.24) 52%, rgba(255,255,255,0) 80%)',
          }}
        />
      </div>

      {/* Stream 5: Secondary right-side ambient vapor wisp */}
      <div
        className="wavy-steam-5 absolute bottom-2 left-[46%] w-24 h-44 flex items-center justify-center"
        style={{ animationDelay: `${-(2.5 + baseOffset)}s` }}
      >
        <div
          className="w-18 h-34 rounded-full blur-[15px]"
          style={{
            background:
              'radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.44) 0%, rgba(252,248,240,0.20) 52%, rgba(255,255,255,0) 78%)',
          }}
        />
      </div>
    </div>
  );
};
