import { NextResponse } from 'next/server';
import { getAllClaims, getAllStudents } from '@/lib/data';

export async function GET() {
  try {
    const [claims, students] = await Promise.all([
      getAllClaims(),
      getAllStudents()
    ]);

    const monthlyData = new Map();
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    
    // Initialize current month if no data
    if (!monthlyData.has(currentMonth)) {
      monthlyData.set(currentMonth, {
        month: currentMonth,
        revenue: 0,
        invoices: 0,
        paid: 0,
        pending: 0
      });
    }

    // Process claims for monthly data
    claims?.forEach(claim => {
      if (claim.timestamp) {
        const month = claim.timestamp.slice(0, 7);
        if (!monthlyData.has(month)) {
          monthlyData.set(month, {
            month: month,
            revenue: 0,
            invoices: 0,
            paid: 0,
            pending: 0
          });
        }
        
        const monthData = monthlyData.get(month);
        monthData.invoices++;
        
        if ((claim as any).paid) {
          monthData.paid++;
          monthData.revenue += parseFloat(claim.totalFeesBalance?.toString() || '0');
        } else {
          monthData.pending++;
        }
      }
    });

    const monthlySummary = Array.from(monthlyData.values())
      .sort((a, b) => b.month.localeCompare(a.month))
      .slice(0, 12); // Last 12 months

    return NextResponse.json({
      overview: {
        totalStudents: students?.length || 0,
        totalInvoices: claims?.length || 0,
        totalRevenue: claims?.reduce((sum, claim) => 
          (claim as any).paid ? sum + parseFloat(claim.totalFeesBalance?.toString() || '0') : sum, 0
        ) || 0,
        outstandingAmount: claims?.reduce((sum, claim) => 
          !(claim as any).paid ? sum + parseFloat(claim.totalFeesBalance?.toString() || '0') : sum, 0
        ) || 0
      },
      monthlySummary,
      recentActivity: claims?.slice(-10).map(claim => ({
        id: claim.invoiceNumber,
        studentName: claim.studentName,
        amount: claim.totalFeesBalance,
        status: (claim as any).paid ? 'paid' : 'pending',
        createdAt: claim.timestamp
      })) || []
    });

  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard summary' },
      { status: 500 }
    );
  }
}