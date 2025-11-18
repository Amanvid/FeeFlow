import { GoogleSheetsService } from './google-sheets';

interface VerificationCodeData {
  code: string;
  invoiceId: string;
  amount: number;
  studentName: string;
  expiresAt: Date;
}

// Helper function to ensure VerifCodes sheet exists
async function ensureVerifCodesSheet(): Promise<boolean> {
  try {
    const googleSheetsService = new GoogleSheetsService();
    const createResult = await googleSheetsService.createSheet('VerifCodes');
    
    if (!createResult.success) {
      console.error('Failed to create VerifCodes sheet:', createResult.message);
      return false;
    }
    
    // If sheet was just created, add headers
    if (createResult.message?.includes('created')) {
      const headers = [['Code', 'InvoiceId', 'Amount', 'StudentName', 'ExpiresAt']];
      await googleSheetsService.appendToSheet('VerifCodes', headers);
    }
    
    return true;
  } catch (error) {
    console.error('Error ensuring VerifCodes sheet exists:', error);
    return false;
  }
}

// Helper function to clean up expired codes from Google Sheets
async function cleanupExpiredCodes(): Promise<void> {
  try {
    // Ensure sheet exists first
    await ensureVerifCodesSheet();
    
    const googleSheetsService = new GoogleSheetsService();
    const result = await googleSheetsService.getSheetData('VerifCodes');
    
    if (!result.success || !result.data || result.data.length <= 1) {
      return;
    }

    const now = new Date();
    const rows = result.data;
    const expiredRowIndices: number[] = [];

    // Find expired codes (skip header row)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row[4]) { // ExpiresAt column
        const expiresAt = new Date(row[4]);
        if (expiresAt < now) {
          expiredRowIndices.push(i + 1); // Store 1-based row index
        }
      }
    }

    // Delete expired rows in reverse order to maintain correct indices
    expiredRowIndices.sort((a, b) => b - a);
    
    for (const rowIndex of expiredRowIndices) {
      await googleSheetsService.clearRowInSheet('VerifCodes', rowIndex);
    }

    if (expiredRowIndices.length > 0) {
      console.log(`Cleaned up ${expiredRowIndices.length} expired verification codes`);
    }
  } catch (error) {
    console.error('Error cleaning up expired verification codes:', error);
  }
}

// Helper function to get verification code (used by verify-code endpoint)
export async function getVerificationCode(invoiceId: string): Promise<VerificationCodeData | null> {
  try {
    // Ensure sheet exists first
    await ensureVerifCodesSheet();
    
    // Clean up expired codes first
    await cleanupExpiredCodes();
    
    const googleSheetsService = new GoogleSheetsService();
    const result = await googleSheetsService.getSheetData('VerifCodes');
    
    if (!result.success || !result.data || result.data.length <= 1) {
      return null;
    }

    const rows = result.data;
    
    // Find the verification code for the given invoiceId (skip header row)
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row[1] === invoiceId) { // InvoiceId column
        return {
          code: row[0] || '',
          invoiceId: row[1] || '',
          amount: parseFloat(row[2]) || 0,
          studentName: row[3] || '',
          expiresAt: new Date(row[4] || new Date().toISOString())
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error getting verification code from Google Sheets:', error);
    return null;
  }
}

// Helper function to store verification code
export async function storeVerificationCode(invoiceId: string, codeData: VerificationCodeData): Promise<void> {
  try {
    const googleSheetsService = new GoogleSheetsService();
    
    // Ensure sheet exists first
    await ensureVerifCodesSheet();
    
    // Clean up expired codes first
    await cleanupExpiredCodes();
    
    // Check if code already exists for this invoiceId
    const existingCode = await getVerificationCode(invoiceId);
    if (existingCode) {
      // Update existing code by finding and updating the row
      const result = await googleSheetsService.getSheetData('VerifCodes');
      if (result.success && result.data && result.data.length > 1) {
        const rows = result.data;
        
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (row[1] === invoiceId) { // InvoiceId column
            // Update the existing row
            const updatedRow = [
              codeData.code,
              codeData.invoiceId,
              codeData.amount.toString(),
              codeData.studentName,
              codeData.expiresAt.toISOString()
            ];
            
            await googleSheetsService.updateRowInSheet('VerifCodes', i + 1, updatedRow);
            return;
          }
        }
      }
    }
    
    // Add new verification code
    const newRow = [
      codeData.code,
      codeData.invoiceId,
      codeData.amount.toString(),
      codeData.studentName,
      codeData.expiresAt.toISOString()
    ];
    
    const result = await googleSheetsService.appendToSheet('VerifCodes', [newRow]);
    
    if (!result.success) {
      console.error('Failed to store verification code in Google Sheets:', result.message);
    }
  } catch (error) {
    console.error('Error storing verification code in Google Sheets:', error);
  }
}