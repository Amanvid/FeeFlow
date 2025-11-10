// API Configuration for FeeFlow Mobile App
export const API_BASE_URL = "https://fee-flow-five.vercel.app/api";
// export const API_BASE_URL = "http://localhost:9002/api"; // Local development

// API Endpoints
export const API_ENDPOINTS = {
  auth: {
    sendOtp: `${API_BASE_URL}/auth/send-otp`,
    verifyOtp: `${API_BASE_URL}/auth/verify-otp`,
    logout: `${API_BASE_URL}/auth/logout`,
    mobileLogin: `${API_BASE_URL}/auth/mobile/login`,
    mobileRegister: `${API_BASE_URL}/auth/mobile/register`,
  },
  invoices: {
    getAll: `${API_BASE_URL}/invoices`,
    getById: (id: string) => `${API_BASE_URL}/invoices/${id}`,
    create: `${API_BASE_URL}/create-invoice`,
    status: `${API_BASE_URL}/invoice-status`,
  },
  students: {
    getAll: `${API_BASE_URL}/students`,
    getById: (id: string) => `${API_BASE_URL}/students/${id}`,
    checkFees: `${API_BASE_URL}/check-fees`,
  },
  payments: {
    create: `${API_BASE_URL}/create-payment`,
    confirm: `${API_BASE_URL}/confirm-payment`,
    history: `${API_BASE_URL}/payment-history`,
  },
  dashboard: {
    stats: `${API_BASE_URL}/dashboard-stats`,
    summary: `${API_BASE_URL}/dashboard-summary`,
  },
} as const;