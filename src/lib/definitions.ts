
// Existing interfaces...

// Student Interface
export interface Student {
  id: string;
  studentName: string;
  class: string;
  gender: string;
  studentType: string;
  guardianName: string;
  guardianPhone: string;
  fees: number;
  books: number;
  arrears: number;
  schoolFeesPaid: number;
  booksFeePaid: number;
  balance: number;
  amountPaid: number;
}

export interface PhoneClaim {
  invoiceNumber: string;
  guardianName: string;
  guardianPhone: string;
  relationship: string;
  studentName: string;
  class: string;
  totalFeesBalance: number;
  dueDate: string;
  timestamp: string;
  paid?: boolean;
}

export interface TeacherUserWithPassword {
  username: string;
  password?: string;
  role: string;
  name?: string;
  class?: string;
  status?: 'active' | 'inactive';
  contact?: string;
  location?: string;
  employmentDate?: string;
  dateStopped?: string;
  adminPrivileges?: 'Yes' | 'No';
}

export interface AdminUserWithPassword {
  username: string;
  password?: string;
  role: string;
}


// School Configuration Interface
export interface SchoolConfig {
  schoolName: string;
  address?: string;
  logoUrl?: string;
  momoNumber: string;
  dueDate: string;
  invoicePrefix: string;
  senderId: string;
  notifications: {
    smsEnabled: boolean;
    feeRemindersEnabled: boolean;
    paymentNotificationsEnabled: boolean;
    admissionNotificationsEnabled: boolean;
  };
}

// SBA (School-Based Assessment) Interface
export interface SBARecord {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  subject: string;
  term: string;
  academicYear: string;
  assessmentType: 'classwork' | 'homework' | 'project' | 'test' | 'exam';
  score: number;
  totalMarks: number;
  percentage: number;
  grade: string;
  remarks?: string;
  date: string;
  teacherId: string;
  teacherName: string;
  createdAt: string;
  updatedAt: string;
}

export interface SBASummary {
  studentId: string;
  studentName: string;
  className: string;
  subject: string;
  term: string;
  academicYear: string;
  totalAssessments: number;
  averageScore: number;
  finalGrade: string;
  teacherId: string;
  teacherName: string;
}

export interface InvoiceGenerationClaim {
  invoiceNumber: string;
}

// User-related interfaces
export interface AdminUser {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  status: 'active' | 'inactive';
}

export interface TeacherUser {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  class: string;
  status: 'active' | 'inactive';
  contact?: string;
  location?: string;
  subjects?: string[];
  employmentDate?: string;
  dateStopped?: string;
  adminPrivileges?: 'Yes' | 'No';
}

export interface NonTeacherUser {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  status: 'active' | 'inactive';
  contact?: string;
  location?: string;
  dateCreated?: string;
  dateUpdated?: string;
}
