import { NextRequest, NextResponse } from 'next/server';
import { getAllClaims, getAllStudents, getTotalStudentsCount } from '@/lib/data';

export async function GET(request: NextRequest) {
  try {
    const claims = await getAllClaims();
    const students = await getAllStudents();
    const totalStudents = await getTotalStudentsCount();

    // Calculate statistics based on the data
    const totalInvoices = claims.length;
    const totalOutstanding = students.reduce((acc, student) => acc + student.balance, 0);
    const totalPaid = students.reduce((acc, student) => acc + student.amountPaid, 0);
    
    // Count students by payment status
    const paidInvoices = students.filter(s => s.balance <= 0).length;
    const pendingInvoices = students.filter(s => s.balance > 0 && s.amountPaid > 0).length;
    const overdueInvoices = students.filter(s => s.balance > 0).length;

    // Return stats in the format expected by the mobile app
    const dashboardStats = {
      totalStudents,
      totalInvoices,
      paidInvoices,
      pendingInvoices,
      overdueInvoices,
      totalRevenue: totalPaid,
      outstandingBalance: totalOutstanding,
      paymentRate: totalStudents > 0 ? Math.round((paidInvoices / totalStudents) * 100) : 0,
      recentInvoices: claims.slice(0, 10), // Last 10 invoices
      overdueInvoices: students.filter(s => s.balance > 0).slice(0, 10) // Last 10 overdue
    };

    return NextResponse.json({
      success: true,
      data: dashboardStats,
      message: 'Dashboard statistics retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch dashboard statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}