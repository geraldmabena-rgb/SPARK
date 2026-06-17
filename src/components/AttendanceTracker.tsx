import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle, 
  AlertTriangle, 
  MessageSquare, 
  Info, 
  PlusCircle, 
  Smartphone, 
  Bell, 
  Radio, 
  Layers, 
  BookOpen, 
  ShieldCheck 
} from 'lucide-react';
import { Student, AttendanceRecord } from '../types';

interface AttendanceTrackerProps {
  student: Student;
  records: AttendanceRecord[];
  onAddRecord: (rec: AttendanceRecord) => void;
}

interface SimMessage {
  id: string;
  timestamp: string;
  recipient: 'Parent' | 'Teacher';
  recipientDetail: string;
  type: 'SMS' | 'In-App Notification';
  text: string;
}

export default function AttendanceTracker({ student, records, onAddRecord }: AttendanceTrackerProps) {
  // Filter records belonging to the currently selected student
  const studentRecords = records.filter(r => r.studentId === student.id);

  // Segmenting logs: Classroom Lesson Swipes vs Gate/Bus Checks
  const [activeTab, setActiveTab] = useState<'class' | 'gate'>('class');

  // Interactive RFID Simulator state
  const [simSubject, setSimSubject] = useState<string>(
    student.id === 'liam' ? 'Grade 6 Mathematics' : 'Advanced AP Calculus AB'
  );
  const [simStatus, setSimStatus] = useState<AttendanceRecord['status']>('present');
  const [simLocation, setSimLocation] = useState<string>('Classroom RFID Touchpoint Room 120');
  const [simulating, setSimulating] = useState(false);
  const [simSuccessMsg, setSimSuccessMsg] = useState('');
  
  // Simulated SMS Alerts Gateway history state
  const [simMessages, setSimMessages] = useState<SimMessage[]>([
    {
      id: 'init-msg-1',
      timestamp: '08:16 AM',
      recipient: 'Parent',
      recipientDetail: 'Gerald Chen (Parent SMS Gateway)',
      type: 'SMS',
      text: `🔔 SafeGate RFID alert: Liam Chen checked in safely at West Wing Homeroom 4B Reader on 2026-06-15 at 08:15 AM.`
    }
  ]);

  // General statistics count
  const totalDays = studentRecords.filter(r => !r.subject).length || 1;
  const presentCount = studentRecords.filter(r => !r.subject && r.status === 'present').length;
  const lateCount = studentRecords.filter(r => !r.subject && r.status === 'late').length;
  const excusedCount = studentRecords.filter(r => !r.subject && r.status === 'excused').length;
  const absentCount = studentRecords.filter(r => !r.subject && r.status === 'absent').length;

  const schoolAttendanceRate = Math.round(((presentCount + lateCount) / totalDays) * 100);

  // Lesson schedule configuration in RFID terminal
  const CLASSES_BY_STUDENT: Record<string, { name: string; room: string }[]> = {
    liam: [
      { name: 'Homeroom Roll-Call', room: 'West Wing Homeroom 4B Reader' },
      { name: 'Grade 6 Mathematics', room: 'Maths Block Room 204 RFID' },
      { name: 'Junior Physics Practical', room: 'Science Dome Lab Access Node' },
      { name: 'Physical Education & Athletics', room: 'Central Gymnasium NFC Gate' },
      { name: 'English Literature & Reading', room: 'Abbeys Middle Library Room 4' }
    ],
    emma: [
      { name: 'Homeroom Study Hall', room: 'High School Library Gate Reader' },
      { name: 'Advanced AP Calculus AB', room: 'Room 302 High Hall NFC Terminal' },
      { name: 'Honors Chemistry Grade 10', room: 'Bio-chemistry Wing Lab A Terminal' },
      { name: 'High School Art & Portfolio', room: 'East Wing Studio Gate' }
    ]
  };

  const availableClasses = CLASSES_BY_STUDENT[student.id] || CLASSES_BY_STUDENT.liam;

  // Excuse Absence form states (unchanged, standard functionality)
  const [excuseDate, setExcuseDate] = useState(new Date().toISOString().split('T')[0]);
  const [excuseReason, setExcuseReason] = useState('');
  const [isSubmittingExcuse, setIsSubmittingExcuse] = useState(false);
  const [excuseSuccess, setExcuseSuccess] = useState(false);

  // Late Notification Option Form states
  const [formType, setFormType] = useState<'absence' | 'late'>('absence');
  const [lateDate, setLateDate] = useState(new Date().toISOString().split('T')[0]);
  const [lateEta, setLateEta] = useState('08:45 AM');
  const [lateReason, setLateReason] = useState('');
  const [isSubmittingLate, setIsSubmittingLate] = useState(false);
  const [lateSuccess, setLateSuccess] = useState(false);

  const handleSubmitLateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lateReason.trim()) return;

    setIsSubmittingLate(true);
    setTimeout(() => {
      const todayString = lateDate;
      const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const newRec: AttendanceRecord = {
        id: `att-late-notice-${Date.now()}`,
        studentId: student.id,
        date: todayString,
        status: 'late',
        method: 'manual',
        location: `Late Notice ETA: ${lateEta}. Reason: "${lateReason.trim()}"`,
        subject: 'Homeroom Roll-Call'
      };

      onAddRecord(newRec);

      const parentSmsText = `🔔 Abbeys High Parent Portal: Late Notice registered for ${student.name} today. Estimated Arrival Time (ETA): ${lateEta}. Reason: "${lateReason.trim()}". Teacher notified.`;
      const teacherNotifText = `🖥️ Classroom Attendance Monitor: Parent filed advance Late Notice for ${student.name}. ETA: ${lateEta}. Reason: "${lateReason.trim()}". Register automatically flagged as LATE/EXCUSED.`;

      const parentMsg: SimMessage = {
        id: `late-msg-p-${Date.now()}`,
        timestamp: timeString,
        recipient: 'Parent',
        recipientDetail: 'Gerald Chen (Immediate Parent SMS Alert)',
        type: 'SMS',
        text: parentSmsText
      };

      const teacherMsg: SimMessage = {
        id: `late-msg-t-${Date.now()}`,
        timestamp: timeString,
        recipient: 'Teacher',
        recipientDetail: 'Homeroom Teacher Dashboard Feed',
        type: 'In-App Notification',
        text: teacherNotifText
      };

      setSimMessages(prev => [parentMsg, teacherMsg, ...prev]);
      setIsSubmittingLate(false);
      setLateReason('');
      setLateSuccess(true);

      setTimeout(() => {
        setLateSuccess(false);
      }, 4000);
    }, 1000);
  };

  // Handle Swipe Simulation action
  const handleSimulateCardSwipe = () => {
    setSimulating(true);
    setSimSuccessMsg('');

    setTimeout(() => {
      const matchedClass = availableClasses.find(c => c.name === simSubject);
      const targetLoc = matchedClass ? matchedClass.room : simLocation;
      const todayString = new Date().toISOString().split('T')[0];
      const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Append record standard AttendanceRecord
      const newRecord: AttendanceRecord = {
        id: `att-swipe-sim-${Date.now()}`,
        studentId: student.id,
        date: todayString,
        status: simStatus,
        checkInTime: simStatus === 'absent' ? undefined : timeString,
        method: 'card_tap',
        location: targetLoc,
        subject: simSubject
      };

      onAddRecord(newRecord);

      // Generate messages to Parent and Homeroom teacher
      const statusWord = simStatus === 'present' ? 'PRESENT' : 
                         simStatus === 'late' ? 'LATE/DELAYED' :
                         simStatus === 'excused' ? 'EXCUSED LEAVE' : 'ABSENT (MISSING)';

      const parentAlertText = `🔔 Abbeys SafeGate Alert: ${student.name} tapped their physical ID card for class [${simSubject}] at ${targetLoc}. Status recorded: ${statusWord} today at ${timeString}. Smart safety monitoring is active.`;
      const teacherAlertText = `🖥️ Classroom Register Sync: RFID Tap validated for ${student.name} in [${simSubject}]. Teacher dashboard register locked on ${statusWord} matching student ID ${student.studentId} instantly.`;

      const parentMsg: SimMessage = {
        id: `sim-msg-p-${Date.now()}`,
        timestamp: timeString,
        recipient: 'Parent',
        recipientDetail: 'Gerald Chen (Immediate Push/SMS Gateway)',
        type: 'SMS',
        text: parentAlertText
      };

      const teacherMsg: SimMessage = {
        id: `sim-msg-t-${Date.now()}`,
        timestamp: timeString,
        recipient: 'Teacher',
        recipientDetail: 'Subject Instructor (Classroom Register Feed)',
        type: 'In-App Notification',
        text: teacherAlertText
      };

      setSimMessages(prev => [parentMsg, teacherMsg, ...prev]);
      setSimulating(false);
      setSimSuccessMsg(`SUCCESS: ${student.name}'s smart card linked. Everyday class register synchronized!`);
    }, 1000);
  };

  const handleSubmitExcuse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!excuseReason.trim()) return;

    setIsSubmittingExcuse(true);
    setTimeout(() => {
      const newRec: AttendanceRecord = {
        id: `att-excuse-${Date.now()}`,
        studentId: student.id,
        date: excuseDate,
        status: 'excused',
        method: 'manual',
        location: `Parent Excused Note: "${excuseReason.trim()}"`
      };

      onAddRecord(newRec);
      setIsSubmittingExcuse(false);
      setExcuseReason('');
      setExcuseSuccess(true);

      setTimeout(() => {
        setExcuseSuccess(false);
      }, 3000);
    }, 1000);
  };

  // Helper styles configured for visual polish
  const getStatusConfig = (status: AttendanceRecord['status']) => {
    switch (status) {
      case 'present':
        return { label: 'Present', pill: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: '✓' };
      case 'late':
        return { label: 'Late', pill: 'bg-amber-50 text-amber-700 border-amber-100', icon: '⏳' };
      case 'excused':
        return { label: 'Excused', pill: 'bg-indigo-50 text-indigo-700 border-indigo-100', icon: '📝' };
      case 'absent':
        return { label: 'Absent', pill: 'bg-red-50 text-red-700 border-red-105', icon: '⚠️' };
    }
  };

  const getMethodBadge = (method: AttendanceRecord['method']) => {
    switch (method) {
      case 'bus_scanner':
        return { label: 'RFID Bus Scan', bg: 'bg-sky-50 text-sky-700 border-sky-100' };
      case 'card_tap':
        return { label: 'Gate Card Tap', bg: 'bg-teal-50 text-teal-700 border-teal-100' };
      case 'manual':
        return { label: 'Parent Portal', bg: 'bg-indigo-50 text-indigo-700 border-indigo-100' };
    }
  };

  const classroomLogs = studentRecords.filter(r => r.subject);
  const gateLogs = studentRecords.filter(r => !r.subject);

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 space-y-8 shadow-3xs">
      
      {/* Header Segment */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Calendar className="w-5 h-5" />
            </span>
            <h3 className="font-extrabold text-slate-900 text-lg md:text-xl">Everyday Attendance & Class Logs</h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Browse daily subject check-ins scanned directly inside student classrooms, school buses, and campus safety gates.
          </p>
        </div>

        {/* Global Attendance Rate */}
        <div className="bg-slate-900 text-white px-5 py-2.5 rounded-2xl flex items-center gap-3self-start md:self-auto shadow-sm">
          <div className="text-right">
            <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold leading-none">Term Safety Rate</span>
            <span className="font-mono text-xs text-slate-300 mt-0.5 block">Official Register</span>
          </div>
          <div className="h-8 w-[1px] bg-slate-800" />
          <span className="text-2xl font-black font-mono text-emerald-400">{schoolAttendanceRate}%</span>
        </div>
      </div>

      {/* Stats Breakdown Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-center space-y-0.5">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Days Tracked</span>
          <span className="text-xl font-bold font-mono text-slate-900">{totalDays}</span>
          <span className="text-[10px] text-slate-400 block leading-none">school sessions</span>
        </div>

        <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-center space-y-0.5">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Late Alerts</span>
          <span className="text-xl font-bold font-mono text-amber-500">{lateCount}</span>
          <span className="text-[10px] text-slate-400 block leading-none">delayed arrivals</span>
        </div>

        <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-center space-y-0.5">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Authorized excuses</span>
          <span className="text-xl font-bold font-mono text-indigo-600">{excusedCount}</span>
          <span className="text-[10px] text-slate-400 block leading-none">notes filed</span>
        </div>

        <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-center space-y-0.5">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Unexcused Absences</span>
          <span className="text-xl font-bold font-mono text-red-500">{absentCount}</span>
          <span className="text-[10px] text-slate-400 block leading-none">missed gates</span>
        </div>
      </div>

      {/* Interactive RFID Device Swipe Simulator */}
      <div className="bg-gradient-to-br from-indigo-50/50 to-slate-50/50 p-6 rounded-3xl border border-indigo-100/70 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="space-y-0.5">
            <h4 className="font-extrabold text-indigo-950 text-sm flex items-center gap-1.5 uppercase tracking-wide">
              <Radio className="w-4.5 h-4.5 text-indigo-600 animate-pulse" />
              RFID ID Card Scanner Simulator (SafeGate™ Demo Device)
            </h4>
            <p className="text-[11px] text-slate-500">
              Simulate your child swiping their smart student ID card at school. Watch it link with everyday class registers and broadcast notifications.
            </p>
          </div>
          <span className="bg-green-100 text-green-800 border border-green-200 uppercase text-[8.5px] font-black tracking-widest px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
            Active Reader Online
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4.5 rounded-2xl border border-slate-150">
          
          {/* Select Subject/Lesson */}
          <div className="space-y-1.5">
            <label className="text-[10.5px] font-bold text-slate-505 uppercase tracking-wider block">Select Subject/Class Session</label>
            <select
              value={simSubject}
              onChange={(e) => setSimSubject(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-500/20"
            >
              {availableClasses.map((cl, idx) => (
                <option key={idx} value={cl.name}>
                  {cl.name} ({cl.room.split(' ')[0]})
                </option>
              ))}
              <option value="School Bus Route Ingress">School Bus Morning Check-In</option>
              <option value="Main Entrance Gate Swipe">School Main Entrance Gate</option>
            </select>
          </div>

          {/* Select Status */}
          <div className="space-y-1.5">
            <label className="text-[10.5px] font-bold text-slate-505 uppercase tracking-wider block">Tapped Roll Status</label>
            <div className="grid grid-cols-3 gap-1">
              {[
                { key: 'present', label: 'Present', color: 'text-emerald-600' },
                { key: 'late', label: 'Late', color: 'text-amber-600' },
                { key: 'absent', label: 'Absent', color: 'text-rose-600' }
              ].map(item => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setSimStatus(item.key as any)}
                  className={`py-1.5 text-[11px] border rounded-lg transition-all font-bold ${
                    simStatus === item.key 
                      ? 'bg-slate-900 border-slate-900 text-white shadow-3xs' 
                      : 'bg-white hover:bg-slate-50 text-slate-650 border-slate-200'
                  }`}
                >
                  <span className={simStatus === item.key ? 'text-white' : item.color}>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Simulator Actions */}
          <div className="flex flex-col justify-end">
            <button
              id="tap-card-simulator-btn"
              type="button"
              disabled={simulating}
              onClick={handleSimulateCardSwipe}
              className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-black tracking-wide transition-all shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {simulating ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  SIMULATING CHIP SCAN...
                </>
              ) : (
                <>
                  <span>⚡</span>
                  <span>TAP SMART CARD - LINK ENTRY</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Display Success Alert */}
        <AnimatePresence>
          {simSuccessMsg && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-3 bg-emerald-500/10 border border-emerald-400/20 text-emerald-900 rounded-2xl flex items-center gap-2 text-xs font-medium"
            >
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-600 flex-shrink-0" />
              <span>{simSuccessMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Live Broadcast Logs for Parent & Teacher */}
        <div className="space-y-2.5">
          <div className="flex justify-between items-center pr-1">
            <span className="text-[10px] font-black text-slate-450 uppercase tracking-wider block">Live Message Dispatch (Immediate Gateway Delivery Logs)</span>
            <span className="text-[9px] font-mono text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-md font-bold">SMTP / SMS API ONLINE</span>
          </div>

          <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
            {simMessages.map((msg) => (
              <div 
                key={msg.id} 
                className="p-3 bg-white border border-slate-150 rounded-2xl flex flex-col gap-1 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[8.5px] font-extrabold tracking-wider uppercase inline-flex items-center gap-1 ${
                      msg.recipient === 'Parent' 
                        ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                        : 'bg-teal-100 text-teal-700 border border-teal-200'
                    }`}>
                      {msg.recipient === 'Parent' ? <Smartphone className="w-2.5 h-2.5" /> : <Bell className="w-2.5 h-2.5" />}
                      {msg.type} • {msg.recipientDetail}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400">{msg.timestamp}</span>
                  </div>
                  <span className="text-[9px] text-emerald-600 font-bold font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Delivered
                  </span>
                </div>
                <p className="text-[11px] text-slate-700 tracking-tight leading-relaxed font-sans">{msg.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Logs View Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Area: Logs tab lists (Col span 7/12) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Sub Tab selection to switch between class register and gate logs */}
          <div className="flex justify-between items-center">
            <div className="flex p-0.5 bg-slate-100/80 border border-slate-200/50 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab('class')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'class'
                    ? 'bg-white text-indigo-750 shadow-3xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                📚 Everyday Lesson Register ({classroomLogs.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('gate')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'gate'
                    ? 'bg-white text-indigo-750 shadow-3xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                🚪 Daily Gate Swipes ({gateLogs.length})
              </button>
            </div>

            <span className="text-[9px] font-mono text-slate-400 uppercase">
              Current Focus: {activeTab.toUpperCase()}_TIMELINE
            </span>
          </div>

          <div className="space-y-3 max-h-120 overflow-y-auto pr-1">
            {activeTab === 'class' ? (
              // Display Classroom subject-by-subject attendance
              classroomLogs.map((r) => {
                const cfg = getStatusConfig(r.status);
                const mth = getMethodBadge(r.method);

                return (
                  <div
                    id={`class-att-row-${r.id}`}
                    key={r.id}
                    className="p-4 bg-slate-50/50 border border-slate-150 rounded-2xl flex justify-between items-start gap-4 hover:bg-slate-50 transition duration-150 shadow-3xs hover:shadow-2xs"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-indigo-900 text-xs font-sans tracking-tight">
                          {r.subject}
                        </span>
                        <span className="text-[9.5px] text-slate-400 font-mono">
                          {r.date}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 font-semibold flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        {r.location}
                      </p>

                      {r.checkInTime && (
                        <div className="flex gap-4 text-[10.5px] text-slate-450 font-mono">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            RFID Registered tap: <strong className="text-slate-600">{r.checkInTime}</strong>
                          </span>
                        </div>
                      )}
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase border tracking-wider flex-shrink-0 flex items-center gap-1 ${cfg?.pill}`}>
                      <span>{cfg?.icon}</span>
                      <span>{cfg?.label}</span>
                    </span>
                  </div>
                );
              })
            ) : (
              // Display daily Gate Swipes (Bus or main entrance gate checkpoints)
              gateLogs.map((r) => {
                const cfg = getStatusConfig(r.status);
                const mth = getMethodBadge(r.method);

                return (
                  <div
                    id={`gate-att-row-${r.id}`}
                    key={r.id}
                    className="p-4 bg-slate-50/50 border border-slate-150 rounded-2xl flex justify-between items-start gap-4 hover:bg-slate-50 transition duration-150 shadow-3xs"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-800 text-xs font-mono">{r.date}</span>
                        <span className={`px-2 py-0.5 text-[8px] font-bold uppercase rounded border ${mth?.bg}`}>
                          {mth?.label}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        {r.location}
                      </p>

                      {(r.checkInTime || r.checkOutTime) && (
                        <div className="flex gap-4 text-[10.5px] text-slate-450 font-mono">
                          {r.checkInTime && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              Ingress: <strong>{r.checkInTime}</strong>
                            </span>
                          )}
                          {r.checkOutTime && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-450" />
                              Egress: <strong>{r.checkOutTime}</strong>
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase border tracking-wider flex-shrink-0 flex items-center gap-1 ${cfg?.pill}`}>
                      <span>{cfg?.icon}</span>
                      <span>{cfg?.label}</span>
                    </span>
                  </div>
                );
              })
            )}

            {((activeTab === 'class' && classroomLogs.length === 0) || 
              (activeTab === 'gate' && gateLogs.length === 0)) && (
              <div className="py-12 border-2 border-dashed border-slate-100 rounded-2xl text-center text-slate-400 text-sm">
                No logs found in this category. Use the card scanner simulator above to test!
              </div>
            )}
          </div>
        </div>

        {/* Right Area: Excuse absence note registry notes (Col span 5/12) */}
        <div className="lg:col-span-5 bg-slate-50/50 border border-slate-150 rounded-3xl p-6 space-y-4">
          <div className="flex p-0.5 bg-slate-200/50 border border-slate-200/40 rounded-2xl shadow-3xs">
            <button
              type="button"
              onClick={() => setFormType('absence')}
              className={`flex-1 py-1.5 rounded-xl text-[11px] font-black tracking-tight transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
                formType === 'absence'
                  ? 'bg-white text-indigo-750 shadow-xs'
                  : 'text-slate-505 hover:text-slate-850'
              }`}
            >
              <span>📝 Absence Note</span>
            </button>
            <button
              type="button"
              onClick={() => setFormType('late')}
              className={`flex-1 py-1.5 rounded-xl text-[11px] font-black tracking-tight transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
                formType === 'late'
                  ? 'bg-white text-indigo-750 shadow-xs'
                  : 'text-slate-505 hover:text-slate-850'
              }`}
            >
              <span>⏱️ Report Late</span>
            </button>
          </div>

          {formType === 'absence' ? (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-0.5">
                <h4 className="font-extrabold text-slate-905 text-sm flex items-center gap-1.5 uppercase tracking-wide">
                  <MessageSquare className="w-4.5 h-4.5 text-indigo-650" />
                  Request Absence Excuse
                </h4>
                <p className="text-[11px] text-slate-505 leading-normal">
                  Pre-indicate incoming absent sessions for dental checks, medical issues, or athletic schedules to prevent truant alerts.
                </p>
              </div>

              <form onSubmit={handleSubmitExcuse} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">Selected Date</label>
                  <input
                    id="excuse-date-input"
                    type="date"
                    required
                    value={excuseDate}
                    onChange={(e) => setExcuseDate(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">Reason for Absence</label>
                  <textarea
                    id="excuse-reason-input"
                    required
                    rows={3}
                    placeholder="e.g. Scheduled orthodontist exam at Abbeys Health Dental Clinic."
                    value={excuseReason}
                    onChange={(e) => setExcuseReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
                  />
                </div>

                <AnimatePresence>
                  {excuseSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="p-3 bg-emerald-50 border border-emerald-110 text-[11px] text-emerald-800 rounded-xl flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Absence excuse approved and synchronized into class registry sheets!</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  id="submit-excuse-btn"
                  type="submit"
                  disabled={isSubmittingExcuse || !excuseReason.trim()}
                  className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition disabled:opacity-50 flex justify-center items-center gap-1.5 cursor-pointer shadow-3xs"
                >
                  {isSubmittingExcuse ? (
                    <>
                      <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Filing excuse...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4" />
                      File Absence Note
                    </>
                  )}
                </button>
              </form>

              <div className="pt-3 border-t border-slate-200 flex gap-2 items-start text-[10px] text-slate-400 leading-snug">
                <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <span>Filing a parent note will auto-flag attendance logs to bypass marking the student as a truant.</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-0.5">
                <h4 className="font-extrabold text-slate-905 text-sm flex items-center gap-1.5 uppercase tracking-wide">
                  <Clock className="w-4.5 h-4.5 text-indigo-650" />
                  Report Late Student ETA
                </h4>
                <p className="text-[11px] text-slate-505 leading-normal">
                  Send an official, verified alert directly to your child's homeroom teacher and subject mentors if they are running behind schedule.
                </p>
              </div>

              <form onSubmit={handleSubmitLateNotice} className="space-y-3.5">
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase block">Late Date</label>
                    <input
                      id="late-date-input"
                      type="date"
                      required
                      value={lateDate}
                      onChange={(e) => setLateDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase block">Expected ETA</label>
                    <input
                      id="late-eta-input"
                      type="text"
                      required
                      placeholder="e.g. 08:45 AM"
                      value={lateEta}
                      onChange={(e) => setLateEta(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block">Reason for Late Arrival</label>
                  <textarea
                    id="late-reason-input"
                    required
                    rows={3}
                    placeholder="e.g. School bus Route B is delayed in heavy morning commute traffic."
                    value={lateReason}
                    onChange={(e) => setLateReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
                  />
                </div>

                <AnimatePresence>
                  {lateSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="p-3 bg-emerald-50 border border-emerald-100 text-[11px] text-emerald-800 rounded-xl flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Late notification dispatched instantly to teacher registers!</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  id="submit-late-btn"
                  type="submit"
                  disabled={isSubmittingLate || !lateReason.trim()}
                  className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 flex justify-center items-center gap-1.5 cursor-pointer shadow-3xs"
                >
                  {isSubmittingLate ? (
                    <>
                      <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Notifying teacher...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4" />
                      Notify Teacher
                    </>
                  )}
                </button>
              </form>

              <div className="pt-3 border-t border-slate-200 flex gap-2 items-start text-[10px] text-slate-400 leading-snug">
                <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <span>Dispatched notes instantly pre-flag class registers with a "Parent-Notice Late" tag.</span>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
