import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { GameAccount } from '../types';

interface DeleteConfirmModalProps {
  account: GameAccount | null;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  account,
  isOpen,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen || !account) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-red-500/40 rounded-2xl shadow-2xl p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 shrink-0">
            <Trash2 className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-base sm:text-lg font-black text-white">
              Konfirmasi Hapus Lapak
            </h3>
            <p className="text-xs text-red-400 font-medium">Tindakan ini permanen</p>
          </div>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-white p-1"
            aria-label="Batal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Question Text as requested in Section E.4 */}
        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed">
          Apakah Anda yakin ingin menghapus lapak <strong className="text-white">"{account.title}"</strong> (ID: {account.id})? Tindakan ini tidak dapat dibatalkan.
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs sm:text-sm transition-colors min-h-[44px]"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-red-950 min-h-[44px] flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Ya, Hapus</span>
          </button>
        </div>
      </div>
    </div>
  );
};
