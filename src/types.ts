export type GameType = 'MLBB' | 'FREE_FIRE';

export type AccountStatus = 'READY' | 'SOLD_OUT' | 'BOOKED';

export interface MLItemSpecs {
  rank: string;
  totalHero: number;
  totalSkin: number;
  rareSkins: string[];
  emblem: string;
  bindStatus: string;
  winrate?: string;
}

export interface FFItemSpecs {
  level: number;
  elitePass: string;
  mainBundles: string[];
  evoGuns: string[];
  bindStatus: string;
  vaultCount?: number;
}

export interface GalleryItem {
  category: string;
  url: string;
  label: string;
}

export interface SaleRecord {
  id: string;
  accountId: string;
  accountTitle: string;
  game: GameType;
  sellingPrice: number;
  costPrice: number;
  profit: number;
  date: number;
  buyerNote?: string;
}

export interface GameAccount {
  id: string;
  game: GameType;
  title: string;
  price: number; // Harga Jual
  costPrice?: number; // Harga Beli / Modal (COGS) - Hidden from buyers!
  discountPrice?: number; // Diskon / Harga Coret jika ada
  stock: number;
  status: AccountStatus;
  isNego: boolean;
  whatsappNumber: string; // e.g. 085717046895
  rating: number; // e.g. 4.9
  soldCount: number; // e.g. 42
  thumbnail: string;
  gallery: GalleryItem[];
  mlSpecs?: MLItemSpecs;
  ffSpecs?: FFItemSpecs;
  notes: string;
  createdAt: number;
  updatedAt: number;
}

export type FinancialPeriod = 'today' | 'week' | 'month' | 'year' | 'custom';

export type FilterGameOption = 'ALL' | 'MLBB' | 'FREE_FIRE';

export type SortOption = 'newest' | 'cheapest' | 'expensive' | 'popular';

export interface FilterState {
  game: FilterGameOption;
  searchQuery: string;
  priceRange: 'ALL' | 'UNDER_100K' | '100K_500K' | 'ABOVE_1M';
  onlyReady: boolean;
  sortBy: SortOption;
}
