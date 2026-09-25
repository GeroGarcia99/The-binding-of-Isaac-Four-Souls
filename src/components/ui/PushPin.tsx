import React from 'react';

interface PushPinProps {
  color?: 'red' | 'yellow' | 'blue' | 'black';
  className?: string;
}

export const PushPin: React.FC<PushPinProps> = ({ color = 'red', className = '' }) => {
  const colorGradients = {
    red: 'from-red-400 via-red-600 to-rose-950',
    yellow: 'from-amber-300 via-amber-500 to-amber-900',
    blue: 'from-cyan-400 via-blue-600 to-blue-950',
    black: 'from-stone-400 via-stone-700 to-stone-950',
  };

  return (
    <div className={`relative flex items-center justify-center pointer-events-none select-none ${className}`}>
      {/* Pin shadow cast on wall/paper */}
      <div className="absolute top-2 left-2.5 w-4 h-4 bg-stone-900/35 rounded-full blur-[2px] transform -rotate-12" />
      
      {/* Pin needle tiny accent */}
      <div className="absolute top-2.5 left-1 w-1.5 h-1.5 bg-stone-400/80 rounded-full" />
      
      {/* Pin plastic head (3D spherical effect) */}
      <div
        className={`relative w-5 h-5 rounded-full bg-gradient-to-br ${colorGradients[color]} shadow-md border border-white/30 flex items-center justify-center`}
      >
        {/* Specular highlight */}
        <div className="w-1.5 h-1.5 rounded-full bg-white/70 -translate-x-0.5 -translate-y-0.5" />
      </div>
    </div>
  );
};
