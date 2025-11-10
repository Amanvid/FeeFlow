import { NextRequest, NextResponse } from 'next/server';
import { getAllClaims, getAllStudents } from '@/lib/data';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const status = searchParams.get('status');
    const limit = searchParams.get('limit');
    const sort = searchParams.get('sort');

    // Get claims data from Google Sheets
    const claims = await getAllClaims();
    const students = await getAllStudents();

    // Convert claims to invoice format expected by mobile app
    let invoices = claims.map((claim, index) => ({
      id: index.toString(),
      invoiceNumber: claim.invoiceNumber,
      studentId: claim.studentName || 'Unknown', // Use student name as ID since we don't have proper IDs
      studentName: claim.studentName,
      class: claim.class,
      studentType: 'Unknown', // Default since we don't have this field
      totalAmount: claim.totalFeesBalance || 0,
      paidAmount: claim.paid ? (claim.totalFeesBalance || 0) : 0,
      balance: claim.paid ? 0 : (claim.totalFeesBalance || 0),
      status: claim.paid ? 'paid' : 'pending',
      dueDate: claim.dueDate,
      createdAt: claim.timestamp,
      updatedAt: claim.timestamp,
      items: []
    }));

    // Filter by student ID if provided
    if (studentId) {
      invoices = invoices.filter(invoice => invoice.studentId === studentId);
    }

    // Filter by status if provided
    if (status) {
      invoices = invoices.filter(invoice => invoice.status.toLowerCase() === status.toLowerCase());
    }

    // Sort if requested
    if (sort) {
      const [field, order] = sort.split(':');
      invoices.sort((a, b) => {
        const aVal = a[field as keyof typeof a];
        const bVal = b[field as keyof typeof b];
        
        if (order === 'desc') {
          return bVal > aVal ? 1 : -1;
        }
        return aVal > bVal ? 1 : -1;
      });
    }

    // Limit results if requested
    if (limit) {
      const limitNum = parseInt(limit, 10);
      invoices = invoices.slice(0, limitNum);
    }

    return NextResponse.json({
      success: true,
      data: invoices,
      message: 'Invoices retrieved successfully',
      total: invoices.length
    });

  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch invoices',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}