import { google } from 'googleapis';

// Google Sheets service class for reading and writing data
export class GoogleSheetsService {
  private sheets: any;
  private spreadsheetId: string;
  private auth: any;

  constructor() {
    this.spreadsheetId = process.env.GOOGLE_SHEET_ID || process.env.NEXT_PUBLIC_SPREADSHEET_ID || '';

    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
      console.error("❌ Missing Google Sheets environment variables.");
      throw new Error("Missing Google Sheets API credentials.");
    }

    // ✅ FIXED: Properly format private key for both local and Vercel
    const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');

    this.auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    this.sheets = google.sheets({ version: 'v4', auth: this.auth });
  }

  /**
   * Append data to a specific sheet
   */
  async appendToSheet(sheetName: string, values: any[][]) {
    try {
      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A1`, // Start from first row
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: values,
        },
      });

      return {
        success: true,
        data: response.data,
        message: 'Data appended successfully',
      };
    } catch (error) {
      console.error('Error appending to sheet:', error);
      return {
        success: false,
        message: `Failed to append data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Update specific row(s) in a sheet
   */
  async updateSheet(sheetName: string, range: string, values: any[][]) {
    try {
      const response = await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!${range}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: values,
        },
      });

      return {
        success: true,
        data: response.data,
        message: 'Data updated successfully',
      };
    } catch (error) {
      console.error('Error updating sheet:', error);
      return {
        success: false,
        message: `Failed to update data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Get data from a specific sheet
   */
  async getSheetData(sheetName: string, range?: string) {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: range ? `${sheetName}!${range}` : `${sheetName}!A1:Z1000`, // Default range
      });

      return {
        success: true,
        data: response.data.values || [],
        message: 'Data retrieved successfully',
      };
    } catch (error) {
      console.error('Error getting sheet data:', error);
      return {
        success: false,
        message: `Failed to get data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        data: [],
      };
    }
  }

  /**
   * Find row by criteria and update it
   */
  async findAndUpdateRow(sheetName: string, searchColumn: number, searchValue: string, updateValues: any[]) {
    try {
      // First, get all data from the sheet
      const getResult = await this.getSheetData(sheetName);
      if (!getResult.success || !getResult.data || getResult.data.length === 0) {
        return {
          success: false,
          message: 'No data found in sheet',
        };
      }

      const rows = getResult.data;
      const headerRow = rows[0];
      
      // Find the row index (1-based for Sheets API)
      let rowIndex = -1;
      for (let i = 1; i < rows.length; i++) {
        if (rows[i][searchColumn] === searchValue) {
          rowIndex = i + 1; // +1 because Sheets is 1-indexed and we have header row
          break;
        }
      }

      if (rowIndex === -1) {
        return {
          success: false,
          message: `Row with ${searchValue} not found`,
        };
      }

      // Update the specific row
      const range = `${sheetName}!A${rowIndex}:${String.fromCharCode(65 + updateValues.length - 1)}${rowIndex}`;
      return await this.updateSheet(sheetName, range, [updateValues]);
    } catch (error) {
      console.error('Error finding and updating row:', error);
      return {
        success: false,
        message: `Failed to find and update row: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Save notification settings to Config sheet
   */
  async saveNotificationSettings(settings: {
    smsEnabled: boolean;
    feeRemindersEnabled: boolean;
    paymentNotificationsEnabled: boolean;
    admissionNotificationsEnabled: boolean;
  }) {
    try {
      // Get current config data
      const configResult = await this.getSheetData('Config');
      if (!configResult.success || configResult.data.length === 0) {
        return {
          success: false,
          message: 'Config sheet not found or empty',
        };
      }

      const configRow = configResult.data[1]; // Assuming second row has the config
      if (!configRow) {
        return {
          success: false,
          message: 'No config data found',
        };
      }

      // Update the notification settings in the config row
      // Assuming columns: School Name, Address, Momo number, Due Date, Invoice number, Sender ID, SMS Enabled, Fee Reminders Enabled, Payment Notifications Enabled, Admission Notifications Enabled
      const updatedRow = [
        configRow[0] || '', // School Name
        configRow[1] || '', // Address
        configRow[2] || '', // Momo number
        configRow[3] || '', // Due Date
        configRow[4] || '', // Invoice number
        configRow[5] || '', // Sender ID
        settings.smsEnabled ? 'true' : 'false',
        settings.feeRemindersEnabled ? 'true' : 'false',
        settings.paymentNotificationsEnabled ? 'true' : 'false',
        settings.admissionNotificationsEnabled ? 'true' : 'false',
      ];

      // Update the second row (index 2 in Sheets API)
      return await this.updateSheet('Config', 'A2:J2', [updatedRow]);
    } catch (error) {
      console.error('Error saving notification settings:', error);
      return {
        success: false,
        message: `Failed to save notification settings: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Save invoice/claim to Claims sheet
   */
  async saveInvoiceToSheet(claim: {
    invoiceNumber: string;
    guardianName: string;
    guardianPhone: string;
    relationship: string;
    studentName: string;
    class: string;
    totalFeesBalance: number;
    dueDate: string;
    timestamp: string;
  }) {
    try {
      // Prepare the row data
      const rowData = [
        claim.invoiceNumber,
        claim.guardianName,
        claim.guardianPhone,
        claim.relationship,
        claim.studentName,
        claim.class,
        claim.totalFeesBalance.toString(),
        claim.dueDate,
        new Date(claim.timestamp).toLocaleDateString('en-GB'),
        'false', // Paid status - default to false
        '', // Payment date - empty initially
        '', // Payment reference - empty initially
      ];

      return await this.appendToSheet('Claims', [rowData]);
    } catch (error) {
      console.error('Error saving invoice to sheet:', error);
      return {
        success: false,
        message: `Failed to save invoice: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Update invoice payment status in Claims sheet
   */
  async updateInvoicePaymentStatus(invoiceNumber: string, paymentData: {
    paid: boolean;
    paymentDate?: string;
    paymentReference?: string;
  }) {
    try {
      // Get current claims data
      const claimsResult = await this.getSheetData('Claims');
      if (!claimsResult.success || claimsResult.data.length === 0) {
        return {
          success: false,
          message: 'Claims sheet not found or empty',
        };
      }

      const rows = claimsResult.data;
      
      // Find the invoice row
      let rowIndex = -1;
      for (let i = 1; i < rows.length; i++) { // Start from 1 to skip header
        if (rows[i][0] === invoiceNumber) {
          rowIndex = i + 1; // +1 because Sheets is 1-indexed
          break;
        }
      }

      if (rowIndex === -1) {
        return {
          success: false,
          message: `Invoice ${invoiceNumber} not found`,
        };
      }

      // Update the payment columns (assuming columns 10, 11, 12 are Paid, Payment Date, Payment Reference)
      const paidStatus = paymentData.paid ? 'true' : 'false';
      const paymentDate = paymentData.paymentDate || '';
      const paymentReference = paymentData.paymentReference || '';

      // Get the current row data and update payment columns
      const currentRow = rows[rowIndex - 1]; // -1 because we need 0-indexed for the array
      const updatedRow = [...currentRow];
      updatedRow[9] = paidStatus; // Paid column
      updatedRow[10] = paymentDate; // Payment Date column
      updatedRow[11] = paymentReference; // Payment Reference column

      return await this.updateSheet('Claims', `A${rowIndex}:L${rowIndex}`, [updatedRow]);
    } catch (error) {
      console.error('Error updating invoice payment status:', error);
      return {
        success: false,
        message: `Failed to update payment status: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  async clearSheet(sheetName: string): Promise<{ success: boolean; message: string }> {
    try {
      const range = `${sheetName}!A:Z`; // Clear columns A to Z
      await this.sheets.spreadsheets.values.clear({
        spreadsheetId: this.spreadsheetId,
        range: range,
      });
      return { success: true, message: 'Sheet cleared successfully' };
    } catch (error) {
      console.error('Error clearing sheet:', error);
      return { success: false, message: `Error clearing sheet: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }
}


// Export a singleton instance
export const googleSheetsService = new GoogleSheetsService();