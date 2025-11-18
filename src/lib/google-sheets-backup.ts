import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';

// Google Sheets service class for reading and writing data
export class GoogleSheetsService {
  private sheets: any;
  private spreadsheetId: string;
  private auth: any;

  private loadPrivateKey(): string {
    // Try to get from environment first
    let privateKey = process.env.GOOGLE_PRIVATE_KEY;
    
    // If the key is too short, it might be truncated by dotenv
    if (privateKey && privateKey.length < 100 && privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
      // Try to read from .env.local file directly
      try {
        const envPath = path.join(process.cwd(), '.env.local');
        if (fs.existsSync(envPath)) {
          const envContent = fs.readFileSync(envPath, 'utf8');
          const lines = envContent.split('\n');
          let reconstructedKey = '';
          let inPrivateKey = false;
          
          for (const line of lines) {
            if (line.startsWith('GOOGLE_PRIVATE_KEY=')) {
              reconstructedKey = line.replace('GOOGLE_PRIVATE_KEY=', '');
              inPrivateKey = true;
            } else if (inPrivateKey && line.trim() && !line.includes('=') && !line.startsWith('#')) {
              reconstructedKey += '\n' + line;
            } else if (inPrivateKey && (line.includes('=') || line.startsWith('#') || line.trim() === '')) {
              break;
            }
          }
          
          if (reconstructedKey.includes('-----END PRIVATE KEY-----')) {
            privateKey = reconstructedKey;
          }
        }
      } catch (error) {
        console.warn('Could not read .env.local file:', error);
      }
    }
    
    // Format the key properly - handle both \n and actual newlines
    if (privateKey) {
      // Replace escaped newlines with actual newlines
      privateKey = privateKey.replace(/\\n/g, '\n');
      
      // Ensure proper header/footer formatting
      if (privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
        privateKey = privateKey
          .replace(/-----BEGIN PRIVATE KEY-----\s*/, '-----BEGIN PRIVATE KEY-----\n')
          .replace(/\s*-----END PRIVATE KEY-----/, '\n-----END PRIVATE KEY-----\n')
          .trim();
      }
    }
    
    return privateKey || '';
  }

  constructor() {
    this.spreadsheetId = process.env.GOOGLE_SHEET_ID || process.env.NEXT_PUBLIC_SPREADSHEET_ID || '';

    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
      console.error("❌ Missing Google Sheets environment variables.");
      console.error("GOOGLE_SERVICE_ACCOUNT_EMAIL:", process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
      console.error("GOOGLE_PRIVATE_KEY exists:", !!process.env.GOOGLE_PRIVATE_KEY);
      console.error("GOOGLE_PRIVATE_KEY length:", process.env.GOOGLE_PRIVATE_KEY?.length);
      throw new Error("Missing Google Sheets API credentials.");
    }

    const privateKey = this.loadPrivateKey();
    if (!privateKey) {
      throw new Error("GOOGLE_PRIVATE_KEY is missing or empty");
    }
    
    console.log("✅ Private key loaded successfully, length:", privateKey.length);

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
        range: sheetName, // Just the sheet name for append operations
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
      // First, check if the sheet has headers and get existing data
      const claimsResult = await this.getSheetData('Claims');
      let rows: any[][] = [];
      let shouldAddHeaders = false;

      if (!claimsResult.success || claimsResult.data.length === 0) {
        // Sheet is empty or doesn't exist, we need to add headers
        shouldAddHeaders = true;
      } else {
        rows = claimsResult.data;
        // Check if first row contains headers
        const firstRow = rows[0] || [];
        const expectedHeaders = ['Invoice Number', 'Guardian Name', 'Guardian Phone', 'Relationship', 'Student Name', 'Class', 'Total Fees Balance', 'Due Date', 'Timestamp', 'Paid', 'Payment Date', 'Payment Reference'];
        const hasHeaders = firstRow.length >= expectedHeaders.length && 
          expectedHeaders.every((header, index) => 
            firstRow[index] && firstRow[index].toString().toLowerCase().includes(header.toLowerCase().replace(' ', ''))
          );
        
        if (!hasHeaders) {
          shouldAddHeaders = true;
        }
      }

      // Check if invoice already exists
      let existingRowIndex = -1;
      const startIndex = shouldAddHeaders ? 0 : 1; // Start from 0 if adding headers, 1 if headers exist
      for (let i = startIndex; i < rows.length; i++) {
        const row = rows[i];
        if (row[0] === claim.invoiceNumber) {
          existingRowIndex = i;
          break;
        }
      }

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
        'FALSE', // Paid status - default to false (uppercase for Google Sheets)
        '', // Payment date - empty initially
        '', // Payment reference - empty initially
      ];

      // If headers need to be added
      if (shouldAddHeaders) {
        const headers = [
          'Invoice Number',
          'Guardian Name', 
          'Guardian Phone',
          'Relationship',
          'Student Name',
          'Class',
          'Total Fees Balance',
          'Due Date',
          'Timestamp',
          'Paid',
          'Payment Date',
          'Payment Reference'
        ];

        // First add the headers
        await this.appendToSheet('Claims', [headers]);
        
        if (existingRowIndex >= 0) {
          // If we found an existing row but we're adding headers, we need to update the data
          // The existing row will now be at index + 2 (header row + 1-based indexing)
          return await this.updateSheet('Claims', `A${existingRowIndex + 2}:L${existingRowIndex + 2}`, [rowData]);
        } else {
          // Add the new data row
          return await this.appendToSheet('Claims', [rowData]);
        }
      } else {
        // Headers exist
        if (existingRowIndex >= 0) {
          // Update existing invoice
          return await this.updateSheet('Claims', `A${existingRowIndex + 1}:L${existingRowIndex + 1}`, [rowData]);
        } else {
          // Add new invoice
          return await this.appendToSheet('Claims', [rowData]);
        }
      }
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

      // Update the payment columns (columns 10, 11, 12 are Paid, Payment Date, Payment Reference)
      const paidStatus = paymentData.paid ? 'TRUE' : 'FALSE'; // Use uppercase for Google Sheets compatibility
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

  /**
   * Get all invoices from Claims sheet
   */
  async getInvoices(): Promise<{ success: boolean; data: any[]; message: string }> {
    try {
      const result = await this.getSheetData('Claims');
      if (!result.success) {
        return { success: false, data: [], message: result.message };
      }

      const rows = result.data;
      if (rows.length === 0) {
        return { success: true, data: [], message: 'No invoices found' };
      }

      // Convert Claims sheet data to invoice objects
      // Claims sheet structure: Invoice Number, Guardian Name, Guardian Phone, Relationship, Student Name, Class, Total Fees Balance, Due Date, Timestamp, Paid, Payment Date, Payment Reference
      const invoices = rows.slice(1).map((row: string[]) => {
        // Helper function to safely parse dates from Google Sheets
        const safeParseDate = (dateStr: string): string => {
          if (!dateStr || dateStr.trim() === '') {
            return new Date().toISOString();
          }
          
          try {
            // Try to parse the date - Google Sheets might have various formats
            const date = new Date(dateStr);
            
            // Check if the date is valid
            if (isNaN(date.getTime())) {
              console.warn(`Invalid date format in sheet: "${dateStr}", using current time`);
              return new Date().toISOString();
            }
            
            return date.toISOString();
          } catch (error) {
            console.warn(`Error parsing date "${dateStr}": ${error}, using current time`);
            return new Date().toISOString();
          }
        };
        
        return {
          id: row[0] || '', // Invoice Number
          amount: parseFloat(row[6]) || 0, // Total Fees Balance
          status: row[9] && (row[9].toLowerCase() === 'true' || row[9] === 'TRUE') ? 'PAID' : 'PENDING', // Paid column - handle both string and boolean
          createdAt: safeParseDate(row[8]), // Timestamp - safely parse date
          updatedAt: safeParseDate(row[10]), // Payment Date - safely parse date
          description: `Fee payment for ${row[4]} (${row[5]})`, // Student Name and Class
          reference: row[11] || row[0] || '', // Payment Reference or Invoice Number
          // Additional fields from Claims sheet
          guardianName: row[1] || '',
          guardianPhone: row[2] || '',
          studentName: row[4] || '',
          studentClass: row[5] || '',
          dueDate: row[7] || ''
        };
      });

      return { success: true, data: invoices, message: 'Invoices retrieved successfully' };
    } catch (error) {
      console.error('Error getting invoices:', error);
      return { success: false, data: [], message: `Failed to get invoices: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }

  /**
   * Update an individual invoice in Invoices sheet
   */
  async updateInvoice(invoiceId: string, invoiceData: any): Promise<{ success: boolean; message: string }> {
    try {
      // Get current invoices data
      const result = await this.getSheetData('Claims');
      if (!result.success) {
        return { success: false, message: result.message };
      }

      const rows = result.data;
      if (rows.length === 0) {
        return { success: false, message: 'No invoices found' };
      }

      // Find the invoice row by ID
      let rowIndex = -1;
      for (let i = 1; i < rows.length; i++) { // Start from 1 to skip header
        if (rows[i][0] === invoiceId) { // Assuming ID is in first column
          rowIndex = i + 1; // +1 because Sheets is 1-indexed
          break;
        }
      }

      if (rowIndex === -1) {
        return { success: false, message: `Invoice ${invoiceId} not found` };
      }

      // Update the invoice row with new data based on Claims sheet structure
      // Claims sheet structure: Invoice Number, Guardian Name, Guardian Phone, Relationship, Student Name, Class, Total Fees Balance, Due Date, Timestamp, Paid, Payment Date, Payment Reference
      const currentRow = rows[rowIndex - 1]; // -1 because we need 0-indexed for the array
      const updatedRow = [
        invoiceData.id || currentRow[0] || '', // Invoice Number
        currentRow[1] || '', // Guardian Name - preserve existing
        currentRow[2] || '', // Guardian Phone - preserve existing  
        currentRow[3] || '', // Relationship - preserve existing
        currentRow[4] || '', // Student Name - preserve existing
        currentRow[5] || '', // Class - preserve existing
        invoiceData.amount?.toString() || currentRow[6] || '', // Total Fees Balance
        currentRow[7] || '', // Due Date - preserve existing
        currentRow[8] || '', // Timestamp - preserve existing
        invoiceData.status === 'PAID' ? 'TRUE' : 'FALSE', // Paid - convert from status
        invoiceData.updatedAt || currentRow[10] || '', // Payment Date
        invoiceData.reference || currentRow[11] || '', // Payment Reference
      ];

      return await this.updateSheet('Claims', `A${rowIndex}:L${rowIndex}`, [updatedRow]);
    } catch (error) {
      console.error('Error updating invoice:', error);
      return { success: false, message: `Failed to update invoice: ${error instanceof Error ? error.message : 'Unknown error'}` };
    }
  }
}


// Export a singleton instance
export const googleSheetsService = new GoogleSheetsService();