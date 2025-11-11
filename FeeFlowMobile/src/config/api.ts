// API Configuration for FeeFlow Mobile App
// Available deployments:
// Primary: https://fee-flow-five.vercel.app/api
// Alternative 1: https://fee-flow-git-main-ghub-it-centers-projects.vercel.app/api
// Alternative 2: https://fee-flow-k6097t0s0-ghub-it-centers-projects.vercel.app/api

export const DEPLOYMENT_URLS = {
  primary: "https://fee-flow-five.vercel.app/api",
  alternative1: "https://fee-flow-git-main-ghub-it-centers-projects.vercel.app/api",
  alternative2: "https://fee-flow-k6097t0s0-ghub-it-centers-projects.vercel.app/api",
  local: "http://localhost:9002/api",
} as const;

// Change this to switch between deployments
export const CURRENT_DEPLOYMENT: keyof typeof DEPLOYMENT_URLS = 'primary';

export const API_BASE_URL = DEPLOYMENT_URLS[CURRENT_DEPLOYMENT];

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

// Helper function to switch deployments
export const switchDeployment = (deployment: keyof typeof DEPLOYMENT_URLS) => {
  console.log(`Switching to deployment: ${deployment} - ${DEPLOYMENT_URLS[deployment]}`);
  // In a real app, you might want to restart or reload the app here
  return DEPLOYMENT_URLS[deployment];
};