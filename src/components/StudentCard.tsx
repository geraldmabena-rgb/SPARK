import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, ShieldAlert, Wifi, CreditCard, Sliders, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Student } from '../types';

interface StudentCardProps {
  student: Student;
  onUpdateStudent: (updated: Student) => void;
}

export default function StudentCard({ student, onUpdateStudent }: StudentCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showLimitAlert, setShowLimitAlert] = useState(false);

  const toggleFreeze = () => {
    const updatedStatus = student.cardStatus === 'active' ? 'frozen' : 'active';
    onUpdateStudent({
      ...student,
      cardStatus: updatedStatus,
    });
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLimit = parseFloat(e.target.value) || 0;
    onUpdateStudent({
      ...student,
      dailyLimit: newLimit,
    });
    
    // Briefly flash a confirmation indicator
    setShowLimitAlert(true);
    setTimeout(() => {
      setShowLimitAlert(false);
    }, 1500);
  };

  const toggleLowBalance = () => {
    onUpdateStudent({
      ...student,
      lowBalanceAlert: !student.lowBalanceAlert,
    });
  };

  // Select card background based on school level
  const isHighSchool = student.grade.includes('High School');
  const gradientStyles = isHighSchool
    ? 'from-indigo-600 via-indigo-700 to-slate-900 text-white'
    : 'from-emerald-600 via-emerald-700 to-slate-900 text-white';

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-6 md:p-8 flex flex-col justify-between space-y-6">
      {/* Header and Toggle Lock */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg text-slate-900">Abbeys High Card</h3>
          <p className="text-xs text-slate-500 font-mono">Linked to parent account: {student.studentId}</p>
        </div>
        
        <button
          id={`toggle-lock-${student.id}`}
          onClick={toggleFreeze}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
            student.cardStatus === 'active'
              ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
              : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'
          }`}
        >
          {student.cardStatus === 'active' ? (
            <>
              <ShieldAlert className="w-3.5 h-3.5" />
              Freeze Card
            </>
          ) : (
            <>
              <Shield className="w-3.5 h-3.5" />
              Unfreeze Card
            </>
          )}
        </button>
      </div>

      {/* ID Card Visualization */}
      <div className="relative w-full h-56 md:h-60 perspective" style={{ perspective: '1000px' }}>
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          style={{ transformStyle: 'preserve-3d' }}
          className="w-full h-full relative cursor-pointer"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* Card Front */}
          <div
            className={`absolute inset-0 w-full h-full rounded-2xl p-5 md:p-6 bg-gradient-to-br ${gradientStyles} flex flex-col justify-between overflow-hidden shadow-lg`}
            style={{ backfaceVisibility: 'hidden' }}
          >
            {/* Gloss Overlay and Micro-chip */}
            <div className="absolute right-0 top-0 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex justify-between items-start z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-md">
                  <CreditCard className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-sm tracking-wide leading-none">{student.schoolName}</h4>
                  <span className="text-[9px] text-white/90 uppercase tracking-widest font-semibold font-mono">Abbeys High Card</span>
                </div>
              </div>
              <Wifi className="w-5 h-5 text-white/80 animate-pulse" />
            </div>

            {/* Student Info Center */}
            <div className="flex items-center gap-4 my-auto z-10">
              <img
                src={student.photoUrl}
                alt={student.name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 md:w-20 md:h-20 rounded-xl object-cover border-2 border-white/25 shadow-md flex-shrink-0"
              />
              <div className="flex-1">
                <span className="text-[10px] text-white/70 font-medium tracking-wider uppercase bg-white/10 px-2 py-0.5 rounded-md">
                  {student.grade}
                </span>
                <h5 className="font-bold text-lg md:text-xl mt-1 tracking-tight leading-tight">{student.name}</h5>
                <p className="text-xs text-white/70 font-mono mt-0.5">{student.studentId}</p>
              </div>
            </div>

            {/* Card Footer Balance */}
            <div className="flex justify-between items-end border-t border-white/15 pt-3 z-10">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-white/50 block leading-none">Card Balance</span>
                <span className="font-mono font-bold text-lg text-white">
                  ${student.balance.toFixed(2)}
                </span>
              </div>
              
              <div className="text-right">
                <span className="text-[9px] uppercase tracking-wider text-white/50 block leading-none">Daily Limit</span>
                <span className="font-mono font-bold text-sm text-white/90">
                  ${student.dailyLimit.toFixed(2)} / day
                </span>
              </div>
            </div>

            {/* Frozen Overlay */}
            <AnimatePresence>
              {student.cardStatus === 'frozen' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center text-center p-4 z-20"
                >
                  <AlertTriangle className="w-8 h-8 text-amber-400 mb-2 animate-bounce" />
                  <p className="font-extrabold text-sm uppercase tracking-wider text-red-500">Card Suspended</p>
                  <p className="text-xs text-slate-300 mt-1 max-w-[240px]">
                    This card is currently locked. It will fail tap-ins, transport feeds, and food counters.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Card Back */}
          <div
            className="absolute inset-0 w-full h-full rounded-2xl p-6 bg-slate-900 border border-slate-800 text-slate-300 flex flex-col justify-between"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            {/* Magnetic Strip */}
            <div className="-mx-6 h-9 bg-slate-850 mt-1" />

            <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px] font-mono">
                <div>
                  <span className="text-slate-500 block">CARD ISSUER</span>
                  <span>ABBEYS HIGH SCHOOL DISTRICT</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block">HELPDESK</span>
                  <span>+1 (800) 555-8821</span>
                </div>
              </div>

              {/* Barcode representation */}
              <div className="bg-white p-2.5 rounded-lg flex flex-col items-center justify-center">
                <div className="w-full flex items-center h-8 justify-around px-1 overflow-hidden">
                  {Array.from({ length: 42 }).map((_, idx) => {
                    const widths = [1, 2, 3, 4, 1, 2];
                    const width = widths[idx % widths.length];
                    return (
                      <div
                        key={idx}
                        className="bg-black h-full"
                        style={{
                          width: `${width}px`,
                          opacity: idx % 7 === 0 || idx % 9 === 0 ? 0.1 : 1,
                        }}
                      />
                    );
                  })}
                </div>
                <span className="text-[8px] font-mono text-slate-600 mt-1 tracking-widest">{student.studentId}*002492</span>
              </div>
            </div>

            <p className="text-[8px] text-slate-500 text-center leading-normal">
              Property of school district. Scannable at cafeterias, bus transponders, libraries, and events.
            </p>
          </div>
        </motion.div>
      </div>

      <div className="text-center">
        <p className="text-xs text-slate-400 inline-flex items-center justify-center gap-1">
          <Info className="w-3 h-3 text-slate-500" />
          Click the card above to view the barcode / flip the card
        </p>
      </div>

      {/* Card Rules Controls */}
      <div className="space-y-5 border-t border-slate-100 pt-5">
        {/* Daily Spending Limit Controller */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium text-slate-700 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-slate-500" />
              Daily Allowance Limit
            </span>
            <span className="font-semibold text-slate-900 font-mono bg-slate-100 px-2 py-0.5 rounded-md">
              ${student.dailyLimit.toFixed(2)}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <input
              id={`slide-limit-${student.id}`}
              type="range"
              min="0"
              max="50"
              step="1"
              value={student.dailyLimit}
              disabled={student.cardStatus === 'frozen'}
              onChange={handleLimitChange}
              className="flex-1 accent-indigo-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <span className="text-[10px] text-slate-400 font-mono">$50 max</span>
          </div>

          <AnimatePresence>
            {showLimitAlert && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-emerald-600 font-medium flex items-center gap-1"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Limit updated successfully!
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* System Settings Switches */}
        <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-slate-800">Low Balance Warnings</span>
            <p className="text-[10px] text-slate-500 leading-tight">
              Email alert when child card falls below Auto Top-Up point
            </p>
          </div>
          <button
            id={`toggle-warning-${student.id}`}
            onClick={toggleLowBalance}
            className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 outline-hidden ${
              student.lowBalanceAlert ? 'bg-indigo-600' : 'bg-slate-200'
            }`}
          >
            <div
              className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-200 ${
                student.lowBalanceAlert ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
