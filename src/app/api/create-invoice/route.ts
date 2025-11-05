
import { NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';
import type { Invoice } from '@/types';
import fs from 'fs/promises';
import path from 'path';

const INVOICES_FILE_PATH = path.join(process.cwd(), 'src', 'data', 'invoices.json');

async function readInvoicesFile(): Promise<Invoice[]> {
  try {
    await fs.access(INVOICES_FILE_PATH);
  } catch (error) {
    await fs.writeFile(INVOICES_FILE_PATH, JSON.stringify([], null, 2));
    return [];
  }

  const fileContent = await fs.readFile(INVOICES_FILE_PATH, 'utf-8');
  return fileContent ? JSON.parse(fileContent) : [];
}

export async function POST(req: Request) {
  try {
    const { amount, description, reference } = await req.json();

    if (!amount || !description || !reference) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newInvoice: Invoice = {
      id: uuid(),
      amount: parseFloat(amount),
      description,
      reference,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const invoices = await readInvoicesFile();
    invoices.push(newInvoice);
    await fs.writeFile(INVOICES_FILE_PATH, JSON.stringify(invoices, null, 2));

    return NextResponse.json(newInvoice);
  } catch (error) {
    console.error('Failed to create invoice:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to create invoice', details: errorMessage }, { status: 500 });
  }
}
