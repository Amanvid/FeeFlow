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
    
    // If the key is too short or doesn't have proper headers, try to reconstruct it
    if (!privateKey || privateKey.length < 100 || !privateKey.includes('-----END PRIVATE KEY-----')) {
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
    
    // Final validation
    if (!privateKey || !privateKey.includes('-----BEGIN PRIVATE KEY-----') || !privateKey.includes('-----END PRIVATE KEY-----')) {
      throw new Error('Invalid private key format. Please check your GOOGLE_PRIVATE_KEY environment variable.');
    }
    
    return privateKey;
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
    console.log("✅ Private key loaded successfully, length:", privateKey.length);
    
    try {
      this.auth = new google.auth.JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: privateKey,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      this.sheets = google.sheets({ version: 'v4', auth: this.auth });
      console.log("✅ Google Sheets service initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize Google Sheets service:", error);
      throw error;
    }
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
   * Create a new sheet if it doesn't exist
   */
  async createSheet(sheetName: string) {
    try {
      // First check if sheet already exists
      const existingSheets = await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId,
        fields: 'sheets.properties.title',
      });

      const sheetExists = existingSheets.data.sheets?.some((sheet: any) => 
        sheet.properties?.title === sheetName
      );

      if (sheetExists) {
        console.log(`Sheet '${sheetName}' already exists`);
        return { success: true, message: 'Sheet already exists' };
      }

      // Create the sheet
      const response = await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        requestBody: {
          requests: [{
            addSheet: {
              properties: {
                title: sheetName,
                gridProperties: {
                  rowCount: 1000,
                  columnCount: 26,
                },
              },
            },
          }],
        },
      });

      console.log(`Sheet '${sheetName}' created successfully`);
      return {
        success: true,
        data: response.data,
        message: `Sheet '${sheetName}' created successfully`,
      };
    } catch (error) {
      console.error('Error creating sheet:', error);
      return {
        success: false,
        message: `Failed to create sheet: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Get data from a specific sheet
   */
  async getSheetData(
    sheetName: string,
    range?: string,
    valueRenderOption?: 'FORMULA' | 'UNFORMATTED_VALUE' | 'FORMATTED_VALUE'
  ) {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: range ? `${sheetName}!${range}` : `${sheetName}!A1:Z1000`, // Default range
        valueRenderOption,
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

      // Update the row with new values
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
   * Clear all data from a sheet (keep headers)
   */
  async clearSheet(sheetName: string) {
    try {
      // Get current data to determine the range to clear
      const getResult = await this.getSheetData(sheetName);
      if (!getResult.success || getResult.data.length <= 1) {
        return {
          success: true,
          message: 'No data to clear',
        };
      }

      // Clear from row 2 onwards (keep headers)
      const clearRange = `${sheetName}!A2:Z1000`;
      await this.sheets.spreadsheets.values.clear({
        spreadsheetId: this.spreadsheetId,
        range: clearRange,
      });

      return {
        success: true,
        message: 'Sheet cleared successfully',
      };
    } catch (error) {
      console.error('Error clearing sheet:', error);
      return {
        success: false,
        message: `Failed to clear sheet: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Clear a specific row in a sheet
   */
  async clearRowInSheet(sheetName: string, rowIndex: number) {
    try {
      const clearRange = `${sheetName}!A${rowIndex}:Z${rowIndex}`;
      await this.sheets.spreadsheets.values.clear({
        spreadsheetId: this.spreadsheetId,
        range: clearRange,
      });

      return {
        success: true,
        message: 'Row cleared successfully',
      };
    } catch (error) {
      console.error('Error clearing row:', error);
      return {
        success: false,
        message: `Failed to clear row: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Delete a specific row from a sheet (physically removes the row)
   */
  async deleteRowFromSheet(sheetName: string, rowIndex: number) {
    try {
      // First, we need to get the sheet ID
      const spreadsheet = await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId,
      });

      const sheetsArr = (spreadsheet.data.sheets ?? []) as any[];
      const sheet = sheetsArr.find((s: any) => s.properties?.title === sheetName);
      if (!sheet || !sheet.properties?.sheetId) {
        return {
          success: false,
          message: `Sheet '${sheetName}' not found`,
        };
      }

      const sheetId = sheet.properties.sheetId;

      // Delete the row using batchUpdate with deleteDimension request
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        requestBody: {
          requests: [{
            deleteDimension: {
              range: {
                sheetId: sheetId,
                dimension: 'ROWS',
                startIndex: rowIndex - 1, // Convert to 0-indexed for API
                endIndex: rowIndex, // Delete only this row
              },
            },
          }],
        },
      });

      return {
        success: true,
        message: 'Row deleted successfully',
      };
    } catch (error) {
      console.error('Error deleting row:', error);
      return {
        success: false,
        message: `Failed to delete row: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Update a specific row in a sheet
   */
  async updateRowInSheet(sheetName: string, rowIndex: number, values: string[]) {
    try {
      const range = `A${rowIndex}:${String.fromCharCode(65 + values.length - 1)}${rowIndex}`;
      return await this.updateSheet(sheetName, range, [values]);
    } catch (error) {
      console.error('Error updating row:', error);
      return {
        success: false,
        message: `Failed to update row: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Save invoice data to Claims sheet
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
      // Get current claims data to check if invoice already exists
      const claimsResult = await this.getSheetData('Claims');
      let existingRowIndex = -1;
      let shouldAddHeaders = false;

      if (!claimsResult.success) {
        // Sheet doesn't exist or has an error, we'll create it with headers
        shouldAddHeaders = true;
      } else if (claimsResult.data.length === 0) {
        // Sheet is empty, add headers
        shouldAddHeaders = true;
      } else {
        // Check if invoice already exists
        const rows = claimsResult.data;
        const startIndex = shouldAddHeaders ? 0 : 1; // Start from 0 if adding headers, 1 if headers exist
        for (let i = startIndex; i < rows.length; i++) {
          const row = rows[i];
          if (row[0] === claim.invoiceNumber) {
            existingRowIndex = i;
            break;
          }
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
        // Safely parse dates
        const safeParseDate = (dateStr: string) => {
          if (!dateStr) return new Date().toISOString();
          try {
            const date = new Date(dateStr);
            return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
          } catch {
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
   * Insert a new row at a specific position in the sheet
   */
  async insertRowAt(sheetName: string, rowIndex: number, values: string[]): Promise<{ success: boolean; message: string }> {
    try {
      // First, we need to get the sheet ID
      const spreadsheet = await this.sheets.spreadsheets.get({
        spreadsheetId: this.spreadsheetId,
      });

      const sheetsArr = (spreadsheet.data.sheets ?? []) as any[];
      const sheet = sheetsArr.find((s: any) => s.properties?.title === sheetName);
      if (!sheet || !sheet.properties?.sheetId) {
        return {
          success: false,
          message: `Sheet '${sheetName}' not found`,
        };
      }

      const sheetId = sheet.properties.sheetId;

      // Insert the row using batchUpdate with insertDimension request
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        requestBody: {
          requests: [{
            insertDimension: {
              range: {
                sheetId: sheetId,
                dimension: 'ROWS',
                startIndex: rowIndex - 1, // Convert to 0-indexed for API
                endIndex: rowIndex,
              },
            },
          }],
        },
      });

      // Now update the newly inserted row with the values
      const range = `A${rowIndex}:${String.fromCharCode(65 + values.length - 1)}${rowIndex}`;
      return await this.updateSheet(sheetName, range, [values]);
    } catch (error) {
      console.error('Error inserting row at position:', error);
      return {
        success: false,
        message: `Failed to insert row at position ${rowIndex}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
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

  /**
   * Save notification settings to Google Sheets.
   * Prefer the 'Settings' sheet; fall back to 'Config' if needed.
   */
  async saveNotificationSettings(settings: {
    smsEnabled: boolean;
    feeRemindersEnabled: boolean;
    paymentNotificationsEnabled: boolean;
    admissionNotificationsEnabled: boolean;
  }): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      let targetSheet = 'Settings';
      let sheetResult = await this.getSheetData(targetSheet);

      if (!sheetResult.success) {
        // Fallback to legacy 'Config' sheet structure
        targetSheet = 'Config';
        sheetResult = await this.getSheetData(targetSheet);
      }

      // If sheet doesn't exist or is empty, create/init headers then append values
      if (!sheetResult.success || !sheetResult.data || sheetResult.data.length === 0) {
        await this.createSheet(targetSheet);

        if (targetSheet === 'Settings') {
          const headers = [
            'SMS Enabled',
            'Fee Reminders Enabled',
            'Payment Notifications Enabled',
            'Admission Notifications Enabled',
          ];
          await this.appendToSheet(targetSheet, [headers]);

          const valuesRow = [
            settings.smsEnabled ? 'true' : 'false',
            settings.feeRemindersEnabled ? 'true' : 'false',
            settings.paymentNotificationsEnabled ? 'true' : 'false',
            settings.admissionNotificationsEnabled ? 'true' : 'false',
          ];
          return await this.appendToSheet(targetSheet, [valuesRow]);
        } else {
          // For 'Config' sheet, add simple headers then values at row 2
          const headers = [
            'School Name',
            'Address',
            'Momo Number',
            'Due Date',
            'Invoice Prefix',
            'Sender ID',
            'SMS Enabled',
            'Fee Reminders Enabled',
            'Payment Notifications Enabled',
            'Admission Notifications Enabled',
          ];
          await this.appendToSheet(targetSheet, [headers]);

          const valuesRow = [
            '',
            '',
            '',
            '',
            '',
            '',
            settings.smsEnabled ? 'true' : 'false',
            settings.feeRemindersEnabled ? 'true' : 'false',
            settings.paymentNotificationsEnabled ? 'true' : 'false',
            settings.admissionNotificationsEnabled ? 'true' : 'false',
          ];
          return await this.appendToSheet(targetSheet, [valuesRow]);
        }
      }

      // Sheet exists with data; update row 2 if possible
      const rows = sheetResult.data;
      if (targetSheet === 'Config') {
        const configRow = rows[1] || [];
        const updatedRow = [
          configRow[0] || '',
          configRow[1] || '',
          configRow[2] || '',
          configRow[3] || '',
          configRow[4] || '',
          configRow[5] || '',
          settings.smsEnabled ? 'true' : 'false',
          settings.feeRemindersEnabled ? 'true' : 'false',
          settings.paymentNotificationsEnabled ? 'true' : 'false',
          settings.admissionNotificationsEnabled ? 'true' : 'false',
        ];
        return await this.updateSheet('Config', 'A2:J2', [updatedRow]);
      } else {
        // 'Settings' sheet: ensure headers exist and update/append second row
        if (rows.length === 1) {
          const headers = [
            'SMS Enabled',
            'Fee Reminders Enabled',
            'Payment Notifications Enabled',
            'Admission Notifications Enabled',
          ];
          await this.appendToSheet('Settings', [headers]);
        }

        const valuesRow = [
          settings.smsEnabled ? 'true' : 'false',
          settings.feeRemindersEnabled ? 'true' : 'false',
          settings.paymentNotificationsEnabled ? 'true' : 'false',
          settings.admissionNotificationsEnabled ? 'true' : 'false',
        ];

        if (rows.length >= 2) {
          return await this.updateSheet('Settings', 'A2:D2', [valuesRow]);
        }
        return await this.appendToSheet('Settings', [valuesRow]);
      }
    } catch (error) {
      console.error('Error saving notification settings:', error);
      return {
        success: false,
        message: `Failed to save notification settings: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }
}

// Export a singleton instance
export const googleSheetsService = new GoogleSheetsService();