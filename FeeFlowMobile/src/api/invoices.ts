import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { Invoice, ApiResponse, DashboardStats } from '../types';

export const invoiceService = {
  // Get all invoices
  async getAllInvoices(): Promise<Invoice[]> {
    try {
      const response = await axios.get(API_ENDPOINTS.invoices.getAll);
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch invoices');
      }
      throw error;
    }
  },

  // Get invoice by ID
  async getInvoiceById(id: string): Promise<Invoice> {
    try {
      const response = await axios.get(API_ENDPOINTS.invoices.getById(id));
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch invoice');
      }
      throw error;
    }
  },

  // Get invoices for specific student
  async getStudentInvoices(studentId: string): Promise<Invoice[]> {
    try {
      const response = await axios.get(API_ENDPOINTS.invoices.getAll, {
        params: { studentId }
      });
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch student invoices');
      }
      throw error;
    }
  },

  // Create new invoice
  async createInvoice(invoiceData: Partial<Invoice>): Promise<Invoice> {
    try {
      const response = await axios.post(API_ENDPOINTS.invoices.create, invoiceData);
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to create invoice');
      }
      throw error;
    }
  },

  // Get invoice status
  async getInvoiceStatus(invoiceId: string): Promise<{ status: string; details: any }> {
    try {
      const response = await axios.get(API_ENDPOINTS.invoices.status, {
        params: { invoiceId }
      });
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to get invoice status');
      }
      throw error;
    }
  },

  // Get dashboard statistics
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await axios.get(API_ENDPOINTS.dashboard.stats);
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch dashboard stats');
      }
      throw error;
    }
  },

  // Get overdue invoices
  async getOverdueInvoices(): Promise<Invoice[]> {
    try {
      const response = await axios.get(API_ENDPOINTS.invoices.getAll, {
        params: { status: 'overdue' }
      });
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch overdue invoices');
      }
      throw error;
    }
  },

  // Get recent invoices
  async getRecentInvoices(limit: number = 10): Promise<Invoice[]> {
    try {
      const response = await axios.get(API_ENDPOINTS.invoices.getAll, {
        params: { limit, sort: 'createdAt:desc' }
      });
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch recent invoices');
      }
      throw error;
    }
  },
};