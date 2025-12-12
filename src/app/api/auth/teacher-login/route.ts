import { NextResponse } from 'next/server';
import { encrypt } from '@/lib/session';
import { cookies } from 'next/headers';
import { getTeacherLoginUsers } from '@/lib/data';
import type { TeacherUserWithPassword } from '@/lib/definitions';
import type { TeacherUser } from '@/lib/definitions';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username and password are required' },
        { status: 400 }
      );
    }

    const teacherUsers = await getTeacherLoginUsers();
    const teacher = teacherUsers.find(
      (t: TeacherUserWithPassword) => t.username === username && t.password === password
    );

    if (teacher) {
      // Create session for teacher
      const session = await encrypt({
        username: teacher.username,
        name: teacher.name,
        class: teacher.class,
        role: teacher.role,
        userType: 'teacher'
      });

      // Set session cookie
      const cookieStore = await cookies();
      cookieStore.set('session', session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/'
      });

      return NextResponse.json({ 
        success: true,
        teacher: {
          name: teacher.name,
          class: teacher.class,
          role: teacher.role
        }
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid username or password' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Teacher login API error:', error);
    return NextResponse.json(
      { success: false, message: 'An internal server error occurred' },
      { status: 500 }
    );
  }
}