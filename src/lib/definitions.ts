
export type Student = {
  id: string;
  studentName: string;
  class: string;
  studentType: string;
  fees: number;
  arrears: number;
  amountPaid: number; // Total amount paid (school fees + books fee)
  schoolFeesPaid: number; // Only 'INITIAL AMOUNT PAID' + 'PAYMENT'
  booksFeePaid: number; // Only 'BOOKS Fees Payment'
  balance: number;
  books: number;
  gender: 'Male' | 'Female' | 'Other';
  guardianName?: string;
  guardianPhone?: string;
};

export type SchoolConfig = {
  schoolName: string;
  address: string;
  momoNumber: string;
  dueDate: string;
  invoicePrefix: string;
  senderId: string;
  logoUrl: string;
  notifications?: {
    smsEnabled: boolean;
    feeRemindersEnabled: boolean;
    paymentNotificationsEnabled: boolean;
    admissionNotificationsEnabled: boolean;
  };
};

export type PhoneClaim = {
  guardianName: string;
  guardianPhone: string;
  relationship: string;
  studentName: string;
  class: string;
  totalFeesBalance: number;
  dueDate: string;
  invoiceNumber: string;
  timestamp: string;
};

// Kept for invoice generation logic, but not for saving.
export type InvoiceGenerationClaim = {
  invoiceNumber: string;
};

export type AdminUser = {
  username: string;
  password?: string;
  role: string;
}

export type MobileUser = {
  id: string;
  name: string;
  dateOfBirth: string;
  address: string;
  residence: string;
  childName: string;
  childClass: string;
  registrationDate: string;
  contact: string;
  email: string;
  username: string;
  password: string;
  profilePicture?: string;
  childPicture?: string;
  role: 'parent' | 'guardian';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type MobileUserLogin = {
  username: string; // Can be name, phone, or email
  password: string;
}
