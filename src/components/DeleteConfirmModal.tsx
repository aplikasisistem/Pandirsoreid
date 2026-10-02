import React, { useState, useEffect } from 'react';
import { Trash2, X, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { GameAccount } from '../types';
import { useToast } from '../context/ToastContext';

interface DeleteConfirmModalProps {
  account: GameAccount | null;
  isOpen: boolean;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  account,
  isOpen,
  onConfirm,
  onCancel,
}) => {
  const { showToast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  // Reset states whenever modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setIsDeleting(false);
      setDeleteError(null);
      setIsSuccess(false);
    }
  }, [isOpen, account]);

  if (!isOpen || !account) return null;

  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    setDeleteError(null);

    try {
      await onConfirm();
      setIsSuccess(true);

      // Trigger Toast notification
      showToast({
        type: 'delete',
        title: 'Data Berhasil Dihapus',
        message: `Lapak akun "${account.title}" (${account.id}) berhasil dihapus dari database.`,
        duration: 4000,
      });

      // Auto-close modal after brief completion delay
      setTimeout(() => {
        onCancel();
        setIsDeleting(false);
        setIsSuccess(false);
      }, 600);
    } catch (err: any) {
      const errorMsg = err?.message || 'Gagal menghapus lapak dari database. Silakan coba lagi.';
      setDeleteError(errorMsg);
      setIsDeleting(false);

      showToast({
        type: 'error',
        title: 'Gagal Menghapus Data',
        message: errorMsg,
        duration: 4000,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-red-500/40 rounded-2xl shadow-2xl p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div
            className={`p-3 rounded-xl border shrink-0 transition-colors ${
              isSuccess
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                : 'bg-red-500/20 border-red-500/40 text-red-400'
            }`}
          >
            {isSuccess ? <CheckCircle2 className="w-6 h-6 animate-bounce" /> : <Trash2 className="w-6 h-6" />}
          </div>
          <div className="flex-1">
            <h3 className="text-base sm:text-lg font-black text-white">
              {isSuccess ? 'Lapak Telah Dihapus' : 'Konfirmasi Hapus Lapak'}
            </h3>
            <p className="text-xs text-red-400 font-medium">
              {isSuccess ? 'Database telah diperbarui' : 'Tindakan ini permanen & tidak bisa dikembalikan'}
            </p>
          </div>
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="text-slate-400 hover:text-white p-1 disabled:opacity-40 transition-colors"
            aria-label="Batal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Question Text */}
        <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 text-xs sm:text-sm text-slate-200 leading-relaxed">
          Apakah Anda yakin ingin menghapus lapak <strong className="text-white">"{account.title}"</strong> (ID: {account.id})? Tindakan ini tidak dapat dibatalkan.
        </div>

        {/* Error Alert Banner if any */}
        {deleteError && (
          <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 flex items-start gap-2.5 text-xs text-red-200 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">
              <span className="font-bold text-red-300">Gagal: </span>
              {deleteError}
            </div>
          </div>
        )}

        {/* Success Alert Banner if successfully deleted before auto-close */}
        {isSuccess && (
          <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 flex items-center gap-2.5 text-xs text-emerald-200 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-bold">Data berhasil dihapus! Menutup jendela...</span>
          </div>
        )}

        {/* Buttons Action Group */}
        <div className="flex items-center gap-2 pt-2">
          {/* Button 1: Batal */}
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting || isSuccess}
            className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 font-semibold text-xs sm:text-sm transition-colors min-h-[44px]"
          >
            Batal
          </button>

          {/* Button 2: Ya, Hapus */}
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting || isSuccess}
            className={`flex-1 py-2.5 px-4 rounded-xl text-white font-bold text-xs sm:text-sm transition-all shadow-lg min-h-[44px] flex items-center justify-center gap-1.5 ${
              isSuccess
                ? 'bg-emerald-600 shadow-emerald-950 cursor-default'
                : 'bg-red-600 hover:bg-red-500 active:scale-95 disabled:bg-red-800/60 disabled:cursor-not-allowed shadow-red-950'
            }`}
          >
            {isDeleting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Menghapus...</span>
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Terhapus!</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Ya, Hapus</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
