
import { NextResponse } from 'next/server';
import { verifyOtp } from '@/lib/actions';
import { getAdminUsers } from '@/lib/data';

export async function POST(req: Request) {
  try {
    const { phone, otp, username } = await req.json();

    if (!phone || !otp || !username) {
        return NextResponse.json(
            { success: false, message: "Phone, OTP, and username are required." },
            { status: 400 }
        );
    }

    // 1. Verify OTP
    const otpResult = await verifyOtp(phone, otp);
    if (!otpResult.success) {
        return NextResponse.json(
            { success: false, message: otpResult.message || "Invalid OTP." },
            { status: 401 }
        );
    }
    
    // 2. Find user to return their details
    const adminUsers = await getAdminUsers();
    const user = adminUsers.find(u => u.username === username);

    if (!user) {
         return NextResponse.json(
            { success: false, message: "User not found after OTP verification." },
            { status: 404 }
        );
    }

    // 3. Return a success response with user info (excluding password).
    return NextResponse.json({ 
        success: true, 
        message: 'Login successful',
        user: {
            username: user.username,
            role: user.role,
        }
    });

  } catch (error) {
    console.error('Verify OTP API error:', error);
    return NextResponse.json(
      { success: false, message: 'An internal server error occurred' },
      { status: 500 }
    );
  }
}
