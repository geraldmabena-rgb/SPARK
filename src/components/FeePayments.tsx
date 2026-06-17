import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard, 
  Calendar, 
  CheckCircle2, 
  DollarSign, 
  Wallet, 
  AlertCircle, 
  FileText, 
  Loader2, 
  Sparkles,
  Smartphone,
  Zap,
  Send,
  ArrowRight,
  Lock,
  Clock,
  Info,
  Sliders,
  Check
} from 'lucide-react';
import { Student, SchoolFee, Transaction } from '../types';

interface FeePaymentsProps {
  student: Student;
  fees: SchoolFee[];
  onUpdateStudent: (updated: Student) => void;
  onPayFee: (feeId: string, amountPaid: number) => void;
  onAddTransaction: (trans: Transaction) => void;
}

export default function FeePayments({ student, fees, onUpdateStudent, onPayFee, onAddTransaction }: FeePaymentsProps) {
  const [selectedFee, setSelectedFee] = useState<SchoolFee | null>(null);
  const [payMethod, setPayMethod] = useState<'wallet' | 'card' | 'ecocash' | 'onemoney' | 'telecash' | 'innbucks' | 'zipit'>('ecocash');
  const [payingState, setPayingState] = useState<'idle' | 'details' | 'ussd' | 'processing' | 'success'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Partial Payment settings
  const [payAmountMode, setPayAmountMode] = useState<'full' | 'custom'>('full');
  const [customPayAmount, setCustomPayAmount] = useState<string>('');

  // Multi-channel input variables
  const [mobileNumber, setMobileNumber] = useState('0771234567');
  const [innbucksAccount, setInnbucksAccount] = useState('IB-442-881');
  const [zipitBank, setZipitBank] = useState('CBZ Bank');
  const [simulatedPin, setSimulatedPin] = useState('');
  const [pinError, setPinError] = useState(false);

  // Filter bills specific to this student
  const studentFees = fees.filter((f) => f.studentId === student.id);

  // Helper to obtain fee balance left safely
  const getFeeBalanceLeft = (fee: SchoolFee) => {
    return fee.balanceLeft !== undefined ? fee.balanceLeft : (fee.status === 'paid' ? 0 : fee.amount);
  };

  const getDueStatusString = (dueDateStr: string, isPaid: boolean) => {
    if (isPaid) {
      return { text: 'Paid & Settled', color: 'text-emerald-700 bg-emerald-50 border-emerald-100 font-bold' };
    }
    const today = new Date('2026-06-15'); // Current system local date baseline
    const due = new Date(dueDateStr);
    const timeDiff = due.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (daysDiff < 0) {
      return { text: `Overdue by ${Math.abs(daysDiff)} days`, color: 'text-rose-600 bg-rose-50 border-rose-100 font-bold font-mono' };
    } else if (daysDiff === 0) {
      return { text: '🚨 Due Today', color: 'text-amber-700 bg-amber-50 border-amber-250 animate-pulse font-black' };
    } else if (daysDiff === 1) {
      return { text: 'Due Tomorrow', color: 'text-amber-600 bg-amber-50 border-amber-100 font-semibold' };
    } else {
      return { text: `Due in ${daysDiff} days`, color: 'text-slate-600 bg-slate-100 border-slate-250 font-medium' };
    }
  };

  const startPaymentFlow = (fee: SchoolFee) => {
    setSelectedFee(fee);
    const balanceLeft = getFeeBalanceLeft(fee);
    setPayMethod(student.balance >= balanceLeft ? 'wallet' : 'ecocash');
    setPayAmountMode('full');
    setCustomPayAmount(balanceLeft.toFixed(2));
    setPayingState('details');
    setErrorMsg(null);
    setSimulatedPin('');
    setPinError(false);
  };

  const getActualPaymentAmount = () => {
    if (!selectedFee) return 0;
    const balanceLeft = getFeeBalanceLeft(selectedFee);
    if (payAmountMode === 'full') {
      return balanceLeft;
    }
    const val = parseFloat(customPayAmount);
    return isNaN(val) ? 0 : Math.min(val, balanceLeft);
  };

  const handleDetailsValidationSubmit = () => {
    if (!selectedFee) return;

    const actualAmount = getActualPaymentAmount();
    if (actualAmount <= 0.01) {
      setErrorMsg('Please specify a valid payment amount greater than $0.01.');
      return;
    }

    if (payMethod === 'wallet' && student.balance < actualAmount) {
      setErrorMsg(`Insufficient wallet balance. Available is $${student.balance.toFixed(2)}. Please recharge child's card first or select mobile money option.`);
      return;
    }

    if (['ecocash', 'onemoney', 'telecash', 'innbucks'].includes(payMethod)) {
      setPayingState('ussd');
      setSimulatedPin('');
      setPinError(false);
    } else {
      handleExecutePayment();
    }
  };

  const handleExecutePayment = () => {
    if (!selectedFee) return;

    const actualAmount = getActualPaymentAmount();

    setPayingState('processing');

    // Simulate server-side payment resolution
    setTimeout(() => {
      if (payMethod === 'wallet') {
        const updatedBalance = student.balance - actualAmount;
        onUpdateStudent({
          ...student,
          balance: updatedBalance,
        });
      }

      onPayFee(selectedFee.id, actualAmount);

      // Label transaction based on system
      let transactionMerchant = `School Billing: ${selectedFee.title}`;
      if (payMethod === 'wallet') {
        transactionMerchant = `Wallet Debit: ${selectedFee.title}`;
      } else if (payMethod === 'ecocash') {
        transactionMerchant = `EcoCash Gateway (${mobileNumber}): ${selectedFee.title}`;
      } else if (payMethod === 'onemoney') {
        transactionMerchant = `OneMoney Pay (${mobileNumber}): ${selectedFee.title}`;
      } else if (payMethod === 'telecash') {
        transactionMerchant = `Telecash Pay (${mobileNumber}): ${selectedFee.title}`;
      } else if (payMethod === 'innbucks') {
        transactionMerchant = `InnBucks Cleared (${innbucksAccount}): ${selectedFee.title}`;
      } else if (payMethod === 'zipit') {
        transactionMerchant = `ZIPIT Interbank (${zipitBank}): ${selectedFee.title}`;
      } else if (payMethod === 'card') {
        transactionMerchant = `Mastercard Direct Auth: ${selectedFee.title}`;
      }

      // Append standard suffix for partial contribution
      const balanceLeftNow = getFeeBalanceLeft(selectedFee) - actualAmount;
      if (balanceLeftNow > 0.01) {
        transactionMerchant += ` (Partially Paid - Remainder: $${balanceLeftNow.toFixed(2)})`;
      } else {
        transactionMerchant += ` (Full Payment Settled)`;
      }

      const feeTx: Transaction = {
        id: `tx-fee-${Date.now()}`,
        studentId: student.id,
        date: new Date().toISOString(),
        category: selectedFee.category === 'trip' ? 'activities' : 'materials',
        merchant: transactionMerchant,
        amount: actualAmount,
        type: 'debit',
        status: 'completed',
      };
      onAddTransaction(feeTx);

      setPayingState('success');
      setTimeout(() => {
        setSelectedFee(null);
        setPayingState('idle');
      }, 1800);
    }, 1800);
  };

  const getCategoryBadgeClass = (category: SchoolFee['category']) => {
    switch (category) {
      case 'tuition':
        return 'text-amber-700 bg-amber-50 border-amber-100';
      case 'transport':
        return 'text-sky-700 bg-sky-50 border-sky-100';
      case 'trip':
        return 'text-indigo-700 bg-indigo-50 border-indigo-100';
      case 'supplies':
        return 'text-purple-700 bg-purple-50 border-purple-100';
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-505" />
            Abbeys High School Fees, Excursions & Levies
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Settle term tuitions, library dues, trip levies, and materials invoices with customizable installments.
          </p>
        </div>
        <div className="bg-indigo-50/50 px-3.5 py-1.5 rounded-xl border border-indigo-100/50 text-[11px] text-slate-600 font-medium">
          📅 Active Academic Date: <strong className="font-extrabold text-indigo-900 font-mono">June 15, 2026</strong>
        </div>
      </div>

      {/* Fees List */}
      <div className="space-y-4">
        {studentFees.map((fee) => {
          const balanceLeft = getFeeBalanceLeft(fee);
          const paidAmount = fee.amount - balanceLeft;
          const pctPaid = Math.round((paidAmount / fee.amount) * 100);
          const dueStatus = getDueStatusString(fee.dueDate, fee.status === 'paid');

          return (
            <div
              id={`fee-card-${fee.id}`}
              key={fee.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row justify-between gap-5 relative overflow-hidden ${
                fee.status === 'paid'
                  ? 'bg-emerald-50/20 border-emerald-100'
                  : balanceLeft < fee.amount
                  ? 'bg-amber-50/10 border-amber-150 shadow-3xs'
                  : 'bg-white border-slate-150 hover:bg-slate-50/30'
              }`}
            >
              {/* Backdrop watermark for paid state */}
              {fee.status === 'paid' && (
                <div className="absolute right-36 bottom-[-20px] text-[72px] font-black font-sans text-slate-100 select-none opacity-20 pointer-events-none transform rotate-12">
                  SETTLED
                </div>
              )}

              <div className="space-y-2.5 max-w-xl flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-slate-850 text-xs md:text-sm">{fee.title}</span>
                  <span className={`px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest rounded border ${getCategoryBadgeClass(fee.category)}`}>
                    {fee.category}
                  </span>
                  
                  {fee.status === 'paid' ? (
                    <span className="inline-flex items-center gap-1.5 text-[9px] bg-emerald-100/85 text-emerald-850 font-black px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <Check className="w-3 h-3" /> Fully Settled
                    </span>
                  ) : balanceLeft < fee.amount ? (
                    <span className="inline-flex items-center gap-1.5 text-[9px] bg-amber-100/80 text-amber-850 font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
                      ⏱️ Partially Paid ({pctPaid}%)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 text-[9px] bg-red-50 text-red-700 font-semibold px-2 py-0.5 rounded-full border border-red-100">
                      Unpaid
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-505 leading-relaxed font-sans">{fee.description}</p>
                
                {/* Due Date Display Section */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/80">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Due Date: <strong className="font-mono text-slate-800">{fee.dueDate}</strong></span>
                  </div>
                  
                  <span className={`px-2.5 py-1 text-[10px] rounded-lg border uppercase tracking-wider font-bold ${dueStatus.color}`}>
                    {dueStatus.text}
                  </span>
                </div>

                {/* Progress bar for payments */}
                {fee.status !== 'paid' && fee.amount > 0 && (
                  <div className="space-y-1 bg-slate-50 border border-slate-100 p-2.5 rounded-xl max-w-sm">
                    <div className="flex justify-between items-center text-[10px] text-slate-605">
                      <span>Payment Progress</span>
                      <span className="font-mono font-bold">{pctPaid}% Paid</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          balanceLeft < fee.amount ? 'bg-amber-500' : 'bg-slate-400'
                        }`}
                        style={{ width: `${pctPaid}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Financial Breakdown (Cost, Paid, Remaining Balance Left) */}
              <div className="flex flex-col md:items-end justify-between md:justify-center flex-shrink-0 gap-3 pt-3 md:pt-0 border-t md:border-0 border-slate-100 min-w-[200px]">
                <div className="space-y-1.5 w-full md:text-right font-mono text-xs">
                  {/* Total Invoiced */}
                  <div className="flex md:justify-end justify-between gap-4 text-slate-400 font-sans">
                    <span>Invoice Amount:</span>
                    <strong className="text-slate-705 font-bold font-mono">${fee.amount.toFixed(2)}</strong>
                  </div>
                  
                  {/* Amount Paid So Far */}
                  {paidAmount > 0 && (
                    <div className="flex md:justify-end justify-between gap-4 text-emerald-600/90 font-sans">
                      <span>Paid To Date:</span>
                      <strong className="font-mono">-${paidAmount.toFixed(2)}</strong>
                    </div>
                  )}

                  {/* Balance Left */}
                  <div className="flex md:justify-end justify-between gap-4 pt-1 border-t border-dashed border-slate-200">
                    <span className="font-semibold text-slate-750 font-sans">⚖️ Balance Remaining:</span>
                    <strong className="text-rose-600 font-black text-sm font-mono bg-rose-50/40 px-1.5 py-0.5 rounded">
                      ${balanceLeft.toFixed(2)}
                    </strong>
                  </div>
                </div>

                {fee.status !== 'paid' && (
                  <button
                    id={`pay-fee-btn-${fee.id}`}
                    onClick={() => startPaymentFlow(fee)}
                    className="w-full md:w-auto px-5 py-2 bg-indigo-650 hover:bg-indigo-750 text-white rounded-xl text-xs font-black transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Settle Dues</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {studentFees.length === 0 && (
          <div className="py-8 text-center text-slate-400 text-xs font-medium border-2 border-dashed border-slate-150 rounded-2xl bg-slate-50/20">
            No dynamic levies or bills linked to this student ID in Abbeys High registry sheets.
          </div>
        )}
      </div>

      {/* Payment Selection Modal */}
      <AnimatePresence>
        {selectedFee && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-md w-full border border-slate-100 flex flex-col"
            >
              
              {/* Step 1: Details & Method Selection */}
              {payingState === 'details' && (
                <div className="p-6 md:p-8 space-y-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-indigo-600 font-extrabold uppercase tracking-widest block header-lead">Abbeys Settle Engine</span>
                      <h4 className="font-black text-slate-850 text-base leading-tight pr-6">{selectedFee.title}</h4>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">Ref ID: {selectedFee.id.toUpperCase()}</p>
                    </div>
                    <button
                      id="fee-modal-close"
                      onClick={() => setSelectedFee(null)}
                      className="text-slate-400 hover:text-slate-700 font-black text-xl p-1 leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition cursor-pointer"
                    >
                      ×
                    </button>
                  </div>

                  {/* Financial Balance Summary with Due Date in Modal */}
                  <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl space-y-2 text-xs">
                    <div className="flex justify-between font-medium text-slate-500">
                      <span>Total Invoice Amount:</span>
                      <span className="font-mono">${selectedFee.amount.toFixed(2)}</span>
                    </div>

                    {selectedFee.amount - getFeeBalanceLeft(selectedFee) > 0 && (
                      <div className="flex justify-between text-slate-505 font-medium">
                        <span>Paid to Date:</span>
                        <span className="font-mono text-emerald-600">-${(selectedFee.amount - getFeeBalanceLeft(selectedFee)).toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-sm font-extrabold pt-2 border-t border-slate-200">
                      <span className="text-slate-700">Balance Left:</span>
                      <span className="font-mono text-rose-650 bg-rose-50 px-2 py-0.5 rounded font-black">
                        ${getFeeBalanceLeft(selectedFee).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex gap-2 items-center text-[10px] text-slate-400 pt-1">
                      <Clock className="w-3 h-3 text-indigo-500" />
                      <span>Due Date for fees payment is <strong>{selectedFee.dueDate}</strong> ({getDueStatusString(selectedFee.dueDate, false).text})</span>
                    </div>
                  </div>

                  {/* Flexible Payment Options Selector */}
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-bold uppercase text-slate-500 block tracking-wider">Select Payment Amount Mode</label>
                    <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                      <button
                        type="button"
                        onClick={() => {
                          setPayAmountMode('full');
                          setCustomPayAmount(getFeeBalanceLeft(selectedFee).toFixed(2));
                        }}
                        className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          payAmountMode === 'full'
                            ? 'bg-white text-slate-900 shadow-3xs border border-slate-200/50'
                            : 'text-slate-505 hover:text-slate-800'
                        }`}
                      >
                        <span>Settle Balance (${getFeeBalanceLeft(selectedFee).toFixed(2)})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setPayAmountMode('custom');
                          setCustomPayAmount((getFeeBalanceLeft(selectedFee) / 2).toFixed(2));
                        }}
                        className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          payAmountMode === 'custom'
                            ? 'bg-white text-indigo-750 shadow-3xs border border-slate-200/50'
                            : 'text-slate-505 hover:text-slate-800'
                        }`}
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>Installment / Partial</span>
                      </button>
                    </div>

                    {payAmountMode === 'custom' && (
                      <div className="space-y-1 px-1">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Enter Amount to Pay today ($)</label>
                          <span className="text-[10px] text-slate-400 font-mono">Max: ${getFeeBalanceLeft(selectedFee).toFixed(2)}</span>
                        </div>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-extrabold text-slate-400 font-mono">$</span>
                          <input
                            id="custom-fee-payment-input"
                            type="number"
                            step="0.01"
                            min="0.01"
                            max={getFeeBalanceLeft(selectedFee)}
                            value={customPayAmount}
                            onChange={(e) => {
                              const typed = e.target.value;
                              setCustomPayAmount(typed);
                              setErrorMsg(null);
                            }}
                            className="w-full pl-8 pr-32 py-2 bg-white border border-slate-250 rounded-xl text-xs font-mono font-extrabold text-slate-850 focus:ring-2 focus:ring-indigo-500/20"
                          />
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                            {/* Fast installment pills */}
                            <button
                              type="button"
                              onClick={() => {
                                const half = (getFeeBalanceLeft(selectedFee) / 2).toFixed(2);
                                setCustomPayAmount(half);
                              }}
                              className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[9px] font-bold"
                            >
                              50%
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setCustomPayAmount(getFeeBalanceLeft(selectedFee).toFixed(2));
                              }}
                              className="px-2 py-0.5 bg-slate-100 hover:bg-indigo-100 hover:text-indigo-700 text-slate-600 rounded text-[9px] font-bold"
                            >
                              Max
                            </button>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-400 leading-none">
                          This will leave a remaining balance of <strong>${Math.max(0, getFeeBalanceLeft(selectedFee) - (parseFloat(customPayAmount) || 0)).toFixed(2)}</strong> context to pay later.
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500 block tracking-wider">Debit Source / Settle Channel</label>
                    
                    {/* Payment Channels Grid */}
                    <div className="grid grid-cols-2 gap-2">
                      {/* Inner wallet (deduct from child card) */}
                      <button
                        type="button"
                        onClick={() => setPayMethod('wallet')}
                        className={`p-3 rounded-xl border text-left flex items-center gap-2 transition col-span-2 ${
                          payMethod === 'wallet' 
                            ? 'border-indigo-650 bg-indigo-50/40 text-indigo-950 ring-1 ring-indigo-500/20 shadow-2xs' 
                            : 'border-slate-150 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <Wallet className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                        <div className="leading-tight">
                          <span className="text-xs font-extrabold block">Deduct from {student.name}'s ID Card Pocket</span>
                          <span className="text-[9px] text-slate-400">Ledger balance available: ${student.balance.toFixed(2)} USD</span>
                        </div>
                      </button>

                      {/* EcoCash mobile money */}
                      <button
                        type="button"
                        onClick={() => { setPayMethod('ecocash'); setMobileNumber('0771234567'); }}
                        className={`p-3 rounded-xl border text-left flex items-center gap-2 transition ${
                          payMethod === 'ecocash' 
                            ? 'border-indigo-650 bg-indigo-50/40 text-indigo-950 ring-1 ring-indigo-500/20 shadow-2xs' 
                            : 'border-slate-150 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <Smartphone className="w-4 h-4 text-rose-500 flex-shrink-0" />
                        <div className="leading-tight">
                          <span className="text-xs font-extrabold block">EcoCash</span>
                          <span className="text-[8px] text-slate-400">Mobile Money SMS</span>
                        </div>
                      </button>

                      {/* Netone OneMoney */}
                      <button
                        type="button"
                        onClick={() => { setPayMethod('onemoney'); setMobileNumber('0712345678'); }}
                        className={`p-3 rounded-xl border text-left flex items-center gap-2 transition ${
                          payMethod === 'onemoney' 
                            ? 'border-indigo-650 bg-indigo-50/40 text-indigo-950 ring-1 ring-indigo-500/20' 
                            : 'border-slate-150 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <Smartphone className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <div className="leading-tight">
                          <span className="text-xs font-extrabold block">OneMoney</span>
                          <span className="text-[8px] text-slate-400">NetOne Wallet</span>
                        </div>
                      </button>

                      {/* InnBucks */}
                      <button
                        type="button"
                        onClick={() => { setPayMethod('innbucks'); }}
                        className={`p-3 rounded-xl border text-left flex items-center gap-2 transition ${
                          payMethod === 'innbucks' 
                            ? 'border-indigo-650 bg-indigo-50/40 text-indigo-950 ring-1 ring-indigo-500/20' 
                            : 'border-slate-150 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <Zap className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        <div className="leading-tight">
                          <span className="text-xs font-extrabold block">InnBucks</span>
                          <span className="text-[8px] text-slate-400">Simulated Express</span>
                        </div>
                      </button>

                      {/* ZIPIT Bank Transfer */}
                      <button
                        type="button"
                        onClick={() => { setPayMethod('zipit'); }}
                        className={`p-3 rounded-xl border text-left flex items-center gap-2 transition ${
                          payMethod === 'zipit' 
                            ? 'border-indigo-650 bg-indigo-50/40 text-indigo-950 ring-1 ring-indigo-500/20' 
                            : 'border-slate-150 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <Send className="w-4 h-4 text-sky-500 flex-shrink-0" />
                        <div className="leading-tight">
                          <span className="text-xs font-extrabold block">ZIPIT Transfer</span>
                          <span className="text-[8px] text-slate-400">Instant Interbank</span>
                        </div>
                      </button>

                      {/* MasterCard linked */}
                      <button
                        type="button"
                        onClick={() => { setPayMethod('card'); }}
                        className={`p-3 rounded-xl border text-left flex items-center gap-2 transition col-span-2 ${
                          payMethod === 'card' 
                            ? 'border-indigo-650 bg-indigo-50/40 text-indigo-950 ring-1 ring-indigo-500/20 shadow-2xs' 
                            : 'border-slate-150 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <CreditCard className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                        <div className="leading-tight">
                          <span className="text-xs font-extrabold block">Credit/Debit Card (Verified)</span>
                          <span className="text-[8px] text-slate-400">Mastercard ending in *4819</span>
                        </div>
                      </button>
                    </div>

                    {/* Conditional inputs based on payMethod */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                      {['ecocash', 'onemoney', 'telecash'].includes(payMethod) && (
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-slate-500 uppercase block">Registered Phone Line</label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold font-mono">+263</span>
                            <input
                              id="fee-mobile-pay-number-input"
                              type="text"
                              value={mobileNumber}
                              onChange={(e) => setMobileNumber(e.target.value)}
                              placeholder="e.g. 0771234567"
                              className="w-full pl-14 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800"
                            />
                          </div>
                        </div>
                      )}

                      {payMethod === 'innbucks' && (
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-slate-500 uppercase block">InnBucks Account Number / ID</label>
                          <input
                            id="fee-innbucks-acct-input"
                            type="text"
                            value={innbucksAccount}
                            onChange={(e) => setInnbucksAccount(e.target.value)}
                            placeholder="e.g. IB-404-984"
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800"
                          />
                        </div>
                      )}

                      {payMethod === 'zipit' && (
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-slate-500 uppercase block">Routing Origin Bank</label>
                          <select
                            id="fee-zipit-bank-select"
                            value={zipitBank}
                            onChange={(e) => setZipitBank(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                          >
                            <option value="CBZ Bank">CBZ Bank (CBZ Group)</option>
                            <option value="CABS">CABS Bank</option>
                            <option value="Steward Bank">Steward Bank</option>
                            <option value="Nedbank Zimbabwe">Nedbank Zimbabwe</option>
                            <option value="NMB Bank">NMB Bank</option>
                            <option value="FBC Bank">FBC Bank</option>
                            <option value="Stanbic Bank">Stanbic Bank</option>
                            <option value="EcoBank">EcoBank Plc</option>
                          </select>
                        </div>
                      )}

                      {payMethod === 'wallet' && (
                        <div className="space-y-1.5 text-xs">
                          <span className="font-semibold text-slate-700 block">Deduct from child's available purse</span>
                          <span className="text-[10px] text-slate-500 leading-normal">
                            Liam/Emma's Available Ledger pocket balance: <strong>${student.balance.toFixed(2)}</strong>. This will leave <strong>${(student.balance - getActualPaymentAmount()).toFixed(2)}</strong> in their school purse.
                          </span>
                        </div>
                      )}

                      {payMethod === 'card' && (
                        <div className="space-y-1.5 text-xs">
                          <span className="font-semibold text-slate-755 block">Verified Mastercard token</span>
                          <span className="text-[10px] text-slate-500 leading-normal">
                            A secure charge of <strong>${getActualPaymentAmount().toFixed(2)}</strong> will be cleared from G. CHEN's primary linked credit card securely.
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="p-3 bg-red-50 border border-red-105 rounded-2xl text-[10px] text-red-750 flex gap-1.5">
                      <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      id="fee-cancel-btn"
                      onClick={() => setSelectedFee(null)}
                      className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      id="fee-confirm-btn"
                      onClick={handleDetailsValidationSubmit}
                      className="flex-1 py-2.5 bg-indigo-650 hover:bg-indigo-750 text-white font-black text-xs rounded-xl transition shadow-sm font-bold block text-center cursor-pointer"
                    >
                      Authorize ${getActualPaymentAmount().toFixed(2)}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Simulated USSD phone mockup page */}
              {payingState === 'ussd' && (
                <div className="p-6 md:p-8 space-y-5 text-center">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-rose-500 block">Confirm Mobile Money Contribution</span>
                    <h4 className="font-bold text-slate-850 text-sm">Interactive USSD PIN Prompt</h4>
                    <p className="text-xs text-slate-400 leading-normal max-w-xs mx-auto">
                      Please enter your secret PIN on the simulated hand-terminal beneath to authorize the mobile contribution of <strong>${getActualPaymentAmount().toFixed(2)}</strong>.
                    </p>
                  </div>

                  {/* Sandbox Smartphone Display */}
                  <div className="max-w-[270px] mx-auto bg-slate-900 text-white rounded-3xl p-5 border-4 border-slate-800 shadow-xl space-y-4 relative font-mono text-left">
                    <div className="flex justify-between items-center text-[8px] text-white/50 border-b border-white/10 pb-1.5 leading-none">
                      <span>EC-NET LTE</span>
                      <span>{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                      <span>🔋 96%</span>
                    </div>

                    <div className="bg-slate-950 p-3.5 rounded-xl border border-white/10 text-xs text-white space-y-2">
                      <div className="text-[10px] uppercase font-bold text-rose-450 flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5 text-rose-400" />
                        <span>{payMethod.toUpperCase()} SECURE</span>
                      </div>
                      
                      <div className="text-[10px] text-slate-350 leading-relaxed font-mono">
                        Billing: <strong className="text-white">ABBEYS-HIGH-FEES</strong><br />
                        Pay Amount: <strong className="text-emerald-400">${getActualPaymentAmount().toFixed(2)} USD</strong><br />
                        Balance Remaining: <strong className="text-rose-400">${Math.max(0, getFeeBalanceLeft(selectedFee) - getActualPaymentAmount()).toFixed(2)} USD</strong><br />
                        Due Date: <strong className="text-indigo-300">{selectedFee.dueDate}</strong><br />
                        <span className="text-amber-300 block mt-1.5 animate-pulse">Enter secondary PIN to confirm:</span>
                      </div>

                      <div className="space-y-2">
                        <input
                          id="school-fee-pin-simulator"
                          type="password"
                          placeholder="Your 4-digit PIN"
                          maxLength={4}
                          required
                          value={simulatedPin}
                          onChange={(e) => {
                            setSimulatedPin(e.target.value.replace(/\D/g, ''));
                            setPinError(false);
                          }}
                          className="w-full text-center tracking-widest text-slate-900 bg-white border-0 py-2 rounded-lg font-bold text-sm focus:ring-2 focus:ring-indigo-500"
                        />
                        {pinError && (
                          <span className="text-[8px] text-red-300 block font-sans">
                            PIN verification failed. Please enter standard continuous 4 digits.
                          </span>
                        )}
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setPayingState('details')}
                            className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-sans text-[9px] rounded-md font-bold text-center cursor-pointer"
                          >
                            Back
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (simulatedPin.length < 4) {
                                setPinError(true);
                              } else {
                                handleExecutePayment();
                              }
                            }}
                            className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-sans text-[9px] rounded-md font-bold text-center cursor-pointer"
                          >
                            Approve
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="text-[8px] text-white/40 text-center uppercase tracking-widest mt-1">
                      🔒 SECURED LOCAL API SANDBOX
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 leading-normal max-w-xs mx-auto">
                    Type any mock PIN (e.g., <code className="bg-slate-100 font-mono text-slate-750 px-1 rounded text-[10px] font-bold">1234</code>) and click **Approve** to authorize.
                  </p>
                </div>
              )}

              {/* Step 3: Server Processing */}
              {payingState === 'processing' && (
                <div className="py-12 p-6 text-center space-y-4">
                  <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto">
                    <Loader2 className="w-7 h-7 animate-spin" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">Validating Payment Gateway</h4>
                    <p className="text-xs text-slate-450 leading-normal max-w-[280px] mx-auto mt-1">
                      Routing settlement invoice contribution of <strong>${getActualPaymentAmount().toFixed(2)}</strong> through the selected <strong>{payMethod.toUpperCase()} exchange gateway</strong>. Do not close browser.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 4: Success Settlement */}
              {payingState === 'success' && (
                <div className="py-12 p-6 text-center space-y-4">
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 animate-bounce text-emerald-650" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-950 text-base flex items-center justify-center gap-1.5">
                      Transaction Fully Approved
                      <Sparkles className="w-4 h-4 text-amber-500" />
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-[300px] mx-auto mt-1.5 animate-pulse">
                      The contribution of <strong>${getActualPaymentAmount().toFixed(2)}</strong> for <strong>{selectedFee.title}</strong> is fully cleared and captured.
                      {getFeeBalanceLeft(selectedFee) - getActualPaymentAmount() > 0.01 ? (
                        <span className="block mt-1 bg-slate-50 text-amber-700 border border-slate-150 p-1.5 rounded text-[10px] font-sans">
                          ⚖️ Remaining balance left: <strong>${Math.max(0, getFeeBalanceLeft(selectedFee) - getActualPaymentAmount()).toFixed(2)} USD</strong> to settle before <strong>{selectedFee.dueDate}</strong>.
                        </span>
                      ) : (
                        <span className="block mt-1 bg-emerald-50 text-emerald-800 font-bold p-1 rounded text-[10px] font-mono">
                          ✓ This fee invoice has been 100% paid in full!
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="border-t border-slate-100 pt-3 text-[10px] text-slate-405 font-mono uppercase tracking-widest text-center mt-2">
                    ABBEYS HIGH CASHLESS GATEWAY OK ({payMethod.toUpperCase()})
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
