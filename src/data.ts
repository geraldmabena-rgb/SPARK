import { Student, Transaction, SchoolFee, CafeteriaItem, AttendanceRecord } from './types';

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'liam',
    name: 'Liam Chen',
    grade: 'Grade 6 (Middle School)',
    schoolName: 'Abbeys High (Middle Campus)',
    studentId: 'MS-8841-LM',
    photoUrl: 'https://images.unsplash.com/photo-1607990283143-e81e7a2c93ab?auto=format&fit=crop&q=80&w=300&h=300',
    cardStatus: 'active',
    balance: 24.50,
    dailyLimit: 15.00,
    lowBalanceAlert: true,
    allergies: ['Peanuts', 'Dairy'],
    foodRestrictions: ['Soda', 'Chocolate Muffin', 'French Fries'],
    busRoute: 'Route B - Bus 14',
    busStatus: 'At School',
    autoTopUpEnabled: true,
    autoTopUpThreshold: 10.00,
    autoTopUpAmount: 20.00
  },
  {
    id: 'emma',
    name: 'Emma Chen',
    grade: 'Grade 10 (High School)',
    schoolName: 'Abbeys High School',
    studentId: 'HS-1204-EM',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300&h=300',
    cardStatus: 'active',
    balance: 62.10,
    dailyLimit: 25.00,
    lowBalanceAlert: false,
    allergies: ['Sesame'],
    foodRestrictions: [],
    busRoute: 'Route G - Express Bus 3',
    busStatus: 'At Home',
    autoTopUpEnabled: false,
    autoTopUpThreshold: 15.00,
    autoTopUpAmount: 30.00
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  // Liam's Transactions
  {
    id: 't-liam-1',
    studentId: 'liam',
    date: '2026-05-31T12:15:00Z',
    category: 'cafeteria',
    merchant: 'Abbeys High (Middle Campus) Cafeteria',
    amount: 5.50,
    type: 'debit',
    status: 'completed',
    items: [
      { name: 'Grilled Chicken Wrap', price: 4.50, quantity: 1 },
      { name: 'Apple Slices', price: 1.00, quantity: 1 }
    ]
  },
  {
    id: 't-liam-2',
    studentId: 'liam',
    date: '2026-05-31T08:02:00Z',
    category: 'transport',
    merchant: 'Abbeys High Bus Tap-In',
    amount: 1.20,
    type: 'debit',
    status: 'completed'
  },
  {
    id: 't-liam-3',
    studentId: 'liam',
    date: '2026-05-30T15:30:00Z',
    category: 'materials',
    merchant: 'School Library Store',
    amount: 8.90,
    type: 'debit',
    status: 'completed',
    items: [
      { name: 'Sketchbook A4', price: 5.40, quantity: 1 },
      { name: 'HB Pencil Pack of 3', price: 3.50, quantity: 1 }
    ]
  },
  {
    id: 't-liam-4',
    studentId: 'liam',
    date: '2026-05-30T12:10:00Z',
    category: 'cafeteria',
    merchant: 'Abbeys High (Middle Campus) Cafeteria',
    amount: 6.00,
    type: 'debit',
    status: 'completed',
    items: [
      { name: 'Pasta Primavera', price: 5.00, quantity: 1 },
      { name: 'Carton of Milk', price: 1.00, quantity: 1 }
    ]
  },
  {
    id: 't-liam-5',
    studentId: 'liam',
    date: '2026-05-30T08:04:00Z',
    category: 'transport',
    merchant: 'Abbeys High Bus Tap-In',
    amount: 1.20,
    type: 'debit',
    status: 'completed'
  },
  {
    id: 't-liam-6',
    studentId: 'liam',
    date: '2026-05-29T16:00:00Z',
    category: 'topup',
    merchant: 'Parent Wallet Top-Up',
    amount: 25.00,
    type: 'credit',
    status: 'completed'
  },
  {
    id: 't-liam-7',
    studentId: 'liam',
    date: '2026-05-28T12:05:00Z',
    category: 'cafeteria',
    merchant: 'Abbeys High (Middle Campus) Cafeteria',
    amount: 3.50,
    type: 'debit',
    status: 'declined', // Spent too much/exceeded item limit
    items: [
      { name: 'Double Chocolate Fudge Cookie', price: 2.50, quantity: 1 },
      { name: 'Cherry Soda Can', price: 1.00, quantity: 1 }
    ]
  },

  // Emma's Transactions
  {
    id: 't-emma-1',
    studentId: 'emma',
    date: '2026-05-31T13:40:00Z',
    category: 'sports',
    merchant: 'HS Athletics Department',
    amount: 12.00,
    type: 'debit',
    status: 'completed',
    items: [
      { name: 'Abbeys High Soccer Socks', price: 12.00, quantity: 1 }
    ]
  },
  {
    id: 't-emma-2',
    studentId: 'emma',
    date: '2026-05-31T12:30:00Z',
    category: 'cafeteria',
    merchant: 'Abbeys High Cafeteria',
    amount: 7.20,
    type: 'debit',
    status: 'completed',
    items: [
      { name: 'Turkey & Swiss Sandwich', price: 5.50, quantity: 1 },
      { name: 'San Pellegrino Lemon', price: 1.70, quantity: 1 }
    ]
  },
  {
    id: 't-emma-3',
    studentId: 'emma',
    date: '2026-05-30T12:20:00Z',
    category: 'cafeteria',
    merchant: 'Abbeys High Cafeteria',
    amount: 8.50,
    type: 'debit',
    status: 'completed',
    items: [
      { name: 'Vegan Caesar Salad Bowl', price: 6.50, quantity: 1 },
      { name: 'Kettle Chips Sea Salt', price: 2.00, quantity: 1 }
    ]
  },
  {
    id: 't-emma-4',
    studentId: 'emma',
    date: '2026-05-28T09:15:00Z',
    category: 'materials',
    merchant: 'HS Admin Desk',
    amount: 15.00,
    type: 'debit',
    status: 'completed',
    items: [
      { name: 'Biology Lab Workbook Tier 1', price: 15.00, quantity: 1 }
    ]
  },
  {
    id: 't-emma-5',
    studentId: 'emma',
    date: '2026-05-27T17:00:00Z',
    category: 'topup',
    merchant: 'Parent Wallet Top-Up',
    amount: 50.00,
    type: 'credit',
    status: 'completed'
  }
];

export const SCHOOL_FEES: SchoolFee[] = [
  {
    id: 'fee-liam-1',
    studentId: 'liam',
    title: 'Grade 6 Science Field Trip to Planetarium',
    description: 'Includes return transport, admissions, and lunch bag at the National Planetarium Space Dome.',
    amount: 35.00,
    dueDate: '2026-06-15',
    status: 'unpaid',
    category: 'trip',
    balanceLeft: 35.00
  },
  {
    id: 'fee-liam-2',
    studentId: 'liam',
    title: 'Middle School Lab Equipment Support Fee',
    description: 'Term contribution for consumable supplies, safety goggles, and microscope usage.',
    amount: 15.00,
    dueDate: '2026-06-20',
    status: 'unpaid',
    category: 'supplies',
    balanceLeft: 15.00
  },
  {
    id: 'fee-emma-1',
    studentId: 'emma',
    title: 'High School Autumn Term Athletics Insurance',
    description: 'Compulsory injury and facility insurance for students participating in competitive varsity leagues.',
    amount: 45.00,
    dueDate: '2026-06-19',
    status: 'unpaid',
    category: 'tuition',
    balanceLeft: 15.00 // Out of $45.00, partial balance remaining!
  },
  {
    id: 'fee-emma-2',
    studentId: 'emma',
    title: 'Annual Year Book Pre-Order 2026',
    description: 'High school graduation bumper year book containing color prints, major achievements, and photo galleries.',
    amount: 25.00,
    dueDate: '2026-05-25',
    status: 'paid',
    category: 'supplies',
    balanceLeft: 0
  },
  {
    id: 'fee-emma-3',
    studentId: 'emma',
    title: 'AP Calculus AB Exam Registrations',
    description: 'College Board examination fees and study assessment vouchers.',
    amount: 95.00,
    dueDate: '2026-06-25',
    status: 'unpaid',
    category: 'tuition',
    balanceLeft: 95.00
  }
];

export const CAFETERIA_MENU: CafeteriaItem[] = [
  // Beverages
  { id: 'm-1', name: 'Soda Can (Cola/Orange)', category: 'beverage', price: 1.80, allergens: [], restricted: false },
  { id: 'm-2', name: 'Fresh Orange Juice', category: 'beverage', price: 2.20, allergens: [], restricted: false },
  { id: 'm-3', name: 'Organic Whole Milk Carton', category: 'beverage', price: 1.20, allergens: ['Dairy'], restricted: false },
  { id: 'm-4', name: 'Chilled Spring Water Bottle', category: 'beverage', price: 1.00, allergens: [], restricted: false },
  
  // Meals
  { id: 'm-5', name: 'Whole Wheat Turkey Wrap', category: 'meal', price: 4.80, allergens: ['Gluten'], restricted: false },
  { id: 'm-6', name: 'Peanut Butter & Honey Toast', category: 'meal', price: 3.00, allergens: ['Peanuts', 'Gluten'], restricted: false },
  { id: 'm-7', name: 'Vegan Caesar Salad Bowl', category: 'meal', price: 5.50, allergens: ['Sesame'], restricted: false },
  { id: 'm-8', name: 'Warm Pasta Bowl with Pomodoro', category: 'meal', price: 4.50, allergens: ['Dairy', 'Gluten'], restricted: false },
  { id: 'm-9', name: 'Hot Chili Beef Taco Box', category: 'meal', price: 5.20, allergens: [], restricted: false },

  // Snacks & Desserts
  { id: 'm-10', name: 'French Fries Basket', category: 'snack', price: 2.50, allergens: [], restricted: false },
  { id: 'm-11', name: 'Fruit Cup (Melon/Apple/Berry)', category: 'snack', price: 1.50, allergens: [], restricted: false },
  { id: 'm-12', name: 'Chocolate Fudge Muffin', category: 'dessert', price: 2.00, allergens: ['Dairy', 'Gluten'], restricted: false },
  { id: 'm-13', name: 'Salted Caramel Cookie', category: 'dessert', price: 1.50, allergens: ['Dairy', 'Eggs'], restricted: false }
];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  // Liam's Class Session Logs (Today's Schedule & Previous Days)
  {
    id: 'att-liam-class-1',
    studentId: 'liam',
    date: '2026-06-15',
    status: 'present',
    checkInTime: '08:15 AM',
    method: 'card_tap',
    location: 'West Wing Homeroom 4B Reader',
    subject: 'Homeroom Roll-Call'
  },
  {
    id: 'att-liam-class-2',
    studentId: 'liam',
    date: '2026-06-15',
    status: 'present',
    checkInTime: '09:12 AM',
    method: 'card_tap',
    location: 'Maths Block Room 204 RFID',
    subject: 'Grade 6 Mathematics'
  },
  {
    id: 'att-liam-class-3',
    studentId: 'liam',
    date: '2026-06-15',
    status: 'late',
    checkInTime: '10:45 AM',
    method: 'card_tap',
    location: 'Science Dome Lab Access Node',
    subject: 'Junior Physics Practical'
  },
  {
    id: 'att-liam-class-4',
    studentId: 'liam',
    date: '2026-06-15',
    status: 'present',
    checkInTime: '01:10 PM',
    method: 'card_tap',
    location: 'Central Gymnasium NFC Gate',
    subject: 'Physical Education & Athletics'
  },
  {
    id: 'att-liam-1',
    studentId: 'liam',
    date: '2026-05-31',
    status: 'present',
    checkInTime: '07:54 AM',
    checkOutTime: '03:15 PM',
    method: 'bus_scanner',
    location: 'Route B - Bus 14 Scan-In',
    subject: 'School Bus Morning Ingress'
  },
  {
    id: 'att-liam-2',
    studentId: 'liam',
    date: '2026-05-30',
    status: 'present',
    checkInTime: '08:02 AM',
    checkOutTime: '03:18 PM',
    method: 'card_tap',
    location: 'Abbeys High (Middle Campus) Main Gate A',
    subject: 'Main Assembly Entry'
  },
  {
    id: 'att-liam-3',
    studentId: 'liam',
    date: '2026-05-29',
    status: 'late',
    checkInTime: '08:24 AM',
    checkOutTime: '03:15 PM',
    method: 'card_tap',
    location: 'Abbeys High (Middle Campus) Reception Desk',
    subject: 'Homeroom Late Registry'
  },
  {
    id: 'att-liam-4',
    studentId: 'liam',
    date: '2026-05-28',
    status: 'present',
    checkInTime: '07:56 AM',
    checkOutTime: '03:20 PM',
    method: 'bus_scanner',
    location: 'Route B - Bus 14 Scan-In',
    subject: 'School Bus Morning Ingress'
  },
  {
    id: 'att-liam-5',
    studentId: 'liam',
    date: '2026-05-27',
    status: 'excused',
    method: 'manual',
    location: 'Parent Portal App Excusal (Dental Clinic Appointment)',
    subject: 'English literature & Reading'
  },

  // Emma's Class Session Logs
  {
    id: 'att-emma-class-1',
    studentId: 'emma',
    date: '2026-06-15',
    status: 'present',
    checkInTime: '08:05 AM',
    method: 'card_tap',
    location: 'High School Library Gate Reader',
    subject: 'Homeroom Study Hall'
  },
  {
    id: 'att-emma-class-2',
    studentId: 'emma',
    date: '2026-06-15',
    status: 'present',
    checkInTime: '09:05 AM',
    method: 'card_tap',
    location: 'Room 302 High Hall NFC Terminal',
    subject: 'Advanced AP Calculus AB'
  },
  {
    id: 'att-emma-class-3',
    studentId: 'emma',
    date: '2026-06-15',
    status: 'present',
    checkInTime: '11:15 AM',
    method: 'card_tap',
    location: 'Bio-chemistry Wing Lab A Terminal',
    subject: 'Honors Chemistry Grade 10'
  },
  {
    id: 'att-emma-1',
    studentId: 'emma',
    date: '2026-05-31',
    status: 'present',
    checkInTime: '07:44 AM',
    checkOutTime: '03:40 PM',
    method: 'card_tap',
    location: 'Abbeys High School Main Gate',
    subject: 'Main School Entrance Tap'
  },
  {
    id: 'att-emma-2',
    studentId: 'emma',
    date: '2026-05-30',
    status: 'present',
    checkInTime: '07:48 AM',
    checkOutTime: '03:45 PM',
    method: 'card_tap',
    location: 'Abbeys High School Main Gate',
    subject: 'Main School Entrance Tap'
  },
  {
    id: 'att-emma-3',
    studentId: 'emma',
    date: '2026-05-29',
    status: 'present',
    checkInTime: '07:42 AM',
    checkOutTime: '03:41 PM',
    method: 'card_tap',
    location: 'Abbeys High School Main Gate',
    subject: 'Main School Entrance Tap'
  },
  {
    id: 'att-emma-4',
    studentId: 'emma',
    date: '2026-05-28',
    status: 'present',
    checkInTime: '07:51 AM',
    checkOutTime: '03:38 PM',
    method: 'card_tap',
    location: 'Abbeys High School Main Gate',
    subject: 'Main School Entrance Tap'
  },
  {
    id: 'att-emma-5',
    studentId: 'emma',
    date: '2026-05-27',
    status: 'present',
    checkInTime: '07:46 AM',
    checkOutTime: '03:45 PM',
    method: 'card_tap',
    location: 'Abbeys High School Main Gate',
    subject: 'Main School Entrance Tap'
  }
];
