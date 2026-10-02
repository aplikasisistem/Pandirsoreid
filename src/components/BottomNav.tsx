import React from 'react';
import { Home, ShieldCheck, MessageCircle, Lock, Sparkles } from 'lucide-react';
import { MLBBLogo, FreeFireLogo } from './GameBadges';
import { OFFICIAL_WA_NUMBER } from '../utils/formatter';
import { FilterGameOption } from '../types';

interface BottomNavProps {
  activeGame: FilterGameOption;
  onSelectGame: (game: FilterGameOption) => void;
  onOpenSellerLogin: () => void;
  isSellerAuthenticated: boolean;
  onOpenSellerDashboard: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeGame,
  onSelectGame,
  onOpenSellerLogin,
  isSellerAuthenticated,
  onOpenSellerDashboard,
}) => {
  return (
    <nav
      className="fixed inset-x-0 z-40 bg-slate-950/95 border-t border-slate-800/90 backdrop-blur-xl sm:hidden px-2 pt-1.5 shadow-2xl safe-bottom select-none"
      style={{
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
      aria-label="Navigasi Bawah Mobile"
    >
      <div className="grid grid-cols-5 items-center max-w-md mx-auto">
        {/* Katalog Semua */}
        <button
          onClick={() => onSelectGame('ALL')}
          className={`flex flex-col items-center justify-center py-1 min-h-[48px] rounded-xl transition-all active:scale-90 ${
            activeGame === 'ALL'
              ? 'text-orange-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-lg transition-colors ${activeGame === 'ALL' ? 'bg-orange-500/15' : ''}`}>
            <Home className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Katalog</span>
        </button>

        {/* MLBB Tab */}
        <button
          onClick={() => onSelectGame('MLBB')}
          className={`flex flex-col items-center justify-center py-1 min-h-[48px] rounded-xl transition-all active:scale-90 ${
            activeGame === 'MLBB'
              ? 'text-blue-400 font-bold'
              : 'text-slate-400 hover:text-blue-300'
          }`}
        >
          <div className={`p-1 rounded-lg transition-colors ${activeGame === 'MLBB' ? 'bg-blue-500/15' : ''}`}>
            <MLBBLogo className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">MLBB</span>
        </button>

        {/* Direct WA Center Floating Button (Shopee Mall / Main Action style) */}
        <a
          href={`https://wa.me/${OFFICIAL_WA_NUMBER}?text=${encodeURIComponent('Halo Admin PANDIRSTORE.ID, saya ingin tanya info akun.')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center py-1 min-h-[48px] text-emerald-400 group active:scale-90 transition-transform"
          title="Direct WhatsApp"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-950/60 ring-2 ring-emerald-400/30">
            <MessageCircle className="w-4 h-4 fill-white" />
          </div>
          <span className="text-[10px] text-emerald-400 font-bold mt-0.5 tracking-tight">Chat WA</span>
        </a>

        {/* Free Fire Tab */}
        <button
          onClick={() => onSelectGame('FREE_FIRE')}
          className={`flex flex-col items-center justify-center py-1 min-h-[48px] rounded-xl transition-all active:scale-90 ${
            activeGame === 'FREE_FIRE'
              ? 'text-amber-400 font-bold'
              : 'text-slate-400 hover:text-amber-300'
          }`}
        >
          <div className={`p-1 rounded-lg transition-colors ${activeGame === 'FREE_FIRE' ? 'bg-amber-500/15' : ''}`}>
            <FreeFireLogo className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Free Fire</span>
        </button>

        {/* Seller Login / Dashboard */}
        <button
          onClick={isSellerAuthenticated ? onOpenSellerDashboard : onOpenSellerLogin}
          className={`flex flex-col items-center justify-center py-1 min-h-[48px] rounded-xl transition-all active:scale-90 ${
            isSellerAuthenticated
              ? 'text-amber-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-lg transition-colors ${isSellerAuthenticated ? 'bg-amber-500/15' : ''}`}>
            {isSellerAuthenticated ? (
              <Sparkles className="w-5 h-5 text-amber-400" />
            ) : (
              <Lock className="w-5 h-5" />
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">
            {isSellerAuthenticated ? 'Kelola' : 'Penjual'}
          </span>
        </button>
      </div>
    </nav>
  );
};
