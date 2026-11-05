import React from 'react';

interface DishSteamProps {
  variant?: 'card' | 'hero';
  seed?: number;
}

export const DishSteam: React.FC<DishSteamProps> = ({ variant = 'card', seed = 0 }) => {
  const delayOffset = (seed % 6) * 0.45;

  // Start the steam higher up (above the main food portion) so the dish itself stays crisp and unblurred,
  // while the rising wavy steam drifts upward past the top edge of the card.
  const containerClass =
    variant === 'hero'
      ? '-top-28 bottom-[58%] inset-x-0'
      : '-top-24 bottom-[56%] inset-x-0';

  const wispHeight = variant === 'hero' ? 'h-28' : 'h-24';

  const streams = [
    {
      className: 'steam-css-wave-1',
      left: '26%',
      width: 'w-12',
      delay: -(0.2 + delayOffset),
      curve: 'M28 130 C14 98, 42 66, 24 34 C16 18, 32 8, 28 0',
    },
    {
      className: 'steam-css-wave-2',
      left: '41%',
      width: 'w-14',
      delay: -(1.6 + delayOffset),
      curve: 'M30 132 C46 96, 14 62, 34 30 C42 16, 24 6, 30 0',
    },
    {
      className: 'steam-css-wave-3',
      left: '56%',
      width: 'w-12',
      delay: -(2.9 + delayOffset),
      curve: 'M26 128 C12 94, 40 60, 22 28 C14 14, 30 6, 26 0',
    },
    {
      className: 'steam-css-wave-4',
      left: '34%',
      width: 'w-14',
      delay: -(0.9 + delayOffset),
      curve: 'M30 130 C44 96, 16 64, 32 32 C40 16, 22 6, 28 0',
    },
    {
      className: 'steam-css-wave-5',
      left: '49%',
      width: 'w-14',
      delay: -(2.3 + delayOffset),
      curve: 'M28 130 C14 96, 42 64, 24 32 C16 16, 32 6, 28 0',
    },
    {
      className: 'steam-css-wave-6',
      left: '38%',
      width: 'w-16',
      delay: -(3.5 + delayOffset),
      curve: 'M30 132 C46 98, 14 64, 34 32 C42 16, 24 6, 30 0',
    },
  ];

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute ${containerClass} overflow-visible z-30 select-none`}
    >
      {streams.map((stream, idx) => (
        <div
          key={idx}
          className={`${stream.className} absolute bottom-0 ${stream.width} ${wispHeight} flex items-center justify-center overflow-visible`}
          style={{
            left: stream.left,
            animationDelay: `${stream.delay.toFixed(2)}s`,
          }}
        >
          {/* Subtle airy glow only in the upper portion of the steam */}
          <div
            className="absolute inset-x-0 top-0 bottom-6 rounded-full blur-[10px]"
            style={{
              background:
                'radial-gradient(ellipse at 50% 40%, rgba(255, 255, 255, 0.34) 0%, rgba(252, 249, 244, 0.14) 50%, rgba(255, 255, 255, 0) 78%)',
            }}
          />

          {/* Non-distorted wavy steam ribbon */}
          <svg
            viewBox="0 0 60 135"
            className="w-full h-full overflow-visible blur-[4px] opacity-85"
            fill="none"
          >
            <path
              d={stream.curve}
              stroke="rgba(255, 255, 255, 0.65)"
              strokeWidth="8"
              strokeLinecap="round"
            />
          </svg>
        </div>
      ))}
    </div>
  );
};
