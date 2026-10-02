import React, { useState } from 'react';
import { Lock, Eye, EyeOff, X, ShieldAlert, CheckCircle } from 'lucide-react';

interface SellerLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const SellerLoginModal: React.FC<SellerLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    // Strict credential check as requested:
    // Username: Pandir
    // Password: Pamarayan123@
    const trimmedUser = username.trim();
    const trimmedPass = password.trim();

    setTimeout(() => {
      if (trimmedUser === 'Pandir' && trimmedPass === 'Pamarayan123@') {
        setIsSubmitting(false);
        onLoginSuccess();
        onClose();
        // Clear fields
        setUsername('');
        setPassword('');
      } else {
        setIsSubmitting(false);
        setErrorMessage('Username atau Password salah! Akses ditolak.');
      }
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Login Penjual</h3>
              <p className="text-xs text-slate-400">Khusus Administrator Lapak (Pandir)</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice Info */}
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs text-slate-400 leading-relaxed">
          Area ini dikhususkan bagi pengelola toko untuk mengunggah lapak baru, mengubah stok real-time, dan mengatur akun.
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-950/50 border border-red-500/50 text-red-300 text-xs animate-shake">
            <ShieldAlert className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Username Penjual
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username"
              required
              autoFocus
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Password Penjual
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                required
                className="w-full pl-3.5 pr-11 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
              />

              {/* Password Eye Toggle Icon */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 transition-colors"
                title={showPassword ? 'Sembunyikan Password' : 'Tampilkan Password'}
                aria-label={showPassword ? 'Sembunyikan Password' : 'Tampilkan Password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-orange-400" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Gunakan ikon mata untuk memeriksa ketikan password Anda.
            </p>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-sm shadow-lg shadow-orange-950/60 active:scale-95 transition-all flex items-center justify-center gap-2 min-h-[44px]"
          >
            <Lock className="w-4 h-4" />
            <span>{isSubmitting ? 'Memeriksa Kredensial...' : 'Masuk Dashboard'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
