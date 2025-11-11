import { NextResponse } from 'next/server';
import { getAllClaims, getAllStudents } from '@/lib/data';

export async function GET() {
  try {
    const [claims, students] = await Promise.all([
      getAllClaims(),
      getAllStudents()
    ]);

    const totalStudents = students?.length || 0;
    const totalInvoices = claims?.length || 0;
    const pendingInvoices = claims?.filter(claim => 
      !claim.status || claim.status === 'pending'
    ).length || 0;
    const paidInvoices = claims?.filter(claim => 
      claim.status === 'paid'
    ).length || 0;
    
    const totalRevenue = claims?.reduce((sum, claim) => {
      const amount = parseFloat(claim.amount?.toString() || '0');
      return claim.status === 'paid' ? sum + amount : sum;
    }, 0) || 0;
    
    const totalOutstanding = claims?.reduce((sum, claim) => {
      const amount = parseFloat(claim.amount?.toString() || '0');
      return claim.status !== 'paid' ? sum + amount : sum;
    }, 0) || 0;

    return NextResponse.json({
      totalStudents,
      totalInvoices,
      pendingInvoices,
      paidInvoices,
      totalRevenue,
      totalOutstanding,
      recentInvoices: claims?.slice(-5).map(claim => ({
        id: claim.id,
        studentName: claim.studentName,
        amount: claim.amount,
        status: claim.status || 'pending',
        createdAt: claim.createdAt
      })) || []
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}