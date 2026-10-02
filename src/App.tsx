import React, { useState, useEffect, useMemo } from 'react';
import { GameAccount, FilterState, GameType } from './types';
import { realtimeSync } from './services/realtimeSync';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { FilterBar } from './components/FilterBar';
import { AccountCard } from './components/AccountCard';
import { AccountDetailModal } from './components/AccountDetailModal';
import { SellerLoginModal } from './components/SellerLoginModal';
import { SellerDashboard } from './components/SellerDashboard';
import { AddEditAccountModal } from './components/AddEditAccountModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { AntiFraudModal } from './components/AntiFraudModal';
import { NegoModal } from './components/NegoModal';
import { CloudSyncSettingsModal } from './components/CloudSyncSettingsModal';
import { Footer } from './components/Footer';
import { BottomNav } from './components/BottomNav';
import { Sparkles, ShoppingBag, ShieldCheck, ArrowRight, MessageCircle } from 'lucide-react';
import { OFFICIAL_WA_NUMBER, DISPLAY_WA_NUMBER } from './utils/formatter';

export default function App() {
  // Accounts state synced real-time from database service
  const [accounts, setAccounts] = useState<GameAccount[]>([]);
  const [isSellerAuthenticated, setIsSellerAuthenticated] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<'buyer' | 'seller'>('buyer');

  // Filter state for buyer catalog
  const [filter, setFilter] = useState<FilterState>({
    game: 'ALL',
    searchQuery: '',
    priceRange: 'ALL',
    onlyReady: false,
    sortBy: 'newest',
  });

  // Modals state
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedDetailAccount, setSelectedDetailAccount] = useState<GameAccount | null>(null);
  const [selectedNegoAccount, setSelectedNegoAccount] = useState<GameAccount | null>(null);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState<GameAccount | null>(null);
  const [accountToDelete, setAccountToDelete] = useState<GameAccount | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSyncSettingsOpen, setIsSyncSettingsOpen] = useState(false);

  // Anti-fraud warning gate before WhatsApp redirect
  const [antiFraudModalOpen, setAntiFraudModalOpen] = useState(false);
  const [pendingWaCallback, setPendingWaCallback] = useState<(() => void) | null>(null);

  // Subscribe to Realtime Database / Multi-Device updates on mount
  useEffect(() => {
    const unsubscribe = realtimeSync.subscribe((latestAccounts) => {
      setAccounts(latestAccounts);
    });

    // Check saved seller auth session in session storage
    if (typeof window !== 'undefined') {
      const savedAuth = sessionStorage.getItem('gamestore_seller_auth');
      if (savedAuth === 'true') {
        setIsSellerAuthenticated(true);
      }
    }

    return () => {
      unsubscribe();
    };
  }, []);

  // Filter handlers
  const handleUpdateFilter = (partial: Partial<FilterState>) => {
    setFilter((prev) => ({ ...prev, ...partial }));
  };

  // Filtered & sorted accounts
  const filteredAccounts = useMemo(() => {
    return accounts.filter((acc) => {
      // 1. Filter Game
      if (filter.game !== 'ALL' && acc.game !== filter.game) {
        return false;
      }

      // 2. Filter Status Only Ready
      if (filter.onlyReady && acc.status !== 'READY') {
        return false;
      }

      // 3. Filter Price Range
      if (filter.priceRange === 'UNDER_100K' && acc.price >= 100000) {
        return false;
      }
      if (filter.priceRange === '100K_500K' && (acc.price < 100000 || acc.price > 500000)) {
        return false;
      }
      if (filter.priceRange === 'ABOVE_1M' && acc.price <= 1000000) {
        return false;
      }

      // 4. Filter Search Query
      if (filter.searchQuery.trim()) {
        const query = filter.searchQuery.toLowerCase();
        const titleMatch = acc.title.toLowerCase().includes(query);
        const idMatch = acc.id.toLowerCase().includes(query);
        const notesMatch = (acc.notes || '').toLowerCase().includes(query);

        // MLBB specs match
        const mlRankMatch = (acc.mlSpecs?.rank || '').toLowerCase().includes(query);
        const mlRareMatch = (acc.mlSpecs?.rareSkins || []).some((s) => s.toLowerCase().includes(query));

        // FF specs match
        const ffBundlesMatch = (acc.ffSpecs?.mainBundles || []).some((b) => b.toLowerCase().includes(query));
        const ffEvoMatch = (acc.ffSpecs?.evoGuns || []).some((g) => g.toLowerCase().includes(query));

        if (!titleMatch && !idMatch && !notesMatch && !mlRankMatch && !mlRareMatch && !ffBundlesMatch && !ffEvoMatch) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (filter.sortBy === 'cheapest') {
        return a.price - b.price;
      }
      if (filter.sortBy === 'expensive') {
        return b.price - a.price;
      }
      if (filter.sortBy === 'popular') {
        return b.soldCount - a.soldCount;
      }
      // default: newest
      return b.createdAt - a.createdAt;
    });
  }, [accounts, filter]);

  // Counters for Ready accounts
  const mlbbReadyCount = useMemo(() => {
    return accounts.filter((a) => a.game === 'MLBB' && a.status === 'READY').length;
  }, [accounts]);

  const ffReadyCount = useMemo(() => {
    return accounts.filter((a) => a.game === 'FREE_FIRE' && a.status === 'READY').length;
  }, [accounts]);

  // Seller auth handlers
  const handleSellerLoginSuccess = () => {
    setIsSellerAuthenticated(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('gamestore_seller_auth', 'true');
    }
    setCurrentView('seller');
  };

  const handleSellerLogout = () => {
    setIsSellerAuthenticated(false);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('gamestore_seller_auth');
    }
    setCurrentView('buyer');
  };

  // CRUD Actions for Seller
  const handleOpenAddAccount = () => {
    setAccountToEdit(null);
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditAccount = (account: GameAccount) => {
    setAccountToEdit(account);
    setIsAddEditModalOpen(true);
  };

  const handleSaveAccount = async (accountData: any) => {
    if (accountToEdit) {
      await realtimeSync.updateAccount(accountData as GameAccount);
    } else {
      await realtimeSync.addAccount(accountData);
    }
  };

  const handlePromptDeleteAccount = (account: GameAccount) => {
    setAccountToDelete(account);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (accountToDelete) {
      await realtimeSync.deleteAccount(accountToDelete.id);
      setIsDeleteModalOpen(false);
      setAccountToDelete(null);
    }
  };

  const handleToggleStatus = async (account: GameAccount) => {
    const nextStatus = account.status === 'READY' ? 'SOLD_OUT' : 'READY';
    const nextStock = nextStatus === 'READY' ? 1 : 0;
    await realtimeSync.updateAccountStock(account.id, nextStock, nextStatus);
  };

  // Anti-fraud gate trigger
  const handleTriggerAntiFraudCheck = (actionCallback: () => void) => {
    setPendingWaCallback(() => actionCallback);
    setAntiFraudModalOpen(true);
  };

  const handleProceedAntiFraud = () => {
    if (pendingWaCallback) {
      pendingWaCallback();
      setPendingWaCallback(null);
    }
  };

  // If in seller view and authenticated, render full Seller Dashboard
  if (currentView === 'seller' && isSellerAuthenticated) {
    return (
      <>
        <SellerDashboard
          accounts={accounts}
          onBackToKatalog={() => setCurrentView('buyer')}
          onLogout={handleSellerLogout}
          onAddNewAccount={handleOpenAddAccount}
          onEditAccount={handleOpenEditAccount}
          onDeleteAccount={handlePromptDeleteAccount}
          onToggleStatus={handleToggleStatus}
          onViewDetail={(acc) => setSelectedDetailAccount(acc)}
          onOpenSyncSettings={() => setIsSyncSettingsOpen(true)}
        />

        {/* Modals for Seller Operations */}
        <AddEditAccountModal
          isOpen={isAddEditModalOpen}
          initialAccount={accountToEdit}
          onClose={() => setIsAddEditModalOpen(false)}
          onSave={handleSaveAccount}
        />

        <DeleteConfirmModal
          account={accountToDelete}
          isOpen={isDeleteModalOpen}
          onConfirm={handleConfirmDelete}
          onCancel={() => setIsDeleteModalOpen(false)}
        />

        <CloudSyncSettingsModal
          isOpen={isSyncSettingsOpen}
          onClose={() => setIsSyncSettingsOpen(false)}
          onSuccess={() => setIsSyncSettingsOpen(false)}
        />

        <AccountDetailModal
          account={selectedDetailAccount}
          onClose={() => setSelectedDetailAccount(null)}
          onOpenAntiFraudWarning={handleTriggerAntiFraudCheck}
        />
      </>
    );
  }

  // Primary Buyer Landing Page
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-orange-500 selection:text-white">
      {/* Fixed Navbar with brand, counters, WA, and discreet lock */}
      <Navbar
        mlbbReadyCount={mlbbReadyCount}
        ffReadyCount={ffReadyCount}
        isSellerAuthenticated={isSellerAuthenticated}
        onOpenSellerLogin={() => setIsLoginModalOpen(true)}
        onOpenSellerDashboard={() => setCurrentView('seller')}
      />

      {/* Spacer to offset fixed header (56px mobile, 92px desktop + safe area top) */}
      <div
        className="h-14 sm:h-[92px] w-full shrink-0"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
        aria-hidden="true"
      />

      {/* Hero Banner with gaming glow & stock statistics */}
      <HeroBanner
        mlbbReadyCount={mlbbReadyCount}
        ffReadyCount={ffReadyCount}
        onSelectGame={(game: GameType) => handleUpdateFilter({ game })}
      />

      {/* Sticky Fast Filter & Search Bar */}
      <FilterBar
        filter={filter}
        onChangeFilter={handleUpdateFilter}
        totalFilteredCount={filteredAccounts.length}
      />

      {/* Main E-Commerce Product Catalog (Itemku Style 2-Column on Mobile) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6">
        {/* Section title & quick banner */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base sm:text-xl font-black text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-orange-500" />
              <span>
                {filter.game === 'ALL'
                  ? 'Katalog Akun Siap Beli (MLBB & Free Fire)'
                  : filter.game === 'MLBB'
                  ? 'Katalog Akun Mobile Legends: Bang Bang'
                  : 'Katalog Akun Garena Free Fire'}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Klik kartu akun untuk melihat detail spesifikasi &amp; galeri foto bukti asli.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-500/30 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Real-Time Sync Terhubung</span>
          </div>
        </div>

        {/* Product Grid: 2-columns on mobile (Itemku standard), 3 cols on tablet, 4 on desktop */}
        {filteredAccounts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
            {filteredAccounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                onViewDetail={(acc) => setSelectedDetailAccount(acc)}
                onOpenNego={(acc) => setSelectedNegoAccount(acc)}
              />
            ))}
          </div>
        ) : (
          /* Empty Search State */
          <div className="text-center py-16 px-4 bg-slate-900/40 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              Tidak Ada Akun yang Sesuai Filter
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Coba sesuaikan kata kunci pencarian, rentang harga, atau matikan opsi "Hanya Ready" untuk melihat akun lainnya.
            </p>
            <button
              onClick={() =>
                setFilter({
                  game: 'ALL',
                  searchQuery: '',
                  priceRange: 'ALL',
                  onlyReady: false,
                  sortBy: 'newest',
                })
              }
              className="mt-2 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs transition-colors"
            >
              Reset Semua Filter
            </button>
          </div>
        )}

        {/* Bottom Fast WA Consultation Card - Compact & Elegant */}
        <div className="mt-6 sm:mt-8 p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-blue-950/70 border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-emerald-400 font-bold text-[11px] sm:text-xs uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Layanan Pelanggan Resmi 24 Jam</span>
            </div>
            <h3 className="text-sm sm:text-base md:text-lg font-black text-white">
              Cari Akun Spesifikasi Khusus atau Request Akun Impian?
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-300 max-w-xl">
              Hubungi langsung nomor WhatsApp penjual di <strong className="text-white font-mono">{DISPLAY_WA_NUMBER}</strong>. Kami siap mencarikan akun MLBB atau Free Fire sesuai budget Anda!
            </p>
          </div>

          <a
            href={`https://wa.me/${OFFICIAL_WA_NUMBER}?text=${encodeURIComponent('Halo Gan, saya ingin request spek akun MLBB / Free Fire sesuai budget saya.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-950 flex items-center justify-center gap-2 whitespace-nowrap min-h-[40px]"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Chat WhatsApp Direct</span>
          </a>
        </div>
      </main>

      {/* Footer */}
      <Footer
        onOpenSellerLogin={() => setIsLoginModalOpen(true)}
        isSellerAuthenticated={isSellerAuthenticated}
        onOpenSellerDashboard={() => setCurrentView('seller')}
      />

      {/* Mobile Bottom Navigation (Smartphones touch-target size >= 44px) */}
      <BottomNav
        activeGame={filter.game}
        onSelectGame={(selected) => handleUpdateFilter({ game: selected })}
        onOpenSellerLogin={() => setIsLoginModalOpen(true)}
        isSellerAuthenticated={isSellerAuthenticated}
        onOpenSellerDashboard={() => setCurrentView('seller')}
      />

      {/* Modals */}
      <AccountDetailModal
        account={selectedDetailAccount}
        onClose={() => setSelectedDetailAccount(null)}
        onOpenAntiFraudWarning={handleTriggerAntiFraudCheck}
      />

      <NegoModal
        account={selectedNegoAccount}
        isOpen={!!selectedNegoAccount}
        onClose={() => setSelectedNegoAccount(null)}
        onProceedNegoToWa={(waUrl) => {
          handleTriggerAntiFraudCheck(() => {
            window.open(waUrl, '_blank');
          });
        }}
      />

      <SellerLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleSellerLoginSuccess}
      />

      <AntiFraudModal
        isOpen={antiFraudModalOpen}
        onProceed={handleProceedAntiFraud}
        onClose={() => {
          setAntiFraudModalOpen(false);
          setPendingWaCallback(null);
        }}
      />
    </div>
  );
}
