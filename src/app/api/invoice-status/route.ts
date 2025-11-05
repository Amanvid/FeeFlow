
import { NextResponse } from 'next/server';
import type { Invoice } from '@/types';
import fs from 'fs/promises';
import path from 'path';

const INVOICES_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'invoices.json');

async function readInvoicesFile(): Promise<Invoice[]> {
  try {
    await fs.access(INVOICES_FILE_PATH);
    const fileContent = await fs.readFile(INVOICES_FILE_PATH, 'utf-8');
    return fileContent ? JSON.parse(fileContent) : [];
  } catch (error) {
    return [];
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Invoice ID is required' }, { status: 400 });
  }

  try {
    const invoices = await readInvoicesFile();
    const invoice = invoices.find(inv => inv.id === id);

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // In a real app, you would check with the payment provider.
    // Here, we'll just return the stored status.
    return NextResponse.json({ status: invoice.status });

  } catch (error) {
    console.error('Failed to get invoice status:', error);
    return NextResponse.json({ error: 'Failed to get invoice status' }, { status: 500 });
  }
}
