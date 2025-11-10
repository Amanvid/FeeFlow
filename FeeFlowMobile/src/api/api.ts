import { invoiceService } from './invoices';
import { Invoice } from '../types';

interface FeeStatus {
  studentName: string;
  studentId: string;
  class: string;
  term: string;
  totalFees: number;
  paidAmount: number;
  balance: number;
  status: 'paid' | 'partial' | 'unpaid';
  lastPaymentDate?: string;
  dueDate: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Convert Invoice data to FeeStatus format
const convertInvoiceToFeeStatus = (invoice: Invoice): FeeStatus => {
  const totalAmount = invoice.amount;
  const paidAmount = invoice.status === 'paid' ? totalAmount : 0;
  const balance = totalAmount - paidAmount;
  
  let status: 'paid' | 'partial' | 'unpaid';
  if (invoice.status === 'paid') {
    status = 'paid';
  } else {
    status = 'unpaid';
  }

  return {
    studentName: invoice.studentName,
    studentId: invoice.studentId,
    class: 'Unknown', // Default value since not in Invoice interface
    term: 'Unknown', // Default value since not in Invoice interface
    totalFees: totalAmount,
    paidAmount,
    balance,
    status,
    dueDate: invoice.dueDate,
  };
};

export const apiService = {
  // Search fee status by student name or class
  async searchFeeStatus(studentName?: string, studentClass?: string): Promise<ApiResponse<FeeStatus[]>> {
    try {
      let invoices: Invoice[] = [];
      
      if (studentName && studentClass) {
        // Search by both name and class
        const allInvoices = await invoiceService.getAllInvoices();
        invoices = allInvoices.filter(invoice => 
          invoice.studentName.toLowerCase().includes(studentName.toLowerCase())
          // Note: Invoice interface doesn't have class property, so we skip class filtering
        );
      } else if (studentName) {
        // Search by name only
        const allInvoices = await invoiceService.getAllInvoices();
        invoices = allInvoices.filter(invoice => 
          invoice.studentName.toLowerCase().includes(studentName.toLowerCase())
        );
      } else {
        // Get all invoices
        invoices = await invoiceService.getAllInvoices();
      }
      
      const feeStatuses = invoices.map(convertInvoiceToFeeStatus);
      
      return {
        success: true,
        data: feeStatuses,
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error instanceof Error ? error.message : 'Failed to search fee status',
      };
    }
  },
  
  // Get fee status by student ID
  async getFeeStatusByStudentId(studentId: string): Promise<ApiResponse<FeeStatus[]>> {
    try {
      const invoices = await invoiceService.getStudentInvoices(studentId);
      const feeStatuses = invoices.map(convertInvoiceToFeeStatus);
      
      return {
        success: true,
        data: feeStatuses,
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error instanceof Error ? error.message : 'Failed to get fee status',
      };
    }
  },
};