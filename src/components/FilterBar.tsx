import React from 'react';
import { Search, SlidersHorizontal, ArrowUpDown, Check, X } from 'lucide-react';
import { FilterState, FilterGameOption, SortOption } from '../types';
import { MLBBLogo, FreeFireLogo } from './GameBadges';

interface FilterBarProps {
  filter: FilterState;
  onChangeFilter: (updated: Partial<FilterState>) => void;
  totalFilteredCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filter,
  onChangeFilter,
  totalFilteredCount,
}) => {
  return (
    <div
      className="bg-slate-900/95 border-y border-slate-800/80 sticky top-[calc(3.5rem+env(safe-area-inset-top,0px))] sm:top-[calc(5.75rem+env(safe-area-inset-top,0px))] z-40 backdrop-blur-md py-1.5 sm:py-2.5 shadow-md"
    >
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 space-y-1.5 sm:space-y-2.5">
        {/* Row 1: Game Tabs & Search Input */}
        <div className="flex flex-col md:flex-row gap-1.5 sm:gap-2.5 items-stretch md:items-center justify-between">
          {/* Game Category Selector Tabs */}
          <div className="grid grid-cols-3 sm:flex items-center gap-1 p-0.5 sm:p-1 bg-slate-950/80 rounded-lg sm:rounded-xl border border-slate-800">
            <button
              onClick={() => onChangeFilter({ game: 'ALL' })}
              className={`flex items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[11px] sm:text-xs font-bold transition-all min-h-[32px] sm:min-h-[38px] ${
                filter.game === 'ALL'
                  ? 'bg-slate-800 text-white shadow-sm shadow-slate-950'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>
                <span className="sm:hidden">Semua</span>
                <span className="hidden sm:inline">Semua Game</span>
              </span>
            </button>

            <button
              onClick={() => onChangeFilter({ game: 'MLBB' })}
              className={`flex items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[11px] sm:text-xs font-bold transition-all min-h-[32px] sm:min-h-[38px] ${
                filter.game === 'MLBB'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-900/50'
                  : 'text-slate-400 hover:text-blue-300'
              }`}
            >
              <MLBBLogo className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>
                <span className="sm:hidden">MLBB</span>
                <span className="hidden sm:inline">Mobile Legends</span>
              </span>
            </button>

            <button
              onClick={() => onChangeFilter({ game: 'FREE_FIRE' })}
              className={`flex items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-[11px] sm:text-xs font-bold transition-all min-h-[32px] sm:min-h-[38px] ${
                filter.game === 'FREE_FIRE'
                  ? 'bg-orange-600 text-white shadow-sm shadow-orange-900/50'
                  : 'text-slate-400 hover:text-orange-300'
              }`}
            >
              <FreeFireLogo className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>
                <span className="sm:hidden">FF</span>
                <span className="hidden sm:inline">Free Fire</span>
              </span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={filter.searchQuery}
              onChange={(e) => onChangeFilter({ searchQuery: e.target.value })}
              placeholder="Cari skin, hero, rank..."
              className="w-full pl-7 sm:pl-9 pr-7 sm:pr-8 py-1 sm:py-2 rounded-lg sm:rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-[11px] sm:text-sm focus:outline-none focus:border-orange-500/80 transition-colors"
            />
            {filter.searchQuery && (
              <button
                onClick={() => onChangeFilter({ searchQuery: '' })}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
                aria-label="Hapus pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Secondary Quick Filters & Sort */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 border-t border-slate-800/50 text-[10px] sm:text-xs">
          {/* Price Range Pills */}
          <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
            <span className="text-slate-400 hidden sm:inline mr-1 text-[11px] font-semibold">Harga:</span>

            <button
              onClick={() => onChangeFilter({ priceRange: 'ALL' })}
              className={`px-2 py-0.5 sm:px-2.5 sm:py-1.5 rounded-md sm:rounded-lg font-medium transition-colors ${
                filter.priceRange === 'ALL'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'bg-slate-950/60 text-slate-400 border border-slate-800/80 hover:text-slate-200'
              }`}
            >
              Semua
            </button>

            <button
              onClick={() => onChangeFilter({ priceRange: 'UNDER_100K' })}
              className={`px-2 py-0.5 sm:px-2.5 sm:py-1.5 rounded-md sm:rounded-lg font-medium transition-colors ${
                filter.priceRange === 'UNDER_100K'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/50'
                  : 'bg-slate-950/60 text-slate-400 border border-slate-800/80 hover:text-slate-200'
              }`}
            >
              &lt; 100rb
            </button>

            <button
              onClick={() => onChangeFilter({ priceRange: '100K_500K' })}
              className={`px-2 py-0.5 sm:px-2.5 sm:py-1.5 rounded-md sm:rounded-lg font-medium transition-colors ${
                filter.priceRange === '100K_500K'
                  ? 'bg-amber-950 text-amber-300 border border-amber-600/50'
                  : 'bg-slate-950/60 text-slate-400 border border-slate-800/80 hover:text-slate-200'
              }`}
            >
              100rb - 500rb
            </button>

            <button
              onClick={() => onChangeFilter({ priceRange: 'ABOVE_1M' })}
              className={`px-2 py-0.5 sm:px-2.5 sm:py-1.5 rounded-md sm:rounded-lg font-medium transition-colors ${
                filter.priceRange === 'ABOVE_1M'
                  ? 'bg-purple-950 text-purple-300 border border-purple-600/50'
                  : 'bg-slate-950/60 text-slate-400 border border-slate-800/80 hover:text-slate-200'
              }`}
            >
              &gt; 1 Jt
            </button>
          </div>

          {/* Right side: Only Ready toggle + Sort */}
          <div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
            {/* Hanya Ready Toggle */}
            <button
              onClick={() => onChangeFilter({ onlyReady: !filter.onlyReady })}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1.5 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-medium border transition-colors ${
                filter.onlyReady
                  ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <div
                className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded flex items-center justify-center border ${
                  filter.onlyReady
                    ? 'bg-emerald-500 border-emerald-400 text-black'
                    : 'border-slate-600 bg-slate-900'
                }`}
              >
                {filter.onlyReady && <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />}
              </div>
              <span>Ready</span>
            </button>

            {/* Sort Select */}
            <div className="relative flex items-center">
              <ArrowUpDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 absolute left-1.5 sm:left-2 pointer-events-none" />
              <select
                value={filter.sortBy}
                onChange={(e) => onChangeFilter({ sortBy: e.target.value as SortOption })}
                className="pl-5 sm:pl-7 pr-2.5 sm:pr-3 py-0.5 sm:py-1.5 rounded-md sm:rounded-lg bg-slate-950 border border-slate-800 text-[10px] sm:text-xs text-slate-200 font-medium focus:outline-none focus:border-slate-700 cursor-pointer"
                aria-label="Urutkan Akun"
              >
                <option value="newest">Terbaru</option>
                <option value="cheapest">Termurah</option>
                <option value="expensive">Termahal</option>
                <option value="popular">Populer</option>
              </select>
            </div>
          </div>
        </div>

        {/* Counter Info */}
        <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 pt-0.5 sm:pt-1">
          <span>
            <strong className="text-white">{totalFilteredCount}</strong> akun siap transaksi
          </span>
          {filter.searchQuery && (
            <span className="text-orange-400 truncate max-w-[150px] sm:max-w-none">
              Hasil: "{filter.searchQuery}"
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
