import { GoogleSheetsService } from './google-sheets';

export interface Claim {
  id: string;
  studentName: string;
  class: string;
  guardianName: string;
  guardianPhone: string;
  feeType: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  invoiceNumber: string;
  createdAt: string;
  updatedAt: string;
  paymentMethod?: string;
  paymentDate?: string;
  transactionId?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  studentName: string;
  class: string;
  guardianName: string;
  guardianPhone: string;
  feeType: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  createdAt: string;
  updatedAt: string;
  paymentMethod?: string;
  paymentDate?: string;
  transactionId?: string;
}

export class GoogleSheetsCRUD {
  private sheetsService: GoogleSheetsService;
  private claimsSheet = 'Claims';
  private invoicesSheet = 'Invoices';

  constructor() {
    this.sheetsService = new GoogleSheetsService();
  }

  // Claims CRUD Operations
  async createClaim(claim: Omit<Claim, 'id' | 'createdAt' | 'updatedAt'>): Promise<Claim> {
    const newClaim: Claim = {
      ...claim,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.sheetsService.appendToSheet(this.claimsSheet, [this.claimToRow(newClaim)]);
    return newClaim;
  }

  async getAllClaims(): Promise<Claim[]> {
    const result = await this.sheetsService.getSheetData(this.claimsSheet);
    const rows: any[] = result.success ? (result.data as any[]) : [];
    return rows.slice(1).map((row: any[]) => this.rowToClaim(row as string[])); // Skip header row
  }

  async getClaimById(id: string): Promise<Claim | null> {
    const claims = await this.getAllClaims();
    return claims.find(claim => claim.id === id) || null;
  }

  async getClaimsByGuardianPhone(phone: string): Promise<Claim[]> {
    const claims = await this.getAllClaims();
    return claims.filter(claim => claim.guardianPhone === phone);
  }

  async getClaimsByStatus(status: string): Promise<Claim[]> {
    const claims = await this.getAllClaims();
    return claims.filter(claim => claim.status === status);
  }

  async updateClaim(id: string, updates: Partial<Claim>): Promise<Claim | null> {
    const claims = await this.getAllClaims();
    const claimIndex = claims.findIndex(claim => claim.id === id);
    
    if (claimIndex === -1) return null;

    const updatedClaim = {
      ...claims[claimIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const success = await this.sheetsService.updateRowInSheet(
      this.claimsSheet,
      claimIndex + 2, // +2 to account for header row and 0-based index
      this.claimToRow(updatedClaim)
    );

    return success ? updatedClaim : null;
  }

  async deleteClaim(id: string): Promise<boolean> {
    const claims = await this.getAllClaims();
    const claimIndex = claims.findIndex(claim => claim.id === id);
    
    if (claimIndex === -1) return false;

    // Clear the row instead of removing it to maintain sheet structure
    const result = await this.sheetsService.clearRowInSheet(this.claimsSheet, claimIndex + 2);
    return result.success;
  }

  // Invoice CRUD Operations
  async createInvoice(invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice> {
    const newInvoice: Invoice = {
      ...invoice,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.sheetsService.appendToSheet(this.invoicesSheet, [this.invoiceToRow(newInvoice)]);
    return newInvoice;
  }

  async getAllInvoices(): Promise<Invoice[]> {
    const result = await this.sheetsService.getSheetData(this.invoicesSheet);
    const rows: any[] = result.success ? (result.data as any[]) : [];
    return rows.slice(1).map((row: any[]) => this.rowToInvoice(row as string[])); // Skip header row
  }

  async getInvoiceById(id: string): Promise<Invoice | null> {
    const invoices = await this.getAllInvoices();
    return invoices.find(invoice => invoice.id === id) || null;
  }

  async getInvoiceByNumber(invoiceNumber: string): Promise<Invoice | null> {
    const invoices = await this.getAllInvoices();
    return invoices.find(invoice => invoice.invoiceNumber === invoiceNumber) || null;
  }

  async getInvoicesByGuardianPhone(phone: string): Promise<Invoice[]> {
    const invoices = await this.getAllInvoices();
    return invoices.filter(invoice => invoice.guardianPhone === phone);
  }

  async getInvoicesByStatus(status: string): Promise<Invoice[]> {
    const invoices = await this.getAllInvoices();
    return invoices.filter(invoice => invoice.status === status);
  }

  async updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice | null> {
    const invoices = await this.getAllInvoices();
    const invoiceIndex = invoices.findIndex(invoice => invoice.id === id);
    
    if (invoiceIndex === -1) return null;

    const updatedInvoice = {
      ...invoices[invoiceIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const success = await this.sheetsService.updateRowInSheet(
      this.invoicesSheet,
      invoiceIndex + 2, // +2 to account for header row and 0-based index
      this.invoiceToRow(updatedInvoice)
    );

    return success ? updatedInvoice : null;
  }

  async updateInvoiceStatus(invoiceNumber: string, status: string, paymentDetails?: {
    paymentMethod: string;
    transactionId: string;
    paymentDate: string;
  }): Promise<Invoice | null> {
    const invoice = await this.getInvoiceByNumber(invoiceNumber);
    if (!invoice) return null;

    const updates: Partial<Invoice> = {
      status: status as 'pending' | 'paid' | 'overdue',
      updatedAt: new Date().toISOString(),
    };

    if (paymentDetails) {
      updates.paymentMethod = paymentDetails.paymentMethod;
      updates.transactionId = paymentDetails.transactionId;
      updates.paymentDate = paymentDetails.paymentDate;
    }

    return await this.updateInvoice(invoice.id, updates);
  }

  async deleteInvoice(id: string): Promise<boolean> {
    const invoices = await this.getAllInvoices();
    const invoiceIndex = invoices.findIndex(invoice => invoice.id === id);
    
    if (invoiceIndex === -1) return false;

    // Clear the row instead of removing it to maintain sheet structure
    const result = await this.sheetsService.clearRowInSheet(this.invoicesSheet, invoiceIndex + 2);
    return result.success;
  }

  // Helper methods
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private claimToRow(claim: Claim): string[] {
    return [
      claim.id,
      claim.studentName,
      claim.class,
      claim.guardianName,
      claim.guardianPhone,
      claim.feeType,
      claim.amount.toString(),
      claim.dueDate,
      claim.status,
      claim.invoiceNumber,
      claim.createdAt,
      claim.updatedAt,
      claim.paymentMethod || '',
      claim.paymentDate || '',
      claim.transactionId || '',
    ];
  }

  private rowToClaim(row: string[]): Claim {
    return {
      id: row[0] || '',
      studentName: row[1] || '',
      class: row[2] || '',
      guardianName: row[3] || '',
      guardianPhone: row[4] || '',
      feeType: row[5] || '',
      amount: parseFloat(row[6] || '0'),
      dueDate: row[7] || '',
      status: (row[8] || 'pending') as 'pending' | 'paid' | 'overdue',
      invoiceNumber: row[9] || '',
      createdAt: row[10] || new Date().toISOString(),
      updatedAt: row[11] || new Date().toISOString(),
      paymentMethod: row[12] || undefined,
      paymentDate: row[13] || undefined,
      transactionId: row[14] || undefined,
    };
  }

  private invoiceToRow(invoice: Invoice): string[] {
    return [
      invoice.id,
      invoice.invoiceNumber,
      invoice.studentName,
      invoice.class,
      invoice.guardianName,
      invoice.guardianPhone,
      invoice.feeType,
      invoice.amount.toString(),
      invoice.dueDate,
      invoice.status,
      invoice.createdAt,
      invoice.updatedAt,
      invoice.paymentMethod || '',
      invoice.paymentDate || '',
      invoice.transactionId || '',
    ];
  }

  private rowToInvoice(row: string[]): Invoice {
    return {
      id: row[0] || '',
      invoiceNumber: row[1] || '',
      studentName: row[2] || '',
      class: row[3] || '',
      guardianName: row[4] || '',
      guardianPhone: row[5] || '',
      feeType: row[6] || '',
      amount: parseFloat(row[7] || '0'),
      dueDate: row[8] || '',
      status: (row[9] || 'pending') as 'pending' | 'paid' | 'overdue',
      createdAt: row[10] || new Date().toISOString(),
      updatedAt: row[11] || new Date().toISOString(),
      paymentMethod: row[12] || undefined,
      paymentDate: row[13] || undefined,
      transactionId: row[14] || undefined,
    };
  }
}

// Export singleton instance
export const googleSheetsCRUD = new GoogleSheetsCRUD();