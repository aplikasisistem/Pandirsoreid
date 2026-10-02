import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  ShieldCheck,
  MessageCircle,
  Tag,
  Star,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Info,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { GameAccount } from '../types';
import {
  formatRupiah,
  formatNumber,
  buildBuyWaLink,
  buildNegoWaLink,
  validateNegoOffer,
  OFFICIAL_WA_NUMBER,
  DISPLAY_WA_NUMBER,
} from '../utils/formatter';
import { GameBadge } from './GameBadges';

interface AccountDetailModalProps {
  account: GameAccount | null;
  onClose: () => void;
  onOpenAntiFraudWarning: (callback: () => void) => void;
}

export const AccountDetailModal: React.FC<AccountDetailModalProps> = ({
  account,
  onClose,
  onOpenAntiFraudWarning,
}) => {
  if (!account) return null;

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [negoInput, setNegoInput] = useState<string>('');
  const [negoError, setNegoError] = useState<string | null>(null);
  const [showNegoForm, setShowNegoForm] = useState(false);

  const isReady = account.status === 'READY';
  const isML = account.game === 'MLBB';
  const gallery = account.gallery && account.gallery.length > 0
    ? account.gallery
    : [{ category: 'Foto Utama', url: account.thumbnail, label: account.title }];

  const currentPhoto = gallery[activePhotoIndex] || gallery[0];

  const handleNextPhoto = () => {
    setActivePhotoIndex((prev) => (prev + 1) % gallery.length);
  };

  const handlePrevPhoto = () => {
    setActivePhotoIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

  const handleNegoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNegoError(null);

    const cleanNum = parseInt(negoInput.replace(/[^0-9]/g, ''), 10);
    const validation = validateNegoOffer(account.price, cleanNum);

    if (!validation.valid) {
      setNegoError(validation.message || 'Penawaran tidak valid.');
      return;
    }

    // Direct to WhatsApp with Nego template after anti-fraud check
    const waUrl = buildNegoWaLink(account, cleanNum);
    onOpenAntiFraudWarning(() => {
      window.open(waUrl, '_blank');
    });
  };

  const handleDirectBuy = () => {
    const waUrl = buildBuyWaLink(account);
    onOpenAntiFraudWarning(() => {
      window.open(waUrl, '_blank');
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto safe-top safe-bottom"
      style={{
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 8px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 8px)',
      }}
    >
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[calc(100dvh-2rem)] flex flex-col">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2">
            <GameBadge game={account.game} size="md" />
            <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              ID: {account.idLapak || account.accountId || account.id}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Main Title & Status Bar */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                {isReady ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    STOK TERSEDIA (READY)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/40">
                    TERJUAL / SOLD OUT
                  </span>
                )}

                {account.isNego && (
                  <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    Bisa Nego Santai
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1 text-amber-400">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <strong>{account.rating.toFixed(1)}</strong>
                </span>
                <span>•</span>
                <span>{account.soldCount} Transaksi Berhasil</span>
              </div>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
              {account.title}
            </h2>
          </div>

          {/* Photo Gallery & Proof Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-white flex items-center gap-1">
                <span>Galeri Bukti Akun</span>
                <span className="text-slate-500">
                  ({activePhotoIndex + 1}/{gallery.length})
                </span>
              </span>
              <span className="text-orange-400 font-medium">
                Kategori: {currentPhoto.category}
              </span>
            </div>

            {/* Big Preview Frame */}
            <div className="relative w-full aspect-video sm:aspect-[16/9] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-inner group">
              <img
                src={currentPhoto.url}
                alt={currentPhoto.label}
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = account.thumbnail;
                }}
              />

              {/* Navigation Arrows */}
              {gallery.length > 1 && (
                <>
                  <button
                    onClick={handlePrevPhoto}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/70 text-white hover:bg-slate-900 border border-slate-700 transition-colors shadow-lg"
                    aria-label="Foto Sebelumnya"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNextPhoto}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/70 text-white hover:bg-slate-900 border border-slate-700 transition-colors shadow-lg"
                    aria-label="Foto Selanjutnya"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Label Bar */}
              <div className="absolute bottom-0 inset-x-0 bg-slate-950/85 backdrop-blur-xs px-3 py-1.5 text-xs text-slate-200 border-t border-slate-800/80 flex items-center justify-between">
                <span>{currentPhoto.label}</span>
                <span className="text-[11px] text-amber-300 font-semibold">
                  100% Bukti Asli
                </span>
              </div>
            </div>

            {/* Thumbnail Strip */}
            {gallery.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
                {gallery.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhotoIndex(idx)}
                    className={`relative rounded-lg overflow-hidden aspect-[16/10] border-2 transition-all ${
                      activePhotoIndex === idx
                        ? 'border-orange-500 ring-2 ring-orange-500/30'
                        : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={item.url}
                      alt={item.label}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = account.thumbnail;
                      }}
                    />
                    <div className="absolute inset-0 bg-slate-950/30"></div>
                    <span className="absolute bottom-1 left-1 right-1 text-[9px] text-white font-medium truncate bg-slate-950/80 px-1 rounded">
                      {item.category}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Specifications Breakdown */}
          <div className="bg-slate-950/70 rounded-xl border border-slate-800 p-4 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span>Spesifikasi &amp; Detail Lengkap Akun</span>
            </h3>

            {isML && account.mlSpecs ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Rank Saat Ini:</span>
                  <span className="font-bold text-blue-300 text-sm">{account.mlSpecs.rank}</span>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Total Hero &amp; Skin:</span>
                  <span className="font-bold text-white text-sm">
                    {account.mlSpecs.totalHero} Hero / {account.mlSpecs.totalSkin} Skin
                  </span>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Emblem:</span>
                  <span className="font-bold text-amber-300 text-xs">{account.mlSpecs.emblem}</span>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Status Bind/Login:</span>
                  <span className="font-bold text-emerald-400 text-xs">{account.mlSpecs.bindStatus}</span>
                </div>
                {account.mlSpecs.winrate && (
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 sm:col-span-2">
                    <span className="text-slate-400 block text-[11px]">Winrate Akun:</span>
                    <span className="font-bold text-white text-xs">{account.mlSpecs.winrate}</span>
                  </div>
                )}
                {account.mlSpecs.rareSkins?.length > 0 && (
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 sm:col-span-2">
                    <span className="text-slate-400 block text-[11px] mb-1">Daftar Skin Koleksi/Langka:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {account.mlSpecs.rareSkins.map((skin, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-blue-950/80 border border-blue-500/40 text-blue-300 font-semibold text-[11px]"
                        >
                          {skin}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : account.ffSpecs ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Level Akun:</span>
                  <span className="font-bold text-amber-300 text-sm">Level {account.ffSpecs.level}</span>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Elite Pass:</span>
                  <span className="font-bold text-white text-xs">{account.ffSpecs.elitePass}</span>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Status Bind/Login:</span>
                  <span className="font-bold text-emerald-400 text-xs">{account.ffSpecs.bindStatus}</span>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Total Item Vault:</span>
                  <span className="font-bold text-white text-xs">
                    {account.ffSpecs.vaultCount || 200}+ Item
                  </span>
                </div>
                {account.ffSpecs.mainBundles?.length > 0 && (
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 sm:col-span-2">
                    <span className="text-slate-400 block text-[11px] mb-1">Bundle Utama:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {account.ffSpecs.mainBundles.map((b, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-orange-950/80 border border-orange-500/40 text-amber-300 font-semibold text-[11px]"
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {account.ffSpecs.evoGuns?.length > 0 && (
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 sm:col-span-2">
                    <span className="text-slate-400 block text-[11px] mb-1">Koleksi Senjata (Evo Gun):</span>
                    <div className="flex flex-wrap gap-1.5">
                      {account.ffSpecs.evoGuns.map((gun, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-red-950/80 border border-red-500/40 text-red-300 font-semibold text-[11px]"
                        >
                          🔥 {gun}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            {/* Seller Notes */}
            {account.notes && (
              <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-300">
                <span className="text-slate-400 font-semibold block text-[11px] mb-0.5">Catatan Penjual:</span>
                <p className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 italic">
                  "{account.notes}"
                </p>
              </div>
            )}
          </div>

          {/* Anti Fraud Warning Box */}
          <div className="bg-gradient-to-r from-red-950/40 via-amber-950/30 to-slate-900 p-3.5 rounded-xl border border-amber-600/40 flex items-start gap-3 text-xs">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-amber-300">Peringatan Keamanan &amp; Rekber Resmi:</div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Hindari penipuan dengan bertransaksi langsung via WhatsApp resmi kami (<strong>{DISPLAY_WA_NUMBER}</strong>). Dilarang meminta atau membagikan password/email akun sebelum kesepakatan rekber sah.
              </p>
            </div>
          </div>

          {/* Nego Section */}
          {account.isNego && isReady && (
            <div className="bg-slate-950/90 rounded-xl border border-amber-500/30 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-bold text-white">Ingin Nego Harga Akun Ini?</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNegoForm(!showNegoForm)}
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold underline"
                >
                  {showNegoForm ? 'Tutup Kolom Nego' : 'Buka Formulir Nego'}
                </button>
              </div>

              {showNegoForm && (
                <form onSubmit={handleNegoSubmit} className="pt-2 space-y-3">
                  <p className="text-xs text-slate-400">
                    Harga buka akun adalah <strong className="text-white">{formatRupiah(account.price)}</strong>. Sistem mengizinkan penawaran minimal 70% dari harga buka (minimal <strong>{formatRupiah(Math.round(account.price * 0.7))}</strong>).
                  </p>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                        Rp
                      </span>
                      <input
                        type="text"
                        value={negoInput}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          setNegoInput(val ? formatNumber(parseInt(val, 10)) : '');
                          setNegoError(null);
                        }}
                        placeholder={`Contoh: ${formatNumber(Math.round(account.price * 0.85))}`}
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm font-bold text-amber-400 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-amber-950 min-h-[40px]"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Ajukan Nego ke WA</span>
                    </button>
                  </div>

                  {negoError && (
                    <div className="flex items-center gap-1.5 text-xs text-red-400 bg-red-950/40 p-2 rounded-lg border border-red-500/30">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{negoError}</span>
                    </div>
                  )}
                </form>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer with Pricing & Direct WA */}
        <div className="px-4 py-3 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block">
              Harga Pas / Buka
            </span>
            <div className="text-xl sm:text-2xl font-black text-orange-500 font-mono">
              {formatRupiah(account.price)}
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {isReady ? (
              <>
                {account.isNego && !showNegoForm && (
                  <button
                    onClick={() => setShowNegoForm(true)}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 min-h-[44px]"
                  >
                    <Tag className="w-4 h-4 text-amber-400" />
                    <span>Nego Harga</span>
                  </button>
                )}

                <button
                  onClick={handleDirectBuy}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 min-h-[44px]"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Beli Langsung via WA</span>
                </button>
              </>
            ) : (
              <button
                disabled
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-800 text-slate-500 font-bold text-sm cursor-not-allowed min-h-[44px]"
              >
                AKUN INI SUDAH TERJUAL (SOLD OUT)
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
