import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard, 
  User, 
  Sparkles, 
  RotateCcw, 
  HelpCircle, 
  Activity, 
  Bell, 
  GraduationCap, 
  MapPin, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Briefcase
} from 'lucide-react';

import { Student, Transaction, SchoolFee, AttendanceRecord } from './types';
import { INITIAL_STUDENTS, INITIAL_TRANSACTIONS, SCHOOL_FEES, INITIAL_ATTENDANCE } from './data';

import StudentCard from './components/StudentCard';
import AttendanceTracker from './components/AttendanceTracker';
import WalletOverview from './components/WalletOverview';
import DietaryControls from './components/DietaryControls';
import TransactionHistory from './components/TransactionHistory';
import FeePayments from './components/FeePayments';
import DashboardAnalytics from './components/DashboardAnalytics';

export default function App() {
  // Persistence layers
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('parent_portal_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('parent_portal_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [fees, setFees] = useState<SchoolFee[]>(() => {
    const saved = localStorage.getItem('parent_portal_fees');
    return saved ? JSON.parse(saved) : SCHOOL_FEES;
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('parent_portal_attendance_list');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  // Active student selection
  const [activeStudentId, setActiveStudentId] = useState<string>(INITIAL_STUDENTS[0].id);
  const [resetFinished, setResetFinished] = useState(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('parent_portal_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('parent_portal_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('parent_portal_fees', JSON.stringify(fees));
  }, [fees]);

  useEffect(() => {
    localStorage.setItem('parent_portal_attendance_list', JSON.stringify(attendance));
  }, [attendance]);

  // Find active student object
  const activeStudent = students.find((s) => s.id === activeStudentId) || students[0];

  // Callback to update a student's attributes
  const handleUpdateStudent = (updatedStudent: Student) => {
    setStudents((prev) => prev.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)));
  };

  // Callback to insert an approved transaction
  const handleAddTransaction = (newTx: Transaction) => {
    setTransactions((prev) => [newTx, ...prev]);
  };

  // Callback to mark a school fee as paid or partially paid
  const handlePayFee = (feeId: string, amountPaid: number) => {
    setFees((prev) =>
      prev.map((f) => {
        if (f.id === feeId) {
          const currentBal = f.balanceLeft !== undefined ? f.balanceLeft : (f.status === 'paid' ? 0 : f.amount);
          const nextBal = Math.max(0, currentBal - amountPaid);
          return {
            ...f,
            balanceLeft: nextBal,
            status: nextBal <= 0.01 ? 'paid' : 'unpaid'
          };
        }
        return f;
      })
    );
  };

  // Callback to append a new billing fee invoice
  const handleAddFee = (newFee: SchoolFee) => {
    setFees((prev) => [newFee, ...prev]);
  };

  // Callback to record custom classroom attendance
  const handleAddAttendance = (newRecord: AttendanceRecord) => {
    setAttendance((prev) => [newRecord, ...prev]);
  };

  // Clear LocalStorage to reset the demo data
  const handleResetData = () => {
    localStorage.removeItem('parent_portal_students');
    localStorage.removeItem('parent_portal_transactions');
    localStorage.removeItem('parent_portal_fees');
    localStorage.removeItem('parent_portal_attendance_list');
    setStudents(INITIAL_STUDENTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setFees(SCHOOL_FEES);
    setAttendance(INITIAL_ATTENDANCE);
    setActiveStudentId(INITIAL_STUDENTS[0].id);
    setResetFinished(true);
    setTimeout(() => setResetFinished(false), 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-150 selection:text-indigo-900 pb-16 antialiased">
      {/* Top Banner Warning context */}
      <div className="bg-indigo-900 text-white py-2 px-4 text-center text-xs font-semibold flex items-center justify-center gap-1.5 leading-none">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span>Abbeys High Consolidated Cashless Network — Standard parent administration portal.</span>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* Header Block */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-205 mb-8">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-indigo-600 text-white rounded-lg p-1.5 flex-shrink-0">
                <CreditCard className="w-5 h-5" />
              </span>
              <h1 className="font-extrabold text-2xl md:text-3xl text-slate-900 tracking-tight">Abbeys High Parent Control</h1>
            </div>
            <p className="text-xs md:text-sm text-slate-500 font-medium">
              Manage school ID cash pockets, cafeteria limits, and activity invoices for your linked children.
            </p>
          </div>

          {/* User profile & systemic resets */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <button
              id="reset-data-pills"
              onClick={handleResetData}
              className="flex items-center gap-1 text-slate-500 hover:text-slate-800 text-xs font-semibold px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-all"
              title="Reset initial seed wallet balances and fees data"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {resetFinished ? 'Reset Complete!' : 'Reset Stats'}
            </button>

            {/* Parent badge */}
            <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-2xl border border-slate-200">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                <User className="w-4 h-4 text-slate-600" />
              </div>
              <div className="text-left font-sans">
                <h2 className="text-xs font-bold text-slate-800 leading-none">Gerald Chen</h2>
                <span className="text-[9px] text-slate-400 font-mono block mt-0.5" title="Logged in parent email">geraldmabena@gmail.com</span>
              </div>
            </div>
          </div>
        </header>

        {/* Portal Info Panel / Live Connection Status */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mb-8 bg-slate-100/60 p-4 rounded-3xl border border-slate-200/40">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-slate-700 font-sans">
              Live SafeGate™ RFID Registry Sync: <strong className="text-indigo-700">Online</strong>
            </span>
          </div>

          <div className="text-right text-[10.5px] text-slate-400 font-mono hidden sm:block">
            ACTIVE PORTAL REGISTRY: <span className="font-bold text-indigo-650">PARENT_ADMINISTRATION</span>
          </div>
        </div>

        <>
            {/* Student Selector Card/Widget */}
            <section className="mb-8 space-y-3.5">
              <div className="flex justify-between items-end">
                <span className="text-xs font-extrabold text-slate-500 uppercase tracking-widest block">Select Linked Student</span>
                <span className="text-xs text-slate-400 font-medium">Quick tap picture to switch child focus</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {students.map((st) => {
                  const isActive = st.id === activeStudentId;
                  const hasLowBalance = st.balance < st.autoTopUpThreshold && st.autoTopUpEnabled;
                  
                  return (
                    <button
                      id={`select-student-${st.id}`}
                      key={st.id}
                      onClick={() => setActiveStudentId(st.id)}
                      className={`relative p-5 rounded-3xl text-left border transition-all duration-300 bg-white flex items-center justify-between group cursor-pointer ${
                        isActive
                          ? st.id === 'liam'
                            ? 'border-emerald-500 shadow-md ring-2 ring-emerald-500/10'
                            : 'border-indigo-600 shadow-md ring-2 ring-indigo-600/10'
                          : 'border-slate-150 hover:border-slate-350 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {/* Portrait Thumbnail */}
                        <div className="relative">
                          <img
                            src={st.photoUrl}
                            alt={st.name}
                            referrerPolicy="no-referrer"
                            className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-3xs"
                          />
                          {st.cardStatus === 'frozen' && (
                            <div className="absolute inset-0 bg-red-650/80 rounded-2xl flex items-center justify-center text-[8px] font-black text-white uppercase tracking-wider text-center">
                              LOCKED
                            </div>
                          )}
                        </div>

                        <div className="space-y-0.5">
                          <span className="text-[10px] text-slate-400 font-mono font-medium tracking-wide uppercase leading-none bg-slate-50 px-1.5 py-0.5 rounded">
                            {st.grade}
                          </span>
                          <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors text-sm md:text-base leading-snug">
                            {st.name}
                          </h4>
                          <p className="text-xs text-slate-500 font-sans flex items-center gap-1">
                            <span className="inline-block w-2 h-2 rounded-full bg-indigo-500" />
                            Card Status: <span className="font-semibold">{st.cardStatus}</span>
                          </p>
                        </div>
                      </div>

                      {/* Right hand financials summary */}
                      <div className="text-right space-y-0.5 pl-3 border-l border-slate-100">
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-semibold">Funds Purse</span>
                        <span className="font-mono font-black text-base md:text-lg text-slate-900 block leading-none">
                          ${st.balance.toFixed(2)}
                        </span>
                        <span className="text-[10px] font-sans text-slate-400 block mt-0.5">
                          Limit: ${st.dailyLimit.toFixed(2)} / d
                        </span>
                      </div>

                      {/* Active highlight corner pin */}
                      {isActive && (
                        <span className={`absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold leading-none shadow-sm ${
                          st.id === 'liam' ? 'bg-emerald-500' : 'bg-indigo-600'
                        }`}>
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Dynamic Inner Layout based on Active Student switching */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStudentId}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
              >
                {/* LEFT AREA: Cards, Limits, Dietary controls (Col Span 5/12) */}
                <div className="lg:col-span-5 space-y-8">
                  
                  {/* Card visualizer & Status freeze/unfreeze & Daily Limit ranges */}
                  <StudentCard
                    student={activeStudent}
                    onUpdateStudent={handleUpdateStudent}
                  />

                  {/* Health Allergies and Restricted Food Catalog lists */}
                  <DietaryControls
                    student={activeStudent}
                    onUpdateStudent={handleUpdateStudent}
                  />

                </div>

                {/* RIGHT AREA: Purse triggers, Settle Fees, and Analytics (Col Span 7/12) */}
                <div className="lg:col-span-7 space-y-8">
                  
                  {/* Instant funds cash injection & Auto triggers policies */}
                  <WalletOverview
                    student={activeStudent}
                    onUpdateStudent={handleUpdateStudent}
                    onAddTransaction={handleAddTransaction}
                    transactions={transactions}
                  />

                  {/* Statistical insights on spent tokens breakdown */}
                  <DashboardAnalytics
                    student={activeStudent}
                    transactions={transactions}
                  />

                  {/* School billing invoices and Trip levying */}
                  <FeePayments
                    student={activeStudent}
                    fees={fees}
                    onUpdateStudent={handleUpdateStudent}
                    onPayFee={handlePayFee}
                    onAddTransaction={handleAddTransaction}
                  />

                </div>

                {/* FULL WIDTH BLOCK: Attendance Tracker */}
                <div className="lg:col-span-12">
                  <AttendanceTracker
                    student={activeStudent}
                    records={attendance}
                    onAddRecord={(newRec) => setAttendance((prev) => [newRec, ...prev])}
                  />
                </div>

                {/* FULL WIDTH BLOCK: Audit logs and scan failures */}
                <div className="lg:col-span-12">
                  <TransactionHistory
                    transactions={transactions}
                    studentId={activeStudentId}
                    student={activeStudent}
                  />
                </div>

              </motion.div>
            </AnimatePresence>
          </>
      </div>
    </div>
  );
}
