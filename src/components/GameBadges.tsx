import React from 'react';
import { GameType } from '../types';

interface GameBadgeProps {
  game: GameType;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const MLBBLogo: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="#0A1628" stroke="#3B82F6" strokeWidth="4" />
    <path
      d="M50 14L78 30V70L50 86L22 70V30L50 14Z"
      fill="url(#mlbbGradient)"
      stroke="#F59E0B"
      strokeWidth="3"
    />
    <path
      d="M32 64V36L44 50L50 42L56 50L68 36V64H60V48L52 58H48L40 48V64H32Z"
      fill="#FFFFFF"
    />
    <defs>
      <linearGradient id="mlbbGradient" x1="22" y1="14" x2="78" y2="86" gradientUnits="userSpaceOnUse">
        <stop stopColor="#1E3A8A" />
        <stop offset="0.5" stopColor="#2563EB" />
        <stop offset="1" stopColor="#D97706" />
      </linearGradient>
    </defs>
  </svg>
);

export const FreeFireLogo: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="48" fill="#1C0A00" stroke="#EA580C" strokeWidth="4" />
    <path
      d="M50 12C50 12 66 32 66 52C66 68 55 86 50 88C45 86 34 68 34 52C34 32 50 12 50 12Z"
      fill="url(#ffFireGradient)"
    />
    <path
      d="M50 36C50 36 60 50 60 62C60 72 53 82 50 84C47 82 40 72 40 62C40 50 50 36 50 36Z"
      fill="#FEF08A"
    />
    <path
      d="M35 48H65V56H45V62H60V70H45V78H35V48Z"
      fill="#0F172A"
      opacity="0.85"
    />
    <defs>
      <linearGradient id="ffFireGradient" x1="34" y1="12" x2="66" y2="88" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FACC15" />
        <stop offset="0.4" stopColor="#F97316" />
        <stop offset="1" stopColor="#DC2626" />
      </linearGradient>
    </defs>
  </svg>
);

export const GameBadge: React.FC<GameBadgeProps> = ({ game, size = 'md', showLabel = true }) => {
  const isML = game === 'MLBB';

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2',
  };

  const logoSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  if (isML) {
    return (
      <span
        className={`inline-flex items-center font-bold rounded-md bg-gradient-to-r from-blue-950/90 via-indigo-950/80 to-blue-900/90 border border-blue-500/40 text-blue-300 shadow-sm shadow-blue-950/50 backdrop-blur-xs ${sizeClasses[size]}`}
      >
        <MLBBLogo className={logoSizes[size]} />
        {showLabel && <span>Mobile Legends</span>}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center font-bold rounded-md bg-gradient-to-r from-amber-950/90 via-orange-950/80 to-red-950/90 border border-orange-500/40 text-amber-300 shadow-sm shadow-orange-950/50 backdrop-blur-xs ${sizeClasses[size]}`}
    >
      <FreeFireLogo className={logoSizes[size]} />
      {showLabel && <span>Free Fire</span>}
    </span>
  );
};
