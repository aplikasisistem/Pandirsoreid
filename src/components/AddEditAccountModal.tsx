import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  Plus,
  Save,
  Gamepad2,
  Image as ImageIcon,
  DollarSign,
  FileText,
  Trash2,
  Sparkles,
  Upload,
  Camera,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { GameAccount, GameType, AccountStatus, GalleryItem } from '../types';
import { formatNumber, parseRupiahInput } from '../utils/formatter';
import { compressAndReadImage } from '../utils/imageUpload';
import { MLBBLogo, FreeFireLogo } from './GameBadges';
import { useToast } from '../context/ToastContext';

interface AddEditAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (accountData: any) => Promise<void>;
  initialAccount?: GameAccount | null;
}

const DEFAULT_THUMBNAILS = {
  MLBB: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
  FREE_FIRE: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&q=80',
};

export const AddEditAccountModal: React.FC<AddEditAccountModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialAccount,
}) => {
  const isEditing = !!initialAccount;
  const { showToast } = useToast();

  // General state
  const [game, setGame] = useState<GameType>('MLBB');
  const [title, setTitle] = useState('');
  const [priceInput, setPriceInput] = useState('');
  const [costPriceInput, setCostPriceInput] = useState('');
  const [stock, setStock] = useState<number>(1);
  const [status, setStatus] = useState<AccountStatus>('READY');
  const [isNego, setIsNego] = useState<boolean>(true);
  const [whatsappNumber, setWhatsappNumber] = useState('085717046895');
  const [thumbnail, setThumbnail] = useState('');
  const [notes, setNotes] = useState('');

  // MLBB specific state - EMPTY BY DEFAULT
  const [mlRank, setMlRank] = useState('');
  const [mlTotalHero, setMlTotalHero] = useState('');
  const [mlTotalSkin, setMlTotalSkin] = useState('');
  const [mlRareSkins, setMlRareSkins] = useState('');
  const [mlEmblem, setMlEmblem] = useState('');
  const [mlBind, setMlBind] = useState('');
  const [mlWinrate, setMlWinrate] = useState('');

  // Free Fire specific state - EMPTY BY DEFAULT
  const [ffLevel, setFfLevel] = useState('');
  const [ffElitePass, setFfElitePass] = useState('');
  const [ffMainBundles, setFfMainBundles] = useState('');
  const [ffEvoGuns, setFfEvoGuns] = useState('');
  const [ffBind, setFfBind] = useState('');
  const [ffVaultCount, setFfVaultCount] = useState('');

  // Gallery items & upload state
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // File input refs for gallery & thumbnail upload
  const thumbnailFileInputRef = useRef<HTMLInputElement>(null);
  const newProofFileInputRef = useRef<HTMLInputElement>(null);
  const replaceProofFileInputRef = useRef<HTMLInputElement>(null);
  const [replaceTargetIndex, setReplaceTargetIndex] = useState<number | null>(null);

  // Reset form cleanly to blank condition
  const resetForm = () => {
    setGame('MLBB');
    setTitle('');
    setPriceInput('');
    setCostPriceInput('');
    setStock(1);
    setStatus('READY');
    setIsNego(true);
    setWhatsappNumber('085717046895');
    setThumbnail('');
    setNotes('');

    // MLBB
    setMlRank('');
    setMlTotalHero('');
    setMlTotalSkin('');
    setMlRareSkins('');
    setMlEmblem('');
    setMlBind('');
    setMlWinrate('');

    // Free Fire
    setFfLevel('');
    setFfElitePass('');
    setFfMainBundles('');
    setFfEvoGuns('');
    setFfBind('');
    setFfVaultCount('');

    setGallery([]);
    setSubmitError(null);
    setUploadError(null);
  };

  // Initialize or reset form when modal opens or initialAccount changes
  useEffect(() => {
    if (isOpen) {
      if (initialAccount) {
        setGame(initialAccount.game);
        setTitle(initialAccount.title || '');
        setPriceInput(initialAccount.price ? formatNumber(initialAccount.price) : '');
        setCostPriceInput(
          initialAccount.costPrice
            ? formatNumber(initialAccount.costPrice)
            : initialAccount.price
            ? formatNumber(Math.round(initialAccount.price * 0.7))
            : ''
        );
        setStock(initialAccount.stock ?? 1);
        setStatus(initialAccount.status || 'READY');
        setIsNego(initialAccount.isNego ?? true);
        setWhatsappNumber(initialAccount.whatsappNumber || '085717046895');
        setThumbnail(initialAccount.thumbnail || '');
        setNotes(initialAccount.notes || '');

        if (initialAccount.game === 'MLBB' && initialAccount.mlSpecs) {
          setMlRank(initialAccount.mlSpecs.rank || '');
          setMlTotalHero(initialAccount.mlSpecs.totalHero ? String(initialAccount.mlSpecs.totalHero) : '');
          setMlTotalSkin(initialAccount.mlSpecs.totalSkin ? String(initialAccount.mlSpecs.totalSkin) : '');
          setMlRareSkins((initialAccount.mlSpecs.rareSkins || []).join(', '));
          setMlEmblem(initialAccount.mlSpecs.emblem || '');
          setMlBind(initialAccount.mlSpecs.bindStatus || '');
          setMlWinrate(initialAccount.mlSpecs.winrate || '');
        } else {
          setMlRank('');
          setMlTotalHero('');
          setMlTotalSkin('');
          setMlRareSkins('');
          setMlEmblem('');
          setMlBind('');
          setMlWinrate('');
        }

        if (initialAccount.game === 'FREE_FIRE' && initialAccount.ffSpecs) {
          setFfLevel(initialAccount.ffSpecs.level ? String(initialAccount.ffSpecs.level) : '');
          setFfElitePass(initialAccount.ffSpecs.elitePass || '');
          setFfMainBundles((initialAccount.ffSpecs.mainBundles || []).join(', '));
          setFfEvoGuns((initialAccount.ffSpecs.evoGuns || []).join(', '));
          setFfBind(initialAccount.ffSpecs.bindStatus || '');
          setFfVaultCount(initialAccount.ffSpecs.vaultCount ? String(initialAccount.ffSpecs.vaultCount) : '');
        } else {
          setFfLevel('');
          setFfElitePass('');
          setFfMainBundles('');
          setFfEvoGuns('');
          setFfBind('');
          setFfVaultCount('');
        }

        setGallery(initialAccount.gallery || []);
        setSubmitError(null);
      } else {
        // Mode Tambah Lapak Baru: KOSONGKAN SEMUA INPUT SECARA DEFAULT
        resetForm();
      }
    }
  }, [initialAccount, isOpen]);

  // Handle clean modal close
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // State dirty check to detect unsaved changes
  const isDirty = useMemo(() => {
    if (!isEditing) {
      return title.trim().length > 0 || priceInput.trim().length > 0;
    }
    if (!initialAccount) return false;

    const initialPriceStr = formatNumber(initialAccount.price);
    const initialCostStr = initialAccount.costPrice
      ? formatNumber(initialAccount.costPrice)
      : formatNumber(Math.round(initialAccount.price * 0.7));

    if (game !== initialAccount.game) return true;
    if (title.trim() !== (initialAccount.title || '').trim()) return true;
    if (priceInput.trim() !== initialPriceStr) return true;
    if (costPriceInput.trim() !== initialCostStr) return true;
    if (stock !== initialAccount.stock) return true;
    if (status !== initialAccount.status) return true;
    if (isNego !== initialAccount.isNego) return true;
    if (whatsappNumber.trim() !== (initialAccount.whatsappNumber || '085717046895').trim()) return true;
    if (thumbnail !== (initialAccount.thumbnail || '')) return true;
    if (notes.trim() !== (initialAccount.notes || '').trim()) return true;

    if (game === 'MLBB' && initialAccount.mlSpecs) {
      if (mlRank !== (initialAccount.mlSpecs.rank || '')) return true;
      if (mlTotalHero !== (initialAccount.mlSpecs.totalHero ? String(initialAccount.mlSpecs.totalHero) : '')) return true;
      if (mlTotalSkin !== (initialAccount.mlSpecs.totalSkin ? String(initialAccount.mlSpecs.totalSkin) : '')) return true;
      if (mlRareSkins !== (initialAccount.mlSpecs.rareSkins || []).join(', ')) return true;
      if (mlEmblem !== (initialAccount.mlSpecs.emblem || '')) return true;
      if (mlBind !== (initialAccount.mlSpecs.bindStatus || '')) return true;
      if (mlWinrate !== (initialAccount.mlSpecs.winrate || '')) return true;
    }

    if (game === 'FREE_FIRE' && initialAccount.ffSpecs) {
      if (ffLevel !== (initialAccount.ffSpecs.level ? String(initialAccount.ffSpecs.level) : '')) return true;
      if (ffElitePass !== (initialAccount.ffSpecs.elitePass || '')) return true;
      if (ffMainBundles !== (initialAccount.ffSpecs.mainBundles || []).join(', ')) return true;
      if (ffEvoGuns !== (initialAccount.ffSpecs.evoGuns || []).join(', ')) return true;
      if (ffBind !== (initialAccount.ffSpecs.bindStatus || '')) return true;
      if (ffVaultCount !== (initialAccount.ffSpecs.vaultCount ? String(initialAccount.ffSpecs.vaultCount) : '')) return true;
    }

    if (JSON.stringify(gallery) !== JSON.stringify(initialAccount.gallery || [])) return true;

    return false;
  }, [
    isEditing,
    initialAccount,
    game,
    title,
    priceInput,
    costPriceInput,
    stock,
    status,
    isNego,
    whatsappNumber,
    thumbnail,
    notes,
    mlRank,
    mlTotalHero,
    mlTotalSkin,
    mlRareSkins,
    mlEmblem,
    mlBind,
    mlWinrate,
    ffLevel,
    ffElitePass,
    ffMainBundles,
    ffEvoGuns,
    ffBind,
    ffVaultCount,
    gallery,
  ]);

  // Switch game type without overwriting input values
  const handleGameSwitch = (selectedGame: GameType) => {
    setGame(selectedGame);
  };

  const handleSelectNewProofFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingPhoto(true);
      setUploadError(null);
      const dataUrl = await compressAndReadImage(file);
      const defaultCat = game === 'MLBB' ? 'Hero & Skin' : 'Vault/Bundle Utama';
      const cleanFileName = file.name.replace(/\.[^/.]+$/, '').trim();
      const label = cleanFileName ? cleanFileName.slice(0, 35) : `Bukti Foto ${gallery.length + 1}`;

      setGallery((prev) => [
        ...prev,
        {
          category: defaultCat,
          url: dataUrl,
          label: label,
        },
      ]);
    } catch (err: any) {
      setUploadError(err.message || 'Gagal memproses file foto.');
    } finally {
      setIsUploadingPhoto(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleTriggerReplacePhoto = (index: number) => {
    setReplaceTargetIndex(index);
    if (replaceProofFileInputRef.current) {
      replaceProofFileInputRef.current.value = '';
      replaceProofFileInputRef.current.click();
    }
  };

  const handleSelectReplaceProofFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || replaceTargetIndex === null) return;

    try {
      setIsUploadingPhoto(true);
      setUploadError(null);
      const dataUrl = await compressAndReadImage(file);
      handleUpdateGalleryItem(replaceTargetIndex, 'url', dataUrl);
    } catch (err: any) {
      setUploadError(err.message || 'Gagal mengganti foto.');
    } finally {
      setIsUploadingPhoto(false);
      setReplaceTargetIndex(null);
      if (e.target) e.target.value = '';
    }
  };

  const handleSelectThumbnailFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingPhoto(true);
      setUploadError(null);
      const dataUrl = await compressAndReadImage(file);
      setThumbnail(dataUrl);
    } catch (err: any) {
      setUploadError(err.message || 'Gagal memproses thumbnail.');
    } finally {
      setIsUploadingPhoto(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleAddManualGalleryItem = () => {
    const defaultCat = game === 'MLBB' ? 'Hero & Skin' : 'Vault/Bundle Utama';
    setGallery((prev) => [
      ...prev,
      {
        category: defaultCat,
        url: thumbnail || DEFAULT_THUMBNAILS[game],
        label: `Bukti Foto ${prev.length + 1}`,
      },
    ]);
  };

  const handleUpdateGalleryItem = (index: number, field: keyof GalleryItem, value: string) => {
    setGallery((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  };

  const handleRemoveGalleryItem = (index: number) => {
    setGallery((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Form submission with strict validation and Firestore sync
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const trimmedTitle = title.trim();
    const price = parseRupiahInput(priceInput);

    // Validation checks
    if (!trimmedTitle) {
      setSubmitError('Judul Lapak Akun wajib diisi.');
      return;
    }

    if (!price || price <= 0) {
      setSubmitError('Harga Jual wajib diisi dengan nominal yang benar (minimal Rp 10.000).');
      return;
    }

    setIsSubmitting(true);

    const parsedCost = parseRupiahInput(costPriceInput);
    const costPrice = parsedCost && parsedCost > 0 ? parsedCost : Math.round(price * 0.7);
    const finalThumbnail = thumbnail.trim() || DEFAULT_THUMBNAILS[game];

    const accountData: any = {
      id: initialAccount ? initialAccount.id : `${game === 'MLBB' ? 'ML' : 'FF'}-${Date.now().toString().slice(-4)}`,
      game,
      title: trimmedTitle,
      price,
      costPrice,
      stock: Number(stock) || 0,
      status: Number(stock) <= 0 ? 'SOLD_OUT' : status,
      isNego,
      whatsappNumber: whatsappNumber.trim() || '085717046895',
      rating: initialAccount ? initialAccount.rating : 5.0,
      soldCount: initialAccount ? initialAccount.soldCount : 0,
      thumbnail: finalThumbnail,
      gallery:
        gallery.length > 0
          ? gallery
          : [
              {
                category: game === 'MLBB' ? 'Profil & Winrate' : 'Profil & Level',
                url: finalThumbnail,
                label: 'Tangkapan Layar Akun Utama',
              },
            ],
      notes: notes.trim(),
    };

    if (game === 'MLBB') {
      accountData.mlSpecs = {
        rank: mlRank.trim() || '-',
        totalHero: mlTotalHero ? Number(mlTotalHero) : 0,
        totalSkin: mlTotalSkin ? Number(mlTotalSkin) : 0,
        rareSkins: mlRareSkins ? mlRareSkins.split(',').map((s) => s.trim()).filter(Boolean) : [],
        emblem: mlEmblem.trim() || '-',
        bindStatus: mlBind.trim() || 'Moonton Sepaket',
        winrate: mlWinrate.trim() || '-',
      };
    } else {
      accountData.ffSpecs = {
        level: ffLevel ? Number(ffLevel) : 0,
        elitePass: ffElitePass.trim() || '-',
        mainBundles: ffMainBundles ? ffMainBundles.split(',').map((s) => s.trim()).filter(Boolean) : [],
        evoGuns: ffEvoGuns ? ffEvoGuns.split(',').map((s) => s.trim()).filter(Boolean) : [],
        bindStatus: ffBind.trim() || 'FB Only',
        vaultCount: ffVaultCount ? Number(ffVaultCount) : 0,
      };
    }

    try {
      await onSave(accountData);
      setIsSubmitting(false);

      showToast({
        type: 'success',
        title: isEditing ? 'Data Berhasil Diperbarui' : 'Lapak Berhasil Ditambahkan',
        message: isEditing
          ? `Perubahan akun "${accountData.title}" (${accountData.id}) berhasil disimpan ke database real-time.`
          : `Lapak akun "${accountData.title}" (${accountData.id}) berhasil ditambahkan dan disinkronkan ke katalog.`,
      });

      // Auto-close modal directly and reset form back to clean state
      resetForm();
      onClose();
    } catch (err: any) {
      console.error('Error saving account to Firestore:', err);
      const errorMsg = err?.message || 'Gagal menyimpan data ke Firestore database. Silakan coba lagi.';
      setSubmitError(errorMsg);
      setIsSubmitting(false);

      showToast({
        type: 'error',
        title: 'Gagal Menyimpan Lapak',
        message: errorMsg,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                {isEditing ? `Edit Lapak: ${initialAccount?.id}` : 'Tambah Lapak Baru'}
              </h3>
              <p className="text-xs text-slate-400">
                Formulir katalog akun game dengan sinkronisasi database real-time
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Unsaved Changes Banner (State Dirty Check Indicator) */}
        {isEditing && (
          <div
            className={`px-5 py-2.5 border-b text-xs flex items-center justify-between transition-colors ${
              isDirty
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                : 'bg-slate-950/80 border-slate-800 text-slate-400'
            }`}
          >
            <div className="flex items-center gap-2">
              {isDirty ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  <span className="font-bold text-amber-200">Perubahan Terdeteksi (Unsaved Changes)</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Semua data input saat ini sinkron dengan server</span>
                </>
              )}
            </div>
            <span className="text-[11px] font-medium hidden sm:inline">
              {isDirty ? 'Tombol "Simpan Perubahan" telah aktif di bawah' : 'Belum ada input yang diubah'}
            </span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          {/* Submission Error Banner if any */}
          {submitError && (
            <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/50 flex items-start gap-2.5 text-xs text-red-200 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">
                <span className="font-bold text-red-300">Peringatan Validasi / Error: </span>
                {submitError}
              </div>
            </div>
          )}

          {/* Section 1: Kategori Game */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              1. Pilih Kategori Game (Otomatis Pasang Logo Resmi)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleGameSwitch('MLBB')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-bold transition-all ${
                  game === 'MLBB'
                    ? 'bg-blue-950/90 border-blue-500 text-blue-200 ring-2 ring-blue-500/30'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <MLBBLogo className="w-6 h-6" />
                <span>Mobile Legends (MLBB)</span>
              </button>

              <button
                type="button"
                onClick={() => handleGameSwitch('FREE_FIRE')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border font-bold transition-all ${
                  game === 'FREE_FIRE'
                    ? 'bg-orange-950/90 border-orange-500 text-amber-200 ring-2 ring-orange-500/30'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <FreeFireLogo className="w-6 h-6" />
                <span>Garena Free Fire (FF)</span>
              </button>
            </div>
          </div>

          {/* Section 2: Judul Lapak */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300">
              2. Judul Lapak Akun <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Akun MLBB Mythic Glory 85★ Skin Collector Lengkap"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Section 3: Spesifikasi Item Game */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5 text-xs uppercase tracking-wider">
                <Gamepad2 className="w-4 h-4 text-orange-400" />
                <span>3. Spesifikasi Detail {game === 'MLBB' ? 'Mobile Legends' : 'Free Fire'}</span>
              </span>
              <span className="text-[11px] text-slate-400">
                Kolom kosong secara default (Isi sesuai profil akun)
              </span>
            </div>

            {game === 'MLBB' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Rank Saat Ini</label>
                  <input
                    type="text"
                    value={mlRank}
                    onChange={(e) => setMlRank(e.target.value)}
                    placeholder="Contoh: Mythic Glory 85★"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Winrate Akun</label>
                  <input
                    type="text"
                    value={mlWinrate}
                    onChange={(e) => setMlWinrate(e.target.value)}
                    placeholder="Contoh: 68.4% All Seasons"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Total Hero</label>
                  <input
                    type="number"
                    min="0"
                    value={mlTotalHero}
                    onChange={(e) => setMlTotalHero(e.target.value)}
                    placeholder="Contoh: 105"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Total Skin</label>
                  <input
                    type="number"
                    min="0"
                    value={mlTotalSkin}
                    onChange={(e) => setMlTotalSkin(e.target.value)}
                    placeholder="Contoh: 135"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Daftar Skin Utama / Koleksi Langka (Pisahkan dengan tanda koma)
                  </label>
                  <input
                    type="text"
                    value={mlRareSkins}
                    onChange={(e) => setMlRareSkins(e.target.value)}
                    placeholder="Contoh: Skin Collector Gusion, Skin Legend Granger, Skin KOF Chou"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Emblem Level</label>
                  <input
                    type="text"
                    value={mlEmblem}
                    onChange={(e) => setMlEmblem(e.target.value)}
                    placeholder="Contoh: Max All Emblem Level 60"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Status Bind / Login</label>
                  <input
                    type="text"
                    value={mlBind}
                    onChange={(e) => setMlBind(e.target.value)}
                    placeholder="Contoh: Moonton Sepaket (Email Bersih)"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Level Akun</label>
                  <input
                    type="number"
                    min="0"
                    value={ffLevel}
                    onChange={(e) => setFfLevel(e.target.value)}
                    placeholder="Contoh: 70"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Elite Pass / Badge</label>
                  <input
                    type="text"
                    value={ffElitePass}
                    onChange={(e) => setFfElitePass(e.target.value)}
                    placeholder="Contoh: Season 1 Sakura & S2 Hip Hop Old"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Total Item Vault</label>
                  <input
                    type="number"
                    min="0"
                    value={ffVaultCount}
                    onChange={(e) => setFfVaultCount(e.target.value)}
                    placeholder="Contoh: 350"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Status Bind / Login</label>
                  <input
                    type="text"
                    value={ffBind}
                    onChange={(e) => setFfBind(e.target.value)}
                    placeholder="Contoh: FB Only / Unbind All"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Vault / Bundle Utama (Pisahkan dengan koma)
                  </label>
                  <input
                    type="text"
                    value={ffMainBundles}
                    onChange={(e) => setFfMainBundles(e.target.value)}
                    placeholder="Contoh: Bundle Criminal Merah, Sakura Set, Bandit Set"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Skin Senjata Utama / Evo Gun (Pisahkan dengan koma)
                  </label>
                  <input
                    type="text"
                    value={ffEvoGuns}
                    onChange={(e) => setFfEvoGuns(e.target.value)}
                    placeholder="Contoh: M1014 Apocalyptic Max, AK Blue Flame Draco Lv 7"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Harga Jual, Modal & Stok */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Harga Jual (Rp) <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  Rp
                </span>
                <input
                  type="text"
                  value={priceInput}
                  onChange={(e) => {
                    const parsed = parseRupiahInput(e.target.value);
                    setPriceInput(parsed ? formatNumber(parsed) : '');
                  }}
                  placeholder="Contoh: 350.000"
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-orange-400 font-bold font-mono text-sm placeholder-slate-500 focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-300">
                  Harga Beli / Modal (COGS)
                </label>
                <span className="text-[10px] text-amber-400 font-semibold">Khusus Penjual</span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  Rp
                </span>
                <input
                  type="text"
                  value={costPriceInput}
                  onChange={(e) => {
                    const parsed = parseRupiahInput(e.target.value);
                    setCostPriceInput(parsed ? formatNumber(parsed) : '');
                  }}
                  placeholder="Contoh: 220.000"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-blue-300 font-bold font-mono text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Jumlah Stok
              </label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setStock(isNaN(val) ? 0 : val);
                  if (val <= 0) setStatus('SOLD_OUT');
                  else if (status === 'SOLD_OUT') setStatus('READY');
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Status Ketersediaan
              </label>
              <select
                value={status}
                onChange={(e) => {
                  const val = e.target.value as AccountStatus;
                  setStatus(val);
                  if (val === 'SOLD_OUT' && stock > 0) setStock(0);
                  if (val === 'READY' && stock === 0) setStock(1);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-orange-500"
              >
                <option value="READY">🟢 READY (Tersedia)</option>
                <option value="SOLD_OUT">🔴 SOLD OUT (Habis)</option>
                <option value="BOOKED">🟡 BOOKED (Dipesan)</option>
              </select>
            </div>
          </div>

          {/* Section 5: Thumbnail & Gallery Photos */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  5. Foto Screenshot Akun & Bukti Lengkap
                </label>
                <p className="text-[11px] text-slate-400">
                  Unggah tangkapan layar akun langsung dari galeri HP atau tempel URL gambar
                </p>
              </div>

              {/* Hidden file inputs */}
              <input
                type="file"
                ref={thumbnailFileInputRef}
                onChange={handleSelectThumbnailFile}
                accept="image/*"
                className="hidden"
              />
              <input
                type="file"
                ref={newProofFileInputRef}
                onChange={handleSelectNewProofFile}
                accept="image/*"
                className="hidden"
              />
              <input
                type="file"
                ref={replaceProofFileInputRef}
                onChange={handleSelectReplaceProofFile}
                accept="image/*"
                className="hidden"
              />
            </div>

            {uploadError && (
              <div className="p-2.5 rounded-lg bg-red-950/80 border border-red-500/50 text-red-300 text-xs">
                {uploadError}
              </div>
            )}

            {/* Thumbnail Preview & Picker */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-orange-400" />
                <span>Foto Sampul Utama (Thumbnail Depan Katalog)</span>
              </span>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="relative w-28 h-18 rounded-lg overflow-hidden bg-slate-900 border border-slate-700 shrink-0">
                  <img
                    src={thumbnail || DEFAULT_THUMBNAILS[game]}
                    alt="Thumbnail Preview"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 w-full space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => thumbnailFileInputRef.current?.click()}
                      disabled={isUploadingPhoto}
                      className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploadingPhoto ? 'Memproses...' : 'Pilih Foto dari Galeri'}</span>
                    </button>
                    <span className="text-[11px] text-slate-400">atau masukkan URL langsung:</span>
                  </div>
                  <input
                    type="text"
                    value={thumbnail}
                    onChange={(e) => setThumbnail(e.target.value)}
                    placeholder="https://... atau biarkan menggunakan gambar bawaan"
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-orange-500 truncate"
                  />
                </div>
              </div>
            </div>

            {/* Gallery Screenshots List */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-bold text-slate-300">
                Foto Bukti Tambahan ({gallery.length} foto)
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => newProofFileInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Camera className="w-3.5 h-3.5 text-orange-400" />
                  <span>+ Upload Foto Bukti Baru</span>
                </button>
                <button
                  type="button"
                  onClick={handleAddManualGalleryItem}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-semibold transition-colors"
                >
                  + Tambah Manual
                </button>
              </div>
            </div>

            {gallery.length > 0 && (
              <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {gallery.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="relative w-16 h-12 rounded-lg overflow-hidden bg-slate-900 border border-slate-700 shrink-0">
                          <img
                            src={item.url || DEFAULT_THUMBNAILS[game]}
                            alt={item.label || `Foto ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block">
                            Foto Bukti #{idx + 1}
                          </span>
                          <span className="text-[11px] text-slate-400 block truncate max-w-[180px] sm:max-w-xs">
                            {item.label || item.category || 'Bukti Screenshot'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleTriggerReplacePhoto(idx)}
                            className="mt-1 inline-flex items-center gap-1 text-[11px] text-orange-400 hover:text-orange-300 font-semibold cursor-pointer transition-colors"
                          >
                            <Camera className="w-3 h-3" />
                            <span>Ganti Foto Galeri</span>
                          </button>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryItem(idx)}
                        className="px-2.5 py-1.5 rounded-lg bg-red-950/50 hover:bg-red-900/80 border border-red-800/50 text-red-300 hover:text-white transition-all flex items-center gap-1 text-xs font-semibold"
                        title="Hapus foto ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-900">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-0.5">
                          Kategori Foto
                        </label>
                        <input
                          type="text"
                          value={item.category}
                          onChange={(e) => handleUpdateGalleryItem(idx, 'category', e.target.value)}
                          placeholder="Contoh: Profil / Skin / Vault"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-0.5">
                          Keterangan / Judul Foto
                        </label>
                        <input
                          type="text"
                          value={item.label}
                          onChange={(e) => handleUpdateGalleryItem(idx, 'label', e.target.value)}
                          placeholder="Contoh: Koleksi Skin Collector & KOF"
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 6: Catatan Penjual */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-300">
              6. Catatan Tambahan Penjual
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Akun tangan pertama, data Moonton sepaket bisa diubah ke email pembeli. Anti hackback bergaransi seumur hidup."
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-orange-500"
            ></textarea>
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="text-xs">
              {isEditing ? (
                isDirty ? (
                  <div className="flex items-center gap-2 text-amber-400 font-semibold animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    <span>Ada perubahan input yang belum disimpan</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Formulir sinkron (Belum ada perubahan)</span>
                  </div>
                )
              ) : (
                <span className="text-slate-400 text-[11px]">
                  Isi judul dan harga jual untuk menambahkan lapak baru
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 font-semibold text-xs transition-colors min-h-[44px]"
              >
                Batal
              </button>

              <button
                type="submit"
                disabled={isSubmitting || (isEditing && !isDirty)}
                className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-white font-bold text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-2 min-h-[44px] ${
                  isEditing && !isDirty
                    ? 'bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed shadow-none opacity-60'
                    : 'bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 hover:from-orange-500 hover:to-amber-500 active:scale-95 shadow-orange-950 ring-2 ring-orange-500/40 cursor-pointer'
                }`}
                title={
                  isEditing && !isDirty
                    ? 'Ubah data untuk mengaktifkan tombol simpan'
                    : 'Kirim data lapak ke server Firestore real-time'
                }
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{isEditing ? 'Menyimpan Perubahan...' : 'Menambahkan Lapak...'}</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>
                      {isEditing
                        ? isDirty
                          ? 'Simpan Perubahan'
                          : 'Tidak Ada Perubahan'
                        : 'Tambah Lapak Baru'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
