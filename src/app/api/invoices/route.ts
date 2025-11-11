import { NextRequest, NextResponse } from 'next/server';
import { getAllClaims } from '@/lib/data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const sort = searchParams.get('sort');
    const status = searchParams.get('status');
    
    // Get claims from data
    const claims = await getAllClaims();
    
    if (!claims || claims.length === 0) {
      return NextResponse.json([]);
    }
    
    // Transform claims to invoices
    let invoices = claims.map((claim, index) => ({
      id: claim.invoiceNumber || `temp-${index}`,
      invoiceNumber: claim.invoiceNumber || `INV-${String(index).padStart(6, '0')}`,
      studentId: claim.invoiceNumber,
      studentName: claim.studentName,
      class: claim.class,
      amount: claim.totalFeesBalance,
      status: (claim as any).paid ? 'paid' : 'pending',
      dueDate: claim.dueDate,
      createdAt: claim.timestamp || new Date().toISOString(),
      items: [{
        description: 'School Fees',
        quantity: 1,
        unitPrice: claim.totalFeesBalance,
        total: claim.totalFeesBalance
      }]
    }));
    
    // Apply filters
    if (status) {
      invoices = invoices.filter(invoice => invoice.status === status);
    }
    
    // Apply sorting
    if (sort === 'createdAt:desc') {
      invoices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sort === 'createdAt:asc') {
      invoices.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sort === 'amount:desc') {
      invoices.sort((a, b) => b.amount - a.amount);
    } else if (sort === 'amount:asc') {
      invoices.sort((a, b) => a.amount - b.amount);
    }
    
    // Apply limit
    if (limit) {
      const limitNum = parseInt(limit);
      invoices = invoices.slice(0, limitNum);
    }
    
    return NextResponse.json(invoices);
    
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, amount, description, dueDate } = body;
    
    if (!studentId || !amount) {
      return NextResponse.json(
        { error: 'Student ID and amount are required' },
        { status: 400 }
      );
    }
    
    // Here you would typically save to Google Sheets
    // For now, return a mock response
    const newInvoice = {
      id: `temp-${Date.now()}`,
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      studentId,
      studentName: body.studentName || 'Unknown Student',
      class: body.class || 'Unknown Class',
      amount,
      status: 'pending',
      dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      items: body.items || [{
        description: description || 'School Fees',
        quantity: 1,
        unitPrice: amount,
        total: amount
      }]
    };
    
    return NextResponse.json(newInvoice, { status: 201 });
    
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}