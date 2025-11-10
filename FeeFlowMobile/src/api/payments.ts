import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { Payment, PaymentRequest, PaymentResponse, ApiResponse } from '../types';

export const paymentService = {
  // Create a new payment
  async createPayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await axios.post(API_ENDPOINTS.payments.create, paymentData);
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to create payment');
      }
      throw error;
    }
  },

  // Confirm a payment
  async confirmPayment(paymentId: string, reference: string): Promise<Payment> {
    try {
      const response = await axios.post(API_ENDPOINTS.payments.confirm, {
        paymentId,
        reference,
      });
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to confirm payment');
      }
      throw error;
    }
  },

  // Get payment history
  async getPaymentHistory(studentId?: string): Promise<Payment[]> {
    try {
      const response = await axios.get(API_ENDPOINTS.payments.history, {
        params: { studentId }
      });
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch payment history');
      }
      throw error;
    }
  },

  // Get payment by ID
  async getPaymentById(paymentId: string): Promise<Payment> {
    try {
      const response = await axios.get(`${API_ENDPOINTS.payments.history}/${paymentId}`);
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch payment');
      }
      throw error;
    }
  },

  // Check payment status
  async checkPaymentStatus(paymentId: string): Promise<{ status: string; details: any }> {
    try {
      const response = await axios.get(`${API_ENDPOINTS.payments.history}/${paymentId}/status`);
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to check payment status');
      }
      throw error;
    }
  },
};