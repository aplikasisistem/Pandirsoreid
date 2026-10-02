import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { GameAccount, SaleRecord, FinancialPeriod } from '../types';
import { formatRupiah, formatNumber } from '../utils/formatter';
import { MLBBLogo, FreeFireLogo } from './GameBadges';

interface ProfitLossDashboardProps {
  accounts: GameAccount[];
  salesRecords: SaleRecord[];
  onAddManualSale?: (record: Omit<SaleRecord, 'id'>) => void;
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export const ProfitLossDashboard: React.FC<ProfitLossDashboardProps> = ({
  accounts,
  salesRecords,
}) => {
  const [period, setPeriod] = useState<FinancialPeriod>('month');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGameFilter, setSelectedGameFilter] = useState<'ALL' | 'MLBB' | 'FREE_FIRE'>('ALL');

  // Filter sales based on period
  const filteredSales = useMemo(() => {
    const now = Date.now();
    return salesRecords.filter((record) => {
      // 1. Period filter
      if (period === 'today') {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        if (record.date < startOfToday.getTime()) return false;
      } else if (period === 'week') {
        if (record.date < now - ONE_DAY_MS * 7) return false;
      } else if (period === 'month') {
        if (record.date < now - ONE_DAY_MS * 30) return false;
      } else if (period === 'year') {
        if (record.date < now - ONE_DAY_MS * 365) return false;
      } else if (period === 'custom') {
        if (customStartDate) {
          const startMs = new Date(customStartDate).getTime();
          if (record.date < startMs) return false;
        }
        if (customEndDate) {
          const endMs = new Date(customEndDate).getTime() + ONE_DAY_MS - 1;
          if (record.date > endMs) return false;
        }
      }

      // 2. Game filter
      if (selectedGameFilter !== 'ALL' && record.game !== selectedGameFilter) {
        return false;
      }

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = record.accountTitle.toLowerCase().includes(q);
        const idMatch = record.id.toLowerCase().includes(q) || record.accountId.toLowerCase().includes(q);
        if (!titleMatch && !idMatch) return false;
      }

      return true;
    }).sort((a, b) => b.date - a.date);
  }, [salesRecords, period, customStartDate, customEndDate, selectedGameFilter, searchQuery]);

  // Aggregate Calculations:
  // Total Penjualan (Revenue): Sum(Harga Jual)
  const totalRevenue = useMemo(() => {
    return filteredSales.reduce((sum, item) => sum + item.sellingPrice, 0);
  }, [filteredSales]);

  // Total Modal (COGS): Sum(Harga Beli)
  const totalCOGS = useMemo(() => {
    return filteredSales.reduce((sum, item) => sum + item.costPrice, 0);
  }, [filteredSales]);

  // Laba / Rugi Bersih (Net Profit): Revenue - COGS
  const netProfit = totalRevenue - totalCOGS;

  // Margin Percentage: (Net Profit / Revenue) * 100
  const profitMarginPercent = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0.0';

  // Export to CSV/Excel
  const handleExportCSV = () => {
    const headers = [
      'ID Transaksi',
      'Tanggal',
      'ID Akun',
      'Judul Akun',
      'Game',
      'Harga Modal (COGS)',
      'Harga Jual (Revenue)',
      'Laba Bersih',
      'Margin (%)',
      'Catatan Transaksi',
    ];

    const rows = filteredSales.map((sale) => [
      sale.id,
      new Date(sale.date).toLocaleString('id-ID'),
      sale.accountId,
      `"${sale.accountTitle.replace(/"/g, '""')}"`,
      sale.game,
      sale.costPrice,
      sale.sellingPrice,
      sale.profit,
      `${Math.round((sale.profit / (sale.sellingPrice || 1)) * 100)}%`,
      `"${(sale.buyerNote || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Laporan_Laba_Rugi_Pandirstore_${period}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to PDF / Print Report
  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-3.5 sm:space-y-4 animate-fadeIn">
      {/* Header & Controls Bar - Compact */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-slate-900/90 py-2.5 px-3.5 sm:px-4 rounded-xl border border-slate-800 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center shrink-0">
            <PieChart className="w-4 h-4 text-orange-400" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
              <span>Akumulasi Laba / Rugi (Profit &amp; Loss)</span>
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Rekapitulasi keuangan: Total Penjualan, Total Modal (COGS), dan Laba Bersih.
            </p>
          </div>
        </div>

        {/* Action Buttons: Export CSV & Print PDF - Compact */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExportCSV}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all shadow-sm active:scale-95 h-8"
            title="Download file Excel / CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrintPDF}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold transition-all shadow-sm shadow-orange-950 active:scale-95 h-8"
            title="Cetak atau simpan sebagai PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak PDF</span>
          </button>
        </div>
      </div>

      {/* Period Filter, Game Filter & Search - Responsive Inline 1 Row */}
      <div className="bg-slate-900/80 p-2 sm:px-3 rounded-xl border border-slate-800 space-y-2">
        <div className="flex flex-wrap lg:flex-nowrap items-center justify-between gap-2">
          {/* Period Selection */}
          <div className="flex items-center gap-1 flex-wrap sm:flex-nowrap">
            <span className="text-[11px] text-slate-400 font-bold mr-1 flex items-center gap-1 shrink-0">
              <Calendar className="w-3.5 h-3.5 text-orange-400" />
              <span className="hidden sm:inline">Periode:</span>
            </span>

            <button
              type="button"
              onClick={() => setPeriod('today')}
              className={`h-8 px-2.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                period === 'today'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Hari Ini
            </button>

            <button
              type="button"
              onClick={() => setPeriod('week')}
              className={`h-8 px-2.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                period === 'week'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Mingguan
            </button>

            <button
              type="button"
              onClick={() => setPeriod('month')}
              className={`h-8 px-2.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                period === 'month'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Bulanan
            </button>

            <button
              type="button"
              onClick={() => setPeriod('year')}
              className={`h-8 px-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                period === 'year'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Tahun Ini
            </button>

            <button
              type="button"
              onClick={() => setPeriod('custom')}
              className={`h-8 px-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                period === 'custom'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Kustom
            </button>
          </div>

          {/* Game Quick Filter & Search Bar in Same Inline Row */}
          <div className="flex items-center gap-2 w-full lg:w-auto justify-between lg:justify-end">
            <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800 h-8">
              <button
                type="button"
                onClick={() => setSelectedGameFilter('ALL')}
                className={`h-7 px-2 rounded-md text-xs font-semibold transition-colors ${
                  selectedGameFilter === 'ALL'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => setSelectedGameFilter('MLBB')}
                className={`h-7 px-2 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors ${
                  selectedGameFilter === 'MLBB'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-blue-300'
                }`}
              >
                <MLBBLogo className="w-3.5 h-3.5" />
                <span>MLBB</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedGameFilter('FREE_FIRE')}
                className={`h-7 px-2 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors ${
                  selectedGameFilter === 'FREE_FIRE'
                    ? 'bg-orange-600 text-white'
                    : 'text-slate-400 hover:text-orange-300'
                }`}
              >
                <FreeFireLogo className="w-3.5 h-3.5" />
                <span>FF</span>
              </button>
            </div>

            {/* Compact Search Bar with equal height h-8 */}
            <div className="relative flex-1 sm:w-44 lg:w-52">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari ID/Judul..."
                className="h-8 w-full pl-8 pr-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Custom Range Date Pickers */}
        {period === 'custom' && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800 text-xs">
            <span className="text-slate-400 text-[11px]">Mulai:</span>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="h-7 px-2 rounded-md bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-orange-500"
            />
            <span className="text-slate-400 text-[11px]">Sampai:</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="h-7 px-2 rounded-md bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-orange-500"
            />
            {(customStartDate || customEndDate) && (
              <button
                type="button"
                onClick={() => {
                  setCustomStartDate('');
                  setCustomEndDate('');
                }}
                className="text-xs text-orange-400 hover:underline ml-2"
              >
                Reset Tanggal
              </button>
            )}
          </div>
        )}
      </div>

      {/* 4 Main Financial KPI Metric Cards - Compact */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Total Penjualan (Revenue) */}
        <div className="p-3 sm:p-3.5 rounded-xl bg-gradient-to-br from-blue-950/60 to-slate-900 border border-blue-600/30 relative overflow-hidden shadow-md">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-bold text-blue-400 uppercase tracking-wider">Total Penjualan</span>
            <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-1.5 text-base sm:text-lg lg:text-xl font-black text-white font-mono truncate">
            {formatRupiah(totalRevenue)}
          </div>
          <div className="text-[10px] text-blue-300 mt-0.5 flex items-center justify-between">
            <span>{filteredSales.length} Transaksi Selesai</span>
            <span className="font-semibold">∑ (Harga Jual)</span>
          </div>
        </div>

        {/* Total Modal (COGS) */}
        <div className="p-3 sm:p-3.5 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 relative overflow-hidden shadow-md">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-bold text-amber-400 uppercase tracking-wider">Total Modal (COGS)</span>
            <span className="text-slate-500 font-mono text-[10px]">Harga Beli</span>
          </div>
          <div className="mt-1.5 text-base sm:text-lg lg:text-xl font-black text-slate-200 font-mono truncate">
            {formatRupiah(totalCOGS)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 flex items-center justify-between">
            <span>Pengadaan Akun</span>
            <span className="font-semibold">∑ (Harga Beli)</span>
          </div>
        </div>

        {/* Laba / Rugi Bersih (Net Profit/Loss) */}
        <div
          className={`p-3 sm:p-3.5 rounded-xl border relative overflow-hidden shadow-md ${
            netProfit >= 0
              ? 'bg-gradient-to-br from-emerald-950/60 to-slate-900 border-emerald-500/40'
              : 'bg-gradient-to-br from-red-950/60 to-slate-900 border-red-500/40'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className={`font-bold uppercase tracking-wider ${netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              Laba Bersih
            </span>
            <div className={`p-1.5 rounded-lg ${netProfit >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
              {netProfit >= 0 ? (
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400" />
              )}
            </div>
          </div>
          <div
            className={`mt-1.5 text-base sm:text-lg lg:text-xl font-black font-mono truncate ${
              netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {netProfit >= 0 ? '+' : ''}
            {formatRupiah(netProfit)}
          </div>
          <div className="text-[10px] text-emerald-300/80 mt-0.5 flex items-center justify-between">
            <span>Penjualan - Modal</span>
            <span className="font-bold">Net Profit</span>
          </div>
        </div>

        {/* Margin Keuntungan (%) */}
        <div className="p-3 sm:p-3.5 rounded-xl bg-gradient-to-br from-amber-950/60 to-slate-900 border border-amber-600/30 relative overflow-hidden shadow-md">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-bold text-amber-400 uppercase tracking-wider">Margin Keuntungan</span>
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <ArrowUpRight className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div className="mt-1.5 text-base sm:text-lg lg:text-xl font-black text-amber-400 font-mono truncate">
            {profitMarginPercent}%
          </div>
          <div className="text-[10px] text-amber-300/80 mt-0.5 flex items-center justify-between">
            <span>Rata-Rata Margin</span>
            <span className="font-semibold">Profit / Sales</span>
          </div>
        </div>
      </div>

      {/* Financial Transactions Detailed Table */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-bold text-white">
              Daftar Rincian Transaksi Keuangan ({filteredSales.length})
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari transaksi / akun..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-3 sm:px-4">ID Transaksi</th>
                <th className="py-3 px-3 sm:px-4">Waktu</th>
                <th className="py-3 px-3 sm:px-4">Akun Game</th>
                <th className="py-3 px-3 sm:px-4 text-right">Harga Modal (Beli)</th>
                <th className="py-3 px-3 sm:px-4 text-right">Harga Jual</th>
                <th className="py-3 px-3 sm:px-4 text-right">Laba Bersih</th>
                <th className="py-3 px-3 sm:px-4 text-center">Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredSales.map((sale) => {
                const marginPct = sale.sellingPrice > 0 ? Math.round((sale.profit / sale.sellingPrice) * 100) : 0;
                return (
                  <tr key={sale.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 sm:px-4 text-slate-300 font-bold whitespace-nowrap">
                      {sale.id}
                      <span className="block text-[10px] text-slate-500 font-sans">{sale.accountId}</span>
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-slate-400 font-sans whitespace-nowrap text-[11px]">
                      {new Date(sale.date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-3 sm:px-4 font-sans max-w-[200px]">
                      <div className="flex items-center gap-1.5">
                        {sale.game === 'MLBB' ? (
                          <MLBBLogo className="w-3.5 h-3.5 shrink-0" />
                        ) : (
                          <FreeFireLogo className="w-3.5 h-3.5 shrink-0" />
                        )}
                        <span className="text-white font-semibold truncate block">
                          {sale.accountTitle}
                        </span>
                      </div>
                      {sale.buyerNote && (
                        <span className="text-[10px] text-slate-400 block truncate">
                          {sale.buyerNote}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-right text-slate-300 whitespace-nowrap">
                      {formatRupiah(sale.costPrice)}
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-right text-orange-400 font-bold whitespace-nowrap">
                      {formatRupiah(sale.sellingPrice)}
                    </td>
                    <td
                      className={`py-3 px-3 sm:px-4 text-right font-bold whitespace-nowrap ${
                        sale.profit >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {sale.profit >= 0 ? '+' : ''}
                      {formatRupiah(sale.profit)}
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          marginPct >= 25
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {marginPct}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredSales.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs">
              Tidak ada data transaksi penjualan pada periode yang dipilih.
            </div>
          )}
        </div>

        {/* Table Footer Summary Bar */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-slate-400">
            Total Transaksi Tercatat: <strong className="text-white">{filteredSales.length}</strong>
          </span>
          <div className="flex items-center gap-4 font-mono font-bold">
            <span className="text-slate-300">
              Total Modal: <span className="text-white">{formatRupiah(totalCOGS)}</span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-orange-400">
              Total Omset: <span>{formatRupiah(totalRevenue)}</span>
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-400">
              Total Laba: <span>+{formatRupiah(netProfit)}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
