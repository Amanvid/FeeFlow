
import { NextResponse } from 'next/server';
import { verifyOtp } from '@/lib/actions';
import { getAdminUsers, getTeacherUsers } from '@/lib/data';
import { encrypt } from '@/lib/session';
import { cookies } from 'next/headers';
import { TeacherUser, AdminUser } from '@/lib/definitions';

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
    
    // 2. Find user to return their details (check both admin and teacher users)
    const adminUsers = await getAdminUsers();
    const teacherUsers = await getTeacherUsers();
    
    console.log('Teacher users found:', teacherUsers.length);
    console.log('Admin users found:', adminUsers.length);
    console.log('Looking for username:', username);
    
    // Check if user is a teacher first
    let user: TeacherUser | AdminUser | undefined = teacherUsers.find(t => t.username === username);
    let userType = 'teacher';
    
    console.log('Found in teachers:', !!user);
    
    // If not found in teachers, check admin
    if (!user) {
        user = adminUsers.find(u => u.username === username);
        userType = 'admin';
        console.log('Found in admin:', !!user);
    }

    if (!user) {
         return NextResponse.json(
            { success: false, message: "User not found after OTP verification." },
            { status: 404 }
        );
    }

    // 3. Create session for the user
    const session = await encrypt({
        username: user.username,
        role: user.role,
        userType: userType,
        ...(userType === 'teacher' && { 
            name: (user as TeacherUser).name,
            class: (user as TeacherUser).class 
        })
    });

    // 4. Set session cookie
    const cookieStore = await cookies();
    cookieStore.set('session', session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
        domain: process.env.NODE_ENV === 'production' ? undefined : undefined
    });

    // 5. Return a success response with user info (excluding password).
    return NextResponse.json({ 
        success: true, 
        message: 'Login successful',
        user: {
            username: user.username,
            role: user.role,
            userType: userType
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
