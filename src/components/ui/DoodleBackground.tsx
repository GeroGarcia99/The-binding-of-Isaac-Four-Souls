import React from 'react';

export const DoodleBackground: React.FC = () => {
  return (
    <div
      className="absolute inset-0 pointer-events-none select-none overflow-hidden opacity-[0.14] text-stone-900"
      aria-hidden="true"
    >
      {/* Top Left: Sad/Weird Skull sketch */}
      <svg
        className="absolute top-10 left-6 sm:left-16 w-24 h-24 transform -rotate-12"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* Skull head */}
        <path d="M 25 50 C 20 20, 80 20, 75 50 C 75 65, 68 75, 62 78 L 38 78 C 32 75, 25 65, 25 50 Z" />
        {/* Left eye socket */}
        <path d="M 33 46 C 30 52, 40 56, 42 50 C 43 45, 36 41, 33 46 Z" fill="currentColor" />
        {/* Right eye socket */}
        <path d="M 58 50 C 60 56, 70 52, 67 46 C 64 41, 57 45, 58 50 Z" fill="currentColor" />
        {/* Nose triangle */}
        <path d="M 50 56 L 47 62 L 53 62 Z" fill="currentColor" />
        {/* Teeth marks */}
        <line x1="44" y1="78" x2="44" y2="86" />
        <line x1="50" y1="78" x2="50" y2="86" />
        <line x1="56" y1="78" x2="56" y2="86" />
        <line x1="38" y1="86" x2="62" y2="86" />
        {/* Tear drops */}
        <path d="M 35 60 Q 32 68 36 72 Q 40 68 37 60" />
      </svg>

      {/* Top Right: Little flying fly/insect */}
      <svg
        className="absolute top-16 right-10 sm:right-28 w-16 h-16 transform rotate-6"
        viewBox="0 0 80 80"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      >
        {/* Body */}
        <ellipse cx="40" cy="45" rx="8" ry="12" fill="currentColor" />
        {/* Wings */}
        <path d="M 36 40 C 20 25, 25 15, 36 32" strokeDasharray="1 1" />
        <path d="M 44 40 C 60 25, 55 15, 44 32" strokeDasharray="1 1" />
        {/* Flight dashes */}
        <path d="M 55 60 Q 65 50 60 40 Q 55 35 65 25" strokeDasharray="3 3" />
      </svg>

      {/* Mid Left: Sketch 6-sided die */}
      <svg
        className="absolute top-1/2 left-4 sm:left-12 -translate-y-12 w-20 h-20 transform rotate-12"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      >
        <polygon points="50,15 85,35 85,75 50,95 15,75 15,35" />
        <line x1="50" y1="15" x2="50" y2="55" />
        <line x1="15" y1="35" x2="50" y2="55" />
        <line x1="85" y1="35" x2="50" y2="55" />
        <line x1="50" y1="55" x2="50" y2="95" />
        {/* Dots */}
        <circle cx="32" cy="46" r="2.5" fill="currentColor" />
        <circle cx="68" cy="46" r="2.5" fill="currentColor" />
        <circle cx="35" cy="70" r="2.5" fill="currentColor" />
        <circle cx="65" cy="70" r="2.5" fill="currentColor" />
      </svg>

      {/* Bottom Right: Little Ghost / Soul doodle */}
      <svg
        className="absolute bottom-16 right-8 sm:right-20 w-24 h-24 transform -rotate-6"
        viewBox="0 0 100 100"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      >
        <path d="M 30 75 C 20 40, 30 15, 55 15 C 75 15, 85 35, 80 70 C 75 75, 68 70, 62 75 C 55 70, 48 76, 42 70 C 36 75, 32 72, 30 75 Z" />
        <circle cx="45" cy="35" r="3" fill="currentColor" />
        <circle cx="62" cy="35" r="3" fill="currentColor" />
        <ellipse cx="53" cy="48" rx="4" ry="7" stroke="currentColor" fill="none" />
      </svg>

      {/* Bottom Left: Little cross stitches and scribble */}
      <svg
        className="absolute bottom-12 left-10 sm:left-24 w-28 h-20"
        viewBox="0 0 120 80"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      >
        <path d="M 10 30 Q 30 25 50 35 T 90 28" />
        <line x1="20" y1="20" x2="26" y2="38" />
        <line x1="40" y1="22" x2="44" y2="40" />
        <line x1="60" y1="24" x2="68" y2="42" />
        <line x1="80" y1="18" x2="84" y2="36" />
        {/* tiny star doodle */}
        <path d="M 95 50 L 105 60 M 105 50 L 95 60 M 100 45 L 100 65 M 90 55 L 110 55" strokeWidth="1.5" />
      </svg>
    </div>
  );
};
