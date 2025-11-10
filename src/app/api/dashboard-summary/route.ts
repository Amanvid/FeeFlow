import { NextRequest, NextResponse } from 'next/server';
import { getAllClaims, getAllStudents, getTotalStudentsCount } from '@/lib/data';

export async function GET(request: NextRequest) {
  try {
    const claims = await getAllClaims();
    const students = await getAllStudents();
    const totalStudents = await getTotalStudentsCount();

    // Calculate key metrics
    const totalOutstanding = students.reduce((acc, student) => acc + student.balance, 0);
    const totalPaid = students.reduce((acc, student) => acc + student.amountPaid, 0);
    const paidStudents = students.filter(s => s.balance <= 0).length;
    
    // Calculate payment rate
    const paymentRate = totalStudents > 0 ? Math.round((paidStudents / totalStudents) * 100) : 0;

    // Return summary in a simplified format
    const dashboardSummary = {
      totalRevenue: totalPaid,
      outstanding: totalOutstanding,
      paymentRate: paymentRate,
      totalStudents: totalStudents,
      totalInvoices: claims.length,
      paidStudents: paidStudents,
      owingStudents: students.filter(s => s.balance > 0).length
    };

    return NextResponse.json({
      success: true,
      data: dashboardSummary,
      message: 'Dashboard summary retrieved successfully'
    });

  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch dashboard summary',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}