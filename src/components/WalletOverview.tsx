import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wallet, 
  Plus, 
  Zap, 
  CheckCircle2, 
  ShieldCheck, 
  HelpCircle, 
  Loader2, 
  Smartphone, 
  CreditCard, 
  Send,
  Lock,
  ArrowRight,
  ShieldAlert,
  Check,
  RefreshCw,
  PhoneCall
} from 'lucide-react';
import { Student, Transaction } from '../types';

interface WalletOverviewProps {
  student: Student;
  onUpdateStudent: (updated: Student) => void;
  onAddTransaction: (trans: Transaction) => void;
  transactions: Transaction[];
}

export default function WalletOverview({ student, onUpdateStudent, onAddTransaction, transactions }: WalletOverviewProps) {
  const [addingAmount, setAddingAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [checkoutStep, setCheckoutStep] = useState<'idle' | 'details' | 'ussd' | 'authorizing' | 'success'>('idle');
  const [isRuleSaved, setIsRuleSaved] = useState(false);

  // Expanded Multi-channel payment states
  const [selectedChannel, setSelectedChannel] = useState<'ecocash' | 'onemoney' | 'telecash' | 'innbucks' | 'card' | 'zipit'>('ecocash');
  const [mobileNumber, setMobileNumber] = useState('0771234567');
  const [innbucksAccount, setInnbucksAccount] = useState('IB-442-881');
  const [zipitBank, setZipitBank] = useState('CBZ Bank');
  const [simulatedPin, setSimulatedPin] = useState('');
  const [pinError, setPinError] = useState(false);

  // Auto Top-Up Form States
  const [localAutoEnabled, setLocalAutoEnabled] = useState(student.autoTopUpEnabled);
  const [localThreshold, setLocalThreshold] = useState(student.autoTopUpThreshold);
  const [localAmount, setLocalAmount] = useState(student.autoTopUpAmount);

  // Weekly Budget Goal States
  const [localBudgetEnabled, setLocalBudgetEnabled] = useState(student.weeklyBudgetEnabled ?? true);
  const [localBudgetGoal, setLocalBudgetGoal] = useState(student.weeklyBudgetGoal ?? 50.00);
  const [isBudgetSaved, setIsBudgetSaved] = useState(false);

  // Scheduled Recurring Transfer States
  const [localRecurringEnabled, setLocalRecurringEnabled] = useState(student.recurringTransferEnabled ?? false);
  const [localRecurringAmount, setLocalRecurringAmount] = useState(student.recurringTransferAmount ?? 25.00);
  const [localRecurringFrequency, setLocalRecurringFrequency] = useState(student.recurringTransferFrequency ?? 'weekly');
  const [localRecurringDay, setLocalRecurringDay] = useState(student.recurringTransferDay ?? 'Monday');
  const [localRecurringChannel, setLocalRecurringChannel] = useState(student.recurringTransferChannel ?? 'card');
  const [localRecurringAccount, setLocalRecurringAccount] = useState(student.recurringTransferPhoneOrAccount ?? '0771234567');
  const [isRecurringSaved, setIsRecurringSaved] = useState(false);
  const [isSimulatingRecurring, setIsSimulatingRecurring] = useState(false);
  const [showRecurringSuccess, setShowRecurringSuccess] = useState(false);

  // Toast notifications database state
  const [toasts, setToasts] = useState<{ id: string; title: string; message: string; type: 'warning' | 'info' | 'success' }[]>([]);
  const [notificationPermission, setNotificationPermission] = useState<'default' | 'granted' | 'denied' | 'unsupported'>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission as any : 'unsupported'
  );

  const addToast = (title: string, message: string, type: 'warning' | 'info' | 'success' = 'warning') => {
    const newId = `toast-${Date.now()}-${Math.random()}`;
    const newToast = { id: newId, title, message, type };
    setToasts(prev => {
      // Avoid identical double alerts
      if (prev.some(t => t.title === title && t.message === message)) return prev;
      return [...prev, newToast];
    });
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== newId));
    }, 6000);
  };

  const requestNotificationPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setNotificationPermission('unsupported');
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission as any);
      if (permission === 'granted') {
        new Notification("Abbeys cash pockets - Push Configured", {
          body: `System alerts enabled! We will prompt you right here if ${student.name}'s balance gets low.`,
        });
        addToast(
          "🔔 Push Alerts Enabled",
          "Browser native push alerts are now configured! You will receive active desktop prompts when funds run low.",
          "success"
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Tracking last known states to fire notifications only on trigger
  const lastCheckedBalance = React.useRef<{ [key: string]: number }>({});
  const lastCheckedLimit = React.useRef<{ [key: string]: number }>({});

  React.useEffect(() => {
    const threshold = 0.20 * student.dailyLimit;
    const isLow = student.balance < threshold;

    const prevBalance = lastCheckedBalance.current[student.id];
    const prevLimit = lastCheckedLimit.current[student.id];

    if (isLow) {
      const balanceChanged = prevBalance === undefined || prevBalance !== student.balance;
      const limitChanged = prevLimit === undefined || prevLimit !== student.dailyLimit;
      
      if (balanceChanged || limitChanged) {
        const thresholdPercent = ((student.balance / student.dailyLimit) * 100).toFixed(0);
        addToast(
          `⚠️ Low Balance Alert: ${student.name}`,
          `Wallet drops below 20% of their daily spending limit! Current: $${student.balance.toFixed(2)} USD (Limit: $${student.dailyLimit.toFixed(2)} USD, remaining: ${thresholdPercent}%).`,
          'warning'
        );

        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification(`⚠️ Low Balance Alert: ${student.name}`, {
              body: `Remaining balance ($${student.balance.toFixed(2)}) has reached ${thresholdPercent}% of the daily limit ($${student.dailyLimit.toFixed(2)}). Please top up!`,
            });
          } catch (e) {
            console.error("Failed to showcase background notification", e);
          }
        }
      }
    }

    lastCheckedBalance.current[student.id] = student.balance;
    lastCheckedLimit.current[student.id] = student.dailyLimit;
  }, [student.id, student.balance, student.dailyLimit]);

  // Sync state triggers when active student or properties change
  React.useEffect(() => {
    setLocalAutoEnabled(student.autoTopUpEnabled);
    setLocalThreshold(student.autoTopUpThreshold);
    setLocalAmount(student.autoTopUpAmount);
    setLocalBudgetEnabled(student.weeklyBudgetEnabled ?? true);
    setLocalBudgetGoal(student.weeklyBudgetGoal ?? 50.00);
    setLocalRecurringEnabled(student.recurringTransferEnabled ?? false);
    setLocalRecurringAmount(student.recurringTransferAmount ?? 25.00);
    setLocalRecurringFrequency(student.recurringTransferFrequency ?? 'weekly');
    setLocalRecurringDay(student.recurringTransferDay ?? 'Monday');
    setLocalRecurringChannel(student.recurringTransferChannel ?? 'card');
    setLocalRecurringAccount(student.recurringTransferPhoneOrAccount ?? '0771234567');
  }, [
    student.id, 
    student.autoTopUpEnabled, 
    student.autoTopUpThreshold, 
    student.autoTopUpAmount, 
    student.weeklyBudgetEnabled, 
    student.weeklyBudgetGoal,
    student.recurringTransferEnabled,
    student.recurringTransferAmount,
    student.recurringTransferFrequency,
    student.recurringTransferDay,
    student.recurringTransferChannel,
    student.recurringTransferPhoneOrAccount
  ]);

  const startTopUpFlow = (amount: number) => {
    setAddingAmount(amount);
    // Set a matching default phone prefix for mobile money channels
    if (selectedChannel === 'ecocash') {
      setMobileNumber('0771234567');
    } else if (selectedChannel === 'onemoney') {
      setMobileNumber('0712345678');
    } else if (selectedChannel === 'telecash') {
      setMobileNumber('0732889901');
    }
    setCheckoutStep('details');
  };

  const handleExecutePaymentDetails = () => {
    if (!addingAmount) return;

    if (['ecocash', 'onemoney', 'telecash', 'innbucks'].includes(selectedChannel)) {
      // Transition to interactive simulated Smartphone PIN prompt step!
      setCheckoutStep('ussd');
      setSimulatedPin('');
      setPinError(false);
    } else {
      // Direct authorization for Cards & ZIPIT Transfer
      processFinalSettlement();
    }
  };

  const verifySimulatedUssdPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (simulatedPin.length < 4) {
      setPinError(true);
      return;
    }
    // Success simulation!
    processFinalSettlement();
  };

  const processFinalSettlement = () => {
    setCheckoutStep('authorizing');
    const finalAmount = addingAmount || 10;
    
    // Simulate payment channel verification across gateway rails
    setTimeout(() => {
      setCheckoutStep('success');
      
      // Update child balance
      onUpdateStudent({
        ...student,
        balance: student.balance + finalAmount,
      });

      // Construct distinct transaction merchant details based on selected system
      let merchantTitle = 'Parent Debit Card *4819';
      if (selectedChannel === 'ecocash') {
        merchantTitle = `EcoCash TopUp (${mobileNumber})`;
      } else if (selectedChannel === 'onemoney') {
        merchantTitle = `OneMoney TopUp (${mobileNumber})`;
      } else if (selectedChannel === 'telecash') {
        merchantTitle = `Telecash TopUp (${mobileNumber})`;
      } else if (selectedChannel === 'innbucks') {
        merchantTitle = `InnBucks FastPay (${innbucksAccount})`;
      } else if (selectedChannel === 'zipit') {
        merchantTitle = `ZIPIT Bank: ${zipitBank}`;
      }

      const topupTx: Transaction = {
        id: `tx-topup-${Date.now()}`,
        studentId: student.id,
        date: new Date().toISOString(),
        category: 'topup',
        merchant: merchantTitle,
        amount: finalAmount,
        type: 'credit',
        status: 'completed',
      };
      
      onAddTransaction(topupTx);

      // Close modal / clear inputs
      setTimeout(() => {
        setCheckoutStep('idle');
        setAddingAmount(null);
        setCustomAmount('');
      }, 2000);
    }, 1800);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(customAmount);
    if (!isNaN(amount) && amount > 0) {
      startTopUpFlow(amount);
    }
  };

  const saveAutoRules = () => {
    onUpdateStudent({
      ...student,
      autoTopUpEnabled: localAutoEnabled,
      autoTopUpThreshold: localThreshold,
      autoTopUpAmount: localAmount,
    });
    setIsRuleSaved(true);
    setTimeout(() => setIsRuleSaved(false), 2000);
  };

  // Weekly Budget Goal Calculations & Methods
  const startOfWeek = new Date('2026-05-25T00:00:00Z');
  const weeklySpending = transactions
    .filter(tx => {
      if (tx.studentId !== student.id) return false;
      if (tx.type !== 'debit') return false;
      if (tx.status !== 'completed') return false;
      const txDate = new Date(tx.date);
      return txDate >= startOfWeek;
    })
    .reduce((sum, tx) => sum + tx.amount, 0);

  const budgetGoalToUse = localBudgetGoal || 1;
  const budgetProgress = (weeklySpending / budgetGoalToUse) * 100;

  const saveWeeklyBudget = () => {
    onUpdateStudent({
      ...student,
      weeklyBudgetEnabled: localBudgetEnabled,
      weeklyBudgetGoal: localBudgetGoal,
    });
    setIsBudgetSaved(true);
    setTimeout(() => setIsBudgetSaved(false), 2000);
  };

  const saveRecurringTransferPlan = () => {
    onUpdateStudent({
      ...student,
      recurringTransferEnabled: localRecurringEnabled,
      recurringTransferAmount: localRecurringAmount,
      recurringTransferFrequency: localRecurringFrequency,
      recurringTransferDay: localRecurringDay,
      recurringTransferChannel: localRecurringChannel,
      recurringTransferPhoneOrAccount: localRecurringAccount,
    });
    setIsRecurringSaved(true);
    setTimeout(() => setIsRecurringSaved(false), 2000);
  };

  const simulateRecurringTransferNow = () => {
    setIsSimulatingRecurring(true);
    
    setTimeout(() => {
      onUpdateStudent({
        ...student,
        balance: student.balance + localRecurringAmount,
      });

      let channelName = 'Parent Linked Card *4819';
      if (localRecurringChannel === 'ecocash') {
        channelName = `EcoCash Scheduled (${localRecurringAccount})`;
      } else if (localRecurringChannel === 'onemoney') {
        channelName = `OneMoney Scheduled (${localRecurringAccount})`;
      } else if (localRecurringChannel === 'telecash') {
        channelName = `Telecash Scheduled (${localRecurringAccount})`;
      } else if (localRecurringChannel === 'innbucks') {
        channelName = `InnBucks Scheduled Account (${localRecurringAccount})`;
      } else if (localRecurringChannel === 'zipit') {
        channelName = `ZIPIT Scheduled: CBZ Bank`;
      }

      const scheduledTx: Transaction = {
        id: `tx-recur-${Date.now()}`,
        studentId: student.id,
        date: new Date().toISOString(),
        category: 'topup',
        merchant: `Recurring Transfer: ${channelName} (${localRecurringFrequency.toUpperCase()})`,
        amount: localRecurringAmount,
        type: 'credit',
        status: 'completed',
      };

      onAddTransaction(scheduledTx);
      setIsSimulatingRecurring(false);
      setShowRecurringSuccess(true);
      setTimeout(() => {
        setShowRecurringSuccess(false);
      }, 3000);
    }, 1500);
  };

  // Quick preset options
  const presets = [10, 20, 50];

  return (
    <div className="space-y-6">
      {/* Toast notifications container fixed on screen */}
      <div id="float-toasts-portal" className="fixed bottom-5 right-5 space-y-3 z-50 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              id={`ui-toast-${toast.id}`}
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
              className="pointer-events-auto bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-rose-100 flex gap-3.5 items-start justify-between"
            >
              <div className="flex gap-3">
                <div className="text-rose-500 font-bold text-lg mt-0.5">
                  {toast.type === 'warning' ? '⚠️' : 'ℹ️'}
                </div>
                <div>
                  <h5 className="font-extrabold text-slate-850 text-xs">{toast.title}</h5>
                  <p className="text-[10.5px] text-slate-505 leading-normal mt-0.5">{toast.message}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="text-slate-400 hover:text-slate-700 font-bold text-xs p-1 cursor-pointer"
              >
                ×
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Balance Panel */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-xs">
        <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-radial from-indigo-500/10 to-transparent pointer-events-none" />
        <div className="flex justify-between items-center z-10 relative">
          <div className="space-y-1.5">
            <span className="text-xs uppercase tracking-widest text-slate-400 font-medium">Digital Purse Balance</span>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl md:text-5xl font-extrabold tracking-tight font-mono">
                ${student.balance.toFixed(2)}
              </span>
              <span className="text-sm text-slate-300 font-medium">USD</span>
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
            <Wallet className="w-7 h-7 text-indigo-400" />
          </div>
        </div>

        {/* Financial alert banner inside purse */}
        {student.balance < 10 && (
          <div className="mt-5 bg-amber-500/15 border border-amber-500/20 rounded-2xl p-3 flex items-start gap-2.5">
            <div className="text-amber-400 mt-0.5">⚠️</div>
            <div>
              <p className="text-xs font-semibold text-amber-300">Balance running low</p>
              <p className="text-[10px] text-slate-300 leading-normal mt-0.5">
                Current fund is under $10.00. High school purchases may be declined if they go beyond limit.
              </p>
            </div>
          </div>
        )}

        {/* Dynamic Budget Alerts inside Digital Purse Balance */}
        {localBudgetEnabled && budgetProgress >= 80 && (
          <div className={`mt-3 border rounded-2xl p-3 flex items-start gap-2.5 ${
            budgetProgress >= 95 
              ? 'bg-rose-500/15 border-rose-500/20' 
              : 'bg-amber-500/15 border-amber-500/20'
          }`}>
            <div className="mt-0.5 text-xs">
              {budgetProgress >= 95 ? '🚨' : '⚠️'}
            </div>
            <div>
              <p className={`text-xs font-semibold ${
                budgetProgress >= 95 ? 'text-rose-300' : 'text-amber-300'
              }`}>
                {budgetProgress >= 95 ? '95%+ Critical Budget Alert' : '80% Weekly Budget Warning'}
              </p>
              <p className="text-[10.5px] text-slate-300 leading-normal mt-0.5">
                {student.name} consumed <strong className="font-mono text-white">${weeklySpending.toFixed(2)}</strong> of their weekly limit.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Low Balance Alert Center */}
      <div id="low-balance-alert-center-card" className="bg-white rounded-3xl border border-rose-100 p-6 md:p-8 space-y-6">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div className="space-y-1">
            <h4 id="low-balance-center-title" className="font-bold text-slate-900 text-base md:text-lg flex items-center gap-2">
              <span className="p-1.5 bg-rose-50 text-rose-600 rounded-xl">⚠️</span>
              Low Balance Threshold Monitor
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xl font-sans">
              Receive smart push alerts and instant browser alerts when {student.name}'s balance falls below <strong className="text-rose-600 font-mono">20%</strong> of their active daily spending limit (<strong className="font-mono text-slate-800">${(0.2 * student.dailyLimit).toFixed(2)} USD</strong>).
            </p>
          </div>

          {/* Browser notification permission selector */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-150 px-3.5 py-2 rounded-2xl">
            <div className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 font-sans">
              <span>Browser Push:</span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase font-mono ${
                notificationPermission === 'granted' 
                  ? 'bg-emerald-100 text-emerald-800' 
                  : notificationPermission === 'denied' 
                    ? 'bg-rose-150 text-rose-800' 
                    : 'bg-amber-100 text-amber-850 animate-pulse'
              }`}>
                {notificationPermission}
              </span>
            </div>
            {notificationPermission !== 'granted' && notificationPermission !== 'unsupported' && (
              <button
                id="btn-grant-notifications"
                type="button"
                onClick={requestNotificationPermission}
                className="px-2.5 py-1 bg-indigo-650 hover:bg-indigo-750 text-white rounded-lg text-[10px] font-extrabold transition-all cursor-pointer font-sans"
              >
                Enable
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Alert Banner showing current status */}
        {student.balance < 0.2 * student.dailyLimit ? (
          <div id="low-balance-warning-indicator" className="p-4 bg-rose-50/50 border border-rose-100 rounded-2xl flex items-start gap-3 text-rose-900 animate-pulse">
            <div className="text-base mt-0.5">🚨</div>
            <div className="space-y-1">
              <h4 className="text-xs font-black font-sans">Active Critical Low Balance Warning!</h4>
              <p className="text-[10px] leading-relaxed max-w-xl text-rose-800/90 font-sans">
                {student.name}'s active balance is <strong className="font-mono text-rose-950">${student.balance.toFixed(2)} USD</strong>, which is less than 20% of their daily spending limit (<strong className="font-mono text-rose-950">${student.dailyLimit.toFixed(2)} USD</strong>). Please top up immediately to prevent canteen or transport transponder card declines.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex items-start gap-3 text-emerald-900">
            <div className="text-base mt-0.5">✓</div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold font-sans">Balance Healthy</h4>
              <p className="text-[10px] leading-normal opacity-90 text-slate-600 font-sans">
                Wallet balance is in healthy range (${student.balance.toFixed(2)} USD is greater than 20% limit of ${(0.2 * student.dailyLimit).toFixed(2)} USD).
              </p>
            </div>
          </div>
        )}

        {/* Low Balance Interactive Simulator Sandbox Controls */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 md:p-5 space-y-3.5">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-550 font-sans">Low Balance Testing Simulator Sandbox</span>
            <span className="text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded font-mono font-bold leading-none">TESTING SUITE</span>
          </div>

          <p className="text-[10.5px] text-slate-550 leading-relaxed font-sans">
            Quickly trigger, test, and verify the low balance alert conditions without waiting. Click the presets below to adjust the active student parameters instantly:
          </p>

          <div className="flex flex-wrap gap-2">
            {/* Set low balance button */}
            <button
              id={`simulate-low-bal-trigger-${student.id}`}
              type="button"
              onClick={() => {
                const targetLowVal = (0.2 * student.dailyLimit) - 1.00; // Drop below 20% of daily limit
                onUpdateStudent({
                  ...student,
                  balance: targetLowVal,
                });
                addToast(
                  "🧪 Sandbox: Balance Updated",
                  `Student balance set to $${targetLowVal.toFixed(2)} USD (Below 20% limit). Dynamic checker will trigger alerting flows!`,
                  'info'
                );
              }}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-100 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer font-sans"
            >
              <span>📉 Set Balance Below 20%</span>
            </button>

            {/* Subtract $5.00 button */}
            <button
              id={`simulate-sub-5-btn-${student.id}`}
              type="button"
              onClick={() => {
                const newBalance = Math.max(0, student.balance - 5.00);
                onUpdateStudent({
                  ...student,
                  balance: newBalance,
                });
                addToast(
                  "🧪 Sandbox: Decreased Balance",
                  `Subtracted $5.00 from active purse. New balance: $${newBalance.toFixed(2)} USD.`,
                  'info'
                );
              }}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-150 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer font-sans"
            >
              <span>💸 Subtract $5.00</span>
            </button>

            {/* Direct manual trigger buttons */}
            <button
              id={`simulate-direct-low-toast-${student.id}`}
              type="button"
              onClick={() => {
                addToast(
                  `⚠️ Critical Low Balance alert direct check`,
                  `Sandbox Direct Alert Trigger: Emma/Liam's balance has fell under 20% daily restriction limit threshold.`,
                  'warning'
                );
                if (typeof window !== 'undefined' && 'Notification' in window) {
                  if (Notification.permission === 'granted') {
                    new Notification(`⚠️ Low Balance Alert: ${student.name}`, {
                      body: `Remaining balance holds less than 20% of the daily limit. Please reload!`,
                    });
                  } else {
                    requestNotificationPermission();
                  }
                }
              }}
              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-120 text-indigo-700 border border-indigo-100 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer font-sans"
            >
              <span>📣 Instant Run Test Notification</span>
            </button>
            
            {/* Reset button */}
            <button
              id={`simulate-restore-balance-${student.id}`}
              type="button"
              onClick={() => {
                onUpdateStudent({
                  ...student,
                  balance: student.id === 'liam' ? 24.50 : 62.10,
                });
                addToast(
                  "🧪 Sandbox: Restored Balance",
                  `Set student balance back to default.`,
                  'success'
                );
              }}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-750 border border-emerald-100 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer font-sans"
            >
              <span>♻️ Reset Balance</span>
            </button>
          </div>
        </div>
      </div>

      {/* Manual Instant Fund Panel */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 space-y-5">
        <div>
          <h3 className="font-semibold text-slate-900 text-lg">Load Funds Instantly</h3>
          <p className="text-xs text-slate-500 mt-0.5">Top-up card instantly using premium payment options on file.</p>
        </div>

        {/* Preset quick pills */}
        <div className="grid grid-cols-3 gap-3">
          {presets.map((amount) => (
            <button
              id={`preset-add-${amount}-${student.id}`}
              key={amount}
              onClick={() => startTopUpFlow(amount)}
              className="py-3 px-4 rounded-2xl border border-slate-100 bg-slate-50 text-slate-800 font-bold hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all font-mono text-center flex flex-col items-center justify-center group"
            >
              <span className="text-sm group-hover:scale-105 transition-transform">+${amount}</span>
              <span className="text-[9px] font-normal text-slate-400 mt-0.5">USD</span>
            </button>
          ))}
        </div>

        {/* Custom Input form with inline trigger */}
        <form onSubmit={handleCustomSubmit} className="space-y-3">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">$</span>
            <input
              id={`custom-amount-input-${student.id}`}
              type="number"
              min="1"
              max="200"
              placeholder="Enter Custom Amount"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="w-full pl-8 pr-28 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono text-slate-800"
            />
            <button
              id={`submit-custom-add-${student.id}`}
              type="submit"
              disabled={!customAmount || parseFloat(customAmount) <= 0}
              className="absolute right-1.5 top-1.5 bottom-1.5 px-4 bg-indigo-600 text-white font-semibold text-xs rounded-xl hover:bg-indigo-700 hover:shadow-xs transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Top-Up
            </button>
          </div>
          <p className="text-[10px] text-slate-400 leading-snug flex items-center gap-1.5 px-1">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
            Authorized via secured parent checkout token linked to Mastercard (**4819)
          </p>
        </form>
      </div>

      {/* Auto-Topup Conditional Policies */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 space-y-6">
        <div className="flex justify-between items-start">
          <div className="space-y-0.5">
            <h3 className="font-semibold text-slate-900 text-lg flex items-center gap-1.5">
              <Zap className="w-5 h-5 text-indigo-500" />
              Smart Auto Top-Up
            </h3>
            <p className="text-xs text-slate-500">Enable automated balance coverage to guarantee lunch card acceptance.</p>
          </div>
          
          <button
            id={`toggle-auto-topup-${student.id}`}
            onClick={() => setLocalAutoEnabled(!localAutoEnabled)}
            className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 focus:outline-hidden ${
              localAutoEnabled ? 'bg-indigo-600' : 'bg-slate-200'
            }`}
          >
            <div
              className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ${
                localAutoEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <AnimatePresence>
          {localAutoEnabled && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-4 overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-4 pb-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">If Balance falls below</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono">$</span>
                    <input
                      id={`auto-threshold-input-${student.id}`}
                      type="number"
                      value={localThreshold}
                      onChange={(e) => setLocalThreshold(Math.max(1, parseFloat(e.target.value) || 0))}
                      className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Auto load amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono">$</span>
                    <input
                      id={`auto-amount-input-${student.id}`}
                      type="number"
                      value={localAmount}
                      onChange={(e) => setLocalAmount(Math.max(5, parseFloat(e.target.value) || 0))}
                      className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-start gap-2">
                <ShieldCheck className="w-4.5 h-4.5 text-indigo-500 mt-0.5 flex-shrink-0" />
                <p className="text-[11px] text-indigo-800 leading-normal">
                  <strong>Trigger logic</strong>: If {student.name}'s balance drops lower than <span className="font-mono text-xs font-semibold">${localThreshold.toFixed(2)}</span>, the system will execute an autonomic wallet charge of <span className="font-mono text-xs font-semibold">${localAmount.toFixed(2)}</span>.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="text-xs text-slate-400">Payment linked card: Mastercard *4819</span>
          <button
            id={`save-auto-rules-btn-${student.id}`}
            onClick={saveAutoRules}
            disabled={student.autoTopUpEnabled === localAutoEnabled && student.autoTopUpThreshold === localThreshold && student.autoTopUpAmount === localAmount}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-all disabled:opacity-50 disabled:bg-slate-100 disabled:text-slate-400 text-center"
          >
            {isRuleSaved ? '✓ Policies Saved' : 'Save Auto-Top Up rules'}
          </button>
        </div>
      </div>

      {/* Scheduled Recurring Transfers & Top-Ups */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 space-y-6">
        <div className="flex justify-between items-start">
          <div className="space-y-0.5">
            <h3 className="font-semibold text-slate-900 text-lg flex items-center gap-1.5">
              <RefreshCw className="w-5 h-5 text-indigo-500 animate-[spin_8s_linear_infinite]" />
              Scheduled Recurring Transfers
            </h3>
            <p className="text-xs text-slate-500">
              Schedule recurrent wallet additions to automatically fund card usage over regular calendars.
            </p>
          </div>
          
          <button
            id={`toggle-recurring-transfer-${student.id}`}
            type="button"
            onClick={() => setLocalRecurringEnabled(!localRecurringEnabled)}
            className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 focus:outline-hidden ${
              localRecurringEnabled ? 'bg-indigo-600' : 'bg-slate-200'
            }`}
          >
            <div
              className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ${
                localRecurringEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <AnimatePresence>
          {localRecurringEnabled && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-5 overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-1">
                {/* Custom transfer amount */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Transfer Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono">$</span>
                    <input
                      id={`recurring-pct-amount-${student.id}`}
                      type="number"
                      min="5"
                      max="500"
                      value={localRecurringAmount}
                      onChange={(e) => setLocalRecurringAmount(Math.max(1, parseFloat(e.target.value) || 0))}
                      className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-550 focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Frequency selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Calendar frequency</label>
                  <div className="flex gap-2">
                    {(['weekly', 'biweekly', 'monthly'] as const).map((freq) => (
                      <button
                        key={freq}
                        type="button"
                        id={`recurring-freq-${freq}-${student.id}`}
                        onClick={() => {
                          setLocalRecurringFrequency(freq);
                          if (freq === 'monthly') {
                            setLocalRecurringDay('1st Day');
                          } else {
                            setLocalRecurringDay('Monday');
                          }
                        }}
                        className={`flex-1 py-1.5 text-xs font-bold border rounded-xl transition-all capitalize ${
                          localRecurringFrequency === freq
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        {freq === 'biweekly' ? 'Bi-Weekly' : freq}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Specific day schedule */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Transfer Day</label>
                  {localRecurringFrequency === 'monthly' ? (
                    <select
                      id={`recurring-day-select-monthly-${student.id}`}
                      value={localRecurringDay}
                      onChange={(e) => setLocalRecurringDay(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-800"
                    >
                      <option value="1st Day">1st Day of month</option>
                      <option value="5th Day">5th Day of month</option>
                      <option value="15th Day">15th Day of month</option>
                      <option value="Last Day">Last Day of month</option>
                    </select>
                  ) : (
                    <select
                      id={`recurring-day-select-weekly-${student.id}`}
                      value={localRecurringDay}
                      onChange={(e) => setLocalRecurringDay(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-800"
                    >
                      <option value="Monday">Monday</option>
                      <option value="Tuesday">Tuesday</option>
                      <option value="Wednesday">Wednesday</option>
                      <option value="Thursday">Thursday</option>
                      <option value="Friday">Friday</option>
                      <option value="Saturday">Saturday</option>
                      <option value="Sunday">Sunday</option>
                    </select>
                  )}
                </div>

                {/* Gateway Source selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Settlement Source Gateway</label>
                  <select
                    id={`recurring-channel-${student.id}`}
                    value={localRecurringChannel}
                    onChange={(e) => {
                      const channel = e.target.value as any;
                      setLocalRecurringChannel(channel);
                      if (channel === 'ecocash') setLocalRecurringAccount('0771234567');
                      else if (channel === 'onemoney') setLocalRecurringAccount('0712345678');
                      else if (channel === 'innbucks') setLocalRecurringAccount('IB-442-881');
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-800"
                  >
                    <option value="card">Linked Mastercard (*4819)</option>
                    <option value="ecocash">EcoCash Mobile Money</option>
                    <option value="onemoney">OneMoney mobile wallet</option>
                    <option value="innbucks">InnBucks express token</option>
                    <option value="zipit">ZIPIT Instant Interbank</option>
                  </select>
                </div>
              </div>

              {/* Conditional Account fields */}
              {localRecurringChannel !== 'card' && localRecurringChannel !== 'zipit' && (
                <div className="space-y-1.5 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">
                    {localRecurringChannel === 'innbucks' ? 'InnBucks Account Number' : 'Registered Mobile Number'}
                  </label>
                  <div className="relative">
                    {localRecurringChannel !== 'innbucks' && (
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono font-bold">+263</span>
                    )}
                    <input
                      id={`recurring-account-input-${student.id}`}
                      type="text"
                      value={localRecurringAccount}
                      onChange={(e) => setLocalRecurringAccount(e.target.value)}
                      placeholder={localRecurringChannel === 'innbucks' ? 'e.g. IB-404-984' : 'e.g. 0771234567'}
                      className={`w-full py-2 px-3 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 ${
                        localRecurringChannel !== 'innbucks' ? 'pl-14' : ''
                      }`}
                    />
                  </div>
                </div>
              )}

              {/* Informative Explanation layout */}
              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0 animate-pulse" />
                <div className="space-y-0.5">
                  <p className="text-xs text-indigo-950 font-semibold font-sans">Scheduled Policy Confirmed</p>
                  <p className="text-[10.5px] text-indigo-900 leading-normal">
                    This profile guarantees a charge of <strong className="font-mono">${localRecurringAmount.toFixed(2)}</strong> will clear <strong>{localRecurringFrequency === 'weekly' ? 'Weekly' : localRecurringFrequency === 'biweekly' ? 'Bi-Weekly' : 'Monthly'}</strong> on every <strong>{localRecurringDay}</strong>. The settlement drafts directly from the <strong>{localRecurringChannel.toUpperCase()} gateway</strong> into {student.name}'s school ID balance automatically.
                  </p>
                </div>
              </div>

              {/* Execution Success simulator feedback */}
              <AnimatePresence>
                {showRecurringSuccess && (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-3 text-emerald-950"
                  >
                    <Check className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-extrabold font-sans">Instant Deposit Clear Successful!</p>
                      <p className="text-[10.5px] mt-0.5 leading-relaxed text-emerald-800 font-sans">
                        Simulated a successful recurring transfer of <strong className="font-mono">${localRecurringAmount.toFixed(2)} USD</strong>. {student.name}'s wallet was updated on-screen! An audit transaction record has been logged in their ledger.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between border-t border-slate-100 pt-4 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 font-mono">
              STATUS: {localRecurringEnabled ? 'ACTIVE SCHEDULED DRAFT' : 'NO RECURRING SCHEDULE'}
            </span>
          </div>

          <div className="flex gap-2">
            {localRecurringEnabled && (
              <button
                id={`simulate-recur-btn-${student.id}`}
                type="button"
                onClick={simulateRecurringTransferNow}
                disabled={isSimulatingRecurring}
                className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 flex items-center gap-1 cursor-pointer"
              >
                {isSimulatingRecurring ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Simulating...
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 text-indigo-600 animate-bounce" />
                    Simulate Scheduled Deposit Now
                  </>
                )}
              </button>
            )}
            <button
              id={`save-recurring-rules-btn-${student.id}`}
              type="button"
              onClick={saveRecurringTransferPlan}
              disabled={
                student.recurringTransferEnabled === localRecurringEnabled &&
                student.recurringTransferAmount === localRecurringAmount &&
                student.recurringTransferFrequency === localRecurringFrequency &&
                student.recurringTransferDay === localRecurringDay &&
                student.recurringTransferChannel === localRecurringChannel &&
                student.recurringTransferPhoneOrAccount === localRecurringAccount
              }
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-all disabled:opacity-50 disabled:bg-slate-100 disabled:text-slate-400 cursor-pointer"
            >
              {isRecurringSaved ? '✓ Scheduled Plan Saved' : 'Save Recurring Plan'}
            </button>
          </div>
        </div>
      </div>

      {/* Weekly Budget Goal Card */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 space-y-6">
        <div className="flex justify-between items-start">
          <div className="space-y-0.5">
            <h3 className="font-semibold text-slate-900 text-lg flex items-center gap-1.5">
              <span className="text-xl">🎯</span>
              Weekly Budget Goal Tracker
            </h3>
            <p className="text-xs text-slate-500">
              Establish a weekly spending pace allocation and receive active indicators on card usage alerts.
            </p>
          </div>
          
          <button
            id={`toggle-weekly-budget-${student.id}`}
            type="button"
            onClick={() => setLocalBudgetEnabled(!localBudgetEnabled)}
            className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 focus:outline-hidden ${
              localBudgetEnabled ? 'bg-indigo-600' : 'bg-slate-200'
            }`}
          >
            <div
              className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ${
                localBudgetEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <AnimatePresence>
          {localBudgetEnabled && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-5 overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-1">
                {/* Custom goal setting */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Weekly spending limit</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono">$</span>
                    <input
                      id={`weekly-budget-input-${student.id}`}
                      type="number"
                      min="10"
                      max="500"
                      value={localBudgetGoal}
                      onChange={(e) => setLocalBudgetGoal(Math.max(1, parseFloat(e.target.value) || 0))}
                      className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-indigo-550 focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Quick Budget Presets to make it extremely testable */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Quick allocation targets</label>
                  <div className="flex gap-2">
                    {[36.00, 40.00, 50.00, 80.00].map((presetVal) => (
                      <button
                        key={presetVal}
                        type="button"
                        id={`budget-preset-${presetVal}-${student.id}`}
                        onClick={() => setLocalBudgetGoal(presetVal)}
                        className={`flex-1 py-1.5 text-[10px] font-mono font-bold border rounded-xl transition-all ${
                          localBudgetGoal === presetVal
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        ${presetVal.toFixed(0)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Progress Tracker representation */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Current Week Utilization Pace</span>
                  <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    budgetProgress >= 95 
                      ? 'bg-rose-50 text-rose-700' 
                      : budgetProgress >= 80 
                        ? 'bg-amber-50 text-amber-700' 
                        : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    {budgetProgress.toFixed(0)}%
                  </span>
                </div>

                {/* Dynamic color changing progress bar */}
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, budgetProgress)}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className={`h-full rounded-full ${
                      budgetProgress >= 95 
                        ? 'bg-rose-500' 
                        : budgetProgress >= 80 
                          ? 'bg-amber-500' 
                          : 'bg-emerald-500'
                    }`}
                  />
                </div>

                <div className="flex justify-between items-center text-[11px] text-slate-500">
                  <span>Spent: <strong className="font-mono text-slate-800">${weeklySpending.toFixed(2)}</strong></span>
                  <span>Goal Balance: <strong className="font-mono text-slate-800">${Math.max(0, budgetGoalToUse - weeklySpending).toFixed(2)}</strong></span>
                </div>
              </div>

              {/* Automated Visual Alerts */}
              {budgetProgress >= 80 && (
                <div className={`p-4 rounded-2xl border flex items-start gap-3 transition-all ${
                  budgetProgress >= 95 
                    ? 'bg-rose-50/70 border-rose-100 text-rose-900 animate-pulse' 
                    : 'bg-amber-50/70 border-amber-100 text-amber-900'
                }`}>
                  <div className="flex-shrink-0 mt-0.5">
                    {budgetProgress >= 95 ? (
                      <ShieldAlert className="w-5 h-5 text-rose-600" />
                    ) : (
                      <ShieldAlert className="w-5 h-5 text-amber-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold font-sans">
                      {budgetProgress >= 95 ? '🚨 95% Critical Spending Alert' : '⚠️ 80% Budget Threshold Reached'}
                    </h4>
                    <p className="text-[10px] leading-relaxed mt-0.5 opacity-90">
                      {student.name} has utilized <strong>${weeklySpending.toFixed(2)}</strong> in debit transactions which constitutes <strong>{budgetProgress.toFixed(1)}%</strong> of their weekly budget target (${budgetGoalToUse.toFixed(2)}). {budgetProgress >= 95 ? 'Immediate funding attention or spending restrictions recommended.' : 'High spending velocity observed for this weekly period.'}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="text-[10px] text-slate-400 font-mono">
            PERIOD OF TRACKING: MON MAY 25 - SUN MAY 31, 2026
          </span>
          <button
            id={`save-weekly-budget-btn-${student.id}`}
            type="button"
            onClick={saveWeeklyBudget}
            disabled={student.weeklyBudgetEnabled === localBudgetEnabled && student.weeklyBudgetGoal === localBudgetGoal}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-all disabled:opacity-50 disabled:bg-slate-100 disabled:text-slate-400 cursor-pointer"
          >
            {isBudgetSaved ? '✓ Budget Settings Saved' : 'Save Weekly Budget'}
          </button>
        </div>
      </div>

      {/* Simulated Multi-Channel Authorization overlay/modal */}
      <AnimatePresence>
        {checkoutStep !== 'idle' && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-md w-full border border-slate-100 flex flex-col"
            >
              
              {/* Step 1: Details & Method Selection */}
              {checkoutStep === 'details' && (
                <div className="p-6 md:p-8 space-y-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-indigo-600 block">Unified Cashless checkout</span>
                      <h4 className="font-extrabold text-slate-900 text-lg">Load Student Wallet</h4>
                    </div>
                    <button
                      id="close-topup-detail-modal"
                      onClick={() => setCheckoutStep('idle')}
                      className="text-slate-400 hover:text-slate-700 font-bold text-lg p-1"
                    >
                      ×
                    </button>
                  </div>

                  {/* Summary Box */}
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-500">Deposit Amount:</span>
                    <span className="text-xl font-mono font-black text-slate-800">${addingAmount?.toFixed(2)} USD</span>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-bold uppercase text-slate-500 block tracking-wider">Select Payment System</label>
                    
                    {/* Payment Channels Grid */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => { setSelectedChannel('ecocash'); setMobileNumber('0771234567'); }}
                        className={`p-3 rounded-xl border text-left flex items-center gap-2 transition ${
                          selectedChannel === 'ecocash' 
                            ? 'border-indigo-600 bg-indigo-50/40 text-indigo-950 ring-1 ring-indigo-500/20' 
                            : 'border-slate-150 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <Smartphone className="w-4 h-4 text-rose-500 flex-shrink-0" />
                        <div className="leading-tight">
                          <span className="text-xs font-bold block">EcoCash</span>
                          <span className="text-[8px] text-slate-400">Mobile Money</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => { setSelectedChannel('onemoney'); setMobileNumber('0712345678'); }}
                        className={`p-3 rounded-xl border text-left flex items-center gap-2 transition ${
                          selectedChannel === 'onemoney' 
                            ? 'border-indigo-600 bg-indigo-50/40 text-indigo-950 ring-1 ring-indigo-500/20' 
                            : 'border-slate-150 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <Smartphone className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <div className="leading-tight">
                          <span className="text-xs font-bold block">OneMoney</span>
                          <span className="text-[8px] text-slate-400">NetOne Wallet</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => { setSelectedChannel('innbucks'); }}
                        className={`p-3 rounded-xl border text-left flex items-center gap-2 transition ${
                          selectedChannel === 'innbucks' 
                            ? 'border-indigo-600 bg-indigo-50/40 text-indigo-950 ring-1 ring-indigo-500/20' 
                            : 'border-slate-150 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <Zap className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        <div className="leading-tight">
                          <span className="text-xs font-bold block">InnBucks</span>
                          <span className="text-[8px] text-slate-400">Express App</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => { setSelectedChannel('zipit'); }}
                        className={`p-3 rounded-xl border text-left flex items-center gap-2 transition ${
                          selectedChannel === 'zipit' 
                            ? 'border-indigo-600 bg-indigo-50/40 text-indigo-950 ring-1 ring-indigo-500/20' 
                            : 'border-slate-150 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <Send className="w-4 h-4 text-sky-500 flex-shrink-0" />
                        <div className="leading-tight">
                          <span className="text-xs font-bold block">ZIPIT</span>
                          <span className="text-[8px] text-slate-400">Instant Bank</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => { setSelectedChannel('card'); }}
                        className={`p-3 rounded-xl border text-left flex items-center gap-2 transition col-span-2 ${
                          selectedChannel === 'card' 
                            ? 'border-indigo-600 bg-indigo-50/40 text-indigo-950 ring-1 ring-indigo-500/20' 
                            : 'border-slate-150 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <CreditCard className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                        <div className="leading-tight">
                          <span className="text-xs font-bold block">Credit/Debit Card (Visa / Mastercard / UnionPay)</span>
                          <span className="text-[8px] text-slate-400">Primary Linked: Mastercard ending in *4819</span>
                        </div>
                      </button>
                    </div>

                    {/* Conditional input fields based on payment network selection */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                      {['ecocash', 'onemoney', 'telecash'].includes(selectedChannel) && (
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-slate-500 uppercase block">Registered Phone Line</label>
                          <div className="relative">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold font-mono">+263</span>
                            <input
                              id="mobile-pay-number-input"
                              type="text"
                              value={mobileNumber}
                              onChange={(e) => setMobileNumber(e.target.value)}
                              placeholder="e.g. 0771234567"
                              className="w-full pl-14 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800"
                            />
                          </div>
                          <span className="text-[9px] text-slate-400 block font-normal">
                            System will transmit a secure dial-in prompt to this subscriber number.
                          </span>
                        </div>
                      )}

                      {selectedChannel === 'innbucks' && (
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-slate-500 uppercase block">InnBucks Account Number / phone</label>
                          <input
                            id="innbucks-acct-input"
                            type="text"
                            value={innbucksAccount}
                            onChange={(e) => setInnbucksAccount(e.target.value)}
                            placeholder="e.g. IB-404-984"
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800"
                          />
                          <span className="text-[9px] text-slate-400 block font-normal">
                            Validates InnBucks shopper authorization token.
                          </span>
                        </div>
                      )}

                      {selectedChannel === 'zipit' && (
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-slate-500 uppercase block">Routing Origin Bank</label>
                          <select
                            id="zipit-bank-select"
                            value={zipitBank}
                            onChange={(e) => setZipitBank(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                          >
                            <option value="CBZ Bank">CBZ Bank</option>
                            <option value="CABS">CABS</option>
                            <option value="Steward Bank">Steward Bank</option>
                            <option value="Nedbank Zimbabwe">Nedbank Zimbabwe</option>
                            <option value="NMB Bank">NMB Bank</option>
                            <option value="FBC Bank">FBC Bank</option>
                            <option value="Stanbic Bank">Stanbic Bank</option>
                            <option value="EcoBank">EcoBank</option>
                          </select>
                          <span className="text-[9px] text-slate-400 block font-normal">
                            Secures immediate interbank ZIPIT settlement rails.
                          </span>
                        </div>
                      )}

                      {selectedChannel === 'card' && (
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-slate-800 block">Mastercard (Primary Linked)</span>
                          <span className="text-[10px] text-slate-400 block">
                            Token ID: active_cl_89132 • Holder: G. MABENA • Card Ending: **** **** **** 4819
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Submit Actions */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setCheckoutStep('idle')}
                      className="flex-1 py-2.5 border border-slate-200 text-slate-700 rounded-xl font-bold text-xs hover:bg-slate-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleExecutePaymentDetails}
                      className="flex-1 py-2.5 bg-slate-900 border border-slate-805 text-white rounded-xl font-bold text-xs hover:bg-slate-800 transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>Authorize</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Simulated USSD phone mockup page */}
              {checkoutStep === 'ussd' && (
                <div className="p-6 md:p-8 space-y-5 text-center">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase tracking-wider font-extrabold text-rose-500 block">Waiting for Interactive Approver</span>
                    <h4 className="font-bold text-slate-800 text-sm">USSD Phone PIN Prompt</h4>
                    <p className="text-xs text-slate-400 leading-normal max-w-xs mx-auto">
                      Look at your mobile device! We have simulation-triggered the secure PIN approval layer for phone number <strong>+263 {mobileNumber}</strong>.
                    </p>
                  </div>

                  {/* Interactive Smartphone Container */}
                  <div className="max-w-[270px] mx-auto bg-slate-900 text-white rounded-3xl p-5 border-4 border-slate-800 shadow-xl space-y-4 relative font-mono text-left">
                    <div className="flex justify-between items-center text-[8px] text-white/50 border-b border-white/10 pb-1.5 leading-none">
                      <span>EC-NET LTE</span>
                      <span>{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                      <span>🔋 96%</span>
                    </div>

                    <div className="bg-slate-950 p-3.5 rounded-xl border border-white/10 text-xs text-white space-y-2">
                      <div className="text-[10px] uppercase font-bold text-rose-400 flex items-center gap-1.5">
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>{selectedChannel.toUpperCase()} PAY</span>
                      </div>
                      
                      <p className="text-[10px] text-slate-350 leading-relaxed font-mono">
                        Merchant: <strong>ABBEYS-HIGH</strong><br />
                        Amount: <strong>${addingAmount?.toFixed(2)} USD</strong><br />
                        Type: School Wallet topup<br />
                        <span className="text-amber-300">Enter pin to confirm payment:</span>
                      </p>

                      <form onSubmit={verifySimulatedUssdPinSubmit} className="space-y-2">
                        <input
                          id="mobile-money-pin-simulator"
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
                          <span className="text-[8px] text-red-400 block font-sans">
                            PIN verification failed. Must enter continuous 4 digits.
                          </span>
                        )}
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setCheckoutStep('details')}
                            className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-sans text-[9px] rounded-md font-bold text-center"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-sans text-[9px] rounded-md font-bold text-center"
                          >
                            Approve
                          </button>
                        </div>
                      </form>
                    </div>

                    <div className="text-[8px] text-white/40 text-center uppercase tracking-widest mt-1">
                      🔒 SECURED LOCAL API SANDBOX
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-400 leading-normal max-w-xs mx-auto">
                    Type any mock PIN (e.g., <code className="bg-slate-100 font-mono text-slate-700 px-1 rounded text-[10px] font-bold">1234</code>) and click **Approve** to authorize.
                  </p>
                </div>
              )}

              {/* Step 3: Authorizing / Verifying */}
              {checkoutStep === 'authorizing' && (
                <div className="p-12 text-center space-y-4">
                  <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto relative">
                    <Loader2 className="w-7 h-7 animate-spin" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-slate-900 text-base">Securing Clearing Portal</h4>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                      Verifying settlement receipt of <strong>${addingAmount?.toFixed(2)}</strong> via the <strong>{selectedChannel.toUpperCase()} gateway</strong>...
                    </p>
                  </div>
                  <div className="border-t border-slate-100 pt-3 text-[10px] text-slate-400 font-mono">
                    TERMINAL AUTH: ABBEYS-PAY-{(Math.random() * 1000).toFixed(0)}
                  </div>
                </div>
              )}

              {/* Step 4: Success Completion */}
              {checkoutStep === 'success' && (
                <div className="p-8 md:p-10 text-center space-y-4">
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10 animate-bounce" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="font-extrabold text-slate-950 text-base">Authentication Confirmed</h4>
                    <p className="text-xs text-slate-650 leading-relaxed max-w-sm mx-auto">
                      Fund of <strong>${addingAmount?.toFixed(2)} USD</strong> settled instantly. High-school ID cards are synchronized and ready to spend!
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-4 text-left space-y-1.5 font-mono text-[10px] text-slate-500 border border-slate-100">
                    <div>TXID: MP-{(Math.random() * 100000).toFixed(0)}</div>
                    <div>MERCHANT: ABBEYS HIGH CAFE</div>
                    <div>CHANNEL: {selectedChannel.toUpperCase()}</div>
                    <div>STATUS: INJECTED SUCCESSFULLY</div>
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
