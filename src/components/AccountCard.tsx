import React from 'react';
import { Star, ShieldCheck, MessageCircle, Eye, Tag, Sparkles } from 'lucide-react';
import { GameAccount } from '../types';
import { formatRupiah, buildBuyWaLink } from '../utils/formatter';
import { GameBadge } from './GameBadges';

interface AccountCardProps {
  account: GameAccount;
  onViewDetail: (account: GameAccount) => void;
  onOpenNego: (account: GameAccount) => void;
  isSellerMode?: boolean;
  onEdit?: (account: GameAccount) => void;
  onDelete?: (account: GameAccount) => void;
  onToggleStatus?: (account: GameAccount) => void;
}

export const AccountCard: React.FC<AccountCardProps> = ({
  account,
  onViewDetail,
  onOpenNego,
  isSellerMode = false,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  const isReady = account.status === 'READY';
  const isML = account.game === 'MLBB';

  return (
    <div className="group relative flex flex-col bg-slate-900/90 rounded-xl overflow-hidden border border-slate-800 hover:border-slate-700 transition-all duration-200 shadow-md hover:shadow-xl hover:shadow-orange-950/20">
      {/* Thumbnail Container with 16:10 aspect ratio */}
      <div
        className="relative w-full aspect-[16/10] bg-slate-950 overflow-hidden cursor-pointer"
        onClick={() => onViewDetail(account)}
      >
        <img
          src={account.thumbnail}
          alt={account.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            // Fallback placeholder image
            (e.target as HTMLImageElement).src =
              isML
                ? 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80'
                : 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Gradient shadow overlay for badge readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>

        {/* Top Badges */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between gap-1 pointer-events-none">
          {/* Game Badge with Logo */}
          <GameBadge game={account.game} size="sm" showLabel={false} />

          {/* Stock / Live Status Badge */}
          {isReady ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold bg-emerald-500/90 text-white shadow-md shadow-emerald-950 backdrop-blur-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              Instan Ready
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold bg-red-600/90 text-white shadow-md shadow-red-950 backdrop-blur-xs">
              Sold Out
            </span>
          )}
        </div>

        {/* Bottom thumbnail tag: ID Lapak & Nego Status */}
        <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between text-[10px] text-slate-300 font-mono">
          <span className="px-1.5 py-0.5 rounded bg-slate-950/80 border border-slate-800 text-slate-300">
            ID: {account.id}
          </span>
          {account.isNego && isReady && (
            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold">
              Bisa Nego
            </span>
          )}
        </div>
      </div>

      {/* Card Content (Itemku style) */}
      <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between space-y-2">
        <div>
          {/* Game sub-label */}
          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 mb-1">
            <span>{isML ? 'Mobile Legends: Bang Bang' : 'Garena Free Fire'}</span>
          </div>

          {/* Title */}
          <h3
            onClick={() => onViewDetail(account)}
            className="text-xs sm:text-sm font-bold text-white line-clamp-2 hover:text-orange-400 transition-colors cursor-pointer leading-snug"
            title={account.title}
          >
            {account.title}
          </h3>

          {/* Highlight Specs (Compact for 2-column mobile layout) */}
          <div className="mt-2 text-[11px] text-slate-300 bg-slate-950/70 p-2 rounded-lg border border-slate-800/80 space-y-1">
            {isML && account.mlSpecs ? (
              <>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Rank:</span>
                  <span className="font-semibold text-blue-300 truncate max-w-[120px]">
                    {account.mlSpecs.rank}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Hero / Skin:</span>
                  <span className="font-semibold text-white">
                    {account.mlSpecs.totalHero} / {account.mlSpecs.totalSkin}
                  </span>
                </div>
                {account.mlSpecs.rareSkins?.length > 0 && (
                  <div className="text-[10px] text-amber-300 truncate">
                    ★ {account.mlSpecs.rareSkins[0]}
                  </div>
                )}
              </>
            ) : account.ffSpecs ? (
              <>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Level:</span>
                  <span className="font-semibold text-amber-300">
                    Lv {account.ffSpecs.level}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Elite Pass:</span>
                  <span className="font-semibold text-white truncate max-w-[120px]">
                    {account.ffSpecs.elitePass}
                  </span>
                </div>
                {account.ffSpecs.evoGuns?.length > 0 && (
                  <div className="text-[10px] text-orange-400 truncate">
                    🔥 {account.ffSpecs.evoGuns[0]}
                  </div>
                )}
              </>
            ) : (
              <div className="text-[11px] text-slate-400 truncate">{account.notes}</div>
            )}
          </div>
        </div>

        {/* Pricing & Rating Section */}
        <div className="pt-2 border-t border-slate-800/80">
          {isSellerMode ? (
            /* Seller View: Shows both Harga Beli (Modal) and Harga Jual + Margin */
            <div className="space-y-1">
              <div className="flex items-baseline justify-between gap-1">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    Harga Jual
                  </span>
                  <span className="text-sm sm:text-base font-black text-orange-500 font-mono tracking-tight">
                    {formatRupiah(account.price)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    Modal (COGS)
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-slate-300 font-mono">
                    {formatRupiah(account.costPrice || Math.round(account.price * 0.7))}
                  </span>
                </div>
              </div>

              {/* Calculated Margin per Product */}
              {(() => {
                const cost = account.costPrice || Math.round(account.price * 0.7);
                const margin = account.price - cost;
                const marginPercent = Math.round((margin / (account.price || 1)) * 100);
                return (
                  <div className="flex items-center justify-between text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 font-semibold font-mono">
                    <span>Margin: +{formatRupiah(margin)}</span>
                    <span>({marginPercent}%)</span>
                  </div>
                );
              })()}
            </div>
          ) : (
            /* Buyer View: STRICTLY ONLY Harga Jual (Harga Modal is 100% hidden) */
            <div className="flex items-baseline justify-between gap-1">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  Harga Buka
                </span>
                <span className="text-base sm:text-lg font-black text-orange-500 font-mono tracking-tight">
                  {formatRupiah(account.price)}
                </span>
              </div>

              {/* Rating and Sold statistics */}
              <div className="text-right text-[11px]">
                <div className="flex items-center justify-end gap-1 text-amber-400 font-bold">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{account.rating.toFixed(1)}</span>
                </div>
                <span className="text-[10px] text-slate-400">
                  {account.soldCount} Terjual
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {isSellerMode ? (
            /* Seller Management Mode Buttons */
            <div className="mt-2.5 space-y-1.5">
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => onEdit?.(account)}
                  className="py-1.5 px-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1 min-h-[36px]"
                >
                  Edit Lapak
                </button>
                <button
                  type="button"
                  onClick={() => onDelete?.(account)}
                  className="py-1.5 px-2 rounded-lg bg-red-600/90 hover:bg-red-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1 min-h-[36px]"
                >
                  Hapus
                </button>
              </div>

              {/* Quick Stock Toggle */}
              <button
                type="button"
                onClick={() => onToggleStatus?.(account)}
                className={`w-full py-1 px-2 rounded-lg text-[11px] font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                  isReady
                    ? 'border-emerald-500/40 text-emerald-400 hover:bg-emerald-950/40'
                    : 'border-red-500/40 text-red-400 hover:bg-red-950/40'
                }`}
              >
                <span>Ubah Status:</span>
                <span className="underline">{isReady ? 'Set Sold Out' : 'Set Ready'}</span>
              </button>
            </div>
          ) : (
            /* Buyer Mode Buttons */
            <div className="mt-2.5 space-y-1.5">
              {/* Primary Action: WhatsApp Direct */}
              {isReady ? (
                <a
                  href={buildBuyWaLink(account)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/50 min-h-[38px]"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-white" />
                  <span>Beli via WA</span>
                </a>
              ) : (
                <button
                  disabled
                  className="w-full py-2 px-2.5 rounded-lg bg-slate-800 text-slate-500 font-bold text-xs cursor-not-allowed flex items-center justify-center gap-1 min-h-[38px]"
                >
                  TERJUAL / SOLD OUT
                </button>
              )}

              {/* Secondary Actions: Detail & Nego */}
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => onViewDetail(account)}
                  className="py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center justify-center gap-1 min-h-[34px]"
                >
                  <Eye className="w-3 h-3 text-slate-400" />
                  <span>Detail Foto</span>
                </button>

                {account.isNego && isReady ? (
                  <button
                    type="button"
                    onClick={() => onOpenNego(account)}
                    className="py-1.5 px-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs transition-colors flex items-center justify-center gap-1 min-h-[34px]"
                  >
                    <Tag className="w-3 h-3 text-amber-400" />
                    <span>Nego</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onViewDetail(account)}
                    className="py-1.5 px-2 rounded-lg bg-slate-800/60 text-slate-400 font-medium text-xs transition-colors flex items-center justify-center gap-1 min-h-[34px]"
                  >
                    <span>Harga Pas</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
