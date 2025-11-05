
import { NextResponse } from 'next/server';
import { getAdminUsers } from '@/lib/data';

// This route only verifies credentials, it does not create a session.
// Session is created by the verify-otp route.
export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username and password are required' },
        { status: 400 }
      );
    }

    const adminUsers = await getAdminUsers();
    const user = adminUsers.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      // Credentials are correct. Signal success to the frontend to proceed to OTP step.
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid username or password' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { success: false, message: 'An internal server error occurred' },
      { status: 500 }
    );
  }
}
