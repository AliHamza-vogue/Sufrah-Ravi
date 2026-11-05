import React from 'react';

interface DishSteamProps {
  variant?: 'card' | 'hero';
}

export const DishSteam: React.FC<DishSteamProps> = ({ variant = 'card' }) => {
  const heightClass = variant === 'hero' ? 'h-56' : 'h-40';

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-0 bottom-4 ${heightClass} overflow-hidden z-10 select-none opacity-90 group-hover:opacity-100 transition-opacity duration-500`}
    >
      {/* Left Wisp & Vapor Plume */}
      <div className="steam-plume-1 absolute bottom-1 left-[26%] w-16 h-28 flex items-center justify-center">
        <div
          className="w-12 h-24 rounded-full blur-[11px]"
          style={{
            background:
              'radial-gradient(ellipse at 50% 60%, rgba(255,255,255,0.62) 0%, rgba(250,245,238,0.32) 45%, rgba(255,255,255,0) 75%)',
          }}
        />
        <svg
          viewBox="0 0 60 120"
          className="absolute inset-0 w-full h-full blur-[4.5px] opacity-80"
          fill="none"
        >
          <path
            d="M32 110 C16 84, 44 58, 24 30 C16 18, 28 8, 30 2"
            stroke="rgba(255, 255, 255, 0.65)"
            strokeWidth="7"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Center Primary Billowing Plume */}
      <div className="steam-plume-2 absolute bottom-0 left-[42%] w-20 h-32 flex items-center justify-center">
        <div
          className="w-16 h-28 rounded-full blur-[13px]"
          style={{
            background:
              'radial-gradient(ellipse at 50% 55%, rgba(255,255,255,0.72) 0%, rgba(248,244,236,0.38) 48%, rgba(255,255,255,0) 78%)',
          }}
        />
        <svg
          viewBox="0 0 60 120"
          className="absolute inset-0 w-full h-full blur-[5px] opacity-85"
          fill="none"
        >
          <path
            d="M28 112 C46 82, 14 54, 34 26 C42 15, 28 6, 26 2"
            stroke="rgba(255, 255, 255, 0.72)"
            strokeWidth="8"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Right Wisp & Vapor Plume */}
      <div className="steam-plume-3 absolute bottom-2 left-[58%] w-16 h-28 flex items-center justify-center">
        <div
          className="w-12 h-24 rounded-full blur-[11px]"
          style={{
            background:
              'radial-gradient(ellipse at 50% 60%, rgba(255,255,255,0.58) 0%, rgba(250,245,238,0.28) 45%, rgba(255,255,255,0) 75%)',
          }}
        />
        <svg
          viewBox="0 0 60 120"
          className="absolute inset-0 w-full h-full blur-[4.5px] opacity-75"
          fill="none"
        >
          <path
            d="M26 108 C12 80, 42 52, 22 24 C16 14, 28 6, 30 2"
            stroke="rgba(255, 255, 255, 0.6)"
            strokeWidth="6.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Secondary Inner Curling Wisp */}
      <div className="steam-plume-4 absolute bottom-1 left-[35%] w-14 h-26 flex items-center justify-center">
        <div
          className="w-11 h-20 rounded-full blur-[10px]"
          style={{
            background:
              'radial-gradient(ellipse at 50% 65%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.24) 50%, rgba(255,255,255,0) 80%)',
          }}
        />
      </div>

      {/* Secondary Outer Right Wisp */}
      <div className="steam-plume-5 absolute bottom-1 left-[50%] w-14 h-28 flex items-center justify-center">
        <div
          className="w-12 h-22 rounded-full blur-[12px]"
          style={{
            background:
              'radial-gradient(ellipse at 50% 60%, rgba(255,255,255,0.52) 0%, rgba(255,255,255,0.22) 50%, rgba(255,255,255,0) 80%)',
          }}
        />
      </div>
    </div>
  );
};
