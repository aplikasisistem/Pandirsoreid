import React, { useState } from 'react';
import {
  Plus,
  ArrowLeft,
  LogOut,
  Database,
  RefreshCw,
  Sparkles,
  ShoppingBag,
  TrendingUp,
  ShieldCheck,
  CheckCircle,
  Eye,
} from 'lucide-react';
import { GameAccount, SaleRecord } from '../types';
import { formatRupiah, formatNumber } from '../utils/formatter';
import { AccountCard } from './AccountCard';
import { realtimeSync } from '../services/realtimeSync';
import { PandirStoreEmblem } from './PandirStoreLogo';
import { ProfitLossDashboard } from './ProfitLossDashboard';
import { AdminDashboard } from './AdminDashboard';
import { PieChart, LayoutGrid } from 'lucide-react';

interface SellerDashboardProps {
  accounts: GameAccount[];
  salesRecords?: SaleRecord[];
  onBackToKatalog: () => void;
  onLogout: () => void;
  onAddNewAccount: () => void;
  onEditAccount: (account: GameAccount) => void;
  onDeleteAccount: (account: GameAccount) => void;
  onToggleStatus: (account: GameAccount) => void;
  onViewDetail: (account: GameAccount) => void;
  onOpenSyncSettings: () => void;
}

export const SellerDashboard: React.FC<SellerDashboardProps> = ({
  accounts,
  salesRecords = [],
  onBackToKatalog,
  onLogout,
  onAddNewAccount,
  onEditAccount,
  onDeleteAccount,
  onToggleStatus,
  onViewDetail,
  onOpenSyncSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'profit_loss'>('catalog');
  const [filterGame, setFilterGame] = useState<'ALL' | 'MLBB' | 'FREE_FIRE'>('ALL');

  const filteredAccounts = accounts.filter((a) => {
    if (filterGame === 'ALL') return true;
    return a.game === filterGame;
  });

  const totalReady = accounts.filter((a) => a.status === 'READY').length;
  const totalSold = accounts.filter((a) => a.status === 'SOLD_OUT').length;
  const totalEstimatedValue = accounts.reduce((acc, curr) => acc + (curr.status === 'READY' ? curr.price : 0), 0);
  const syncStatus = realtimeSync.getSyncStatus();

  return (
    <div
      className="min-h-screen bg-slate-950 text-slate-100"
      style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }}
    >
      {/* Top Seller Bar with Safe Area Top */}
      <div
        className="bg-slate-900 border-b border-slate-800 sticky top-0 left-0 right-0 z-40 backdrop-blur-md safe-top w-full"
        style={{
          top: 0,
          left: 0,
          right: 0,
          paddingTop: 'env(safe-area-inset-top, 0px)',
        }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={onBackToKatalog}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold transition-colors min-h-[38px]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden xs:inline">Ke Katalog</span>
            </button>

            <div className="h-6 w-px bg-slate-800 hidden sm:block"></div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 via-blue-600 to-orange-500 p-[1.5px] flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 rounded-[7px] flex items-center justify-center">
                  <PandirStoreEmblem className="w-5 h-5" />
                </div>
              </div>
              <span className="text-xs sm:text-base font-black text-white truncate max-w-[140px] sm:max-w-none">
                Admin <span className="text-orange-400 font-mono">(Pandir)</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSyncSettings}
              className="px-2.5 py-1.5 rounded-lg bg-blue-950/80 hover:bg-blue-900 border border-blue-500/40 text-blue-300 text-xs font-semibold flex items-center gap-1.5 transition-colors min-h-[38px]"
              title="Pengaturan Sinkronisasi Real-Time"
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Sync Cloud</span>
            </button>

            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 border border-red-500/40 text-red-300 text-xs sm:text-sm font-semibold transition-colors min-h-[38px]"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>

        {/* Top Navigation Tabs: Manajemen Lapak vs Rekap Keuangan */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center gap-2 border-t border-slate-800/80 bg-slate-950/60">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center gap-2 py-2.5 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition-all min-h-[44px] ${
              activeTab === 'catalog'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Kelola Lapak (Itemku 2-Kolom)</span>
          </button>

          <button
            onClick={() => setActiveTab('profit_loss')}
            className={`flex items-center gap-2 py-2.5 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition-all min-h-[44px] ${
              activeTab === 'profit_loss'
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <PieChart className="w-4 h-4 text-emerald-400" />
            <span>Rekap Keuangan &amp; Laba Rugi</span>
            <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px] hidden sm:inline">
              PROFIT &amp; LOSS
            </span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-6">
        {activeTab === 'profit_loss' ? (
          /* Admin Financial Real-Time Dashboard */
          <AdminDashboard
            initialAccounts={accounts}
            initialSalesRecords={salesRecords}
          />
        ) : (
          /* Catalog Management View (Itemku Style) */
          <>
            {/* Real-time sync alert badge */}
            <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-blue-950/60 p-3 sm:p-3.5 rounded-xl border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0"></span>
                <div>
                  <span className="font-bold text-white">Sinkronisasi Multi-Device Aktif: </span>
                  <span className="text-emerald-300">{syncStatus.label}</span>
                </div>
              </div>
              <span className="text-slate-400 text-[11px]">
                Harga Modal (COGS) dan margin keuntungan ditampilkan khusus untuk Penjual.
              </span>
            </div>

            {/* Seller Statistics Overview Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
              <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Total Lapak Akun</span>
                  <ShoppingBag className="w-4 h-4 text-orange-400" />
                </div>
                <div className="text-lg sm:text-2xl font-black text-white">{accounts.length}</div>
                <div className="text-[11px] text-slate-400">Katalog MLBB &amp; Free Fire</div>
              </div>

              <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900 border border-emerald-900/50 space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Stok Ready Aktif</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>
                <div className="text-lg sm:text-2xl font-black text-emerald-400">{totalReady}</div>
                <div className="text-[11px] text-emerald-300/80">Siap Ditransaksikan</div>
              </div>

              <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Total Akun Terjual</span>
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-lg sm:text-2xl font-black text-blue-400">{totalSold}</div>
                <div className="text-[11px] text-slate-400">Status Sold Out</div>
              </div>

              <div className="p-3.5 sm:p-4 rounded-xl bg-slate-900 border border-amber-900/40 space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Estimasi Nilai Stok Ready</span>
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-sm sm:text-xl font-black text-orange-400 font-mono truncate">
                  {formatRupiah(totalEstimatedValue)}
                </div>
                <div className="text-[11px] text-slate-400">Katalog Tersedia</div>
              </div>
            </div>

            {/* Section Header & Create Action */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <div>
                <h2 className="text-base sm:text-xl font-black text-white flex items-center gap-2">
                  <span>Manajemen Lapak Akun (Pratinjau Itemku Style)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tata letak Grid 2-Kolom di HP menampilkan Harga Jual, Modal (COGS), dan Margin Laba.
                </p>
              </div>

              {/* Add Account CTA button */}
              <button
                onClick={onAddNewAccount}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 hover:from-orange-500 hover:to-amber-500 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-lg shadow-orange-950 transition-all min-h-[44px]"
              >
                <Plus className="w-5 h-5 stroke-[2.5]" />
                <span>Tambah Lapak Baru</span>
              </button>
            </div>

            {/* Filter Tabs for Seller */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 max-w-sm">
              <button
                onClick={() => setFilterGame('ALL')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                  filterGame === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Semua ({accounts.length})
              </button>
              <button
                onClick={() => setFilterGame('MLBB')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                  filterGame === 'MLBB' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                MLBB ({accounts.filter((a) => a.game === 'MLBB').length})
              </button>
              <button
                onClick={() => setFilterGame('FREE_FIRE')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                  filterGame === 'FREE_FIRE' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Free Fire ({accounts.filter((a) => a.game === 'FREE_FIRE').length})
              </button>
            </div>

            {/* 2-Column Grid on Mobile as specifically requested in Section E.1 */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
              {filteredAccounts.map((account) => (
                <AccountCard
                  key={account.id}
                  account={account}
                  isSellerMode={true}
                  onViewDetail={onViewDetail}
                  onOpenNego={() => {}}
                  onEdit={onEditAccount}
                  onDelete={onDeleteAccount}
                  onToggleStatus={onToggleStatus}
                />
              ))}
            </div>

            {filteredAccounts.length === 0 && (
              <div className="p-12 text-center bg-slate-900/60 rounded-2xl border border-slate-800">
                <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-300 font-bold">Belum ada lapak akun untuk filter ini.</p>
                <button
                  onClick={onAddNewAccount}
                  className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 text-white text-xs font-bold"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Lapak Sekarang</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
