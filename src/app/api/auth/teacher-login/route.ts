import { NextResponse } from 'next/server';
import { encrypt } from '@/lib/session';
import { cookies } from 'next/headers';
import { getTeacherLoginUsers, getAdminUsers } from '@/lib/data';
import type { TeacherUserWithPassword } from '@/lib/definitions';
import type { TeacherUser, AdminUserWithPassword } from '@/lib/definitions';

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
        userType: 'teacher',
        adminPrivileges: teacher.adminPrivileges || 'No'
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
          role: teacher.role,
          adminPrivileges: teacher.adminPrivileges || 'No'
        }
      });
    }
    
    // If not a teacher, allow SuperAdmin/Director to login via teacher portal
    const adminUsers = await getAdminUsers();
    const admin = adminUsers.find(
      (u: AdminUserWithPassword) => u.username === username && u.password === password
    );
    
    if (admin && (admin.role === 'SuperAdmin' || admin.role === 'Director')) {
      const session = await encrypt({
        username: admin.username,
        name: admin.username,
        class: '',
        role: admin.role,
        userType: 'admin',
        adminPrivileges: 'Yes'
      });
      
      const cookieStore = await cookies();
      cookieStore.set('session', session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24,
        path: '/'
      });
      
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json(
      { success: false, message: 'Invalid username or password' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Teacher login API error:', error);
    return NextResponse.json(
      { success: false, message: 'An internal server error occurred' },
      { status: 500 }
    );
  }
}
