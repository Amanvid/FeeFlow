import { NextRequest, NextResponse } from 'next/server';
import { getVerificationCode } from '@/lib/verification-codes';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, invoiceId } = body;

    if (!code || !invoiceId) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate code format (6 digits)
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { success: false, message: 'Invalid code format' },
        { status: 400 }
      );
    }

    // Get verification code from storage
    const storedCode = await getVerificationCode(invoiceId);

    if (!storedCode) {
      return NextResponse.json(
        { success: false, message: 'Verification code not found or expired' },
        { status: 404 }
      );
    }

    // Check if code has expired
    const now = new Date();
    if (storedCode.expiresAt < now) {
      return NextResponse.json(
        { success: false, message: 'Verification code has expired' },
        { status: 410 }
      );
    }

    // Verify the code
    if (storedCode.code !== code) {
      return NextResponse.json(
        { success: false, message: 'Invalid verification code' },
        { status: 401 }
      );
    }

    // Code is valid - in a real implementation, you would:
    // 1. Update the payment status in your database
    // 2. Send confirmation notifications
    // 3. Clean up the verification code
    
    console.log(`Payment verified successfully for invoice ${invoiceId}`);
    console.log(`Student: ${storedCode.studentName}, Amount: GHS ${storedCode.amount}`);

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      invoiceId,
      amount: storedCode.amount,
      studentName: storedCode.studentName,
    });

  } catch (error) {
    console.error('Error in verify-code:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}