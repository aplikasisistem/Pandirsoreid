import React, { useState } from 'react';
import { Database, X, CheckCircle, Wifi, RefreshCw, Key, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { realtimeSync } from '../services/realtimeSync';
import { testConnection } from '../services/firebase';
import firebaseConfig from '../../firebase-applet-config.json';
import { useToast } from '../context/ToastContext';

interface CloudSyncSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CloudSyncSettingsModal: React.FC<CloudSyncSettingsModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const status = realtimeSync.getSyncStatus();
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      await testConnection();
      setTestResult('Koneksi Firestore Server Berhasil & Sinkronisasi Real-Time Aktif!');
      showToast({
        type: 'success',
        title: 'Koneksi Cloud Firestore Stabil',
        message: 'Database real-time terhubung tanpa hambatan ke server Firebase.',
      });
    } catch (err: any) {
      setTestResult('Koneksi mengalami kendala: ' + (err?.message || 'Offline'));
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                Status Sinkronisasi Real-Time Cloud
              </h3>
              <p className="text-xs text-slate-400">Firebase Firestore Multi-Device Sync</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current status pill */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <div>
              <div className="font-bold text-white">Status Database:</div>
              <div className="text-emerald-400 font-semibold">{status.label}</div>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[11px] font-bold">
            ONLINE
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Setiap penambahan, pengubahan data (edit lapak), pengubahan stok (ready/sold out), dan aksi hapus tersimpan langsung ke Google Cloud Firestore dan disinkronkan secara real-time ke semua perangkat dan browser pembeli/penjual.
        </p>

        {/* Cloud Config Details */}
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 text-xs">
          <div className="flex justify-between items-center text-slate-400 pb-1 border-b border-slate-800/80">
            <span>Project ID:</span>
            <span className="font-mono text-slate-200">{firebaseConfig.projectId}</span>
          </div>
          <div className="flex justify-between items-center text-slate-400 pb-1 border-b border-slate-800/80">
            <span>Database ID:</span>
            <span className="font-mono text-xs text-orange-300 truncate max-w-[200px]" title={firebaseConfig.firestoreDatabaseId}>
              {firebaseConfig.firestoreDatabaseId}
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Auth Domain:</span>
            <span className="font-mono text-slate-300">{firebaseConfig.authDomain}</span>
          </div>
        </div>

        {testResult && (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{testResult}</span>
          </div>
        )}

        <div className="pt-2 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Wifi className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{isTesting ? 'Menguji...' : 'Uji Koneksi Real-Time'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
