import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, ArrowUpRight, ArrowDownLeft, Calendar, FileText, CheckCircle, XCircle, ChevronDown, ChevronUp, RefreshCw, HelpCircle, AlertTriangle, Download, FileUp } from 'lucide-react';
import { Transaction, Student } from '../types';
import { jsPDF } from 'jspdf';

interface TransactionHistoryProps {
  transactions: Transaction[];
  studentId: string;
  student: Student;
}

export default function TransactionHistory({ transactions, studentId, student }: TransactionHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filter transactions specific to this child
  const studentTx = transactions.filter(tx => tx.studentId === studentId);

  // Download statement as a beautifully styled PDF report
  const handleDownloadPDFStatement = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Custom Color Palette matching Abbey High visual architecture
    const primaryColor = [79, 70, 229]; // Indigo-600
    const darkSlate = [15, 23, 42]; // Slate-900
    const lightGray = [248, 250, 252]; // Slate-50
    const subtleBorder = [226, 232, 240]; // Slate-200

    let y = 15;
    const margin = 15;

    // Drawing Title Accent Header Block
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(margin, y, 180, 16, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('ABBEYS HIGH SCHOOL SECURE CASHLESS NETWORK', margin + 5, y + 10.5);
    y += 24;

    // Statement title and range meta
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('MONTHLY TRANSACTION STATEMENT', margin, y);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    
    let dateRangeStr = 'All-Time Account History Record';
    if (startDate || endDate) {
      dateRangeStr = `Filtered Period: ${startDate || 'Inception'} to ${endDate || 'Current'}`;
    } else if (monthFilter !== 'all') {
      const monthNames: Record<string, string> = {
        '2026-05': 'May 2026',
        '2026-06': 'June 2026',
        '2026-07': 'July 2026'
      };
      dateRangeStr = `Statement Period: ${monthNames[monthFilter] || monthFilter}`;
    }
    doc.text(dateRangeStr, margin, y + 5);
    y += 12;

    // Student profile detail panel
    doc.setDrawColor(subtleBorder[0], subtleBorder[1], subtleBorder[2]);
    doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.rect(margin, y, 180, 32, 'DF');

    // Left Column Student metadata
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.text('STUDENT INFORMATION', margin + 5, y + 6);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(`Name: ${student.name}`, margin + 5, y + 12);
    doc.text(`Grade Class: ${student.grade}`, margin + 5, y + 17);
    doc.text(`Student ID: ${student.studentId}`, margin + 5, y + 22);
    doc.text(`Card Status: ${student.cardStatus.toUpperCase()}`, margin + 5, y + 27);

    // Right Column financials totals
    doc.setFont('helvetica', 'bold');
    doc.text('STATEMENT ACCOUNT SUMMARY', margin + 95, y + 6);
    
    doc.setFont('helvetica', 'normal');
    let totalDeposits = 0;
    let totalSpending = 0;
    let totalDeclined = 0;
    
    filteredTx.forEach(tx => {
      if (tx.status === 'declined') {
        totalDeclined++;
      } else if (tx.type === 'credit') {
        totalDeposits += tx.amount;
      } else {
        totalSpending += tx.amount;
      }
    });

    doc.text(`Available Balance: $${student.balance.toFixed(2)} USD`, margin + 95, y + 12);
    doc.text(`Total Period Deposits: $${totalDeposits.toFixed(2)} USD`, margin + 95, y + 17);
    doc.text(`Total Period Purchases: $${totalSpending.toFixed(2)} USD`, margin + 95, y + 22);
    doc.text(`Declined Transactions: ${totalDeclined}`, margin + 95, y + 27);
    
    y += 38;

    // Ledger Table Layout Header
    doc.setFillColor(15, 23, 42); 
    doc.rect(margin, y, 180, 8, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('DATE & TIME', margin + 3, y + 5.5);
    doc.text('MERCHANT / RECIPIENT DESCRIPTION', margin + 35, y + 5.5);
    doc.text('CATEGORY', margin + 115, y + 5.5);
    doc.text('STATUS', margin + 143, y + 5.5);
    doc.text('AMOUNT (USD)', margin + 177, y + 5.5, { align: 'right' });
    y += 8;

    // Draw transactions records
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);

    if (filteredTx.length === 0) {
      doc.text('No ledger transaction matches for the filtered criteria.', margin + 3, y + 6);
      y += 10;
    } else {
      filteredTx.forEach((tx) => {
        // Pagination handling
        if (y > 270) {
          doc.addPage();
          y = 15;
          
          doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
          doc.rect(margin, y, 180, 6, 'F');
          
          doc.setTextColor(255, 255, 255);
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(6.5);
          doc.text(`Statement Ledger Logs Continuing — Student: ${student.name}`, margin + 3, y + 4.2);
          y += 11;
          
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(30, 41, 59);
        }

        // Horizontal row divider line
        doc.setDrawColor(241, 245, 249);
        doc.line(margin, y, margin + 180, y);

        const isCredit = tx.type === 'credit';
        const rawDate = new Date(tx.date);
        const formattedTime = rawDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + rawDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        
        doc.text(formattedTime, margin + 3, y + 5.2);
        
        let desc = tx.merchant;
        if (tx.items && tx.items.length > 0) {
          desc += ` (${tx.items.map(i => `${i.name} x${i.quantity}`).join(', ')})`;
        }
        if (desc.length > 48) {
          desc = desc.substring(0, 45) + '...';
        }
        doc.text(desc, margin + 35, y + 5.2);
        
        doc.text(tx.category.toUpperCase(), margin + 115, y + 5.2);
        
        const txStatus = tx.status.toUpperCase();
        doc.text(txStatus, margin + 143, y + 5.2);
        
        const sign = isCredit ? '+' : '-';
        const amtStr = `${sign}$${tx.amount.toFixed(2)}`;
        doc.text(amtStr, margin + 177, y + 5.2, { align: 'right' });

        y += 7.5;
      });
    }

    // Bottom Watermark security footer block
    if (y > 260) {
      doc.addPage();
      y = 15;
    }
    
    y += 6;
    doc.setDrawColor(subtleBorder[0], subtleBorder[1], subtleBorder[2]);
    doc.line(margin, y, margin + 180, y);
    y += 5;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    const downloadStamp = `System Statement Generation Stamp: ${new Date().toLocaleString()} — Signature Token ID AH-${student.id.toUpperCase()}-${Math.random().toString(36).substring(3, 9).toUpperCase()}`;
    doc.text(downloadStamp, margin, y);

    // Prompt actual browser file-save
    doc.save(`AbbeysHigh_Statement_${student.id}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleDownloadStatementCSV = () => {
    const headers = ['Transaction ID', 'Date', 'Category', 'Merchant', 'Amount', 'Type', 'Status', 'Items Details'];
    const rows = studentTx.map(tx => {
      const itemsStr = tx.items 
        ? tx.items.map(it => `${it.name} (x${it.quantity} - $${it.price.toFixed(2)})`).join('; ') 
        : '';
      return [
        tx.id,
        new Date(tx.date).toISOString(),
        tx.category,
        `"${tx.merchant.replace(/"/g, '""')}"`,
        tx.amount.toFixed(2),
        tx.type,
        tx.status,
        `"${itemsStr.replace(/"/g, '""')}"`
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `AbbeysHigh_Statement_${studentId}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter based on parent inputs plus date ranges & month selector
  const filteredTx = studentTx.filter(tx => {
    const matchesSearch = tx.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (tx.items && tx.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesCategory = categoryFilter === 'all' || tx.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;

    // Date range matches
    const txDateStr = tx.date.split('T')[0]; // Extract YYYY-MM-DD
    const matchesStartDate = !startDate || txDateStr >= startDate;
    const matchesEndDate = !endDate || txDateStr <= endDate;

    // Month filter matches
    let matchesMonth = true;
    if (monthFilter !== 'all') {
      const txMonth = tx.date.substring(0, 7); // e.g. "2026-05"
      matchesMonth = txMonth === monthFilter;
    }

    return matchesSearch && matchesCategory && matchesStatus && matchesStartDate && matchesEndDate && matchesMonth;
  });

  const getCategoryConfig = (category: Transaction['category']) => {
    switch (category) {
      case 'cafeteria':
        return { label: 'Dining Hall', color: 'text-orange-600 bg-orange-50 border-orange-100', icon: '🍎' };
      case 'transport':
        return { label: 'School Bus', color: 'text-sky-600 bg-sky-50 border-sky-100', icon: '🚌' };
      case 'materials':
        return { label: 'Library & Books', color: 'text-purple-600 bg-purple-50 border-purple-100', icon: '📝' };
      case 'sports':
        return { label: 'Athletics', color: 'text-emerald-700 bg-emerald-50 border-emerald-100', icon: '🏆' };
      case 'activities':
        return { label: 'Club Fees', color: 'text-pink-600 bg-pink-50 border-pink-100', icon: '🎨' };
      case 'topup':
        return { label: 'Parent Deposit', color: 'text-amber-600 bg-amber-50 border-amber-100', icon: '💳' };
      default:
        return { label: 'Miscellaneous', color: 'text-slate-600 bg-slate-50 border-slate-100', icon: '📎' };
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (isoStr: string) => {
    const d = new Date(isoStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 space-y-5">
      {/* Header and counter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-slate-900 text-lg">Transaction Audits</h3>
          <p className="text-xs text-slate-500 mt-0.5">Real-time terminal logs of card taps, bus checkins, and dining room tabs.</p>
        </div>

        {/* Total stats and actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 text-xs w-full md:w-auto">
          <div className="bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl font-mono text-slate-500 text-center">
            Filtered: <strong className="text-slate-800">{filteredTx.length} items</strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="download-pdf-statement-btn"
              onClick={handleDownloadPDFStatement}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-semibold transition-all shadow-sm cursor-pointer"
              title="Compile and download statement as high-fidelity PDF"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF Statement</span>
            </button>
            <button
              id="download-statement-btn"
              onClick={handleDownloadStatementCSV}
              className="flex-shrink-0 flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 px-3.5 py-2 rounded-xl font-semibold transition-all cursor-pointer"
              title="Download full transaction statement as CSV"
            >
              <FileUp className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar Container */}
      <div className="space-y-3">
        {/* Row 1: Search, Category, Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="tx-search-input"
              type="text"
              placeholder="Search merchants or items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-150 rounded-xl text-xs placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-550/10 focus:border-indigo-500 focus:bg-white transition-all text-slate-800"
            />
          </div>

          {/* Category Selector */}
          <div className="relative flex items-center">
            <Filter className="absolute left-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <select
              id="tx-category-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-150 rounded-xl text-xs text-slate-600 focus:outline-hidden focus:ring-2 focus:ring-indigo-550/10 focus:border-indigo-500 hover:bg-slate-100/50 cursor-pointer transition-all appearance-none"
            >
              <option value="all">📁 All Categories</option>
              <option value="cafeteria">🍎 Dining / Food</option>
              <option value="transport">🚌 School Rides</option>
              <option value="materials">📝 Books & Lab Tools</option>
              <option value="sports">🏆 Sports & Uniform</option>
              <option value="topup">💳 Pocket Top-Ups</option>
            </select>
            <div className="absolute right-3 pointer-events-none border-l pl-2 text-[8px] text-slate-400 font-mono">▼</div>
          </div>

          {/* Status Selector */}
          <div className="relative flex items-center">
            <HelpCircle className="absolute left-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <select
              id="tx-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-150 rounded-xl text-xs text-slate-600 focus:outline-hidden focus:ring-2 focus:ring-indigo-550/10 focus:border-indigo-500 hover:bg-slate-100/50 cursor-pointer transition-all appearance-none"
            >
              <option value="all">🔍 All Statuses</option>
              <option value="completed">✓ Approved</option>
              <option value="declined">❌ Declined / Locked</option>
              <option value="pending">⏳ Pending</option>
            </select>
            <div className="absolute right-3 pointer-events-none border-l pl-2 text-[8px] text-slate-400 font-mono">▼</div>
          </div>
        </div>

        {/* Row 2: Monthly Statements & Precise Date range filter */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
          {/* Monthly statement filter */}
          <div className="md:col-span-4 relative flex items-center justify-between">
            <div className="w-full relative flex items-center">
              <Calendar className="absolute left-2.5 w-3.5 h-3.5 text-indigo-500 pointer-events-none" />
              <select
                id="tx-month-filter"
                value={monthFilter}
                onChange={(e) => {
                  setMonthFilter(e.target.value);
                  // Reset precise date-pickers when selecting a predefined statement block
                  setStartDate('');
                  setEndDate('');
                }}
                className="w-full pl-7.5 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">🗓️ All Month Statements</option>
                <option value="2026-05">📂 May 2026 Statement</option>
                <option value="2026-06">📂 June 2026 Statement</option>
                <option value="2026-07">📂 July 2026 Statement</option>
              </select>
              <div className="absolute right-3 pointer-events-none text-[8px] text-slate-400">▼</div>
            </div>
          </div>

          {/* Date range pickers */}
          <div className="md:col-span-8 flex flex-wrap items-center gap-2.5 w-full md:justify-end">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Limit range:</span>
              <input
                id="tx-start-date-picker"
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setMonthFilter('all'); // Clear pre-defined months if custom range entered
                }}
                className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <span className="text-slate-350 text-xs">➔</span>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <input
                id="tx-end-date-picker"
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setMonthFilter('all'); // Clear pre-defined months if custom range entered
                }}
                className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {(startDate || endDate || monthFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                  setMonthFilter('all');
                }}
                className="text-[10px] font-bold text-red-500 hover:text-red-700 px-2 py-1 bg-red-50 hover:bg-red-100 rounded-md transition-all uppercase tracking-wide cursor-pointer"
              >
                Clear Range
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Audit ledger list */}
      <div className="divide-y divide-slate-100 border border-slate-100 rounded-3xl overflow-hidden shadow-xs bg-white">
        {filteredTx.length === 0 ? (
          <div className="py-12 text-center text-slate-400 font-medium text-xs">
            No matching transactions found. Try resetting filters.
          </div>
        ) : (
          filteredTx.map((tx) => {
            const isCredit = tx.type === 'credit';
            const cat = getCategoryConfig(tx.category);
            const isExpanded = expandedId === tx.id;

            return (
              <div id={`tx-item-${tx.id}`} key={tx.id} className="transition-all hover:bg-slate-50/50">
                {/* Main Row */}
                <div
                  className="p-4 md:p-5 flex items-center justify-between cursor-pointer"
                  onClick={() => toggleExpand(tx.id)}
                >
                  <div className="flex items-center gap-3.5">
                    {/* Visual Stamp Category */}
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-lg shadow-2xs">
                      {cat.icon}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-slate-800 text-xs md:text-sm">
                          {tx.merchant}
                        </span>
                        
                        {/* Exceeded limit / declined markers */}
                        {tx.status === 'declined' && (
                          <span className="inline-flex items-center gap-0.5 bg-rose-50 text-rose-600 text-[9px] font-bold px-1.5 py-0.5 rounded border border-rose-100 uppercase tracking-widest leading-none">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            DECLINED
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                        <span className="font-mono">{formatDate(tx.date)}</span>
                        <span>•</span>
                        <span className={`px-1.5 py-0.5 rounded-sm border ${cat.color} font-bold text-[8px] uppercase tracking-wider`}>
                          {cat.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div className="space-y-0.5">
                      <span
                        className={`text-xs md:text-sm font-bold font-mono ${
                          tx.status === 'declined'
                            ? 'text-slate-400 line-through'
                            : isCredit
                            ? 'text-emerald-600'
                            : 'text-slate-800'
                        }`}
                      >
                        {isCredit ? '+' : '-'}${tx.amount.toFixed(2)}
                      </span>
                      <span className="text-[9px] text-slate-400 block font-mono">USD</span>
                    </div>

                    <div className="text-slate-400">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details/Receipt Form */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-1.5 border-t border-slate-50 bg-slate-50/60 font-mono text-[11px] text-slate-600 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-1">
                          <div className="space-y-1">
                            <span className="text-slate-400 block uppercase text-[9px]">Receipt Stamp</span>
                            <span>Transaction Reference: <strong>{tx.id.toUpperCase()}</strong></span>
                          </div>
                          <div className="space-y-1 md:text-right">
                            <span className="text-slate-400 block uppercase text-[9px]">Ingress Location</span>
                            <span>Abbeys High Terminal #{(Math.random() * 80).toFixed(0)}</span>
                          </div>
                        </div>

                        {/* Itemized receipt table */}
                        {tx.items && tx.items.length > 0 ? (
                          <div className="space-y-2 border-t border-dashed border-slate-200 pt-3">
                            <span className="text-slate-400 block uppercase text-[9px]">Itemized Checkout Receipt</span>
                            <div className="space-y-1.5">
                              {tx.items.map((it, index) => (
                                <div key={index} className="flex justify-between items-center text-xs text-slate-700">
                                  <span>
                                    {it.name} <span className="text-slate-400">x{it.quantity}</span>
                                  </span>
                                  <span>${(it.price * it.quantity).toFixed(2)}</span>
                                </div>
                              ))}
                              
                              <div className="flex justify-between items-center pt-2 border-t border-slate-250 font-bold text-slate-800 text-xs">
                                <span>NET TOTAL CHARGED</span>
                                <span>${tx.amount.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="border-t border-dashed border-slate-200 pt-3 flex items-start gap-1.5 text-slate-500">
                            <span>📎</span>
                            <span>Direct pass authorization. No items attached during checkout tap-in (such as bus transport transponders or sports entrance ticket scans).</span>
                          </div>
                        )}

                        {tx.status === 'declined' && (
                          <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex gap-2 items-start text-red-800">
                            <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <div>
                              <strong className="text-xs uppercase tracking-wider block">Scan Rejection Flagged</strong>
                              <span className="text-[10px] text-red-700 leading-normal block mt-0.5">
                                This tap was rejected at the cashier register. The student attempted to purchase blocked treats / items or exceeded the daily allowance threshold configured by parent policies.
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
