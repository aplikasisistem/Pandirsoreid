import React from 'react';
import { ShieldCheck, MessageCircle, Lock, Sparkles, CheckCircle2 } from 'lucide-react';
import { DISPLAY_WA_NUMBER, OFFICIAL_WA_NUMBER } from '../utils/formatter';
import { MLBBLogo, FreeFireLogo } from './GameBadges';
import { PandirStoreEmblem } from './PandirStoreLogo';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  onOpenSellerLogin: () => void;
  isSellerAuthenticated: boolean;
  onOpenSellerDashboard: () => void;
  mlbbReadyCount: number;
  ffReadyCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSellerLogin,
  isSellerAuthenticated,
  onOpenSellerDashboard,
  mlbbReadyCount,
  ffReadyCount,
}) => {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 w-full bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 shadow-lg safe-top"
      style={{
        top: 0,
        left: 0,
        right: 0,
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
    >
      {/* Top micro bar for trust & quick stats */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-amber-950 px-3 py-1 text-[11px] text-slate-300 border-b border-slate-800/60 hidden sm:flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Live Stok Real-Time
          </span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-1">
            <MLBBLogo className="w-3.5 h-3.5" />
            <span>MLBB Ready: <strong className="text-blue-300">{mlbbReadyCount}</strong></span>
          </span>
          <span className="text-slate-600">|</span>
          <span className="flex items-center gap-1">
            <FreeFireLogo className="w-3.5 h-3.5" />
            <span>FF Ready: <strong className="text-amber-300">{ffReadyCount}</strong></span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Garansi Anti Hackback 100%
          </span>
          <span className="text-slate-600">|</span>
          <a
            href={`https://wa.me/${OFFICIAL_WA_NUMBER}?text=${encodeURIComponent('Halo Admin PANDIRSTORE.ID, saya ingin tanya seputar transaksi akun game.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            WA CS: {DISPLAY_WA_NUMBER}
          </a>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
        {/* Brand Logo with Uploaded Pandir Store Emblem */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="relative flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-600 to-orange-500 p-[2px] shadow-lg shadow-cyan-950/50 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[9px] sm:rounded-[10px] flex items-center justify-center overflow-hidden p-0.5">
              <PandirStoreEmblem className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500 ring-2 ring-slate-950 animate-ping"></span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500 ring-2 ring-slate-950"></span>
          </div>

          <div>
            <div className="flex items-center gap-1 sm:gap-1.5">
              <span className="text-sm sm:text-xl font-black tracking-tight text-white whitespace-nowrap">
                PANDIRSTORE<span className="text-orange-500">.ID</span>
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30 uppercase tracking-wider hidden xs:inline">
                Official
              </span>
            </div>
            <p className="text-[9px] sm:text-[10px] text-cyan-400 font-medium -mt-0.5 flex items-center gap-1">
              <span className="truncate max-w-[125px] sm:max-w-none">Jual Beli Akun Aman</span>
              <CheckCircle2 className="w-2.5 h-2.5 text-blue-400 shrink-0" />
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* PWA In-App Install Button */}
          <PWAInstallButton variant="navbar" />

          {/* Quick WA button */}
          <a
            href={`https://wa.me/${OFFICIAL_WA_NUMBER}?text=${encodeURIComponent('Halo Gan, saya ingin berkonsultasi mengenai pembelian akun di PANDIRSTORE.ID.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-[11px] sm:text-sm font-semibold transition-all shadow-md shadow-emerald-950/40 min-h-[34px] sm:min-h-[40px]"
            title="Chat Langsung WhatsApp 085717046895"
          >
            <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white" />
            <span>Direct WA</span>
            <span className="hidden md:inline font-mono text-emerald-100 text-xs">085717046895</span>
          </a>

          {/* Discreet Seller Access / Dashboard Toggle */}
          {isSellerAuthenticated ? (
            <button
              onClick={onOpenSellerDashboard}
              className="flex items-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-[11px] sm:text-sm font-bold shadow-md shadow-orange-950/40 active:scale-95 transition-all min-h-[34px] sm:min-h-[40px]"
            >
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-200" />
              <span className="hidden xs:inline">Dashboard</span>
            </button>
          ) : (
            <button
              onClick={onOpenSellerLogin}
              className="p-1.5 sm:px-2.5 sm:py-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors text-xs flex items-center gap-1 min-h-[34px] sm:min-h-[40px] justify-center"
              title="Akses Khusus Penjual (Pandir)"
              aria-label="Pintu Login Penjual"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Penjual</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

