export interface Student {
  id: string;
  name: string;
  grade: string;
  schoolName: string;
  studentId: string;
  photoUrl: string;
  cardStatus: 'active' | 'frozen';
  balance: number;
  dailyLimit: number;
  lowBalanceAlert: boolean;
  allergies: string[];
  foodRestrictions: string[]; // item-level or category-level restrictions
  busRoute: string;
  busStatus: 'On Board' | 'At School' | 'At Home' | 'Not Registered';
  autoTopUpEnabled: boolean;
  autoTopUpThreshold: number;
  autoTopUpAmount: number;
  weeklyBudgetEnabled?: boolean;
  weeklyBudgetGoal?: number;
  recurringTransferEnabled?: boolean;
  recurringTransferAmount?: number;
  recurringTransferFrequency?: 'weekly' | 'biweekly' | 'monthly';
  recurringTransferDay?: string;
  recurringTransferChannel?: 'card' | 'ecocash' | 'onemoney' | 'telecash' | 'innbucks' | 'zipit';
  recurringTransferPhoneOrAccount?: string;
}

export interface TransactionItem {
  name: string;
  price: number;
  quantity: number;
}

export interface Transaction {
  id: string;
  studentId: string;
  date: string; // ISO format or human-readable
  category: 'cafeteria' | 'transport' | 'materials' | 'sports' | 'activities' | 'topup';
  merchant: string;
  amount: number;
  type: 'debit' | 'credit';
  status: 'completed' | 'declined' | 'pending';
  items?: TransactionItem[];
}

export interface SchoolFee {
  id: string;
  studentId: string;
  title: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'unpaid';
  category: 'tuition' | 'transport' | 'trip' | 'supplies';
  balanceLeft?: number;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string; // e.g., "2026-05-31"
  status: 'present' | 'absent' | 'late' | 'excused';
  checkInTime?: string; // e.g., "07:55 AM"
  checkOutTime?: string; // e.g., "03:25 PM"
  method: 'card_tap' | 'manual' | 'bus_scanner';
  location: string; // e.g., "Main Entrance Gate A", "Bus Route B Terminal"
  subject?: string; // e.g., "Mathematics Period 1", "English Literature"
}

export interface CafeteriaItem {
  id: string;
  name: string;
  category: 'beverage' | 'snack' | 'meal' | 'dessert';
  price: number;
  allergens: string[];
  restricted: boolean;
}
