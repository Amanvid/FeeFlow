// Store verification codes temporarily (in production, use Redis or database)
const verificationCodes = new Map<string, {
  code: string;
  invoiceId: string;
  amount: number;
  studentName: string;
  expiresAt: Date;
}>();

// Helper function to clean up expired codes
function cleanupExpiredCodes() {
  const now = new Date();
  for (const [invoiceId, codeData] of verificationCodes.entries()) {
    if (codeData.expiresAt < now) {
      verificationCodes.delete(invoiceId);
    }
  }
}

// Helper function to get verification code (used by verify-code endpoint)
export function getVerificationCode(invoiceId: string): {
  code: string;
  invoiceId: string;
  amount: number;
  studentName: string;
  expiresAt: Date;
} | null {
  cleanupExpiredCodes();
  return verificationCodes.get(invoiceId) || null;
}

// Helper function to store verification code
export function storeVerificationCode(invoiceId: string, codeData: {
  code: string;
  invoiceId: string;
  amount: number;
  studentName: string;
  expiresAt: Date;
}): void {
  verificationCodes.set(invoiceId, codeData);
  cleanupExpiredCodes();
}