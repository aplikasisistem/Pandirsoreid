import React, { useState, useEffect, useRef } from 'react';
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
} from 'lucide-react';
import { GameAccount, GameType, AccountStatus, GalleryItem } from '../types';
import { formatNumber, parseRupiahInput } from '../utils/formatter';
import { compressAndReadImage } from '../utils/imageUpload';
import { MLBBLogo, FreeFireLogo } from './GameBadges';

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

  // MLBB specific state
  const [mlRank, setMlRank] = useState('Mythic Glory');
  const [mlTotalHero, setMlTotalHero] = useState<number>(100);
  const [mlTotalSkin, setMlTotalSkin] = useState<number>(140);
  const [mlRareSkins, setMlRareSkins] = useState('Skin Collector Gusion, Skin Legend Granger, Skin KOF Chou');
  const [mlEmblem, setMlEmblem] = useState('Max All Emblem Level 60');
  const [mlBind, setMlBind] = useState('Moonton Sepaket Lengkap (Email Bersih)');
  const [mlWinrate, setMlWinrate] = useState('68% All Season');

  // FF specific state
  const [ffLevel, setFfLevel] = useState<number>(70);
  const [ffElitePass, setFfElitePass] = useState('Season 1 Sakura & S2 Hip Hop Old');
  const [ffMainBundles, setFfMainBundles] = useState('Bundle Criminal Merah, Sakura Set, Bandit Set');
  const [ffEvoGuns, setFfEvoGuns] = useState('M1014 Apocalyptic Max, AK Blue Flame Draco Lv 7');
  const [ffBind, setFfBind] = useState('FB Only / Unbind All');
  const [ffVaultCount, setFfVaultCount] = useState<number>(350);

  // Gallery items & upload state
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // File input refs for gallery & thumbnail upload
  const thumbnailFileInputRef = useRef<HTMLInputElement>(null);
  const newProofFileInputRef = useRef<HTMLInputElement>(null);
  const replaceProofFileInputRef = useRef<HTMLInputElement>(null);
  const [replaceTargetIndex, setReplaceTargetIndex] = useState<number | null>(null);

  // Initialize form when opening
  useEffect(() => {
    if (initialAccount) {
      setGame(initialAccount.game);
      setTitle(initialAccount.title);
      setPriceInput(formatNumber(initialAccount.price));
      setCostPriceInput(
        initialAccount.costPrice
          ? formatNumber(initialAccount.costPrice)
          : formatNumber(Math.round(initialAccount.price * 0.7))
      );
      setStock(initialAccount.stock);
      setStatus(initialAccount.status);
      setIsNego(initialAccount.isNego);
      setWhatsappNumber(initialAccount.whatsappNumber || '085717046895');
      setThumbnail(initialAccount.thumbnail);
      setNotes(initialAccount.notes || '');

      if (initialAccount.game === 'MLBB' && initialAccount.mlSpecs) {
        setMlRank(initialAccount.mlSpecs.rank || '');
        setMlTotalHero(initialAccount.mlSpecs.totalHero || 0);
        setMlTotalSkin(initialAccount.mlSpecs.totalSkin || 0);
        setMlRareSkins((initialAccount.mlSpecs.rareSkins || []).join(', '));
        setMlEmblem(initialAccount.mlSpecs.emblem || '');
        setMlBind(initialAccount.mlSpecs.bindStatus || '');
        setMlWinrate(initialAccount.mlSpecs.winrate || '');
      }

      if (initialAccount.game === 'FREE_FIRE' && initialAccount.ffSpecs) {
        setFfLevel(initialAccount.ffSpecs.level || 0);
        setFfElitePass(initialAccount.ffSpecs.elitePass || '');
        setFfMainBundles((initialAccount.ffSpecs.mainBundles || []).join(', '));
        setFfEvoGuns((initialAccount.ffSpecs.evoGuns || []).join(', '));
        setFfBind(initialAccount.ffSpecs.bindStatus || '');
        setFfVaultCount(initialAccount.ffSpecs.vaultCount || 200);
      }

      setGallery(initialAccount.gallery || []);
    } else {
      // Default new account template
      setGame('MLBB');
      setTitle('');
      setPriceInput('350.000');
      setStock(1);
      setStatus('READY');
      setIsNego(true);
      setWhatsappNumber('085717046895');
      setThumbnail(DEFAULT_THUMBNAILS.MLBB);
      setNotes('Akun aman 100%, data lengkap siap pindah tangan.');

      // Default ML specs
      setMlRank('Mythic Glory 50★');
      setMlTotalHero(105);
      setMlTotalSkin(135);
      setMlRareSkins('Skin Collector Gusion, Skin KOF Chou, Skin Epic Limited');
      setMlEmblem('Max All Emblem Level 60');
      setMlBind('Moonton Sepaket Lengkap (Email Bersih)');
      setMlWinrate('67% All Season');

      // Default gallery
      setGallery([
        {
          category: 'Profil & Winrate',
          url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
          label: 'Profil Akun & Statistik Winrate',
        },
        {
          category: 'Hero & Skin',
          url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80',
          label: 'Koleksi Hero & Skin Lengkap',
        },
      ]);
    }
  }, [initialAccount, isOpen]);

  // When game changes in create mode, switch default thumbnail and gallery categories
  const handleGameSwitch = (selectedGame: GameType) => {
    setGame(selectedGame);
    if (!isEditing) {
      setThumbnail(DEFAULT_THUMBNAILS[selectedGame]);
      if (selectedGame === 'FREE_FIRE') {
        setTitle('Akun FF Old Season 1 & 2 Bundle Criminal Merah Evo Gun Max');
        setGallery([
          {
            category: 'Profil & Level',
            url: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&q=80',
            label: 'Profil Level 72 & KD Master',
          },
          {
            category: 'Vault/Bundle Utama',
            url: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=80',
            label: 'Bundle Criminal Merah & Sakura S1',
          },
        ]);
      } else {
        setTitle('Akun MLBB Mythic Glory Skin Collector Hero Lengkap');
        setGallery([
          {
            category: 'Profil & Winrate',
            url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
            label: 'Profil Akun & WR 68%',
          },
          {
            category: 'Hero & Skin',
            url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80',
            label: 'Daftar Hero & Skin Koleksi',
          },
        ]);
      }
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const price = parseRupiahInput(priceInput);

    const accountData: any = {
      id: initialAccount ? initialAccount.id : `${game === 'MLBB' ? 'ML' : 'FF'}-${Math.floor(100 + Math.random() * 900)}`,
      game,
      title: title.trim() || `Akun ${game} Sultan Siap Pakai`,
      price: price > 0 ? price : 100000,
      costPrice: parseRupiahInput(costPriceInput) || Math.round((price > 0 ? price : 100000) * 0.7),
      stock: Number(stock) || 0,
      status: Number(stock) <= 0 ? 'SOLD_OUT' : status,
      isNego,
      whatsappNumber: whatsappNumber.trim() || '085717046895',
      rating: initialAccount ? initialAccount.rating : 4.9,
      soldCount: initialAccount ? initialAccount.soldCount : Math.floor(20 + Math.random() * 40),
      thumbnail: thumbnail.trim() || DEFAULT_THUMBNAILS[game],
      gallery: gallery.length > 0 ? gallery : [
        {
          category: game === 'MLBB' ? 'Profil & Winrate' : 'Profil & Level',
          url: thumbnail.trim() || DEFAULT_THUMBNAILS[game],
          label: 'Tangkapan Layar Akun Utama',
        }
      ],
      notes: notes.trim(),
    };

    if (game === 'MLBB') {
      accountData.mlSpecs = {
        rank: mlRank.trim() || 'Mythic',
        totalHero: Number(mlTotalHero) || 0,
        totalSkin: Number(mlTotalSkin) || 0,
        rareSkins: mlRareSkins.split(',').map((s) => s.trim()).filter(Boolean),
        emblem: mlEmblem.trim() || 'All Emblem Max 60',
        bindStatus: mlBind.trim() || 'Moonton Sepaket',
        winrate: mlWinrate.trim() || '65%',
      };
    } else {
      accountData.ffSpecs = {
        level: Number(ffLevel) || 0,
        elitePass: ffElitePass.trim() || 'Season Old',
        mainBundles: ffMainBundles.split(',').map((s) => s.trim()).filter(Boolean),
        evoGuns: ffEvoGuns.split(',').map((s) => s.trim()).filter(Boolean),
        bindStatus: ffBind.trim() || 'FB Unbind All',
        vaultCount: Number(ffVaultCount) || 200,
      };
    }

    try {
      await onSave(accountData);
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
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
                Formulir katalog e-commerce Itemku style dengan update real-time
              </p>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
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
              2. Judul Lapak Akun
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Akun MLBB Mythic Glory Skin Collector Hero Lengkap"
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
              <span className="text-[11px] text-amber-400 font-medium">
                Sesuaikan dengan item akun
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
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Winrate Akun</label>
                  <input
                    type="text"
                    value={mlWinrate}
                    onChange={(e) => setMlWinrate(e.target.value)}
                    placeholder="Contoh: 68.4% All Seasons"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Total Hero</label>
                  <input
                    type="number"
                    value={mlTotalHero}
                    onChange={(e) => setMlTotalHero(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Total Skin</label>
                  <input
                    type="number"
                    value={mlTotalSkin}
                    onChange={(e) => setMlTotalSkin(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
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
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Emblem Level</label>
                  <input
                    type="text"
                    value={mlEmblem}
                    onChange={(e) => setMlEmblem(e.target.value)}
                    placeholder="Contoh: Max All Emblem Level 60"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Status Bind/Login</label>
                  <input
                    type="text"
                    value={mlBind}
                    onChange={(e) => setMlBind(e.target.value)}
                    placeholder="Contoh: Moonton Sepaket (Email Bersih)"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Level Akun</label>
                  <input
                    type="number"
                    value={ffLevel}
                    onChange={(e) => setFfLevel(Number(e.target.value))}
                    placeholder="Contoh: 70"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Elite Pass / Badge</label>
                  <input
                    type="text"
                    value={ffElitePass}
                    onChange={(e) => setFfElitePass(e.target.value)}
                    placeholder="Contoh: Season 1 Sakura & S2 Hip Hop Old"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Total Item Vault</label>
                  <input
                    type="number"
                    value={ffVaultCount}
                    onChange={(e) => setFfVaultCount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Status Bind/Login</label>
                  <input
                    type="text"
                    value={ffBind}
                    onChange={(e) => setFfBind(e.target.value)}
                    placeholder="Contoh: FB Only / Unbind All"
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
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
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
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
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Harga Jual, Modal & Stok */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Harga Jual (Rp)
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
                  placeholder="350.000"
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-orange-400 font-bold font-mono text-sm focus:outline-none focus:border-orange-500"
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
                  placeholder="220.000"
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-blue-300 font-bold font-mono text-sm focus:outline-none focus:border-blue-500"
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
                onChange={(e) => setStatus(e.target.value as AccountStatus)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-orange-500 cursor-pointer"
              >
                <option value="READY">Ready (Siap Kirim)</option>
                <option value="SOLD_OUT">Sold Out (Terjual)</option>
                <option value="BOOKED">Booked (Dipesan)</option>
              </select>
            </div>
          </div>

          {/* Live Profit Margin Preview */}
          {(() => {
            const sell = parseRupiahInput(priceInput);
            const cost = parseRupiahInput(costPriceInput);
            const profit = sell - cost;
            const marginPct = sell > 0 ? Math.round((profit / sell) * 100) : 0;
            return (
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Estimasi Margin Laba Produk:</span>
                <span
                  className={`font-mono font-bold ${
                    profit >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {profit >= 0 ? '+' : ''}
                  {formatNumber(profit)} ({marginPct}%)
                </span>
              </div>
            );
          })()}

          {/* Toggle Nego & WhatsApp */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <input
                type="checkbox"
                id="isNegoCheckbox"
                checked={isNego}
                onChange={(e) => setIsNego(e.target.checked)}
                className="w-4 h-4 rounded text-orange-500 accent-orange-500 cursor-pointer"
              />
              <label htmlFor="isNegoCheckbox" className="text-xs text-slate-300 font-semibold cursor-pointer">
                Izinkan Pembeli Nego Harga (Minimal 70% dari harga buka)
              </label>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Nomor WhatsApp Penjual (Utama: 085717046895)
              </label>
              <input
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="085717046895"
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Section 5: Galeri Foto Screenshot */}
          <div className="space-y-3">
            {/* Hidden File Inputs for Device Gallery Selection */}
            <input
              ref={newProofFileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="hidden"
              onChange={handleSelectNewProofFile}
            />
            <input
              ref={replaceProofFileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="hidden"
              onChange={handleSelectReplaceProofFile}
            />
            <input
              ref={thumbnailFileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="hidden"
              onChange={handleSelectThumbnailFile}
            />

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  5. Foto Utama &amp; Galeri Screenshot Bukti
                </label>
                <span className="text-[11px] text-slate-400">
                  Pilih foto langsung dari galeri HP / file komputer (JPG, PNG, WEBP)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => newProofFileInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 active:scale-95 text-white text-xs font-bold transition-all shadow-md shadow-orange-950 disabled:opacity-50 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>+ Tambah Foto Bukti</span>
                </button>
                <button
                  type="button"
                  onClick={handleAddManualGalleryItem}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                  title="Tambah baris manual untuk memasukkan URL eksternal"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Via URL</span>
                </button>
              </div>
            </div>

            {/* Thumbnail Section */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-300">
                  Foto Thumbnail Depan (Cover Katalog)
                </label>
                <button
                  type="button"
                  onClick={() => thumbnailFileInputRef.current?.click()}
                  className="flex items-center gap-1 text-[11px] font-bold text-cyan-400 hover:text-cyan-300 cursor-pointer transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Pilih dari Galeri</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                {/* Thumbnail Preview */}
                <div
                  onClick={() => thumbnailFileInputRef.current?.click()}
                  className="w-20 h-16 sm:w-24 sm:h-18 rounded-lg bg-slate-900 border border-slate-700 overflow-hidden shrink-0 relative group cursor-pointer shadow-md"
                  title="Klik untuk memilih foto cover dari galeri HP"
                >
                  <img
                    src={thumbnail || DEFAULT_THUMBNAILS[game]}
                    alt="Thumbnail Depan"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = DEFAULT_THUMBNAILS[game];
                    }}
                  />
                  <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-semibold gap-1">
                    <Camera className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Ganti</span>
                  </div>
                </div>

                <div className="flex-1 space-y-1">
                  <input
                    type="text"
                    value={thumbnail}
                    onChange={(e) => setThumbnail(e.target.value)}
                    placeholder="https://... atau klik tombol Pilih dari Galeri"
                    required
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-orange-500"
                  />
                  <p className="text-[10px] text-slate-400">
                    Foto ini akan tampil sebagai sampul kartu produk di halaman depan pembeli.
                  </p>
                </div>
              </div>
            </div>

            {/* Uploading indicator & Error feedback */}
            {isUploadingPhoto && (
              <div className="p-2.5 rounded-lg bg-orange-950/60 border border-orange-500/50 text-orange-300 text-xs flex items-center gap-2 animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Memproses dan mengompres foto dari galeri perangkat...</span>
              </div>
            )}

            {uploadError && (
              <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-500/50 text-red-300 text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{uploadError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setUploadError(null)}
                  className="text-red-400 hover:text-white p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Gallery items list */}
            {gallery.length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 text-center space-y-2">
                <ImageIcon className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">
                  Belum ada foto bukti screenshot akun.
                </p>
                <button
                  type="button"
                  onClick={() => newProofFileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 border border-orange-500/30 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Foto Bukti Sekarang</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {gallery.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors space-y-2.5"
                  >
                    {/* Card Top: Thumbnail + Info + Actions */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {/* Clickable Thumbnail with replace overlay */}
                        <div
                          onClick={() => handleTriggerReplacePhoto(idx)}
                          className="w-20 h-16 sm:w-24 sm:h-18 rounded-lg bg-slate-900 border border-slate-700 overflow-hidden shrink-0 relative group cursor-pointer shadow-md"
                          title="Klik untuk mengganti foto ini dari galeri"
                        >
                          <img
                            src={item.url}
                            alt={item.label || `Foto Bukti #${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = DEFAULT_THUMBNAILS[game];
                            }}
                          />
                          <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-semibold gap-1">
                            <Camera className="w-3.5 h-3.5 text-orange-400" />
                            <span>Ganti</span>
                          </div>
                          <span className="absolute bottom-1 left-1 px-1 py-0.2 rounded bg-black/75 text-[9px] font-bold text-white">
                            #{idx + 1}
                          </span>
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

                      {/* Delete button with full click response */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemoveGalleryItem(idx);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-red-950/50 hover:bg-red-900/80 border border-red-800/50 text-red-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer active:scale-95 shrink-0 min-h-[34px]"
                        title={`Hapus foto bukti #${idx + 1}`}
                        aria-label={`Hapus foto bukti #${idx + 1}`}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        <span>Hapus</span>
                      </button>
                    </div>

                    {/* Card Inputs: Category, Label, and Image URL */}
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
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-orange-500"
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
                          className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-orange-500"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-bold text-slate-400 mb-0.5">
                          URL / Sumber File Gambar
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={item.url}
                            onChange={(e) => handleUpdateGalleryItem(idx, 'url', e.target.value)}
                            placeholder="https://... atau hasil upload foto galeri"
                            className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 font-mono focus:outline-none focus:border-orange-500 truncate"
                          />
                          <button
                            type="button"
                            onClick={() => handleTriggerReplacePhoto(idx)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-semibold whitespace-nowrap cursor-pointer shrink-0 transition-colors"
                            title="Pilih file foto baru dari galeri untuk item ini"
                          >
                            Pilih File Baru
                          </button>
                        </div>
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
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors min-h-[44px]"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-orange-950 transition-all flex items-center gap-2 min-h-[44px]"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Menyimpan ke Database...' : 'Simpan Perubahan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
