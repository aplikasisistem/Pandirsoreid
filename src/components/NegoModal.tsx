import React, { useState, useEffect } from 'react';
import { Tag, X, MessageCircle, AlertTriangle, ShieldCheck } from 'lucide-react';
import { GameAccount } from '../types';
import {
  formatRupiah,
  formatNumber,
  validateNegoOffer,
  buildNegoWaLink,
  DISPLAY_WA_NUMBER,
} from '../utils/formatter';

interface NegoModalProps {
  account: GameAccount | null;
  isOpen: boolean;
  onClose: () => void;
  onProceedNegoToWa: (waUrl: string) => void;
}

export const NegoModal: React.FC<NegoModalProps> = ({
  account,
  isOpen,
  onClose,
  onProceedNegoToWa,
}) => {
  const [offerInput, setOfferInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (account) {
      // Suggest 85% price by default
      const suggested = Math.round(account.price * 0.85);
      setOfferInput(formatNumber(suggested));
      setErrorMsg(null);
    }
  }, [account, isOpen]);

  if (!isOpen || !account) return null;

  const minOfferLimit = Math.round(account.price * 0.7);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanNum = parseInt(offerInput.replace(/[^0-9]/g, ''), 10);
    const validation = validateNegoOffer(account.price, cleanNum);

    if (!validation.valid) {
      setErrorMsg(validation.message || 'Penawaran tidak valid.');
      return;
    }

    const waLink = buildNegoWaLink(account, cleanNum);
    onClose();
    onProceedNegoToWa(waLink);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">Nego Harga Akun</h3>
              <p className="text-xs text-amber-400 font-medium">ID Lapak: {account.id}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Account Info Pill */}
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
          <img
            src={account.thumbnail}
            alt={account.title}
            className="w-12 h-10 object-cover rounded-lg shrink-0"
          />
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-bold truncate">{account.title}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-slate-400">Harga Buka:</span>
              <span className="text-orange-400 font-mono font-bold">
                {formatRupiah(account.price)}
              </span>
            </div>
          </div>
        </div>

        {/* Nego Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Masukkan Harga Penawaran Anda:
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                Rp
              </span>
              <input
                type="text"
                value={offerInput}
                onChange={(e) => {
                  const num = e.target.value.replace(/[^0-9]/g, '');
                  setOfferInput(num ? formatNumber(parseInt(num, 10)) : '');
                  setErrorMsg(null);
                }}
                placeholder={`Min: ${formatNumber(minOfferLimit)}`}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-amber-400 font-mono font-bold text-base focus:outline-none focus:border-amber-500"
                autoFocus
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-400">
              *Minimal penawaran: <strong className="text-slate-200">{formatRupiah(minOfferLimit)}</strong> (70% dari harga buka).
            </p>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-950/50 border border-red-500/40 text-red-300 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Direct Negosiasi Resmi</span>
            </div>
            <p>
              Penawaran Anda akan otomatis dikirimkan ke WhatsApp penjual di nomor <strong className="text-white font-mono">{DISPLAY_WA_NUMBER}</strong> dengan template terstandarisasi.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs sm:text-sm min-h-[44px]"
            >
              Batal
            </button>

            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-orange-950 min-h-[44px] flex items-center justify-center gap-1.5"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Ajukan ke WA</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
