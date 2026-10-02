import React from 'react';
import { ShieldAlert, CheckCircle2, MessageCircle, AlertTriangle, X } from 'lucide-react';
import { DISPLAY_WA_NUMBER, OFFICIAL_WA_NUMBER } from '../utils/formatter';

interface AntiFraudModalProps {
  isOpen: boolean;
  onProceed: () => void;
  onClose: () => void;
}

export const AntiFraudModal: React.FC<AntiFraudModalProps> = ({
  isOpen,
  onProceed,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl p-5 sm:p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                Peringatan Keamanan &amp; Anti-Penipuan
              </h3>
              <p className="text-xs text-amber-400 font-medium">
                Wajib dibaca sebelum menghubungi WhatsApp penjual
              </p>
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

        {/* Security Checklist */}
        <div className="space-y-2.5 text-xs text-slate-300 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p>
              Pastikan Anda hanya bertransaksi dengan nomor resmi WhatsApp kami:{' '}
              <strong className="text-emerald-400 font-mono text-sm">{DISPLAY_WA_NUMBER}</strong>.
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p>
              Gunakan sistem <strong className="text-white">Rekening Bersama (Rekber)</strong> atau verifikasi langsung sebelum menyelesaikan pembayaran.
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p>
              Jangan pernah memberikan password akun pribadi atau link verifikasi OTP Anda kepada siapa pun di luar transaksi resmi.
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p>
              Seluruh akun dijamin data lengkap (Moonton sepaket / Unbind All) dengan garansi anti hackback.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs sm:text-sm transition-colors min-h-[44px]"
          >
            Batal
          </button>

          <button
            onClick={() => {
              onClose();
              onProceed();
            }}
            className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 min-h-[44px]"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Saya Paham, Lanjut ke WA</span>
          </button>
        </div>
      </div>
    </div>
  );
};
