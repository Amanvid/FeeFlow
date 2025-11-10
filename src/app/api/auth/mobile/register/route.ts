import { NextRequest, NextResponse } from 'next/server';
import { registerMobileUser } from '@/lib/data';

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json();

    // Validate required fields
    const requiredFields = ['name', 'contact', 'username', 'password', 'childName', 'childClass'];
    const missingFields = requiredFields.filter(field => !userData[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    const result = await registerMobileUser({
      name: userData.name,
      dateOfBirth: userData.dateOfBirth || '',
      address: userData.address || '',
      residence: userData.residence || '',
      childName: userData.childName,
      childClass: userData.childClass,
      registrationDate: new Date().toISOString(),
      contact: userData.contact,
      email: userData.email || '',
      username: userData.username,
      password: userData.password,
      profilePicture: userData.profilePicture || '',
      childPicture: userData.childPicture || '',
      role: userData.role || 'parent',
      isActive: true
    });

    if (result.success && result.user) {
      // Return user data without password
      const { password: _, ...userWithoutPassword } = result.user;
      
      return NextResponse.json({
        success: true,
        user: userWithoutPassword,
        message: 'Registration successful'
      });
    } else {
      return NextResponse.json(
        { error: result.message || 'Registration failed' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Mobile registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}