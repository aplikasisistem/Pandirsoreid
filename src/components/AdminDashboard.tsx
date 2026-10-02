import React, { useState, useEffect, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Printer,
  FileSpreadsheet,
  FileText,
  Filter,
  ArrowUpRight,
  ShieldCheck,
  Search,
  CheckCircle2,
  PieChart,
  Layers,
  ArrowLeft,
  Sparkles,
  ShoppingBag,
  RefreshCw,
  Clock,
  ChevronDown,
} from 'lucide-react';
import { GameAccount, SaleRecord } from '../types';
import { realtimeSync } from '../services/realtimeSync';
import { formatRupiah, formatNumber } from '../utils/formatter';
import { MLBBLogo, FreeFireLogo } from './GameBadges';
import { PandirStoreEmblem } from './PandirStoreLogo';

export type AdminDateRange = 'daily' | 'weekly' | 'monthly' | 'all' | 'custom';

export interface AdminDashboardProps {
  initialAccounts?: GameAccount[];
  initialSalesRecords?: SaleRecord[];
  onBackToKatalog?: () => void;
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  initialAccounts,
  initialSalesRecords,
  onBackToKatalog,
}) => {
  // Real-time state fetched directly from the database service
  const [accounts, setAccounts] = useState<GameAccount[]>(
    initialAccounts || realtimeSync.getAccounts()
  );
  const [salesRecords, setSalesRecords] = useState<SaleRecord[]>(
    initialSalesRecords || realtimeSync.getSalesRecords()
  );
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Filters
  const [dateRange, setDateRange] = useState<AdminDateRange>('monthly');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [selectedGame, setSelectedGame] = useState<'ALL' | 'MLBB' | 'FREE_FIRE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all_accounts' | 'sales_ledger'>('all_accounts');

  // Subscribe to real-time database updates
  useEffect(() => {
    if (initialAccounts) setAccounts(initialAccounts);
  }, [initialAccounts]);

  useEffect(() => {
    if (initialSalesRecords) setSalesRecords(initialSalesRecords);
  }, [initialSalesRecords]);

  useEffect(() => {
    setIsLoading(true);

    const unsubscribeAccounts = realtimeSync.subscribe((latestAccounts) => {
      setAccounts(latestAccounts);
      setLastUpdated(new Date());
      setIsLoading(false);
    });

    const unsubscribeSales = realtimeSync.subscribeSales((latestSales) => {
      setSalesRecords(latestSales);
      setLastUpdated(new Date());
    });

    return () => {
      unsubscribeAccounts();
      unsubscribeSales();
    };
  }, []);

  // Filter accounts based on date range, game, and search query
  const filteredAccounts = useMemo(() => {
    const now = Date.now();
    return accounts.filter((acc) => {
      // 1. Date Range Filter (based on account createdAt or updatedAt)
      const timestamp = acc.updatedAt || acc.createdAt || now;

      if (dateRange === 'daily') {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        if (timestamp < startOfToday.getTime()) return false;
      } else if (dateRange === 'weekly') {
        if (timestamp < now - ONE_DAY_MS * 7) return false;
      } else if (dateRange === 'monthly') {
        if (timestamp < now - ONE_DAY_MS * 30) return false;
      } else if (dateRange === 'custom') {
        if (customStartDate) {
          const startMs = new Date(customStartDate).getTime();
          if (timestamp < startMs) return false;
        }
        if (customEndDate) {
          const endMs = new Date(customEndDate).getTime() + ONE_DAY_MS - 1;
          if (timestamp > endMs) return false;
        }
      }

      // 2. Game Filter
      if (selectedGame !== 'ALL' && acc.game !== selectedGame) {
        return false;
      }

      // 3. Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = acc.title.toLowerCase().includes(q);
        const matchId = acc.id.toLowerCase().includes(q);
        if (!matchTitle && !matchId) return false;
      }

      return true;
    });
  }, [accounts, dateRange, customStartDate, customEndDate, selectedGame, searchQuery]);

  // Filter Sales Records for ledger
  const filteredSales = useMemo(() => {
    const now = Date.now();
    return salesRecords.filter((record) => {
      if (dateRange === 'daily') {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        if (record.date < startOfToday.getTime()) return false;
      } else if (dateRange === 'weekly') {
        if (record.date < now - ONE_DAY_MS * 7) return false;
      } else if (dateRange === 'monthly') {
        if (record.date < now - ONE_DAY_MS * 30) return false;
      } else if (dateRange === 'custom') {
        if (customStartDate) {
          const startMs = new Date(customStartDate).getTime();
          if (record.date < startMs) return false;
        }
        if (customEndDate) {
          const endMs = new Date(customEndDate).getTime() + ONE_DAY_MS - 1;
          if (record.date > endMs) return false;
        }
      }

      if (selectedGame !== 'ALL' && record.game !== selectedGame) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = record.accountTitle.toLowerCase().includes(q);
        const matchId = record.id.toLowerCase().includes(q) || record.accountId.toLowerCase().includes(q);
        if (!matchTitle && !matchId) return false;
      }

      return true;
    });
  }, [salesRecords, dateRange, customStartDate, customEndDate, selectedGame, searchQuery]);

  // Real-Time Financial Calculations:
  // 1. Total Revenue = Sum(Harga Jual * Jumlah Terjual)
  const totalRevenue = useMemo(() => {
    // Calculated across filtered accounts based on soldCount and selling price
    const fromAccounts = filteredAccounts.reduce((sum, acc) => {
      const units = acc.soldCount || (acc.status === 'SOLD_OUT' ? 1 : 0);
      return sum + acc.price * units;
    }, 0);

    // If sales records exist in this period, we incorporate their direct ledger revenue
    const fromSalesLedger = filteredSales.reduce((sum, s) => sum + s.sellingPrice, 0);

    return Math.max(fromAccounts, fromSalesLedger);
  }, [filteredAccounts, filteredSales]);

  // 2. Total Costs (COGS / Harga Beli Modal) = Sum(Harga Modal * Jumlah Terjual)
  const totalCOGS = useMemo(() => {
    const fromAccounts = filteredAccounts.reduce((sum, acc) => {
      const cost = acc.costPrice ?? Math.round(acc.price * 0.7);
      const units = acc.soldCount || (acc.status === 'SOLD_OUT' ? 1 : 0);
      return sum + cost * units;
    }, 0);

    const fromSalesLedger = filteredSales.reduce((sum, s) => sum + s.costPrice, 0);

    return Math.max(fromAccounts, fromSalesLedger);
  }, [filteredAccounts, filteredSales]);

  // 3. Net Profit = Total Revenue - Total COGS
  const netProfit = totalRevenue - totalCOGS;

  // 4. Net Profit Margin (%) = (Net Profit / Total Revenue) * 100
  const profitMarginPercent = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0.0';

  // 5. Active Inventory Assets Valuation
  const inventoryStats = useMemo(() => {
    const readyAccounts = filteredAccounts.filter((a) => a.status === 'READY');
    const totalReadyValue = readyAccounts.reduce((sum, a) => sum + a.price, 0);
    const totalReadyCost = readyAccounts.reduce(
      (sum, a) => sum + (a.costPrice ?? Math.round(a.price * 0.7)),
      0
    );
    return {
      readyCount: readyAccounts.length,
      totalReadyValue,
      totalReadyCost,
      potentialProfit: totalReadyValue - totalReadyCost,
    };
  }, [filteredAccounts]);

  // Export to Excel / CSV
  const handleExportExcelCSV = () => {
    const headers = [
      'ID Akun',
      'Game',
      'Judul Lapak Akun',
      'Status Stok',
      'Unit Terjual',
      'Harga Beli Modal (COGS)',
      'Harga Jual (Revenue)',
      'Total Penjualan',
      'Total Modal',
      'Laba Bersih (Net Profit)',
      'Margin (%)',
      'Tanggal Diperbarui',
    ];

    const rows = filteredAccounts.map((acc) => {
      const cost = acc.costPrice ?? Math.round(acc.price * 0.7);
      const units = acc.soldCount || (acc.status === 'SOLD_OUT' ? 1 : 0);
      const accRevenue = acc.price * units;
      const accCost = cost * units;
      const accProfit = accRevenue - accCost;
      const margin = accRevenue > 0 ? Math.round((accProfit / accRevenue) * 100) : 0;

      return [
        acc.id,
        acc.game === 'MLBB' ? 'Mobile Legends' : 'Free Fire',
        `"${acc.title.replace(/"/g, '""')}"`,
        acc.status,
        units,
        cost,
        acc.price,
        accRevenue,
        accCost,
        accProfit,
        `${margin}%`,
        `"${new Date(acc.updatedAt || acc.createdAt).toLocaleString('id-ID')}"`,
      ];
    });

    // Summary totals row
    const totalsRow = [
      'TOTAL REKAPITULASI',
      '-',
      `"Periode: ${dateRange.toUpperCase()}"`,
      '-',
      filteredAccounts.reduce((sum, a) => sum + (a.soldCount || (a.status === 'SOLD_OUT' ? 1 : 0)), 0),
      '-',
      '-',
      totalRevenue,
      totalCOGS,
      netProfit,
      `${profitMarginPercent}%`,
      `"${new Date().toLocaleString('id-ID')}"`,
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(',')), totalsRow.join(',')].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Laporan_Keuangan_PANDIRSTORE_${dateRange}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to PDF / Print Report
  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header Bar with Export & Live DB Sync Badge */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          {onBackToKatalog && (
            <button
              onClick={onBackToKatalog}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Kembali"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 p-[2px] flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <PandirStoreEmblem className="w-6 h-6" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-white tracking-tight">
                Admin Dashboard Keuangan &amp; Laba Rugi
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-bold border border-orange-500/30 uppercase tracking-wider">
                Real-Time DB
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span>Rekapitulasi otomatis Total Penjualan, Total Modal (COGS), dan Laba Bersih.</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                Updated: {lastUpdated.toLocaleTimeString('id-ID')}
              </span>
            </p>
          </div>
        </div>

        {/* Action Export Buttons */}
        <div className="flex items-center gap-2 print:hidden">
          <button
            onClick={handleExportExcelCSV}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all shadow-md active:scale-95 min-h-[40px]"
            title="Download Laporan Format Excel / CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export Excel / CSV</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold transition-all shadow-md shadow-orange-950/40 active:scale-95 min-h-[40px]"
            title="Cetak atau Simpan sebagai PDF"
          >
            <Printer className="w-4 h-4" />
            <span>Export PDF / Print</span>
          </button>
        </div>
      </div>

      {/* Date Range & Filter Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3 print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Daily, Weekly, Monthly Filter Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs text-slate-400 font-bold mr-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-orange-400" />
              <span>Filter Periode:</span>
            </span>

            <button
              onClick={() => setDateRange('daily')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap min-h-[34px] ${
                dateRange === 'daily'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Harian (Daily)
            </button>

            <button
              onClick={() => setDateRange('weekly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap min-h-[34px] ${
                dateRange === 'weekly'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Mingguan (Weekly)
            </button>

            <button
              onClick={() => setDateRange('monthly')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap min-h-[34px] ${
                dateRange === 'monthly'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Bulanan (Monthly)
            </button>

            <button
              onClick={() => setDateRange('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap min-h-[34px] ${
                dateRange === 'all'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Semua (All Time)
            </button>

            <button
              onClick={() => setDateRange('custom')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap min-h-[34px] ${
                dateRange === 'custom'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Kustom Tanggal
            </button>
          </div>

          {/* Game Selection & Search */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setSelectedGame('ALL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  selectedGame === 'ALL' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setSelectedGame('MLBB')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                  selectedGame === 'MLBB' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <MLBBLogo className="w-3.5 h-3.5" />
                <span>MLBB</span>
              </button>
              <button
                onClick={() => setSelectedGame('FREE_FIRE')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                  selectedGame === 'FREE_FIRE' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                <FreeFireLogo className="w-3.5 h-3.5" />
                <span>FF</span>
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari ID / Judul..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 w-36 sm:w-44"
              />
            </div>
          </div>
        </div>

        {/* Custom Date Pickers when 'custom' is active */}
        {dateRange === 'custom' && (
          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-3 text-xs">
            <span className="text-slate-400 font-semibold">Rentang Tanggal:</span>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-orange-500"
              />
              <span className="text-slate-500">s/d</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Primary KPI Statistics Cards (Revenue, Total COGS, Net Profit) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Penjualan (Revenue) */}
        <div className="bg-slate-900/90 border border-blue-500/30 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
              Total Penjualan (Revenue)
            </span>
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl sm:text-2xl font-black text-white">
              {formatRupiah(totalRevenue)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <span>Σ (Harga Jual × Terjual)</span>
            </p>
          </div>
        </div>

        {/* Total Modal (COGS) */}
        <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Total Modal (COGS)
            </span>
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl sm:text-2xl font-black text-white">
              {formatRupiah(totalCOGS)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <span>Σ (Harga Modal × Terjual)</span>
            </p>
          </div>
        </div>

        {/* Laba / Rugi Bersih (Net Profit) */}
        <div
          className={`border rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-lg ${
            netProfit >= 0
              ? 'bg-gradient-to-br from-emerald-950/60 to-slate-900 border-emerald-500/40'
              : 'bg-gradient-to-br from-red-950/60 to-slate-900 border-red-500/40'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold uppercase tracking-wider ${
                netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              Laba Bersih (Net Profit)
            </span>
            <div
              className={`p-2 rounded-xl ${
                netProfit >= 0
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-red-500/20 text-red-400'
              }`}
            >
              {netProfit >= 0 ? (
                <TrendingUp className="w-5 h-5" />
              ) : (
                <TrendingDown className="w-5 h-5" />
              )}
            </div>
          </div>
          <div className="mt-3">
            <h3
              className={`text-xl sm:text-2xl font-black ${
                netProfit >= 0 ? 'text-emerald-300' : 'text-red-300'
              }`}
            >
              {netProfit < 0 ? '-' : ''}
              {formatRupiah(Math.abs(netProfit))}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <span>Revenue − COGS</span>
              <span className="font-bold text-white ml-1">
                ({profitMarginPercent}% Margin)
              </span>
            </p>
          </div>
        </div>

        {/* Nilai Stok Siap Jual (Inventory Asset) */}
        <div className="bg-slate-900/90 border border-purple-500/30 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
              Nilai Aset Stok Ready
            </span>
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-xl sm:text-2xl font-black text-white">
              {formatRupiah(inventoryStats.totalReadyValue)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
              <span>{inventoryStats.readyCount} Akun Tersedia</span>
              <span className="text-purple-300 font-semibold">
                Modal: {formatRupiah(inventoryStats.totalReadyCost)}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Ledger & Audit Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/60">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>Rincian Akun &amp; Rekapitulasi Harga</span>
              <span className="text-xs font-normal text-slate-400">
                ({filteredAccounts.length} item ditemukan)
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Transparansi penuh: Membandingkan Harga Modal (COGS), Harga Jual (Revenue), dan Laba Per Akun.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold hidden sm:inline">Tampilan:</span>
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTab('all_accounts')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  activeTab === 'all_accounts'
                    ? 'bg-orange-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Katalog Akun ({filteredAccounts.length})
              </button>
              <button
                onClick={() => setActiveTab('sales_ledger')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  activeTab === 'sales_ledger'
                    ? 'bg-orange-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Buku Penjualan ({filteredSales.length})
              </button>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-bold border-b border-slate-800">
              <tr>
                <th className="py-3 px-3 sm:px-4">ID &amp; Game</th>
                <th className="py-3 px-3 sm:px-4">Judul Lapak Akun</th>
                <th className="py-3 px-3 sm:px-4">Status / Stok</th>
                <th className="py-3 px-3 sm:px-4 text-right">Harga Modal (COGS)</th>
                <th className="py-3 px-3 sm:px-4 text-right">Harga Jual (Revenue)</th>
                <th className="py-3 px-3 sm:px-4 text-right">Laba Bersih</th>
                <th className="py-3 px-3 sm:px-4 text-center">Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {activeTab === 'all_accounts' ? (
                filteredAccounts.length > 0 ? (
                  filteredAccounts.map((account) => {
                    const cost = account.costPrice ?? Math.round(account.price * 0.7);
                    const units = account.soldCount || (account.status === 'SOLD_OUT' ? 1 : 0);
                    const accProfit = account.price - cost;
                    const margin =
                      account.price > 0
                        ? Math.round((accProfit / account.price) * 100)
                        : 0;

                    return (
                      <tr key={account.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {account.game === 'MLBB' ? (
                              <MLBBLogo className="w-4 h-4" />
                            ) : (
                              <FreeFireLogo className="w-4 h-4" />
                            )}
                            <span className="font-mono font-bold text-white">
                              {account.id}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-3 sm:px-4 max-w-xs truncate font-medium text-slate-200">
                          {account.title}
                        </td>

                        <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                          {account.status === 'READY' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                              Ready ({account.stock})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-500/15 text-red-400 font-bold border border-red-500/30">
                              Terjual ({units}x)
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3 sm:px-4 text-right font-mono text-amber-400">
                          {formatRupiah(cost)}
                        </td>

                        <td className="py-3 px-3 sm:px-4 text-right font-mono font-bold text-blue-300">
                          {formatRupiah(account.price)}
                        </td>

                        <td className="py-3 px-3 sm:px-4 text-right font-mono font-bold text-emerald-400">
                          +{formatRupiah(accProfit)}
                        </td>

                        <td className="py-3 px-3 sm:px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded font-bold ${
                              margin >= 30
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-amber-500/20 text-amber-300'
                            }`}
                          >
                            {margin}%
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      Tidak ada data akun yang sesuai filter.
                    </td>
                  </tr>
                )
              ) : filteredSales.length > 0 ? (
                filteredSales.map((sale) => {
                  const margin =
                    sale.sellingPrice > 0
                      ? Math.round((sale.profit / sale.sellingPrice) * 100)
                      : 0;

                  return (
                    <tr key={sale.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-orange-400">
                            {sale.id}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(sale.date).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3 sm:px-4 max-w-xs truncate font-medium text-slate-200">
                        {sale.accountTitle}
                      </td>

                      <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                          Selesai
                        </span>
                      </td>

                      <td className="py-3 px-3 sm:px-4 text-right font-mono text-amber-400">
                        {formatRupiah(sale.costPrice)}
                      </td>

                      <td className="py-3 px-3 sm:px-4 text-right font-mono font-bold text-blue-300">
                        {formatRupiah(sale.sellingPrice)}
                      </td>

                      <td className="py-3 px-3 sm:px-4 text-right font-mono font-bold text-emerald-400">
                        +{formatRupiah(sale.profit)}
                      </td>

                      <td className="py-3 px-3 sm:px-4 text-center">
                        <span className="px-2 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-300">
                          {margin}%
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Belum ada riwayat transaksi penjualan dalam rentang waktu ini.
                  </td>
                </tr>
              )}
            </tbody>
            {/* Table Footer Totals */}
            <tfoot className="bg-slate-950 font-bold border-t-2 border-slate-800">
              <tr>
                <td colSpan={3} className="py-3 px-4 text-white uppercase tracking-wider text-xs">
                  Total Rekapitulasi ({dateRange.toUpperCase()})
                </td>
                <td className="py-3 px-4 text-right font-mono text-amber-400">
                  {formatRupiah(totalCOGS)}
                </td>
                <td className="py-3 px-4 text-right font-mono text-blue-300">
                  {formatRupiah(totalRevenue)}
                </td>
                <td className="py-3 px-4 text-right font-mono text-emerald-400">
                  +{formatRupiah(netProfit)}
                </td>
                <td className="py-3 px-4 text-center font-bold text-emerald-300">
                  {profitMarginPercent}%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
