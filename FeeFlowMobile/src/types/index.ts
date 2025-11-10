// Type definitions for FeeFlow Mobile App

export interface User {
  id: string;
  phone: string;
  name?: string;
  role: 'student' | 'parent' | 'admin' | 'mobile_user';
  studentId?: string;
  isAuthenticated: boolean;
}

export interface MobileUser {
  id: string;
  name: string;
  dateOfBirth?: string;
  address?: string;
  residence?: string;
  childName: string;
  childClass: string;
  registrationDate: string;
  contact: string;
  email?: string;
  username: string;
  password?: string;
  profilePicture?: string;
  childPicture?: string;
  role: 'parent' | 'guardian';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: string;
  name: string;
  grade: string;
  studentType: 'Day Student' | 'Boarding';
  guardianName: string;
  guardianPhone: string;
  balance: number;
  totalPaid: number;
  status: 'Active' | 'Inactive';
}

export interface Invoice {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  description: string;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  items: InvoiceItem[];
  createdAt: string;
  paidAt?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  amount: number;
  quantity: number;
  total: number;
}

export interface Payment {
  id: string;
  invoiceId: string;
  studentId: string;
  amount: number;
  method: 'momo' | 'card' | 'cash';
  status: 'pending' | 'completed' | 'failed';
  reference: string;
  createdAt: string;
  completedAt?: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalRevenue: number;
  outstandingBalance: number;
  paymentRate: number;
  recentInvoices: Invoice[];
  overdueInvoices: Invoice[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface AuthResponse {
  success?: boolean;
  message?: string;
  token: string;
  user: User;
}

export interface LoginCredentials {
  phone: string;
  otp?: string;
}

export interface PaymentRequest {
  studentId: string;
  amount: number;
  method: 'momo' | 'card';
  phoneNumber?: string;
}

export interface PaymentResponse {
  success: boolean;
  paymentId: string;
  reference: string;
  status: string;
  message?: string;
}