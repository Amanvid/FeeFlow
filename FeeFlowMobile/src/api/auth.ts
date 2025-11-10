import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { AuthResponse, ApiResponse, LoginCredentials, MobileUser } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_KEY = 'feeflow_auth_token';
const USER_DATA_KEY = 'feeflow_user_data';

export const authService = {
  // Send OTP to phone number (Admin login)
  async sendOtp(phone: string): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await axios.post(API_ENDPOINTS.auth.sendOtp, { phone });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to send OTP');
      }
      throw error;
    }
  },

  // Verify OTP and login (Admin login)
  async verifyOtp(username: string, phone: string, otp: string): Promise<AuthResponse> {
    try {
      const response = await axios.post(API_ENDPOINTS.auth.verifyOtp, { phone, otp, username });
      const responseData = response.data;
      
      // Check if the response indicates success
      if (responseData.success && responseData.user) {
        // Generate a simple token from user data since API doesn't return JWT
        const token = `${responseData.user.username}_${Date.now()}`;
        const user = responseData.user;
        
        // Store token and user data
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
        
        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        return { token, user };
      } else {
        throw new Error(responseData.message || 'Login failed');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Invalid OTP');
      }
      throw error;
    }
  },

  // Mobile user login
  async mobileLogin(username: string, password: string): Promise<AuthResponse> {
    try {
      const response = await axios.post(API_ENDPOINTS.auth.mobileLogin, { username, password });
      const responseData = response.data;
      
      if (responseData.success && responseData.user) {
        const token = responseData.token;
        const user = responseData.user;
        
        // Store token and user data
        await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
        await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
        
        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        return { token, user };
      } else {
        throw new Error(responseData.error || 'Login failed');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.error || 'Invalid credentials');
      }
      throw error;
    }
  },

  // Mobile user registration
  async mobileRegister(userData: Omit<MobileUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<{ user: MobileUser }>> {
    try {
      const response = await axios.post(API_ENDPOINTS.auth.mobileRegister, userData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.error || 'Registration failed');
      }
      throw error;
    }
  },

  // Get stored auth token
  async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
  },

  // Get stored user data
  async getUser(): Promise<any | null> {
    const userData = await AsyncStorage.getItem(USER_DATA_KEY);
    return userData ? JSON.parse(userData) : null;
  },

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return !!token;
  },

  // Logout and clear stored data
  async logout(): Promise<void> {
    await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    await AsyncStorage.removeItem(USER_DATA_KEY);
  },

  // Set auth header for API calls
  async setAuthHeader(): Promise<void> {
    const token = await this.getToken();
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  },

  // Clear auth header
  clearAuthHeader(): void {
    delete axios.defaults.headers.common['Authorization'];
  },
};