import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';

export class GoogleSheetsService {
  private sheets: any;
  private spreadsheetId: string;
  private auth: any;

  private loadPrivateKey(): string {
    let privateKey = process.env.GOOGLE_PRIVATE_KEY;

    if (!privateKey) {
        // Try to read from local file if env var is missing (dev mode)
        try {
            const keyPath = path.join(process.cwd(), 'service-account-key.json');
            if (fs.existsSync(keyPath)) {
                const keyFile = JSON.parse(fs.readFileSync(keyPath, 'utf-8'));
                privateKey = keyFile.private_key;
            }
        } catch (e) {
            console.warn("Could not read service-account-key.json");
        }
    }
    
    if (privateKey) {
      privateKey = privateKey.replace(/\\n/g, '\n');
    }
    
    if (!privateKey) {
      throw new Error('Missing GOOGLE_PRIVATE_KEY');
    }
    
    return privateKey;
  }

  constructor() {
    this.spreadsheetId = process.env.GOOGLE_SHEET_ID || '';

    if (!this.spreadsheetId) {
        console.warn("⚠️ GOOGLE_SHEET_ID is not set.");
    }

    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    if (!email) {
       console.warn("⚠️ GOOGLE_SERVICE_ACCOUNT_EMAIL is not set.");
       // We might not throw here to allow build to pass, but methods will fail
    }

    try {
      const privateKey = this.loadPrivateKey();
      
      this.auth = new google.auth.JWT({
        email: email,
        key: privateKey,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      this.sheets = google.sheets({ version: 'v4', auth: this.auth });
    } catch (error) {
      console.warn("⚠️ Google Sheets Service initialized without auth (or failed):", error);
    }
  }

  async getSheetData(range: string) {
    if (!this.sheets) throw new Error("Google Sheets not initialized");
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range,
    });
    return response.data.values || [];
  }

  async appendToSheet(range: string, values: any[][]) {
    if (!this.sheets) throw new Error("Google Sheets not initialized");
    const response = await this.sheets.spreadsheets.values.append({
      spreadsheetId: this.spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    });
    return response.data;
  }

  async updateSheet(range: string, values: any[][]) {
    if (!this.sheets) throw new Error("Google Sheets not initialized");
    const response = await this.sheets.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values,
      },
    });
    return response.data;
  }

  async addSheet(title: string) {
    if (!this.sheets) throw new Error("Google Sheets not initialized");
    try {
      const response = await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title,
                },
              },
            },
          ],
        },
      });
      return response.data;
    } catch (error: any) {
        if (error.message && error.message.includes('already exists')) {
            console.log(`Sheet '${title}' already exists.`);
            return null;
        }
        throw error;
    }
  }
}

export const googleSheetsService = new GoogleSheetsService();
