import React from 'react';
import { ShieldCheck, MessageCircle, Lock } from 'lucide-react';
import { DISPLAY_WA_NUMBER, OFFICIAL_WA_NUMBER } from '../utils/formatter';
import { PandirStoreEmblem } from './PandirStoreLogo';

interface FooterProps {
  onOpenSellerLogin: () => void;
  isSellerAuthenticated: boolean;
  onOpenSellerDashboard: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenSellerLogin,
  isSellerAuthenticated,
  onOpenSellerDashboard,
}) => {
  return (
    <footer
      className="bg-slate-950 border-t border-slate-800 text-slate-400 text-xs mt-12 sm:pb-8"
      style={{ paddingBottom: 'calc(5.5rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand Info */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-600 to-orange-500 p-[2px] flex items-center justify-center shadow-lg shadow-cyan-950/40">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center p-0.5">
                  <PandirStoreEmblem className="w-7 h-7" />
                </div>
              </div>
              <div>
                <span className="text-base font-black tracking-tight text-white">
                  PANDIRSTORE<span className="text-orange-500">.ID</span>
                </span>
                <span className="text-[10px] text-cyan-400 font-semibold block -mt-1">
                  Jual Beli Akun Aman &amp; Terpercaya
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              Marketplace Jual Beli Akun Mobile Legends &amp; Free Fire Terpercaya di Indonesia. Transaksi langsung via WhatsApp resmi, aman dengan garansi anti hackback, dan opsi Rekber terverifikasi.
            </p>

            <div className="flex items-center gap-2 text-xs text-emerald-400 pt-1">
              <ShieldCheck className="w-4 h-4" />
              <span className="font-semibold">Garansi Anti Hackback Seumur Hidup</span>
            </div>
          </div>

          {/* Col 2: Hubungi Kami */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Kontak Resmi Penjual
            </h4>
            <div className="space-y-2 text-xs">
              <a
                href={`https://wa.me/${OFFICIAL_WA_NUMBER}?text=${encodeURIComponent('Halo Admin PANDIRSTORE.ID, saya ingin tanya informasi akun.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-slate-300 hover:text-emerald-400 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span className="font-mono">{DISPLAY_WA_NUMBER}</span>
              </a>
              <p className="text-[11px] text-slate-400">
                Jam Operasional: 24 Jam Non-Stop (Respon Cepat via WhatsApp)
              </p>
            </div>
          </div>

          {/* Col 3: Metode Pembayaran & Rekber */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Metode Pembayaran
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Mendukung Transfer Bank (BCA, BRI, Mandiri, BNI), QRIS, DANA, GoPay, OVO, ShopeePay &amp; Rekber Resmi Itemku / Admin Terpercaya.
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {['BCA', 'BRI', 'QRIS', 'DANA', 'GOPAY', 'REKBER'].map((item) => (
                <span
                  key={item}
                  className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom copyright & Discreet Seller Login as requested in Section D.1 */}
        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <div>
            &copy; {new Date().getFullYear()} PANDIRSTORE.ID. Seluruh hak cipta dilindungi.
          </div>

          {/* Discreet Seller Login Link */}
          <div className="flex items-center gap-4">
            <span className="text-slate-400">•</span>
            {isSellerAuthenticated ? (
              <button
                onClick={onOpenSellerDashboard}
                className="text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1 transition-colors"
              >
                <Lock className="w-3 h-3" />
                <span>Buka Dashboard Penjual (Pandir)</span>
              </button>
            ) : (
              <button
                onClick={onOpenSellerLogin}
                className="text-slate-400 hover:text-slate-300 flex items-center gap-1 transition-colors"
                title="Pintu Masuk Penjual"
              >
                <Lock className="w-3 h-3" />
                <span>Seller Area / Login Penjual</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

