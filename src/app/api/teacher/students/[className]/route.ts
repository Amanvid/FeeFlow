import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/session';
import { getAllStudents, getSchoolConfig } from '@/lib/data';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ className: string }> }
) {
  try {
    const session = await verifySession();
    
    if (!session || session.userType !== 'teacher') {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { className } = await params;
    
    if (!className) {
      return NextResponse.json(
        { success: false, message: 'Class name is required' },
        { status: 400 }
      );
    }

    // Decode the class name (replace %20 with spaces, etc.)
    const decodedClassName = decodeURIComponent(className);

    // Get school config for due date
    const schoolConfig = await getSchoolConfig();
    
    // Get all students and filter by class
    const students = await getAllStudents();
    const classStudents = students.filter(student => 
      student.class === decodedClassName
    );

    // Transform student data for teacher view - detailed fee breakdown like admin page
    const transformedStudents = classStudents.map(student => ({
      id: student.id,
      name: student.studentName, // Use studentName from getAllStudents
      class: student.class,
      parentName: student.guardianName, // Use guardianName from getAllStudents
      parentPhone: student.guardianPhone, // Use guardianPhone from getAllStudents
      parentEmail: '', // Not available in getAllStudents
      location: student.guardianLocation || 'Not specified', // Use guardianLocation from getAllStudents
      payments: [], // Not available in getAllStudents - would need separate sheet
      feeBreakdown: {
        lastTermArrears: student.arrears, // From ARREAS column
        currentTermFees: student.fees,     // From School Fees AMOUNT column
        books: student.books                // From BOOKS Fees column
      },
      paymentBreakdown: {
        feesPaid: student.schoolFeesPaid,    // INTIAL AMOUNT PAID + PAYMENT
        booksPaid: student.booksFeePaid    // BOOKS Fees Payment
      },
      totalFees: student.fees + student.books + student.arrears, // Calculate total fees like admin page
      amountPaid: student.schoolFeesPaid + student.booksFeePaid, // Total amount paid
      balance: student.balance, // Use balance from getAllStudents (Total Balance from sheet)
      dueDate: schoolConfig.dueDate, // Use due date from config sheet
      status: student.balance <= 0 ? 'Paid' : 'Balance Due' // Calculate status based on balance
    }));

    return NextResponse.json({ 
      success: true,
      students: transformedStudents,
      className: decodedClassName,
      totalStudents: transformedStudents.length
    });
  } catch (error) {
    console.error('Teacher students API error:', error);
    return NextResponse.json(
      { success: false, message: 'An internal server error occurred' },
      { status: 500 }
    );
  }
}