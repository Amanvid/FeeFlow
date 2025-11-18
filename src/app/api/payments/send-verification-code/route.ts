import { NextRequest, NextResponse } from 'next/server';
import { getAdminUsers } from '@/lib/data';
import { storeVerificationCode } from '@/lib/verification-codes';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, invoiceId, amount, studentName, expiresAt } = body;

    if (!code || !invoiceId || !amount || !studentName || !expiresAt) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate code format (6 digits)
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: 'Invalid code format' },
        { status: 400 }
      );
    }

    // Store verification code with expiry
    const expiresAtDate = new Date(expiresAt);
    await storeVerificationCode(invoiceId, {
      code,
      invoiceId,
      amount: parseFloat(amount),
      studentName,
      expiresAt: expiresAtDate,
    });

    // Get admin users
    const adminUsers = await getAdminUsers();
    
    if (!adminUsers || adminUsers.length === 0) {
      console.error('No admin users found for notification');
      return NextResponse.json(
        { error: 'No admin users available' },
        { status: 500 }
      );
    }

    // Send notification to all admin users (in production, use proper notification service)
    const notificationPromises = adminUsers.map(async (admin: any) => {
      try {
        // Here you would integrate with your notification service
        // For now, we'll log the notification
        console.log(`Notification to admin ${admin.name} (${admin.email}):`);
        console.log(`Payment verification code: ${code}`);
        console.log(`Student: ${studentName}`);
        console.log(`Amount: GHS ${amount}`);
        console.log(`Invoice ID: ${invoiceId}`);
        
        // In a real implementation, you would send SMS, email, or push notification
        // Example: await sendSMS(admin.phone, `Payment verification code: ${code} for ${studentName} - GHS ${amount}`);
        // Example: await sendEmail(admin.email, 'Payment Verification Code', `Code: ${code} for ${studentName}`);
        
        return { success: true, admin: admin.email };
      } catch (error) {
        console.error(`Failed to notify admin ${admin.email}:`, error);
        return { success: false, admin: admin.email, error };
      }
    });

    const notificationResults = await Promise.allSettled(notificationPromises);
    const successfulNotifications = notificationResults.filter(
      result => result.status === 'fulfilled' && result.value.success
    );

    if (successfulNotifications.length === 0) {
      console.error('All admin notifications failed');
      return NextResponse.json(
        { error: 'Failed to notify administrators' },
        { status: 500 }
      );
    }

    console.log(`Successfully notified ${successfulNotifications.length} admin(s)`);

    

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to administrators',
      notifiedAdmins: successfulNotifications.length,
    });

  } catch (error) {
    console.error('Error in send-verification-code:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}