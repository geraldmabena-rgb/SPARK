import React from 'react';
import { motion } from 'motion/react';
import { TrendingUp, Sparkles, AlertCircle, ShoppingBag, Landmark, Coffee, HeartHandshake } from 'lucide-react';
import { Student, Transaction } from '../types';

interface DashboardAnalyticsProps {
  student: Student;
  transactions: Transaction[];
}

export default function DashboardAnalytics({ student, transactions }: DashboardAnalyticsProps) {
  // Filter transactions specific to this child
  const studentTx = transactions.filter(t => t.studentId === student.id && t.status === 'completed' && t.category !== 'topup');

  // Compute total spent
  const totalSpent = studentTx.reduce((sum, tx) => sum + tx.amount, 0);

  // Compute category breakdown
  const categories: Record<string, number> = {
    cafeteria: 0,
    transport: 0,
    materials: 0,
    sports: 0,
    activities: 0
  };

  studentTx.forEach(tx => {
    if (categories[tx.category] !== undefined) {
      categories[tx.category] += tx.amount;
    }
  });

  // Calculate percentages for beautiful SVG visuals
  const values = Object.values(categories);
  const labels = Object.keys(categories);
  const totalCategories = values.reduce((a, b) => a + b, 0) || 1;

  const categoryConfigs: Record<string, { label: string, color: string, ringColor: string, icon: string }> = {
    cafeteria: { label: 'Dining room', color: 'bg-orange-500', ringColor: '#f97316', icon: '🍎' },
    transport: { label: 'School Bus', color: 'bg-sky-500', ringColor: '#0ea5e9', icon: '🚌' },
    materials: { label: 'Books & Supplies', color: 'bg-purple-500', ringColor: '#a855f7', icon: '📝' },
    sports: { label: 'Athletics & Kit', color: 'bg-emerald-500', ringColor: '#10b981', icon: '🏆' },
    activities: { label: 'Trips & Clubs', color: 'bg-pink-500', ringColor: '#ec4899', icon: '🎨' }
  };

  // Safe division helpers for progress meters
  const getPct = (amount: number) => {
    return Math.min(100, Math.round((amount / totalCategories) * 100));
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 space-y-6">
      {/* Header */}
      <div>
        <h3 className="font-semibold text-slate-900 text-lg flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-500" />
          Allowance & Spend Insights
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">Statistical insights showing how {student.name} spent their cashless lunch rules.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Left Side: Circular Donut Gauge SVG */}
        <div className="md:col-span-5 flex flex-col items-center justify-center space-y-4">
          <div className="relative w-40 h-40 flex items-center justify-center">
            {/* Simple nested ring layout with responsive centers */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Slate Base circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="#f1f5f9"
                strokeWidth="10"
              />

              {/* Dynamic Stacked Rings representation */}
              {labels.map((lbl, idx) => {
                const amount = categories[lbl];
                if (amount === 0) return null;

                const pct = amount / totalCategories;
                const circumference = 2 * Math.PI * 40;
                const strokeDasharray = circumference;
                
                // Accumulate prior offsets
                let priorSum = 0;
                for (let i = 0; i < idx; i++) {
                  priorSum += categories[labels[i]];
                }
                const offsetPct = priorSum / totalCategories;
                const strokeDashoffset = circumference - (pct * circumference);
                const rotation = offsetPct * 360;

                return (
                  <circle
                    key={lbl}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke={categoryConfigs[lbl]?.ringColor || '#cbd5e1'}
                    strokeWidth="10"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    transform={`rotate(${rotation} 50 50)`}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-in-out"
                  />
                );
              })}
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold leading-none">Total Tap Cash</span>
              <span className="text-2xl font-black font-mono text-slate-900 mt-1">${totalSpent.toFixed(2)}</span>
              <span className="text-[9px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full font-semibold mt-1">This term</span>
            </div>
          </div>
          
          <div className="text-[11px] text-slate-400 text-center leading-relaxed">
            Outer stroke shows distribution of the student's itemized card scans.
          </div>
        </div>

        {/* Right Side: Category Breakdown with visual percentages progress */}
        <div className="md:col-span-7 space-y-4">
          <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">Spending breakdown</span>
          
          <div className="space-y-3.5">
            {labels.map((lbl) => {
              const amount = categories[lbl];
              const cfg = categoryConfigs[lbl];
              const pct = getPct(amount);

              if (!cfg) return null;

              return (
                <div id={`analytics-bar-${lbl}`} key={lbl} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <span>{cfg.icon}</span>
                      {cfg.label}
                    </span>
                    <div className="space-x-1.5 text-right font-mono">
                      <span className="font-bold text-slate-900">${amount.toFixed(2)}</span>
                      <span className="text-slate-400">({pct}%)</span>
                    </div>
                  </div>

                  {/* Custom progress bar */}
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-full ${cfg.color} rounded-full`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Safety stats footer info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-5 text-xs text-slate-600">
        <div className="p-3 bg-indigo-50/50 border border-indigo-100/40 rounded-2xl flex items-start gap-2.5">
          <ShoppingBag className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h4 className="font-semibold text-indigo-950">Active Meal Restrictions</h4>
            <p className="text-[10px] text-indigo-700 leading-snug">
              {student.foodRestrictions.length} menu blocks active. Card triggers auto-rejections when scanning matching items.
            </p>
          </div>
        </div>

        <div className="p-3 bg-emerald-50/50 border border-emerald-100/40 rounded-2xl flex items-start gap-2.5">
          <Landmark className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h4 className="font-semibold text-slate-900">Wallet Rule Check</h4>
            <p className="text-[10px] text-slate-500 leading-snug">
              {student.autoTopUpEnabled 
                ? `Auto-Deposit is set to load +$${student.autoTopUpAmount.toFixed(2)} automatically if card is below $${student.autoTopUpThreshold.toFixed(2)}.`
                : 'Auto top-up disabled. Ensure you monitor the low-balance triggers.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
