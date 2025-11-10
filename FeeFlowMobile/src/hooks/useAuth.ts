import React, { useState, useEffect, createContext, useContext } from 'react';
import { authService } from '../api/auth';
import { User, MobileUser } from '../types';

interface AuthContextType {
  user: User | MobileUser | null;
  loading: boolean;
  login: (username: string, password: string, isAdmin?: boolean) => Promise<boolean>;
  mobileLogin: (username: string, password: string) => Promise<boolean>;
  mobileRegister: (userData: any) => Promise<any>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User | MobileUser>) => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | MobileUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await authService.getToken();
      const userData = await authService.getUser();
      
      if (token && userData) {
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string, isAdmin = true) => {
    try {
      // For admin login, we need to use the OTP flow
      // This is a simplified version - in real app, you'd collect phone and OTP
      const response = await authService.verifyOtp('', '', username);
      if (response.user) {
        setUser(response.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const mobileLogin = async (username: string, password: string) => {
    try {
      const response = await authService.mobileLogin(username, password);
      if (response.user) {
        setUser(response.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Mobile login failed:', error);
      return false;
    }
  };

  const mobileRegister = async (userData: any) => {
    try {
      const response = await authService.mobileRegister(userData);
      return response;
    } catch (error) {
      console.error('Mobile registration failed:', error);
      return { success: false, message: 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const updateUser = async (updates: Partial<User | MobileUser>) => {
    try {
      if (user) {
        // Create a new object that satisfies the type constraints
        const updatedUser = { ...user } as User | MobileUser;
        
        // Apply updates one by one to ensure type safety
        Object.keys(updates).forEach(key => {
          (updatedUser as any)[key] = (updates as any)[key];
        });
        
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('User update failed:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    mobileLogin,
    mobileRegister,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };

  return React.createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}