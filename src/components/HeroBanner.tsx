import React from 'react';
import { ShieldCheck, Zap, HeartHandshake, CheckCircle } from 'lucide-react';
import { MLBBLogo, FreeFireLogo } from './GameBadges';
import { DISPLAY_WA_NUMBER } from '../utils/formatter';

interface HeroBannerProps {
  mlbbReadyCount: number;
  ffReadyCount: number;
  onSelectGame: (game: 'MLBB' | 'FREE_FIRE') => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  mlbbReadyCount,
  ffReadyCount,
  onSelectGame,
}) => {
  return (
    <div className="relative overflow-hidden bg-slate-950 border-b border-slate-800/80">
      {/* Background neon glows: Land of Dawn (blue) on left & Bermuda Booyah (orange/fire) on right */}
      <div className="absolute top-0 left-0 w-48 sm:w-80 h-48 sm:h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute top-0 right-0 w-48 sm:w-80 h-48 sm:h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-1/3 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-2 sm:py-5 relative z-10">
        <div className="text-center max-w-2xl mx-auto">
          {/* Trust badge pill */}
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-900/90 border border-slate-700/80 text-[9px] sm:text-xs text-slate-300 mb-1.5 sm:mb-2 shadow-xs">
            <span className="flex h-1.5 w-1.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span className="font-medium text-slate-300">WA Seller:</span>
            <span className="text-emerald-400 font-mono font-bold">{DISPLAY_WA_NUMBER}</span>
            <span className="text-slate-600">•</span>
            <span className="text-amber-400 font-medium">Bisa Nego</span>
          </div>

          {/* Main Title - Compact & Elegant on HP */}
          <h1 className="text-sm sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight">
            Marketplace Akun <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-blue-200">MLBB</span> &amp;{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-red-400">Free Fire</span>
          </h1>

          <p className="mt-0.5 sm:mt-1.5 text-[10px] sm:text-xs text-slate-400 max-w-lg mx-auto leading-relaxed line-clamp-1 sm:line-clamp-none">
            Aman, Murah &amp; Direct WA. Moonton sepaket / Unbind all garansi anti hackback seumur hidup.
          </p>

          {/* Category Quick Badges / Live Stock Counters - Refined & Compact on Mobile */}
          <div className="mt-2 sm:mt-4 grid grid-cols-2 gap-1.5 sm:gap-3 max-w-md mx-auto">
            {/* MLBB Stock Card */}
            <button
              onClick={() => onSelectGame('MLBB')}
              className="group p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-gradient-to-b from-blue-950/60 to-slate-900/80 border border-blue-600/30 hover:border-blue-500/60 text-left transition-all hover:scale-[1.01] active:scale-95 shadow-md shadow-blue-950/30 flex items-center justify-between min-h-[38px] sm:min-h-[44px]"
            >
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="p-1 sm:p-1.5 rounded-md sm:rounded-lg bg-blue-900/60 border border-blue-500/30 group-hover:bg-blue-800/80 transition-colors">
                  <MLBBLogo className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <div className="text-[8px] sm:text-[10px] text-blue-300 font-semibold uppercase tracking-wider leading-tight">MLBB</div>
                  <div className="text-[11px] sm:text-sm font-bold text-white leading-none">
                    {mlbbReadyCount} Ready
                  </div>
                </div>
              </div>
              <span className="text-[8px] sm:text-[10px] px-1.5 py-0.2 sm:py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold group-hover:bg-blue-500 group-hover:text-white transition-all">
                Pilih
              </span>
            </button>

            {/* Free Fire Stock Card */}
            <button
              onClick={() => onSelectGame('FREE_FIRE')}
              className="group p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-gradient-to-b from-amber-950/60 to-slate-900/80 border border-orange-600/30 hover:border-orange-500/60 text-left transition-all hover:scale-[1.01] active:scale-95 shadow-md shadow-orange-950/30 flex items-center justify-between min-h-[38px] sm:min-h-[44px]"
            >
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="p-1 sm:p-1.5 rounded-md sm:rounded-lg bg-orange-900/60 border border-orange-500/30 group-hover:bg-orange-800/80 transition-colors">
                  <FreeFireLogo className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <div className="text-[8px] sm:text-[10px] text-amber-300 font-semibold uppercase tracking-wider leading-tight">Free Fire</div>
                  <div className="text-[11px] sm:text-sm font-bold text-white leading-none">
                    {ffReadyCount} Ready
                  </div>
                </div>
              </div>
              <span className="text-[8px] sm:text-[10px] px-1.5 py-0.2 sm:py-0.5 rounded bg-orange-500/20 text-amber-300 font-bold group-hover:bg-orange-500 group-hover:text-white transition-all">
                Pilih
              </span>
            </button>
          </div>

          {/* Trust Guarantees - Sleek micro row */}
          <div className="mt-1.5 sm:mt-3 pt-1.5 sm:pt-2.5 border-t border-slate-800/50 flex flex-wrap items-center justify-center gap-1.5 sm:gap-6 text-[9px] sm:text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400" />
              <span>Instan 5-10 Menit</span>
            </span>
            <span className="text-slate-700 hidden xs:inline">•</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-400" />
              <span>Garansi 100% / Rekber</span>
            </span>
            <span className="text-slate-700 hidden xs:inline">•</span>
            <span className="flex items-center gap-1">
              <HeartHandshake className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-400" />
              <span>Direct WhatsApp</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
